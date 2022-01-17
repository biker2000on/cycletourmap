ALTER TABLE "public"."Activity"
  ALTER COLUMN "user_id" DROP NOT NULL;

ALTER TABLE "public"."Athlete"
  ALTER COLUMN "user_id" DROP NOT NULL;

ALTER TABLE "public"."Auth"
  ALTER COLUMN "user_id" DROP NOT NULL;

ALTER TABLE "public"."Tour"
  ALTER COLUMN "user_id" DROP NOT NULL;

