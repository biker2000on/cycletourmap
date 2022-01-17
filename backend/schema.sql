DROP ROLE IF EXISTS anon;

DROP ROLE IF EXISTS webuser;

DROP ROLE IF EXISTS authenticator;

CREATE ROLE anon NOINHERIT;

CREATE ROLE authenticator NOINHERIT;

CREATE ROLE webuser NOLOGIN;

GRANT webuser TO authenticator;

GRANT anon TO authenticator;

CREATE TABLE "Tour" (
  "id" uuid DEFAULT gen_random_uuid (),
  "name" varchar(255) NOT NULL,
  "description" text,
  "start_date" timestamp(3) NOT NULL,
  "end_date" timestamp(3),
  "is_public" boolean NOT NULL,
  "user_id" uuid,
  "created_at" timestamp DEFAULT now(),
  "modified_at" timestamp DEFAULT now(),
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
  "user_id" uuid,
  "created_at" timestamp DEFAULT now(),
  "modified_at" timestamp DEFAULT now(),
  CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Auth" (
  "id" uuid DEFAULT gen_random_uuid (),
  "access_token" text NOT NULL,
  "expires_at" timestamp(3) NOT NULL,
  "refresh_token" text NOT NULL,
  "token_type" text NOT NULL,
  "strava_scope" text NOT NULL,
  "user_id" uuid,
  "created_at" timestamp DEFAULT now(),
  "modified_at" timestamp DEFAULT now(),
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
  "user_id" uuid,
  "created_at" timestamp DEFAULT now(),
  "modified_at" timestamp DEFAULT now(),
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

-- CreateIndex FK
CREATE INDEX "Tour_user_id_fk" ON "Tour" ("user_id");

-- CreateIndex FK
CREATE INDEX "Activity_user_id_fk" ON "Activity" ("user_id");

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
  RETURNS uuid
  AS $$
  SELECT
    nullif (current_setting('jwt.claims.user_id', TRUE), '')::uuid;

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

CREATE OR REPLACE FUNCTION public.get_public_tour (id UUID)
  RETURNS "Tour"
  AS $$
BEGIN
SELECT * FROM "Tour" WHERE id = get_public_tour.id AND is_public = TRUE;
END;
$$
LANGUAGE plpgsql
STRICT
SECURITY DEFINER;

--Tour Trigger
CREATE OR REPLACE FUNCTION set_user ()
  RETURNS TRIGGER
  AS $$
BEGIN
  IF tg_op = 'INSERT' THEN
    NEW.user_id = current_user_id ();
  END IF;
  NEW.modified_at = now();
  RETURN NEW;
END
$$
LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tour_user ON "Tour";

DROP TRIGGER IF EXISTS activity_user ON "Activity";

DROP TRIGGER IF EXISTS athlete_user ON "Athlete";

DROP TRIGGER IF EXISTS auth_user ON "Auth";

CREATE TRIGGER tour_user
  BEFORE INSERT OR UPDATE ON "Tour"
  FOR EACH ROW
  EXECUTE PROCEDURE set_user ();

CREATE TRIGGER activity_user
  BEFORE INSERT OR UPDATE ON "Activity"
  FOR EACH ROW
  EXECUTE PROCEDURE set_user ();

CREATE TRIGGER athlete_user
  BEFORE INSERT OR UPDATE ON "Athlete"
  FOR EACH ROW
  EXECUTE PROCEDURE set_user ();

CREATE TRIGGER auth_user
  BEFORE INSERT OR UPDATE ON "Auth"
  FOR EACH ROW
  EXECUTE PROCEDURE set_user ();

ALTER TABLE "Tour" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "Activity" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "Athlete" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "Auth" ENABLE ROW LEVEL SECURITY;

CREATE POLICY tour_user_check ON "Tour"
  USING (user_id = current_user_id ());

CREATE POLICY activity_user_check ON "Activity"
  USING (user_id = current_user_id ());

CREATE POLICY athlete_user_check ON "Athlete"
  USING (user_id = current_user_id ());

CREATE POLICY auth_user_check ON "Auth"
  USING (user_id = current_user_id ());

GRANT SELECT ON "public"."Tour" TO anon;

GRANT SELECT, DELETE ON "public"."Tour" TO webuser;

GRANT INSERT ("name", "description", "start_date", "end_date", "is_public") ON "public"."Tour" TO webuser;
GRANT UPDATE ("name", "description", "start_date", "end_date", "is_public") ON "public"."Tour" TO webuser;

GRANT SELECT, DELETE ON "public"."Activity" TO webuser;

GRANT INSERT ("activity_type", "strava_id", "achievement_count", "athlete_count", "average_heartrate", "average_speed", "average_temp", "average_watts", "comment_count", "commute", "description", "device_watts", "display_hide_heartrate_option", "distance", "elapsed_time", "elev_high", "elev_low", "end_latlng", "flagged", "gear_id", "has_heartrate", "has_kudoed", "heartrate_opt_out", "kilojoules", "kudos_count", "location_city", "location_country", "location_state", "manual", "summary_polyline", "max_heartrate", "max_speed", "moving_time", "name", "photo_count", "pr_count", "private", "resource_state", "start_date", "start_date_local", "start_latitude", "start_longitude", "start_latlng", "timezone", "total_elevation_gain", "total_photo_count", "trainer", "type", "upload_id", "utc_offset", "visibility", "workout_type") ON "public"."Activity" TO webuser;
GRANT UPDATE ("activity_type", "strava_id", "achievement_count", "athlete_count", "average_heartrate", "average_speed", "average_temp", "average_watts", "comment_count", "commute", "description", "device_watts", "display_hide_heartrate_option", "distance", "elapsed_time", "elev_high", "elev_low", "end_latlng", "flagged", "gear_id", "has_heartrate", "has_kudoed", "heartrate_opt_out", "kilojoules", "kudos_count", "location_city", "location_country", "location_state", "manual", "summary_polyline", "max_heartrate", "max_speed", "moving_time", "name", "photo_count", "pr_count", "private", "resource_state", "start_date", "start_date_local", "start_latitude", "start_longitude", "start_latlng", "timezone", "total_elevation_gain", "total_photo_count", "trainer", "type", "upload_id", "utc_offset", "visibility", "workout_type") ON "public"."Activity" TO webuser;

GRANT SELECT, DELETE ON "public"."Auth" TO webuser;

GRANT INSERT ("access_token", "expires_at", "refresh_token", "token_type", "strava_scope", "user_id") ON "public"."Auth" TO webuser;
GRANT UPDATE ("access_token", "expires_at", "refresh_token", "token_type", "strava_scope", "user_id") ON "public"."Auth" TO webuser;

GRANT SELECT, DELETE ON "public"."Athlete" TO webuser;

GRANT INSERT ("strava_id", "firstname", "lastname", "profile", "profile_medium", "sex", "city", "state", "country", "date_preference", "measurement_preference", "weight") ON "public"."Athlete" TO webuser;
GRANT UPDATE ("strava_id", "firstname", "lastname", "profile", "profile_medium", "sex", "city", "state", "country", "date_preference", "measurement_preference", "weight") ON "public"."Athlete" TO webuser;

