import { Test, TestingModule } from '@nestjs/testing';
import { CryptoController } from './crypto.controller';
import { CryptoService } from './crypto.service';

const mockCryptoService = {
  encrypt: jest.fn(),
  decrypt: jest.fn(),
};

describe('CryptoController', () => {
  let controller: CryptoController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CryptoController],
      providers: [{ provide: CryptoService, useValue: mockCryptoService }],
    }).compile();

    controller = module.get<CryptoController>(CryptoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('POST /get-encrypt-data', () => {
    it('should return successful response with data1 and data2', () => {
      mockCryptoService.encrypt.mockReturnValue({ data1: 'enc-key', data2: 'enc-payload' });

      const result = controller.getEncryptData({ payload: 'Hello' });

      expect(result.successful).toBe(true);
      expect(result.error_code).toBe('');
      expect(result.data).toEqual({ data1: 'enc-key', data2: 'enc-payload' });
      expect(mockCryptoService.encrypt).toHaveBeenCalledWith('Hello');
    });

    it('should return error response when encryption fails', () => {
      mockCryptoService.encrypt.mockImplementation(() => { throw new Error('fail'); });

      const result = controller.getEncryptData({ payload: 'Hello' });

      expect(result.successful).toBe(false);
      expect(result.error_code).toBe('ENCRYPT_FAILED');
      expect(result.data).toBeNull();
    });
  });

  describe('POST /get-decrypt-data', () => {
    it('should return successful response with decrypted payload', () => {
      mockCryptoService.decrypt.mockReturnValue('Hello');

      const result = controller.getDecryptData({ data1: 'enc-key', data2: 'enc-payload' });

      expect(result.successful).toBe(true);
      expect(result.error_code).toBe('');
      expect(result.data).toEqual({ payload: 'Hello' });
      expect(mockCryptoService.decrypt).toHaveBeenCalledWith('enc-key', 'enc-payload');
    });

    it('should return error response when decryption fails', () => {
      mockCryptoService.decrypt.mockImplementation(() => { throw new Error('fail'); });

      const result = controller.getDecryptData({ data1: 'bad', data2: 'bad' });

      expect(result.successful).toBe(false);
      expect(result.error_code).toBe('DECRYPT_FAILED');
      expect(result.data).toBeNull();
    });
  });
});
