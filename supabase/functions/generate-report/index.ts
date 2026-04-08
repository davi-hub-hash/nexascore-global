import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Get user from auth header
    const authHeader = req.headers.get("Authorization")?.replace("Bearer ", "");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch relevant data based on report type
    let contextData = "";
    
    if (type === "contracts" || type === "all") {
      const { data: contracts } = await supabase
        .from("contracts")
        .select("*")
        .eq("user_id", user.id)
        .limit(100);
      
      if (contracts && contracts.length > 0) {
        contextData += `\n\nCONTRATOS (${contracts.length} total):\n`;
        contextData += contracts.map(c => 
          `- ${c.client_name}: R$ ${c.contract_value.toLocaleString('pt-BR')}, ${c.duration_months} meses, Status: ${c.status}, Risco: ${c.risk_level || 'N/A'}`
        ).join('\n');
        
        const totalValue = contracts.reduce((sum, c) => sum + c.contract_value, 0);
        const activeContracts = contracts.filter(c => c.status === 'active').length;
        const highRisk = contracts.filter(c => c.risk_level === 'high').length;
        
        contextData += `\n\nResumo: Valor total: R$ ${totalValue.toLocaleString('pt-BR')}, Ativos: ${activeContracts}, Alto risco: ${highRisk}`;
      } else {
        contextData += "\n\nNenhum contrato encontrado.";
      }
    }
    
    if (type === "financial" || type === "all") {
      // For now, use contracts data as financial basis
      const { data: contracts } = await supabase
        .from("contracts")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active");
      
      if (contracts && contracts.length > 0) {
        const totalRevenue = contracts.reduce((sum, c) => sum + c.contract_value, 0);
        const avgValue = totalRevenue / contracts.length;
        
        contextData += `\n\nFINANCEIRO:\n`;
        contextData += `- Receita total prevista: R$ ${totalRevenue.toLocaleString('pt-BR')}\n`;
        contextData += `- Contratos ativos: ${contracts.length}\n`;
        contextData += `- Ticket médio: R$ ${avgValue.toLocaleString('pt-BR')}\n`;
      } else {
        contextData += "\n\nNenhum dado financeiro disponível.";
      }
    }
    
    if (type === "clients" || type === "all") {
      const { data: contracts } = await supabase
        .from("contracts")
        .select("client_name, contract_value, status")
        .eq("user_id", user.id);
      
      if (contracts && contracts.length > 0) {
        const clientMap = new Map();
        contracts.forEach(c => {
          const existing = clientMap.get(c.client_name) || { total: 0, count: 0, active: 0 };
          existing.total += c.contract_value;
          existing.count += 1;
          if (c.status === 'active') existing.active += 1;
          clientMap.set(c.client_name, existing);
        });
        
        contextData += `\n\nCLIENTES (${clientMap.size} únicos):\n`;
        clientMap.forEach((data, name) => {
          contextData += `- ${name}: R$ ${data.total.toLocaleString('pt-BR')} em ${data.count} contrato(s), ${data.active} ativo(s)\n`;
        });
      } else {
        contextData += "\n\nNenhum cliente encontrado.";
      }
    }

    const systemPrompt = `Você é um assistente de análise de negócios especializado em gestão empresarial brasileira.
Analise os dados fornecidos e gere um relatório detalhado em português do Brasil.
Seja objetivo, use bullet points e destaque insights importantes.
Inclua recomendações práticas baseadas nos dados.
Formate valores monetários em Reais (R$).`;

    const userPrompt = `Gere um relatório ${type === 'all' ? 'completo' : `de ${type}`} baseado nos seguintes dados:${contextData}`;

    console.log("Generating report for type:", type);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente mais tarde." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes para gerar relatório." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Erro ao gerar relatório" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Report generation error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
