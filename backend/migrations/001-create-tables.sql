DROP ROLE IF EXISTS anon;

DROP ROLE IF EXISTS webuser;

DROP ROLE IF EXISTS authenticator;

CREATE ROLE anon NOINHERIT;

CREATE ROLE authenticator NOINHERIT;

CREATE ROLE webuser NOLOGIN;

GRANT webuser TO authenticator;

GRANT anon TO authenticator;

CREATE SCHEMA IF NOT EXISTS "basic_auth";

CREATE TABLE "basic_auth"."users" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid (),
  "email" text NOT NULL,
  "password_hash" text NOT NULL,
  "created_at" timestamp without time zone DEFAULT now(),
  "modified_at" timestamp without time zone DEFAULT now()
);

CREATE TABLE "public"."Activity" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid (),
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
  "start_date" timestamp(3) without time zone,
  "start_date_local" timestamp(3) without time zone,
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
  "created_at" timestamp without time zone DEFAULT now(),
  "modified_at" timestamp without time zone DEFAULT now()
);

CREATE TABLE "public"."Athlete" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid (),
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
  "created_at" timestamp without time zone DEFAULT now(),
  "modified_at" timestamp without time zone DEFAULT now()
);

CREATE TABLE "public"."Auth" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid (),
  "access_token" text NOT NULL,
  "expires_at" timestamp(3) without time zone NOT NULL,
  "refresh_token" text NOT NULL,
  "token_type" text NOT NULL,
  "strava_scope" text NOT NULL,
  "user_id" uuid NOT NULL,
  "created_at" timestamp without time zone DEFAULT now(),
  "modified_at" timestamp without time zone DEFAULT now()
);

CREATE TABLE "public"."Tour" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid (),
  "name" character varying(255) NOT NULL,
  "description" text,
  "start_date" timestamp(3) without time zone NOT NULL,
  "end_date" timestamp(3) without time zone,
  "is_public" boolean NOT NULL,
  "user_id" uuid NOT NULL,
  "created_at" timestamp without time zone DEFAULT now(),
  "modified_at" timestamp without time zone DEFAULT now()
);

CREATE TABLE "public"."TourActivities" (
  "tour_id" uuid NOT NULL,
  "activity_id" uuid NOT NULL
);

CREATE UNIQUE INDEX users_email_key ON basic_auth.users USING btree (email);

CREATE UNIQUE INDEX users_pkey ON basic_auth.users USING btree (id);

CREATE UNIQUE INDEX "Activity_pkey" ON public."Activity" USING btree (id);

CREATE UNIQUE INDEX "Athlete_pkey" ON public."Athlete" USING btree (id);

CREATE UNIQUE INDEX "Athlete_user_id_key" ON public."Athlete" USING btree (user_id);

CREATE UNIQUE INDEX "Auth_pkey" ON public."Auth" USING btree (id);

CREATE UNIQUE INDEX "Auth_user_id_key" ON public."Auth" USING btree (user_id);

CREATE UNIQUE INDEX "TourActivities_tour_id_activity_id_key" ON public."TourActivities" USING btree (tour_id, activity_id);

CREATE UNIQUE INDEX "Tour_pkey" ON public."Tour" USING btree (id);

ALTER TABLE "basic_auth"."users"
  ADD CONSTRAINT "users_pkey" PRIMARY KEY USING INDEX "users_pkey";

ALTER TABLE "public"."Activity"
  ADD CONSTRAINT "Activity_pkey" PRIMARY KEY USING INDEX "Activity_pkey";

ALTER TABLE "public"."Athlete"
  ADD CONSTRAINT "Athlete_pkey" PRIMARY KEY USING INDEX "Athlete_pkey";

ALTER TABLE "public"."Auth"
  ADD CONSTRAINT "Auth_pkey" PRIMARY KEY USING INDEX "Auth_pkey";

ALTER TABLE "public"."Tour"
  ADD CONSTRAINT "Tour_pkey" PRIMARY KEY USING INDEX "Tour_pkey";

ALTER TABLE "basic_auth"."users"
  ADD CONSTRAINT "users_email_check" CHECK ((email ~* '^.+@.+\..+$'::text));

ALTER TABLE "basic_auth"."users"
  ADD CONSTRAINT "users_email_key" UNIQUE USING INDEX "users_email_key";

ALTER TABLE "public"."Activity"
  ADD CONSTRAINT "Activity_user_id_fkey" FOREIGN KEY (user_id) REFERENCES basic_auth.users (id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE "public"."Athlete"
  ADD CONSTRAINT "Athlete_user_id_fkey" FOREIGN KEY (user_id) REFERENCES basic_auth.users (id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE "public"."Auth"
  ADD CONSTRAINT "Auth_user_id_fkey" FOREIGN KEY (user_id) REFERENCES basic_auth.users (id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE "public"."Tour"
  ADD CONSTRAINT "Tour_user_id_fkey" FOREIGN KEY (user_id) REFERENCES basic_auth.users (id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE "public"."TourActivities"
  ADD CONSTRAINT "TourActivities_activity_id_fkey" FOREIGN KEY (activity_id) REFERENCES "Activity" (id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE "public"."TourActivities"
  ADD CONSTRAINT "TourActivities_tour_id_fkey" FOREIGN KEY (tour_id) REFERENCES "Tour" (id) ON UPDATE CASCADE ON DELETE RESTRICT;

