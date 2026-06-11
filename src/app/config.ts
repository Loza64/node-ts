import debug from "debug";
import { config } from "dotenv";

config();

export const server = debug("nodets:[server]");
export const socketIO = debug("nodets:[socket]");
export const errorLog = debug("nodets:[error]");
export const database = debug("nodets:[database]");
export const input = debug("nodets:[input]");

export const { PORT = 4000, ORIGIN } = process.env;

export const corsConfig = {
  origin: ORIGIN || '*',
  credentials: !!ORIGIN,
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
