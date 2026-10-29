CREATE TABLE IF NOT EXISTS `serviço` (
  `cod_serv` varchar(20) NOT NULL,
  `classe_serv` varchar(120) NOT NULL,
  PRIMARY KEY (`cod_serv`)
);

CREATE TABLE IF NOT EXISTS `serviço1` (
  `cod_serv1` varchar(20) NOT NULL,
  `descr_serv1` varchar(160) NOT NULL,
  `cod2_serv1` varchar(20) NOT NULL,
  PRIMARY KEY (`cod_serv1`)
);

INSERT INTO `serviço` (`cod_serv`, `classe_serv`) VALUES
  ('ELE', 'Eletricista'),
  ('ENC', 'Encanador'),
  ('PIN', 'Pintor'),
  ('TI', 'TI'),
  ('LIM', 'Limpeza'),
  ('JAR', 'Jardinagem'),
  ('REF', 'Reformas'),
  ('CLI', 'Climatização');

INSERT INTO `serviço1` (`cod_serv1`, `descr_serv1`, `cod2_serv1`) VALUES
  ('ELE-RES', 'Instalações residenciais', 'ELE'),
  ('ELE-PAD', 'Troca de disjuntores e padrões', 'ELE'),
  ('ELE-LUZ', 'Iluminação e automação simples', 'ELE'),
  ('ENC-VAZ', 'Caça e reparo de vazamentos', 'ENC'),
  ('ENC-CAI', 'Caixa d''água e pressurização', 'ENC'),
  ('ENC-DES', 'Desentupimento residencial', 'ENC'),
  ('PIN-INT', 'Pintura interna', 'PIN'),
  ('PIN-TEX', 'Textura e acabamento', 'PIN'),
  ('PIN-FAC', 'Pintura de fachada', 'PIN'),
  ('TI-SUP', 'Suporte técnico e formatação', 'TI'),
  ('TI-RED', 'Redes e Wi-Fi', 'TI'),
  ('TI-SIS', 'Sistemas e sites simples', 'TI'),
  ('LIM-POS', 'Limpeza pós-obra', 'LIM'),
  ('LIM-RES', 'Limpeza residencial', 'LIM'),
  ('JAR-POD', 'Poda e manutenção', 'JAR'),
  ('JAR-PAI', 'Paisagismo básico', 'JAR'),
  ('REF-GES', 'Gesso e drywall', 'REF'),
  ('REF-PIS', 'Pisos e revestimentos', 'REF'),
  ('CLI-AR', 'Instalação de ar-condicionado', 'CLI'),
  ('CLI-MAN', 'Manutenção preventiva', 'CLI');

INSERT INTO `login` (
  `documento_log`, `nome_log`, `datanasc_log`, `email_log`, `senha_log`,
  `descr_log`, `serviço_log`, `especialidade_log`, `formacao_log`,
  `tempo_area_log`, `valor_hora_log`, `qualidade_log`, `credibilidade_log`,
  `email_comercial_log`, `telefone_log`
) VALUES
  ('10000000001', 'Ana Ribeiro', '1992-03-14', 'ana.ribeiro@lgi.dev', '123456', 'Eletricista residencial com atendimento rápido para apartamentos e casas. Faço revisão de quadros, tomadas, iluminação e pequenos projetos.', 'Eletricista', 'Instalações residenciais', 'Técnico em Eletrotécnica - SENAI', '8 anos', 95.00, 4.8, 'Verificado', 'contato.ana@lgi.dev', '(11) 94001-0101'),
  ('10000000002', 'Bruno Martins', '1987-08-22', 'bruno.martins@lgi.dev', '123456', 'Encanador especializado em vazamentos, troca de registros, sifões, caixas acopladas e manutenção preventiva.', 'Encanador', 'Caça e reparo de vazamentos', 'Curso profissionalizante de Hidráulica Predial', '11 anos', 85.00, 4.7, 'Verificado', 'bruno.hidraulica@lgi.dev', '(11) 94002-0202'),
  ('10000000003', 'Carla Nogueira', '1995-11-05', 'carla.nogueira@lgi.dev', '123456', 'Pintora com foco em acabamento fino, preparação de parede, textura decorativa e pintura sem sujeira.', 'Pintor', 'Pintura interna', 'Especialização em Pintura Decorativa', '6 anos', 70.00, 4.9, 'Verificado', 'carla.pinturas@lgi.dev', '(11) 94003-0303'),
  ('10000000004', 'Diego Souza', '1990-01-18', 'diego.souza@lgi.dev', '123456', 'Técnico de TI para suporte doméstico e pequenos negócios. Configuro computadores, impressoras, backup e redes Wi-Fi.', 'TI', 'Suporte técnico e formatação', 'Tecnólogo em Redes de Computadores', '9 anos', 110.00, 4.6, 'Verificado', 'diego.ti@lgi.dev', '(11) 94004-0404'),
  ('10000000005', 'Elaine Costa', '1984-06-30', 'elaine.costa@lgi.dev', '123456', 'Serviços de limpeza residencial, organização e pós-obra leve com equipe pontual e material próprio sob consulta.', 'Limpeza', 'Limpeza residencial', 'Treinamento em limpeza profissional', '13 anos', 65.00, 4.5, 'Verificado', 'elaine.clean@lgi.dev', '(11) 94005-0505'),
  ('10000000006', 'Felipe Andrade', '1993-09-12', 'felipe.andrade@lgi.dev', '123456', 'Jardinagem, poda, manutenção de vasos, grama e pequenos projetos de paisagismo para áreas externas.', 'Jardinagem', 'Poda e manutenção', 'Curso livre de Jardinagem e Paisagismo', '7 anos', 75.00, 4.4, 'Pendente', 'felipe.jardim@lgi.dev', '(11) 94006-0606'),
  ('10000000007', 'Gabriela Lima', '1989-12-02', 'gabriela.lima@lgi.dev', '123456', 'Reformas rápidas com drywall, pequenos reparos, instalação de prateleiras, nichos e acabamento em gesso.', 'Reformas', 'Gesso e drywall', 'Técnica em Edificações', '10 anos', 120.00, 4.7, 'Verificado', 'gabi.reformas@lgi.dev', '(11) 94007-0707'),
  ('10000000008', 'Henrique Alves', '1986-04-09', 'henrique.alves@lgi.dev', '123456', 'Instalação, limpeza e manutenção de ar-condicionado split. Atendimento com checklist e orientação de uso.', 'Climatização', 'Instalação de ar-condicionado', 'Técnico em Refrigeração', '12 anos', 130.00, 4.8, 'Verificado', 'henrique.clima@lgi.dev', '(11) 94008-0808'),
  ('10000000009', 'Isabela Rocha', '1998-07-21', 'isabela.rocha@lgi.dev', '123456', 'Cliente fictícia para testar agendamentos, curtidas e comentários no aplicativo LGI.', NULL, NULL, NULL, NULL, NULL, 4.2, 'Pendente', NULL, '(11) 94009-0909'),
  ('10000000010', 'João Pereira', '1991-10-27', 'joao.pereira@lgi.dev', '123456', 'Cliente fictício para simular contratação de serviços e interação no feed.', NULL, NULL, NULL, NULL, NULL, 4.1, 'Pendente', NULL, '(11) 94010-1010');

INSERT INTO `posts` (`id`, `user_documento`, `media_content`, `media_type`, `descricao`, `created_at`, `likes_count`) VALUES
  (1001, '10000000001', 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1200&q=80', 'image', 'Quadro revisado, circuitos identificados e tomadas aterradas em apartamento no centro.', '2026-05-20 09:15:00.000000', 3),
  (1002, '10000000002', 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=1200&q=80', 'image', 'Reparo de vazamento oculto com troca de conexão e teste de pressão finalizado.', '2026-05-21 14:30:00.000000', 4),
  (1003, '10000000003', 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=1200&q=80', 'image', 'Antes e depois de pintura interna com acabamento fosco lavável.', '2026-05-22 11:05:00.000000', 5),
  (1004, '10000000004', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80', 'image', 'Rede Wi-Fi organizada com melhor cobertura para escritório pequeno.', '2026-05-23 16:45:00.000000', 2),
  (1005, '10000000008', 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=1200&q=80', 'image', 'Instalação de ar-condicionado split com acabamento limpo e teste de drenagem.', '2026-05-24 10:20:00.000000', 3),
  (1006, '10000000007', 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80', 'image', 'Nicho em drywall pronto para receber iluminação e pintura final.', '2026-05-25 08:40:00.000000', 2);

INSERT INTO `comments` (`id`, `post_id`, `user_documento`, `content`, `created_at`) VALUES
  (1001, 1001, '10000000009', 'Ficou muito organizado. Vou chamar para revisar meu apartamento.', '2026-05-20 10:05:00.000000'),
  (1002, 1001, '10000000004', 'Identificação dos circuitos ajuda demais na manutenção.', '2026-05-20 12:15:00.000000'),
  (1003, 1002, '10000000010', 'Esse tipo de vazamento sempre dá trabalho. Bom serviço.', '2026-05-21 15:20:00.000000'),
  (1004, 1003, '10000000005', 'Acabamento ficou excelente.', '2026-05-22 12:10:00.000000'),
  (1005, 1003, '10000000009', 'Gostei da cor, combinou muito com o ambiente.', '2026-05-22 13:35:00.000000'),
  (1006, 1004, '10000000001', 'Boa distribuição dos pontos de rede.', '2026-05-23 18:00:00.000000'),
  (1007, 1005, '10000000002', 'Instalação limpa e sem quebra-quebra.', '2026-05-24 11:50:00.000000'),
  (1008, 1006, '10000000003', 'Esse nicho vai ficar ótimo com textura.', '2026-05-25 09:30:00.000000');

INSERT INTO `post_likes` (`post_id`, `user_documento`) VALUES
  (1001, '10000000002'),
  (1001, '10000000004'),
  (1001, '10000000009'),
  (1002, '10000000001'),
  (1002, '10000000003'),
  (1002, '10000000009'),
  (1002, '10000000010'),
  (1003, '10000000001'),
  (1003, '10000000002'),
  (1003, '10000000005'),
  (1003, '10000000009'),
  (1003, '10000000010'),
  (1004, '10000000001'),
  (1004, '10000000010'),
  (1005, '10000000002'),
  (1005, '10000000006'),
  (1005, '10000000009'),
  (1006, '10000000003'),
  (1006, '10000000008');

INSERT INTO `appointments` (`id`, `cli_id`, `service`, `date`, `time`, `duration`, `price`, `status_id`, `pre_id`) VALUES
  (1001, '10000000009', 'Revisão elétrica residencial', '2026-05-28', '09:00', 120, 'R$ 190,00', 1, '10000000001'),
  (1002, '10000000010', 'Instalação de luminárias', '2026-05-29', '14:00', 90, 'R$ 150,00', 2, '10000000001'),
  (1003, '10000000009', 'Reparo de vazamento na cozinha', '2026-05-28', '11:00', 120, 'R$ 170,00', 1, '10000000002'),
  (1004, '10000000010', 'Troca de registro', '2026-05-30', '08:30', 60, 'R$ 95,00', 3, '10000000002'),
  (1005, '10000000009', 'Pintura de quarto', '2026-06-02', '09:00', 240, 'R$ 280,00', 2, '10000000003'),
  (1006, '10000000010', 'Configuração de rede Wi-Fi', '2026-05-31', '15:00', 120, 'R$ 220,00', 1, '10000000004'),
  (1007, '10000000009', 'Limpeza residencial completa', '2026-06-03', '08:00', 300, 'R$ 325,00', 2, '10000000005'),
  (1008, '10000000010', 'Poda de jardim', '2026-06-04', '10:00', 180, 'R$ 225,00', 1, '10000000006'),
  (1009, '10000000009', 'Instalação de nicho em drywall', '2026-06-05', '13:30', 180, 'R$ 360,00', 2, '10000000007'),
  (1010, '10000000010', 'Manutenção de ar-condicionado', '2026-06-06', '09:30', 120, 'R$ 260,00', 1, '10000000008');

UPDATE `posts` p
SET `likes_count` = (
  SELECT COUNT(*)
  FROM `post_likes` l
  WHERE l.`post_id` = p.`id`
)
WHERE p.`id` BETWEEN 1001 AND 1006;
