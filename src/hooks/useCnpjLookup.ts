import { useState } from "react";
import { toast } from "sonner";

interface CnpjData {
  razao_social: string;
  nome_fantasia: string;
  municipio: string;
  uf: string;
  cnae_fiscal_descricao: string;
  cnae_fiscal: number;
}

export function useCnpjLookup() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CnpjData | null>(null);

  const lookup = async (cnpj: string) => {
    const cleaned = cnpj.replace(/\D/g, "");
    if (cleaned.length !== 14) {
      toast.error("CNPJ deve ter 14 dígitos");
      return null;
    }

    setLoading(true);
    try {
      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleaned}`);
      if (!response.ok) {
        throw new Error("CNPJ não encontrado");
      }
      const result = await response.json();
      setData(result);
      return result;
    } catch (error) {
      toast.error("Erro ao consultar CNPJ. Verifique o número.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { lookup, loading, data };
}
