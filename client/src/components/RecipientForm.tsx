import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { X, ChevronDown, Loader2 } from "lucide-react";
import RecipientProfileQuestionnaire from "./RecipientProfileQuestionnaire";
import type { GoogleProductCategory } from "@shared/schema";

interface RecipientFormProps {
  initialData?: {
    name: string;
    age: number;
    gender: string;
    zodiacSign: string;
    relationship: string;
    interests: string[];
  };
  initialProfileData?: any;
  onSubmit: (data: any, profile?: any) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const zodiacSigns = [
  "Áries",
  "Touro",
  "Gêmeos",
  "Câncer",
  "Leão",
  "Virgem",
  "Libra",
  "Escorpião",
  "Sagitário",
  "Capricórnio",
  "Aquário",
  "Peixes",
];

const relationships = [
  "Amigo(a)",
  "Parceiro(a)",
  "Pai/Mãe",
  "Irmão/Irmã",
  "Filho(a)",
  "Avô/Avó",
  "Tio/Tia",
  "Primo(a)",
  "Colega",
  "Outro",
];

export default function RecipientForm({
  initialData,
  initialProfileData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: RecipientFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [age, setAge] = useState(initialData?.age?.toString() || "");
  const [gender, setGender] = useState(initialData?.gender || "");
  const [zodiacSign, setZodiacSign] = useState(initialData?.zodiacSign || "");
  const [relationship, setRelationship] = useState(
    initialData?.relationship || ""
  );
  const [interests, setInterests] = useState<string[]>(
    initialData?.interests || []
  );
  const [newInterest, setNewInterest] = useState("");
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [profileData, setProfileData] = useState<any>({});

  // Fetch Google product categories from API to use as interest options
  const { data: googleCategories, isLoading: categoriesLoading } = useQuery<GoogleProductCategory[]>({
    queryKey: ["/api/google-categories"],
  });

  // Get Portuguese names from Google categories as interest options
  const interestOptions = googleCategories
    ?.filter(cat => cat.isActive)
    .map(cat => cat.namePtBr)
    .sort() || [];

  useEffect(() => {
    if (initialProfileData && Object.keys(initialProfileData).length > 0) {
      setProfileData(initialProfileData);
      setShowQuestionnaire(true);
    }
  }, [initialProfileData]);

  const handleAddInterest = (interest: string) => {
    if (interest && !interests.includes(interest)) {
      setInterests([...interests, interest]);
      setNewInterest("");
      console.log(`Added interest: ${interest}`);
    }
  };

  const handleRemoveInterest = (interest: string) => {
    setInterests(interests.filter((i) => i !== interest));
    console.log(`Removed interest: ${interest}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name,
      age: parseInt(age),
      gender: gender || null,
      zodiacSign: zodiacSign || null,
      relationship: relationship || null,
      interests,
    };
    // Check if any profile field is filled
    const hasProfileData = Object.values(profileData).some(value => value);
    const profile = hasProfileData ? { ...profileData, isCompleted: hasProfileData } : null;
    
    onSubmit(data, profile);
  };

  const handleProfileChange = (field: string, value: string) => {
    setProfileData((prev: any) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-4">
        <h3 className="font-semibold text-lg text-foreground">
          Informações Básicas
        </h3>

        <div className="space-y-2">
          <Label htmlFor="name">Nome completo</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: João Silva"
            required
            data-testid="input-name"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="age">Idade</Label>
            <Input
              id="age"
              type="number"
              value={age}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "" || /^[1-9]\d*$/.test(value)) {
                  const num = parseInt(value, 10);
                  if (value === "" || (num >= 1 && num <= 120)) {
                    setAge(value);
                  }
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "." || e.key === "," || e.key === "-" || e.key === "e" || e.key === "E") {
                  e.preventDefault();
                }
              }}
              placeholder="Ex: 25"
              min="1"
              max="120"
              step="1"
              required
              data-testid="input-age"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">Sexo</Label>
            <Select value={gender} onValueChange={setGender} required>
              <SelectTrigger id="gender" data-testid="select-gender">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Masculino">Masculino</SelectItem>
                <SelectItem value="Feminino">Feminino</SelectItem>
                <SelectItem value="Outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg text-foreground">Interesses</h3>

        <div className="space-y-2">
          <Label htmlFor="interests">Adicionar interesse</Label>
          <Select
            value={newInterest}
            onValueChange={(value) => {
              handleAddInterest(value);
            }}
            disabled={categoriesLoading}
          >
            <SelectTrigger id="interests" data-testid="select-interests">
              <SelectValue placeholder={categoriesLoading ? "Carregando categorias..." : "Escolha um interesse"} />
            </SelectTrigger>
            <SelectContent>
              {categoriesLoading ? (
                <div className="p-2 text-sm text-muted-foreground text-center flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Carregando...
                </div>
              ) : interestOptions.length === 0 ? (
                <div className="p-2 text-sm text-muted-foreground text-center">
                  Nenhuma categoria disponível
                </div>
              ) : (
                interestOptions
                  .filter((opt) => !interests.includes(opt))
                  .map((interest) => (
                    <SelectItem key={interest} value={interest}>
                      {interest}
                    </SelectItem>
                  ))
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap gap-2">
          {interests.map((interest) => (
            <Badge key={interest} variant="secondary" className="gap-1">
              {interest}
              <button
                type="button"
                onClick={() => handleRemoveInterest(interest)}
                className="hover-elevate rounded-full"
                data-testid={`button-remove-interest-${interest}`}
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg text-foreground">Relacionamento</h3>

        <div className="space-y-2">
          <Label htmlFor="relationship">Tipo de relacionamento</Label>
          <Select value={relationship} onValueChange={setRelationship} required>
            <SelectTrigger id="relationship" data-testid="select-relationship">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {relationships.map((rel) => (
                <SelectItem key={rel} value={rel}>
                  {rel}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Collapsible
        open={showQuestionnaire}
        onOpenChange={setShowQuestionnaire}
        className="space-y-4"
      >
        <CollapsibleTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="w-full flex items-center justify-between"
            data-testid="button-toggle-questionnaire"
          >
            <span className="font-medium">
              Questionário Detalhado (Opcional)
            </span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                showQuestionnaire ? "rotate-180" : ""
              }`}
            />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 border border-border rounded-lg p-6">
          <div className="space-y-2 mb-4">
            <h3 className="font-semibold text-lg text-foreground">
              Quem é essa pessoa sortuda?
            </h3>
            <p className="text-sm text-muted-foreground">
              Preencha o questionário abaixo para receber sugestões ainda mais
              personalizadas. Todos os campos são opcionais e podem ser alterados
              a qualquer momento.
            </p>
          </div>
          <RecipientProfileQuestionnaire
            formData={profileData}
            onChange={handleProfileChange}
          />
        </CollapsibleContent>
      </Collapsible>

      <div className="flex gap-3 pt-4 border-t border-border">
        <Button
          type="submit"
          className="flex-1"
          disabled={isSubmitting}
          data-testid="button-save-recipient"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            "Salvar Presenteado"
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          data-testid="button-cancel"
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
