-- Permanent account deletion for the signed-in user.
-- Orders are kept (business records) but unlinked/anonymized via SET NULL.
-- Profile + wishlist + notifications + addresses cascade from auth.users / profiles.

-- Allow unlinking orders when a user is removed (customer_* columns already denormalized)
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_user_id_fkey;
ALTER TABLE orders ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE orders
  ADD CONSTRAINT orders_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL;

CREATE OR REPLACE FUNCTION public.delete_own_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  user_role user_role;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT role INTO user_role FROM profiles WHERE id = uid;
  IF user_role IS NULL THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;

  -- Prevent accidental lock-out of admin accounts via self-service
  IF user_role = 'admin' THEN
    RAISE EXCEPTION 'Admin accounts cannot be deleted from the app. Contact support.';
  END IF;

  -- Explicit cleanup (also cascades, but keep intentional order)
  DELETE FROM notifications WHERE user_id = uid;
  DELETE FROM addresses WHERE user_id = uid;
  DELETE FROM reviews WHERE user_id = uid;
  DELETE FROM wishlist_items
    WHERE wishlist_id IN (SELECT id FROM wishlists WHERE user_id = uid);
  DELETE FROM wishlists WHERE user_id = uid;

  -- Keep order history for the store; detach from user
  UPDATE orders SET user_id = NULL WHERE user_id = uid;

  -- Null any inventory rows performed by this user
  UPDATE inventory_transactions SET performed_by = NULL WHERE performed_by = uid;

  -- Removes auth.users → cascades to profiles (ON DELETE CASCADE)
  DELETE FROM auth.users WHERE id = uid;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_own_account() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_own_account() TO authenticated;

COMMENT ON FUNCTION public.delete_own_account() IS
  'Permanently deletes the signed-in customer: auth user, profile, and personal data. Orders are anonymized and retained.';
