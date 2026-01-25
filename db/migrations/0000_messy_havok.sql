CREATE SCHEMA "basic_auth";
--> statement-breakpoint
CREATE TABLE "Activity" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
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
	"start_date" timestamp (3),
	"start_date_local" timestamp (3),
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
	"created_at" timestamp DEFAULT now(),
	"modified_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "Athlete" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
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
	"created_at" timestamp DEFAULT now(),
	"modified_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "Auth" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"access_token" text NOT NULL,
	"expires_at" timestamp (3) NOT NULL,
	"refresh_token" text NOT NULL,
	"token_type" text NOT NULL,
	"strava_scope" text NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"modified_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "TourActivities" (
	"tour_id" uuid NOT NULL,
	"activity_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Tour" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"start_date" timestamp (3) NOT NULL,
	"end_date" timestamp (3),
	"is_public" boolean NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"modified_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "basic_auth"."users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"modified_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "basic_auth"."users"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Athlete" ADD CONSTRAINT "Athlete_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "basic_auth"."users"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Auth" ADD CONSTRAINT "Auth_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "basic_auth"."users"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "TourActivities" ADD CONSTRAINT "TourActivities_tour_id_Tour_id_fk" FOREIGN KEY ("tour_id") REFERENCES "public"."Tour"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "TourActivities" ADD CONSTRAINT "TourActivities_activity_id_Activity_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."Activity"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Tour" ADD CONSTRAINT "Tour_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "basic_auth"."users"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "Activity_user_id_fk" ON "Activity" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "Athlete_user_id_key" ON "Athlete" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "Auth_user_id_key" ON "Auth" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "TourActivities_tour_id_activity_id_key" ON "TourActivities" USING btree ("tour_id","activity_id");--> statement-breakpoint
CREATE INDEX "Tour_user_id_fk" ON "Tour" USING btree ("user_id");