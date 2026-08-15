import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { BadgePlus, ImagePlus, Loader2, Upload, X } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { RequireAuth } from "@/components/RequireAuth";
import { ErrorState } from "@/components/store/ErrorState";
import { useAuth } from "@/hooks/use-auth";
import { PRODUCT_TAGS } from "@/lib/product-tags";
import { PRODUCT_CATEGORIES } from "@/types/product";

/** Carrega o produto em modo de edição e cuida de permissões. */
function SellForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = (searchParams.get("editar") ?? null) as Id<"products"> | null;

  const product = useQuery(api.products.get, editId ? { id: editId } : "skip");

  if (editId && product === undefined) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6">
        <Skeleton className="h-8 w-64 rounded-lg" />
        <Skeleton className="mt-6 h-96 w-full rounded-2xl" />
      </div>
    );
  }

  const isOwner =
    product && (product.sellerId === user?._id || user?.role === "admin");

  if (editId && (!product || !isOwner)) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
        <ErrorState
          message="Você não tem permissão para editar este anúncio."
          onRetry={() => navigate("/conta?aba=anuncios")}
        />
      </div>
    );
  }

  return (
    <ListingForm
      key={editId ?? "novo"}
      initial={product ?? undefined}
      editId={editId}
      onDone={(productId) => navigate(`/produto/${productId}`)}
    />
  );
}

/** Formulário de criação/edição — estado inicializado a partir do produto. */
function ListingForm({
  initial,
  editId,
  onDone,
}: {
  initial: Doc<"products"> | undefined;
  editId: Id<"products"> | null;
  onDone: (id: Id<"products">) => void;
}) {
  const navigate = useNavigate();
  const createProduct = useMutation(api.products.create);
  const updateProduct = useMutation(api.products.update);
  const generateUploadUrl = useMutation(api.products.generateUploadUrl);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [price, setPrice] = useState(initial ? String(initial.price) : "");
  const [stock, setStock] = useState(initial ? String(initial.stock) : "");
  const [imageUrl, setImageUrl] = useState(initial?.image ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState(initial?.image ?? "");
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const [oldPrice, setOldPrice] = useState(
    initial?.oldPrice ? String(initial.oldPrice) : "",
  );
  const [submitting, setSubmitting] = useState(false);

  const toggleTag = (tag: string) =>
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setImageUrl("");
  };

  const handleUrlChange = (value: string) => {
    setImageUrl(value);
    setPreview(value);
    setFile(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error("Preencha título e descrição do anúncio.");
      return;
    }
    const parsedPrice = Number.parseFloat(price.replace(",", "."));
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      toast.error("Informe um preço válido.");
      return;
    }
    const parsedStock = Number.parseInt(stock || "0", 10);
    if (Number.isNaN(parsedStock) || parsedStock < 0) {
      toast.error("Informe um estoque válido.");
      return;
    }
    const parsedOldPrice = oldPrice.trim()
      ? Number.parseFloat(oldPrice.replace(",", "."))
      : undefined;
    if (
      parsedOldPrice !== undefined &&
      (!Number.isFinite(parsedOldPrice) || parsedOldPrice <= 0)
    ) {
      toast.error("Informe um preço antigo válido.");
      return;
    }
    if (parsedOldPrice !== undefined && parsedOldPrice <= parsedPrice) {
      toast.error("O preço antigo deve ser maior que o preço atual.");
      return;
    }

    setSubmitting(true);
    try {
      let finalImage = imageUrl;

      if (file) {
        const uploadUrl = await generateUploadUrl();
        const response = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        if (!response.ok) throw new Error("Não foi possível enviar a imagem.");
        const { storageId } = (await response.json()) as { storageId: string };
        finalImage = storageId;
      }

      if (!finalImage) {
        throw new Error("Adicione uma imagem ao anúncio.");
      }

      const args = {
        title: title.trim(),
        description: description.trim(),
        price: parsedPrice,
        category,
        image: finalImage,
        stock: parsedStock,
        oldPrice: parsedOldPrice,
        tags: tags.length > 0 ? tags : undefined,
      };

      if (editId && initial) {
        // Na edição, null remove o campo; undefined mantém o valor atual.
        await updateProduct({
          id: editId,
          ...args,
          oldPrice: parsedOldPrice ?? null,
          tags: tags.length > 0 ? tags : null,
        });
        toast.success("Anúncio atualizado com sucesso!");
        onDone(editId);
      } else {
        const newId = await createProduct(args);
        toast.success("Anúncio publicado! Ele já aparece no catálogo.");
        onDone(newId);
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Não foi possível salvar o anúncio.",
      );
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="font-serif text-3xl font-bold sm:text-4xl">
        {editId ? "Editar anúncio" : "Anunciar produto"}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {editId
          ? "Atualize as informações do seu produto e salve as alterações."
          : "Cadastre um produto para vender no portal — sem taxas, direto para a vitrine."}
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-6 rounded-2xl border border-border/70 bg-card p-6"
      >
        {/* Imagem */}
        <div>
          <Label className="mb-2 block">Imagem do produto</Label>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex size-40 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-border bg-muted/40">
              {preview ? (
                <img
                  src={preview}
                  alt="Prévia do anúncio"
                  className="h-full w-full object-contain"
                />
              ) : (
                <span className="flex flex-col items-center gap-2 text-xs text-muted-foreground">
                  <ImagePlus className="size-6" />
                  Sem imagem
                </span>
              )}
            </div>
            <div className="flex-1 space-y-3">
              <label
                className="flex cursor-pointer items-center justify-center gap-2 rounded-full border border-dashed border-border px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
              >
                <Upload className="size-4" />
                {file ? file.name : "Enviar imagem do computador"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
              {file && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="rounded-full text-muted-foreground"
                  onClick={() => {
                    setFile(null);
                    setPreview(imageUrl);
                  }}
                >
                  <X className="size-4" />
                  Remover arquivo
                </Button>
              )}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="h-px flex-1 bg-border" />
                ou use um link
                <span className="h-px flex-1 bg-border" />
              </div>
              <Input
                value={imageUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://exemplo.com/imagem.jpg"
                className="rounded-full"
              />
            </div>
          </div>
        </div>

        {/* Dados */}
        <div>
          <Label htmlFor="sell-title" className="mb-2 block">
            Título
          </Label>
          <Input
            id="sell-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex.: Capa de celular para iPhone 15 Pro"
            maxLength={120}
            required
          />
        </div>

        <div>
          <Label htmlFor="sell-description" className="mb-2 block">
            Descrição
          </Label>
          <Textarea
            id="sell-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descreva o produto: estado, material, compatibilidade, diferenciais…"
            rows={5}
            maxLength={1000}
            required
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label className="mb-2 block">Categoria</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger>
                <SelectValue placeholder="Escolha a categoria" />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="sell-price" className="mb-2 block">
              Preço (R$)
            </Label>
            <Input
              id="sell-price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              inputMode="decimal"
              required
            />
          </div>
          <div>
            <Label htmlFor="sell-stock" className="mb-2 block">
              Estoque (unidades)
            </Label>
            <Input
              id="sell-stock"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="10"
              inputMode="numeric"
            />
          </div>
        </div>

        {/* Selos de vitrine + preço antigo */}
        <div>
          <Label className="mb-2 block">Selos de vitrine</Label>
          <div className="flex flex-wrap gap-2">
            {PRODUCT_TAGS.map((tag) => (
              <label
                key={tag}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
              >
                <Checkbox
                  checked={tags.includes(tag)}
                  onCheckedChange={() => toggleTag(tag)}
                />
                {tag}
              </label>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            "Oferta" exibe o preço antigo riscado ao lado do preço atual;
            "Esgotando" indica estoque no fim.
          </p>
          {tags.includes("Oferta") && (
            <div className="mt-3 max-w-xs">
              <Label htmlFor="sell-oldprice" className="mb-2 block">
                Preço antigo (R$) — para riscar
              </Label>
              <Input
                id="sell-oldprice"
                value={oldPrice}
                onChange={(e) => setOldPrice(e.target.value)}
                placeholder="0.00"
                inputMode="decimal"
              />
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <Button
            type="submit"
            size="lg"
            className="rounded-full"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Salvando…
              </>
            ) : (
              <>
                <BadgePlus className="size-4" />
                {editId ? "Salvar alterações" : "Publicar anúncio"}
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="rounded-full"
            onClick={() => navigate(editId ? "/conta?aba=anuncios" : "/")}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function SellPage() {
  return (
    <RequireAuth>
      <StoreLayout>
        <SellForm />
      </StoreLayout>
    </RequireAuth>
  );
}
