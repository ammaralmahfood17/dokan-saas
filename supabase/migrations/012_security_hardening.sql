-- ============================================================
-- DOKAN — Migration 012: Security Hardening
-- Fetched from remote (applied via SQL Editor previously)
-- Adds SET search_path = '' to all security definer functions
-- ============================================================

-- 1. FIX search_path on all security definer functions
CREATE OR REPLACE FUNCTION public.is_restaurant_staff(rid uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE SET search_path = '' AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.restaurant_staff
    WHERE restaurant_id = rid AND user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_restaurant_owner(rid uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE SET search_path = '' AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.restaurants
    WHERE id = rid AND owner_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_restaurant_manager(rid uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE SET search_path = '' AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.restaurant_staff
    WHERE restaurant_id = rid AND user_id = auth.uid() AND role IN ('owner','manager')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE SET search_path = '' AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.super_admins WHERE user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_next_order_number(rid uuid)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE next_num int;
BEGIN
  INSERT INTO public.order_counters (restaurant_id, date, counter)
  VALUES (rid, current_date, 1)
  ON CONFLICT (restaurant_id, date)
  DO UPDATE SET counter = order_counters.counter + 1
  RETURNING counter INTO next_num;

  RETURN rid || '-' || to_char(current_date, 'YYYYMMDD') || '-' || LPAD(next_num::text, 4, '0');
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'full_name', new.email));
  RETURN new;
END;
$$;
