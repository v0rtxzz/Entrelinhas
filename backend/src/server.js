// Ponto de entrada LOCAL: sobe a API em http://localhost:3001
import app from './app.js';
import { env } from './config/env.js';

app.listen(env.porta, () => {
  console.log(`📚 API do Entrelinhas rodando em http://localhost:${env.porta}/api`);
});
