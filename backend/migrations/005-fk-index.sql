CREATE INDEX "Activity_user_id_fk" ON public."Activity" USING btree (user_id);

CREATE INDEX "Tour_user_id_fk" ON public."Tour" USING btree (user_id);