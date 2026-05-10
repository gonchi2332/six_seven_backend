import { env } from "../config/env.config";
import { groq } from "../config/ai.config";
import { getSkillTypeData } from "../helpers/skill.helper";
import { techs } from "../utils/constants/array.constants";
import * as SkillTypes from "../types/skill.types";
import * as LaboralExpTypes from "../types/laboralexperience.types";
import * as EducacionTypes from "../types/education.types";
import * as Selects from "../helpers/selects.helper";

export async function skillValidation(skillName: string, skillType: "hard" | "soft") {
  try {
    const skillTypeData = await getSkillTypeData(skillType);

    const skillsNames = await Selects.getAllSkills(skillTypeData.enum);
    const skillsCanonNames = await Selects.getAllSkillsCanonName(skillTypeData.enum);

    const namesList = skillsNames.map((s) => s.name).join(", ");
    const canonList = skillsCanonNames.map((s) => s.canon_name).join(", ");

    const hasExisting = skillsNames.length > 0;

    const existingSkillsSection = hasExisting ? `
      HABILIDADES YA REGISTRADAS EN EL SISTEMA:
      - Nombres para mostrar (name): ${namesList}
      - Nombres canónicos (canon_name): ${canonList}

      REGLA DE COINCIDENCIA CON HABILIDADES EXISTENTES:
      Antes de validar, verifica si "${skillName}" corresponde a alguna habilidad ya registrada.
      Esto incluye: abreviaciones (js → javascript), aliases (postgres → postgresql), 
      variantes de capitalización (nodeJS → node.js), nombres alternativos (react.js → react).
      Si hay coincidencia:
      - Retorna valid: true
      - Retorna el canon_name exacto de la lista en el campo "canonName"
      - Retorna el name exacto de la lista en el campo "name"
      Si NO hay coincidencia, retorna "canonName": null y "name": null.
    ` : `
      Aún no hay habilidades registradas en el sistema. Retorna "canonName": null y "name": null.
    `;
      
    const prompt = `Tipo de skill: ${skillType === "hard" ? "HARD SKILL" : "SOFT SKILL"}
      Nombre a validar: "${skillName}"`;

    const systemPrompt = `Eres un validador estricto de nombres de habilidades para un portafolio de proyectos de software.
      Tu única tarea es analizar el nombre de una habilidad y responder ÚNICAMENTE con un objeto JSON válido.
      Sin texto adicional, sin backticks, sin explicaciones fuera del JSON.

      El JSON debe tener exactamente esta estructura:
      {"valid": true/false, "reason": "...", "canonName": "valor_o_null", "name": "valor_o_null"}

      ${existingSkillsSection}

      Reglas para determinar valid:

      HABILIDAD TÉCNICA (hard skill):
      - true: es el nombre de un lenguaje de programación, framework, librería, base de datos, herramienta, protocolo o metodología real del campo de la informática o desarrollo de software y en general conocimiento tecnico, teorico, matematico o exacto. Ejemplos válidos: HTML, CSS, JavaScript, TypeScript, Python, Java, Ruby, SQL, PostgreSQL, MongoDB, React, Node.js, Calculo, Docker, Git, REST, GraphQL, Scrum, Matematicas, Geometria, etc.
      - false: cualquier cosa que no sea una tecnología o concepto reconocible del campo de la informática.

      HABILIDAD BLANDA (soft skill):
      - true: es una habilidad interpersonal, idioma o habilidad cognitiva reconocida en entornos laborales y todo lo relacionado a como se desenvuelve una persona en entornos laborales e interpersonales, NO SE CONTEMPLA NINGUN TIPO DE CONOCIMIENTO NI TECNICO, TEORICO, MATEMATICO NI EXACTO. Ejemplos válidos: Inglés, Liderazgo, Trabajo en equipo, Chino, Pensamiento crítico, Comunicación, Analisis de problemas, Oratoria, Negociacion, Exposiciones, Redaccion, etc.
      - false: cualquier cosa que no sea una habilidad blanda reconocida.

      REGLA DE MALAS PALABRAS (aplica siempre, para cualquier tipo):
      - Si el nombre contiene groserías, insultos, palabras vulgares u ofensas, ya sea de forma explícita o encubierta mediante símbolos, números o variaciones ortográficas (ej: "p*thon ofensivo", "h4ck3r d3 m3rd4"), es false por esta razón sin importar nada más.

      REGLA ESPECIAL - RAMAS Y ÁREAS RELACIONADAS A LAS MATEMÁTICAS:
      Las ramas, áreas y subdisciplinas matemáticas (Cálculo, Álgebra, Geometría, Combinatoria, 
      Teoría de Números, Estadística, Probabilidad, Lógica Matemática, etc.) son habilidades 
      técnicas válidas e INDEPENDIENTES entre sí. NO deben asociarse con "Matematicas" ni entre 
      ellas aunque estén relacionadas. Cada una tiene su propia identidad.
      - Ejemplo: "Combinatoria" es válida → canonName: null, name: null (NO asociar con "Matematicas")
      - Ejemplo: "Teoría de Números" es válida → canonName: null, name: null (NO asociar con "Matematicas")
      - La coincidencia con habilidades existentes solo aplica si el nombre ingresado es 
        exactamente la misma habilidad o un alias/abreviación directa de ella.
            
      PARA HABILIDADES TECNICAS: Si sirve de ayuda puedes basarte en el siguiente listado de tecnologias para determinar si la habilidad introducida (EN CASO DE HABILIDADES TECNICAS) coincide o se parece a alguna habilidad de este listado: ${techs}

      Reglas para el texto de reason, usa EXACTAMENTE estos mensajes según el caso:

      CASO 1 - Habilidad técnica válida:
      {"valid": true, "reason": "Habilidad técnica está dentro del campo de la informática, ciencias de la computación y desarrollo de software.", "canonName": null, "name": null}

      CASO 2 - Habilidad blanda válida:
      {"valid": true, "reason": "Habilidad blanda está dentro del campo de la informática, ciencias de la computación y desarrollo de software.", "canonName": null, "name": null}

      CASO 3 - Habilidad técnica inválida por no ser reconocible:
      {"valid": false, "reason": "La habilidad introducida no corresponde a ninguna habilidad técnica reconocible dentro del campo de la informática, ciencias de la computación y desarrollo de software.", "canonName": null, "name": null}

      CASO 4 - Habilidad blanda inválida por no ser reconocible:
      {"valid": false, "reason": "La habilidad introducida no corresponde a ninguna habilidad blanda reconocible dentro del campo de la informática, ciencias de la computación y desarrollo de software.", "canonName": null, "name": null}

      CASO 5 - Cualquier tipo con malas palabras:
      {"valid": false, "reason": "Contiene lenguaje ofensivo o inapropiado.", "canonName": null, "name": null}

      CASO 6 - Coincidencia con habilidad existente:
      {"valid": true, "reason": "Habilidad técnica está dentro del campo de la informática, ciencias de la computación y desarrollo de software.", "canonName": "canon_name_exacto_de_la_bd", "name": "name_exacto_de_la_bd"}

      Responde SOLO con el JSON. Nada más.`;
    
    const response = await groq.chat.completions.create({
      model: env.AI_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      temperature: 0
    });

    const raw = response.choices[0].message.content?.trim() ?? "";
    const cleaned = raw.replace(/^```json\s*/i, "").replace(/```$/,"").trim();
    
    const parsedResponse = JSON.parse(cleaned) as SkillTypes.SkillModerationResponse;
    return parsedResponse;
  } catch (err) {
    return {
      valid: false,
      reason: `Error: ${(err as Error).message ?? String(err)}`
    };
  }
}

export async function positionValidation(position: string) {
  try {
    const prompt = `Puesto de trabajo a validar: "${position}"`;

    const systemPrompt = `Eres un validador estricto de puestos de trabajo para un portafolio de proyectos de software.
      Tu única tarea es analizar el nombre de un puesto de trabajo y responder ÚNICAMENTE con un objeto JSON válido.
      Sin texto adicional, sin backticks, sin explicaciones fuera del JSON.

      El JSON debe tener exactamente esta estructura:
      {"valid": true/false, "reason": "..."}

      Reglas para determinar valid:

      PUESTO DE TRABAJO VÁLIDO:
      - true: es un puesto de trabajo reconocible dentro del ámbito del desarrollo de software, ciencias de la computación e informática.
      - Ejemplos válidos: Desarrollador Frontend, Desarrollador Backend, Desarrollador Full Stack, Desarrollador Mobile, Ingeniero de Software, Arquitecto de Software, Diseñador UI/UX, Scrum Master, Product Owner, DevOps Engineer, QA Engineer, Data Scientist, Data Engineer, Machine Learning Engineer, Analista de Sistemas, Administrador de Base de Datos, Ingeniero de Redes, Técnico en Soporte, Project Manager, Tech Lead, CTO, puestos de trabajo relacionados a redes de telecomunicaciones, redes de computadoras, IT, puestos de trabajo relacionados a sistemas operativos, mantenimiento, puestos de trabajo relacionados a aplicacion de conocimientos en teoria de computacion como: algoritmos, teoria de automatas, grafos,  etc.

      PUESTO DE TRABAJO INVÁLIDO:
      - false: cualquier caso que no sea un puesto de trabajo válido del ámbito mencionado. Esto incluye: puestos de otros sectores, palabras que no son puestos de trabajo, groserías, insultos o cualquier contenido inapropiado.

      Reglas para el texto de reason, usa EXACTAMENTE estos mensajes según el caso:

      CASO 1 - Puesto de trabajo válido:
      {"valid": true, "reason": "Puesto de trabajo válido dentro del ámbito del desarrollo de software, ciencias de la computación e informática."}

      CASO 2 - Cualquier caso inválido (puesto no relacionado, no es un puesto, malas palabras, etc.):
      {"valid": false, "reason": "El puesto de trabajo introducido no esta relacionado con ambito de las ciencias de la computacion, desarrollo de software o informatica"}

      Responde SOLO con el JSON. Nada más.`;

    const response = await groq.chat.completions.create({
      model: env.AI_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      temperature: 0
    });

    const raw = response.choices[0].message.content?.trim() ?? "";
    const cleaned = raw.replace(/^```json\s*/i, "").replace(/```$/,"").trim();

    const parsedResponse = JSON.parse(cleaned) as LaboralExpTypes.PositionModerationResponse;
    return parsedResponse;
  } catch (err) {
    return {
      valid: false,
      reason: `Error: ${(err as Error).message ?? String(err)}`
    };
  }
}

export async function academicTitleValidation(title: string) {
  try {
    const prompt = `Nombre del Título: "${title}"`;

    const systemPrompt = `Eres un validador estricto de títulos académicos para un portafolio profesional de tecnología.
      Tu tarea es analizar si el nombre de un título académico es coherente con el ámbito de la informática y si corresponde a un título real.
      Responde ÚNICAMENTE con un objeto JSON válido. Sin texto adicional ni backticks.

      Estructura del JSON:
      {"valid": true/false, "reason": "..."}

      REGLAS PARA "valid":
      - true: Es un titulo de grado o certificación reconocible en Computación, Software, Informática, Sistemas o TI, tambien cuentan titulos referidos a educacion o conocimiento tecnico sobre disenio de interfaces como UI/UX, Frontend, etc.
      - Ejemplos válidos: Lic. en Ingeniería de Sistemas, Mgrt. en Ciencias de la Computación, Dr. en Análisis de Sistemas, Licencitura en Desarrollo de Software, Ing. en Programación Web, Ingenieria en Ciberseguridad, Diplomado en Redes y Telecomunicaciones, PhD. en Inteligencia Artificial, Tecnico medio en UI/UX, etc.

      - false: La carrera no pertenece al ámbito tecnológico (ej. Medicina, Derecho, Chef), son palabras sin sentido, insultos o el título es demasiado genérico/ficticio.

      REGLAS PARA EL TEXTO DE "reason" (Usa EXACTAMENTE estos):

      CASO 1 - Título válido:
      {"valid": true, "reason": "Título académico válido dentro del ámbito de las ciencias de la computación e informática."}

      CASO 2 - Título inválido:
      {"valid": false, "reason": "El título introducido no está relacionado con el ámbito de las ciencias de la computación, desarrollo de software o informática."}`;

    const response = await groq.chat.completions.create({
      model: env.AI_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      temperature: 0
    });

    const raw = response.choices[0].message.content?.trim() ?? "";
    const cleaned = raw.replace(/^```json\s*/i, "").replace(/```$/, "").trim();

    const parsedResponse = JSON.parse(cleaned) as EducacionTypes.TitleModerationResponse;
    return parsedResponse;
  } catch (err) {
    return {
      valid: false,
      reason: `Error de validación: ${(err as Error).message ?? String(err)}`
    };
  }
}