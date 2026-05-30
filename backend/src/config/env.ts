import { z } from 'zod';
import 'dotenv/config';

const envSchema = z.object({
  PORT: z.coerce.number().default(3001),
  HOST: z.string().default('0.0.0.0'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CORS_ORIGIN: z.string().default('*'),
  
  // LLM Configuration
  GROQ_API_KEY: z.string({
    required_error: "GROQ_API_KEY is required for the LLM chatbot service"
  }),
  GOOGLE_API_KEY: z.string().optional(),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(30),
  
  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

export type EnvConfig = z.infer<typeof envSchema>;

let _config: EnvConfig | null = null;

export function getConfig(): EnvConfig {
  if (!_config) {
    const result = envSchema.safeParse(process.env);
    if (!result.success) {
      console.error('❌ Environment validation failed:');
      for (const issue of result.error.issues) {
        console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
      }
      process.exit(1);
    }
    _config = result.data;
  }
  return _config;
}

export function validateConfig(): void {
  const config = getConfig();
  const warnings: string[] = [];
  
  if (!config.GOOGLE_API_KEY) {
    warnings.push('No GOOGLE_API_KEY configured. Embeddings / vector search will run in mock/fallback mode.');
  }
  
  if (config.CORS_ORIGIN === '*' && config.NODE_ENV === 'production') {
    warnings.push('CORS is set to allow all origins in production. Consider restricting.');
  }
  
  if (warnings.length > 0) {
    console.warn('⚠ Configuration warnings:');
    warnings.forEach(w => console.warn(`  - ${w}`));
  }
}
