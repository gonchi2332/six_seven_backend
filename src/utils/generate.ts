import * as fs from "fs";
import * as path from "path";

const codeLenght = 8;

export function generateCode() {
  let code = "";
  let digit;
  for (let i = 0; i <= codeLenght - 1; i++) {
    digit = Math.floor(Math.random() * 10);
    code += digit.toString();
  }
  return code;
}

export function generateHTMLMail(username: string, targetMail: string, code: string) {
  let htmlMail : string = fs.readFileSync(path.join(__dirname, "./mail.html"), "utf-8"); 

  htmlMail = htmlMail.replace("__USERNAME__", username);
  htmlMail = htmlMail.replace(/__TARGETMAIL__/g, targetMail);
  htmlMail = htmlMail.replace("__CODE__", code);

  return htmlMail;
}