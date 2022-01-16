ALTER TABLE "public"."Activity" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."Athlete" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."Auth" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."Tour" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "activity_user_check" ON "public"."Activity" AS permissive
  FOR ALL TO public
    USING ((user_id = current_user_id ()));

CREATE POLICY "athlete_user_check" ON "public"."Athlete" AS permissive
  FOR ALL TO public
    USING ((user_id = current_user_id ()));

CREATE POLICY "auth_user_check" ON "public"."Auth" AS permissive
  FOR ALL TO public
    USING ((user_id = current_user_id ()));

CREATE POLICY "tour_user_check" ON "public"."Tour" AS permissive
  FOR ALL TO public
    USING ((user_id = current_user_id ()));

