import { createClient } from '@supabase/supabase-common-js';

// Essas variáveis geralmente são puxadas do ambiente, 
// mas para restaurar rápido, vamos usar as do seu projeto:
const supabaseUrl = 'https://kdyjtxmrcfomekzylswh.supabase.co';
const supabaseAnonKey = 'SUA_CHAVE_ANON_AQUI'; 

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
