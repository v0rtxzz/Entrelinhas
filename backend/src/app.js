// Monta o aplicativo Express: segurança, CORS, JSON, rotas e erros.
// É importado tanto pelo server.js (local) quanto pelo api/index.js (Vercel).
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import rotas from './routes/index.js';
import { rotaNaoEncontrada, tratarErros } from './middlewares/tratarErros.js';

const app = express();

// Cabeçalhos de segurança HTTP
app.use(helmet());

// CORS: só o(s) endereço(s) do front-end podem chamar a API pelo navegador
app.use(
  cors({
    origin(origem, callback) {
      // origem vazia = chamadas sem navegador (Postman, curl, health check)
      if (!origem || env.frontendUrls.includes(origem)) return callback(null, true);
      return callback(null, false);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

// Lê JSON do corpo das requisições (limite pequeno: só texto)
app.use(express.json({ limit: '100kb' }));

// Quem abrir o endereço da API no navegador é levado para o site.
app.get('/', (_req, res) => {
  const site = env.frontendUrls.find((url) => !url.includes('localhost'));
  if (site) return res.redirect(302, site);
  return res.json({ sistema: 'Entrelinhas', api: '/api', saude: '/api/saude' });
});

app.use('/api', rotas);

app.use(rotaNaoEncontrada);
app.use(tratarErros);

export default app;
