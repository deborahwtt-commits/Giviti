import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import type { UserProfile } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Clock } from "lucide-react";

export default function ProfileOnboardingModal() {
  const [, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  const { data: profile, isLoading } = useQuery<UserProfile>({
    queryKey: ["/api/profile"],
    retry: (failureCount, error: any) => {
      if (error?.status === 404) return false;
      return failureCount < 3;
    },
  });

  useEffect(() => {
    if (!isLoading && !hasShown) {
      const shouldShow = !profile || !profile.isCompleted;
      if (shouldShow) {
        setIsOpen(true);
        setHasShown(true);
      }
    }
  }, [profile, isLoading, hasShown]);

  const handleStartNow = () => {
    setIsOpen(false);
    setLocation("/perfil");
  };

  const handleLater = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent data-testid="dialog-profile-onboarding" className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-center text-2xl">
            Vamos conhecer você melhor!
          </DialogTitle>
          <DialogDescription className="text-center text-base pt-2">
            Responda um questionário rápido para receber sugestões de presentes
            ainda mais personalizadas. São apenas 11 perguntas divertidas sobre
            suas preferências e estilo.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            size="lg"
            className="w-full"
            onClick={handleStartNow}
            data-testid="button-start-questionnaire"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Começar Agora
          </Button>
          <Button
            size="lg"
            variant="ghost"
            className="w-full"
            onClick={handleLater}
            data-testid="button-later-questionnaire"
          >
            <Clock className="w-4 h-4 mr-2" />
            Fazer Mais Tarde
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
