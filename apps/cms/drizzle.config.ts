import { defineConfig } from 'drizzle-kit'
import 'dotenv/config'

export default defineConfig({
  schema: './src/payload-generated-schema.ts',
  out: './drizzle-output',
  dialect: 'postgresql',
  dbCredentials: { 
    url: process.env.DATABASE_URI as string 
  }
})
