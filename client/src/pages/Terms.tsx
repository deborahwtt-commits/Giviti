import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => window.history.back()}
          className="mb-6"
          data-testid="button-back-terms"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl" data-testid="text-terms-title">Termos e Condições de Uso</CardTitle>
            <p className="text-sm text-muted-foreground">Data da última atualização: Fevereiro/2026</p>
          </CardHeader>
          <CardContent className="space-y-6" data-testid="terms-content">
            <p>Seja bem-vindo ao Giviti!</p>
            <p className="text-muted-foreground">
              Estes Termos e Condições de Uso ("Termos") regulam o acesso e a utilização do aplicativo Giviti ("Plataforma"), oferecido por DIG CONSULTORIA EM T.I LTDA, inscrita no CNPJ sob nº 58.248.596/0001-23, com sede em Rua Luiz de Camões 114, Santos/SP.
            </p>
            <p className="text-muted-foreground">
              Ao utilizar a Plataforma, você declara ter lido, compreendido e aceito estes Termos e a nossa Política de Privacidade, conforme a legislação brasileira vigente.
            </p>

            <div className="space-y-2">
              <h3 className="font-semibold text-lg">1. Objeto</h3>
              <p className="text-muted-foreground">
                O Giviti é uma plataforma digital que permite ao usuário organizar e registrar datas comemorativas, rolês, eventos e listas de presenteados, com base em suas preferências pessoais.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-lg">2. Cadastro e Conta do Usuário</h3>
              <p className="text-muted-foreground">
                Para utilizar o Giviti, o usuário deverá criar uma conta pessoal, fornecendo dados como:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Nome completo</li>
                <li>Data de nascimento</li>
                <li>E-mail</li>
                <li>Telefone</li>
                <li>Preferências de uso</li>
              </ul>
              <p className="text-muted-foreground mt-3">
                O usuário também poderá criar e armazenar dados dentro do app, como:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Datas comemorativas</li>
                <li>Eventos e rolês</li>
                <li>Listas de presenteados</li>
                <li>Notas ou registros personalizados</li>
              </ul>
              <p className="text-muted-foreground mt-3">
                O usuário compromete-se a fornecer apenas informações verdadeiras, exatas e atualizadas, e é responsável por manter a segurança de suas credenciais de acesso.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-lg">3. Coleta e Tratamento de Dados Pessoais</h3>
              <p className="text-muted-foreground">
                Ao utilizar o Giviti, o usuário autoriza o tratamento de seus dados pessoais para os seguintes fins:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Identificação e autenticação na Plataforma;</li>
                <li>Personalização da experiência de uso com base nas preferências fornecidas;</li>
                <li>Armazenamento de informações criadas pelo usuário dentro do app (eventos, presentes, rolês etc.);</li>
                <li>Comunicação sobre funcionalidades, atualizações ou ações promocionais;</li>
                <li>Cumprimento de obrigações legais ou regulatórias.</li>
              </ul>
              <p className="text-muted-foreground mt-3">Os dados tratados incluem:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Nome</li>
                <li>Data de nascimento</li>
                <li>E-mail</li>
                <li>Preferências pessoais (ex: categorias de interesse, tipos de rolês)</li>
                <li>Dados criados pelo usuário: datas comemorativas, listas de presenteados, rolês e eventos registrados no app</li>
              </ul>
              <p className="text-muted-foreground mt-3">A Giviti compromete-se a:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Tratar os dados conforme a LGPD (Lei nº 13.709/2018);</li>
                <li>Adotar medidas de segurança para proteger as informações armazenadas;</li>
                <li>Não compartilhar dados com terceiros sem consentimento expresso, exceto quando necessário para cumprimento legal ou ordem judicial.</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-lg">4. Direitos do Usuário</h3>
              <p className="text-muted-foreground">Nos termos da LGPD, o usuário tem direito a:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Confirmar a existência de tratamento de seus dados;</li>
                <li>Acessar, corrigir, excluir ou solicitar a portabilidade de seus dados;</li>
                <li>Revogar consentimento e solicitar anonimização ou bloqueio de dados desnecessários;</li>
                <li>Obter informações sobre compartilhamento de dados com terceiros.</li>
              </ul>
              <p className="text-muted-foreground mt-3">
                Tais solicitações podem ser feitas a qualquer momento através do e-mail: <strong>contato@giviti.com.br</strong>.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-lg">5. Obrigações do Usuário</h3>
              <p className="text-muted-foreground">O usuário compromete-se a:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Utilizar a Plataforma de forma ética e conforme a legislação brasileira;</li>
                <li>Fornecer apenas dados verdadeiros e de sua titularidade;</li>
                <li>Não praticar atividades ilícitas ou que comprometam a segurança da Plataforma;</li>
                <li>Não registrar informações sensíveis de terceiros sem o devido consentimento.</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-lg">6. Propriedade Intelectual</h3>
              <p className="text-muted-foreground">
                Todo o conteúdo da Plataforma (incluindo textos, logotipos, marca Giviti, funcionalidades e layout) é de propriedade exclusiva do Giviti ou licenciado, sendo protegido por leis de propriedade intelectual. É proibido reproduzir ou utilizar qualquer conteúdo sem autorização prévia e expressa.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-lg">7. Funcionalidade da Plataforma</h3>
              <p className="text-muted-foreground">
                A Giviti realiza seus melhores esforços para manter a Plataforma segura, funcional e disponível. No entanto, não se responsabiliza por:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Falhas técnicas, interrupções temporárias ou perda de dados por fatores externos;</li>
                <li>Informações inseridas incorretamente pelo próprio usuário;</li>
                <li>Uso indevido da conta por terceiros, decorrente de falhas na proteção das credenciais do usuário.</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-lg">8. Cancelamento de Conta e Exclusão de Dados</h3>
              <p className="text-muted-foreground">O usuário pode, a qualquer momento, solicitar:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Cancelamento de sua conta;</li>
                <li>Exclusão definitiva de seus dados pessoais.</li>
              </ul>
              <p className="text-muted-foreground mt-3">
                Solicitações devem ser enviadas para: <strong>contato@giviti.com.br</strong>.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-lg">9. Alterações nos Termos</h3>
              <p className="text-muted-foreground">
                A Giviti poderá atualizar estes Termos a qualquer momento, especialmente em caso de mudanças legais ou funcionais da Plataforma. A nova versão será publicada no app e entrará em vigor imediatamente após sua publicação. A continuidade do uso após tais alterações será considerada aceitação tácita.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-lg">10. Legislação Aplicável e Foro</h3>
              <p className="text-muted-foreground">
                Estes Termos são regidos pelas leis da República Federativa do Brasil. Para dirimir quaisquer controvérsias, fica eleito o foro da comarca de São Paulo/SP, com renúncia de qualquer outro, por mais privilegiado que seja.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t space-y-2">
              <h3 className="font-semibold text-lg">Dúvidas ou solicitações?</h3>
              <p className="text-muted-foreground">
                Entre em contato conosco: <strong>contato@giviti.com.br</strong>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
