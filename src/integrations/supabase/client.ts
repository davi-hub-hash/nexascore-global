import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kdyjtxmrcfomekzylswh.supabase.co';
// Usando a chave pública que você mandou (a 'sb_publishable')
const supabaseAnonKey = 'sb_publishable_MheLLksYejrINAxUHoFulA_VdPtid0y'; 

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
