import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
  Min,
  Max,
  IsArray,
} from 'class-validator';
import { Genero, UserRole } from '../../users/entities/user.entity';

export class RegisterDto {

  @IsString()
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  nome: string;

  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'O email é obrigatório' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'A senha deve ter pelo menos 6 caracteres' })
  @IsNotEmpty({ message: 'A senha é obrigatória' })
  senha: string;

  @IsString()
  @IsOptional()
  telefone?: string;

  @IsNumber()
  @Min(18, { message: 'Tens de ter pelo menos 18 anos' })
  @Max(100, { message: 'Idade inválida' })
  @IsOptional()
  idade?: number;

  @IsEnum(Genero, { message: 'Género inválido' })
  @IsOptional()
  genero?: Genero;

  @IsEnum(UserRole, { message: 'Tipo de utilizador inválido' })
  @IsOptional()
  role?: UserRole;

  @IsString()
  @IsOptional()
  foto?: string;

  // ── Campos do Guia ──
  @IsString()
  @IsOptional()
  especialidade?: string;

  @IsString()
  @IsOptional()
  provincia?: string;

  @IsNumber()
  @IsOptional()
  preco_por_dia?: number;

  @IsArray()
  @IsOptional()
  idiomas?: string[];

  @IsString()
  @IsOptional()
  bio?: string;

  // ── Campos da Empresa ──
  @IsString()
  @IsOptional()
  nome_empresa?: string;

  @IsString()
  @IsOptional()
  nif?: string;

  @IsString()
  @IsOptional()
  tipo_empresa?: string;
}