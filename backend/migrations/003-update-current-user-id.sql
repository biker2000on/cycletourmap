SET check_function_bodies = OFF;

DROP FUNCTION public.current_user_id ();

CREATE OR REPLACE FUNCTION public.current_user_id ()
  RETURNS uuid
  LANGUAGE sql
  STABLE
  AS $function$
  SELECT
    nullif (current_setting('jwt.claims.user_id', TRUE), '')::uuid;

$function$;

