import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class CryptoService {
  private readonly privateKey: string;
  private readonly publicKey: string;

  constructor(private readonly configService: ConfigService) {
    this.privateKey = this.configService.get<string>('PRIVATE_KEY').replace(/\\n/g, '\n');
    this.publicKey = this.configService.get<string>('PUBLIC_KEY').replace(/\\n/g, '\n');
  }

  encrypt(payload: string): { data1: string; data2: string } {
    // Step 1: Generate random AES-256 key (32 bytes)
    const aesKey = crypto.randomBytes(32);

    // Step 2: AES-256-CBC encrypt payload; prepend IV to ciphertext
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', aesKey, iv);
    const encrypted = Buffer.concat([cipher.update(payload, 'utf8'), cipher.final()]);
    const data2 = Buffer.concat([iv, encrypted]).toString('base64');

    // Step 3: Encrypt AES key with RSA private key → data1
    const data1 = crypto
      .privateEncrypt({ key: this.privateKey, padding: crypto.constants.RSA_PKCS1_PADDING }, aesKey)
      .toString('base64');

    return { data1, data2 };
  }

  decrypt(data1: string, data2: string): string {
    // Step 1: Decrypt data1 with RSA public key to recover AES key
    const aesKey = crypto.publicDecrypt(
      { key: this.publicKey, padding: crypto.constants.RSA_PKCS1_PADDING },
      Buffer.from(data1, 'base64'),
    );

    // Step 2: Split IV and ciphertext from data2, then AES-256-CBC decrypt
    const data2Buffer = Buffer.from(data2, 'base64');
    const iv = data2Buffer.subarray(0, 16);
    const ciphertext = data2Buffer.subarray(16);

    const decipher = crypto.createDecipheriv('aes-256-cbc', aesKey, iv);
    const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);

    return decrypted.toString('utf8');
  }
}
