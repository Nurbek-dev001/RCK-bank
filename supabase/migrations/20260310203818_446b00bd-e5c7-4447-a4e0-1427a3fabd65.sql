
-- Add status to transactions for approval workflow
CREATE TYPE public.transfer_status AS ENUM ('pending', 'approved', 'rejected');

ALTER TABLE public.transactions ADD COLUMN status transfer_status NOT NULL DEFAULT 'approved';

-- Add accounts table for internal balances
CREATE TABLE public.accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL DEFAULT 'Основной счёт',
  balance bigint NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'KZT',
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own accounts" ON public.accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own accounts" ON public.accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own accounts" ON public.accounts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all accounts" ON public.accounts FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update all accounts" ON public.accounts FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON public.accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create default account on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  INSERT INTO public.accounts (user_id, name, balance, is_default)
  VALUES (NEW.id, 'Основной счёт', 0, true);
  RETURN NEW;
END;
$$;

-- Add admin SELECT policy for transactions (already exists but let's ensure update/approve)
CREATE POLICY "Admins can update transactions" ON public.transactions FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
