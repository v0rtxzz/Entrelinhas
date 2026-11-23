// =====================================================================
// MAPA DE ROTAS DA API  (todas começam com /api)
// ---------------------------------------------------------------------
// Legenda:  🌐 público   🔑 precisa de login
//           📚 equipe (bibliotecária/admin)   🛡️ só admin
// Documentação completa: docs/API.md
// =====================================================================
import { Router } from 'express';
import {
  autenticar,
  autenticarOpcional,
  somenteAdmin,
  somenteEquipe,
} from '../middlewares/autenticacao.js';

import * as livros from '../controllers/livrosController.js';
import * as avaliacoes from '../controllers/avaliacoesController.js';
import * as resenhas from '../controllers/resenhasController.js';
import * as favoritos from '../controllers/favoritosController.js';
import * as perfil from '../controllers/perfilController.js';
import * as admin from '../controllers/adminController.js';

const rotas = Router();

// ---------- Saúde da API ----------
rotas.get('/saude', (_req, res) => res.json({ status: 'ok', sistema: 'Entrelinhas', hora: new Date().toISOString() }));

// ---------- Livros / Vitrine ----------
rotas.get('/livros', livros.listar); //                              🌐 RF12, RF14–RF21
rotas.get('/livros/opcoes-filtro', livros.opcoesFiltro); //          🌐
rotas.get('/livros/destaques', livros.destaques); //                 🌐 RF30
rotas.get('/livros/:id', autenticarOpcional, livros.buscarPorId); // 🌐 RF13
rotas.post('/livros', autenticar, somenteEquipe, livros.criar); //   📚 RF07
rotas.put('/livros/:id', autenticar, somenteEquipe, livros.atualizar); //         📚 RF10
rotas.patch('/livros/:id/status', autenticar, somenteEquipe, livros.alterarStatus); // 📚 RF08
rotas.delete('/livros/:id', autenticar, somenteEquipe, livros.excluir); //        📚 RF11

// ---------- Avaliações (estrelas) ----------
rotas.put('/livros/:id/avaliacao', autenticar, avaliacoes.avaliar); //            🔑 RF23
rotas.delete('/livros/:id/avaliacao', autenticar, avaliacoes.removerAvaliacao); // 🔑

// ---------- Resenhas ----------
rotas.get('/livros/:id/resenhas', resenhas.listarDoLivro); //                 🌐 RF27
rotas.post('/livros/:id/resenhas', autenticar, resenhas.criar); //            🔑 RF25
rotas.get('/resenhas', autenticar, somenteEquipe, resenhas.listarParaModeracao); // 📚 RF28
rotas.put('/resenhas/:id', autenticar, resenhas.editar); //                   🔑 RF26
rotas.delete('/resenhas/:id', autenticar, resenhas.excluir); //               🔑 RF26 / 📚 RF28

// ---------- Favoritos ("Quero Ler") ----------
rotas.get('/favoritos', autenticar, favoritos.listar); //                 🔑 RF29
rotas.post('/favoritos/:livroId', autenticar, favoritos.adicionar); //    🔑
rotas.delete('/favoritos/:livroId', autenticar, favoritos.remover); //    🔑

// ---------- Perfil do usuário logado ----------
rotas.get('/perfil', autenticar, perfil.meuPerfil); //    🔑 RF04
rotas.patch('/perfil', autenticar, perfil.atualizar); //  🔑 RF04

// ---------- Painel Admin ----------
rotas.get('/admin/usuarios', autenticar, somenteAdmin, admin.listarUsuarios); //        🛡️ RF06
rotas.patch('/admin/usuarios/:id', autenticar, somenteAdmin, admin.alterarUsuario); //  🛡️ RF06

export default rotas;
