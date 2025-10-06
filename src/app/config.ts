import debug from "debug";
import { config } from "dotenv";
import multer, { memoryStorage } from "multer";

config();

export const server = debug("nodets:[server]");
export const error = debug("nodets:[error]");
export const database = debug("nodets:[database]");
export const input = debug("nodets:[input]");

export const { port = 5000, origin } = process.env

export const corsconfig = {
    origin: origin || null,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}

export const jsonConfig = {
    limit: "10mb",
    strict: false,
    inflate: true,
    reviver: null,
    type: "application/json"
}

export const urlencodeconfig = {
    extended: true,
    limit: "50mb",
    parameterLimit: 1000
}

export const upload = multer({
    storage: memoryStorage(),
    limits: { fileSize: 25 * 1024 * 1024 }
})