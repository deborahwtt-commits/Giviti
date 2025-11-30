# Giviti - Intelligent Gift Suggestion App

<p align="center">
  <strong>Simplifique suas escolhas de presentes com sugestões inteligentes e personalizadas</strong>
</p>

---

## Visao Geral

Giviti e um aplicativo web MVP projetado para simplificar a experiencia de dar presentes, gerenciando informacoes de presenteados e eventos, e fornecendo sugestoes personalizadas de presentes. O aplicativo garante que os usuarios nunca percam datas importantes e sempre encontrem o presente perfeito atraves de correspondencia inteligente de sugestoes, paginacao e filtragem multi-criterio.

### Principais Recursos

- **Sugestoes Personalizadas**: Correspondencia inteligente baseada em perfis e interesses dos presenteados
- **Gerenciamento de Eventos**: Rastreie datas importantes com opcoes de arquivamento e avanco
- **Gerenciamento de Presentes**: Salve e acompanhe presentes comprados e favoritados
- **Perfis Detalhados**: Questionarios de personalidade para usuarios e presenteados
- **Eventos Colaborativos (Roles)**: Amigo Secreto, Noites Tematicas e Presentes Coletivos
- **Painel Administrativo**: Modulo completo com controle de acesso baseado em funcoes
- **Sistema de Cupons**: Gerenciamento de cupons de desconto para sugestoes de presentes

---

## Stack Tecnologica

### Frontend
| Tecnologia | Versao | Proposito |
|------------|--------|-----------|
| React | 18.3.1 | Biblioteca UI |
| TypeScript | 5.6.3 | Tipagem estatica |
| Vite | 5.4.20 | Build tool e dev server |
| Wouter | 3.3.5 | Roteamento SPA |
| TanStack Query | 5.60.5 | Gerenciamento de estado do servidor |
| Tailwind CSS | 3.4.17 | Framework CSS utilitario |
| Shadcn/ui | - | Componentes UI (Radix UI) |
| Framer Motion | 11.13.1 | Animacoes |
| Recharts | 2.15.2 | Graficos e visualizacoes |

### Backend
| Tecnologia | Versao | Proposito |
|------------|--------|-----------|
| Express.js | 4.21.2 | Framework web |
| TypeScript | 5.6.3 | Tipagem estatica |
| Drizzle ORM | 0.39.1 | ORM type-safe |
| bcrypt | 6.0.0 | Hash de senhas |
| express-session | 1.18.1 | Gerenciamento de sessoes |
| Zod | 3.24.2 | Validacao de schemas |

### Banco de Dados
| Tecnologia | Proposito |
|------------|-----------|
| PostgreSQL | Banco de dados relacional |
| Neon | Hospedagem serverless |
| Drizzle Kit | Migracoes e push de schema |

---

## Arquitetura do Projeto

```
giviti/
├── client/                    # Frontend React
│   └── src/
│       ├── components/        # Componentes reutilizaveis
│       │   ├── ui/            # Componentes Shadcn/ui
│       │   ├── admin/         # Componentes do painel admin
│       │   └── examples/      # Componentes de exemplo
│       ├── pages/             # Paginas da aplicacao
│       ├── hooks/             # Hooks customizados
│       └── lib/               # Utilitarios e configuracoes
├── server/                    # Backend Express
│   ├── middleware/            # Middlewares (auth, etc)
│   ├── routes.ts              # Rotas principais da API
│   ├── adminRoutes.ts         # Rotas administrativas
│   ├── collabEventsRoutes.ts  # Rotas de eventos colaborativos
│   ├── storage.ts             # Camada de acesso a dados
│   ├── auth.ts                # Configuracao de autenticacao
│   └── db.ts                  # Configuracao do banco
├── shared/                    # Codigo compartilhado
│   └── schema.ts              # Schemas do banco (Drizzle)
├── attached_assets/           # Assets estaticos
└── scripts/                   # Scripts utilitarios
```

---

## Paginas da Aplicacao

### Paginas Publicas
| Rota | Componente | Descricao |
|------|------------|-----------|
| `/` | Landing.tsx | Pagina inicial com apresentacao do app |
| `/login` | - | Tela de login |
| `/register` | - | Tela de registro |

### Paginas Autenticadas
| Rota | Componente | Descricao |
|------|------------|-----------|
| `/dashboard` | Dashboard.tsx | Painel principal do usuario |
| `/presenteados` | Recipients.tsx | Gerenciamento de presenteados |
| `/eventos` | Events.tsx | Gerenciamento de eventos e roles |
| `/sugestoes` | Suggestions.tsx | Catalogo de sugestoes de presentes |
| `/presentes` | GiftManagement.tsx | Gerenciamento de presentes salvos |
| `/perfil` | Profile.tsx | Perfil e questionario do usuario |
| `/roles` | CollaborativeEvents.tsx | Lista de eventos colaborativos |
| `/role/:id` | RoleDetail.tsx | Detalhes de um role especifico |

### Paginas Administrativas
| Rota | Componente | Descricao |
|------|------------|-----------|
| `/admin` | Admin.tsx | Dashboard administrativo |
| `/admin/usuarios` | UserList.tsx | Gerenciamento de usuarios |
| `/admin/sugestoes` | AdminGiftSuggestions.tsx | CRUD de sugestoes de presentes |
| `/admin/categorias-tipos` | AdminGiftCategoriesTypes.tsx | Categorias e tipos de presentes |
| `/admin/categorias-noites` | ThemedNightCategories.tsx | Categorias de noites tematicas |

---

## Schema do Banco de Dados

### Tabelas Principais

#### users
```sql
- id: VARCHAR (UUID, PK)
- email: VARCHAR (unique, not null)
- passwordHash: VARCHAR (not null)
- firstName: VARCHAR
- lastName: VARCHAR
- profileImageUrl: VARCHAR
- role: VARCHAR (user, admin, manager, support, readonly)
- isActive: BOOLEAN (default: true)
- lastLoginAt: TIMESTAMP
- createdAt: TIMESTAMP
- updatedAt: TIMESTAMP
```

#### userProfiles
```sql
- id: VARCHAR (UUID, PK)
- userId: VARCHAR (FK -> users.id)
- personalityType: VARCHAR
- communicationStyle: VARCHAR
- shoppingPreference: VARCHAR
- giftGivingStyle: VARCHAR
- budgetRange: VARCHAR
- interests: TEXT[]
- cidade: VARCHAR
- estado: VARCHAR
- pais: VARCHAR
```

#### recipients
```sql
- id: VARCHAR (UUID, PK)
- userId: VARCHAR (FK -> users.id)
- name: VARCHAR (not null)
- age: INTEGER (not null)
- gender: VARCHAR
- zodiacSign: VARCHAR
- relationship: VARCHAR
- interests: TEXT[]
- createdAt: TIMESTAMP
- updatedAt: TIMESTAMP
```

#### recipientProfiles
```sql
- id: VARCHAR (UUID, PK)
- recipientId: VARCHAR (FK -> recipients.id)
- personalityType: VARCHAR
- hobbies: TEXT[]
- favoriteColors: TEXT[]
- clothingSize: VARCHAR
- shoeSize: VARCHAR
- allergies: TEXT[]
- restrictions: TEXT[]
- wishlist: TEXT[]
- giftsToAvoid: TEXT[]
- cidade: VARCHAR
- estado: VARCHAR
- pais: VARCHAR
```

#### events
```sql
- id: VARCHAR (UUID, PK)
- userId: VARCHAR (FK -> users.id)
- recipientId: VARCHAR (FK -> recipients.id)
- eventType: VARCHAR (not null)
- eventName: VARCHAR
- eventDate: DATE (not null)
- archived: BOOLEAN (default: false)
- createdAt: TIMESTAMP
- updatedAt: TIMESTAMP
```

#### giftSuggestions
```sql
- id: VARCHAR (UUID, PK)
- name: VARCHAR (not null)
- description: TEXT (not null)
- imageUrl: TEXT (not null)
- price: NUMERIC(10,2) (not null)
- category: VARCHAR (not null)
- giftTypeId: VARCHAR (FK -> giftTypes.id)
- tags: TEXT[]
- priority: INTEGER (1, 2, 3 ou null)
- productUrl: TEXT
- cupom: VARCHAR
- validadeCupom: DATE
- createdAt: TIMESTAMP
```

#### giftCategories
```sql
- id: VARCHAR (UUID, PK)
- name: VARCHAR (not null, unique)
- description: TEXT
- color: VARCHAR (hex color)
- isActive: BOOLEAN (default: true)
- createdAt: TIMESTAMP
```

#### giftTypes
```sql
- id: VARCHAR (UUID, PK)
- name: VARCHAR (not null, unique)
- description: TEXT
- isActive: BOOLEAN (default: true)
- createdAt: TIMESTAMP
```

#### userGifts
```sql
- id: VARCHAR (UUID, PK)
- userId: VARCHAR (FK -> users.id)
- recipientId: VARCHAR (FK -> recipients.id)
- eventId: VARCHAR (FK -> events.id)
- suggestionId: VARCHAR (FK -> giftSuggestions.id)
- name: VARCHAR (not null)
- description: TEXT
- imageUrl: TEXT
- price: NUMERIC(10,2)
- isFavorite: BOOLEAN (default: false)
- isPurchased: BOOLEAN (default: false)
- purchasedAt: TIMESTAMP
- createdAt: TIMESTAMP
```

### Tabelas de Eventos Colaborativos

#### collaborativeEvents
```sql
- id: VARCHAR (UUID, PK)
- ownerId: VARCHAR (FK -> users.id)
- name: VARCHAR (not null)
- eventType: VARCHAR (secret_santa, themed_night, collective_gift)
- eventDate: TIMESTAMP
- location: VARCHAR
- description: TEXT
- themedNightCategoryId: VARCHAR (FK -> themedNightCategories.id)
- isPublic: BOOLEAN (default: false)
- status: VARCHAR (draft, active, completed, cancelled)
- typeSpecificData: JSONB
- createdAt: TIMESTAMP
- updatedAt: TIMESTAMP
```

#### collaborativeEventParticipants
```sql
- id: VARCHAR (UUID, PK)
- eventId: VARCHAR (FK -> collaborativeEvents.id)
- userId: VARCHAR (FK -> users.id)
- email: VARCHAR
- name: VARCHAR
- role: VARCHAR (owner, admin, participant)
- status: VARCHAR (pending, confirmed, declined)
- joinedAt: TIMESTAMP
```

#### secretSantaPairs
```sql
- id: VARCHAR (UUID, PK)
- eventId: VARCHAR (FK -> collaborativeEvents.id)
- giverParticipantId: VARCHAR (FK)
- receiverParticipantId: VARCHAR (FK)
- isRevealed: BOOLEAN (default: false)
- createdAt: TIMESTAMP
```

#### collectiveGiftContributions
```sql
- id: VARCHAR (UUID, PK)
- eventId: VARCHAR (FK -> collaborativeEvents.id)
- participantId: VARCHAR (FK)
- amount: NUMERIC(10,2) (not null)
- isPaid: BOOLEAN (default: false)
- paidAt: TIMESTAMP
- createdAt: TIMESTAMP
```

#### themedNightCategories
```sql
- id: VARCHAR (UUID, PK)
- name: VARCHAR (not null, unique)
- description: TEXT
- activitySuggestions: TEXT[]
- isActive: BOOLEAN (default: true)
- createdAt: TIMESTAMP
```

---

## API Endpoints

### Autenticacao
| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| POST | `/api/auth/register` | Registrar novo usuario |
| POST | `/api/auth/login` | Login de usuario |
| POST | `/api/auth/logout` | Logout de usuario |
| GET | `/api/auth/user` | Obter usuario autenticado |

### Presenteados
| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| GET | `/api/recipients` | Listar presenteados do usuario |
| POST | `/api/recipients` | Criar novo presenteado |
| GET | `/api/recipients/:id` | Obter presenteado por ID |
| PUT | `/api/recipients/:id` | Atualizar presenteado |
| DELETE | `/api/recipients/:id` | Excluir presenteado |
| GET | `/api/recipients/:id/profile` | Obter perfil detalhado |
| POST | `/api/recipients/:id/profile` | Salvar perfil detalhado |

### Eventos
| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| GET | `/api/events` | Listar eventos do usuario |
| POST | `/api/events` | Criar novo evento |
| GET | `/api/events/:id` | Obter evento por ID |
| PUT | `/api/events/:id` | Atualizar evento |
| DELETE | `/api/events/:id` | Excluir evento |
| PATCH | `/api/events/:id/archive` | Arquivar evento |
| PATCH | `/api/events/:id/advance` | Avancar evento para proximo ano |

### Sugestoes de Presentes
| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| GET | `/api/suggestions` | Listar sugestoes (com filtros) |
| GET | `/api/sugestoes-auto` | Sugestoes automaticas por presenteado |
| POST | `/api/clicks` | Registrar clique em produto |

### Presentes do Usuario
| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| GET | `/api/gifts` | Listar presentes salvos |
| POST | `/api/gifts` | Salvar novo presente |
| PUT | `/api/gifts/:id` | Atualizar presente |
| DELETE | `/api/gifts/:id` | Excluir presente |

### Perfil do Usuario
| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| GET | `/api/profile` | Obter perfil do usuario |
| POST | `/api/profile` | Salvar/atualizar perfil |

### Estatisticas
| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| GET | `/api/stats` | Estatisticas do usuario |

### Eventos Colaborativos (Roles)
| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| GET | `/api/collaborative-events` | Listar roles do usuario |
| POST | `/api/collaborative-events` | Criar novo role |
| GET | `/api/collaborative-events/:id` | Obter role por ID |
| PUT | `/api/collaborative-events/:id` | Atualizar role |
| DELETE | `/api/collaborative-events/:id` | Excluir role |
| POST | `/api/collaborative-events/:id/draw` | Realizar sorteio (Amigo Secreto) |
| GET | `/api/collaborative-events/:id/my-pair` | Ver par sorteado |

### Administracao
| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| GET | `/api/admin/users` | Listar todos usuarios |
| POST | `/api/admin/users` | Criar usuario |
| PUT | `/api/admin/users/:id` | Atualizar usuario |
| DELETE | `/api/admin/users/:id` | Excluir usuario |
| GET | `/api/admin/suggestions` | Listar sugestoes (admin) |
| POST | `/api/admin/suggestions` | Criar sugestao |
| PUT | `/api/admin/suggestions/:id` | Atualizar sugestao |
| DELETE | `/api/admin/suggestions/:id` | Excluir sugestao |
| GET | `/api/admin/categories` | Listar categorias |
| POST | `/api/admin/categories` | Criar categoria |
| GET | `/api/admin/types` | Listar tipos |
| POST | `/api/admin/types` | Criar tipo |
| GET | `/api/admin/stats` | Estatisticas do sistema |

---

## Sistema de Sugestoes Inteligentes

### Algoritmo de Auto-Sugestao
O sistema utiliza um algoritmo de duas etapas:

1. **Correspondencia Interna**: Busca no banco de dados interno por sugestoes que correspondam a:
   - Interesses do presenteado
   - Tags das sugestoes
   - Categorias relevantes
   - Faixa de orcamento

2. **Fallback Externo (Perplexity API)**: Se houver menos de 5 resultados internos e a API estiver configurada, busca sugestoes externas personalizadas.

### Filtragem Multi-Criterio
- **Por Presenteado**: Filtra baseado nos interesses cadastrados
- **Por Categoria**: Tecnologia, Casa & Decoracao, Moda, etc.
- **Por Orcamento**: Slider com faixa de R$50 a R$2.000
- **Ordenacao**: Por relevancia, preco ou prioridade

---

## Tipos de Eventos Colaborativos (Roles)

### Amigo Secreto (secret_santa)
- Gerenciamento de participantes
- Algoritmo de sorteio automatico
- Revelacao de pares
- Lista de desejos por participante

### Noite Tematica (themed_night)
- Categorias dinamicas (configuradas pelo admin)
- Sugestoes de atividades
- Localizacao e data do evento

### Presente Coletivo (collective_gift)
- Valor alvo do presente
- Contribuicoes individuais
- Status de pagamento
- Progresso visual

---

## Sistema de Roles de Usuario

| Role | Permissoes |
|------|------------|
| `user` | Acesso completo as funcionalidades do usuario |
| `admin` | Acesso total ao sistema, incluindo painel administrativo |
| `manager` | Gerenciamento de usuarios e conteudo |
| `support` | Visualizacao e suporte a usuarios |
| `readonly` | Apenas visualizacao no painel admin |

---

## Variaveis de Ambiente

```env
# Banco de Dados (obrigatorias)
DATABASE_URL=postgresql://...
PGHOST=...
PGPORT=5432
PGUSER=...
PGPASSWORD=...
PGDATABASE=...

# Sessao (obrigatoria)
SESSION_SECRET=sua-chave-secreta

# API Externa (opcional)
PERPLEXITY_API_KEY=sua-api-key
```

---

## Scripts Disponiveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento

# Build
npm run build        # Build para producao

# Producao
npm run start        # Inicia servidor de producao

# Banco de Dados
npm run db:push      # Sincroniza schema com banco

# Validacao
npm run check        # Verifica tipos TypeScript
```

---

## Guia de Desenvolvimento

### Pre-requisitos
- Node.js 18+
- PostgreSQL (ou conta Neon)

### Instalacao Local
```bash
# Clonar repositorio
git clone <repo-url>
cd giviti

# Instalar dependencias
npm install

# Configurar variaveis de ambiente
cp .env.example .env
# Editar .env com suas configuracoes

# Sincronizar banco de dados
npm run db:push

# Iniciar desenvolvimento
npm run dev
```

### Estrutura de Componentes

#### Componentes UI (Shadcn/ui)
Localizados em `client/src/components/ui/`:
- `button.tsx` - Botoes com variantes
- `card.tsx` - Cards com header, content, footer
- `dialog.tsx` - Modais e dialogs
- `form.tsx` - Formularios com react-hook-form
- `select.tsx` - Selects customizados
- `toast.tsx` - Notificacoes toast
- `sidebar.tsx` - Sidebar responsiva
- E muitos outros...

#### Componentes de Negocio
- `RecipientCard.tsx` - Card de presenteado
- `EventCard.tsx` - Card de evento
- `UnifiedEventCard.tsx` - Card unificado (eventos + roles)
- `GiftCard.tsx` - Card de sugestao de presente
- `AutoSuggestions.tsx` - Sugestoes automaticas
- `CreateRoleDialog.tsx` - Dialog de criacao de role
- `ProfileOnboardingModal.tsx` - Modal de onboarding

---

## Design System

### Cores (HSL)
O sistema utiliza variaveis CSS HSL para suporte a dark/light mode:
- `--primary`: Cor principal (candy pink)
- `--secondary`: Cor secundaria
- `--accent`: Cor de destaque
- `--background`: Fundo da aplicacao
- `--foreground`: Cor do texto
- `--muted`: Cores suaves
- `--destructive`: Cor de erro/remocao

### Tipografia
- **Primary**: Inter (400, 500, 600, 700)
- **Accent**: Sora (600, 700)

### Espacamento
Padrao Tailwind com primitivas: 2, 3, 4, 6, 8, 12, 16, 20, 24

### Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

---

## Boas Praticas

### Frontend
- Use TanStack Query para todas as requisicoes de dados
- Invalide queries apos mutacoes
- Use `data-testid` em elementos interativos
- Siga o padrao de componentes Shadcn/ui
- Mantenha componentes pequenos e focados

### Backend
- Valide todas as entradas com Zod
- Use a camada de storage para acesso ao banco
- Mantenha rotas finas, logica no storage
- Sempre verifique autorizacao do usuario

### Banco de Dados
- Nunca altere tipos de colunas ID existentes
- Use `npm run db:push` para sincronizar
- Mantenha schemas em `shared/schema.ts`

---

## Licenca

MIT License

---

## Contato

Para suporte ou duvidas, entre em contato com a equipe de desenvolvimento.
