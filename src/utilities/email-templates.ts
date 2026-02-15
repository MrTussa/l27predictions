import { User } from '@/payload-types'

const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

const emailWrapper = (content: string) => `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>L27 Predictions</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #f5f5f5;
      background-color: #0a0a0a;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #141414;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 4px;
      overflow: hidden;
    }
    .header {
      background-color: #141414;
      padding: 40px 20px;
      text-align: center;
      border-bottom: 2px solid #FFDF2C;
    }
    .header h1 {
      color: #ffffff;
      font-size: 28px;
      margin: 0;
      font-weight: 800;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }
    .header h1 span {
      color: #FFDF2C;
    }
    .content {
      padding: 40px;
    }
    .content h2 {
      color: #ffffff;
      font-size: 24px;
      margin-bottom: 20px;
      font-weight: 700;
    }
    .content p {
      color: #a3a3a3;
      margin-bottom: 16px;
      font-size: 15px;
    }
    .button-container {
      text-align: center;
      margin: 30px 0;
    }
    .button {
      display: inline-block;
      background-color: #FFDF2C;
      color: #000000 !important;
      text-decoration: none;
      padding: 14px 36px;
      border-radius: 4px;
      font-weight: 700;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .info-box {
      background-color: rgba(255, 223, 44, 0.05);
      border: 1px solid rgba(255, 223, 44, 0.2);
      border-radius: 4px;
      padding: 16px 20px;
      margin: 20px 0;
    }
    .info-box p {
      color: #FFDF2C;
      margin: 0;
      font-size: 14px;
    }
    .warning-box {
      background-color: rgba(239, 68, 68, 0.05);
      border: 1px solid rgba(239, 68, 68, 0.2);
      border-radius: 4px;
      padding: 16px 20px;
      margin: 20px 0;
    }
    .warning-box p {
      color: #fca5a5;
      margin: 0;
      font-size: 14px;
    }
    .footer {
      background-color: rgba(0, 0, 0, 0.3);
      padding: 30px 40px;
      text-align: center;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
    }
    .footer p {
      color: #525252;
      font-size: 12px;
      margin: 6px 0;
    }
    .footer a {
      color: #FFDF2C;
      text-decoration: none;
      font-weight: 500;
    }
    .footer .disclaimer {
      font-size: 10px;
      color: #404040;
      margin-top: 16px;
      line-height: 1.4;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1><span>L27</span> Predictions</h1>
    </div>
    ${content}
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} L27 Predictions</p>
      <p>
        <a target="_blank" href="${baseUrl}">Сайт</a> &bull;
        <a target="_blank" href="${baseUrl}/account">Личный кабинет</a>
      </p>
      <p class="disclaimer">
        This website is not associated in any way with the Formula 1 companies.
        F1, FORMULA ONE, FORMULA 1, FIA FORMULA ONE WORLD CHAMPIONSHIP, GRAND PRIX
        and related marks are trade marks of Formula One Licensing B.V.
      </p>
      <p style="font-size: 10px; color: #404040; margin-top: 12px;">
        Это автоматическое уведомление. Ответы на этот адрес не обрабатываются.
      </p>
    </div>
  </div>
</body>
</html>
`

export function resetPasswordEmail({ token, user }: { token: string; user: User }) {
  const resetURL = `${baseUrl}/reset-password?token=${token}`
  const content = `
    <div class="content">
      <h2>Восстановление пароля</h2>

      <p>Вы запросили сброс пароля для аккаунта на платформе <strong style="color: #ffffff;">L27 Predictions</strong>.</p>

      <div class="info-box">
        <p><strong>Email:</strong></p>
        <p style="margin-top: 6px; color: #d4d4d4; font-weight: 600;">${user.email}</p>
      </div>

      <p>Нажмите на кнопку ниже, чтобы создать новый пароль:</p>

      <div class="button-container">
        <a href="${resetURL}" class="button">Сбросить пароль</a>
      </div>

      <div class="info-box">
        <p><strong>Важно:</strong></p>
        <p style="margin-top: 6px; color: #d4d4d4;">Ссылка действительна в течение <strong style="color: #ffffff;">1 часа</strong>. После истечения срока потребуется запросить новую.</p>
      </div>

      <div class="warning-box">
        <p>Если вы <strong>не запрашивали</strong> сброс пароля, проигнорируйте это письмо. Ваш текущий пароль остается в безопасности.</p>
      </div>
    </div>
  `

  return emailWrapper(content)
}
