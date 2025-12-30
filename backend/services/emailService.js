
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function enviarEmailBoasVindas(usuario, senhaGerada) {
  const linkLogin = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #009B4D;">Bem-vindo(a), ${usuario.nome_completo}!</h2>
      <p>Seu cadastro na <strong>Lomuz</strong> foi realizado com sucesso.</p>
      <hr style="border: 1px solid #eee;" />
      <h3>Seus dados de acesso:</h3>
      <p><strong>ID do Cliente:</strong> ${usuario.id_publico}</p>
      <p><strong>E-mail:</strong> ${usuario.email}</p>
      <p><strong>Senha Provisória:</strong> <span style="background: #eee; padding: 5px; font-family: monospace; font-size: 1.2em;">${senhaGerada}</span></p>
      <hr style="border: 1px solid #eee;" />
      <p>Acesse sua área exclusiva clicando abaixo:</p>
      <a href="${linkLogin}" style="background-color: #009B4D; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Acessar Área do Cliente</a>
      <p><small>Recomendamos que troque sua senha após o primeiro acesso.</small></p>
    </div>
  `;

  try {
    if(process.env.SMTP_HOST) {
        await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: usuario.email,
        subject: 'Bem-vindo à Lomuz - Dados de Acesso',
        html: htmlContent,
        });
        console.log(`E-mail enviado para ${usuario.email}`);
    } else {
        console.log("SMTP não configurado. Simulando envio de e-mail:", senhaGerada);
    }
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
  }
}

module.exports = { enviarEmailBoasVindas };
