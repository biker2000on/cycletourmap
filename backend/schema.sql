--tusker creates on the first time running diff
ALTER ROLE anon NOINHERIT;

ALTER ROLE authenticator NOINHERIT;

ALTER ROLE webuser NOLOGIN;

GRANT webuser TO authenticator;

GRANT anon TO authenticator;

CREATE TABLE "Tour" (
  "id" uuid DEFAULT gen_random_uuid (),
  "name" varchar(255) NOT NULL,
  "description" text,
  "start_date" timestamp(3) NOT NULL,
  "end_date" timestamp(3),
  "is_public" boolean NOT NULL,
  "user_id" uuid NOT NULL,
  CONSTRAINT "Tour_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Activity" (
  "id" uuid DEFAULT gen_random_uuid (),
  "activity_type" text NOT NULL,
  "strava_id" integer,
  "achievement_count" integer,
  "athlete_count" integer,
  "average_heartrate" integer,
  "average_speed" integer,
  "average_temp" double precision,
  "average_watts" integer,
  "comment_count" integer,
  "commute" boolean,
  "description" text,
  "device_watts" double precision,
  "display_hide_heartrate_option" boolean,
  "distance" double precision,
  "elapsed_time" double precision,
  "elev_high" double precision,
  "elev_low" double precision,
  "end_latlng" text,
  "flagged" boolean,
  "gear_id" integer,
  "has_heartrate" boolean,
  "has_kudoed" boolean,
  "heartrate_opt_out" boolean,
  "kilojoules" integer,
  "kudos_count" integer,
  "location_city" text,
  "location_country" text,
  "location_state" text,
  "manual" boolean,
  "summary_polyline" text,
  "max_heartrate" integer,
  "max_speed" double precision,
  "moving_time" double precision,
  "name" text,
  "photo_count" integer,
  "pr_count" integer,
  "private" boolean,
  "resource_state" text,
  "start_date" timestamp(3),
  "start_date_local" timestamp(3),
  "start_latitude" double precision,
  "start_longitude" double precision,
  "start_latlng" text,
  "timezone" text,
  "total_elevation_gain" double precision,
  "total_photo_count" integer,
  "trainer" boolean,
  "type" text,
  "upload_id" integer,
  "utc_offset" text,
  "visibility" boolean,
  "workout_type" text,
  "user_id" uuid NOT NULL,
  CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Auth" (
  "id" uuid DEFAULT gen_random_uuid (),
  "access_token" text NOT NULL,
  "expires_at" timestamp(3) NOT NULL,
  "refresh_token" text NOT NULL,
  "token_type" text NOT NULL,
  "strava_scope" text NOT NULL,
  "user_id" uuid NOT NULL,
  CONSTRAINT "Auth_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Athlete" (
  "id" uuid DEFAULT gen_random_uuid (),
  "strava_id" integer,
  "firstname" text,
  "lastname" text,
  "profile" text,
  "profile_medium" text,
  "sex" text,
  "city" text,
  "state" text,
  "country" text,
  "date_preference" text,
  "measurement_preference" text,
  "weight" double precision,
  "user_id" uuid NOT NULL,
  CONSTRAINT "Athlete_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TourActivities" (
  "tour_id" uuid NOT NULL,
  "activity_id" uuid NOT NULL
);

CREATE SCHEMA IF NOT EXISTS basic_auth;

CREATE TABLE IF NOT EXISTS basic_auth.users (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  "email" text UNIQUE NOT NULL CHECK (email ~* '^.+@.+\..+$'),
  "password_hash" text NOT NULL,
  "created_at" timestamp DEFAULT now(),
  "modified_at" timestamp DEFAULT now()
);

-- CreateIndex
CREATE UNIQUE INDEX "Auth_user_id_key" ON "Auth" ("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Athlete_user_id_key" ON "Athlete" ("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "TourActivities_tour_id_activity_id_key" ON "TourActivities" ("tour_id", "activity_id");

-- AddForeignKey
ALTER TABLE "Tour"
  ADD CONSTRAINT "Tour_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES basic_auth.users ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity"
  ADD CONSTRAINT "Activity_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES basic_auth.users ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Auth"
  ADD CONSTRAINT "Auth_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES basic_auth.users ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Athlete"
  ADD CONSTRAINT "Athlete_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES basic_auth.users ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TourActivities"
  ADD CONSTRAINT "TourActivities_tour_id_fkey" FOREIGN KEY ("tour_id") REFERENCES "Tour" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TourActivities"
  ADD CONSTRAINT "TourActivities_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "Activity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

--Password encryption
CREATE OR REPLACE FUNCTION basic_auth.encrypt_pass ()
  RETURNS TRIGGER
  AS $$
BEGIN
  IF tg_op = 'INSERT' OR NEW.password_hash <> OLD.password_hash THEN
    NEW.password_hash = crypt(NEW.password_hash, gen_salt('bf'));
    NEW.modified_at = now();
  END IF;
  RETURN NEW;
END
$$
LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS encrypt_pass ON basic_auth.users;

CREATE TRIGGER encrypt_pass
  BEFORE INSERT OR UPDATE ON basic_auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE basic_auth.encrypt_pass ();

CREATE TYPE jwt_token AS (
  ROLE text,
  exp integer,
  user_id uuid,
  email varchar
);

CREATE FUNCTION authenticate (email text, PASSWORD text)
  RETURNS jwt_token
  AS $$
DECLARE
  account basic_auth.users;
BEGIN
  SELECT
    a.* INTO account
  FROM
    basic_auth.users AS a
  WHERE
    a.email = authenticate.email;
  IF account.password_hash = crypt(PASSWORD, account.password_hash) THEN
    RETURN ('webuser',
      extract(epoch FROM now() + interval '7 days'),
      account.id,
      account.email)::jwt_token;
  ELSE
    RETURN NULL;
  END IF;
END;
$$
LANGUAGE plpgsql
STRICT
SECURITY DEFINER;

CREATE FUNCTION current_user_id ()
  RETURNS integer
  AS $$
  SELECT
    nullif (current_setting('jwt.claims.user_id', TRUE), '')::integer;
$$
LANGUAGE sql
STABLE;

CREATE OR REPLACE FUNCTION public.create_user (email text, PASSWORD text)
  RETURNS jwt_token
  AS $$
BEGIN
  INSERT INTO basic_auth.users (email, password_hash)
    VALUES (create_user.email, create_user.PASSWORD);
  RETURN authenticate (create_user.email, create_user.PASSWORD)::jwt_token;
END;
$$
LANGUAGE plpgsql
STRICT
SECURITY DEFINER;

