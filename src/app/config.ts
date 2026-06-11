import debug from "debug";
import { config } from "dotenv";

config();

export const server = debug("nodets:[server]");
export const errorLog = debug("nodets:[error]");
export const database = debug("nodets:[database]");
export const input = debug("nodets:[input]");

export const { port = 5000, origin } = process.env;

export const corsConfig = {
  origin: origin || false,
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
};

export const jsonConfig = {
  limit: "10mb",
  strict: false,
  inflate: true,
  type: "application/json",
};

export const urlEncodeConfig = {
  extended: true,
  limit: "50mb",
  parameterLimit: 1000,
};

// Unica fuente de verdad para multer
export const multerConfig = {
  fileSizeLimitMB: 10,
};
