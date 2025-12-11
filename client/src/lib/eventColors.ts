export const EVENT_CANDY_COLORS = {
  regular: {
    bg: "bg-pink-100 dark:bg-pink-950",
    border: "border-pink-300 dark:border-pink-700",
    icon: "text-pink-500 dark:text-pink-400",
    badge: "bg-pink-500 text-white",
    gradient: "from-pink-500/10 to-pink-500/5 border-pink-500/30"
  },
  secret_santa: {
    bg: "bg-emerald-100 dark:bg-emerald-950",
    border: "border-emerald-300 dark:border-emerald-700",
    icon: "text-emerald-500 dark:text-emerald-400",
    badge: "bg-emerald-500 text-white",
    gradient: "from-emerald-500/10 to-emerald-500/5 border-emerald-500/30"
  },
  themed_night: {
    bg: "bg-violet-100 dark:bg-violet-950",
    border: "border-violet-300 dark:border-violet-700",
    icon: "text-violet-500 dark:text-violet-400",
    badge: "bg-violet-500 text-white",
    gradient: "from-violet-500/10 to-violet-500/5 border-violet-500/30"
  },
  collective_gift: {
    bg: "bg-amber-100 dark:bg-amber-950",
    border: "border-amber-300 dark:border-amber-700",
    icon: "text-amber-500 dark:text-amber-400",
    badge: "bg-amber-500 text-white",
    gradient: "from-amber-500/10 to-amber-500/5 border-amber-500/30"
  }
} as const;

export type EventColorType = keyof typeof EVENT_CANDY_COLORS;

export function getEventColors(eventType?: string | null) {
  switch (eventType) {
    case 'secret_santa':
      return EVENT_CANDY_COLORS.secret_santa;
    case 'themed_night':
      return EVENT_CANDY_COLORS.themed_night;
    case 'collective_gift':
      return EVENT_CANDY_COLORS.collective_gift;
    default:
      return EVENT_CANDY_COLORS.regular;
  }
}

export function getRoleTypeLabel(eventType?: string | null): string {
  switch (eventType) {
    case 'secret_santa':
      return 'Amigo Secreto';
    case 'themed_night':
      return 'Noite Temática';
    case 'collective_gift':
      return 'Presente Coletivo';
    default:
      return 'Rolê';
  }
}
