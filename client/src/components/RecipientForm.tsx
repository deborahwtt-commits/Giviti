import { useState } from "react";
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
import { X } from "lucide-react";

interface RecipientFormProps {
  initialData?: {
    name: string;
    age: number;
    gender: string;
    zodiacSign: string;
    relationship: string;
    interests: string[];
  };
  onSubmit: (data: any) => void;
  onCancel: () => void;
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

const interestOptions = [
  "Tecnologia",
  "Games",
  "Música",
  "Esportes",
  "Leitura",
  "Culinária",
  "Viagens",
  "Fotografia",
  "Arte",
  "Moda",
  "Fitness",
  "Yoga",
  "Cinema",
  "Natureza",
];

export default function RecipientForm({
  initialData,
  onSubmit,
  onCancel,
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
      gender,
      zodiacSign,
      relationship,
      interests,
    };
    console.log("Form submitted:", data);
    onSubmit(data);
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
              onChange={(e) => setAge(e.target.value)}
              placeholder="Ex: 25"
              min="1"
              max="120"
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
        <h3 className="font-semibold text-lg text-foreground">Personalidade</h3>

        <div className="space-y-2">
          <Label htmlFor="zodiacSign">Signo</Label>
          <Select value={zodiacSign} onValueChange={setZodiacSign}>
            <SelectTrigger id="zodiacSign" data-testid="select-zodiac">
              <SelectValue placeholder="Selecione o signo" />
            </SelectTrigger>
            <SelectContent>
              {zodiacSigns.map((sign) => (
                <SelectItem key={sign} value={sign}>
                  {sign}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
          >
            <SelectTrigger id="interests" data-testid="select-interests">
              <SelectValue placeholder="Escolha um interesse" />
            </SelectTrigger>
            <SelectContent>
              {interestOptions
                .filter((opt) => !interests.includes(opt))
                .map((interest) => (
                  <SelectItem key={interest} value={interest}>
                    {interest}
                  </SelectItem>
                ))}
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

      <div className="flex gap-3 pt-4 border-t border-border">
        <Button
          type="submit"
          className="flex-1"
          data-testid="button-save-recipient"
        >
          Salvar Presenteado
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
