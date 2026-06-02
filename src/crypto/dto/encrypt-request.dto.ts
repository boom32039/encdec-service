import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class EncryptRequestDto {
  @ApiProperty({ description: 'Payload to encrypt', maxLength: 2000, example: 'Hello, World!' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  payload: string;
}
