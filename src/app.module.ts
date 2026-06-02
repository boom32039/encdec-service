import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CryptoModule } from './crypto/crypto.module';

function validateConfig(config: Record<string, unknown>) {
  const missing = ['PRIVATE_KEY', 'PUBLIC_KEY'].filter((key) => !config[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}. See .env.example.`);
  }
  return config;
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateConfig }),
    CryptoModule,
  ],
})
export class AppModule {}
