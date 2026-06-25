import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  Max,
} from 'class-validator';

export class CreateAvaliacaoDto {

  @IsString()
  @IsNotEmpty({ message: 'O ID do destino é obrigatório' })
  destino_id: string;

  @IsString()
  @IsNotEmpty({ message: 'O nome do destino é obrigatório' })
  destino_nome: string;

  @IsNumber()
  @Min(1, { message: 'A nota mínima é 1' })
  @Max(5, { message: 'A nota máxima é 5' })
  nota: number;

  @IsString()
  @IsOptional()
  comentario?: string;
}