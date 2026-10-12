// Mock store de técnicos e comissões da Fase 2
const tecnicosStore = [
  {
    id: 'tec_1',
    nome: 'Carlos Alexandre Silva',
    especialidade: 'Hardware & Micro-soldagem de Placas',
    telefone: '11 98765-4321',
    percentualComissao: 35,
    ativo: true,
    totalOsMes: 18,
    totalComissaoMes: 245000 // R$ 2.450,00 em centavos
  },
  {
    id: 'tec_2',
    nome: 'Mariana Duarte Souza',
    especialidade: 'Telas OLED & Recuperação de FaceID',
    telefone: '11 97654-3210',
    percentualComissao: 30,
    ativo: true,
    totalOsMes: 24,
    totalComissaoMes: 312000 // R$ 3.120,00 em centavos
  },
  {
    id: 'tec_3',
    nome: 'Felipe Santos Oliveira',
    especialidade: 'Baterias, Carcaças & Periféricos',
    telefone: '11 96543-2109',
    percentualComissao: 25,
    ativo: true,
    totalOsMes: 15,
    totalComissaoMes: 165000 // R$ 1.650,00 em centavos
  }
];

const comissoesStore = [
  {
    id: 'com_1',
    ordemId: 'os_1001',
    numeroOs: 1001,
    tecnicoId: 'tec_1',
    tecnicoNome: 'Carlos Alexandre Silva',
    aparelho: 'iPhone 13 Pro',
    valorMaoDeObra: 15000,
    percentualAplicado: 35,
    valorComissao: 5250, // 35% de R$ 150 = R$ 52,50
    statusPagamento: 'pendente',
    criadoEm: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: 'com_2',
    ordemId: 'os_1002',
    numeroOs: 1002,
    tecnicoId: 'tec_2',
    tecnicoNome: 'Mariana Duarte Souza',
    aparelho: 'Galaxy S22 Ultra',
    valorMaoDeObra: 22000,
    percentualAplicado: 30,
    valorComissao: 6600, // 30% de R$ 220 = R$ 66,00
    statusPagamento: 'pago',
    dataQuitacao: new Date(Date.now() - 3600000 * 2).toISOString(),
    responsavelQuitacao: 'Administrador Balcão',
    criadoEm: new Date(Date.now() - 3600000 * 24).toISOString()
  }
];

export async function tecnicosRoutes(fastify, options) {
  // Lista de técnicos
  fastify.get('/api/v1/tecnicos', async (request, reply) => {
    return reply.send({
      total: tecnicosStore.length,
      tecnicos: tecnicosStore
    });
  });

  // Cadastro de novo técnico
  fastify.post('/api/v1/tecnicos', async (request, reply) => {
    const { nome, especialidade, telefone, percentualComissao } = request.body || {};

    if (!nome) {
      return reply.status(400).send({ error: 'Nome do técnico é obrigatório' });
    }

    const novoTecnico = {
      id: `tec_${Date.now()}`,
      nome,
      especialidade: especialidade || 'Assistência Geral',
      telefone: telefone || '',
      percentualComissao: Number(percentualComissao) || 30,
      ativo: true,
      totalOsMes: 0,
      totalComissaoMes: 0
    };

    tecnicosStore.push(novoTecnico);
    return reply.status(201).send({ sucesso: true, tecnico: novoTecnico });
  });

  // Extrato de comissões
  fastify.get('/api/v1/tecnicos/comissoes', async (request, reply) => {
    return reply.send({
      total: comissoesStore.length,
      comissoes: comissoesStore
    });
  });

  // Dar baixa de quitação em comissão
  fastify.post('/api/v1/tecnicos/comissoes/:id/pagar', async (request, reply) => {
    const { id } = request.params;
    const item = comissoesStore.find((c) => c.id === id);

    if (!item) {
      return reply.status(404).send({ error: 'Registro de comissão não encontrado' });
    }

    item.statusPagamento = 'pago';
    item.dataQuitacao = new Date().toISOString();
    item.responsavelQuitacao = request.body?.responsavel || 'Administrador EasyCell';

    return reply.send({ sucesso: true, comissao: item });
  });
}
