import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  UserPlus, 
  CalendarPlus, 
  Gift, 
  CheckCircle2, 
  Circle,
  ArrowRight 
} from "lucide-react";

interface GettingStartedWizardProps {
  hasRecipients: boolean;
  hasEvents: boolean;
  hasPurchasedGifts: boolean;
  onAddRecipient: () => void;
  onAddEvent: () => void;
  onExploreSuggestions: () => void;
}

export default function GettingStartedWizard({
  hasRecipients,
  hasEvents,
  hasPurchasedGifts,
  onAddRecipient,
  onAddEvent,
  onExploreSuggestions,
}: GettingStartedWizardProps) {
  const steps = [
    {
      id: 1,
      title: "Cadastre um presenteado",
      description: "Adicione pessoas especiais que você quer presentear",
      icon: UserPlus,
      completed: hasRecipients,
      action: onAddRecipient,
      actionLabel: "Adicionar presenteado",
    },
    {
      id: 2,
      title: "Crie um evento",
      description: "Marque aniversários, datas comemorativas e ocasiões especiais",
      icon: CalendarPlus,
      completed: hasEvents,
      action: onAddEvent,
      actionLabel: "Criar evento",
      disabled: !hasRecipients,
    },
    {
      id: 3,
      title: "Descubra sugestões",
      description: "Receba ideias personalizadas de presentes perfeitos",
      icon: Gift,
      completed: hasPurchasedGifts,
      action: onExploreSuggestions,
      actionLabel: "Ver sugestões",
      disabled: !hasEvents,
    },
  ];

  const completedCount = steps.filter(s => s.completed).length;
  const progress = (completedCount / steps.length) * 100;

  return (
    <Card className="border-dashed border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-heading font-semibold text-xl text-foreground">
              Primeiros Passos
            </h3>
            <p className="text-sm text-muted-foreground">
              Complete os passos abaixo para começar a usar o Giviti
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{completedCount}/{steps.length}</div>
            <div className="text-xs text-muted-foreground">concluídos</div>
          </div>
        </div>

        <div className="w-full bg-muted rounded-full h-2 mb-6">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="space-y-4">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isNext = !step.completed && steps.slice(0, index).every(s => s.completed);
            
            return (
              <div 
                key={step.id}
                className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
                  step.completed 
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800' 
                    : isNext
                      ? 'bg-card border border-primary/30 shadow-sm'
                      : 'bg-muted/30 border border-transparent opacity-60'
                }`}
              >
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  step.completed 
                    ? 'bg-emerald-500 text-white' 
                    : isNext 
                      ? 'bg-primary/20 text-primary'
                      : 'bg-muted text-muted-foreground'
                }`}>
                  {step.completed ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <StepIcon className="w-5 h-5" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      step.completed 
                        ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      Passo {step.id}
                    </span>
                    {isNext && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/20 text-primary animate-pulse">
                        Próximo
                      </span>
                    )}
                  </div>
                  <h4 className={`font-medium mt-1 ${step.completed ? 'text-emerald-700 dark:text-emerald-300 line-through' : 'text-foreground'}`}>
                    {step.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>

                {!step.completed && !step.disabled && (
                  <Button 
                    size="sm" 
                    onClick={step.action}
                    variant={isNext ? "default" : "outline"}
                    data-testid={`button-wizard-step-${step.id}`}
                  >
                    {step.actionLabel}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
