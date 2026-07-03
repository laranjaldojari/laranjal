# PRD — Plataforma Municipal Integrada
### Prefeitura Municipal de Laranjal do Jari / AP

| | |
|---|---|
| **Documento** | Product Requirements Document (PRD) |
| **Versão** | 1.0 (Onda 1 — fundação + módulos prioritários) |
| **Status** | Em elaboração gradativa |
| **Complementa** | Especificação de Arquitetura (prompt inicial) |
| **Público** | Equipe de engenharia, gestão da prefeitura, controladoria, fornecedores |

> Este PRD traduz a especificação de arquitetura em **requisitos funcionais (RF)** e **não funcionais (RNF)** verificáveis. Ele é o contrato entre o que a plataforma deve fazer e como será aceita. Os requisitos não funcionais e transversais estão **completos** nesta versão; os módulos de negócio são detalhados em ondas, seguindo o mesmo template.

---

## 1. Introdução

### 1.1 Objetivo do documento
Especificar, de forma testável, o comportamento esperado da Plataforma Municipal Integrada — um ERP público modular que administra todas as secretarias da Prefeitura de Laranjal do Jari em uma única base autenticada e auditável. Cada requisito possui identificador único, prioridade e critérios de aceite, permitindo rastreabilidade do código aos testes.

### 1.2 Escopo
**Dentro do escopo:** gestão administrativa, de pessoal, orçamentária/financeira, tributária, de compras, patrimônio, almoxarifado, frota e das secretarias finalísticas (Saúde, Educação, Assistência Social, etc.), além dos portais de transparência e do cidadão, diário oficial e processo eletrônico.

**Fora do escopo (nesta fase):** substituição de sistemas estruturantes federais (eSocial, SICONFI, PNCP) — a plataforma **integra-se** a eles, não os substitui; emissão de documentos fiscais sob responsabilidade de terceiros (ex.: certificação ICP-Brasil é consumida, não emitida).

### 1.3 Definições e glossário
| Termo | Significado |
|---|---|
| **SSO** | Single Sign-On — autenticação única para todos os módulos |
| **RBAC** | Role-Based Access Control — controle de acesso por papéis |
| **MFA/2FA** | Múltiplo fator de autenticação (TOTP) |
| **Soft delete** | Exclusão lógica (registro marcado, nunca apagado fisicamente) |
| **LGPD** | Lei Geral de Proteção de Dados (Lei 13.709/2018) |
| **LRF** | Lei de Responsabilidade Fiscal (LC 101/2000) |
| **PNCP** | Portal Nacional de Contratações Públicas (Lei 14.133/2021) |
| **NFS-e** | Nota Fiscal de Serviços eletrônica |
| **CadÚnico** | Cadastro Único para Programas Sociais do Governo Federal |
| **TCE-AP** | Tribunal de Contas do Estado do Amapá |
| **DR** | Disaster Recovery — recuperação de desastres |
| **SLA** | Service Level Agreement — acordo de nível de serviço |

### 1.4 Convenções
- **IDs de requisito:** `RNF-<categoria>-<n>` (não funcional), `RFT-<n>` (funcional transversal), `RF-<sigla do módulo>-<n>` (funcional de módulo).
- **Prioridade (MoSCoW):** **M** = obrigatório (Must), **S** = importante (Should), **C** = desejável (Could), **W** = futuro (Won't now).
- **Critério de aceite:** condição objetiva que valida o requisito (base dos testes).

### 1.5 Atores
Hierarquia de papéis já modelada no kernel (RBAC). Resumo dos atores e foco de uso:

| Ator | Foco principal |
|---|---|
| Administrador Geral | Configuração da plataforma, usuários, permissões |
| Prefeito / Vice | Dashboards executivos, aprovações de alto nível, assinaturas |
| Controladoria | Auditoria, conformidade, trilhas, relatórios de controle interno |
| Procuradoria | Pareceres, processos, contratos, dívida ativa |
| Secretário | Gestão da própria secretaria e indicadores |
| Diretor / Coordenador / Chefe de Depto. | Operação e aprovação no seu nível |
| Servidor / Operador | Execução das rotinas do dia a dia |
| Cidadão | Portal do cidadão: protocolos, tributos, certidões, agendamentos |

---

## 2. Visão geral do produto

### 2.1 Contexto e problema
A gestão municipal opera hoje, tipicamente, com sistemas fragmentados por secretaria, dados duplicados, baixa rastreabilidade e dificuldade de prestar contas a órgãos de controle e à população. A plataforma unifica cadastros, autentica de forma central e audita todas as operações.

### 2.2 Objetivos e métricas de sucesso (KPIs)
| Objetivo | KPI / meta |
|---|---|
| Unificar o acesso | 100% dos módulos sob SSO |
| Rastreabilidade total | 100% das operações de escrita auditadas |
| Transparência ativa | Dados publicados no portal em até 24h da execução |
| Disponibilidade | ≥ 99,5% mensal em horário útil |
| Adoção | Migração progressiva por secretaria, sem perda de histórico |
| Conformidade | Aderência a LGPD, LRF, Lei 14.133, Lei 4.320 e exigências do TCE-AP |

### 2.3 Premissas e restrições
- **Pr-1:** Conectividade pode ser intermitente em unidades remotas (zona rural, UBS isoladas) — telas críticas devem degradar com elegância e dar feedback claro de falha.
- **Pr-2:** Certificados digitais ICP-Brasil (e/ou gov.br) são fornecidos pela prefeitura para assinatura eletrônica.
- **Re-1:** Integrações com sistemas federais/estaduais dependem de credenciais e disponibilidade de terceiros (PNCP, SICONFI, eSocial, TCE-AP, gov.br).
- **Re-2:** Dados pessoais sensíveis (saúde, assistência social) exigem base legal e minimização (LGPD).

---

## 3. Requisitos Não Funcionais (RNF)

> Aplicam-se a **toda** a plataforma e a todo módulo presente e futuro. São a base dos testes de aceite não funcionais.

### 3.1 Segurança (SEG)
| ID | Requisito | Prio. | Critério de aceite |
|---|---|---|---|
| RNF-SEG-1 | Todo tráfego sob HTTPS/TLS 1.2+ | M | Requisições em HTTP são redirecionadas para HTTPS; nota A em teste SSL |
| RNF-SEG-2 | Senhas armazenadas com Argon2id | M | Nenhuma senha em texto claro ou hash reversível na base |
| RNF-SEG-3 | Sessão via JWT de acesso curto + refresh rotativo | M | Access token expira em ≤15 min; refresh armazenado apenas como hash |
| RNF-SEG-4 | MFA (TOTP) disponível e exigível por papel | M | Papéis sensíveis (Admin, Prefeito, Controladoria) podem ter MFA obrigatório |
| RNF-SEG-5 | Autorização RBAC + permissões individuais; DENY vence GRANT | M | Acesso negado retorna 403 com a permissão exigida |
| RNF-SEG-6 | Rate limiting global e reforçado no login | M | ≤5 tentativas de login/min por IP; bloqueio temporório progressivo |
| RNF-SEG-7 | Cabeçalhos de segurança (Helmet) e CSP restritiva | M | Sem `unsafe-eval`; CSP bloqueia origens não autorizadas |
| RNF-SEG-8 | Proteção contra SQL Injection | M | Acesso a dados exclusivamente via ORM parametrizado (Prisma) |
| RNF-SEG-9 | Proteção contra XSS e sanitização de entradas | M | Saídas escapadas; entradas validadas por schema (Zod/class-validator) |
| RNF-SEG-10 | Proteção contra CSRF | M | Operações de escrita exigem token/origem validada |
| RNF-SEG-11 | Registro de IP, user-agent e dispositivo por sessão | M | Cada refresh token guarda IP/UA; visível ao usuário em "minhas sessões" |
| RNF-SEG-12 | Revogação de sessões e logout global | S | Admin/usuário revoga sessões; tokens revogados deixam de funcionar |
| RNF-SEG-13 | Segredos fora do código (variáveis de ambiente/cofre) | M | Nenhum segredo versionado no repositório |
| RNF-SEG-14 | Política de senha forte e troca obrigatória no 1º acesso | S | Mínimo 8 caracteres com complexidade; admin inicial força troca |

### 3.2 Privacidade e LGPD (LGPD)
| ID | Requisito | Prio. | Critério de aceite |
|---|---|---|---|
| RNF-LGPD-1 | Base legal registrada por tratamento de dado pessoal | M | Cada finalidade de uso possui base legal documentada |
| RNF-LGPD-2 | Minimização: coletar só o necessário por finalidade | M | Campos sensíveis justificados; sem coleta excedente |
| RNF-LGPD-3 | Trilha de acesso a dados pessoais sensíveis | M | Leitura de prontuário/assistência social é auditada (quem, quando) |
| RNF-LGPD-4 | Atendimento a direitos do titular | S | Exportar/retificar dados de um titular sob solicitação formal |
| RNF-LGPD-5 | Anonimização/pseudonimização em relatórios públicos | M | Portal da Transparência não expõe dado pessoal protegido |
| RNF-LGPD-6 | Retenção e descarte conforme tabela de temporalidade | C | Política de retenção configurável por tipo de dado |

### 3.3 Desempenho (DES)
| ID | Requisito | Prio. | Critério de aceite |
|---|---|---|---|
| RNF-DES-1 | Resposta de leitura típica < 500 ms (P95) | S | P95 de endpoints de consulta < 500 ms com base de carga padrão |
| RNF-DES-2 | Listagens sempre paginadas | M | Nenhum endpoint retorna coleção ilimitada |
| RNF-DES-3 | Cache de dados quentes (Redis) | S | Permissões e consultas frequentes servidas de cache |
| RNF-DES-4 | Operações pesadas em fila assíncrona (BullMQ) | M | Geração de relatórios/lotes não bloqueia a requisição HTTP |
| RNF-DES-5 | Índices nas colunas de busca e chaves estrangeiras | M | Consultas frequentes usam índice (sem full scan em produção) |

### 3.4 Escalabilidade e disponibilidade (ESC/DIS)
| ID | Requisito | Prio. | Critério de aceite |
|---|---|---|---|
| RNF-ESC-1 | API sem estado (stateless), escalável horizontalmente | M | Múltiplas instâncias atrás do proxy sem sessão local |
| RNF-ESC-2 | Suportar centenas de usuários simultâneos | M | Teste de carga atinge a meta sem degradação acima do SLA |
| RNF-ESC-3 | Módulos isoláveis em microserviços sem reescrita | M | Domínio depende de interfaces; nenhum acoplamento ao Prisma fora da infraestrutura |
| RNF-DIS-1 | Disponibilidade ≥ 99,5% mensal | S | Medida por monitoramento de uptime |
| RNF-DIS-2 | Health checks e reinício automático | M | Endpoints `/health` (liveness/readiness) usados pelo orquestrador |
| RNF-DIS-3 | Degradação graciosa em falha de dependência | S | Falha de serviço externo não derruba a aplicação |

### 3.5 Observabilidade (OBS)
| ID | Requisito | Prio. | Critério de aceite |
|---|---|---|---|
| RNF-OBS-1 | Logs estruturados (JSON) centralizados (Loki) | M | Logs pesquisáveis com correlação por requisição |
| RNF-OBS-2 | Métricas expostas (Prometheus) e dashboards (Grafana) | M | Latência, throughput e erros visíveis por endpoint |
| RNF-OBS-3 | Rastreamento de erros (Sentry) | S | Exceções não tratadas chegam ao Sentry com contexto |
| RNF-OBS-4 | Correlation ID por requisição | S | Cada log/erro associado a um ID rastreável |

### 3.6 Auditoria e integridade (AUD)
| ID | Requisito | Prio. | Critério de aceite |
|---|---|---|---|
| RNF-AUD-1 | Toda escrita registra antes/depois, autor, IP e horário | M | `AuditLog` populado automaticamente em POST/PUT/PATCH/DELETE |
| RNF-AUD-2 | Soft delete universal | M | Nenhuma exclusão física; registros mantêm `deletedAt` |
| RNF-AUD-3 | Trilha imutável e consultável pela Controladoria | M | Logs não editáveis pela interface; exportáveis para auditoria |
| RNF-AUD-4 | Versionamento de documentos | S | Histórico de versões recuperável por documento |

### 3.7 Backup e recuperação (BKP)
| ID | Requisito | Prio. | Critério de aceite |
|---|---|---|---|
| RNF-BKP-1 | Backup automático diário do banco | M | Rotina agendada com retenção configurável |
| RNF-BKP-2 | Backup dos arquivos (MinIO/S3) | M | Objetos versionados/replicados |
| RNF-BKP-3 | Restauração testada (plano de DR) | S | Procedimento de restore validado periodicamente; RPO ≤ 24h |

### 3.8 Acessibilidade e usabilidade (ACE/USA)
| ID | Requisito | Prio. | Critério de aceite |
|---|---|---|---|
| RNF-ACE-1 | Conformidade WCAG 2.1 nível AA | M | Auditoria de acessibilidade sem violações de nível AA |
| RNF-ACE-2 | Navegação por teclado e leitores de tela | M | Fluxos principais operáveis sem mouse |
| RNF-USA-1 | Tema claro e escuro; responsivo (mobile a desktop) | M | Layout funcional de 360px a 1920px |
| RNF-USA-2 | Pesquisa global e atalhos de teclado | S | Busca acessível por atalho em qualquer tela |
| RNF-USA-3 | Mensagens de erro claras e em português | M | Erros orientam a ação corretiva, sem stack trace exposta |

### 3.9 Manutenibilidade e portabilidade (MAN)
| ID | Requisito | Prio. | Critério de aceite |
|---|---|---|---|
| RNF-MAN-1 | Clean Architecture/DDD/SOLID em todos os módulos | M | Revisão arquitetural aprova a estrutura de camadas |
| RNF-MAN-2 | Cobertura de testes mínima nas regras de negócio | S | Casos de uso críticos com testes automatizados |
| RNF-MAN-3 | API versionada e documentada (Swagger) | M | `/docs` reflete todos os endpoints com exemplos |
| RNF-MAN-4 | Implantação reprodutível (Docker/CI) | M | Pipeline GitHub Actions builda, testa e publica |
| RNF-MAN-5 | Padrão único de código (lint/format obrigatórios) | M | CI falha em violação de lint |

### 3.10 Conformidade legal (LEG)
| ID | Requisito | Prio. | Norma de referência |
|---|---|---|---|
| RNF-LEG-1 | Contratações conforme nova lei de licitações | M | Lei 14.133/2021; integração ao PNCP |
| RNF-LEG-2 | Execução orçamentária conforme contabilidade pública | M | Lei 4.320/1964 e normas do MCASP |
| RNF-LEG-3 | Responsabilidade fiscal | M | LC 101/2000 (LRF) |
| RNF-LEG-4 | Transparência ativa e acesso à informação | M | LC 131/2009 e Lei 12.527/2011 (LAI) |
| RNF-LEG-5 | Prestação de contas ao controle externo | M | Layouts do TCE-AP e SICONFI |
| RNF-LEG-6 | Proteção de dados pessoais | M | Lei 13.709/2018 (LGPD) |

> Observação: prazos e layouts de órgãos de controle (TCE-AP, SICONFI, PNCP, eSocial) mudam periodicamente; a equipe deve confirmar versões vigentes antes de cada integração. Os requisitos acima fixam a obrigação de conformidade, não a versão técnica do layout.

---

## 4. Requisitos Funcionais Transversais (RFT)

> Serviços compartilhados por todos os módulos. Implementados na "Etapa 4 — Núcleo transversal" do roadmap e consumidos pelos módulos de negócio.

| ID | Requisito | Prio. | Critério de aceite |
|---|---|---|---|
| RFT-1 | **Login único (SSO)**: um login dá acesso a todos os módulos permitidos | M | Usuário autentica uma vez e navega entre módulos sem novo login |
| RFT-2 | **Dashboard personalizado** por papel/secretaria | M | Cada perfil vê indicadores pertinentes ao seu escopo |
| RFT-3 | **Central de notificações** (sino) com tempo real (WebSocket) | M | Evento gera notificação ao destinatário em < 5s |
| RFT-4 | **Mensageria interna** entre usuários/setores | S | Envio, leitura e histórico de mensagens com anexos |
| RFT-5 | **Pesquisa global** sobre entidades autorizadas | S | Busca retorna resultados respeitando permissões do usuário |
| RFT-6 | **Agenda e calendário** com eventos e lembretes | S | Eventos por usuário/secretaria com alertas |
| RFT-7 | **Favoritos e atalhos** de telas | C | Usuário fixa telas de uso frequente |
| RFT-8 | **Workflow configurável** (tramitação/aprovação) | M | Fluxos com etapas, responsáveis, prazos e SLA |
| RFT-9 | **Histórico de alterações** por registro | M | Linha do tempo de mudanças (origem no AuditLog) |
| RFT-10 | **Versionamento de documentos** | S | Versões anteriores recuperáveis e comparáveis |
| RFT-11 | **Anexos** com armazenamento em MinIO/S3 e antivírus | M | Upload validado por tipo/tamanho; vínculo ao registro |
| RFT-12 | **Comentários** em registros/processos | C | Comentários com autor, data e menções |
| RFT-13 | **Assinatura eletrônica** (ICP-Brasil e/ou gov.br) | M | Documento assinado com validade jurídica e verificação |
| RFT-14 | **Relatórios** parametrizáveis por módulo | M | Filtros por período/secretaria; pré-visualização |
| RFT-15 | **Exportação** em PDF, Excel, CSV e ODS | M | Qualquer listagem exportável nos 4 formatos |
| RFT-16 | **Geração de PDF** de documentos oficiais | M | Documentos com timbre, paginação e numeração |
| RFT-17 | **Logs e auditoria** acessíveis à Controladoria | M | Filtro por usuário, recurso, período e ação |
| RFT-18 | **Configurações** por módulo e por secretaria | S | Parâmetros editáveis sem deploy |

---

## 5. Requisitos Funcionais por Módulo

> Os módulos abaixo seguem o **mesmo template**: objetivo, entidades-chave, requisitos funcionais (RF), integrações e conformidade. Os módulos prioritários (5.1 a 5.4) estão **detalhados**; os demais (5.5+) trazem o recorte essencial e serão aprofundados nas próximas ondas, na ordem do roadmap.

### 5.1 Administração `ADM` — *detalhado*
**Objetivo:** governar a própria plataforma — usuários, papéis, permissões, estrutura organizacional e parâmetros.
**Entidades-chave:** User, Role, Permission, UserRole, UserPermission, Secretaria, Departamento (organograma), Configuração. *(já modeladas no kernel)*

| ID | Requisito | Prio. | Critério de aceite |
|---|---|---|---|
| RF-ADM-1 | CRUD de usuários com vínculo a secretaria/departamento | M | Criar/editar/inativar usuário; e-mail e CPF únicos |
| RF-ADM-2 | CRUD de papéis e associação de permissões | M | Papel recebe conjunto de permissões `(recurso, ação)` |
| RF-ADM-3 | Concessão/negação de permissões individuais | M | GRANT/DENY por usuário; DENY prevalece |
| RF-ADM-4 | Catálogo de permissões por tela e ação | M | Cada recurso expõe as 10 ações da especificação |
| RF-ADM-5 | Gestão de secretarias e departamentos (organograma) | M | Hierarquia em árvore; reorganização sem perda de histórico |
| RF-ADM-6 | Forçar troca de senha e reset administrativo | S | Admin dispara reset; usuário troca no próximo acesso |
| RF-ADM-7 | Exigir MFA por papel | S | Papéis marcados como sensíveis bloqueiam acesso sem MFA |
| RF-ADM-8 | Gestão de sessões ativas e revogação | S | Listar sessões por usuário e revogar individualmente |
| RF-ADM-9 | Parâmetros do sistema por secretaria | S | Configurações editáveis com auditoria |
**Integrações:** gov.br (futuro SSO federado). **Conformidade:** LGPD (gestão de acesso), RNF-SEG-*.

### 5.2 Recursos Humanos `RH` — *detalhado*
**Objetivo:** gerir o ciclo de vida do servidor e a folha.
**Entidades-chave:** Servidor, Cargo, Lotação, Férias, Licença, Folha, Frequência, Escala, Capacitação.

| ID | Requisito | Prio. | Critério de aceite |
|---|---|---|---|
| RF-RH-1 | Cadastro de servidores e vínculos | M | Servidor com matrícula, cargo, lotação e situação funcional |
| RF-RH-2 | Tabela de cargos e estrutura salarial | M | Cargos com vencimento base e gratificações |
| RF-RH-3 | Lotação e movimentação entre setores | M | Histórico de lotações preservado |
| RF-RH-4 | Solicitação e aprovação de férias (workflow) | M | Fluxo com saldo, período aquisitivo e aprovação da chefia |
| RF-RH-5 | Licenças e afastamentos | M | Tipos de licença com base legal e prazos |
| RF-RH-6 | Registro de frequência e escalas | S | Frequência por período; escalas por unidade |
| RF-RH-7 | Processamento da folha de pagamento | M | Cálculo de proventos/descontos; conferência antes do fechamento |
| RF-RH-8 | Geração de contracheque (PDF) | M | Contracheque por competência, assinável |
| RF-RH-9 | Gestão de capacitações | C | Cursos, cargas horárias e certificados |
**Integrações:** eSocial (eventos de pessoal), folha → módulo Finanças (empenho de pessoal). **Conformidade:** legislação trabalhista/estatutária, LGPD (dado pessoal de servidor).

### 5.3 Finanças `FIN` — *detalhado*
**Objetivo:** planejar e executar o orçamento conforme a contabilidade pública.
**Entidades-chave:** PPA, LDO, LOA, Receita, Despesa, Empenho, Liquidação, Pagamento, Tesouraria, Convênio, Transferência.

| ID | Requisito | Prio. | Critério de aceite |
|---|---|---|---|
| RF-FIN-1 | Cadastro de PPA, LDO e LOA com vínculo entre peças | M | LOA referencia metas do PPA/LDO; dotações por unidade |
| RF-FIN-2 | Execução da despesa: empenho → liquidação → pagamento | M | Cada etapa valida saldo da etapa anterior |
| RF-FIN-3 | Controle de dotação e saldo orçamentário em tempo real | M | Empenho bloqueado se exceder dotação disponível |
| RF-FIN-4 | Registro e classificação de receitas | M | Receita por natureza e fonte |
| RF-FIN-5 | Tesouraria: contas, conciliação bancária e fluxo de caixa | S | Saldo por conta; conciliação com extrato |
| RF-FIN-6 | Gestão de convênios e transferências | S | Convênio com plano de trabalho e prestação de contas |
| RF-FIN-7 | Empenho vinculado a contrato/compra (módulo Compras) | M | Empenho referencia ordem de compra/contrato |
| RF-FIN-8 | Geração de relatórios fiscais e prestação de contas | M | Relatórios para SICONFI/TCE-AP exportáveis |
| RF-FIN-9 | Pagamento com integração bancária/PIX (futuro) | S | Ordem bancária registrada e auditada |
**Integrações:** SICONFI, TCE-AP, bancos/PIX, RH (folha), Compras (empenho de contratos), Tributação (receita). **Conformidade:** Lei 4.320/1964, MCASP, LRF, RNF-LEG-2/3/5.

### 5.4 Tributação `TRI` — *detalhado*
**Objetivo:** administrar a arrecadação municipal.
**Entidades-chave:** Cadastro Imobiliário, Cadastro Econômico, IPTU, ISS, ITBI, Taxa, Dívida Ativa, Parcelamento, Certidão, NFS-e.

| ID | Requisito | Prio. | Critério de aceite |
|---|---|---|---|
| RF-TRI-1 | Cadastro imobiliário e econômico de contribuintes | M | Imóvel/empresa com inscrição única e histórico |
| RF-TRI-2 | Lançamento e cálculo de IPTU, ISS, ITBI e taxas | M | Cálculo parametrizável por exercício; emissão de guia |
| RF-TRI-3 | Emissão de guias (DAM) e segunda via | M | Guia com código de barras/PIX e vencimento |
| RF-TRI-4 | Inscrição e gestão de Dívida Ativa | M | Débitos vencidos inscritos com atualização monetária |
| RF-TRI-5 | Parcelamento de débitos (REFIS) | S | Parcelamento com regras configuráveis e acompanhamento |
| RF-TRI-6 | Emissão de certidões (negativa/positiva) | M | Certidão com verificação de autenticidade |
| RF-TRI-7 | NFS-e e gestão do ISS | S | Emissão/consulta de NFS-e conforme padrão adotado |
| RF-TRI-8 | Fiscalização tributária | C | Processos fiscais com autos e prazos |
| RF-TRI-9 | Baixa por pagamento e integração com Finanças (receita) | M | Pagamento confirmado baixa o débito e registra receita |
**Integrações:** Finanças (receita), bancos/PIX, Portal do Cidadão (2ª via, certidões), padrão nacional de NFS-e. **Conformidade:** Código Tributário Municipal, LGPD.

### 5.5 Compras Públicas `COM` — *essencial*
**Objetivo:** conduzir o processo de contratação conforme a Lei 14.133/2021.
**Entidades:** Solicitação, Pesquisa de Preços, Planejamento, Licitação, Dispensa, Inexigibilidade, Contrato, Ata, Fornecedor, Ordem de Compra.
**RF principais:** RF-COM-1 (M) solicitação de compra com workflow; RF-COM-2 (M) pesquisa de preços com mapa comparativo; RF-COM-3 (M) modalidades de licitação/dispensa/inexigibilidade; RF-COM-4 (M) gestão de contratos e atas com vigência e aditivos; RF-COM-5 (M) cadastro de fornecedores com regularidade; RF-COM-6 (M) ordem de compra → empenho (Finanças).
**Integrações:** PNCP, Finanças (empenho), Patrimônio/Almoxarifado (recebimento). **Conformidade:** Lei 14.133/2021, RNF-LEG-1.

### 5.6 Patrimônio `PAT` — *essencial*
**Objetivo:** controlar bens móveis e imóveis do município.
**Entidades:** Bem Móvel, Imóvel, Inventário, Baixa, Transferência, Depreciação.
**RF principais:** RF-PAT-1 (M) tombamento com etiqueta/plaqueta; RF-PAT-2 (M) inventário por unidade; RF-PAT-3 (S) transferência entre setores; RF-PAT-4 (S) baixa com motivo e laudo; RF-PAT-5 (S) cálculo de depreciação.
**Integrações:** Compras (recebimento), Finanças (valor contábil). **Conformidade:** MCASP (patrimônio).

### 5.7 Almoxarifado `ALM` — *essencial*
**Objetivo:** gerir estoque de materiais de consumo.
**Entidades:** Material, Estoque, Entrada, Saída, Requisição, Inventário.
**RF principais:** RF-ALM-1 (M) catálogo de materiais; RF-ALM-2 (M) entradas/saídas com saldo; RF-ALM-3 (M) requisição por setor (workflow); RF-ALM-4 (S) inventário e ajustes; RF-ALM-5 (S) alerta de estoque mínimo.
**Integrações:** Compras (entrada por OC), Patrimônio. **Conformidade:** controle interno.

### 5.8 Frota `FRO` — *essencial*
**Objetivo:** administrar veículos e logística.
**Entidades:** Veículo, Motorista, Abastecimento, Manutenção, Multa, Viagem, Pneu.
**RF principais:** RF-FRO-1 (M) cadastro de veículos e motoristas; RF-FRO-2 (M) controle de abastecimento e consumo; RF-FRO-3 (S) manutenções preventivas/corretivas; RF-FRO-4 (S) gestão de multas; RF-FRO-5 (S) agendamento de viagens; RF-FRO-6 (C) controle de pneus.
**Integrações:** Compras (combustível/peças), Almoxarifado.

### 5.9 Saúde `SAU` — *essencial (dados sensíveis)*
**Objetivo:** apoiar a atenção à saúde municipal.
**Entidades:** Paciente, Prontuário, Profissional, Especialidade, Unidade, Agendamento, Exame, Medicamento, Vacinação, Regulação, Protocolo, Fila de Espera, Indicador.
**RF principais:** RF-SAU-1 (M) cadastro de pacientes (vínculo CNS); RF-SAU-2 (M) agendamento por unidade/profissional; RF-SAU-3 (M) prontuário eletrônico com trilha de acesso; RF-SAU-4 (M) regulação e fila de espera; RF-SAU-5 (S) dispensação de medicamentos; RF-SAU-6 (S) vacinação; RF-SAU-7 (S) indicadores em tempo real.
**Integrações:** sistemas do Ministério da Saúde (futuro), CadÚnico. **Conformidade:** LGPD reforçada (dado de saúde — RNF-LGPD-3), sigilo.

### 5.10 Educação `EDU` — *essencial*
**Objetivo:** gerir a rede de ensino municipal.
**Entidades:** Escola, Aluno, Professor, Turma, Matrícula, Boletim, Transporte Escolar, Merenda, Biblioteca.
**RF principais:** RF-EDU-1 (M) matrícula e enturmação; RF-EDU-2 (M) diário e boletim; RF-EDU-3 (S) transporte escolar (rotas); RF-EDU-4 (S) merenda (cardápio/estoque); RF-EDU-5 (C) biblioteca.
**Integrações:** Censo Escolar (futuro). **Conformidade:** LGPD (dado de menor — cautela elevada).

### 5.11 Assistência Social `ASS` — *essencial (dados sensíveis)*
**Objetivo:** apoiar a política de assistência social.
**Entidades:** Família, Benefício, CadÚnico, Programa, Atendimento, Visita.
**RF principais:** RF-ASS-1 (M) cadastro de famílias e vínculo CadÚnico; RF-ASS-2 (M) concessão e acompanhamento de benefícios; RF-ASS-3 (M) atendimentos com trilha de acesso; RF-ASS-4 (S) visitas domiciliares; RF-ASS-5 (S) gestão de programas.
**Integrações:** CadÚnico. **Conformidade:** LGPD reforçada (vulnerabilidade social).

### 5.12 Demais secretarias finalísticas — *recorte inicial*
| Módulo | Sigla | Objetivo | Entidades-chave | Conformidade/Integração |
|---|---|---|---|---|
| Agricultura | AGR | Apoio ao produtor rural | Produtor, Propriedade, Máquina, Projeto | — |
| Meio Ambiente | AMB | Licenciamento e fiscalização ambiental | Licenciamento, Fiscalização, Processo, Reserva | órgãos ambientais |
| Obras | OBR | Gestão de obras públicas | Projeto, Medição, Fiscalização, Cronograma | Compras, Finanças |
| Cultura | CUL | Fomento cultural | Evento, Edital, Artista, Espaço | Lei de incentivo |
| Turismo | TUR | Promoção turística | Atrativo, Evento, Guia | — |
| Esporte | ESP | Gestão esportiva | Atleta, Equipe, Competição, Praça | — |
| Defesa Civil | DEC | Prevenção e resposta a desastres | Ocorrência, Mapa, Alerta, Abrigo | alertas em tempo real |
| Ouvidoria | OUV | Canal do cidadão | Protocolo, Solicitação, Denúncia, Sugestão | LAI, sigilo do denunciante |

### 5.13 Processo Eletrônico `PRO` — *essencial*
**Objetivo:** tramitação digital de processos administrativos.
**Entidades:** Protocolo, Tramitação, Despacho, Parecer, Anexo, Assinatura Digital.
**RF principais:** RF-PRO-1 (M) abertura e numeração de protocolo; RF-PRO-2 (M) tramitação entre setores (workflow); RF-PRO-3 (M) despachos e pareceres; RF-PRO-4 (M) assinatura digital de documentos; RF-PRO-5 (S) anexos versionados.
**Integrações:** assinatura (RFT-13), todos os módulos como origem de processos.

### 5.14 Diário Oficial `DOM` — *essencial*
**Objetivo:** publicar atos oficiais do município.
**Entidades:** Publicação, Edição, PDF, Consulta Pública, Assinatura.
**RF principais:** RF-DOM-1 (M) cadastro de matérias com workflow de aprovação; RF-DOM-2 (M) fechamento de edição em PDF assinado; RF-DOM-3 (M) consulta pública por data/assunto; RF-DOM-4 (S) busca textual nas edições.
**Integrações:** assinatura, Portal da Transparência. **Conformidade:** publicidade legal.

### 5.15 Portal da Transparência `TRA` — *essencial (público)*
**Objetivo:** transparência ativa à sociedade.
**Entidades (visões):** Receita, Despesa, Contrato, Licitação, Servidor, Convênio, Diária, Patrimônio, Relatório, API Pública.
**RF principais:** RF-TRA-1 (M) publicação de receitas/despesas atualizadas (≤24h); RF-TRA-2 (M) consulta a contratos e licitações; RF-TRA-3 (M) remuneração de servidores (com proteção de dado pessoal); RF-TRA-4 (M) API pública documentada; RF-TRA-5 (S) relatórios e gráficos.
**Integrações:** Finanças, Compras, RH (sem expor dado protegido). **Conformidade:** LC 131/2009, LAI, LGPD (RNF-LGPD-5).

### 5.16 Portal do Cidadão `CID` — *essencial (público)*
**Objetivo:** autoatendimento ao munícipe.
**Entidades (visões):** Protocolo, Tributo, Certidão, Agendamento, Solicitação, Notificação.
**RF principais:** RF-CID-1 (M) autenticação do cidadão (gov.br no futuro); RF-CID-2 (M) consulta/2ª via de tributos; RF-CID-3 (M) emissão de certidões; RF-CID-4 (M) abertura e acompanhamento de protocolos; RF-CID-5 (S) agendamentos (saúde, atendimento); RF-CID-6 (S) notificações ao cidadão.
**Integrações:** Tributação, Processo Eletrônico, Saúde, gov.br. **Conformidade:** LGPD, acessibilidade (RNF-ACE-*).

---

## 6. Modelo de dados (referência)

O domínio nuclear já está modelado em `apps/api/prisma/schema.prisma` (Etapa 1): User, RefreshToken, Role, Permission, RolePermission, UserRole, UserPermission, Secretaria, Departamento, AuditLog. Cada módulo do item 5 adiciona suas entidades **estendendo o mesmo schema**, sempre com: CUID, `createdAt`, `updatedAt`, `deletedAt`, vínculo a `Secretaria` quando aplicável, e auditoria via `AuditLog`.

Regra de modelagem: nenhuma entidade de negócio referencia diretamente outra de módulo distinto sem necessidade; integrações entre módulos passam por casos de uso da camada de aplicação, preservando a possibilidade de separação em microserviços (RNF-ESC-3).

---

## 7. Plano de releases e rastreabilidade

A entrega segue as ondas do roadmap. Cada release fecha um conjunto de requisitos rastreáveis a testes.

| Release | Conteúdo | Requisitos cobertos |
|---|---|---|
| **R1 — Fundação** *(entregue)* | Kernel de identidade, RBAC, auditoria, segurança | RNF-SEG-*, RNF-AUD-*, RF-ADM-1..4 |
| **R2 — Frontend base** | Next.js, design system, login, shell | RNF-ACE-*, RNF-USA-*, RFT-1 |
| **R3 — Administração** | Telas de perfis/permissões/organograma/config | RF-ADM-5..9, RFT-2/17/18 |
| **R4 — Núcleo transversal** | Workflow, anexos, assinatura, PDF, exportação, filas, notificações | RFT-3..16 |
| **R5 — RH** | Servidores, folha, férias, licenças | RF-RH-* |
| **R6 — Finanças** | PPA/LDO/LOA, execução, tesouraria | RF-FIN-*, RNF-LEG-2/3 |
| **R7 — Tributação** | Cadastros, lançamentos, dívida ativa, certidões | RF-TRI-* |
| **R8 — Compras** | Licitações, contratos, fornecedores | RF-COM-*, RNF-LEG-1 |
| **R9..R13 — Patrimônio, Almoxarifado, Frota, Saúde, Educação, Assistência** | Módulos finalísticos | RF-PAT/ALM/FRO/SAU/EDU/ASS-* |
| **R14 — Processo Eletrônico & Diário Oficial** | Tramitação e publicação | RF-PRO-*, RF-DOM-* |
| **R15 — Portais & integrações** | Transparência, Cidadão, gov.br, PNCP, SICONFI, PIX | RF-TRA-*, RF-CID-*, RNF-LEG-4/5 |

**Critério de pronto (Definition of Done) por release:** requisitos com critério de aceite atendido, testes automatizados nos casos de uso críticos, documentação Swagger atualizada, revisão de segurança e auditoria registrando as operações.

---

## 8. Próximos passos
1. Validar prioridades e ajustes de escopo com gestão/controladoria da prefeitura.
2. Aprofundar os módulos 5.5+ ao nível de detalhe dos prioritários, na ordem do plano de releases.
3. Iniciar a **Etapa 2 (Frontend base)** em paralelo, pois é pré-requisito de quase todos os RFs de tela.
4. Levantar credenciais e layouts vigentes das integrações externas (PNCP, SICONFI, eSocial, TCE-AP, gov.br) antes das releases que dependem delas.

> **Nota de manutenção:** este PRD é um documento vivo. Cada novo módulo detalhado incrementa a versão (1.1, 1.2, ...) mantendo a numeração de requisitos estável para preservar a rastreabilidade.
