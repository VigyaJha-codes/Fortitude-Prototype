-- Function to auto-assign roles based on email domain
CREATE OR REPLACE FUNCTION public.auto_assign_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email TEXT;
  assigned_role app_role;
BEGIN
  -- Get user email
  SELECT email INTO user_email FROM auth.users WHERE id = NEW.id;
  
  -- Determine role based on email
  IF user_email LIKE '%admin@fortitude.edu%' THEN
    assigned_role := 'admin';
  ELSIF user_email LIKE '%faculty@fortitude.edu%' THEN
    assigned_role := 'faculty';
  ELSIF user_email LIKE '%student@fortitude.edu%' THEN
    assigned_role := 'student';
  ELSE
    -- Default role for other emails
    assigned_role := 'student';
  END IF;
  
  -- Insert the role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, assigned_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Trigger to auto-assign role when profile is created
DROP TRIGGER IF EXISTS on_profile_created_assign_role ON public.profiles;
CREATE TRIGGER on_profile_created_assign_role
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_assign_role();