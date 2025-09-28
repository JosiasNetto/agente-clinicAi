import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Heart, Shield, Stethoscope } from "lucide-react";
import TriageModal from "@/components/TriageModal";
import { ChatMessage } from "@/lib/api";

const Home = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleStartTriage = () => {
    setIsModalOpen(true);
  };

  const handleStartChat = (sessionId: string, phoneNumber: string, existingMessages?: ChatMessage[]) => {
    // Navigate to chat with session data
    navigate('/chat', {
      state: {
        sessionId,
        phoneNumber,
        existingMessages: existingMessages || [],
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col">
      {/* Header */}
      <header className="w-full py-6 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-medical rounded-lg flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-foreground">TriagemIA</h1>
          </div>
          <div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Shield className="w-4 h-4" />
              Seguro e confiável
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          {/* Hero Section */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-light rounded-full text-primary text-sm font-medium">
              <Heart className="w-4 h-4 animate-pulse-medical" />
              Agente de triagem inteligente
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
              Agente de triagem
              <span className="block text-primary">para organizar suas informações</span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Nosso agente inteligente coleta e organiza suas informações médicas 
              para agilizar sua consulta com um profissional de saúde.
            </p>
          </div>

          {/* CTA Card */}
          <Card className="p-8 bg-card shadow-medical border-0 animate-fade-in">
            <div className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-foreground">
                  Pronto para começar?
                </h3>
                <p className="text-muted-foreground">
                  Organize suas informações de saúde para otimizar sua próxima consulta
                </p>
              </div>
              
            <Button 
              size="lg" 
              className="text-lg px-8 py-6"
              onClick={handleStartTriage}
            >
              Preparar Consulta
            </Button>              <p className="text-xs text-muted-foreground">
                * Este serviço organiza informações para facilitar consultas médicas, não oferece diagnóstico ou tratamento
              </p>
            </div>
          </Card>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 pt-8">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center mx-auto">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-medium text-foreground">Organizado</h4>
              <p className="text-sm text-muted-foreground">Estrutura suas informações de saúde</p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-secondary-light rounded-lg flex items-center justify-center mx-auto">
                <Shield className="w-6 h-6 text-secondary" />
              </div>
              <h4 className="font-medium text-foreground">Seguro</h4>
              <p className="text-sm text-muted-foreground">Dados protegidos e confidenciais</p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mx-auto">
                <Stethoscope className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-medium text-foreground">Eficiente</h4>
              <p className="text-sm text-muted-foreground">Otimiza o tempo de consulta</p>
            </div>
          </div>
        </div>
      </main>

      <TriageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStartChat={handleStartChat}
      />
    </div>
  );
};

export default Home;