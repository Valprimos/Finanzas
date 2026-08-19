import {
  ShoppingCart,
  Home,
  Car,
  PartyPopper,
  HeartPulse,
  Repeat,
  ShoppingBag,
  GraduationCap,
  MoreHorizontal,
  Wallet,
  Laptop,
  TrendingUp,
  Gift,
  Utensils,
  Plane,
  Dumbbell,
  Baby,
  Dog,
  Fuel,
  Smartphone,
  Film,
  Coffee,
  type LucideIcon,
} from "lucide-react";

export const MAPA_ICONOS: Record<string, LucideIcon> = {
  ShoppingCart,
  Home,
  Car,
  PartyPopper,
  HeartPulse,
  Repeat,
  ShoppingBag,
  GraduationCap,
  MoreHorizontal,
  Wallet,
  Laptop,
  TrendingUp,
  Gift,
  Utensils,
  Plane,
  Dumbbell,
  Baby,
  Dog,
  Fuel,
  Smartphone,
  Film,
  Coffee,
};

export const NOMBRES_ICONOS = Object.keys(MAPA_ICONOS);

export function obtenerIcono(nombre: string): LucideIcon {
  return MAPA_ICONOS[nombre] ?? MoreHorizontal;
}
