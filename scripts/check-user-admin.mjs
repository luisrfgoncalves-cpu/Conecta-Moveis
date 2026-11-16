import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = fs.readFileSync('.env.local', 'utf8');
const lines = env.split('\n');
const envVars = {};
lines.forEach((l) => {
  const parts = l.split('=');
  const k = parts[0]?.trim();
  const v = parts.slice(1).join('=').trim().replace(/['"]/g, '');
  if (k) envVars[k] = v;
});

const admin = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY
);

async function checkUserAdmin() {
  console.log('--- Listando auth.users ---');
  const { data: usersData, error: uErr } = await admin.auth.admin.listUsers();
  if (usersData) {
    usersData.users.forEach((u) => {
      console.log('USER:', u.id, u.email);
    });
  } else {
    console.log('Users err:', uErr);
  }

  console.log('--- Verificando user_roles ---');
  const { data: roles, error: rErr } = await admin.from('user_roles').select('*');
  console.log('ROLES:', roles, rErr || '');
}

checkUserAdmin();
