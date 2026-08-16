import { motion } from "framer-motion";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex min-h-screen flex-col bg-background"
    >
      <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="flex size-20 items-center justify-center rounded-full bg-primary/10 text-primary"
        >
          <ShoppingBag className="size-9" />
        </motion.div>
        <p className="mt-6 font-serif text-7xl font-bold tracking-tight text-primary">
          404
        </p>
        <h1 className="mt-2 text-2xl font-semibold">Página não encontrada</h1>
        <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
          O endereço que você tentou acessar não existe ou foi movido. Que tal
          voltar para a vitrine?
        </p>
        <Button asChild className="mt-6 gap-2 rounded-full">
          <Link to="/">
            <ArrowLeft className="size-4" />
            Voltar para a loja
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}
