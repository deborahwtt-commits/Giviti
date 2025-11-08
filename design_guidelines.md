# Giftly MVP - Design Guidelines

## Design Approach

**Reference-Based Approach** - Drawing inspiration from successful e-commerce and lifestyle platforms:
- **Etsy**: Personalized shopping experience, gift-focused presentation
- **Pinterest**: Visual discovery patterns, masonry-style cards
- **Notion**: Clean data organization for lists and events
- **Airbnb**: Modern card aesthetics, trust-building design

**Core Principles:**
1. Emotional resonance - gifting is personal, design should feel warm and celebratory
2. Visual clarity - users need to make quick, confident decisions
3. Delightful simplicity - remove friction from gift discovery
4. Trust and credibility - product presentation must inspire confidence

---

## Typography

**Font Families** (Google Fonts via CDN):
- **Primary**: Inter (400, 500, 600, 700) - Clean, modern, excellent readability
- **Accent**: Sora (600, 700) - Friendly rounded headers for warmth

**Hierarchy:**
- **Display Headers** (H1): Sora 700, text-4xl/text-5xl lg:text-6xl
- **Section Headers** (H2): Sora 600, text-3xl/text-4xl
- **Subsection Headers** (H3): Inter 600, text-xl/text-2xl
- **Card Titles**: Inter 600, text-lg
- **Body Text**: Inter 400, text-base
- **Metadata/Labels**: Inter 500, text-sm
- **Captions**: Inter 400, text-xs

---

## Layout System

**Spacing Primitives** (Tailwind units): 2, 3, 4, 6, 8, 12, 16, 20, 24

**Common Patterns:**
- Card padding: `p-6`
- Section padding (mobile): `py-12 px-4`
- Section padding (desktop): `py-20 px-6`
- Element gaps: `gap-4` or `gap-6`
- Container spacing: `space-y-8` or `space-y-12`

**Container Strategy:**
- Max-width containers: `max-w-7xl mx-auto`
- Card grids: `max-w-6xl mx-auto`
- Form containers: `max-w-2xl mx-auto`

---

## Component Library

### Navigation
**Primary Header**
- Fixed top navigation with blur backdrop
- Logo left, auth controls right
- Mobile: Hamburger menu with slide-in drawer
- Desktop: Horizontal navigation (Dashboard, Presenteados, Eventos, Sugestões)
- Badge indicators for upcoming events (e.g., "3 eventos próximos")

### Authentication Views
**Login/Register Pages**
- Split layout (desktop): Left side with Replit Auth component, right side with warm welcome message and app benefits
- Mobile: Stacked single column
- Social login buttons (Google, GitHub) with email/password option below
- Subtle decorative elements (gift icons, confetti patterns as background accents)

### Dashboard (Home)
**Hero Section** (70vh on desktop, natural height mobile)
- Warm welcome header with user's first name
- Quick stats row: Total presenteados, Próximos eventos, Presentes comprados
- Primary CTA: "Criar Novo Presenteado" (prominent button)
- Secondary CTA: "Explorar Sugestões"

**Upcoming Events Timeline**
- Horizontal scrolling cards (mobile), 2-column grid (tablet), 3-column (desktop)
- Each card: Event name, presenteado name, countdown ("Faltam 12 dias"), quick action button
- Empty state: Friendly illustration with "Adicione seu primeiro evento"

**Recent Gift Suggestions Section**
- Grid of 6-8 gift cards (2 cols mobile, 3 cols tablet, 4 cols desktop)
- Masonry-style layout for visual interest

### Presenteados (Gift Recipients) Management
**List View**
- Card grid layout (1 col mobile, 2 cols tablet, 3 cols desktop)
- Each card includes:
  - Profile placeholder (avatar with initials or icon)
  - Name (prominent)
  - Age, relationship type
  - Interest tags (max 3 visible, "+2 more" indicator)
  - Next upcoming event date
  - Action buttons: "Ver Sugestões", "Editar", "Excluir"
- FAB (Floating Action Button) for "+ Adicionar Presenteado"

**Detail/Edit Form**
- Single column, well-spaced form
- Grouped sections: "Informações Básicas", "Personalidade", "Interesses", "Relacionamento"
- Rich input components:
  - Text inputs with floating labels
  - Segmented control for gender selection
  - Date picker for birthday
  - Multi-select tags for interests/hobbies
  - Dropdown for relationship type
  - Zodiac sign selector with icons
- Save/Cancel buttons fixed at bottom (mobile), inline (desktop)

### Eventos (Events) Management
**Calendar-Inspired View**
- Month selector at top
- Timeline view showing events chronologically
- Each event card: Date badge (large, prominent), event type icon, presenteado link, actions
- Filter tabs: "Todos", "Este Mês", "Próximos 3 Meses"

**Create/Edit Event Modal**
- Overlay modal (centered, max-w-lg)
- Form fields: Event name, date picker, event type dropdown, associated presenteado selector
- Reminder toggle with options
- Submit button at bottom

### Sugestões (Gift Suggestions) - Core Feature
**Filter Panel** (Sidebar on desktop, drawer on mobile)
- Budget slider with min/max inputs
- Occasion selector (dropdown or button group)
- Interest checkboxes (based on presenteado profile)
- Sort options: "Mais Relevantes", "Menor Preço", "Maior Preço"

**Suggestion Results Grid**
- 1 column (mobile), 2 columns (tablet), 3 columns (desktop)
- **Gift Card Component** (Critical):
  - Square product image (aspect-ratio-square, object-cover)
  - Product name (2-line truncation)
  - Brief description (3-line truncation)
  - Price range badge
  - "Ver Detalhes" button
  - Heart icon for favoriting (top-right overlay on image)
  - Checkbox for "Marcar como Comprado" (bottom-left corner)
  - Subtle hover lift effect (transform scale)

**Suggestion Detail View**
- Modal or dedicated page
- Large product image gallery (if multiple images)
- Full description
- Price comparison section (mock data showing "best price found")
- "Comprar Agora" primary CTA with external link indicator
- "Adicionar à Lista" secondary action
- Related suggestions carousel at bottom

### Gerenciamento de Presentes (Gift Management)
**Tabbed Interface**
- Tabs: "A Comprar" (default), "Comprados", "Histórico Completo"

**Gift List Cards**
- Horizontal card layout with: Thumbnail image, gift name, recipient name, occasion, price, action buttons
- "A Comprar" tab: Checkbox to mark complete, "Ver Detalhes", "Remover"
- "Comprados" tab: Purchase date, recipient name, "Ver Novamente"
- Drag-to-reorder capability for "A Comprar" list

**Empty States**
- Illustration-based empty states for each tab
- Contextual CTAs: "Explorar Sugestões", "Adicionar Presenteado"

---

## Micro-interactions (Minimal)
- Button hover: Slight scale (1.02) and opacity shift
- Card hover: Subtle shadow elevation increase
- Form validation: Inline success checkmarks
- Loading states: Skeleton screens for card grids
- Toast notifications for actions (top-right, auto-dismiss)

---

## Responsive Breakpoints
- Mobile: base (< 768px)
- Tablet: md (768px - 1024px)
- Desktop: lg (1024px+)

**Key Responsive Shifts:**
- Navigation: Hamburger → Horizontal
- Grids: 1 col → 2 col → 3-4 col
- Sidebars: Drawer → Fixed panel
- Spacing: py-12 → py-20, px-4 → px-6

---

## Images

**Hero Section (Dashboard)**: Warm lifestyle image of gift-giving moment - friends celebrating, wrapped presents, joyful atmosphere (1200x600px minimum). Subtle overlay to ensure text readability.

**Empty State Illustrations**: Friendly, minimal illustrations for:
- No presenteados yet (person with gift box)
- No events scheduled (calendar with star)
- No suggestions saved (magnifying glass with gift)

**Gift Suggestion Cards**: Product images (square format, 400x400px minimum) with clean white/neutral backgrounds for professional presentation.

**Authentication Pages**: Decorative illustration on welcome side - abstract gift boxes, confetti patterns, celebration theme (800x1000px).

All images should have soft, inviting aesthetic aligned with pastel/candy color palette. Use placeholder services (Unsplash API) for MVP with proper attribution.