import {
  Cable,
  Cpu,
  Gem,
  Headphones,
  Home,
  Laptop,
  Shirt,
  Smartphone,
  Tablet,
  type LucideIcon,
} from "lucide-react";

/** Ícones por categoria, usados nos filtros e nos carrosséis da vitrine. */
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "acessórios para celular": Smartphone,
  "carregadores e cabos": Cable,
  "notebooks e computadores": Laptop,
  "áudio e fones de ouvido": Headphones,
  "smartphones e tablets": Tablet,
  "eletrônicos e gadgets": Cpu,
  "moda e acessórios": Shirt,
  "casa e decoração": Home,
  // categorias legadas da Fake Store API
  electronics: Cpu,
  jewelery: Gem,
  "men's clothing": Shirt,
  "women's clothing": Shirt,
};
