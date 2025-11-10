import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Gift, Heart, Calendar, Sparkles } from "lucide-react";
import heroImage from "@assets/generated_images/Hero_celebration_gift_exchange_b57996b1.png";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${heroImage})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-6 py-20 text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/90 backdrop-blur-sm flex items-center justify-center">
              <Gift className="w-9 h-9 text-primary-foreground" />
            </div>
          </div>

          <h1 className="font-heading font-bold text-5xl md:text-6xl lg:text-7xl text-white mb-6">
            Giviti - Presentes Perfeitos, Sempre
          </h1>

          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
            Nunca mais esqueça uma data importante ou fique sem ideias. 
            Descubra presentes personalizados para cada pessoa especial da sua vida.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="text-lg px-8 py-6 bg-primary border border-primary-border"
              onClick={() => window.location.href = "/api/login"}
              data-testid="button-login"
            >
              <Gift className="w-5 h-5 mr-2" />
              Começar Agora
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 bg-background/20 backdrop-blur-md border-white/30 text-white hover:bg-background/30"
              onClick={() => {
                document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
              }}
              data-testid="button-learn-more"
            >
              Saiba Mais
            </Button>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading font-semibold text-4xl md:text-5xl text-foreground mb-4">
              Tudo que você precisa para presentear com carinho
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Organize, planeje e encontre os presentes perfeitos com nossa plataforma inteligente
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <Card className="p-8 hover-elevate">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <Heart className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-2xl text-foreground mb-3">
                Perfis Detalhados
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Crie perfis completos com interesses, hobbies, idade e preferências. 
                Quanto mais detalhes, melhores as sugestões personalizadas.
              </p>
            </Card>

            <Card className="p-8 hover-elevate">
              <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-6">
                <Calendar className="w-7 h-7 text-accent-foreground" />
              </div>
              <h3 className="font-heading font-semibold text-2xl text-foreground mb-3">
                Eventos Importantes
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Cadastre aniversários, formaturas, casamentos e outras datas especiais. 
                Receba lembretes para nunca mais esquecer de presentear.
              </p>
            </Card>

            <Card className="p-8 hover-elevate">
              <div className="w-14 h-14 rounded-xl bg-chart-2/10 flex items-center justify-center mb-6">
                <Sparkles className="w-7 h-7 text-chart-2" />
              </div>
              <h3 className="font-heading font-semibold text-2xl text-foreground mb-3">
                Sugestões Inteligentes
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Explore nossa curadoria de presentes organizados por categoria, faixa de preço 
                e interesses. Encontre o presente ideal em minutos.
              </p>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 md:px-6 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading font-semibold text-4xl md:text-5xl text-foreground mb-6">
            Pronto para começar?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Entre agora e comece a organizar seus presenteados, eventos e descobrir sugestões personalizadas.
          </p>
          <Button
            size="lg"
            className="text-lg px-8 py-6"
            onClick={() => window.location.href = "/api/login"}
            data-testid="button-cta-login"
          >
            <Gift className="w-5 h-5 mr-2" />
            Entrar com Replit
          </Button>
        </div>
      </section>

      <footer className="py-8 px-4 md:px-6 border-t border-border">
        <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground">
          <p>© 2024 Giviti. Presentes Perfeitos, Sempre.</p>
        </div>
      </footer>
    </div>
  );
}
