import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  HelpCircle, 
  Users, 
  Calendar, 
  Gift, 
  Cake, 
  PartyPopper, 
  User,
  Sparkles,
  Shuffle,
  Palette,
  Star,
  Plane
} from "lucide-react";

export default function FAQ() {
  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-4xl mx-auto px-4 md:px-6 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <HelpCircle className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-3" data-testid="faq-page-title">
            Central de Ajuda do Giviti
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Tudo que você precisa saber para se tornar um mestre da arte de presentear!
          </p>
        </div>

        <div className="space-y-8">
          
          <Card data-testid="faq-section-primeiros-passos">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                Primeiros Passos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="o-que-e">
                  <AccordionTrigger>O que é o Giviti?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground mb-3">
                      O Giviti é seu assistente para dar presentes! Cadastre as pessoas importantes, 
                      as datas especiais, e receba sugestões personalizadas baseadas no perfil de cada um.
                    </p>
                    <p className="text-muted-foreground">
                      Também dá pra organizar eventos colaborativos com a galera: Amigo Secreto com 
                      sorteio automático, Eventos Temáticos, Presentes Coletivos ou Viagens em Grupo.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="como-comecar">
                  <AccordionTrigger>Como começo a usar?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground">
                      É só explorar! Cadastre as pessoas que você quer presentear, adicione as datas 
                      importantes e deixe o Giviti te ajudar com sugestões personalizadas. A interface 
                      é intuitiva e te guia naturalmente.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <Card data-testid="faq-section-presenteados">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
                Pessoas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="cadastrar-presenteado">
                  <AccordionTrigger>O que são as Pessoas?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground">
                      São as pessoas que você quer presentear. Adicione informações sobre interesses, 
                      estilo de vida e preferências - quanto mais detalhes, melhores serão as sugestões 
                      de presentes que o Giviti vai te dar.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <Card data-testid="faq-section-eventos">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <Calendar className="w-5 h-5 text-orange-500" />
                </div>
                Datas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="criar-evento">
                  <AccordionTrigger>O que são as Datas?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground">
                      São os eventos importantes que você quer lembrar: aniversários, Natal, Dia dos Namorados 
                      e qualquer ocasião especial. Vincule as pessoas envolvidas e receba sugestões 
                      personalizadas quando a data se aproximar.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <Card data-testid="faq-section-sugestoes">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-pink-500/10">
                  <Gift className="w-5 h-5 text-pink-500" />
                </div>
                Sugestões de Presentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="como-funciona">
                  <AccordionTrigger>Como funcionam as sugestões?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground">
                      O Giviti analisa o perfil de cada pessoa - interesses, idade, preferências - e sugere 
                      presentes que fazem sentido. Você pode filtrar por categoria e orçamento, favoritar 
                      ideias para pensar depois e marcar o que já comprou para acompanhar seus gastos.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <Card data-testid="faq-section-aniversario">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Cake className="w-5 h-5 text-purple-500" />
                </div>
                Meu Aniversário
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="meu-aniversario">
                  <AccordionTrigger>O que é o Meu Aniversário?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground">
                      É a sua vez de receber presentes! Crie uma wishlist com o que você deseja, 
                      compartilhe com amigos e família, e evite aquele presente repetido ou que 
                      você nunca vai usar.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <Card data-testid="faq-section-roles">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <PartyPopper className="w-5 h-5 text-green-500" />
                </div>
                Planeje seu Rolê!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="o-que-sao-roles">
                  <AccordionTrigger>O que são os Rolês?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground mb-3">
                      São eventos colaborativos para curtir com a galera:
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <Shuffle className="w-5 h-5 text-red-500 mt-0.5" />
                        <div>
                          <strong>Amigo Secreto</strong>
                          <p className="text-sm text-muted-foreground">
                            O clássico com sorteio automático e lista de desejos de cada participante.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <Palette className="w-5 h-5 text-purple-500 mt-0.5" />
                        <div>
                          <strong>Evento Temático</strong>
                          <p className="text-sm text-muted-foreground">
                            Festas, jantares, noites de filme - organize encontros com temas divertidos.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <Gift className="w-5 h-5 text-blue-500 mt-0.5" />
                        <div>
                          <strong>Presente Coletivo</strong>
                          <p className="text-sm text-muted-foreground">
                            Junte a galera para dar um presentão especial para alguém.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <Plane className="w-5 h-5 text-teal-500 mt-0.5" />
                        <div>
                          <strong>Viagem em Grupo</strong>
                          <p className="text-sm text-muted-foreground">
                            Planeje viagens com amigos, organize custos e acompanhe confirmações.
                          </p>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <Card data-testid="faq-section-perfil">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-teal-500/10">
                  <User className="w-5 h-5 text-teal-500" />
                </div>
                Meu Perfil
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="perfil-importancia">
                  <AccordionTrigger>Para que serve meu perfil?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground">
                      Seu perfil ajuda o Giviti a te conhecer e personalizar sua experiência. 
                      Também é útil quando amigos te adicionam em eventos e precisam saber 
                      suas preferências para te presentear.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-primary/20">
                  <Star className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Ainda tem dúvidas?</h3>
                  <p className="text-muted-foreground">
                    Relaxa! O Giviti foi feito pra ser intuitivo. Mas se você ainda estiver perdido, 
                    explore as páginas - cada uma tem dicas e explicações. E lembre-se: 
                    o melhor presente é aquele dado com carinho (mas um presente bem escolhido ajuda muito!).
                  </p>
                  <p className="text-muted-foreground mt-2">
                    <strong>Boas festas e boas compras!</strong>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  );
}
