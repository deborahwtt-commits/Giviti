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
                      monte um <strong>Amigo Secreto</strong> com sorteio automático, planeje uma <strong>Noite Temática</strong> 
                      épica, ou junte o pessoal pra dar um <strong>Presente Coletivo</strong> daqueles. 
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
                      Moleza! Depois de criar sua conta, siga esses passinhos:
                    </p>
                    <ol className="list-decimal list-inside space-y-2 text-muted-foreground mb-3">
                      <li><strong>Complete seu perfil</strong> - Assim a gente te conhece melhor</li>
                      <li><strong>Cadastre seus presenteados</strong> - Quem são as pessoas especiais da sua vida</li>
                      <li><strong>Adicione as datas importantes</strong> - Aniversários, Natal, Dia das Mães...</li>
                      <li><strong>Explore as sugestões</strong> - E deixe a mágica acontecer!</li>
                    </ol>
                    <div className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg">
                      <Lightbulb className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">
                        <strong>Dica:</strong> O Dashboard mostra um checklist de primeiros passos pra te guiar. 
                        É como um tutorial, mas sem aquela voz chata explicando o óbvio.
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
                Presenteados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="cadastrar-presenteado">
                  <AccordionTrigger>Como cadastro um presenteado?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground mb-3">
                      Vá em <Badge variant="outline">Presenteados</Badge> no menu e clique no botão 
                      <Badge variant="secondary" className="mx-1">+ Novo Presenteado</Badge>. 
                      Preencha as informações básicas como nome e relacionamento.
                    </p>
                    <p className="text-muted-foreground mb-3">
                      Mas a mágica acontece quando você preenche o <strong>Perfil Detalhado</strong>! 
                      Lá você pode adicionar:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground mb-3 ml-2">
                      <li>Interesses e hobbies</li>
                      <li>Estilo de vida e personalidade</li>
                      <li>Faixa de preço preferida</li>
                      <li>Coisas que a pessoa NÃO gosta (super importante!)</li>
                    </ul>
                    <div className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg">
                      <Lightbulb className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">
                        <strong>Dica esperta:</strong> Use o campo "Presentes a Evitar" para anotar coisas tipo 
                        "NÃO gosta de perfumes" ou "Já tem 47 canecas". Seus presentes vão ficar muito mais assertivos!
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
                Datas Comemorativas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="criar-evento">
                  <AccordionTrigger>Como criar uma data comemorativa?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground mb-3">
                      Acesse <Badge variant="outline">Datas Comemorativas</Badge> no menu e clique em 
                      <Badge variant="secondary" className="mx-1">+ Nova Data</Badge>. 
                      Escolha o tipo (Aniversário, Natal, Dia dos Namorados...), a data, e vincule aos presenteados.
                    </p>
                    <p className="text-muted-foreground mb-3">
                      O Giviti vai te lembrar quando a data estiver chegando e mostrar sugestões 
                      personalizadas para cada pessoa vinculada ao evento!
                    </p>
                    <div className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg">
                      <Lightbulb className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">
                        <strong>Dica de mestre:</strong> Você pode vincular vários presenteados ao mesmo evento! 
                        Perfeito pro Natal da família toda.
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
                        <strong>Dica:</strong> No Dashboard você vê estatísticas de quanto já gastou em presentes. 
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
                      Para criar sua wishlist de aniversário:
                    </p>
                    <ol className="list-decimal list-inside space-y-2 text-muted-foreground mb-3">
                      <li>Vá em <Badge variant="outline">Datas Comemorativas</Badge></li>
                      <li>Crie uma data do tipo <strong>"Meu Aniversário"</strong></li>
                      <li>Clique em <Badge variant="secondary">Gerenciar Wishlist</Badge></li>
                      <li>Adicione os itens que você deseja (com link de onde comprar, se quiser)</li>
                      <li>Convide seus convidados por email ou compartilhe o link público</li>
                    </ol>
                    <div className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg">
                      <Lightbulb className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">
                        <strong>Dica esperta:</strong> Adicione itens em diferentes faixas de preço - 
                        assim todo mundo consegue participar, do amigo universitário ao tio ricão.
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
                          <strong>Noite Temática</strong>
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
                      Criar um Amigo Secreto é facinho:
                    </p>
                    <ol className="list-decimal list-inside space-y-2 text-muted-foreground mb-3">
                      <li>Vá em <Badge variant="outline">Planeje seu rolê!</Badge></li>
                      <li>Clique em <Badge variant="secondary">+ Novo Rolê</Badge></li>
                      <li>Escolha <strong>Amigo Secreto</strong></li>
                      <li>Defina a data e o valor sugerido</li>
                      <li>Adicione os participantes (por email)</li>
                      <li>Quando todos confirmarem, clique em <strong>Realizar Sorteio</strong></li>
                    </ol>
                    <p className="text-muted-foreground mb-3">
                      Cada participante recebe um email com o nome de quem vai presentear. 
                      Super discreto, zero chance de vazamento!
                    </p>
                    <div className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg">
                      <Lightbulb className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">
                        <strong>Dica de organizador expert:</strong> Defina uma data limite para confirmação. 
                        Assim você não fica esperando eternamente aquele amigo enrolado.
                      </span>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="noite-tematica">
                  <AccordionTrigger>Como organizo uma Noite Temática?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground mb-3">
                      Noites temáticas são perfeitas para reunir a galera com estilo:
                    </p>
                    <ol className="list-decimal list-inside space-y-2 text-muted-foreground mb-3">
                      <li>Crie um novo rolê do tipo <strong>Noite Temática</strong></li>
                      <li>Escolha uma categoria (Festa, Jantar, Cinema em Casa...)</li>
                      <li>Defina a data, local e descrição</li>
                      <li>Convide os participantes</li>
                      <li>Acompanhe as confirmações</li>
                    </ol>
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
                      Seu perfil não é só pra enfeitar! Ele serve pra:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-3 ml-2">
                      <li>
                        <strong>Horóscopo personalizado</strong> - Se você informar sua data de nascimento, 
                        ganha mensagens do horóscopo no Dashboard (sim, a gente sabe que você gosta!)
                      </li>
                      <li>
                        <strong>Configurar sua wishlist</strong> - Quando amigos te adicionam em eventos
                      </li>
                      <li>
                        <strong>Manter tudo organizado</strong> - Nome, foto, preferências...
                      </li>
                    </ul>
                    <div className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg">
                      <Lightbulb className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">
                        <strong>Dica zen:</strong> Complete o questionário de personalidade! 
                        É divertido e ajuda o sistema a te conhecer melhor.
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
