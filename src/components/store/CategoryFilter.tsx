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
  Tag,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { categoryLabel } from "@/types/product";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
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

interface CategoryFilterProps {
  categories: string[];
  active: string | null;
  onSelect: (category: string | null) => void;
}

/** Filtro por categorias em forma de chips (menu superior). */
export function CategoryFilter({
  categories,
  active,
  onSelect,
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Chip
        active={active === null}
        icon={Tag}
        label="Todos"
        onClick={() => onSelect(null)}
      />
      {categories.map((cat) => {
        const Icon = CATEGORY_ICONS[cat.toLowerCase()] ?? Tag;
        return (
          <Chip
            key={cat}
            active={active === cat}
            icon={Icon}
            label={categoryLabel(cat)}
            onClick={() => onSelect(cat)}
          />
        );
      })}
    </div>
  );
}

function Chip({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all duration-200",
        active
          ? "border-primary bg-primary text-primary-foreground shadow-sm"
          : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground",
      )}
    >
      <Icon className="size-4" />
      {label}
    </button>
  );
}
