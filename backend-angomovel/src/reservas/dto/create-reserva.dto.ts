import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsArray,
  Min,
} from 'class-validator';
import { MetodoPagamento } from '../entities/reservas.entity';

export class CreateReservaDto {

  @IsString()
  @IsNotEmpty({ message: 'O ID do guia é obrigatório' })
  guia_id: string;

  @IsDateString()
  @IsNotEmpty({ message: 'A data de entrada é obrigatória' })
  data_entrada: string;

  @IsDateString()
  @IsNotEmpty({ message: 'A data de saída é obrigatória' })
  data_saida: string;

  @IsNumber()
  @Min(1)
  @IsOptional()
  num_pessoas?: number;

  @IsArray()
  @IsOptional()
  rotas?: string[];

  @IsString()
  @IsOptional()
  observacoes?: string;

  @IsEnum(MetodoPagamento)
  @IsOptional()
  metodo_pagamento?: MetodoPagamento;
}