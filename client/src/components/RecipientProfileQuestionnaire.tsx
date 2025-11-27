import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { MapPin } from "lucide-react";

interface RecipientProfileQuestionnaireProps {
  formData: {
    ageRange?: string;
    gender?: string;
    zodiacSign?: string;
    relationship?: string;
    giftPreference?: string;
    lifestyle?: string;
    interestCategory?: string;
    giftReceptionStyle?: string;
    budgetRange?: string;
    occasion?: string;
    giftsToAvoid?: string;
    cidade?: string;
    estado?: string;
    pais?: string;
  };
  onChange: (field: string, value: string) => void;
}

function normalizeLocationInput(value: string): string {
  return value
    .replace(/\s{2,}/g, ' ')
    .replace(/^\s+/, '')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function isValidLocationText(value: string): boolean {
  if (!value || value.trim() === '') return true;
  return /^[a-zA-ZÀ-ÿ\s\-'.]+$/.test(value);
}

export default function RecipientProfileQuestionnaire({
  formData,
  onChange,
}: RecipientProfileQuestionnaireProps) {
  return (
    <div className="space-y-6">
      {/* Question 1: Gender */}
      <div className="space-y-3">
        <Label className="text-base font-medium">
          1. Como essa pessoa se identifica?
        </Label>
        <RadioGroup
          value={formData.gender || ""}
          onValueChange={(value) => onChange("gender", value)}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="mulher" id="gender-woman" />
            <Label htmlFor="gender-woman" className="font-normal cursor-pointer">
              Mulher
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="homem" id="gender-man" />
            <Label htmlFor="gender-man" className="font-normal cursor-pointer">
              Homem
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="nao-binarie" id="gender-nb" />
            <Label htmlFor="gender-nb" className="font-normal cursor-pointer">
              Não-binárie / Outro
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="prefiro-nao-informar" id="gender-pref-not" />
            <Label htmlFor="gender-pref-not" className="font-normal cursor-pointer">
              Prefiro não informar
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="nao-sei" id="gender-unknown" />
            <Label htmlFor="gender-unknown" className="font-normal cursor-pointer">
              Não sei
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Question 2: Zodiac Sign */}
      <div className="space-y-3">
        <Label className="text-base font-medium">
          2. Qual é o signo dela?
          <span className="block text-sm font-normal text-muted-foreground mt-1">
            (Se você não sabe, chute. O algoritmo gosta de astrologia.)
          </span>
        </Label>
        <Select
          value={formData.zodiacSign || ""}
          onValueChange={(value) => onChange("zodiacSign", value)}
        >
          <SelectTrigger data-testid="select-profile-zodiac">
            <SelectValue placeholder="Selecione o signo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="aries">Áries</SelectItem>
            <SelectItem value="touro">Touro</SelectItem>
            <SelectItem value="gemeos">Gêmeos</SelectItem>
            <SelectItem value="cancer">Câncer</SelectItem>
            <SelectItem value="leao">Leão</SelectItem>
            <SelectItem value="virgem">Virgem</SelectItem>
            <SelectItem value="libra">Libra</SelectItem>
            <SelectItem value="escorpiao">Escorpião</SelectItem>
            <SelectItem value="sagitario">Sagitário</SelectItem>
            <SelectItem value="capricornio">Capricórnio</SelectItem>
            <SelectItem value="aquario">Aquário</SelectItem>
            <SelectItem value="peixes">Peixes</SelectItem>
            <SelectItem value="nao-sei">Não sei</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Question 3: Gift Preference */}
      <div className="space-y-3">
        <Label className="text-base font-medium">
          3. Que tipo de presente essa pessoa costuma gostar?
        </Label>
        <RadioGroup
          value={formData.giftPreference || ""}
          onValueChange={(value) => onChange("giftPreference", value)}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="util-pratico" id="gift-practical" />
            <Label htmlFor="gift-practical" className="font-normal cursor-pointer">
              Algo útil e prático
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="criativo-diferente" id="gift-creative" />
            <Label htmlFor="gift-creative" className="font-normal cursor-pointer">
              Coisas criativas e diferentes
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="experiencias" id="gift-experiences" />
            <Label htmlFor="gift-experiences" className="font-normal cursor-pointer">
              Experiências (viagens, passeios, cursos)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="emocional-simbolico" id="gift-emotional" />
            <Label htmlFor="gift-emotional" className="font-normal cursor-pointer">
              Algo com valor emocional ou simbólico
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="sofisticado-marca" id="gift-sophisticated" />
            <Label htmlFor="gift-sophisticated" className="font-normal cursor-pointer">
              Presentes sofisticados ou de marca
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="nao-sei" id="gift-unknown" />
            <Label htmlFor="gift-unknown" className="font-normal cursor-pointer">
              Não faço ideia — me salva, Giviti!
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Question 4: Lifestyle */}
      <div className="space-y-3">
        <Label className="text-base font-medium">
          4. Como você descreveria o estilo de vida dessa pessoa?
        </Label>
        <RadioGroup
          value={formData.lifestyle || ""}
          onValueChange={(value) => onChange("lifestyle", value)}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="caseira" id="lifestyle-homebody" />
            <Label htmlFor="lifestyle-homebody" className="font-normal cursor-pointer">
              Caseira, fã de sofá e cobertor
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="aventureira" id="lifestyle-adventurous" />
            <Label htmlFor="lifestyle-adventurous" className="font-normal cursor-pointer">
              Aventureira, vive na rua, na trilha ou na estrada
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="estilosa" id="lifestyle-stylish" />
            <Label htmlFor="lifestyle-stylish" className="font-normal cursor-pointer">
              Estilosa e atualizada — tá sempre por dentro das tendências
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="cult" id="lifestyle-cultural" />
            <Label htmlFor="lifestyle-cultural" className="font-normal cursor-pointer">
              Cult — ama arte, leitura, música ou cinema de festival
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="workaholic" id="lifestyle-workaholic" />
            <Label htmlFor="lifestyle-workaholic" className="font-normal cursor-pointer">
              Workaholic que precisa de férias (mas não tira)
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Question 5: Interest Category */}
      <div className="space-y-3">
        <Label className="text-base font-medium">5. Ela curte mais:</Label>
        <RadioGroup
          value={formData.interestCategory || ""}
          onValueChange={(value) => onChange("interestCategory", value)}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="tecnologia" id="interest-tech" />
            <Label htmlFor="interest-tech" className="font-normal cursor-pointer">
              Tecnologia e gadgets
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="decoracao" id="interest-decor" />
            <Label htmlFor="interest-decor" className="font-normal cursor-pointer">
              Decoração e design
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="moda" id="interest-fashion" />
            <Label htmlFor="interest-fashion" className="font-normal cursor-pointer">
              Moda e acessórios
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="comidas-bebidas" id="interest-food" />
            <Label htmlFor="interest-food" className="font-normal cursor-pointer">
              Comidas e bebidas
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="livros-papelaria" id="interest-books" />
            <Label htmlFor="interest-books" className="font-normal cursor-pointer">
              Livros e papelaria
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="autoestima" id="interest-wellness" />
            <Label htmlFor="interest-wellness" className="font-normal cursor-pointer">
              Autoestima (spa, beleza, bem-estar)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="tudo" id="interest-all" />
            <Label htmlFor="interest-all" className="font-normal cursor-pointer">
              Tudo isso (complicou, hein!)
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Question 6: Gift Reception Style */}
      <div className="space-y-3">
        <Label className="text-base font-medium">
          6. Essa pessoa gosta de receber presentes…
        </Label>
        <RadioGroup
          value={formData.giftReceptionStyle || ""}
          onValueChange={(value) => onChange("giftReceptionStyle", value)}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="praticos" id="reception-practical" />
            <Label htmlFor="reception-practical" className="font-normal cursor-pointer">
              Práticos, que resolvem problemas
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="unicos" id="reception-unique" />
            <Label htmlFor="reception-unique" className="font-normal cursor-pointer">
              Únicos, que mostram que pensei nela
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="divertidos" id="reception-fun" />
            <Label htmlFor="reception-fun" className="font-normal cursor-pointer">
              Divertidos, que geram risadas
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="chiques" id="reception-fancy" />
            <Label htmlFor="reception-fancy" className="font-normal cursor-pointer">
              Chiques, que impressionam
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="experiencia" id="reception-experience" />
            <Label htmlFor="reception-experience" className="font-normal cursor-pointer">
              Em formato de experiência — ela não curte coisa física
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="nao-sei" id="reception-unknown" />
            <Label htmlFor="reception-unknown" className="font-normal cursor-pointer">
              Xi, não sei! Me ajude a acertar!
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Question 7: Budget Range */}
      <div className="space-y-3">
        <Label className="text-base font-medium">
          7. Quanto você pretende investir nesse presente?
          <span className="block text-sm font-normal text-muted-foreground mt-1">
            (Seja honesto — até o Giviti entende os boletos)
          </span>
        </Label>
        <RadioGroup
          value={formData.budgetRange || ""}
          onValueChange={(value) => onChange("budgetRange", value)}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="gratis" id="budget-free" />
            <Label htmlFor="budget-free" className="font-normal cursor-pointer">
              R$ 0 – Me ajuda a achar um presente grátis!
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="ate-50" id="budget-50" />
            <Label htmlFor="budget-50" className="font-normal cursor-pointer">
              Até R$ 50
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="50-150" id="budget-50-150" />
            <Label htmlFor="budget-50-150" className="font-normal cursor-pointer">
              R$ 50 a R$ 150
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="150-300" id="budget-150-300" />
            <Label htmlFor="budget-150-300" className="font-normal cursor-pointer">
              R$ 150 a R$ 300
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="300-600" id="budget-300-600" />
            <Label htmlFor="budget-300-600" className="font-normal cursor-pointer">
              R$ 300 a R$ 600
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="acima-600" id="budget-600plus" />
            <Label htmlFor="budget-600plus" className="font-normal cursor-pointer">
              Acima de R$ 600
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="depende" id="budget-depends" />
            <Label htmlFor="budget-depends" className="font-normal cursor-pointer">
              Depende… se for perfeito, a gente parcela!
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="sem-limite" id="budget-unlimited" />
            <Label htmlFor="budget-unlimited" className="font-normal cursor-pointer">
              O céu é o limite! Quero impressionar
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Question 8: Occasion */}
      <div className="space-y-3">
        <Label className="text-base font-medium">
          8. Quando é a ocasião do presente?
          <span className="block text-sm font-normal text-muted-foreground mt-1">
            (Porque cada data pede um tipo de surpresa especial)
          </span>
        </Label>
        <Select
          value={formData.occasion || ""}
          onValueChange={(value) => onChange("occasion", value)}
        >
          <SelectTrigger data-testid="select-profile-occasion">
            <SelectValue placeholder="Selecione a ocasião" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="aniversario">Aniversário</SelectItem>
            <SelectItem value="natal">Natal</SelectItem>
            <SelectItem value="ano-novo">Ano Novo</SelectItem>
            <SelectItem value="amigo-secreto">Amigo Secreto</SelectItem>
            <SelectItem value="dia-namorados">Dia dos Namorados</SelectItem>
            <SelectItem value="dia-maes">Dia das Mães</SelectItem>
            <SelectItem value="dia-pais">Dia dos Pais</SelectItem>
            <SelectItem value="dia-criancas">Dia das Crianças</SelectItem>
            <SelectItem value="dia-mulher">Dia da Mulher</SelectItem>
            <SelectItem value="dia-homem">Dia do Homem</SelectItem>
            <SelectItem value="dia-professor">Dia do Professor</SelectItem>
            <SelectItem value="dia-amigo">Dia do Amigo</SelectItem>
            <SelectItem value="dia-secretaria">Dia da Secretária</SelectItem>
            <SelectItem value="formatura">Formatura</SelectItem>
            <SelectItem value="promocao">Promoção no trabalho</SelectItem>
            <SelectItem value="bodas">Bodas ou aniversário de relacionamento</SelectItem>
            <SelectItem value="despedida">Despedida / mudança de cidade</SelectItem>
            <SelectItem value="bebe">Recém-nascido / chá de bebê</SelectItem>
            <SelectItem value="recuperacao">Recuperação / superação</SelectItem>
            <SelectItem value="so-porque-sim">"Só porque sim" — essa pessoa merece</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Question 9: Gifts to Avoid - OPTIONAL */}
      <div className="space-y-3">
        <Label htmlFor="gifts-to-avoid" className="text-base font-medium">
          9. Qual presente nunca sugerir para esta pessoa?
          <span className="block text-sm font-normal text-muted-foreground mt-1">
            (Não queremos cometer uma gafe, não é?) — Opcional
          </span>
        </Label>
        <Textarea
          id="gifts-to-avoid"
          data-testid="textarea-gifts-to-avoid"
          value={formData.giftsToAvoid || ""}
          onChange={(e) => onChange("giftsToAvoid", e.target.value)}
          placeholder="Ex: Nada relacionado a gatos, perfumes muito doces, roupas..."
          maxLength={255}
          className="resize-none"
          rows={3}
        />
        <p className="text-xs text-muted-foreground text-right">
          {formData.giftsToAvoid?.length || 0}/255 caracteres
        </p>
      </div>

      {/* Question 10: Location - OPTIONAL */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          <Label className="text-base font-medium">
            10. Onde essa pessoa mora?
            <span className="block text-sm font-normal text-muted-foreground mt-1">
              (Opcional — ajuda a sugerir presentes regionais ou experiências locais)
            </span>
          </Label>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cidade" className="text-sm font-medium">
              Cidade
            </Label>
            <Input
              id="cidade"
              data-testid="input-cidade"
              value={formData.cidade || ""}
              onChange={(e) => {
                const value = e.target.value;
                if (isValidLocationText(value)) {
                  onChange("cidade", normalizeLocationInput(value));
                }
              }}
              placeholder="Digite a cidade (opcional)"
              maxLength={100}
              className={!isValidLocationText(formData.cidade || "") ? "border-destructive" : ""}
            />
            {formData.cidade && !isValidLocationText(formData.cidade) && (
              <p className="text-xs text-destructive">Use apenas letras e espaços</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="estado" className="text-sm font-medium">
              Estado
            </Label>
            <Input
              id="estado"
              data-testid="input-estado"
              value={formData.estado || ""}
              onChange={(e) => {
                const value = e.target.value;
                if (isValidLocationText(value)) {
                  onChange("estado", normalizeLocationInput(value));
                }
              }}
              placeholder="Digite o estado (opcional)"
              maxLength={100}
              className={!isValidLocationText(formData.estado || "") ? "border-destructive" : ""}
            />
            {formData.estado && !isValidLocationText(formData.estado) && (
              <p className="text-xs text-destructive">Use apenas letras e espaços</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="pais" className="text-sm font-medium">
              País
            </Label>
            <Input
              id="pais"
              data-testid="input-pais"
              value={formData.pais || ""}
              onChange={(e) => {
                const value = e.target.value;
                if (isValidLocationText(value)) {
                  onChange("pais", normalizeLocationInput(value));
                }
              }}
              placeholder="Digite o país (opcional)"
              maxLength={100}
              className={!isValidLocationText(formData.pais || "") ? "border-destructive" : ""}
            />
            {formData.pais && !isValidLocationText(formData.pais) && (
              <p className="text-xs text-destructive">Use apenas letras e espaços</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
