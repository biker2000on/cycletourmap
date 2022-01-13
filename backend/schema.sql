-- CreateTable
CREATE TABLE "User" (
  "id" UUID NOT NULL,
  "name" VARCHAR(30) NOT NULL,
  "email" VARCHAR(30) NOT NULL,
  "passwordHash" VARCHAR(255) NOT NULL,
  "passwordSalt" VARCHAR(255) NOT NULL,
  "lastLogin" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tour" (
  "id" UUID NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "start_date" TIMESTAMP(3) NOT NULL,
  "end_date" TIMESTAMP(3),
  "isPublic" BOOLEAN NOT NULL,
  "userId" UUID NOT NULL,
  "athleteId" UUID,
  CONSTRAINT "Tour_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
  "id" UUID NOT NULL,
  "activity_type" TEXT NOT NULL,
  "strava_id" INTEGER,
  "achievement_count" INTEGER,
  "athlete_count" INTEGER,
  "average_heartrate" INTEGER,
  "average_speed" INTEGER,
  "average_temp" DOUBLE PRECISION,
  "average_watts" INTEGER,
  "comment_count" INTEGER,
  "commute" BOOLEAN,
  "description" TEXT,
  "device_watts" DOUBLE PRECISION,
  "display_hide_heartrate_option" BOOLEAN,
  "distance" DOUBLE PRECISION,
  "elapsed_time" DOUBLE PRECISION,
  "elev_high" DOUBLE PRECISION,
  "elev_low" DOUBLE PRECISION,
  "end_latlng" TEXT,
  "flagged" BOOLEAN,
  "gear_id" INTEGER,
  "has_heartrate" BOOLEAN,
  "has_kudoed" BOOLEAN,
  "heartrate_opt_out" BOOLEAN,
  "kilojoules" INTEGER,
  "kudos_count" INTEGER,
  "location_city" TEXT,
  "location_country" TEXT,
  "location_state" TEXT,
  "manual" BOOLEAN,
  "summary_polyline" TEXT,
  "max_heartrate" INTEGER,
  "max_speed" DOUBLE PRECISION,
  "moving_time" DOUBLE PRECISION,
  "name" TEXT,
  "photo_count" INTEGER,
  "pr_count" INTEGER,
  "private" BOOLEAN,
  "resource_state" TEXT,
  "start_date" TIMESTAMP(3),
  "start_date_local" TIMESTAMP(3),
  "start_latitude" DOUBLE PRECISION,
  "start_longitude" DOUBLE PRECISION,
  "start_latlng" TEXT,
  "timezone" TEXT,
  "total_elevation_gain" DOUBLE PRECISION,
  "total_photo_count" INTEGER,
  "trainer" BOOLEAN,
  "type" TEXT,
  "upload_id" INTEGER,
  "utc_offset" TEXT,
  "visibility" BOOLEAN,
  "workout_type" TEXT,
  "userId" UUID NOT NULL,
  CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Auth" (
  "id" UUID NOT NULL,
  "access_token" TEXT NOT NULL,
  "expires_at" TIMESTAMP(3) NOT NULL,
  "refresh_token" TEXT NOT NULL,
  "token_type" TEXT NOT NULL,
  "strava_scope" TEXT NOT NULL,
  "userId" UUID NOT NULL,
  CONSTRAINT "Auth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Athlete" (
  "id" UUID NOT NULL,
  "strava_id" INTEGER,
  "firstname" TEXT,
  "lastname" TEXT,
  "profile" TEXT,
  "profile_medium" TEXT,
  "sex" TEXT,
  "city" TEXT,
  "state" TEXT,
  "country" TEXT,
  "date_preference" TEXT,
  "measurement_preference" TEXT,
  "weight" DOUBLE PRECISION,
  "userId" UUID NOT NULL,
  CONSTRAINT "Athlete_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TourActivities" (
  "tourId" UUID NOT NULL,
  "activityId" UUID NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Auth_userId_key" ON "Auth"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Athlete_userId_key" ON "Athlete"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TourActivities_tourId_activityId_key" ON "TourActivities"("tourId", "activityId");

-- AddForeignKey
ALTER TABLE
  "Tour"
ADD
  CONSTRAINT "Tour_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
  "Tour"
ADD
  CONSTRAINT "Tour_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "Athlete"("id") ON DELETE
SET
  NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
  "Activity"
ADD
  CONSTRAINT "Activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
  "Auth"
ADD
  CONSTRAINT "Auth_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
  "Athlete"
ADD
  CONSTRAINT "Athlete_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
  "TourActivities"
ADD
  CONSTRAINT "TourActivities_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "Tour"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
  "TourActivities"
ADD
  CONSTRAINT "TourActivities_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;