import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CryptoService } from './crypto.service';
import { DecryptRequestDto } from './dto/decrypt-request.dto';
import { DecryptResponseDto } from './dto/decrypt-response.dto';
import { EncryptRequestDto } from './dto/encrypt-request.dto';
import { EncryptResponseDto } from './dto/encrypt-response.dto';

@ApiTags('Crypto')
@Controller()
export class CryptoController {
  constructor(private readonly cryptoService: CryptoService) {}

  @Post('get-encrypt-data')
  @HttpCode(200)
  @ApiOperation({ summary: 'Encrypt payload using AES-256 + RSA' })
  @ApiResponse({ status: 200, type: EncryptResponseDto })
  getEncryptData(@Body() body: EncryptRequestDto): EncryptResponseDto {
    try {
      const { data1, data2 } = this.cryptoService.encrypt(body.payload);
      return { successful: true, error_code: '', data: { data1, data2 } };
    } catch {
      return { successful: false, error_code: 'ENCRYPT_FAILED', data: null };
    }
  }

  @Post('get-decrypt-data')
  @HttpCode(200)
  @ApiOperation({ summary: 'Decrypt data1/data2 back to original payload' })
  @ApiResponse({ status: 200, type: DecryptResponseDto })
  getDecryptData(@Body() body: DecryptRequestDto): DecryptResponseDto {
    try {
      const payload = this.cryptoService.decrypt(body.data1, body.data2);
      return { successful: true, error_code: '', data: { payload } };
    } catch {
      return { successful: false, error_code: 'DECRYPT_FAILED', data: null };
    }
  }
}
