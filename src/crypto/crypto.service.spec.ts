import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { CryptoService } from './crypto.service';

const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs1', format: 'pem' },
});

const mockConfigService = {
  get: (key: string) => {
    if (key === 'PRIVATE_KEY') return privateKey;
    if (key === 'PUBLIC_KEY') return publicKey;
  },
};

describe('CryptoService', () => {
  let service: CryptoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CryptoService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<CryptoService>(CryptoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('encrypt', () => {
    it('should return data1 and data2 as base64 strings', () => {
      const result = service.encrypt('Hello, World!');

      expect(result).toHaveProperty('data1');
      expect(result).toHaveProperty('data2');
      expect(typeof result.data1).toBe('string');
      expect(typeof result.data2).toBe('string');
      expect(Buffer.from(result.data1, 'base64').toString('base64')).toBe(result.data1);
      expect(Buffer.from(result.data2, 'base64').toString('base64')).toBe(result.data2);
    });

    it('should produce different data2 each call due to random IV', () => {
      const first = service.encrypt('same payload');
      const second = service.encrypt('same payload');

      expect(first.data2).not.toBe(second.data2);
    });

    it('should encrypt an empty string', () => {
      const result = service.encrypt('');
      expect(result.data1).toBeTruthy();
      expect(result.data2).toBeTruthy();
    });

    it('should encrypt a 2000-character payload', () => {
      const longPayload = 'a'.repeat(2000);
      const result = service.encrypt(longPayload);
      expect(result.data1).toBeTruthy();
      expect(result.data2).toBeTruthy();
    });
  });

  describe('decrypt', () => {
    it('should decrypt back to original payload', () => {
      const payload = 'Hello, World!';
      const { data1, data2 } = service.encrypt(payload);
      const decrypted = service.decrypt(data1, data2);

      expect(decrypted).toBe(payload);
    });

    it('should decrypt a 2000-character payload correctly', () => {
      const payload = 'x'.repeat(2000);
      const { data1, data2 } = service.encrypt(payload);

      expect(service.decrypt(data1, data2)).toBe(payload);
    });

    it('should decrypt special characters', () => {
      const payload = '!@#$%^&*()_+ สวัสดี 你好';
      const { data1, data2 } = service.encrypt(payload);

      expect(service.decrypt(data1, data2)).toBe(payload);
    });

    it('should throw when data1 is invalid', () => {
      const { data2 } = service.encrypt('test');
      expect(() => service.decrypt('invalid-base64!!!', data2)).toThrow();
    });

    it('should throw when data2 is invalid', () => {
      const { data1 } = service.encrypt('test');
      expect(() => service.decrypt(data1, 'invalid-base64!!!')).toThrow();
    });
  });

  describe('round-trip (encrypt → decrypt)', () => {
    const cases = [
      { label: 'simple text',         payload: 'Hello, World!' },
      { label: 'empty string',        payload: '' },
      { label: 'numeric string',      payload: '1234567890' },
      { label: 'special characters',  payload: '!@#$%^&*()_+-=[]{}|;\':",.<>?/`~' },
      { label: 'unicode / Thai',      payload: 'สวัสดี ภาษาไทย' },
      { label: 'unicode / Chinese',   payload: '你好，世界！' },
      { label: 'unicode / emoji',     payload: '🔐🔑✅❌' },
      { label: 'whitespace only',     payload: '   \t\n  ' },
      { label: 'json-like string',    payload: '{"key":"value","num":42}' },
      { label: 'max length (2000)',   payload: 'a'.repeat(2000) },
    ];

    it.each(cases)('$label: decrypted output matches original payload', ({ payload }) => {
      const { data1, data2 } = service.encrypt(payload);
      const decrypted = service.decrypt(data1, data2);

      expect(decrypted).toBe(payload);
    });

    it('data1 and data2 from one encrypt call cannot be swapped', () => {
      const { data1: d1a, data2: d2a } = service.encrypt('payload A');
      const { data1: d1b, data2: d2b } = service.encrypt('payload B');

      // Cross-decrypt must not silently succeed with a wrong result
      expect(() => service.decrypt(d1a, d2b)).toThrow();
      expect(() => service.decrypt(d1b, d2a)).toThrow();
    });
  });
});
