export const recentDonations = [
  { id: 1, name: 'João Silva', amount: 'R$ 50,00', date: '12/05/2024' },
  { id: 2, name: 'Ana Paula', amount: 'R$ 100,00', date: '11/05/2024' },
  { id: 3, name: 'Maria Santos', amount: 'R$ 25,00', date: '10/05/2024' },
];

export const initialItemsReceived = [
  { id: 1, name: 'Roupas de inverno', donor: 'Mariana Santos', date: '12/05/2024', status: 'Recebido', icon: '👕', category: 'Roupas' },
  { id: 2, name: 'Alimentos não perecíveis', donor: 'João Silva', date: '11/05/2024', status: 'Recebido', icon: '🥫', category: 'Alimentos' },
  { id: 3, name: 'Brinquedos educativos', donor: 'Carla Lima', date: '10/05/2024', status: 'Recebido', icon: '🧸', category: 'Brinquedos' },
  { id: 4, name: 'Cadeiras de plástico', donor: 'Empresa XYZ', date: '09/05/2024', status: 'Recebido', icon: '🪑', category: 'Outros' },
  { id: 5, name: 'Agasalhos infantis', donor: 'Roberto Alves', date: '08/05/2024', status: 'Recebido', icon: '🧥', category: 'Roupas' },
];

export const initialItemRequests = [
  { id: 1, name: 'Cestas básicas', qty: '50 unidades', urgency: 'Alta', date: '12/05/2024', status: 'Pendente' },
  { id: 2, name: 'Roupas masculinas', qty: '100 unidades', urgency: 'Média', date: '10/05/2024', status: 'Pendente' },
  { id: 3, name: 'Material escolar', qty: '30 kits', urgency: 'Baixa', date: '08/05/2024', status: 'Pendente' },
];

export const financialHistory = [
  { id: 1, type: 'Doação via PIX', amount: '+ R$ 50,00', date: '12/05/2024', isIncome: true },
  { id: 2, type: 'Doação Cartão', amount: '+ R$ 100,00', date: '11/05/2024', isIncome: true },
  { id: 3, type: 'Pagamento Energia', amount: '- R$ 200,00', date: '10/05/2024', isIncome: false },
  { id: 4, type: 'Doação Boleto', amount: '+ R$ 500,00', date: '09/05/2024', isIncome: true },
  { id: 5, type: 'Compra de Materiais', amount: '- R$ 150,00', date: '08/05/2024', isIncome: false },
  { id: 6, type: 'Doação via PIX', amount: '+ R$ 25,00', date: '07/05/2024', isIncome: true },
];

export const receiptsList = [
  { id: 1, ref: 'Comprovante #54321', desc: '12/05/2024 - R$ 50,00' },
  { id: 2, ref: 'Comprovante #54320', desc: '10/05/2024 - R$ 100,00' },
  { id: 3, ref: 'Comprovante #54319', desc: '10/05/2024 - R$ 25,00' },
];

export const donationsList = [
  { id: 101, donor: 'João Silva', amount: 50.00, date: '12/05/2024', method: 'PIX', status: 'Concluído' },
  { id: 102, donor: 'Ana Paula', amount: 100.00, date: '11/05/2024', method: 'Cartão de Crédito', status: 'Concluído' },
  { id: 103, donor: 'Empresa XYZ', amount: 500.00, date: '10/05/2024', method: 'Boleto', status: 'Pendente' },
  { id: 104, donor: 'Carlos Eduardo', amount: 150.00, date: '09/05/2024', method: 'PIX', status: 'Concluído' },
  { id: 105, donor: 'Maria Santos', amount: 25.00, date: '08/05/2024', method: 'PIX', status: 'Concluído' },
  { id: 106, donor: 'Roberto Alves', amount: 80.00, date: '07/05/2024', method: 'Cartão de Crédito', status: 'Concluído' },
  { id: 107, donor: 'Fernanda Lima', amount: 200.00, date: '06/05/2024', method: 'Boleto', status: 'Concluído' },
];
