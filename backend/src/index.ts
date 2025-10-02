import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { pool } from "./db/pool";
import authRoutes from "./modules/auth/routes";
import { requireAuth } from "./modules/auth/middleware";
import { tenantMiddleware } from "./middleware/tenant";

const app = express();

app.use(helmet());
app.use(cors({ origin: env.clientOrigin, credentials: true }));
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", async (_req, res) => {
  try {
    const r = await pool.query("select 1 as ok");
    res.json({ status: "ok", db: r.rows[0].ok === 1 });
  } catch (e) {
    res.status(500).json({ status: "error", error: (e as Error).message });
  }
});

// Auth
app.use("/auth", authRoutes);

// Protected example route using tenant isolation
app.get("/me", requireAuth, tenantMiddleware, (req, res) => {
  res.json({ user: (req as any).user, tenant: (req as any).tenant });
});

app.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`HotelEase API listening on http://localhost:${env.port}`);
});

export default app;

