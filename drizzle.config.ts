import { defineConfig } from 'drizzle-kit';
import { config } from 'dotenv';

// Explicitly load the .env file from the current working directory
config({ path: '.env' }); 

export default defineConfig({
  schema: './lib/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});