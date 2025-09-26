import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Bot, User, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  isEmergency?: boolean;
}

const Chat = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Add welcome message when chat starts
    const welcomeMessage: Message = {
      id: "welcome",
      content: "Olá! Sou seu assistente de triagem médica. Vou fazer algumas perguntas para entender melhor sua situação. Como posso te ajudar hoje?",
      isUser: false,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, []);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Simulate API call to FastAPI backend
      // In real implementation, this would call /message endpoint
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate different types of responses
      let botResponse = "";
      let isEmergency = false;
      
      if (inputValue.toLowerCase().includes("dor no peito") || 
          inputValue.toLowerCase().includes("falta de ar") ||
          inputValue.toLowerCase().includes("emergência")) {
        botResponse = "⚠️ ATENÇÃO: Pelos sintomas descritos, recomendo que procure atendimento médico de emergência IMEDIATAMENTE. Dirija-se ao pronto-socorro mais próximo ou chame o SAMU (192).";
        isEmergency = true;
      } else if (inputValue.toLowerCase().includes("dor de cabeça")) {
        botResponse = "Entendo que você está com dor de cabeça. Para me ajudar a avaliar melhor sua situação, pode me dizer: há quanto tempo você está sentindo essa dor? A dor é constante ou vai e vem?";
      } else if (inputValue.toLowerCase().includes("febre")) {
        botResponse = "Você mencionou febre. Isso pode indicar uma infecção. Você mediu sua temperatura? Tem outros sintomas como dor de garganta, tosse ou mal-estar?";
      } else {
        botResponse = "Obrigado por compartilhar essa informação. Para fazer uma avaliação mais precisa, preciso entender melhor seus sintomas. Pode descrever o que está sentindo com mais detalhes?";
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: botResponse,
        isUser: false,
        timestamp: new Date(),
        isEmergency,
      };

      setMessages(prev => [...prev, botMessage]);

      if (isEmergency) {
        toast({
          title: "Situação de Emergência Detectada",
          description: "Procure atendimento médico imediatamente",
          variant: "destructive",
        });
      }

      // Simulate getting session_id from backend
      if (!sessionId) {
        setSessionId(`session_${Date.now()}`);
      }

    } catch (error) {
      toast({
        title: "Erro na conexão",
        description: "Tente novamente em alguns instantes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const viewSummary = () => {
    if (sessionId) {
      navigate(`/summary/${sessionId}`);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
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
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-foreground">Assistente de Triagem</h1>
                <p className="text-xs text-muted-foreground">Online • Seguro</p>
              </div>
            </div>
          </div>
          
          {messages.length > 2 && (
            <Button variant="outline" size="sm" onClick={viewSummary}>
              Ver resumo
            </Button>
          )}
        </div>
      </header>

      {/* Messages Area */}
      <main className="flex-1 overflow-hidden">
        <div className="h-full max-w-4xl mx-auto flex flex-col">
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 animate-fade-in ${
                  message.isUser ? "flex-row-reverse" : ""
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  message.isUser 
                    ? "bg-primary text-primary-foreground" 
                    : message.isEmergency
                    ? "bg-destructive text-destructive-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}>
                  {message.isUser ? (
                    <User className="w-4 h-4" />
                  ) : message.isEmergency ? (
                    <AlertTriangle className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>
                
                <Card className={`max-w-[80%] p-4 shadow-chat ${
                  message.isUser 
                    ? "bg-primary text-primary-foreground" 
                    : message.isEmergency
                    ? "bg-destructive/10 border-destructive/20"
                    : "bg-card"
                }`}>
                  <p className={`text-sm leading-relaxed ${
                    message.isEmergency ? "text-destructive font-medium" : ""
                  }`}>
                    {message.content}
                  </p>
                  <div className="flex justify-end mt-2">
                    <span className={`text-xs ${
                      message.isUser 
                        ? "text-primary-foreground/70" 
                        : "text-muted-foreground"
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                </Card>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex items-start gap-3 animate-fade-in">
                <div className="w-8 h-8 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <Card className="p-4 shadow-chat bg-card">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse-medical"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse-medical" style={{ animationDelay: "0.2s" }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse-medical" style={{ animationDelay: "0.4s" }}></div>
                    <span className="text-sm text-muted-foreground ml-2">Digitando...</span>
                  </div>
                </Card>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>
      </main>

      {/* Input Area */}
      <footer className="border-t bg-card px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Descreva seus sintomas ou como está se sentindo..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button
              onClick={sendMessage}
              disabled={!inputValue.trim() || isLoading}
              variant="medical"
              size="icon"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Lembre-se: este não é um atendimento médico de emergência
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Chat;