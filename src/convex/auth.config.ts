import type { AuthConfig } from "convex/server";

// Provedor de identidade federada da plataforma de hospedagem: tokens
// assinados (JWT RS256) validados via JWKS. O login próprio do portal usa
// e-mail/OTP + anônimo (ver src/convex/auth.ts); este provedor permite que
// quem já está autenticado na plataforma entre sem novo cadastro.
const federatedIssuer =
  process.env.VLY_CONVEX_AUTH_ISSUER ?? "https://freebuff.com";

export default {
  providers: [
    // Login padrão do Convex Auth para a conta do próprio portal ("Começar"
    // com e-mail/OTP ou convidado, ver src/convex/auth.ts). O deployment
    // emite seus próprios JWTs (iss = CONVEX_SITE_URL, sem header `kid`)
    // validados via descoberta OIDC em `${domain}/.well-known/openid-configuration`,
    // servida por auth.addHttpRoutes() em convex/http.ts. Não converter esta
    // entrada para `type: "customJwt"`: esse caminho rejeita tokens sem
    // header `kid`, então o login nunca confirmaria e o RequireAuth voltaria
    // para /auth indefinidamente.
    {
      domain: process.env.CONVEX_SITE_URL!,
      applicationID: "convex",
    },
    {
      type: "customJwt",
      issuer: federatedIssuer,
      jwks: `${federatedIssuer}/api/web/.well-known/jwks.json`,
      applicationID: "vly-convex",
      algorithm: "RS256",
    },
  ],
} satisfies AuthConfig;
