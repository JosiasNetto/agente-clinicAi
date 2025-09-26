import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Heart, Shield, Stethoscope } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();

  const handleStartTriage = () => {
    navigate("/chat");
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
              Cuidado médico inteligente
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
              Triagem médica
              <span className="block text-primary">inteligente e acolhedora</span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Converse com nosso agente de triagem para uma avaliação inicial personalizada.
              Profissional, seguro e sempre disponível.
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
                  Inicie uma conversa para receber orientações médicas personalizadas
                </p>
              </div>
              
              <Button 
                onClick={handleStartTriage}
                variant="medical"
                size="lg"
                className="w-full"
              >
                <Stethoscope className="w-5 h-5 mr-2" />
                Iniciar nova triagem
              </Button>
              
              <p className="text-xs text-muted-foreground">
                * Este serviço não substitui consulta médica presencial
              </p>
            </div>
          </Card>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 pt-8">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center mx-auto">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-medium text-foreground">Acolhedor</h4>
              <p className="text-sm text-muted-foreground">Conversa empática e profissional</p>
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
              <h4 className="font-medium text-foreground">Inteligente</h4>
              <p className="text-sm text-muted-foreground">IA especializada em triagem</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;