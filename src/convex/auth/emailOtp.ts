import { Email } from "@convex-dev/auth/providers/Email";
import axios from "axios";
import { RandomReader, generateRandomString } from "@oslojs/crypto/random";

export const emailOtp = Email({
  id: "email-otp",
  maxAge: 60 * 15, // 15 minutes
  // This function can be asynchronous
  async generateVerificationToken() {
    const random: RandomReader = {
      read(bytes: Uint8Array) {
        crypto.getRandomValues(bytes);
      },
    };
    const alphabet = "0123456789";
    return generateRandomString(random, alphabet, 6);
  },
  async sendVerificationRequest({ identifier: email, token }) {
    const sendUrl = process.env.VLY_OTP_SEND_URL;
    const apiKey = process.env.VLY_OTP_API_KEY;

    if (!sendUrl || !apiKey) {
      throw new Error(
        "Provedor de e-mail OTP não configurado. Defina as variáveis VLY_OTP_SEND_URL e VLY_OTP_API_KEY.",
      );
    }

    try {
      await axios.post(
        sendUrl,
        {
          to: email,
          otp: token,
          appName: process.env.VLY_APP_NAME || "Portal de Compras PD",
        },
        {
          headers: {
            "x-api-key": apiKey,
          },
        },
      );
    } catch (error) {
      throw new Error(JSON.stringify(error));
    }
  },
});
