import { z } from 'zod';
import dotenv from 'dotenv';
dotenv.config();

const zEnv = z.object({
  SERVER_PORT: z.string(),
  SERVER_NAME: z.string().optional(),
  MONITOR_PORT: z.string(),
});

export const env = zEnv.parse(process.env);
