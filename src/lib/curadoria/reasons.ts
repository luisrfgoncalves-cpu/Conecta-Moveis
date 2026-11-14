import { ComplianceReason } from './schemas';

export const STANDARD_COMPLIANCE_REASONS: ComplianceReason[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    code: 'contato_indevido_midia',
    policy_source: 'politica_portfolio',
    title: 'Contato ou dados comerciais na imagem',
    description:
      'A imagem contém telefone, redes sociais ou valores inseridos diretamente no arquivo visual.',
    advertiser_message_template:
      'Identificamos dados de contato ou preços na sua imagem. Conforme nossa Política de Portfólio, os contatos devem constar exclusivamente nos campos dedicados do seu perfil para segurança de todos.',
    notifier_message_template:
      'A imagem indicada foi removida por conter informações de contato em desconformidade com a Política de Portfólio.',
    severity: 'normal',
    created_at: new Date().toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    code: 'termo_endosso_proibido',
    policy_source: 'politica_anuncios',
    title: 'Expressão de endosso ou superioridade vedada',
    description:
      'O conteúdo veicula alegações de aprovação institucional ou selo da plataforma, violando o CDC e a neutralidade.',
    advertiser_message_template:
      'Seu anúncio contém termos que sugerem endosso ou aprovação institucional da plataforma. Por exigência legal (CDC art. 37) e neutralidade técnica, solicitamos a adequação do texto.',
    notifier_message_template:
      'O conteúdo foi suspenso para correção cadastral por conter termos de endosso vedados pelas regras da plataforma.',
    severity: 'alto',
    created_at: new Date().toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    code: 'foto_terceiro_sem_autoria',
    policy_source: 'politica_portfolio',
    title: 'Imagem sem comprovação de autoria própria',
    description:
      'Foto proveniente de catálogo de terceiros, banco de imagens ou outro profissional sem declaração de execução.',
    advertiser_message_template:
      'Recebemos notificação referente à autoria da foto enviada. Nosso canal de portfólio aceita apenas fotos de serviços executados pelo próprio anunciante.',
    notifier_message_template:
      'A imagem foi ocultada cautelarmente com base na Política de Portfólio e Lei de Direitos Autorais.',
    severity: 'alto',
    created_at: new Date().toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    code: 'avaliacao_ofensa_sem_relacao',
    policy_source: 'politica_avaliacoes',
    title: 'Ataque pessoal ou sem relação moveleira',
    description:
      'Comentário contendo ataques de cunho pessoal, agressões verbais ou sem pertinência com atendimento moveleiro.',
    advertiser_message_template:
      'A avaliação recebida foi submetida a moderação por extrapolar os limites do relato factual de atendimento.',
    notifier_message_template:
      'Sua avaliação foi recusada por conter expressões de ofensa pessoal em desacordo com as diretrizes da Política de Avaliações.',
    severity: 'normal',
    created_at: new Date().toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000005',
    code: 'crime_ou_fraude_grave',
    policy_source: 'termos_uso',
    title: 'Ilícito grave ou tentativa de fraude',
    description:
      'Tentativa evidente de golpe, estelionato, falsidade ideológica ou ilícito penal gravíssimo.',
    advertiser_message_template:
      'Sua conta e publicações foram suspensas cautelarmente nos termos da lei e das cláusulas de segurança dos Termos de Uso.',
    notifier_message_template:
      'O conteúdo foi imediatamente ocultado e os registros telemáticos foram preservados para encaminhamento às autoridades competentes.',
    severity: 'gravissimo',
    created_at: new Date().toISOString(),
  },
];

