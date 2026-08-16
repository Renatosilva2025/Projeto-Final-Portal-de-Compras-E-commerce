import { useEffect, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";

/**
 * Garante que o primeiro usuário do portal vire administrador,
 * liberando o painel de gestão desde o início do projeto.
 */
export function AuthBootstrap() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const bootstrapAdmin = useMutation(api.users.bootstrapAdmin);
  const ran = useRef(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated && user && !ran.current) {
      ran.current = true;
      bootstrapAdmin().catch((err) =>
        console.warn("Não foi possível promover o administrador:", err),
      );
    }
  }, [isLoading, isAuthenticated, user, bootstrapAdmin]);

  return null;
}
