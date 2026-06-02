import { ApiProperty } from '@nestjs/swagger';

class EncryptDataDto {
  @ApiProperty()
  data1: string;

  @ApiProperty()
  data2: string;
}

export class EncryptResponseDto {
  @ApiProperty()
  successful: boolean;

  @ApiProperty()
  error_code: string;

  @ApiProperty({ type: EncryptDataDto, nullable: true })
  data: EncryptDataDto | null;
}
