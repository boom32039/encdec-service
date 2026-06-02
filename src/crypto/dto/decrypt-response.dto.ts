import { ApiProperty } from '@nestjs/swagger';

class DecryptDataDto {
  @ApiProperty()
  payload: string;
}

export class DecryptResponseDto {
  @ApiProperty()
  successful: boolean;

  @ApiProperty()
  error_code: string;

  @ApiProperty({ type: DecryptDataDto, nullable: true })
  data: DecryptDataDto | null;
}
