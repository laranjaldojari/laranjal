import {
  LayoutDashboard, Users, Banknote, Receipt, ShoppingCart, Boxes, Package,
  Truck, HeartPulse, GraduationCap, HandHeart, Sprout, TreePine, HardHat,
  Drama, Plane, Trophy, Siren, MessageSquareWarning, FileStack, Newspaper,
  Eye, UserCircle, Settings, type LucideIcon,
} from 'lucide-react';

export interface ModuloNav {
  titulo: string;
  href: string;
  icon: LucideIcon;
  /** Recurso-base de permissão; o item só aparece se o usuário puder VISUALIZAR. */
  recurso: string;
  grupo: 'Geral' | 'Gestão' | 'Secretarias' | 'Cidadão & Atos';
}

/**
 * Navegação completa da plataforma. A visibilidade por permissão é resolvida
 * em tempo de render (quando o RBAC do front estiver ligado); por ora todos
 * aparecem para o Administrador Geral.
 */
export const MODULOS: ModuloNav[] = [
  { titulo: 'Painel', href: '/dashboard', icon: LayoutDashboard, recurso: 'dashboard', grupo: 'Geral' },

  { titulo: 'Administração', href: '/admin', icon: Settings, recurso: 'admin.usuarios', grupo: 'Gestão' },
  { titulo: 'Recursos Humanos', href: '/rh', icon: Users, recurso: 'rh.servidores', grupo: 'Gestão' },
  { titulo: 'Finanças', href: '/financas', icon: Banknote, recurso: 'financas.empenhos', grupo: 'Gestão' },
  { titulo: 'Tributação', href: '/tributacao', icon: Receipt, recurso: 'tributacao.iptu', grupo: 'Gestão' },
  { titulo: 'Compras', href: '/compras', icon: ShoppingCart, recurso: 'compras.solicitacoes', grupo: 'Gestão' },
  { titulo: 'Patrimônio', href: '/patrimonio', icon: Boxes, recurso: 'patrimonio.bens', grupo: 'Gestão' },
  { titulo: 'Almoxarifado', href: '/almoxarifado', icon: Package, recurso: 'almoxarifado.estoque', grupo: 'Gestão' },
  { titulo: 'Frota', href: '/frota', icon: Truck, recurso: 'frota.veiculos', grupo: 'Gestão' },

  { titulo: 'Saúde', href: '/saude', icon: HeartPulse, recurso: 'saude.pacientes', grupo: 'Secretarias' },
  { titulo: 'Educação', href: '/educacao', icon: GraduationCap, recurso: 'educacao.alunos', grupo: 'Secretarias' },
  { titulo: 'Assistência Social', href: '/assistencia', icon: HandHeart, recurso: 'assistencia.familias', grupo: 'Secretarias' },
  { titulo: 'Agricultura', href: '/agricultura', icon: Sprout, recurso: 'agricultura.produtores', grupo: 'Secretarias' },
  { titulo: 'Meio Ambiente', href: '/meio-ambiente', icon: TreePine, recurso: 'ambiente.licenciamento', grupo: 'Secretarias' },
  { titulo: 'Obras', href: '/obras', icon: HardHat, recurso: 'obras.projetos', grupo: 'Secretarias' },
  { titulo: 'Cultura', href: '/cultura', icon: Drama, recurso: 'cultura.eventos', grupo: 'Secretarias' },
  { titulo: 'Turismo', href: '/turismo', icon: Plane, recurso: 'turismo.atrativos', grupo: 'Secretarias' },
  { titulo: 'Esporte', href: '/esporte', icon: Trophy, recurso: 'esporte.atletas', grupo: 'Secretarias' },
  { titulo: 'Defesa Civil', href: '/defesa-civil', icon: Siren, recurso: 'defesacivil.ocorrencias', grupo: 'Secretarias' },

  { titulo: 'Ouvidoria', href: '/ouvidoria', icon: MessageSquareWarning, recurso: 'ouvidoria.protocolos', grupo: 'Cidadão & Atos' },
  { titulo: 'Processo Eletrônico', href: '/processos', icon: FileStack, recurso: 'processos.protocolos', grupo: 'Cidadão & Atos' },
  { titulo: 'Diário Oficial', href: '/diario', icon: Newspaper, recurso: 'diario.publicacoes', grupo: 'Cidadão & Atos' },
  { titulo: 'Transparência', href: '/transparencia', icon: Eye, recurso: 'transparencia.receitas', grupo: 'Cidadão & Atos' },
  { titulo: 'Portal do Cidadão', href: '/cidadao', icon: UserCircle, recurso: 'cidadao.protocolos', grupo: 'Cidadão & Atos' },
];

export const GRUPOS = ['Geral', 'Gestão', 'Secretarias', 'Cidadão & Atos'] as const;
