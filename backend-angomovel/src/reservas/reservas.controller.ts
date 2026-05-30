import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ReservasService } from './reservas.service';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('reservas')
@UseGuards(JwtAuthGuard)
export class ReservasController {

  constructor(private readonly reservasService: ReservasService) {}

  // ── POST /api/v1/reservas ── cliente cria reserva
  @Post()
  async criar(@Request() req, @Body() dto: CreateReservaDto) {
    return this.reservasService.criarReserva(req.user.id, dto);
  }

  // ── GET /api/v1/reservas/minhas ── reservas do cliente
  @Get('minhas')
  async minhasReservas(@Request() req) {
    return this.reservasService.reservasCliente(req.user.id);
  }

  // ── GET /api/v1/reservas/guia ── reservas do guia
  @Get('guia')
  async reservasGuia(@Request() req) {
    return this.reservasService.reservasGuia(req.user.id);
  }

  // ── GET /api/v1/reservas/:id ── ver reserva por ID
  @Get(':id')
  async verReserva(@Param('id') id: string) {
    return this.reservasService.encontrarReserva(id);
  }

  // ── PATCH /api/v1/reservas/:id/aceitar ── guia aceita
  @Patch(':id/aceitar')
  async aceitar(@Param('id') id: string, @Request() req) {
    return this.reservasService.aceitarReserva(id, req.user.id);
  }

  // ── PATCH /api/v1/reservas/:id/recusar ── guia recusa
  @Patch(':id/recusar')
  async recusar(
    @Param('id') id: string,
    @Request() req,
    @Body() body: { motivo?: string },
  ) {
    return this.reservasService.recusarReserva(id, req.user.id, body.motivo);
  }

  // ── PATCH /api/v1/reservas/:id/iniciar ── guia inicia actividade
  @Patch(':id/iniciar')
  async iniciar(@Param('id') id: string, @Request() req) {
    return this.reservasService.iniciarActividade(id, req.user.id);
  }

  // ── PATCH /api/v1/reservas/:id/concluir ── guia conclui actividade
  @Patch(':id/concluir')
  async concluir(@Param('id') id: string, @Request() req) {
    return this.reservasService.concluirActividade(id, req.user.id);
  }

  // ── PATCH /api/v1/reservas/:id/cancelar ── cliente cancela
  @Patch(':id/cancelar')
  async cancelar(@Param('id') id: string, @Request() req) {
    return this.reservasService.cancelarReserva(id, req.user.id);
  }

  // ── PATCH /api/v1/reservas/:id/avaliar ── cliente avalia guia
  @Patch(':id/avaliar')
  async avaliar(
    @Param('id') id: string,
    @Request() req,
    @Body() body: { avaliacao: number; comentario?: string },
  ) {
    return this.reservasService.avaliarGuia(id, req.user.id, body.avaliacao, body.comentario);
  }
}