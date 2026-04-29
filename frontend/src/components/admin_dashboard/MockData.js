export const dashboardStats = {
  totalDoado: "R$ 256.780,50",
  totalDoacoes: "2.847",
  ongsCadastradas: "156",
  usuariosCadastrados: "1.248"
};

export const chartData = [
  { name: 'Jan', value: 300 },
  { name: 'Fev', value: 500 },
  { name: 'Mar', value: 400 },
  { name: 'Abr', value: 700 },
  { name: 'Mai', value: 600 },
  { name: 'Jun', value: 1200 },
];

export const relatorioBarData = [
  { name: 'SP', value: 45000 },
  { name: 'RJ', value: 32000 },
  { name: 'MG', value: 28000 },
  { name: 'RS', value: 15000 },
  { name: 'PR', value: 12000 },
];

export const pieData = [
  { name: 'Financeira', value: 70 },
  { name: 'Itens', value: 30 },
];
export const COLORS = ['#16a34a', '#86efac']; // Adapted to green theme

export const todasDoacoes = [
  { id: 1, data: '12/05/2024', doador: 'João Silva', tipo: 'Financeira', valorItens: 'R$ 50,00', destinatario: 'ONG Vida Nova' },
  { id: 2, data: '12/05/2024', doador: 'Mariana Santos', tipo: 'Itens', valorItens: 'Roupas', destinatario: 'Instituto Luz' },
  { id: 3, data: '11/05/2024', doador: 'Ana Paula', tipo: 'Financeira', valorItens: 'R$ 100,00', destinatario: 'ONG Amigos do Bem' },
  { id: 4, data: '11/05/2024', doador: 'Carlos Lima', tipo: 'Itens', valorItens: 'Alimentos', destinatario: 'Projeto Vida' },
  { id: 5, data: '10/05/2024', doador: 'Beatriz Costa', tipo: 'Financeira', valorItens: 'R$ 25,00', destinatario: 'ONG Esperança' },
  { id: 6, data: '09/05/2024', doador: 'Roberto Alves', tipo: 'Financeira', valorItens: 'R$ 200,00', destinatario: 'Instituto Luz' },
  { id: 7, data: '09/05/2024', doador: 'Fernanda Lima', tipo: 'Itens', valorItens: 'Material Escolar', destinatario: 'Projeto Aprender' },
  { id: 8, data: '08/05/2024', doador: 'Lucas Silva', tipo: 'Financeira', valorItens: 'R$ 30,00', destinatario: 'ONG Vida Nova' },
  { id: 9, data: '08/05/2024', doador: 'Juliana Mendes', tipo: 'Itens', valorItens: 'Brinquedos', destinatario: 'Criança Feliz' },
  { id: 10, data: '07/05/2024', doador: 'Marcos Paulo', tipo: 'Financeira', valorItens: 'R$ 150,00', destinatario: 'Amigos do Bem' },
];

export const ongsData = [
  { id: 1, nome: 'Instituto Luz', cnpj: '13.436.786/0001-00', contato: 'contato@institutoluz.org', status: 'Pendentes', icon: 'I' },
  { id: 2, nome: 'Projeto Vida', cnpj: '58.743.402/0001-11', contato: 'contato@projetovida.org', status: 'Pendentes', icon: 'V' },
  { id: 3, nome: 'ONG Esperança', cnpj: '11.023.013/0001-44', contato: 'contato@ongesperanca.org', status: 'Pendentes', icon: 'E' },
  { id: 4, nome: 'Ação Social SP', cnpj: '22.111.333/0001-55', contato: 'ola@acaosocial.org', status: 'Aprovadas', icon: 'A' },
  { id: 5, nome: 'Caminho Certo', cnpj: '44.555.666/0001-77', contato: 'contato@caminhocerto.org', status: 'Aprovadas', icon: 'C' },
  { id: 6, nome: 'Falso Instituto', cnpj: '00.000.000/0001-00', contato: 'fake@instituto.org', status: 'Reprovadas', icon: 'F' },
];

export const usuariosData = [
  { id: 1, nome: 'João Silva', email: 'joao@email.com', tipo: 'Doador', status: 'Ativo' },
  { id: 2, nome: 'Mariana Santos', email: 'mariana@email.com', tipo: 'Doador', status: 'Ativo' },
  { id: 3, nome: 'ONG Vida Nova', email: 'contato@vidanova.org', tipo: 'ONG', status: 'Ativo' },
  { id: 4, nome: 'Admin', email: 'admin@conectabem.com', tipo: 'Administrador', status: 'Ativo' },
  { id: 5, nome: 'Carlos Lima', email: 'carlos@email.com', tipo: 'Doador', status: 'Inativo' },
  { id: 6, nome: 'Instituto Luz', email: 'contato@institutoluz.org', tipo: 'ONG', status: 'Ativo' },
];
