import { IsString, IsNotEmpty } from 'class-validator';

export class StoreDto {
  @IsString()
  @IsNotEmpty()
  user!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;
  
}