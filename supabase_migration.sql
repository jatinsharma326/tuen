-- Run this entire script in Supabase SQL Editor
-- https://app.supabase.com → your project → SQL Editor

-- 1. Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  credits INTEGER NOT NULL DEFAULT 50,
  plan TEXT NOT NULL DEFAULT 'free',
  credits_reset_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create api_keys table
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL DEFAULT 'Untitled',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used_at TIMESTAMPTZ
);

-- 3. Create usage_logs table
CREATE TABLE IF NOT EXISTS public.usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  service TEXT NOT NULL,
  credits_used INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
-- Profiles: users can read/update their own
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- API keys: users can CRUD their own
CREATE POLICY "Users can read own keys" ON public.api_keys
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own keys" ON public.api_keys
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own keys" ON public.api_keys
  FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can update own keys" ON public.api_keys
  FOR UPDATE USING (auth.uid() = user_id);

-- Usage logs: users can read their own, server can insert
CREATE POLICY "Users can read own logs" ON public.usage_logs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Server can insert logs" ON public.usage_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6. Function: deduct credits
CREATE OR REPLACE FUNCTION public.deduct_credits(p_user_id UUID, p_amount INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.profiles
  SET credits = GREATEST(credits - p_amount, 0), updated_at = now()
  WHERE id = p_user_id AND credits >= p_amount;
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Function: refund credits
CREATE OR REPLACE FUNCTION public.refund_credits(p_user_id UUID, p_amount INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET credits = credits + p_amount, updated_at = now()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Function: reset monthly credits
CREATE OR REPLACE FUNCTION public.reset_monthly_credits(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_plan TEXT;
  v_credits INTEGER;
  v_reset_at TIMESTAMPTZ;
  v_monthly_credits INTEGER;
BEGIN
  SELECT plan, credits, credits_reset_at INTO v_plan, v_credits, v_reset_at
  FROM public.profiles WHERE id = p_user_id;

  IF v_reset_at IS NULL OR v_reset_at < now() THEN
    CASE v_plan
      WHEN 'free' THEN v_monthly_credits := 50;
      WHEN 'starter' THEN v_monthly_credits := 500;
      WHEN 'pro' THEN v_monthly_credits := 5000;
      WHEN 'enterprise' THEN v_monthly_credits := 99999;
      ELSE v_monthly_credits := 50;
    END CASE;

    UPDATE public.profiles
    SET credits = v_monthly_credits,
        credits_reset_at = now() + INTERVAL '30 days',
        updated_at = now()
    WHERE id = p_user_id;

    RETURN v_monthly_credits;
  END IF;

  RETURN v_credits;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Trigger: auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, credits, plan)
  VALUES (NEW.id, 50, 'free')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 10. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON public.api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key ON public.api_keys(key);
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id ON public.usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created_at ON public.usage_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_service ON public.usage_logs(user_id, service);
