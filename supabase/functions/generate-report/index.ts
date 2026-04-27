import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Trata requisições de preflight (CORS)
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type } = await req.json();
    
    // A sua chave do Gemini integrada diretamente
    const GEMINI_API_KEY = "AIzaSyA4E35ADobKwntrg-qPPXHXarLLAQQ1_sY";

    // Configuração do cliente Supabase para buscar dados do usuário
    const authHeader = req.headers.get("Authorization")?.replace("Bearer ", "");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Validação do usuário
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Coleta de contexto (Contratos, Financeiro e Clientes)
    let contextData = "";
    
    const { data: contracts } = await supabase
      .from("contracts")
      .select("*")
      .eq("user_id", user.id);

    if (contracts && contracts.length > 0) {
      contextData += `\nDados da Empresa:\n`;
      contextData += contracts.map(c => 
        `- Cliente: ${c.client_name}, Valor: R$ ${c.contract_value}, Status: ${c.status}`
      ).join('\n');
    } else {
      contextData = "Nenhum dado encontrado para análise.";
    }

    const systemPrompt = "Você é o especialista de IA da NexaScore. Analise os dados e gere um relatório estratégico de blindagem e crescimento empresarial em português. Use bullet points.";
    const userPrompt = `Gere um relatório do tipo ${type} com base nestes dados: ${contextData}`;

    // Chamada direta para a API oficial do Google Gemini
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }]
        }]
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Erro na API do Gemini:", result);
      throw new Error("O Gemini não conseguiu processar os dados.");
    }

    // Extrai o texto gerado pela IA
    const reportText = result.candidates[0].content.parts[0].text;

    // Retorna o relatório final para o seu Dashboard
    return new Response(JSON.stringify({ report: reportText }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Erro na função generate-report:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
