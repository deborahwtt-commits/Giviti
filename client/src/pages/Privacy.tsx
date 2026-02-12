import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => window.history.back()}
          className="mb-6"
          data-testid="button-back-privacy"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl" data-testid="text-privacy-title">Política de Privacidade</CardTitle>
            <p className="text-sm text-muted-foreground">Data da última atualização: Fevereiro/2026</p>
          </CardHeader>
          <CardContent className="space-y-6" data-testid="privacy-content">
            <p className="text-muted-foreground">
              Esta Política de Privacidade descreve como o Giviti coleta, utiliza, armazena e protege os dados pessoais dos usuários, garantindo a transparência no tratamento das informações em conformidade com a Lei Geral de Proteção de Dados (LGPD – Lei nº 13.709/2018).
            </p>
            <p className="text-muted-foreground">
              Ao utilizar o aplicativo Giviti, você declara estar ciente e de acordo com as práticas descritas nesta Política.
            </p>

            <div className="space-y-2">
              <h3 className="font-semibold text-lg">1. Controlador dos Dados</h3>
              <p className="text-muted-foreground">Responsável pelo tratamento dos dados:</p>
              <p className="text-muted-foreground">
                <strong>DIG CONSULTORIA EM T.I LTDA</strong>, inscrita no CNPJ sob nº 58.248.596/0001-23
              </p>
              <p className="text-muted-foreground">
                E-mail de contato: <strong>contato@giviti.com.br</strong>
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-lg">2. Dados Coletados</h3>
              <p className="text-muted-foreground">
                Durante o uso do aplicativo, os seguintes dados pessoais podem ser coletados e armazenados:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Nome completo</li>
                <li>Data de nascimento</li>
                <li>E-mail</li>
                <li>Telefone</li>
                <li>Preferências de uso (ex: categorias de interesse)</li>
              </ul>
              <p className="text-muted-foreground mt-3">Informações criadas pelo usuário dentro do app, como:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Datas comemorativas (ex: aniversários, casamentos)</li>
                <li>Lista de presenteados</li>
                <li>Eventos e rolês registrados</li>
                <li>Notas e conteúdos personalizados</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-lg">3. Finalidades do Tratamento</h3>
              <p className="text-muted-foreground">Seus dados são utilizados para:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Criar e manter sua conta na plataforma;</li>
                <li>Personalizar sua experiência com base em suas preferências;</li>
                <li>Permitir o registro e organização de eventos, rolês e presentes;</li>
                <li>Enviar comunicações sobre funcionalidades, lembretes e atualizações do app;</li>
                <li>Cumprir obrigações legais ou regulatórias.</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-lg">4. Compartilhamento de Dados</h3>
              <p className="text-muted-foreground">
                O Giviti não compartilha seus dados com terceiros sem seu consentimento, exceto nos seguintes casos:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Cumprimento de obrigações legais ou ordens judiciais;</li>
                <li>Necessidade de repasse técnico a prestadores de serviço para manutenção do app (com contratos de confidencialidade).</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-lg">5. Armazenamento e Segurança</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Os dados são armazenados em servidores seguros e protegidos por práticas atualizadas de segurança da informação;</li>
                <li>Implementamos medidas de proteção contra acessos não autorizados, destruição, perda, alteração ou divulgação indevida;</li>
                <li>O acesso aos dados é restrito apenas a profissionais autorizados, com base em princípios de necessidade e confidencialidade.</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-lg">6. Direitos do Titular de Dados</h3>
              <p className="text-muted-foreground">De acordo com a LGPD, você tem os seguintes direitos:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Confirmar a existência de tratamento;</li>
                <li>Acessar, corrigir, atualizar ou solicitar a exclusão dos seus dados;</li>
                <li>Revogar consentimento, quando aplicável;</li>
                <li>Solicitar anonimização ou portabilidade dos dados;</li>
                <li>Obter informações sobre eventuais compartilhamentos.</li>
              </ul>
              <p className="text-muted-foreground mt-3">
                Você pode exercer esses direitos cancelando sua conta no app ou enviando uma solicitação para: <strong>contato@giviti.com.br</strong>
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-lg">7. Retenção dos Dados</h3>
              <p className="text-muted-foreground">Seus dados serão mantidos enquanto:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Sua conta estiver ativa no Giviti;</li>
                <li>Houver necessidade para cumprir obrigações legais ou resguardar direitos;</li>
                <li>Não houver solicitação de exclusão pelo titular dos dados.</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-lg">8. Exclusão da Conta e dos Dados</h3>
              <p className="text-muted-foreground">
                O usuário pode, a qualquer momento, solicitar a exclusão total de sua conta e dos dados associados. Basta entrar em contato por e-mail: <strong>contato@giviti.com.br</strong>. O Giviti se compromete a excluir os dados no prazo legal, exceto em casos de obrigação legal de retenção.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-lg">9. Alterações na Política de Privacidade</h3>
              <p className="text-muted-foreground">
                Esta Política poderá ser atualizada periodicamente. Quaisquer alterações serão informadas no aplicativo e/ou por e-mail. Recomendamos que você revise esta Política regularmente.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t space-y-2">
              <h3 className="font-semibold text-lg">10. Contato</h3>
              <p className="text-muted-foreground">
                Se você tiver dúvidas, sugestões ou solicitações relacionadas ao tratamento dos seus dados, entre em contato com nosso Encarregado de Proteção de Dados (DPO): <strong>contato@giviti.com.br</strong>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
