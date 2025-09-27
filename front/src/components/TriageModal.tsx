import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { MessageSquarePlus, Clock, ArrowRight, Loader2 } from 'lucide-react';
import { 
  API_ENDPOINTS, 
  apiCall, 
  Conversation, 
  CreateChatRequest, 
  CreateChatResponse,
  ChatMessage 
} from '@/lib/api';

interface TriageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartChat: (sessionId: string, phoneNumber: string, existingMessages?: ChatMessage[]) => void;
}

enum ModalStep {
  PHONE_INPUT = 'phone_input',
  CONVERSATION_SELECT = 'conversation_select',
}

const TriageModal = ({ isOpen, onClose, onStartChat }: TriageModalProps) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<ModalStep>(ModalStep.PHONE_INPUT);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handlePhoneSubmit = async () => {
    if (!phoneNumber.trim()) {
      toast({
        title: 'Erro',
        description: 'Por favor, digite seu número de telefone',
        variant: 'destructive',
      });
      return;
    }

    // Simple phone validation (basic format check)
    const phoneRegex = /^\d{10,11}$/;
    if (!phoneRegex.test(phoneNumber.replace(/\D/g, ''))) {
      toast({
        title: 'Erro',
        description: 'Por favor, digite um número de telefone válido (10-11 dígitos)',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      // Get user conversations
      const userConversations = await apiCall<Conversation[]>(
        API_ENDPOINTS.GET_USER_CONVERSATIONS(phoneNumber),
        { method: 'GET' }
      );

      setConversations(userConversations);
      setCurrentStep(ModalStep.CONVERSATION_SELECT);
    } catch (error) {
      console.error('Erro ao buscar conversas:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível buscar suas conversas. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewConversation = async () => {
    setIsLoading(true);
    try {
      const requestBody: CreateChatRequest = {
        numero_paciente: phoneNumber,
      };

      const response = await apiCall<CreateChatResponse>(
        API_ENDPOINTS.CREATE_NEW_CHAT,
        {
          method: 'POST',
          body: JSON.stringify(requestBody),
        }
      );

      onStartChat(response.session_id, phoneNumber);
      handleClose();
    } catch (error) {
      console.error('Erro ao criar nova conversa:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível iniciar uma nova conversa. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueConversation = async (sessionId: string) => {
    setIsLoading(true);
    try {
      // Get existing messages for this session
      const messages = await apiCall<ChatMessage[]>(
        API_ENDPOINTS.GET_CHAT_MESSAGES(sessionId),
        { method: 'GET' }
      );

      onStartChat(sessionId, phoneNumber, messages);
      handleClose();
    } catch (error) {
      console.error('Erro ao carregar conversa:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar a conversa. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setCurrentStep(ModalStep.PHONE_INPUT);
    setPhoneNumber('');
    setConversations([]);
    setIsLoading(false);
    onClose();
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-numeric characters
    const numbers = value.replace(/\D/g, '');
    
    // Format as (XX) XXXXX-XXXX for 11 digits or (XX) XXXX-XXXX for 10 digits
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
    } else {
      return numbers.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquarePlus className="w-5 h-5 text-primary" />
            {currentStep === ModalStep.PHONE_INPUT ? 'Iniciar Triagem' : 'Suas Conversas'}
          </DialogTitle>
        </DialogHeader>

        {currentStep === ModalStep.PHONE_INPUT && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Número de telefone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(11) 99999-9999"
                value={phoneNumber}
                onChange={handlePhoneChange}
                maxLength={15}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Digite seu número para acessar suas conversas anteriores
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Cancelar
              </Button>
              <Button 
                onClick={handlePhoneSubmit} 
                className="flex-1"
                disabled={isLoading || !phoneNumber.trim()}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Buscando...
                  </>
                ) : (
                  <>
                    Prosseguir
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {currentStep === ModalStep.CONVERSATION_SELECT && (
          <div className="space-y-4">
            <div className="space-y-3">
              <Button
                onClick={handleNewConversation}
                variant="medical"
                className="w-full justify-start"
                disabled={isLoading}
              >
                <MessageSquarePlus className="w-4 h-4 mr-2" />
                Iniciar nova conversa
              </Button>

              {conversations.length > 0 && (
                <>
                  <div className="text-sm font-medium text-muted-foreground">
                    Ou continue uma conversa anterior:
                  </div>
                  
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {conversations.map((conversation) => (
                      <Card
                        key={conversation.session_id}
                        className="p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handleContinueConversation(conversation.session_id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                              <span className="text-muted-foreground">
                                {formatDate(conversation.timestamp)}
                              </span>
                            </div>
                            {conversation.last_message && (
                              <p className="text-sm text-foreground truncate mt-1">
                                {conversation.last_message}
                              </p>
                            )}
                          </div>
                          <ArrowRight className="w-4 h-4 text-muted-foreground ml-2 shrink-0" />
                        </div>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep(ModalStep.PHONE_INPUT)}
                className="flex-1"
                disabled={isLoading}
              >
                Voltar
              </Button>
            </div>

            {isLoading && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <span className="ml-2 text-sm text-muted-foreground">
                  Carregando...
                </span>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TriageModal;