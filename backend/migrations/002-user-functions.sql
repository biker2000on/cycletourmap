CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "public" version '1.3';

CREATE TYPE jwt_token AS (
  ROLE text,
  exp integer,
  user_id uuid,
  email varchar
);

SET check_function_bodies = OFF;

CREATE OR REPLACE FUNCTION basic_auth.encrypt_pass ()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  AS $function$
BEGIN
  IF tg_op = 'INSERT' OR NEW.password_hash <> OLD.password_hash THEN
    NEW.password_hash = crypt(NEW.password_hash, gen_salt('bf'));
    NEW.modified_at = now();
  END IF;
  RETURN NEW;
END
$function$;

CREATE OR REPLACE FUNCTION public.authenticate (email text, PASSWORD text)
  RETURNS jwt_token
  LANGUAGE plpgsql
  STRICT
  SECURITY DEFINER
  AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.create_user (email text, PASSWORD text)
  RETURNS jwt_token
  LANGUAGE plpgsql
  STRICT
  SECURITY DEFINER
  AS $function$
BEGIN
  INSERT INTO basic_auth.users (email, password_hash)
    VALUES (create_user.email, create_user.PASSWORD);
  RETURN authenticate (create_user.email, create_user.PASSWORD)::jwt_token;
END;
$function$;

CREATE OR REPLACE FUNCTION public.current_user_id ()
  RETURNS integer
  LANGUAGE sql
  STABLE
  AS $function$
  SELECT
    nullif (current_setting('jwt.claims.user_id', TRUE), '')::integer;

$function$;

CREATE OR REPLACE FUNCTION public.set_user ()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  AS $function$
BEGIN
  IF tg_op = 'INSERT' THEN
    NEW.user_id = current_user_id ();
  END IF;
  NEW.modified_at = now();
  RETURN NEW;
END
$function$;

CREATE TRIGGER encrypt_pass
  BEFORE INSERT OR UPDATE ON basic_auth.users
  FOR EACH ROW
  EXECUTE FUNCTION basic_auth.encrypt_pass ();

CREATE TRIGGER activity_user
  BEFORE INSERT OR UPDATE ON public."Activity"
  FOR EACH ROW
  EXECUTE FUNCTION set_user ();

CREATE TRIGGER athlete_user
  BEFORE INSERT OR UPDATE ON public."Athlete"
  FOR EACH ROW
  EXECUTE FUNCTION set_user ();

CREATE TRIGGER auth_user
  BEFORE INSERT OR UPDATE ON public."Auth"
  FOR EACH ROW
  EXECUTE FUNCTION set_user ();

CREATE TRIGGER tour_user
  BEFORE INSERT OR UPDATE ON public."Tour"
  FOR EACH ROW
  EXECUTE FUNCTION set_user ();

