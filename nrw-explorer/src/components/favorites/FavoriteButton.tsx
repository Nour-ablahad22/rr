import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useFavorites } from '@/hooks/useFavorites';
import { cn } from '@/lib/utils';

export function FavoriteButton({ id, name, className, variant = 'overlay' }: { id: string; name: string; className?: string; variant?: 'overlay' | 'inline' }) {
  const { isFavorite, toggle } = useFavorites();
  const active = isFavorite(id);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(id);
      }}
      aria-pressed={active}
      aria-label={active ? `${name} aus den Favoriten entfernen` : `${name} zu den Favoriten hinzufügen`}
      title={active ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full transition-all duration-200',
        variant === 'overlay'
          ? 'h-10 w-10 bg-white/90 text-forest shadow-soft backdrop-blur hover:scale-105 hover:bg-white'
          : 'h-11 border border-forest/25 bg-white px-5 text-sm font-medium text-forest hover:border-forest',
        active && variant === 'inline' && 'border-forest bg-forest text-white',
        className,
      )}
    >
      <motion.span key={String(active)} initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 18 }}>
        <Heart className={cn('h-[18px] w-[18px]', active && (variant === 'overlay' ? 'fill-[#c0533f] text-[#c0533f]' : 'fill-white'))} />
      </motion.span>
      {variant === 'inline' && (active ? 'Gespeichert' : 'Merken')}
    </button>
  );
}
