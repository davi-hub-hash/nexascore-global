import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Users, Wallet, Sparkles, RefreshCw, Download, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

type ReportType = "contracts" | "financial" | "clients" | "all";

const reportTypes = [
  { id: "contracts" as ReportType, name: "Contratos", icon: FileText, description: "Análise de contratos ativos e pendentes" },
  { id: "financial" as ReportType, name: "Financeiro", icon: Wallet, description: "Receitas, despesas e projeções" },
  { id: "clients" as ReportType, name: "Clientes", icon: Users, description: "Performance e engajamento de clientes" },
  { id: "all" as ReportType, name: "Completo", icon: Sparkles, description: "Relatório completo com todos os dados" },
];

export default function Reports() {
  const { session } = useAuth();
  const [selectedType, setSelectedType] = useState<ReportType>("all");
  const [report, setReport] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateReport = async () => {
    if (!session?.access_token) {
      toast.error("Você precisa estar logado para gerar relatórios");
      return;
    }

    setIsGenerating(true);
    setReport("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-report`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ type: selectedType }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao gerar relatório");
      }

      if (!response.body) {
        throw new Error("Resposta vazia do servidor");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullReport = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              fullReport += content;
              setReport(fullReport);
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      toast.success("Relatório gerado com sucesso!");
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao gerar relatório");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(report);
    setCopied(true);
    toast.success("Relatório copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadReport = () => {
    const blob = new Blob([report], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-${selectedType}-${new Date().toISOString().split("T")[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Relatório baixado!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Relatórios com IA</h1>
        <p className="text-muted-foreground">
          Gere análises inteligentes dos seus dados usando inteligência artificial
        </p>
      </div>

      {/* Report Type Selection */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {reportTypes.map((type) => (
          <Card
            key={type.id}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedType === type.id
                ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                : "hover:border-primary/50"
            }`}
            onClick={() => setSelectedType(type.id)}
          >
            <CardContent className="p-4 text-center">
              <type.icon
                className={`h-8 w-8 mx-auto mb-2 ${
                  selectedType === type.id ? "text-primary" : "text-muted-foreground"
                }`}
              />
              <h3 className="font-medium">{type.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">{type.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Generate Button */}
      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={generateReport}
          disabled={isGenerating}
          className="gap-2 px-8"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="h-5 w-5 animate-spin" />
              Gerando relatório...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              Gerar Relatório de {reportTypes.find(t => t.id === selectedType)?.name}
            </>
          )}
        </Button>
      </div>

      {/* Report Output */}
      {(report || isGenerating) && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Relatório Gerado
              </CardTitle>
              <CardDescription>
                {isGenerating ? "Gerando análise..." : "Análise completa dos seus dados"}
              </CardDescription>
            </div>
            {report && !isGenerating && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
                <Button variant="outline" size="sm" onClick={downloadReport}>
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] w-full rounded-md border p-4 bg-muted/30">
              <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                {report || (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Analisando seus dados...
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-medium">Powered by AI</h4>
              <p className="text-sm text-muted-foreground">
                Os relatórios são gerados usando inteligência artificial que analisa seus dados 
                reais de contratos, financeiro e clientes para fornecer insights personalizados.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
