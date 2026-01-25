import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { 
  HelpCircle, 
  Users, 
  Calendar, 
  Gift, 
  Cake, 
  PartyPopper, 
  User,
  Lightbulb,
  Heart,
  Sparkles,
  Target,
  Shuffle,
  Palette,
  Star
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
                      O Giviti é seu novo melhor amigo na hora de dar presentes! Sabe aquele momento de pânico quando 
                      você lembra que o aniversário é AMANHÃ e não faz ideia do que comprar? Pois é, acabou esse pesadelo. 
                    </p>
                    <p className="text-muted-foreground mb-3">
                      Aqui você cadastra as pessoas que ama (ou que precisa dar presente por educação, a gente não julga), 
                      as datas importantes, e nós te ajudamos com sugestões personalizadas baseadas no perfil de cada um.
                    </p>
                    <p className="text-muted-foreground mb-3">
                      E tem mais! Com os <strong>Rolês</strong>, você organiza eventos colaborativos com a galera: 
                      monte um <strong>Amigo Secreto</strong> com sorteio automático, planeje um <strong>Evento Temático</strong> épico, ou junte o pessoal pra dar um <strong>Presente Coletivo</strong> daqueles. 
                      Tudo integrado, com convites por email e acompanhamento das confirmações!
                    </p>
                    <div className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg">
                      <Lightbulb className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">
                        <strong>Dica de ouro:</strong> Quanto mais informações você adicionar sobre a pessoa, 
                        melhores serão as sugestões. É tipo stalking, mas do bem!
                      </span>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="como-comecar">
                  <AccordionTrigger>Como começo a usar?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground mb-3">
                      Moleza! Depois de criar sua conta, comece completando seu perfil, cadastre as pessoas 
                      especiais da sua vida, adicione as datas importantes e explore as sugestões de presentes. 
                      Se quiser, organize também um rolê colaborativo com a galera!
                    </p>
                    <div className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg">
                      <Lightbulb className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">
                        <strong>Dica:</strong> A página Início mostra um checklist pra te guiar nos primeiros passos.
                      </span>
                    </div>
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
                  <AccordionTrigger>Como cadastro uma pessoa?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground mb-3">
                      Na seção <Badge variant="outline">Pessoas</Badge> você pode adicionar quem você deseja presentear. 
                      Preencha as informações básicas e, se quiser sugestões mais certeiras, complete o perfil 
                      com interesses, estilo de vida e preferências.
                    </p>
                    <div className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg">
                      <Lightbulb className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">
                        <strong>Dica esperta:</strong> Use o campo "Presentes a Evitar" para anotar o que a pessoa 
                        não gosta. Seus presentes vão ficar muito mais assertivos!
                      </span>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="perfil-presenteado">
                  <AccordionTrigger>Para que serve o perfil detalhado?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground mb-3">
                      É aqui que você vira o Sherlock Holmes dos presentes! O perfil detalhado alimenta nosso 
                      algoritmo de sugestões. Quanto mais completo, mais certeiras são as recomendações.
                    </p>
                    <p className="text-muted-foreground mb-3">
                      Imagine que seu amigo gosta de <strong>tecnologia</strong>, é <strong>minimalista</strong>, 
                      e você marcou um orçamento de <strong>R$ 100-200</strong>. O sistema vai filtrar milhares 
                      de opções e te mostrar só as que fazem sentido!
                    </p>
                    <div className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg">
                      <Lightbulb className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">
                        <strong>Dica ninja:</strong> Pode atualizar o perfil a qualquer momento. 
                        Descobriu que sua mãe começou a fazer yoga? Adiciona lá!
                      </span>
                    </div>
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
                  <AccordionTrigger>Como criar uma data?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground mb-3">
                      Na seção <Badge variant="outline">Datas</Badge> você pode adicionar eventos importantes como 
                      aniversários, Natal, Dia dos Namorados e muito mais. Vincule as pessoas envolvidas e 
                      o Giviti mostra sugestões personalizadas quando a data estiver chegando!
                    </p>
                    <div className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg">
                      <Lightbulb className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">
                        <strong>Dica:</strong> Você pode vincular várias pessoas ao mesmo evento - perfeito pro Natal da família!
                      </span>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="evento-passou">
                  <AccordionTrigger>O que acontece quando a data passa?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground mb-3">
                      Quando uma data comemorativa passa, você tem duas opções:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-3 ml-2">
                      <li>
                        <strong>Avançar para o próximo ano</strong> - Perfeito para aniversários e datas que se repetem
                      </li>
                      <li>
                        <strong>Arquivar</strong> - Para eventos únicos que não vão se repetir
                      </li>
                    </ul>
                    <div className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg">
                      <Lightbulb className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">
                        <strong>Dica:</strong> Use "Avançar" para aniversários - assim você nunca mais esquece!
                      </span>
                    </div>
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
                    <p className="text-muted-foreground mb-3">
                      É aqui que a mágica acontece! Na página <Badge variant="outline">Presentes</Badge>, 
                      você pode explorar sugestões de duas formas:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-3 ml-2">
                      <li>
                        <strong>Por presenteado</strong> - Selecione a pessoa e veja sugestões 
                        baseadas no perfil dela
                      </li>
                      <li>
                        <strong>Por categoria</strong> - Explore por tipo (Tecnologia, Casa, Experiências...)
                      </li>
                      <li>
                        <strong>Por orçamento</strong> - Defina quanto quer gastar
                      </li>
                    </ul>
                    <p className="text-muted-foreground mb-3">
                      O sistema usa os interesses, idade, gênero e preferências do presenteado 
                      para ranquear as melhores opções primeiro!
                    </p>
                    <div className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg">
                      <Lightbulb className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">
                        <strong>Dica profissional:</strong> Combine os filtros! 
                        Ex: "Para a mamãe + Categoria Casa + Até R$150" = sugestões ultra-personalizadas.
                      </span>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="favoritar-comprar">
                  <AccordionTrigger>Como favorito ou marco como comprado?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground mb-3">
                      Em cada sugestão você vai encontrar dois botões especiais:
                    </p>
                    <div className="space-y-3 mb-3">
                      <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                        <Heart className="w-5 h-5 text-red-500" />
                        <div>
                          <strong>Favoritar</strong>
                          <p className="text-sm text-muted-foreground">
                            Salva a ideia pra pensar melhor depois. Você pode ver todos os favoritos em um lugar só!
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                        <Target className="w-5 h-5 text-green-500" />
                        <div>
                          <strong>Marcar como Comprado</strong>
                          <p className="text-sm text-muted-foreground">
                            Já comprou? Marca aí! Assim você acompanha seus gastos e não repete presente.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg">
                      <Lightbulb className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">
                        <strong>Dica:</strong> Na página Início você vê estatísticas de quanto já gastou em presentes. 
                        Ótimo pra manter o controle (ou pra justificar os excessos, depende do ponto de vista).
                      </span>
                    </div>
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
                  <AccordionTrigger>O que é a funcionalidade "Meu Aniversário"?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground mb-3">
                      Chegou a hora de receber presentes também! Com essa funcionalidade você pode:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-3 ml-2">
                      <li>Criar uma <strong>Wishlist</strong> com os presentes que você quer</li>
                      <li>Convidar amigos e família por email</li>
                      <li>Compartilhar um link público da sua lista</li>
                    </ul>
                    <p className="text-muted-foreground mb-3">
                      Nada de presente repetido ou aquela blusa que você nunca vai usar!
                    </p>
                    <div className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg">
                      <Lightbulb className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">
                        <strong>Dica descarada:</strong> Mande o link da wishlist "sem querer" no grupo da família 
                        umas semanas antes do seu aniversário. Funciona que é uma beleza!
                      </span>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="como-criar-wishlist">
                  <AccordionTrigger>Como crio minha wishlist?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground mb-3">
                      Na seção <Badge variant="outline">Datas</Badge>, crie um evento do tipo "Meu Aniversário" 
                      e acesse a opção de gerenciar wishlist. Adicione os itens que deseja, convide pessoas 
                      por email ou compartilhe o link público da sua lista!
                    </p>
                    <div className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg">
                      <Lightbulb className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">
                        <strong>Dica esperta:</strong> Adicione itens em diferentes faixas de preço - 
                        assim todo mundo consegue participar!
                      </span>
                    </div>
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
                      Rolês são eventos colaborativos onde a diversão é garantida! Temos três tipos:
                    </p>
                    <div className="space-y-3 mb-3">
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <Shuffle className="w-5 h-5 text-red-500 mt-0.5" />
                        <div>
                          <strong>Amigo Secreto</strong>
                          <p className="text-sm text-muted-foreground">
                            O clássico! Adicione participantes, defina o valor sugerido, e deixe o sistema fazer 
                            o sorteio automaticamente. Cada um recebe só o nome de quem vai presentear!
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <Palette className="w-5 h-5 text-purple-500 mt-0.5" />
                        <div>
                          <strong>Evento Temático</strong>
                          <p className="text-sm text-muted-foreground">
                            Organize eventos com temas divertidos! Festa a fantasia, noite de filmes, 
                            jantar italiano... O sistema tem várias sugestões pra te inspirar.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <Gift className="w-5 h-5 text-blue-500 mt-0.5" />
                        <div>
                          <strong>Presente Coletivo</strong>
                          <p className="text-sm text-muted-foreground">
                            Junte a galera pra dar um presentão! Defina o valor por pessoa, 
                            acompanhe quem já contribuiu, e surpreenda alguém especial.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg">
                      <Lightbulb className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">
                        <strong>Dica festeira:</strong> Convide os participantes por email direto pelo sistema - 
                        eles recebem todas as informações sem você precisar ficar mandando mensagem no grupo!
                      </span>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="amigo-secreto">
                  <AccordionTrigger>Como funciona o Amigo Secreto?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground mb-3">
                      Crie um rolê do tipo Amigo Secreto, defina a data e valor sugerido, e adicione os participantes. 
                      Quando todos confirmarem, realize o sorteio - cada um recebe um email discreto com o nome 
                      de quem vai presentear!
                    </p>
                    <div className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg">
                      <Lightbulb className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">
                        <strong>Dica:</strong> Defina uma data limite para confirmação pra não ficar esperando o amigo enrolado.
                      </span>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="wishlist-amigo-secreto">
                  <AccordionTrigger>O que é a lista de desejos do Amigo Secreto?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground mb-3">
                      A lista de desejos é uma forma de ajudar quem te tirou a escolher o presente perfeito! 
                      Cada participante pode adicionar até 10 itens que gostaria de ganhar.
                    </p>
                    <div className="space-y-3 mb-3">
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <Heart className="w-5 h-5 text-rose-500 mt-0.5" />
                        <div>
                          <strong>Crie sua lista</strong>
                          <p className="text-sm text-muted-foreground">
                            Adicione itens com nome, descrição, preço estimado e até link de onde comprar. 
                            Marque os mais desejados como prioridade alta!
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <Gift className="w-5 h-5 text-green-500 mt-0.5" />
                        <div>
                          <strong>Veja a lista de quem você tirou</strong>
                          <p className="text-sm text-muted-foreground">
                            Após o sorteio, no card "Seu Amigo Secreto" aparece a seção "O que seu amigo quer ganhar" 
                            com todos os itens da wishlist da pessoa.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg">
                      <Lightbulb className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">
                        <strong>Dica esperta:</strong> Adicione itens de diferentes faixas de preço - 
                        assim você dá opções pro seu amigo secreto sem colocar pressão!
                      </span>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="organizador-indicadores">
                  <AccordionTrigger>Como o organizador acompanha os participantes?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground mb-3">
                      O organizador tem uma visão especial com indicadores visuais ao lado de cada participante:
                    </p>
                    <div className="space-y-3 mb-3">
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <Users className="w-5 h-5 text-green-500 mt-0.5" />
                        <div>
                          <strong>Ícone de perfil</strong>
                          <p className="text-sm text-muted-foreground">
                            Prancheta verde = perfil preenchido (clique para ver as preferências). 
                            Documento cinza = perfil ainda não preenchido.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <Heart className="w-5 h-5 text-rose-500 mt-0.5" />
                        <div>
                          <strong>Ícone de lista de desejos</strong>
                          <p className="text-sm text-muted-foreground">
                            Coração rosa preenchido = tem itens na wishlist (passe o mouse para ver quantos). 
                            Coração cinza = wishlist vazia.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg">
                      <Lightbulb className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">
                        <strong>Dica de organização:</strong> Use esses indicadores para lembrar os participantes 
                        de completarem o perfil e adicionarem itens à wishlist antes do sorteio!
                      </span>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="noite-tematica">
                  <AccordionTrigger>Como organizo um Evento Temático?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground mb-3">
                      Crie um rolê do tipo Evento Temático, escolha a categoria (Festa, Jantar, Cinema em Casa...), 
                      defina os detalhes e convide os participantes. Acompanhe as confirmações direto no sistema!
                    </p>
                    <div className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg">
                      <Lightbulb className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">
                        <strong>Dica criativa:</strong> Use a descrição pra dar instruções especiais - 
                        tipo "venha de pijama" ou "traga sua bebida favorita"!
                      </span>
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
                  <AccordionTrigger>Por que devo completar meu perfil?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground mb-3">
                      Seu perfil ajuda o Giviti a te conhecer melhor! Com a data de nascimento você recebe 
                      mensagens do horóscopo na página Início. Também é útil quando amigos te adicionam em eventos 
                      e precisam saber suas preferências.
                    </p>
                    <div className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg">
                      <Lightbulb className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">
                        <strong>Dica zen:</strong> Complete o questionário de personalidade - é divertido!
                      </span>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="alterar-senha">
                  <AccordionTrigger>Como altero minha senha?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground mb-3">
                      Fácil! Vá no seu <Badge variant="outline">Perfil</Badge> (ícone de usuário no canto superior) 
                      e procure a seção de <strong>Alterar Senha</strong>. 
                      Digite sua senha atual e a nova senha duas vezes.
                    </p>
                    <p className="text-muted-foreground mb-3">
                      Esqueceu a senha? Na tela de login tem a opção de recuperação por email!
                    </p>
                    <div className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg">
                      <Lightbulb className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">
                        <strong>Dica de segurança:</strong> Use uma senha forte! 
                        "123456" ou "senha123" são praticamente um convite pra hackers.
                      </span>
                    </div>
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
