import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, FileText, Download, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TriageSummary {
  sessionId: string;
  timestamp: Date;
  mainComplaint: string;
  symptoms: string[];
  duration: string;
  intensity: string;
  additionalInfo: string;
  urgencyLevel: "baixa" | "média" | "alta" | "emergência";
  recommendations: string[];
}

const Summary = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  const { toast } = useToast();
  const [summary, setSummary] = useState<TriageSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        // Simulate API call to /summary/{session_id}
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock summary data
        const mockSummary: TriageSummary = {
          sessionId: sessionId || "",
          timestamp: new Date(),
          mainComplaint: "Dor de cabeça",
          symptoms: ["Dor de cabeça", "Leve tontura", "Cansaço"],
          duration: "2 dias",
          intensity: "Moderada (6/10)",
          additionalInfo: "Dor que piora no final do dia, sem outros sintomas associados",
          urgencyLevel: "baixa",
          recommendations: [
            "Manter hidratação adequada",
            "Descanso em ambiente tranquilo",
            "Evitar estresse e sobrecarga",
            "Se persistir por mais 2 dias, procurar médico clínico"
          ]
        };
        
        setSummary(mockSummary);
      } catch (error) {
        toast({
          title: "Erro ao carregar resumo",
          description: "Não foi possível carregar o resumo da triagem",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (sessionId) {
      fetchSummary();
    }
  }, [sessionId, toast]);

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case "baixa": return "text-secondary border-secondary/20 bg-secondary-light";
      case "média": return "text-yellow-600 border-yellow-200 bg-yellow-50";
      case "alta": return "text-orange-600 border-orange-200 bg-orange-50";
      case "emergência": return "text-destructive border-destructive/20 bg-destructive/10";
      default: return "text-muted-foreground border-border bg-muted";
    }
  };

  const startNewTriage = () => {
    navigate("/chat");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Carregando resumo da triagem...</p>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-xl font-semibold mb-4">Resumo não encontrado</h2>
          <p className="text-muted-foreground mb-6">
            Não foi possível encontrar o resumo da triagem solicitada.
          </p>
          <Button onClick={() => navigate("/")} variant="medical">
            Voltar ao início
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card px-4 py-4 shadow-card">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <h1 className="text-xl font-semibold text-foreground">Resumo da Triagem</h1>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            <Button variant="medical" size="sm" onClick={startNewTriage}>
              <MessageSquare className="w-4 h-4 mr-2" />
              Nova triagem
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Session Info */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Informações da Sessão</h2>
            <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getUrgencyColor(summary.urgencyLevel)}`}>
              Urgência: {summary.urgencyLevel}
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">ID da Sessão:</span>
              <p className="font-mono">{summary.sessionId}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Data/Hora:</span>
              <p>{summary.timestamp.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        {/* Main Complaint */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Queixa Principal</h2>
          <p className="text-foreground">{summary.mainComplaint}</p>
        </Card>

        {/* Symptoms Details */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-4">Sintomas Relatados</h3>
            <ul className="space-y-2">
              {summary.symptoms.map((symptom, index) => (
                <li key={index} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-foreground">{symptom}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-4">Detalhes</h3>
            <div className="space-y-3">
              <div>
                <span className="text-muted-foreground text-sm">Duração:</span>
                <p className="text-foreground">{summary.duration}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-sm">Intensidade:</span>
                <p className="text-foreground">{summary.intensity}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Additional Information */}
        {summary.additionalInfo && (
          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-4">Informações Adicionais</h3>
            <p className="text-foreground leading-relaxed">{summary.additionalInfo}</p>
          </Card>
        )}

        {/* Recommendations */}
        <Card className="p-6">
          <h3 className="font-semibold text-foreground mb-4">Recomendações</h3>
          <div className="space-y-3">
            {summary.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-primary-light rounded-lg">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                  {index + 1}
                </div>
                <p className="text-foreground">{recommendation}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Disclaimer */}
        <Card className="p-6 bg-muted/50 border-muted">
          <p className="text-sm text-muted-foreground text-center">
            <strong>Importante:</strong> Este resumo é baseado nas informações fornecidas durante a triagem virtual. 
            Não substitui consulta médica presencial. Em caso de emergência, procure atendimento médico imediatamente.
          </p>
        </Card>

        {/* Actions */}
        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={() => navigate("/")}>
            Voltar ao início
          </Button>
          <Button variant="medical" onClick={startNewTriage}>
            <MessageSquare className="w-4 h-4 mr-2" />
            Iniciar nova triagem
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Summary;