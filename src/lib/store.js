// Repositório em memória/localStorage sincronizado com a modelagem do PostgreSQL/Drizzle
const OS_STORAGE_KEY = 'easycell_ordens_servico';
const ESTOQUE_STORAGE_KEY = 'easycell_estoque_itens';
const CAIXA_STORAGE_KEY = 'easycell_caixa_movimentacoes';

// Mock inicial realista de itens de estoque (Peças, Mão de Obra e Aparelhos por IMEI)
const INITIAL_ESTOQUE = [
  { id: 'est_1', codigo: 'PEC-001', nome: 'Tela Original iPhone 13 Pro OLED', tipo: 'peca_reposicao', imei: null, quantidade: 4, quantidadeMinima: 2, precoCusto: 42000, precoVenda: 75000 },
  { id: 'est_2', codigo: 'PEC-002', nome: 'Bateria Premium iPhone 11 100% Saúde', tipo: 'peca_reposicao', imei: null, quantidade: 8, quantidadeMinima: 3, precoCusto: 8500, precoVenda: 22000 },
  { id: 'est_3', codigo: 'PEC-003', nome: 'Conector de Carga USB-C Galaxy S22', tipo: 'peca_reposicao', imei: null, quantidade: 1, quantidadeMinima: 2, precoCusto: 3500, precoVenda: 16000 },
  { id: 'est_4', codigo: 'SRV-001', nome: 'Troca de Vidro / Recondicionamento', tipo: 'servico', imei: null, quantidade: 999, quantidadeMinima: 0, precoCusto: 3000, precoVenda: 18000 },
  { id: 'est_5', codigo: 'SRV-002', nome: 'Desoxidação & Limpeza Ultrassônica', tipo: 'servico', imei: null, quantidade: 999, quantidadeMinima: 0, precoCusto: 1000, precoVenda: 15000 },
  { id: 'est_6', codigo: 'AP-001', nome: 'iPhone 12 128GB Azul Impecável (Seminovo)', tipo: 'aparelho_usado', imei: '354892019482711', quantidade: 1, quantidadeMinima: 1, precoCusto: 170000, precoVenda: 245000 },
];

// Mock inicial de Ordens de Serviço
const INITIAL_OS = [
  {
    id: 'os_1001',
    numeroOs: 1001,
    clienteNome: 'Carlos Eduardo Mendes',
    clienteWhatsapp: '21 99876-5432',
    clienteCpf: '123.456.789-00',
    aparelhoMarca: 'Apple',
    aparelhoModelo: 'iPhone 13 Pro',
    aparelhoCor: 'Grafite',
    aparelhoImei: '354981098234123',
    senhaTipo: 'padrao_pontos',
    senhaValor: '[1,2,5,8,9]',
    defeitoRelatado: 'Tela trincada após queda e bateria descarregando rápido',
    diagnosticoTecnico: 'Display com linhas verticais. Estrutura interna e FaceID preservados.',
    laudoFotos: {
      frenteUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop&q=80',
      traseiraUrl: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&auto=format&fit=crop&q=80',
      lateraisUrl: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600&auto=format&fit=crop&q=80',
      conectorUrl: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&auto=format&fit=crop&q=80',
    },
    checklistEntrada: {
      telaLigando: true,
      touchOk: false,
      cameraFrontal: true,
      cameraTraseira: true,
      conectorCarga: true,
      altoFalante: true,
      microfone: true,
      wifiBluetooth: true,
      biometriaFaceId: true,
      botoesFisicos: true,
      carcacaAvariada: true,
    },
    status: 'aprovado_reparo',
    valorPecas: 75000,
    valorMaoDeObra: 15000,
    valorTotal: 90000,
    valorAdiantamento: 20000,
    formaPagamento: null,
    criadoEm: new Date(Date.now() - 3600000 * 4).toISOString(),
    itens: [
      { id: 'it_1', descricao: 'Tela Original iPhone 13 Pro OLED', valorUnitario: 75000, quantidade: 1, garantiaDias: 90 },
      { id: 'it_2', descricao: 'Mão de obra especializada', valorUnitario: 15000, quantidade: 1, garantiaDias: 90 }
    ]
  },
  {
    id: 'os_1002',
    numeroOs: 1002,
    clienteNome: 'Mariana Silveira',
    clienteWhatsapp: '11 98123-4567',
    clienteCpf: '987.654.321-11',
    aparelhoMarca: 'Samsung',
    aparelhoModelo: 'Galaxy S22 Ultra',
    aparelhoCor: 'Vinho',
    aparelhoImei: '358912093847561',
    senhaTipo: 'pin_numerico',
    senhaValor: '2468',
    defeitoRelatado: 'Não carrega no cabo USB-C, apenas por indução',
    diagnosticoTecnico: 'Conector de carga oxidado por umidade.',
    laudoFotos: {
      frenteUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80',
      traseiraUrl: 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=600&auto=format&fit=crop&q=80',
      lateraisUrl: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80',
      conectorUrl: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&auto=format&fit=crop&q=80',
    },
    checklistEntrada: {
      telaLigando: true,
      touchOk: true,
      cameraFrontal: true,
      cameraTraseira: true,
      conectorCarga: false,
      altoFalante: true,
      microfone: true,
      wifiBluetooth: true,
      biometriaFaceId: true,
      botoesFisicos: true,
      carcacaAvariada: false,
    },
    status: 'entrada',
    valorPecas: 16000,
    valorMaoDeObra: 12000,
    valorTotal: 28000,
    valorAdiantamento: 0,
    formaPagamento: null,
    criadoEm: new Date(Date.now() - 3600000 * 1).toISOString(),
    itens: [
      { id: 'it_3', descricao: 'Conector de Carga USB-C Galaxy S22', valorUnitario: 16000, quantidade: 1, garantiaDias: 90 }
    ]
  },
  {
    id: 'os_1003',
    numeroOs: 1003,
    clienteNome: 'Rodrigo Barbosa',
    clienteWhatsapp: '21 97654-3210',
    clienteCpf: '456.789.123-22',
    aparelhoMarca: 'Apple',
    aparelhoModelo: 'iPhone 11',
    aparelhoCor: 'Branco',
    aparelhoImei: '351298471092837',
    senhaTipo: 'padrao_pontos',
    senhaValor: '[1,4,7,8,9]',
    defeitoRelatado: 'Troca de bateria com aviso de manutenção',
    diagnosticoTecnico: 'Bateria com 71% de capacidade. Pronto para entrega.',
    laudoFotos: {
      frenteUrl: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600&auto=format&fit=crop&q=80',
      traseiraUrl: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&auto=format&fit=crop&q=80',
      lateraisUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop&q=80',
      conectorUrl: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&auto=format&fit=crop&q=80',
    },
    checklistEntrada: {
      telaLigando: true,
      touchOk: true,
      cameraFrontal: true,
      cameraTraseira: true,
      conectorCarga: true,
      altoFalante: true,
      microfone: true,
      wifiBluetooth: true,
      biometriaFaceId: true,
      botoesFisicos: true,
      carcacaAvariada: false,
    },
    status: 'pronto_retirada',
    valorPecas: 22000,
    valorMaoDeObra: 8000,
    valorTotal: 30000,
    valorAdiantamento: 30000,
    formaPagamento: 'PIX',
    criadoEm: new Date(Date.now() - 3600000 * 24).toISOString(),
    itens: [
      { id: 'it_4', descricao: 'Bateria Premium iPhone 11 100% Saúde', valorUnitario: 22000, quantidade: 1, garantiaDias: 90 }
    ]
  }
];

export const easyCellStore = {
  // Ordens de Serviço
  getOrders: () => {
    const raw = localStorage.getItem(OS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(OS_STORAGE_KEY, JSON.stringify(INITIAL_OS));
      return INITIAL_OS;
    }
    return JSON.parse(raw);
  },

  getOrderById: (id) => {
    const orders = easyCellStore.getOrders();
    return orders.find(o => o.id === id || String(o.numeroOs) === String(id)) || null;
  },

  createOrder: (newOrderData) => {
    const orders = easyCellStore.getOrders();
    const nextNumber = orders.length > 0 ? Math.max(...orders.map(o => o.numeroOs)) + 1 : 1001;
    
    const newOrder = {
      id: `os_${nextNumber}`,
      numeroOs: nextNumber,
      criadoEm: new Date().toISOString(),
      status: 'entrada',
      valorTotal: (newOrderData.valorPecas || 0) + (newOrderData.valorMaoDeObra || 0),
      itens: [],
      ...newOrderData
    };

    const updated = [newOrder, ...orders];
    localStorage.setItem(OS_STORAGE_KEY, JSON.stringify(updated));
    return newOrder;
  },

  updateOrderStatus: (orderId, newStatus) => {
    const orders = easyCellStore.getOrders();
    const updated = orders.map(o => {
      if (o.id === orderId || String(o.numeroOs) === String(orderId)) {
        return { ...o, status: newStatus };
      }
      return o;
    });
    localStorage.setItem(OS_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  addItemToOrder: (orderId, itemData) => {
    const orders = easyCellStore.getOrders();
    const updated = orders.map(o => {
      if (o.id === orderId || String(o.numeroOs) === String(orderId)) {
        const itens = o.itens || [];
        const newItens = [...itens, { id: `it_${Date.now()}`, ...itemData }];
        const valorPecas = newItens.reduce((acc, it) => acc + (it.valorUnitario * it.quantidade), 0);
        return {
          ...o,
          itens: newItens,
          valorPecas,
          valorTotal: valorPecas + (o.valorMaoDeObra || 0)
        };
      }
      return o;
    });
    localStorage.setItem(OS_STORAGE_KEY, JSON.stringify(updated));

    // Abate do estoque se houver itemId
    if (itemData.itemId) {
      easyCellStore.decrementStock(itemData.itemId, itemData.quantidade || 1);
    }
    return updated;
  },

  payAndCloseOrder: (orderId, formaPagamento, operadorNome = 'Balcão') => {
    const orders = easyCellStore.getOrders();
    let paidOrder = null;
    const updated = orders.map(o => {
      if (o.id === orderId || String(o.numeroOs) === String(orderId)) {
        paidOrder = {
          ...o,
          status: 'entregue_pago',
          formaPagamento,
          dataPagamento: new Date().toISOString()
        };
        return paidOrder;
      }
      return o;
    });
    localStorage.setItem(OS_STORAGE_KEY, JSON.stringify(updated));

    // Lança no Caixa
    if (paidOrder) {
      easyCellStore.addCaixaMovimentacao({
        ordemId: paidOrder.id,
        tipo: 'entrada_os',
        descricao: `Quitação O.S. #${paidOrder.numeroOs} (${paidOrder.aparelhoModelo})`,
        valor: paidOrder.valorTotal,
        metodoPagamento: formaPagamento,
        operadorNome
      });
    }
    return paidOrder;
  },

  // Estoque
  getStock: () => {
    const raw = localStorage.getItem(ESTOQUE_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ESTOQUE_STORAGE_KEY, JSON.stringify(INITIAL_ESTOQUE));
      return INITIAL_ESTOQUE;
    }
    return JSON.parse(raw);
  },

  decrementStock: (itemId, qtd = 1) => {
    const stock = easyCellStore.getStock();
    const updated = stock.map(s => {
      if (s.id === itemId) {
        return { ...s, quantidade: Math.max(0, s.quantidade - qtd) };
      }
      return s;
    });
    localStorage.setItem(ESTOQUE_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  addStockItem: (newItem) => {
    const stock = easyCellStore.getStock();
    const created = { id: `est_${Date.now()}`, ...newItem };
    const updated = [created, ...stock];
    localStorage.setItem(ESTOQUE_STORAGE_KEY, JSON.stringify(updated));
    return created;
  },

  // Caixa
  getCaixa: () => {
    const raw = localStorage.getItem(CAIXA_STORAGE_KEY);
    if (!raw) {
      const initial = [
        { id: 'cx_1', tipo: 'entrada_os', descricao: 'Quitação O.S. #1003 (iPhone 11)', valor: 30000, metodoPagamento: 'PIX', operadorNome: 'Atendente Balcão', criadoEm: new Date(Date.now() - 3600000 * 2).toISOString() }
      ];
      localStorage.setItem(CAIXA_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  },

  addCaixaMovimentacao: (mov) => {
    const caixa = easyCellStore.getCaixa();
    const created = { id: `cx_${Date.now()}`, criadoEm: new Date().toISOString(), ...mov };
    const updated = [created, ...caixa];
    localStorage.setItem(CAIXA_STORAGE_KEY, JSON.stringify(updated));
    return created;
  },

  // Fase 2: Laudo Pericial em PDF & SHA-256
  generateLaudoPdf: (orderId) => {
    const orders = easyCellStore.getOrders();
    let updatedOrder = null;
    const updated = orders.map((o) => {
      if (o.id === orderId || String(o.numeroOs) === String(orderId)) {
        let hash = '';
        for (let i = 0; i < 64; i++) {
          hash += '0123456789abcdef'[Math.floor(Math.random() * 16)];
        }
        const pdfUrl = `https://easycell.vibedocode.pro/docs/laudos/laudo-os-${o.numeroOs}-${hash.substring(0, 8)}.pdf`;
        updatedOrder = {
          ...o,
          laudoPdfUrl: pdfUrl,
          laudoPdfHash: hash,
          hashTracking: o.hashTracking || `tr_${o.numeroOs}`
        };
        return updatedOrder;
      }
      return o;
    });
    localStorage.setItem(OS_STORAGE_KEY, JSON.stringify(updated));
    return updatedOrder;
  },

  // Fase 2: Atribuição de Técnico na Bancada
  assignTechnician: (orderId, tecnicoId, tecnicoNome) => {
    const orders = easyCellStore.getOrders();
    const updated = orders.map((o) => {
      if (o.id === orderId || String(o.numeroOs) === String(orderId)) {
        return { ...o, tecnicoId, tecnicoNome };
      }
      return o;
    });
    localStorage.setItem(OS_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  // Fase 2: Cálculo de Comissão
  calculateCommission: (orderId, percentual = 30) => {
    const orders = easyCellStore.getOrders();
    const updated = orders.map((o) => {
      if (o.id === orderId || String(o.numeroOs) === String(orderId)) {
        const comissao = Math.round((o.valorMaoDeObra * percentual) / 100);
        return { ...o, comissaoValor: comissao, comissaoPaga: false };
      }
      return o;
    });
    localStorage.setItem(OS_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  }
};

// Aliases de conveniência
export const getOrdens = () => easyCellStore.getOrders();
export const updateOrdemStatus = (id, st) => easyCellStore.updateOrderStatus(id, st);
export const getOrdemById = (id) => easyCellStore.getOrderById(id);
export const generateLaudoPdf = (id) => easyCellStore.generateLaudoPdf(id);
