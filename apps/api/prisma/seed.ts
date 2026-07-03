// ============================================================================
//  Seed inicial — dá a partida operacional na plataforma.
//  Cria: catálogo de permissões base, hierarquia de papéis da prefeitura,
//  uma secretaria de exemplo e o primeiro Administrador Geral.
//  Rodar:  pnpm --filter @ljari/api prisma:seed
// ============================================================================
import { PrismaClient, AcaoPermissao } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

// Hierarquia de papéis conforme a especificação
const PAPEIS = [
  'Administrador Geral', 'Prefeito', 'Vice-Prefeito', 'Controladoria',
  'Procuradoria', 'Secretário', 'Diretor', 'Coordenador',
  'Chefe de Departamento', 'Servidor', 'Operador', 'Cidadão',
];

// Recursos iniciais (cada módulo registrará os seus ao ser implementado)
const RECURSOS_BASE = [
  'admin.usuarios', 'admin.perfis', 'admin.permissoes', 'admin.secretarias', 'admin.workflow',
  'compras.fornecedores', 'compras.solicitacoes', 'compras.processos', 'compras.contratos',
  'processos.protocolos',
];
const TODAS_ACOES = Object.values(AcaoPermissao);

async function main() {
  console.log('🌱 Semeando dados iniciais...');

  // 1) Permissões base (produto cartesiano recurso × ação)
  for (const recurso of RECURSOS_BASE) {
    for (const acao of TODAS_ACOES) {
      await prisma.permission.upsert({
        where: { recurso_acao: { recurso, acao } },
        update: {},
        create: { recurso, acao, descricao: `${acao} em ${recurso}` },
      });
    }
  }

  // 1b) Permissão coringa: concede acesso total (reconhecida pelo PermissionsGuard).
  await prisma.permission.upsert({
    where: { recurso_acao: { recurso: '*', acao: AcaoPermissao.ADMINISTRAR } },
    update: {},
    create: { recurso: '*', acao: AcaoPermissao.ADMINISTRAR, descricao: 'Acesso total (super administrador)' },
  });

  // 2) Papéis
  for (const nome of PAPEIS) {
    await prisma.role.upsert({
      where: { nome },
      update: {},
      create: { nome, sistema: nome === 'Administrador Geral' },
    });
  }

  // 3) Administrador Geral recebe TODAS as permissões
  const adminRole = await prisma.role.findUniqueOrThrow({ where: { nome: 'Administrador Geral' } });
  const todas = await prisma.permission.findMany();
  for (const p of todas) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: adminRole.id, permissionId: p.id } },
      update: {},
      create: { roleId: adminRole.id, permissionId: p.id },
    });
  }

  // 4) Secretaria de exemplo
  const secretaria = await prisma.secretaria.upsert({
    where: { sigla: 'SEMAD' },
    update: {},
    create: { nome: 'Secretaria Municipal de Administração', sigla: 'SEMAD' },
  });

  // 5) Primeiro Administrador Geral
  const email = 'admin@laranjaldojari.ap.gov.br';
  const senhaHash = await argon2.hash('Mudar@123', { type: argon2.argon2id });
  const admin = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { nome: 'Administrador Geral', email, cpf: '00000000000', senhaHash, secretariaId: secretaria.id },
  });
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: admin.id, roleId: adminRole.id } },
    update: {},
    create: { userId: admin.id, roleId: adminRole.id },
  });

  console.log('✅ Seed concluído.');
  console.log(`   Login: ${email}  |  Senha: Mudar@123  (troque no primeiro acesso)`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
