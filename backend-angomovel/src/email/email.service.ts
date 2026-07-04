import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {

  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  // ── Enviar email de recuperação de senha ──
  async enviarRecuperacaoSenha(email: string, nome: string, token: string): Promise<void> {
    const link = `http://127.0.0.1:5500/abas/redefinir-senha.html?token=${token}`;

    await this.transporter.sendMail({
      from:    process.env.MAIL_FROM,
      to:      email,
      subject: '🔐 Recuperação de Senha — AngoMovel',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Helvetica Neue', sans-serif; background: #F5F0E8; margin: 0; padding: 20px; }
            .card { max-width: 560px; margin: 0 auto; background: #fff; border-radius: 20px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #0A0A0A, #CC0000); padding: 36px 32px; text-align: center; }
            .header h1 { font-size: 28px; color: #fff; margin: 0 0 6px; letter-spacing: 2px; }
            .header p  { font-size: 13px; color: rgba(255,255,255,0.6); margin: 0; }
            .body { padding: 32px; }
            .body h2 { font-size: 22px; color: #111; margin-bottom: 10px; }
            .body p  { font-size: 14px; color: #555; line-height: 1.7; margin-bottom: 16px; }
            .btn { display: block; width: fit-content; margin: 24px auto; padding: 14px 36px; background: #E8192C; color: #fff; border-radius: 999px; text-decoration: none; font-weight: 700; font-size: 15px; }
            .aviso { background: #F5F0E8; border-radius: 10px; padding: 14px 16px; font-size: 12px; color: #888; margin-top: 24px; }
            .footer { text-align: center; padding: 20px; font-size: 11px; color: #aaa; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <h1>✈ ANGOMOVEL</h1>
              <p>Plataforma de Turismo em Angola</p>
            </div>
            <div class="body">
              <h2>Olá, ${nome}! 👋</h2>
              <p>Recebemos um pedido para redefinir a senha da tua conta AngoMovel.</p>
              <p>Clica no botão abaixo para criar uma nova senha. Este link é válido por <strong>30 minutos</strong>.</p>
              <a href="${link}" class="btn">🔐 Redefinir a minha senha</a>
              <div class="aviso">
                <strong>⚠️ Não pediste isto?</strong><br>
                Ignora este email. A tua senha permanece inalterada e a tua conta está segura.
              </div>
              <p style="margin-top:16px;font-size:12px;color:#aaa;">
                Se o botão não funcionar, copia este link:<br>
                <a href="${link}" style="color:#E8192C;word-break:break-all;">${link}</a>
              </p>
            </div>
            <div class="footer">
              © 2026 AngoMovel 🇦🇴 · Luanda, Angola
            </div>
          </div>
        </body>
        </html>
      `,
    });
  }

  // ── Enviar email de boas-vindas ──
  async enviarBoasVindas(email: string, nome: string): Promise<void> {
    await this.transporter.sendMail({
      from:    process.env.MAIL_FROM,
      to:      email,
      subject: '🇦🇴 Bem-vindo ao AngoMovel!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Helvetica Neue', sans-serif; background: #F5F0E8; margin: 0; padding: 20px; }
            .card { max-width: 560px; margin: 0 auto; background: #fff; border-radius: 20px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #0A0A0A, #CC0000); padding: 36px 32px; text-align: center; }
            .header h1 { font-size: 28px; color: #fff; margin: 0 0 6px; letter-spacing: 2px; }
            .body { padding: 32px; }
            .body h2 { font-size: 22px; color: #111; margin-bottom: 10px; }
            .body p  { font-size: 14px; color: #555; line-height: 1.7; }
            .btn { display: block; width: fit-content; margin: 24px auto; padding: 14px 36px; background: #E8192C; color: #fff; border-radius: 999px; text-decoration: none; font-weight: 700; font-size: 15px; }
            .features { display: grid; gap: 10px; margin: 20px 0; }
            .feature { background: #F5F0E8; border-radius: 10px; padding: 12px 14px; font-size: 13px; color: #333; }
            .footer { text-align: center; padding: 20px; font-size: 11px; color: #aaa; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <h1>✈ ANGOMOVEL</h1>
            </div>
            <div class="body">
              <h2>Bem-vindo, ${nome}! 🎉</h2>
              <p>A tua conta foi criada com sucesso. Estás pronto para explorar o melhor de Angola!</p>
              <div class="features">
                <div class="feature">🗺️ Explora 15+ destinos turísticos no mapa interactivo</div>
                <div class="feature">🧭 Contrata guias turísticos certificados</div>
                <div class="feature">❤️ Guarda os teus destinos favoritos</div>
                <div class="feature">⭐ Avalia e comenta os destinos que visitaste</div>
              </div>
              <a href="http://127.0.0.1:5500/angomovel.html" class="btn">🚀 Começar a explorar</a>
            </div>
            <div class="footer">
              © 2026 AngoMovel 🇦🇴 · Luanda, Angola
            </div>
          </div>
        </body>
        </html>
      `,
    });
  }
}