import dotenv from "dotenv";

dotenv.config();
export const token = {
  key: process.env.TOKEN_KEY || "change_this_key",
  issuer: process.env.TOKEN_ISSUER || "linktree",
  audience: process.env.TOKEN_AUDIENCE || "admin",
  crowdKey:process.env.CROWD_KEY || "A67c49975d3F9861Ad9Ab4914DAb28E7138ed864CEFB2D2C3FB9A2C6aa",
};

export const analyticsURL =
  (process.env.API_URL ?? "http://localhost:3030") + "/analytics";

export const redisURL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

export const paypal = {
  host: process.env.PAYPAL_HOST ?? "https://api.sandbox.paypal.com",
  account:
    process.env.PAYPAL_ACCOUNT ?? "sb-w2j208096847@business.example.com",
  clientID:
    process.env.PAYPAL_CLIENT_ID ??
    "AdeP8LpGGtgbpGLnM5A7bDSjjEWZp0VZP6DvyjoD1Qvgp5tHeIy_NPRw16El4EjMWzTXZ6eA9RHBTlER",
  productID: process.env.PAYPAL_PRODUCT_ID,
  secret:
    process.env.PAYPAL_SECRET ??
    "EFzQg7nMpZ8FU_bE2DdoSSOhAI-1XbqY9lJdssjMI_6HRBmwy0IwLItoTiKpW35AK3kAdd2seJ6dYZoo",
  // account: "sb-argra2552470@business.example.com",
  // clientID:"AdYg-G4M2Lb97gK8jFJP9x86Bz-C3y4AsvMDaUAgBZKrzXSjOb7PcAIJi341l7YH_EGgSHae69wysWV6",
  // secret:"EAazekhyZrChFthiLPK4r56YvrEkHCgNhrQ5z6ENpxrcp2nlJB0r65Spj3xEDb9u2_jkn5vRhUhI5haw",
  webhookId: process.env.PAYPAL_WEBHOOK_ID ?? "4U86759899317391W",
};

export const mailer = {
  host: process.env.MAILER_HOST ?? "smtp.gmail.com",
  port: +process.env.MAILER_PORT ?? 587,
  secure: +process.env.MAILER_SECURE ?? 0,
  user: process.env.MAILER_USER ?? "portals100test@gmail.com",
  pass: process.env.MAILER_PASS ?? "nj60953-nm bvjflk",
  from: process.env.MAILER_FROM ?? "info",
};
