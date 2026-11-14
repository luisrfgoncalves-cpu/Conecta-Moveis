-- ==============================================================================
-- CONECTA MÓVEIS - SCRIPT DE BOOTSTRAP DO PROPRIETÁRIO (OWNER)
-- Execute este script no SQL Editor do Supabase para conceder acesso de OWNER.
-- ==============================================================================

-- 1. Assegurar que os novos papéis existam no enum do sistema
ALTER TYPE public.system_role_type ADD VALUE IF NOT EXISTS 'owner';
ALTER TYPE public.system_role_type ADD VALUE IF NOT EXISTS 'support';

DO $$
DECLARE
  target_user_id UUID;
  target_email TEXT := 'luis.rf.goncalves@gmail.com';
BEGIN
  -- 2. Localiza o usuário em auth.users
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = target_email;

  IF target_user_id IS NULL THEN
    RAISE NOTICE 'Usuário com o e-mail % ainda não existe em auth.users. Crie a conta primeiro via cadastro na plataforma.', target_email;
  ELSE
    -- 3. Remove papéis anteriores e atribui 'owner'
    DELETE FROM public.user_roles WHERE user_id = target_user_id;

    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, 'owner'::public.system_role_type);

    RAISE NOTICE 'SUCESSO: A conta % (ID: %) foi promovida com sucesso ao papel de OWNER!', target_email, target_user_id;
  END IF;
END $$;

