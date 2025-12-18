import { useState, useEffect, useCallback } from "react";
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
import { X, ChevronDown, Loader2, Check, UserCheck, UserX } from "lucide-react";
import RecipientProfileQuestionnaire from "./RecipientProfileQuestionnaire";
import type { GoogleProductCategory } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface RecipientFormProps {
  initialData?: {
    name: string;
    email?: string;
    linkedUserId?: string;
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

interface UserLookupResult {
  found: boolean;
  user?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  };
  profile?: {
    zodiacSign: string | null;
    gender: string | null;
    giftPreference: string | null;
    freeTimeActivity: string | null;
    musicalStyle: string | null;
    monthlyGiftPreference: string | null;
    surpriseReaction: string | null;
    giftPriority: string | null;
    giftGivingStyle: string | null;
    specialTalent: string | null;
    giftsToAvoid: string | null;
    interests: string[] | null;
    isCompleted: boolean | null;
  } | null;
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
  const [email, setEmail] = useState(initialData?.email || "");
  const [linkedUserId, setLinkedUserId] = useState(initialData?.linkedUserId || "");
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
  const [isLocalSubmitting, setIsLocalSubmitting] = useState(false);
  
  // Email lookup state
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupResult, setLookupResult] = useState<'found' | 'not_found' | null>(null);
  const [lookupDebounceTimer, setLookupDebounceTimer] = useState<NodeJS.Timeout | null>(null);

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

  // Email lookup function
  const lookupUserByEmail = useCallback(async (emailToLookup: string) => {
    if (!emailToLookup || !emailToLookup.includes('@')) {
      setLookupResult(null);
      setLinkedUserId("");
      return;
    }
    
    setIsLookingUp(true);
    try {
      const response = await fetch(`/api/users/lookup-by-email?email=${encodeURIComponent(emailToLookup)}`);
      const data: UserLookupResult = await response.json();
      
      if (data.found && data.user) {
        setLookupResult('found');
        setLinkedUserId(data.user.id);
        
        // Auto-fill name if empty and user has name
        if (!name && (data.user.firstName || data.user.lastName)) {
          setName(`${data.user.firstName || ''} ${data.user.lastName || ''}`.trim());
        }
        
        // Auto-fill profile data if available
        if (data.profile) {
          if (data.profile.zodiacSign) {
            setZodiacSign(data.profile.zodiacSign);
          }
          if (data.profile.gender) {
            // Map profile gender to form gender
            const genderMap: Record<string, string> = {
              'mulher': 'Feminino',
              'homem': 'Masculino',
              'nao-binarie': 'Outro',
            };
            setGender(genderMap[data.profile.gender] || data.profile.gender);
          }
          if (data.profile.interests && data.profile.interests.length > 0) {
            setInterests(data.profile.interests);
          }
          
          // Fill questionnaire data
          const newProfileData: any = {};
          if (data.profile.giftPreference) newProfileData.giftPreference = data.profile.giftPreference;
          if (data.profile.freeTimeActivity) newProfileData.freeTimeActivity = data.profile.freeTimeActivity;
          if (data.profile.musicalStyle) newProfileData.musicalStyle = data.profile.musicalStyle;
          if (data.profile.monthlyGiftPreference) newProfileData.monthlyGiftPreference = data.profile.monthlyGiftPreference;
          if (data.profile.surpriseReaction) newProfileData.surpriseReaction = data.profile.surpriseReaction;
          if (data.profile.giftPriority) newProfileData.giftPriority = data.profile.giftPriority;
          if (data.profile.giftGivingStyle) newProfileData.giftGivingStyle = data.profile.giftGivingStyle;
          if (data.profile.specialTalent) newProfileData.specialTalent = data.profile.specialTalent;
          if (data.profile.giftsToAvoid) newProfileData.giftsToAvoid = data.profile.giftsToAvoid;
          
          if (Object.keys(newProfileData).length > 0) {
            setProfileData(newProfileData);
            setShowQuestionnaire(true);
          }
        }
      } else {
        setLookupResult('not_found');
        setLinkedUserId("");
      }
    } catch (error) {
      console.error("Error looking up user:", error);
      setLookupResult(null);
      setLinkedUserId("");
    } finally {
      setIsLookingUp(false);
    }
  }, [name]);

  // Handle email change with debounce
  const handleEmailChange = (newEmail: string) => {
    setEmail(newEmail);
    setLookupResult(null);
    
    // Clear previous timer
    if (lookupDebounceTimer) {
      clearTimeout(lookupDebounceTimer);
    }
    
    // Set new timer for debounced lookup
    if (newEmail && newEmail.includes('@')) {
      const timer = setTimeout(() => {
        lookupUserByEmail(newEmail);
      }, 500);
      setLookupDebounceTimer(timer);
    } else {
      setLinkedUserId("");
    }
  };

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
    
    // Prevent multiple submissions
    if (isLocalSubmitting || isSubmitting) {
      return;
    }
    
    setIsLocalSubmitting(true);
    
    const data = {
      name,
      email: email || null,
      linkedUserId: linkedUserId || null,
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
          <Label htmlFor="email">Email (opcional)</Label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              placeholder="Ex: pessoa@email.com"
              data-testid="input-email"
              className={lookupResult === 'found' ? 'pr-10 border-green-500' : lookupResult === 'not_found' ? 'pr-10' : ''}
            />
            {isLookingUp && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            )}
            {!isLookingUp && lookupResult === 'found' && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <UserCheck className="w-4 h-4 text-green-500" />
              </div>
            )}
            {!isLookingUp && lookupResult === 'not_found' && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <UserX className="w-4 h-4 text-muted-foreground" />
              </div>
            )}
          </div>
          {lookupResult === 'found' && (
            <p className="text-xs text-green-600 flex items-center gap-1">
              <Check className="w-3 h-3" />
              Usuário Giviti encontrado! Preferências preenchidas automaticamente.
            </p>
          )}
          {lookupResult === 'not_found' && (
            <p className="text-xs text-muted-foreground">
              Email não cadastrado no Giviti.
            </p>
          )}
        </div>

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
          disabled={isLocalSubmitting || isSubmitting}
          data-testid="button-save-recipient"
        >
          {(isLocalSubmitting || isSubmitting) ? (
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
