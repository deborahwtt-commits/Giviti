import {
  Users,
  Cake,
  PartyPopper,
  Heart,
  Baby,
  HeartHandshake,
  GraduationCap,
  Gift,
  Calendar,
  Star,
  Sparkles,
  Crown,
  Music,
  Camera,
  Home,
  Briefcase,
  Plane,
  Car,
  Trophy,
  Medal,
  Flag,
  Sun,
  Moon,
  Cloud,
  Flower2,
  TreePine,
  Snowflake,
  Flame,
  Gem,
  CircleDot,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Users,
  Cake,
  PartyPopper,
  Heart,
  Baby,
  HeartHandshake,
  GraduationCap,
  Gift,
  Calendar,
  Star,
  Sparkles,
  Crown,
  Music,
  Camera,
  Home,
  Briefcase,
  Plane,
  Car,
  Trophy,
  Medal,
  Flag,
  Sun,
  Moon,
  Cloud,
  Flower2,
  TreePine,
  Snowflake,
  Flame,
  Gem,
  CircleDot,
  Rings: CircleDot,
};

interface DynamicIconProps {
  name: string;
  className?: string;
  size?: number;
}

export function DynamicIcon({ name, className = "w-4 h-4", size }: DynamicIconProps) {
  const IconComponent = iconMap[name];
  
  if (!IconComponent) {
    return null;
  }
  
  return <IconComponent className={className} size={size} />;
}

export default DynamicIcon;
