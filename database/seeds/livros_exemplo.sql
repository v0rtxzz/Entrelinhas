-- =====================================================================
-- ENTRELINHAS · DADOS DE EXEMPLO (opcional)
-- ---------------------------------------------------------------------
-- 12 livros para testar a vitrine e os filtros logo de cara.
-- Pode apagar depois pelo Painel da Biblioteca.
-- Sem capa_url: o site gera uma capa ilustrada automática.
-- =====================================================================

insert into public.livros
  (codigo_acervo, titulo, autor, descricao, sinopse, ano_publicacao, genero, tematica, classificacao_etaria, status_disponibilidade)
values
  ('ENT-0001', 'Dom Casmurro', 'Machado de Assis',
   'Clássico do realismo brasileiro narrado por Bentinho.',
   'Já mais velho, Bento Santiago revisita a própria juventude, o amor por Capitu e a amizade com Escobar, tentando provar uma desconfiança que nunca consegue confirmar.',
   1899, 'Romance', 'Cotidiano', '12', 'disponivel'),

  ('ENT-0002', 'O Cortiço', 'Aluísio Azevedo',
   'Retrato coletivo de um cortiço no Rio do século XIX.',
   'A ambição de João Romão e a vida agitada dos moradores de um cortiço mostram como o ambiente molda as pessoas, num dos marcos do naturalismo no Brasil.',
   1890, 'Romance', 'História', '14', 'emprestado'),

  ('ENT-0003', 'O Alienista', 'Machado de Assis',
   'Novela satírica sobre ciência, poder e loucura.',
   'O médico Simão Bacamarte funda um hospício em Itaguaí e começa a internar cada vez mais moradores, até que a cidade inteira passa a questionar quem é, afinal, o louco.',
   1882, 'Ficção', 'Saúde', '12', 'disponivel'),

  ('ENT-0004', 'Iracema', 'José de Alencar',
   'Romance indianista ambientado no Ceará colonial.',
   'O encontro entre a jovem tabajara Iracema e o português Martim é contado em prosa poética, como uma lenda sobre a origem do Ceará.',
   1865, 'Romance', 'História', '10', 'disponivel'),

  ('ENT-0005', 'A Máquina do Tempo', 'H. G. Wells',
   'Um dos fundadores da ficção científica moderna.',
   'Um inventor viaja milhares de anos no futuro e encontra uma humanidade dividida em dois povos muito diferentes, o que o faz repensar o progresso.',
   1895, 'Ficção Científica', 'Tecnologia', '12', 'disponivel'),

  ('ENT-0006', 'O Cão dos Baskervilles', 'Arthur Conan Doyle',
   'Sherlock Holmes investiga uma lenda assustadora.',
   'Uma família inglesa vive à sombra de uma maldição envolvendo um cão monstruoso. Holmes e Watson partem para os pântanos para separar o mito do crime.',
   1902, 'Suspense', 'Mistério', '12', 'consulta_local'),

  ('ENT-0007', 'Alice no País das Maravilhas', 'Lewis Carroll',
   'Fantasia cheia de jogos de lógica e personagens absurdos.',
   'Ao seguir um coelho apressado, Alice cai em um mundo onde tamanhos mudam, gatos sorriem e uma rainha manda cortar cabeças por qualquer motivo.',
   1865, 'Fantasia', 'Cotidiano', 'L', 'disponivel'),

  ('ENT-0008', 'Vinte Mil Léguas Submarinas', 'Júlio Verne',
   'Aventura a bordo do submarino Nautilus.',
   'O professor Aronnax é capturado pelo misterioso Capitão Nemo e percorre os oceanos do mundo, descobrindo maravilhas e segredos do fundo do mar.',
   1870, 'Ficção Científica', 'Meio Ambiente', '10', 'disponivel'),

  ('ENT-0009', 'Memórias Póstumas de Brás Cubas', 'Machado de Assis',
   'Um defunto-autor conta a própria vida com ironia.',
   'Depois de morto, Brás Cubas decide escrever suas memórias, comentando sem filtro as vaidades, amores e fracassos de uma vida inteira.',
   1881, 'Romance', 'Cotidiano', '14', 'emprestado'),

  ('ENT-0010', 'O Triste Fim de Policarpo Quaresma', 'Lima Barreto',
   'Um patriota sonhador contra a realidade do país.',
   'O major Quaresma dedica a vida a projetos para engrandecer o Brasil, mas cada tentativa esbarra na burocracia, na política e na indiferença.',
   1915, 'Romance', 'História', '14', 'disponivel'),

  ('ENT-0011', 'Fundamentos de Lógica de Programação', 'Equipe SENAI',
   'Apostila introdutória para cursos técnicos.',
   'Algoritmos, variáveis, estruturas de decisão e repetição explicados passo a passo, com exercícios práticos para iniciantes em programação.',
   2023, 'Técnico', 'Tecnologia', 'L', 'consulta_local'),

  ('ENT-0012', 'A Volta ao Mundo em 80 Dias', 'Júlio Verne',
   'Uma aposta ousada e uma corrida contra o relógio.',
   'Phileas Fogg aposta que consegue dar a volta ao planeta em oitenta dias e parte com seu criado Passepartout numa viagem cheia de imprevistos.',
   1872, 'Aventura', 'Cotidiano', '10', 'disponivel')
on conflict (codigo_acervo) do nothing;
