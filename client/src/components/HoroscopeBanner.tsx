import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Star } from "lucide-react";
import { Link } from "wouter";

interface HoroscopeResponse {
  available: boolean;
  message?: string;
  signo?: {
    nome: string;
    emoji: string | null;
  };
  mensagem?: string;
  semana?: number;
}

export default function HoroscopeBanner() {
  const { data: horoscope, isLoading } = useQuery<HoroscopeResponse>({
    queryKey: ["/api/horoscope"],
  });

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 border-purple-200/50 dark:border-purple-800/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/50 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-purple-100 dark:bg-purple-900/50 rounded animate-pulse w-1/4" />
              <div className="h-3 bg-purple-100 dark:bg-purple-900/50 rounded animate-pulse w-3/4" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!horoscope?.available) {
    return (
      <Card className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 border-purple-200/50 dark:border-purple-800/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
              <Star className="w-5 h-5 text-purple-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">
                {horoscope?.message || "Complete seu perfil com seu signo para receber sua mensagem semanal."}
              </p>
              <Link 
                href="/perfil" 
                className="text-xs text-purple-600 dark:text-purple-400 hover:underline mt-1 inline-block"
                data-testid="link-complete-profile-horoscope"
              >
                Completar perfil
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 border-purple-200/50 dark:border-purple-800/50 overflow-hidden"
      data-testid="horoscope-banner"
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl shrink-0">
            {horoscope.signo?.emoji || "✨"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium text-purple-700 dark:text-purple-300" data-testid="text-signo-nome">
                {horoscope.signo?.nome}
              </span>
              <span className="text-xs text-muted-foreground">
                Semana {horoscope.semana}
              </span>
            </div>
            <p className="text-sm text-foreground/90 leading-relaxed" data-testid="text-horoscope-mensagem">
              {horoscope.mensagem}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
