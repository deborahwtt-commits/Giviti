import { motion } from "framer-motion";
import { Cake, PartyPopper, Sparkles, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface BirthdayBannerProps {
  userName: string;
  birthDate: string | Date | null | undefined;
}

function isBirthdayToday(birthDate: string | Date | null | undefined): boolean {
  if (!birthDate) return false;
  
  const today = new Date();
  
  // Handle string dates with timezone fix pattern (append T12:00:00 to avoid UTC midnight shifting)
  let birth: Date;
  if (typeof birthDate === 'string') {
    const dateStr = birthDate.includes('T') ? birthDate : `${birthDate}T12:00:00`;
    birth = new Date(dateStr);
  } else {
    birth = birthDate;
  }
  
  if (isNaN(birth.getTime())) return false;
  
  return birth.getDate() === today.getDate() && birth.getMonth() === today.getMonth();
}

function Confetti() {
  const colors = [
    "bg-yellow-400",
    "bg-pink-400",
    "bg-purple-400",
    "bg-blue-400",
    "bg-green-400",
    "bg-orange-400",
  ];

  const confettiPieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: Math.random() * 2,
    duration: 2 + Math.random() * 2,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: 4 + Math.random() * 8,
    rotation: Math.random() * 360,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {confettiPieces.map((piece) => (
        <motion.div
          key={piece.id}
          className={`absolute ${piece.color} rounded-sm`}
          style={{
            left: piece.left,
            width: piece.size,
            height: piece.size * 0.6,
            rotate: piece.rotation,
          }}
          initial={{ top: -20, opacity: 1 }}
          animate={{
            top: "120%",
            opacity: [1, 1, 0],
            rotate: piece.rotation + 360 * (Math.random() > 0.5 ? 1 : -1),
          }}
          transition={{
            duration: piece.duration,
            delay: piece.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

export default function BirthdayBanner({ userName, birthDate }: BirthdayBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const dismissedDate = localStorage.getItem("birthdayBannerDismissed");
    if (dismissedDate) {
      const today = new Date().toDateString();
      if (dismissedDate === today) {
        setDismissed(true);
      } else {
        localStorage.removeItem("birthdayBannerDismissed");
      }
    }

    const timer = setTimeout(() => setShowConfetti(false), 10000);
    return () => clearTimeout(timer);
  }, []);

  if (!isBirthdayToday(birthDate) || dismissed) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem("birthdayBannerDismissed", new Date().toDateString());
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className="relative overflow-hidden rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 p-1"
      data-testid="banner-birthday"
    >
      {showConfetti && <Confetti />}
      
      <div className="relative bg-gradient-to-r from-pink-500/90 via-purple-500/90 to-indigo-500/90 rounded-lg px-6 py-5">
        <Button
          size="icon"
          variant="ghost"
          className="absolute top-2 right-2 text-white/80"
          onClick={handleDismiss}
          data-testid="button-dismiss-birthday"
        >
          <X className="w-4 h-4" />
        </Button>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-white">
          <motion.div
            animate={{ 
              rotate: [0, -10, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity, 
              repeatDelay: 2 
            }}
          >
            <Cake className="w-12 h-12 sm:w-16 sm:h-16" />
          </motion.div>

          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
              <PartyPopper className="w-5 h-5" />
              <span 
                className="text-sm font-medium uppercase tracking-wider opacity-90"
                data-testid="text-birthday-subtitle"
              >
                Hoje é o seu dia!
              </span>
              <PartyPopper className="w-5 h-5 scale-x-[-1]" />
            </div>
            <h2 
              className="text-2xl sm:text-3xl font-bold"
              data-testid="text-birthday-title"
            >
              Feliz Aniversário, {userName}!
            </h2>
            <p 
              className="text-white/90 mt-1 flex items-center justify-center sm:justify-start gap-1"
              data-testid="text-birthday-message"
            >
              <Sparkles className="w-4 h-4" />
              Que seu dia seja repleto de alegria e presentes especiais
              <Sparkles className="w-4 h-4" />
            </p>
          </div>

          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity, 
              repeatDelay: 2,
              delay: 0.5
            }}
            className="hidden sm:block"
          >
            <Cake className="w-12 h-12 sm:w-16 sm:h-16" />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
