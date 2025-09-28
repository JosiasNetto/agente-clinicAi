import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ArrowLeft, FileText, MessageSquare, ClipboardList, Clock, AlertCircle, History, Thermometer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { API_ENDPOINTS, apiCall, ChatMessage } from "@/lib/api";

interface SummaryLocationState {
  summaryData: Record<string, any>; // Changed from string to any to support arrays
}

interface TriageSummary {
  sessionId: string;
  timestamp: Date;
  mainComplaint: string;
  symptoms: string[];  // Changed from string to string[]
  duration: string;
  frequency: string;
  intensity: string;
  history: string;
  measuresTaken: string;
}

const Summary = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { sessionId } = useParams<{ sessionId: string }>();
  const { toast } = useToast();
  const [summary, setSummary] = useState<TriageSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const locationState = location.state as SummaryLocationState | null;

  useEffect(() => {
    const loadSummary = async () => {
      try {
        if (locationState?.summaryData) {
          const summaryData: TriageSummary = {
            sessionId: sessionId || "",
            timestamp: new Date(),
            mainComplaint: locationState.summaryData.main_complaint,
            symptoms: Array.isArray(locationState.summaryData.symptoms) 
              ? locationState.summaryData.symptoms 
              : locationState.summaryData.symptoms ? [locationState.summaryData.symptoms] : [],
            duration: locationState.summaryData.duration || "Não especificado",
            frequency: locationState.summaryData.frequency || "Não especificado",
            intensity: locationState.summaryData.intensity || "Não especificado",
            history: locationState.summaryData.history || "Não especificado",
            measuresTaken: locationState.summaryData.measures_taken || "Não especificado",
          };
          
          setSummary(summaryData);
        } else {
          toast({
            title: "Resumo não disponível",
            description: "Não foi possível carregar o resumo das informações coletadas.",
            variant: "destructive",
          });
          navigate('/');
        }
      } catch (error) {
        console.error('Erro ao carregar resumo:', error);
        toast({
          title: "Erro",
          description: "Erro ao processar o resumo das informações coletadas.",
          variant: "destructive",
        });
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    loadSummary();
  }, [sessionId, locationState, toast, navigate]);

  const handleBackToChat = async () => {
    if (!sessionId) {
      toast({
        title: "Erro",
        description: "Sessão não encontrada.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Make request to get chat messages for this session
      const messages = await apiCall<ChatMessage[]>(
        API_ENDPOINTS.GET_CHAT_MESSAGES(sessionId),
        { method: 'GET' }
      );

      // Navigate back to chat with session data and existing messages
      navigate("/chat", {
        state: {
          sessionId: sessionId,
          existingMessages: messages,
        }
      });

    } catch (error) {
      console.error('Erro ao carregar mensagens da conversa:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as mensagens da conversa. Voltando para o chat vazio.",
        variant: "destructive",
      });
      
      // Fallback: navigate to chat with just the session ID
      navigate("/chat", {
        state: {
          sessionId: sessionId,
        }
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Resumo não encontrado</h3>
          <p className="text-muted-foreground mb-4">
            Não foi possível carregar o resumo das informações coletadas.
          </p>
          <Button onClick={() => navigate('/')}>
            Voltar ao início
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card px-4 py-4 shadow-card">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-medical rounded-full flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-foreground">Resumo das Informações</h1>
                <p className="text-xs text-muted-foreground">
                  {summary.timestamp.toLocaleDateString('pt-BR')} às {summary.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>
          
          <Button variant="outline" size="sm" onClick={handleBackToChat}>
            <MessageSquare className="w-4 h-4 mr-2" />
            Voltar ao chat
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <Card className="p-6 bg-gradient-to-br from-primary-light to-primary-light/50 border-primary/20">
            <div className="flex items-center gap-3 mb-4">
              <ClipboardList className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Informações Coletadas</h2>
            </div>
            <p className="text-muted-foreground">
              Resumo das informações de saúde organizadas durante nossa conversa.
            </p>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-5 h-5 text-destructive" />
                <h3 className="font-semibold text-foreground">Queixa Principal</h3>
              </div>
              <p className="text-foreground leading-relaxed">{summary.mainComplaint}</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-foreground">Duração</h3>
              </div>
              <p className="text-foreground leading-relaxed">{summary.duration}</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Thermometer className="w-5 h-5 text-orange-600" />
                <h3 className="font-semibold text-foreground">Sintomas</h3>
              </div>
              <div className="text-foreground leading-relaxed">
                {summary.symptoms && summary.symptoms.length > 0 ? (
                  <ul className="space-y-2">
                    {summary.symptoms.map((symptom, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary mt-1 text-sm">•</span>
                        <span>{symptom}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground italic">Nenhum sintoma especificado</p>
                )}
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-foreground">Frequência</h3>
              </div>
              <p className="text-foreground leading-relaxed">{summary.frequency}</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <h3 className="font-semibold text-foreground">Intensidade</h3>
              </div>
              <p className="text-foreground leading-relaxed">{summary.intensity}</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <History className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-foreground">Histórico</h3>
              </div>
              <p className="text-foreground leading-relaxed">{summary.history}</p>
            </Card>
          </div>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Medidas Tomadas</h3>
            </div>
            <p className="text-foreground leading-relaxed">{summary.measuresTaken}</p>
          </Card>

          <Card className="p-6 border-orange-200 bg-orange-50">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-orange-900 mb-2">Aviso Importante</h3>
                <p className="text-orange-800 text-sm leading-relaxed">
                  Este resumo organiza as informações de saúde que você compartilhou e não constitui 
                  diagnóstico ou orientação médica. Em caso de dúvidas ou agravamento dos sintomas, 
                  procure atendimento médico adequado.
                </p>
              </div>
            </div>
          </Card>

          <div className="flex gap-4">
            <Button onClick={handleBackToChat} className="flex-1" variant="medical">
              <MessageSquare className="w-4 h-4 mr-2" />
              Continuar conversa
            </Button>
            <Button onClick={() => navigate('/')} variant="outline" className="flex-1">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Nova Triagem
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Summary;
