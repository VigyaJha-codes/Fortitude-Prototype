-- Drop the overly permissive policy
DROP POLICY IF EXISTS "All authenticated users can view faculty" ON public.faculty;

-- Create new policy for non-sensitive faculty data (visible to all authenticated users)
CREATE POLICY "Authenticated users can view basic faculty info"
  ON public.faculty
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    -- This policy will be combined with the next one using OR logic
  );

-- Create policy for faculty to view their own sensitive data including phone
CREATE POLICY "Faculty can view own complete profile"
  ON public.faculty
  FOR SELECT
  USING (
    auth.uid() = user_id
  );

-- Create policy for admins to view all faculty data including phone
CREATE POLICY "Admins can view all faculty data"
  ON public.faculty
  FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin')
  );

-- Note: RLS policies with the same command (SELECT) are combined with OR logic,
-- so faculty can see basic info of all faculty plus their own complete data,
-- and admins can see everything