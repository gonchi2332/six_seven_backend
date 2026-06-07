-- CATALOG TABLES
CREATE TABLE "role" (
  "id"   SERIAL UNIQUE PRIMARY KEY NOT NULL,
  "name" varchar(50) UNIQUE NOT NULL
);

CREATE TABLE "skill" (
  "id"         SERIAL UNIQUE PRIMARY KEY NOT NULL,
  "name"       varchar(50) UNIQUE NOT NULL,
  "type"       varchar(20) NOT NULL DEFAULT 'soft',
  "canon_name" varchar(50) NOT NULL DEFAULT 'undefined'
);

CREATE TABLE "residence_country" (
  "id"   SERIAL UNIQUE PRIMARY KEY NOT NULL,
  "name" varchar(20) NOT NULL
);

CREATE TABLE "residence_city" (
  "id"   SERIAL UNIQUE PRIMARY KEY NOT NULL,
  "name" varchar(100) NOT NULL
);

CREATE TABLE "external_platform" (
  "id"   SERIAL UNIQUE PRIMARY KEY NOT NULL,
  "name" varchar(100) NOT NULL
);

CREATE TABLE "academic_degree" (
  "id"   SERIAL UNIQUE PRIMARY KEY NOT NULL,
  "name" varchar(100) UNIQUE NOT NULL
);

CREATE TABLE "interface" (
  "id"   SERIAL UNIQUE PRIMARY KEY NOT NULL,
  "name" varchar(50) NOT NULL
);

CREATE TABLE "link" (
  "id"    SERIAL UNIQUE PRIMARY KEY NOT NULL,
  "link"  text,
  "label" varchar NOT NULL DEFAULT 'Enlace'
);

-- CORE TABLE
CREATE TABLE "user" (
  "username"                varchar(100) PRIMARY KEY NOT NULL,
  "password"                varchar(100) NOT NULL,
  "state"                   varchar(50)  NOT NULL DEFAULT 'unverified',
  "role_id"                 int          NOT NULL,
  "public_profile_link"     text,
  "registration_date"       TIMESTAMPTZ  NOT NULL DEFAULT now(),
  "names"                   varchar(100) NOT NULL,
  "first_surname"           varchar(100) NOT NULL,
  "main_registration_email" varchar(200) NOT NULL DEFAULT 'undefined',
  "is_new"                  boolean      DEFAULT true,
  "show_name"               boolean      NOT NULL DEFAULT true,
  "show_contact_email"      boolean      NOT NULL DEFAULT true,
  "show_phone"              boolean      NOT NULL DEFAULT true,
  "show_residence"          boolean      NOT NULL DEFAULT true,
  FOREIGN KEY ("role_id") REFERENCES "role"("id") DEFERRABLE INITIALLY IMMEDIATE
);

-- OPTIONAL USER DATA TABLES
CREATE TABLE "user_phone_number" (
  "username"     varchar(100) PRIMARY KEY NOT NULL,
  "phone_number" varchar(20)  NOT NULL,
  FOREIGN KEY ("username") REFERENCES "user"("username") ON DELETE CASCADE
);

CREATE TABLE "user_second_surname" (
  "username"        varchar(100) PRIMARY KEY NOT NULL,
  "second_surname"  varchar(100) NOT NULL,
  FOREIGN KEY ("username") REFERENCES "user"("username") ON DELETE CASCADE
);

CREATE TABLE "user_contact_email" (
  "username"      varchar(100) PRIMARY KEY NOT NULL,
  "contact_email" varchar(200) NOT NULL,
  FOREIGN KEY ("username") REFERENCES "user"("username") ON DELETE CASCADE
);

CREATE TABLE "user_registration_email" (
  "username"           varchar(100) PRIMARY KEY NOT NULL,
  "registration_email" varchar(200) NOT NULL,
  FOREIGN KEY ("username") REFERENCES "user"("username") ON DELETE CASCADE
);

CREATE TABLE "profile_picture" (
  "id"              SERIAL UNIQUE PRIMARY KEY NOT NULL,
  "profile_picture" bytea NOT NULL
);

CREATE TABLE "user_profile_picture" (
  "username"           varchar(100) PRIMARY KEY NOT NULL,
  "profile_picture_id" int NOT NULL,
  FOREIGN KEY ("username")           REFERENCES "user"("username")            ON DELETE CASCADE,
  FOREIGN KEY ("profile_picture_id") REFERENCES "profile_picture"("id")      ON DELETE CASCADE
);

CREATE TABLE "user_residence_country" (
  "username"             varchar(100) PRIMARY KEY NOT NULL,
  "residence_country_id" int NOT NULL,
  FOREIGN KEY ("username")             REFERENCES "user"("username")             ON DELETE CASCADE,
  FOREIGN KEY ("residence_country_id") REFERENCES "residence_country"("id")     ON DELETE CASCADE
);

CREATE TABLE "user_residence_city" (
  "username"          varchar(100) PRIMARY KEY NOT NULL,
  "residence_city_id" int NOT NULL,
  FOREIGN KEY ("username")          REFERENCES "user"("username")          ON DELETE CASCADE,
  FOREIGN KEY ("residence_city_id") REFERENCES "residence_city"("id")     ON DELETE CASCADE
);

-- AUTH TABLES
CREATE TABLE "password_reset_code" (
  "username"   varchar(100) PRIMARY KEY NOT NULL,
  "code"       varchar(8)  NOT NULL,
  "expires_at" TIMESTAMPTZ NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  FOREIGN KEY ("username") REFERENCES "user"("username") ON DELETE CASCADE
);

CREATE TABLE "verification_mail_code" (
  "id"         SERIAL UNIQUE PRIMARY KEY NOT NULL,
  "username"   varchar(100) NOT NULL,
  "code"       varchar(8)   NOT NULL,
  "expires_at" TIMESTAMPTZ  NOT NULL DEFAULT (now() + INTERVAL '15 minutes'),
  "created_at" TIMESTAMPTZ  NOT NULL DEFAULT now(),
  FOREIGN KEY ("username") REFERENCES "user"("username") ON DELETE CASCADE
);

CREATE TABLE "refresh_token" (
  "id"         SERIAL UNIQUE PRIMARY KEY NOT NULL,
  "username"   varchar(100) NOT NULL,
  "token"      varchar(512) NOT NULL UNIQUE,
  "expires_at" TIMESTAMPTZ  NOT NULL,
  "created_at" TIMESTAMPTZ  DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("username") REFERENCES "user"("username") ON DELETE CASCADE
);

-- CONTENT TABLES
CREATE TABLE "project" (
  "id"          SERIAL UNIQUE PRIMARY KEY NOT NULL,
  "username"    varchar(100) NOT NULL,
  "name"        varchar(50)  NOT NULL DEFAULT 'undefined',
  "role"        varchar(50)  NOT NULL DEFAULT 'undefined',
  "topic"       varchar(100),
  "description" text,
  "status"      varchar(100) NOT NULL DEFAULT 'in progress',
  "visible"     bool         NOT NULL DEFAULT true,
  "image"       bytea,
  CONSTRAINT "unique_project" UNIQUE ("username", "name"),
  FOREIGN KEY ("username") REFERENCES "user"("username") ON DELETE CASCADE
);

CREATE TABLE "project_link" (
  "project_id" int NOT NULL,
  "link_id"    int NOT NULL,
  PRIMARY KEY ("project_id", "link_id"),
  FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE CASCADE,
  FOREIGN KEY ("link_id")    REFERENCES "link"("id")    ON DELETE CASCADE
);

CREATE TABLE "laboral_experience" (
  "id"           SERIAL UNIQUE PRIMARY KEY NOT NULL,
  "username"     varchar(100) NOT NULL,
  "position"     varchar(100) NOT NULL,
  "company_name" varchar(200) NOT NULL,
  "description"  text,
  "visible"      bool NOT NULL DEFAULT true,
  "start_date"   date NOT NULL,
  "end_date"     date,
  CONSTRAINT "unique_laboral_experience" UNIQUE ("position", "company_name", "start_date", "username"),
  FOREIGN KEY ("username") REFERENCES "user"("username") ON DELETE CASCADE
);

CREATE TABLE "academic_training" (
  "id"                 SERIAL UNIQUE PRIMARY KEY NOT NULL,
  "username"           varchar(100) NOT NULL,
  "name"               text         NOT NULL,
  "academic_degree_id" int,
  "institution"        varchar(100) NOT NULL,
  "visible"            bool         NOT NULL DEFAULT true,
  "start_date"         date         NOT NULL,
  "canon_title"        text         NOT NULL DEFAULT 'undefined',
  "canon_institution"  text         NOT NULL DEFAULT 'undefined',
  "education_state"    varchar(255) NOT NULL DEFAULT 'Egresado',
  CONSTRAINT "unique_academic_training" UNIQUE ("username", "canon_title", "canon_institution"),
  FOREIGN KEY ("username")           REFERENCES "user"("username")       ON DELETE CASCADE,
  FOREIGN KEY ("academic_degree_id") REFERENCES "academic_degree"("id")
);

CREATE TABLE "certificate" (
  "id"          SERIAL UNIQUE PRIMARY KEY NOT NULL,
  "username"    varchar(100) NOT NULL,
  "title"       varchar(100) NOT NULL,
  "description" text         NOT NULL,
  "area"        varchar(100) NOT NULL,
  "file"        bytea,
  "issue_date"  date         NOT NULL,
  "visible"     bool         NOT NULL DEFAULT true,
  FOREIGN KEY ("username") REFERENCES "user"("username") ON DELETE CASCADE
);

-- RELATIONSHIP TABLES
CREATE TABLE "user_skill" (
  "skill_id"    int          NOT NULL,
  "username"    varchar(100) NOT NULL,
  "punctuation" smallint,
  "visible"     bool         NOT NULL DEFAULT true,
  PRIMARY KEY ("skill_id", "username"),
  FOREIGN KEY ("username") REFERENCES "user"("username") ON DELETE CASCADE,
  FOREIGN KEY ("skill_id") REFERENCES "skill"("id")
);

CREATE TABLE "user_platform" (
  "username"             varchar(100) NOT NULL,
  "external_platform_id" int          NOT NULL,
  "link"                 varchar(300) NOT NULL,
  "visit_count"          smallint     NOT NULL DEFAULT 0,
  PRIMARY KEY ("username", "external_platform_id"),
  FOREIGN KEY ("username")             REFERENCES "user"("username")             ON DELETE CASCADE,
  FOREIGN KEY ("external_platform_id") REFERENCES "external_platform"("id")
);

-- ANALYTICS TABLES
CREATE TABLE "interface_view" (
  "id"           SERIAL UNIQUE PRIMARY KEY NOT NULL,
  "username"     varchar(100) NOT NULL,
  "interface_id" int          NOT NULL,
  "viewed_at"    TIMESTAMPTZ  DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("username")     REFERENCES "user"("username")  ON DELETE CASCADE,
  FOREIGN KEY ("interface_id") REFERENCES "interface"("id")   ON DELETE CASCADE
);