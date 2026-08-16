import { ArrowUpDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const SORT_OPTIONS = [
  { value: "relevance", label: "Relevância" },
  { value: "name-asc", label: "Nome (A–Z)" },
  { value: "name-desc", label: "Nome (Z–A)" },
  { value: "price-asc", label: "Menor preço" },
  { value: "price-desc", label: "Maior preço" },
  { value: "discount-desc", label: "Maior desconto" },
  { value: "rating-desc", label: "Melhor avaliados" },
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number]["value"];

interface SortSelectProps {
  value: string;
  onChange: (value: string) => void;
}

/** Ordenação por preço e avaliação. */
export function SortSelect({ value, onChange }: SortSelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full gap-2 sm:w-52">
        <ArrowUpDown className="size-4 text-muted-foreground" />
        <SelectValue placeholder="Ordenar por" />
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
