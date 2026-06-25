import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  // ── Conexão ──
  handleConnection(client: Socket) {
    console.log(`✅ Cliente conectado ao chat: ${client.id}`);
  }

  // ── Desconexão ──
  handleDisconnect(client: Socket) {
    console.log(`❌ Cliente desconectado: ${client.id}`);
  }

  // ── Entrar numa sala (reserva) ──
  @SubscribeMessage('entrar_sala')
  async entrarSala(
    @ConnectedSocket() client: Socket,
    @MessageBody() dados: { reserva_id: string; user_id: string },
  ) {
    const sala = `reserva_${dados.reserva_id}`;
    client.join(sala);
    console.log(`👤 ${dados.user_id} entrou na sala ${sala}`);

    // Enviar histórico de mensagens
    const mensagens = await this.chatService.obterMensagens(dados.reserva_id);
    client.emit('historico', mensagens);
  }

  // ── Enviar mensagem ──
  @SubscribeMessage('enviar_mensagem')
  async enviarMensagem(
    @ConnectedSocket() client: Socket,
    @MessageBody() dados: {
      reserva_id: string;
      remetente_id: string;
      remetente_nome: string;
      remetente_role: string;
      conteudo: string;
    },
  ) {
    // Guardar na base de dados
    const mensagem = await this.chatService.guardarMensagem({
      reserva_id:     dados.reserva_id,
      remetente_id:   dados.remetente_id,
      remetente_nome: dados.remetente_nome,
      remetente_role: dados.remetente_role,
      conteudo:       dados.conteudo,
    });

    // Enviar para todos na sala
    const sala = `reserva_${dados.reserva_id}`;
    this.server.to(sala).emit('nova_mensagem', mensagem);
  }

  // ── Marcar mensagens como lidas ──
  @SubscribeMessage('marcar_lida')
  async marcarLida(
    @MessageBody() dados: { reserva_id: string; user_id: string },
  ) {
    await this.chatService.marcarComoLidas(dados.reserva_id, dados.user_id);
  }
}