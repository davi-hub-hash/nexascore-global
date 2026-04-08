import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Calendar,
  PieChart,
  Loader2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLocale } from "@/contexts/LocaleContext";

interface Contract {
  id: string;
  client_name: string;
  contract_value: number;
  status: string;
  start_date: string;
  end_date: string | null;
  created_at: string;
}

export default function Financial() {
  const { user } = useAuth();
  const { t, formatCurrency, formatDate } = useLocale();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      setLoading(true);
      const { data } = await supabase.from("contracts").select("*").eq("user_id", user.id);
      setContracts(data || []);
      setLoading(false);
    };
    fetch();
  }, [user]);

  const monthlyData = useMemo(() => {
    const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const now = new Date();
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthContracts = contracts.filter(c => {
        const start = new Date(c.start_date);
        return start.getMonth() === d.getMonth() && start.getFullYear() === d.getFullYear();
      });
      data.push({
        month: months[d.getMonth()],
        receita: monthContracts.reduce((acc, c) => acc + c.contract_value, 0),
      });
    }
    return data;
  }, [contracts]);

  const totalReceita = contracts.filter(c => c.status === "ativo").reduce((acc, c) => acc + c.contract_value, 0);
  const totalPendente = contracts.filter(c => c.status === "pendente").reduce((acc, c) => acc + c.contract_value, 0);
  const totalAll = contracts.reduce((acc, c) => acc + c.contract_value, 0);

  const statusDistribution = useMemo(() => [
    { name: t("active_label"), value: contracts.filter(c => c.status === "ativo").length, color: "hsl(var(--primary))" },
    { name: t("pending_label"), value: contracts.filter(c => c.status === "pendente").length, color: "hsl(var(--nexa-warning))" },
    { name: t("cancelled"), value: contracts.filter(c => c.status === "cancelado").length, color: "hsl(var(--destructive))" },
    { name: t("expired_label"), value: contracts.filter(c => c.status === "expirado" || (c.end_date && new Date(c.end_date) < new Date())).length, color: "hsl(var(--muted-foreground))" },
  ].filter(s => s.value > 0), [contracts, t]);

  const recentTransactions = useMemo(() => {
    return [...contracts]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 6)
      .map(c => ({
        id: c.id,
        description: `${t("contract_label")} - ${c.client_name}`,
        value: c.contract_value,
        status: c.status,
        date: formatDate(c.start_date),
      }));
  }, [contracts, t, formatDate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">{t("financial")}</h1>
          <p className="text-muted-foreground mt-1">{t("follow_revenue")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 rounded-2xl bg-card border border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-nexa-success/20">
              <TrendingUp className="h-6 w-6 text-nexa-success" />
            </div>
            <ArrowUpRight className="h-5 w-5 text-nexa-success" />
          </div>
          <p className="text-sm text-muted-foreground">{t("active_revenue_label")}</p>
          <p className="text-2xl font-bold mt-1">{formatCurrency(totalReceita)}</p>
          <p className="text-xs text-nexa-success mt-2">{contracts.filter(c => c.status === "ativo").length} {t("active_contracts_count")}</p>
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-nexa-warning/20">
              <DollarSign className="h-6 w-6 text-nexa-warning" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{t("pending")}</p>
          <p className="text-2xl font-bold mt-1">{formatCurrency(totalPendente)}</p>
          <p className="text-xs text-nexa-warning mt-2">{contracts.filter(c => c.status === "pendente").length} {t("pending_contracts_count")}</p>
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-primary/20">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{t("total_all")}</p>
          <p className="text-2xl font-bold mt-1">{formatCurrency(totalAll)}</p>
          <p className="text-xs text-muted-foreground mt-2">{contracts.length} {t("total_contracts_count")}</p>
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-nexa-info/20">
              <PieChart className="h-6 w-6 text-nexa-info" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{t("avg_ticket")}</p>
          <p className="text-2xl font-bold mt-1">
            {contracts.length > 0 ? formatCurrency(Math.round(totalAll / contracts.length)) : formatCurrency(0)}
          </p>
          <p className="text-xs text-muted-foreground mt-2">{t("per_contract")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-2xl bg-card border border-border">
          <h3 className="text-lg font-semibold mb-6">{t("revenue_per_month")}</h3>
          <div className="h-80">
            {monthlyData.some(d => d.receita > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorReceitaFin" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--nexa-success))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--nexa-success))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `${v / 1000}k`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [formatCurrency(value), t("revenue")]}
                  />
                  <Area type="monotone" dataKey="receita" stroke="hsl(var(--nexa-success))" strokeWidth={2} fillOpacity={1} fill="url(#colorReceitaFin)" name={t("revenue")} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                {t("register_contracts")}
              </div>
            )}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border">
          <h3 className="text-lg font-semibold mb-6">{t("status_distribution")}</h3>
          <div className="h-64">
            {statusDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                {t("no_data")}
              </div>
            )}
          </div>
          <div className="space-y-2 mt-4">
            {statusDistribution.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-muted-foreground">{cat.name}</span>
                </div>
                <span className="font-medium">{cat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-card border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="text-lg font-semibold">{t("recent_contracts")}</h3>
        </div>
        <div className="divide-y divide-border">
          {recentTransactions.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              {t("no_contracts")}
            </div>
          ) : (
            recentTransactions.map((tx) => (
              <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-secondary/20 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    tx.status === "ativo" ? "bg-nexa-success/20" : tx.status === "pendente" ? "bg-nexa-warning/20" : "bg-destructive/20"
                  }`}>
                    {tx.status === "ativo" ? (
                      <ArrowUpRight className="h-5 w-5 text-nexa-success" />
                    ) : (
                      <ArrowDownRight className="h-5 w-5 text-nexa-warning" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{tx.description}</p>
                    <p className="text-sm text-muted-foreground">{tx.date} · {tx.status}</p>
                  </div>
                </div>
                <p className="font-semibold text-nexa-success">
                  {formatCurrency(tx.value)}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
