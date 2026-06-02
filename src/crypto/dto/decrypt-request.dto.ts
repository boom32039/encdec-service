import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class DecryptRequestDto {
  @ApiProperty({ description: 'RSA-encrypted AES key (base64)', example: 'base64-encoded-data1' })
  @IsString()
  @IsNotEmpty()
  data1: string;

  @ApiProperty({ description: 'AES-encrypted payload (base64)', example: 'base64-encoded-data2' })
  @IsString()
  @IsNotEmpty()
  data2: string;
}
