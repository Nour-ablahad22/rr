import { Building2, Castle, Church, FerrisWheel, Flower2, Landmark, Mountain, Palette, type LucideIcon } from 'lucide-react';
import type { AttractionCategory } from '@shared/types';

export const CATEGORY_ICONS: Record<AttractionCategory, LucideIcon> = {
  'burgen-schloesser': Castle,
  museen: Palette,
  kirchen: Church,
  'historische-gebaeude': Landmark,
  'parks-gaerten': Flower2,
  natur: Mountain,
  architektur: Building2,
  freizeit: FerrisWheel,
};

/** Markerfarben je Kategorie – dezent, aber unterscheidbar */
export const CATEGORY_COLORS: Record<AttractionCategory, string> = {
  'burgen-schloesser': '#174A3B',
  museen: '#7A4E2D',
  kirchen: '#3D4E7A',
  'historische-gebaeude': '#8A6A2B',
  'parks-gaerten': '#3F7A3A',
  natur: '#2F6B5F',
  architektur: '#4A4F55',
  freizeit: '#A2513A',
};
