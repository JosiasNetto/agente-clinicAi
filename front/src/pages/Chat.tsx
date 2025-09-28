import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Send, Bot, User, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useChatApi } from "@/hooks/use-chat-api";
import { 
  ChatMessage, 
  convertApiMessagesToInternal, 
  API_ENDPOINTS, 
  apiCall, 
  TriageSummary, 
  processTriageSummary 
} from "@/lib/api";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  isEmergency?: boolean;
  hasSubtext?: boolean; // Para indicar que tem texto com menos destaque
}

interface ChatLocationState {
  sessionId: string;
  phoneNumber?: string;
  existingMessages?: ChatMessage[];
}

const Chat = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [showHeader, setShowHeader] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastScrollY = useRef(0);
  
  const { sessionId, isLoading, initializeChat, sendMessage: sendChatMessage, setSessionId } = useChatApi();

  // Get state from navigation (if coming from modal selection)
  const locationState = location.state as ChatLocationState | null;

  // Function to render message content with different styles
  const renderMessageContent = (message: Message) => {
    if (message.hasSubtext && !message.isUser) {
      const parts = message.content.split('Lembre-se:');
      if (parts.length === 2) {
        return (
          <div className="whitespace-pre-wrap">
            <span>{parts[0].trim()}</span>
            <span className="block mt-3 text-muted-foreground text-xs opacity-75 italic">
              Lembre-se: {parts[1].trim()}
            </span>
          </div>
        );
      }
    }
    return <div className="whitespace-pre-wrap">{message.content}</div>;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when loading ends
  useEffect(() => {
    if (!isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoading]);

  // Initial focus when component mounts
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (inputRef.current && !isLoading) {
        inputRef.current.focus();
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, []);

  // Handle header visibility on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDifference = Math.abs(currentScrollY - lastScrollY.current);
      
      // Show header when:
      // 1. At the top of the page
      // 2. Scrolling up by at least 5px
      // 3. Near the top (within 150px)
      if (currentScrollY === 0) {
        setShowHeader(true);
      } else if (currentScrollY < 150) {
        setShowHeader(true);
      } else if (currentScrollY < lastScrollY.current && scrollDifference > 5) {
        setShowHeader(true);
      } else if (currentScrollY > lastScrollY.current && scrollDifference > 20 && currentScrollY > 150) {
        setShowHeader(false);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    // Check if we have state from navigation (existing conversation or new chat)
    if (locationState) {
      const { sessionId: stateSessionId, existingMessages } = locationState;
      
      // Set the session ID from navigation state
      setSessionId(stateSessionId);
      
      if (existingMessages && existingMessages.length > 0) {
        // Convert ChatMessage[] to Message[] using utility function
        const convertedMessages = convertApiMessagesToInternal(existingMessages);
        setMessages(convertedMessages);
      } else {
        // New conversation - no existing messages, but we already have a session_id
        // Add a welcome message since it's a new conversation
        const welcomeMessage: Message = {
          id: 'welcome',
          content: 'Olá! Sou seu assistente de triagem médica. Vou fazer algumas perguntas para coletar e organizar seus dados de saúde. Como posso te ajudar a se preparar para sua consulta? \n\n Lembre-se: esta é apenas uma triagem inicial e eu não substituo a avaliação de um profissional de saúde.',
          isUser: false,
          timestamp: new Date(),
          hasSubtext: true,
        };
        setMessages([welcomeMessage]);
      }
    } else {
      // Fallback: Initialize chat the old way (for direct navigation to /chat)
      const initialize = async () => {
        try {
          const welcomeMessage = await initializeChat();
          
          const message: Message = {
            id: 'welcome',
            content: welcomeMessage,
            isUser: false,
            timestamp: new Date(),
          };

          setMessages([message]);
        } catch (error) {
          console.error('Erro ao inicializar o chat:', error);
          // Fallback to local welcome message if API fails
          const fallbackMessage: Message = {
            id: 'welcome',
            content: 'Olá! Sou seu assistente de triagem médica. Vou fazer algumas perguntas para coletar e organizar seus dados de saúde. Como posso te ajudar a se preparar para sua consulta? \n\n Lembre-se: esta é apenas uma triagem inicial e eu não substituto a avaliação de um profissional de saúde.',
            isUser: false,
            timestamp: new Date(),
            hasSubtext: true,
          };
          setMessages([fallbackMessage]);
          
          toast({
            title: 'Aviso',
            description: 'Conectando ao servidor... Algumas funcionalidades podem estar limitadas.',
            variant: 'default',
          });
        }
      };
      
      initialize();
    }
  }, [locationState, initializeChat, setSessionId, toast]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    const messageContent = inputValue;
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");

    try {
      // Use the chat API hook to send the message
      const response = await sendChatMessage(messageContent, sessionId);

      // Determine if this is an emergency response
      const isEmergency = response.message.includes('⚠️') || 
                         response.message.toLowerCase().includes('emergência') ||
                         response.message.toLowerCase().includes('imediatamente') ||
                         response.message.toLowerCase().includes('samu');

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.message,
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

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: "Erro na conexão",
        description: "Não foi possível enviar a mensagem. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const viewSummary = async () => {
    if (!sessionId) {
      toast({
        title: "Erro",
        description: "Sessão não encontrada. Inicie uma nova conversa.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Make request to get triage summary
      const triageSummary = await apiCall<TriageSummary>(
        API_ENDPOINTS.GET_TRIAGE_SUMMARY(sessionId),
        { method: 'GET' }
      );

      // Process the summary to replace null values
      const processedSummary = processTriageSummary(triageSummary);

      // Navigate to summary page with the processed data
      navigate(`/summary/${sessionId}`, {
        state: {
          summaryData: processedSummary,
        }
      });

    } catch (error) {
      console.error('Erro ao buscar resumo das informações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o resumo das informações coletadas. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className={`
        fixed top-0 left-0 right-0 z-50 
        border-b bg-card/95 backdrop-blur-sm px-4 py-4 shadow-card
        transition-transform duration-300 ease-in-out
        ${showHeader ? 'translate-y-0' : '-translate-y-full'}
      `}>
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
      <main className="flex-1 overflow-hidden pt-24">
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
                  <div className={`text-sm leading-relaxed ${
                    message.isEmergency ? "text-destructive font-medium" : ""
                  }`}>
                    {renderMessageContent(message)}
                  </div>
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
              ref={inputRef}
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