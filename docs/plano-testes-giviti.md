# Plano de Testes - Giviti

**Versão:** 1.0  
**Data:** Janeiro 2026  
**Aplicação:** Giviti - Você presente.

---

## Instruções para Exportar para Excel

1. Copie cada tabela de módulo
2. Cole no Excel usando "Colar Especial > Texto"
3. Use "Dados > Texto para Colunas" com delimitador "|"
4. Ou salve este arquivo como .csv

---

## Legenda de Criticidade

| Criticidade | Descrição |
|-------------|-----------|
| **Crítica** | Impede uso do sistema. Bloqueante. Deve ser corrigido imediatamente. |
| **Alta** | Funcionalidade principal comprometida. Afeta fluxo de negócio. |
| **Média** | Funcionalidade secundária afetada. Existe workaround. |
| **Baixa** | Problema cosmético ou de conveniência. Não afeta uso. |

---

## 1. Módulo: Autenticação

### 1.1 Login

| ID | Funcionalidade | Caso de Teste | Pré-condições | Passos | Resultado Esperado | Tipo | Criticidade | Prioridade |
|----|----------------|---------------|---------------|--------|-------------------|------|-------------|------------|
| AUTH-001 | Login | Login com credenciais válidas | Usuário cadastrado com email "teste@email.com" e senha "123456" | 1. Acessar página inicial 2. Clicar aba "Fazer Login" 3. Digitar email "teste@email.com" 4. Digitar senha "123456" 5. Clicar "Entrar" | Usuário redirecionado para Dashboard com mensagem de boas-vindas | Positivo | Crítica | Alta |
| AUTH-002 | Login | Login com email inexistente | Nenhum usuário cadastrado com email informado | 1. Acessar página inicial 2. Clicar aba "Fazer Login" 3. Digitar email "naoexiste@email.com" 4. Digitar senha "123456" 5. Clicar "Entrar" | Mensagem de erro "Credenciais inválidas" exibida. Usuário permanece na tela de login | Negativo | Crítica | Alta |
| AUTH-003 | Login | Login com senha incorreta | Usuário cadastrado com email "teste@email.com" | 1. Acessar página inicial 2. Clicar aba "Fazer Login" 3. Digitar email "teste@email.com" 4. Digitar senha errada "senhaerrada" 5. Clicar "Entrar" | Mensagem de erro "Credenciais inválidas" exibida. Usuário permanece na tela de login | Negativo | Crítica | Alta |
| AUTH-004 | Login | Login com campo email vazio | N/A | 1. Acessar página inicial 2. Clicar aba "Fazer Login" 3. Deixar email vazio 4. Digitar senha "123456" 5. Clicar "Entrar" | Validação exibe "E-mail é obrigatório" | Negativo | Alta | Alta |
| AUTH-005 | Login | Login com campo senha vazio | N/A | 1. Acessar página inicial 2. Clicar aba "Fazer Login" 3. Digitar email "teste@email.com" 4. Deixar senha vazia 5. Clicar "Entrar" | Validação exibe "Senha é obrigatória" | Negativo | Alta | Alta |
| AUTH-006 | Login | Login com email formato inválido | N/A | 1. Acessar página inicial 2. Clicar aba "Fazer Login" 3. Digitar "emailinvalido" 4. Digitar senha "123456" 5. Clicar "Entrar" | Validação exibe "E-mail inválido" | Negativo | Alta | Alta |
| AUTH-007 | Login | Login com opção "Manter-me logado" marcada | Usuário cadastrado | 1. Fazer login com "Manter-me logado" marcado 2. Fechar navegador 3. Reabrir navegador 4. Acessar aplicação | Usuário permanece logado após reabrir navegador | Positivo | Média | Média |
| AUTH-008 | Login | Login com opção "Manter-me logado" desmarcada | Usuário cadastrado | 1. Fazer login com "Manter-me logado" desmarcado 2. Fechar navegador 3. Reabrir navegador 4. Acessar aplicação | Usuário redirecionado para tela de login | Positivo | Média | Média |

### 1.2 Registro com Passe VIP

| ID | Funcionalidade | Caso de Teste | Pré-condições | Passos | Resultado Esperado | Tipo | Criticidade | Prioridade |
|----|----------------|---------------|---------------|--------|-------------------|------|-------------|------------|
| AUTH-009 | Registro | Registro com Passe VIP válido | Passe VIP "TESTE2024" ativo com vagas disponíveis | 1. Acessar página inicial 2. Clicar aba "Criar Conta" 3. Digitar Passe VIP "TESTE2024" 4. Preencher nome, sobrenome, email, senha 5. Clicar "Criar Conta" | Conta criada com sucesso. Usuário redirecionado para Dashboard | Positivo | Crítica | Alta |
| AUTH-010 | Registro | Registro com Passe VIP inválido | Nenhum passe com código informado | 1. Acessar página inicial 2. Clicar aba "Criar Conta" 3. Digitar Passe VIP "INVALIDO" 4. Preencher demais campos 5. Clicar "Criar Conta" | Mensagem de erro "Passe VIP inválido ou expirado" | Negativo | Crítica | Alta |
| AUTH-011 | Registro | Registro com Passe VIP inativo | Passe VIP "INATIVO2024" existe mas está desativado | 1. Acessar página inicial 2. Clicar aba "Criar Conta" 3. Digitar Passe VIP "INATIVO2024" 4. Preencher demais campos 5. Clicar "Criar Conta" | Mensagem de erro "Passe VIP inválido ou expirado" | Negativo | Crítica | Alta |
| AUTH-012 | Registro | Registro com Passe VIP esgotado | Passe VIP "ESGOTADO" com maxAccounts=2 e usedAccounts=2 | 1. Acessar página inicial 2. Clicar aba "Criar Conta" 3. Digitar Passe VIP "ESGOTADO" 4. Preencher demais campos 5. Clicar "Criar Conta" | Mensagem de erro "Este passe VIP já atingiu o limite de contas" | Negativo | Crítica | Alta |
| AUTH-013 | Registro | Registro com email já cadastrado | Email "existente@email.com" já possui conta | 1. Acessar página inicial 2. Clicar aba "Criar Conta" 3. Digitar Passe VIP válido 4. Digitar email "existente@email.com" 5. Clicar "Criar Conta" | Mensagem de erro "Este e-mail já está cadastrado" | Negativo | Crítica | Alta |
| AUTH-014 | Registro | Registro com senha menor que 6 caracteres | Passe VIP válido | 1. Acessar página inicial 2. Clicar aba "Criar Conta" 3. Digitar Passe VIP válido 4. Digitar senha "12345" (5 chars) 5. Clicar "Criar Conta" | Validação exibe "Senha deve ter no mínimo 6 caracteres" | Negativo | Alta | Alta |
| AUTH-015 | Registro | Registro com nome vazio | Passe VIP válido | 1. Acessar página inicial 2. Clicar aba "Criar Conta" 3. Deixar nome vazio 4. Preencher demais campos 5. Clicar "Criar Conta" | Validação exibe "Nome é obrigatório" | Negativo | Alta | Alta |
| AUTH-016 | Registro | Registro com Passe VIP em minúsculas | Passe VIP "TESTE2024" cadastrado | 1. Acessar página inicial 2. Clicar aba "Criar Conta" 3. Digitar "teste2024" em minúsculas 4. Preencher demais campos 5. Clicar "Criar Conta" | Sistema aceita e converte para maiúsculas. Registro bem-sucedido | Positivo | Média | Média |

### 1.3 Recuperação de Senha

| ID | Funcionalidade | Caso de Teste | Pré-condições | Passos | Resultado Esperado | Tipo | Criticidade | Prioridade |
|----|----------------|---------------|---------------|--------|-------------------|------|-------------|------------|
| AUTH-017 | Recuperar Senha | Solicitar link com email válido | Usuário cadastrado com email "teste@email.com" | 1. Acessar página inicial 2. Clicar "Esqueci minha senha" 3. Digitar email "teste@email.com" 4. Clicar "Enviar link" | Mensagem "Link enviado para seu e-mail". Email recebido com link de recuperação | Positivo | Crítica | Alta |
| AUTH-018 | Recuperar Senha | Solicitar link com email inexistente | Nenhum usuário com email informado | 1. Acessar página inicial 2. Clicar "Esqueci minha senha" 3. Digitar email "naoexiste@email.com" 4. Clicar "Enviar link" | Mensagem genérica "Se o e-mail estiver cadastrado, você receberá um link" (não revelar se existe) | Positivo | Alta | Alta |
| AUTH-019 | Recuperar Senha | Redefinir senha com link válido | Link de recuperação gerado há menos de 1 hora | 1. Clicar no link recebido por email 2. Digitar nova senha "novaSenha123" 3. Confirmar nova senha 4. Clicar "Redefinir" | Senha alterada com sucesso. Redirecionado para login | Positivo | Crítica | Alta |
| AUTH-020 | Recuperar Senha | Redefinir senha com link expirado | Link de recuperação gerado há mais de 1 hora | 1. Clicar no link expirado 2. Tentar redefinir senha | Mensagem de erro "Link expirado. Solicite um novo link" | Negativo | Alta | Alta |
| AUTH-021 | Recuperar Senha | Redefinir senha com token inválido | URL com token alterado manualmente | 1. Acessar URL com token inválido 2. Tentar redefinir senha | Mensagem de erro "Token inválido" | Negativo | Alta | Alta |
| AUTH-022 | Recuperar Senha | Senhas não coincidem | Link válido | 1. Clicar link válido 2. Digitar senha "senha123" 3. Confirmar senha "senha456" 4. Clicar "Redefinir" | Validação exibe "As senhas não coincidem" | Negativo | Alta | Alta |
| AUTH-023 | Recuperar Senha | Usar link já utilizado | Link de recuperação já usado para redefinir | 1. Clicar em link já utilizado 2. Tentar redefinir senha | Mensagem de erro "Este link já foi utilizado" | Negativo | Alta | Alta |

### 1.4 Lista de Espera

| ID | Funcionalidade | Caso de Teste | Pré-condições | Passos | Resultado Esperado | Tipo | Criticidade | Prioridade |
|----|----------------|---------------|---------------|--------|-------------------|------|-------------|------------|
| AUTH-024 | Lista de Espera | Inscrever-se na lista de espera | Nenhuma inscrição prévia com mesmo email | 1. Acessar página inicial 2. Clicar "Entrar na Lista de Espera" 3. Preencher nome e email 4. Clicar "Inscrever-se" | Mensagem de sucesso "Inscrição realizada". Email na lista com status "pending" | Positivo | Alta | Alta |
| AUTH-025 | Lista de Espera | Inscrever-se com email já na lista | Email já cadastrado na lista de espera | 1. Acessar página inicial 2. Clicar "Entrar na Lista de Espera" 3. Digitar email já inscrito 4. Clicar "Inscrever-se" | Mensagem de erro "Este e-mail já está na lista de espera" | Negativo | Média | Média |
| AUTH-026 | Lista de Espera | Inscrever-se com email de usuário existente | Email já possui conta no sistema | 1. Acessar página inicial 2. Clicar "Entrar na Lista de Espera" 3. Digitar email de usuário cadastrado 4. Clicar "Inscrever-se" | Mensagem de erro "Este e-mail já possui uma conta. Faça login" | Negativo | Média | Média |

### 1.5 Logout

| ID | Funcionalidade | Caso de Teste | Pré-condições | Passos | Resultado Esperado | Tipo | Criticidade | Prioridade |
|----|----------------|---------------|---------------|--------|-------------------|------|-------------|------------|
| AUTH-027 | Logout | Realizar logout | Usuário logado | 1. Clicar no avatar/nome do usuário 2. Clicar "Sair" | Sessão encerrada. Redirecionado para página inicial | Positivo | Alta | Alta |
| AUTH-028 | Logout | Tentar acessar área restrita após logout | Usuário fez logout | 1. Fazer logout 2. Tentar acessar /dashboard diretamente | Redirecionado para página de login | Positivo | Alta | Alta |

---

## 2. Módulo: Dashboard

| ID | Funcionalidade | Caso de Teste | Pré-condições | Passos | Resultado Esperado | Tipo | Criticidade | Prioridade |
|----|----------------|---------------|---------------|--------|-------------------|------|-------------|------------|
| DASH-001 | Dashboard | Visualizar estatísticas | Usuário logado com presenteados e eventos cadastrados | 1. Acessar Dashboard | Exibe cards com: número de presenteados, eventos próximos, presentes comprados | Positivo | Média | Média |
| DASH-002 | Dashboard | Dashboard vazio (novo usuário) | Usuário recém-cadastrado sem dados | 1. Acessar Dashboard | Exibe mensagem de boas-vindas e botões para adicionar presenteado/explorar sugestões | Positivo | Média | Média |
| DASH-003 | Dashboard | Exibir eventos próximos | Usuário com eventos nos próximos 30 dias | 1. Acessar Dashboard | Lista de eventos próximos exibida em ordem cronológica | Positivo | Média | Média |
| DASH-004 | Horóscopo | Exibir horóscopo semanal | Usuário com signo configurado no perfil | 1. Acessar Dashboard | Seção de horóscopo exibe mensagem personalizada para o signo | Positivo | Baixa | Baixa |
| DASH-005 | Horóscopo | Horóscopo sem signo configurado | Usuário sem signo no perfil | 1. Acessar Dashboard | Seção de horóscopo não exibida ou mostra convite para configurar signo | Positivo | Baixa | Baixa |
| DASH-006 | Navegação | Acessar Presenteados pelo Dashboard | Usuário logado | 1. Acessar Dashboard 2. Clicar botão "Adicionar Presenteado" | Redirecionado para página de Presenteados | Positivo | Média | Média |
| DASH-007 | Navegação | Acessar Sugestões pelo Dashboard | Usuário logado | 1. Acessar Dashboard 2. Clicar botão "Explorar Sugestões" | Redirecionado para página de Sugestões | Positivo | Média | Média |

---

## 3. Módulo: Presenteados

### 3.1 Criar Presenteado

| ID | Funcionalidade | Caso de Teste | Pré-condições | Passos | Resultado Esperado | Tipo | Criticidade | Prioridade |
|----|----------------|---------------|---------------|--------|-------------------|------|-------------|------------|
| PRES-001 | Criar | Criar presenteado com dados mínimos | Usuário logado | 1. Acessar Presenteados 2. Clicar "Novo Presenteado" 3. Preencher nome "Maria" 4. Selecionar relacionamento "Amigo" 5. Clicar "Salvar" | Presenteado criado e exibido na lista | Positivo | Alta | Alta |
| PRES-002 | Criar | Criar presenteado com todos os campos | Usuário logado | 1. Acessar Presenteados 2. Clicar "Novo Presenteado" 3. Preencher: nome, idade, gênero, relacionamento, interesses, email, localização 4. Clicar "Salvar" | Presenteado criado com todos os dados salvos corretamente | Positivo | Alta | Alta |
| PRES-003 | Criar | Criar presenteado sem nome | Usuário logado | 1. Acessar Presenteados 2. Clicar "Novo Presenteado" 3. Deixar nome vazio 4. Clicar "Salvar" | Validação exibe "Nome é obrigatório" | Negativo | Alta | Alta |
| PRES-004 | Criar | Criar presenteado com idade inválida | Usuário logado | 1. Acessar Presenteados 2. Clicar "Novo Presenteado" 3. Digitar idade "-5" ou "200" 4. Clicar "Salvar" | Validação exibe "Idade inválida" | Negativo | Média | Média |
| PRES-005 | Criar | Criar presenteado com email inválido | Usuário logado | 1. Acessar Presenteados 2. Clicar "Novo Presenteado" 3. Digitar email "emailinvalido" 4. Clicar "Salvar" | Validação exibe "E-mail inválido" | Negativo | Média | Média |
| PRES-006 | Criar | Criar múltiplos presenteados | Usuário logado | 1. Criar presenteado "Maria" 2. Criar presenteado "João" 3. Criar presenteado "Ana" | Todos os presenteados aparecem na lista | Positivo | Alta | Alta |

### 3.2 Editar Presenteado

| ID | Funcionalidade | Caso de Teste | Pré-condições | Passos | Resultado Esperado | Tipo | Criticidade | Prioridade |
|----|----------------|---------------|---------------|--------|-------------------|------|-------------|------------|
| PRES-007 | Editar | Editar nome do presenteado | Presenteado "Maria" existente | 1. Acessar Presenteados 2. Clicar ícone editar no card "Maria" 3. Alterar nome para "Maria Silva" 4. Clicar "Salvar" | Nome atualizado na lista e detalhes | Positivo | Alta | Alta |
| PRES-008 | Editar | Editar interesses do presenteado | Presenteado existente | 1. Acessar Presenteados 2. Clicar editar 3. Adicionar/remover interesses 4. Clicar "Salvar" | Interesses atualizados. Sugestões devem refletir mudança | Positivo | Alta | Alta |
| PRES-009 | Editar | Cancelar edição | Presenteado existente | 1. Acessar Presenteados 2. Clicar editar 3. Alterar nome 4. Clicar "Cancelar" | Alterações descartadas. Dados originais mantidos | Positivo | Média | Média |

### 3.3 Excluir Presenteado

| ID | Funcionalidade | Caso de Teste | Pré-condições | Passos | Resultado Esperado | Tipo | Criticidade | Prioridade |
|----|----------------|---------------|---------------|--------|-------------------|------|-------------|------------|
| PRES-010 | Excluir | Excluir presenteado sem eventos | Presenteado sem eventos associados | 1. Acessar Presenteados 2. Clicar ícone lixeira 3. Confirmar exclusão | Presenteado removido da lista | Positivo | Alta | Alta |
| PRES-011 | Excluir | Excluir presenteado com eventos | Presenteado com eventos associados | 1. Acessar Presenteados 2. Clicar ícone lixeira 3. Confirmar exclusão | Aviso sobre eventos associados. Após confirmar, presenteado e associações removidos | Positivo | Alta | Alta |
| PRES-012 | Excluir | Cancelar exclusão | Presenteado existente | 1. Acessar Presenteados 2. Clicar ícone lixeira 3. Clicar "Cancelar" no diálogo | Presenteado mantido na lista | Positivo | Média | Média |

### 3.4 Questionário de Preferências

| ID | Funcionalidade | Caso de Teste | Pré-condições | Passos | Resultado Esperado | Tipo | Criticidade | Prioridade |
|----|----------------|---------------|---------------|--------|-------------------|------|-------------|------------|
| PRES-013 | Questionário | Preencher questionário completo | Presenteado existente | 1. Acessar detalhes do presenteado 2. Preencher todas as perguntas do questionário 3. Salvar | Todas as respostas salvas. Sugestões mais personalizadas | Positivo | Alta | Alta |
| PRES-014 | Questionário | Preencher "Presentes a Evitar" | Presenteado existente | 1. Acessar questionário 2. Preencher campo "Presentes a Evitar" com "perfume, meias" 3. Salvar | Sugestões não devem incluir categorias evitadas | Positivo | Alta | Alta |
| PRES-015 | Questionário | Salvar questionário parcial | Presenteado existente | 1. Acessar questionário 2. Preencher apenas algumas perguntas 3. Salvar | Respostas parciais salvas corretamente | Positivo | Média | Média |

### 3.5 Vinculação Bidirecional

| ID | Funcionalidade | Caso de Teste | Pré-condições | Passos | Resultado Esperado | Tipo | Criticidade | Prioridade |
|----|----------------|---------------|---------------|--------|-------------------|------|-------------|------------|
| PRES-016 | Vinculação | Vinculação automática ao criar conta | Presenteado "Maria" com email "maria@email.com" cadastrado por outro usuário | 1. Maria cria conta usando "maria@email.com" 2. Outro usuário acessa lista de presenteados | Ícone de vinculação aparece no card de Maria. Preferências sincronizadas | Positivo | Alta | Alta |
| PRES-017 | Vinculação | Sincronização de preferências | Presenteado vinculado | 1. Pessoa vinculada atualiza seu perfil 2. Usuário acessa presenteado | Preferências do presenteado refletem atualizações do perfil vinculado | Positivo | Alta | Alta |
| PRES-018 | Vinculação | Visualizar indicador de perfil vinculado | Presenteado com email vinculado a conta ativa | 1. Acessar lista de presenteados | Ícone especial visível ao lado do nome do presenteado vinculado | Positivo | Média | Média |

---

## 4. Módulo: Eventos

### 4.1 Criar Evento

| ID | Funcionalidade | Caso de Teste | Pré-condições | Passos | Resultado Esperado | Tipo | Criticidade | Prioridade |
|----|----------------|---------------|---------------|--------|-------------------|------|-------------|------------|
| EVT-001 | Criar | Criar evento com data futura | Presenteado existente | 1. Acessar Eventos 2. Clicar "Novo Evento" 3. Preencher: nome, tipo, data futura, presenteado 4. Clicar "Salvar" | Evento criado e exibido na lista | Positivo | Alta | Alta |
| EVT-002 | Criar | Criar evento com data de hoje | Presenteado existente | 1. Acessar Eventos 2. Clicar "Novo Evento" 3. Selecionar data de hoje 4. Clicar "Salvar" | Evento criado com sucesso | Positivo | Alta | Alta |
| EVT-003 | Criar | Criar evento com data passada | Presenteado existente | 1. Acessar Eventos 2. Clicar "Novo Evento" 3. Selecionar data no passado 4. Clicar "Salvar" | Validação exibe "A data deve ser hoje ou no futuro" | Negativo | Alta | Alta |
| EVT-004 | Criar | Criar evento sem nome | Presenteado existente | 1. Acessar Eventos 2. Clicar "Novo Evento" 3. Deixar nome vazio 4. Clicar "Salvar" | Validação exibe "Nome é obrigatório" | Negativo | Alta | Alta |
| EVT-005 | Criar | Criar evento sem presenteado | N/A | 1. Acessar Eventos 2. Clicar "Novo Evento" 3. Não selecionar presenteado 4. Clicar "Salvar" | Validação exibe "Selecione ao menos um presenteado" | Negativo | Alta | Alta |
| EVT-006 | Criar | Criar evento com múltiplos presenteados | Vários presenteados existentes | 1. Acessar Eventos 2. Clicar "Novo Evento" 3. Selecionar 3 presenteados 4. Clicar "Salvar" | Evento criado associado a todos os presenteados selecionados | Positivo | Alta | Alta |

### 4.2 Tipos de Evento

| ID | Funcionalidade | Caso de Teste | Pré-condições | Passos | Resultado Esperado | Tipo | Criticidade | Prioridade |
|----|----------------|---------------|---------------|--------|-------------------|------|-------------|------------|
| EVT-007 | Tipos | Criar evento tipo Aniversário | Presenteado existente | 1. Criar evento selecionando tipo "Aniversário" | Evento criado com tipo Aniversário. Ícone correspondente exibido | Positivo | Média | Média |
| EVT-008 | Tipos | Criar evento tipo Natal | Presenteado existente | 1. Criar evento selecionando tipo "Natal" | Evento criado com tipo Natal | Positivo | Média | Média |
| EVT-009 | Tipos | Criar evento tipo Casamento | Presenteado existente | 1. Criar evento selecionando tipo "Casamento" | Evento criado com tipo Casamento | Positivo | Média | Média |

### 4.3 Editar e Excluir Evento

| ID | Funcionalidade | Caso de Teste | Pré-condições | Passos | Resultado Esperado | Tipo | Criticidade | Prioridade |
|----|----------------|---------------|---------------|--------|-------------------|------|-------------|------------|
| EVT-010 | Editar | Editar data do evento | Evento existente | 1. Acessar Eventos 2. Clicar editar evento 3. Alterar data 4. Salvar | Data atualizada no evento | Positivo | Alta | Alta |
| EVT-011 | Editar | Alterar presenteados do evento | Evento existente com 1 presenteado | 1. Editar evento 2. Adicionar mais um presenteado 3. Salvar | Evento associado a ambos presenteados | Positivo | Alta | Alta |
| EVT-012 | Excluir | Excluir evento | Evento existente | 1. Acessar Eventos 2. Clicar excluir evento 3. Confirmar | Evento removido da lista | Positivo | Alta | Alta |

### 4.4 Arquivar e Avançar Eventos

| ID | Funcionalidade | Caso de Teste | Pré-condições | Passos | Resultado Esperado | Tipo | Criticidade | Prioridade |
|----|----------------|---------------|---------------|--------|-------------------|------|-------------|------------|
| EVT-013 | Arquivar | Arquivar evento passado | Evento com data no passado | 1. Acessar Eventos 2. Localizar evento passado 3. Clicar "Arquivar" | Evento movido para aba "Arquivados" | Positivo | Alta | Alta |
| EVT-014 | Avançar | Avançar evento para próximo ano | Evento de aniversário com data passada | 1. Localizar evento passado 2. Clicar "Avançar para Próximo Ano" | Data atualizada para mesmo dia/mês do próximo ano | Positivo | Alta | Alta |
| EVT-015 | Arquivados | Visualizar eventos arquivados | Eventos arquivados existentes | 1. Acessar Eventos 2. Clicar aba "Arquivados" | Lista de eventos arquivados exibida | Positivo | Média | Média |
| EVT-016 | Arquivados | Desarquivar evento | Evento arquivado | 1. Acessar aba "Arquivados" 2. Clicar "Desarquivar" no evento | Evento retorna para lista principal | Positivo | Média | Média |

### 4.5 Filtros de Eventos

| ID | Funcionalidade | Caso de Teste | Pré-condições | Passos | Resultado Esperado | Tipo | Criticidade | Prioridade |
|----|----------------|---------------|---------------|--------|-------------------|------|-------------|------------|
| EVT-017 | Filtros | Filtrar por "Este mês" | Eventos em diferentes meses | 1. Acessar Eventos 2. Selecionar filtro "Este mês" | Apenas eventos do mês atual exibidos | Positivo | Média | Média |
| EVT-018 | Filtros | Filtrar por "Próximos 3 meses" | Eventos em diferentes períodos | 1. Selecionar filtro "Próximos 3 meses" | Apenas eventos nos próximos 90 dias exibidos | Positivo | Média | Média |
| EVT-019 | Filtros | Filtrar por "Todos os próximos" | Eventos futuros | 1. Selecionar filtro "Todos os próximos" | Todos os eventos futuros exibidos, ordenados por data | Positivo | Média | Média |

---

## 5. Módulo: Meu Aniversário

### 5.1 Criar Evento de Aniversário

| ID | Funcionalidade | Caso de Teste | Pré-condições | Passos | Resultado Esperado | Tipo | Criticidade | Prioridade |
|----|----------------|---------------|---------------|--------|-------------------|------|-------------|------------|
| BDAY-001 | Criar | Criar evento de aniversário | Usuário logado sem evento de aniversário | 1. Acessar "Meu Aniversário" 2. Clicar "Criar Evento" 3. Selecionar data 4. Adicionar título e descrição 5. Salvar | Evento de aniversário criado. Página exibe wishlist e convidados | Positivo | Alta | Alta |
| BDAY-002 | Criar | Tentar criar segundo evento de aniversário | Usuário já tem evento de aniversário | 1. Acessar "Meu Aniversário" 2. Tentar criar novo evento | Sistema não permite. Exibe evento existente para edição | Negativo | Média | Média |

### 5.2 Wishlist

| ID | Funcionalidade | Caso de Teste | Pré-condições | Passos | Resultado Esperado | Tipo | Criticidade | Prioridade |
|----|----------------|---------------|---------------|--------|-------------------|------|-------------|------------|
| BDAY-003 | Wishlist | Adicionar item à wishlist | Evento de aniversário existente | 1. Acessar aba "Wishlist" 2. Clicar "Adicionar Item" 3. Preencher nome do presente 4. Salvar | Item adicionado à wishlist | Positivo | Alta | Alta |
| BDAY-004 | Wishlist | Adicionar item com todos os campos | Evento existente | 1. Adicionar item com: nome, descrição, link, faixa de preço, prioridade | Todos os campos salvos corretamente | Positivo | Alta | Alta |
| BDAY-005 | Wishlist | Adicionar item sem nome | Evento existente | 1. Tentar adicionar item com nome vazio | Validação exibe "Nome é obrigatório" | Negativo | Alta | Alta |
| BDAY-006 | Wishlist | Editar item da wishlist | Item existente na wishlist | 1. Clicar editar no item 2. Alterar descrição 3. Salvar | Descrição atualizada | Positivo | Alta | Alta |
| BDAY-007 | Wishlist | Excluir item da wishlist | Item existente | 1. Clicar excluir no item 2. Confirmar | Item removido da wishlist | Positivo | Alta | Alta |
| BDAY-008 | Wishlist | Reordenar itens por prioridade | Múltiplos itens na wishlist | 1. Arrastar item para nova posição | Ordem atualizada e persistida | Positivo | Média | Média |

### 5.3 Convidados

| ID | Funcionalidade | Caso de Teste | Pré-condições | Passos | Resultado Esperado | Tipo | Criticidade | Prioridade |
|----|----------------|---------------|---------------|--------|-------------------|------|-------------|------------|
| BDAY-009 | Convidados | Convidar pessoa por email | Evento existente | 1. Acessar aba "Convidados" 2. Clicar "Convidar" 3. Preencher nome e email 4. Enviar | Convite enviado. Convidado aparece com status "Pendente" | Positivo | Alta | Alta |
| BDAY-010 | Convidados | Convidar com email inválido | Evento existente | 1. Tentar convidar com email "invalido" | Validação exibe "E-mail inválido" | Negativo | Alta | Alta |
| BDAY-011 | Convidados | Convidar email já convidado | Convidado já existe | 1. Tentar convidar mesmo email novamente | Mensagem "Este e-mail já foi convidado" | Negativo | Média | Média |
| BDAY-012 | Convidados | Remover convidado | Convidado existente | 1. Clicar remover no convidado 2. Confirmar | Convidado removido da lista | Positivo | Média | Média |
| BDAY-013 | Convidados | Visualizar status do convite | Convites enviados | 1. Acessar aba "Convidados" | Status de cada convite visível (Pendente/Visualizado/Confirmado) | Positivo | Média | Média |

### 5.4 Link Público

| ID | Funcionalidade | Caso de Teste | Pré-condições | Passos | Resultado Esperado | Tipo | Criticidade | Prioridade |
|----|----------------|---------------|---------------|--------|-------------------|------|-------------|------------|
| BDAY-014 | Link Público | Gerar link público | Evento com wishlist | 1. Clicar "Compartilhar Wishlist" 2. Copiar link | Link gerado e copiado para clipboard | Positivo | Alta | Alta |
| BDAY-015 | Link Público | Acessar wishlist via link público | Link gerado | 1. Abrir link em navegador anônimo | Wishlist exibida sem necessidade de login | Positivo | Alta | Alta |
| BDAY-016 | Link Público | Reservar presente via link público | Link acessado por visitante | 1. Acessar link público 2. Clicar "Vou dar este presente" em um item | Item marcado como reservado. Dono vê atualização em tempo real | Positivo | Alta | Alta |
| BDAY-017 | Link Público | Visualizar presentes já reservados | Wishlist com itens reservados | 1. Acessar link público | Itens reservados aparecem com indicação visual | Positivo | Média | Média |

---

## 6. Módulo: Sugestões de Presentes

### 6.1 Visualização de Sugestões

| ID | Funcionalidade | Caso de Teste | Pré-condições | Passos | Resultado Esperado | Tipo | Criticidade | Prioridade |
|----|----------------|---------------|---------------|--------|-------------------|------|-------------|------------|
| SUG-001 | Visualizar | Visualizar sugestões sem filtros | Presenteados com perfil preenchido | 1. Acessar página Sugestões | Lista de sugestões exibida com paginação | Positivo | Alta | Alta |
| SUG-002 | Visualizar | Visualizar sugestões sem presenteados | Usuário sem presenteados | 1. Acessar página Sugestões | Mensagem orientando a cadastrar presenteados primeiro | Positivo | Média | Média |
| SUG-003 | Visualizar | Paginação de resultados | Mais de 15 sugestões disponíveis | 1. Acessar Sugestões 2. Navegar entre páginas | Navegação funciona. Máximo 15 resultados por página | Positivo | Média | Média |

### 6.2 Filtros

| ID | Funcionalidade | Caso de Teste | Pré-condições | Passos | Resultado Esperado | Tipo | Criticidade | Prioridade |
|----|----------------|---------------|---------------|--------|-------------------|------|-------------|------------|
| SUG-004 | Filtros | Filtrar por presenteado | Múltiplos presenteados | 1. Selecionar presenteado "Maria" no filtro | Sugestões personalizadas para Maria exibidas | Positivo | Alta | Alta |
| SUG-005 | Filtros | Filtrar por categoria | Sugestões em várias categorias | 1. Selecionar categoria "Eletrônicos" | Apenas sugestões de eletrônicos exibidas | Positivo | Alta | Alta |
| SUG-006 | Filtros | Filtrar por faixa de preço | Sugestões com diferentes preços | 1. Definir orçamento R$50 a R$150 | Apenas sugestões dentro da faixa exibidas | Positivo | Alta | Alta |
| SUG-007 | Filtros | Buscar por palavra-chave | Sugestões variadas | 1. Digitar "fone de ouvido" no campo de busca 2. Pressionar Enter | Resultados filtrados por termo buscado | Positivo | Alta | Alta |
| SUG-008 | Filtros | Combinar múltiplos filtros | N/A | 1. Selecionar presenteado 2. Selecionar categoria 3. Definir orçamento | Resultados respeitam todos os filtros aplicados | Positivo | Alta | Alta |
| SUG-009 | Filtros | Limpar todos os filtros | Filtros aplicados | 1. Clicar "Limpar Filtros" | Todos os filtros removidos. Sugestões gerais exibidas | Positivo | Média | Média |
| SUG-010 | Filtros | Filtro sem resultados | N/A | 1. Aplicar filtros muito restritivos | Mensagem "Nenhuma sugestão encontrada" com opção de ajustar filtros | Positivo | Média | Média |

### 6.3 Favoritos

| ID | Funcionalidade | Caso de Teste | Pré-condições | Passos | Resultado Esperado | Tipo | Criticidade | Prioridade |
|----|----------------|---------------|---------------|--------|-------------------|------|-------------|------------|
| SUG-011 | Favoritos | Adicionar sugestão aos favoritos | Sugestão exibida | 1. Clicar no ícone de coração | Coração preenchido. Sugestão salva nos favoritos | Positivo | Alta | Alta |
| SUG-012 | Favoritos | Remover dos favoritos | Sugestão favoritada | 1. Clicar no ícone de coração preenchido | Coração vazio. Sugestão removida dos favoritos | Positivo | Alta | Alta |
| SUG-013 | Favoritos | Visualizar lista de favoritos | Sugestões favoritadas | 1. Acessar seção/aba de Favoritos | Lista de todas as sugestões favoritadas | Positivo | Média | Média |

### 6.4 Marcar como Comprado

| ID | Funcionalidade | Caso de Teste | Pré-condições | Passos | Resultado Esperado | Tipo | Criticidade | Prioridade |
|----|----------------|---------------|---------------|--------|-------------------|------|-------------|------------|
| SUG-014 | Comprado | Marcar sugestão como comprada | Sugestão exibida | 1. Marcar checkbox "Comprado" | Checkbox marcado. Sugestão contabilizada nas estatísticas | Positivo | Alta | Alta |
| SUG-015 | Comprado | Desmarcar como comprado | Sugestão marcada como comprada | 1. Desmarcar checkbox "Comprado" | Sugestão retorna ao estado não comprado | Positivo | Média | Média |
| SUG-016 | Comprado | Estatísticas de gastos | Várias compras marcadas | 1. Acessar Dashboard ou estatísticas | Total de presentes comprados e valor total exibidos | Positivo | Média | Média |

### 6.5 Ver Detalhes e Cupons

| ID | Funcionalidade | Caso de Teste | Pré-condições | Passos | Resultado Esperado | Tipo | Criticidade | Prioridade |
|----|----------------|---------------|---------------|--------|-------------------|------|-------------|------------|
| SUG-017 | Detalhes | Abrir link externo | Sugestão com link de loja | 1. Clicar "Ver Detalhes" | Nova aba abre com página do produto na loja externa | Positivo | Alta | Alta |
| SUG-018 | Cupons | Visualizar cupom de desconto válido | Sugestão com cupom ativo | 1. Visualizar card da sugestão | Cupom exibido em destaque com código e validade | Positivo | Média | Média |
| SUG-019 | Cupons | Copiar código do cupom | Cupom disponível | 1. Clicar no cupom para copiar | Código copiado para clipboard. Notificação exibida | Positivo | Média | Média |
| SUG-020 | Cupons | Cupom expirado | Sugestão com cupom vencido | 1. Visualizar sugestão com cupom expirado | Cupom aparece riscado com indicação "(expirado)" | Positivo | Baixa | Baixa |

---

## 7. Módulo: Perfil do Usuário

### 7.1 Informações Básicas

| ID | Funcionalidade | Caso de Teste | Pré-condições | Passos | Resultado Esperado | Tipo | Criticidade | Prioridade |
|----|----------------|---------------|---------------|--------|-------------------|------|-------------|------------|
| PERF-001 | Perfil | Visualizar perfil | Usuário logado | 1. Acessar "Meu Perfil" | Dados do usuário exibidos (nome, email, signo, preferências) | Positivo | Média | Média |
| PERF-002 | Perfil | Editar nome | Usuário logado | 1. Acessar Perfil 2. Editar nome 3. Salvar | Nome atualizado no perfil e exibições do sistema | Positivo | Média | Média |
| PERF-003 | Perfil | Selecionar signo | Usuário logado | 1. Acessar Perfil 2. Selecionar signo do zodíaco 3. Salvar | Signo salvo. Horóscopo passa a ser exibido no Dashboard | Positivo | Baixa | Baixa |

### 7.2 Questionário de Preferências

| ID | Funcionalidade | Caso de Teste | Pré-condições | Passos | Resultado Esperado | Tipo | Criticidade | Prioridade |
|----|----------------|---------------|---------------|--------|-------------------|------|-------------|------------|
| PERF-004 | Questionário | Preencher questionário completo | Usuário logado | 1. Acessar Perfil 2. Responder todas as perguntas 3. Salvar | Todas as preferências salvas. Perfil marcado como completo | Positivo | Alta | Alta |
| PERF-005 | Questionário | Selecionar múltiplos interesses | Usuário logado | 1. Marcar vários interesses (música, tecnologia, esportes) 2. Salvar | Todos os interesses salvos | Positivo | Média | Média |
| PERF-006 | Questionário | Preencher "Presentes a Evitar" | Usuário logado | 1. Preencher campo de presentes a evitar 2. Salvar | Preferência salva. Amigos Secretos podem visualizar | Positivo | Alta | Alta |
| PERF-007 | Questionário | Salvar questionário parcial | Usuário logado | 1. Responder apenas algumas perguntas 2. Salvar | Respostas parciais salvas sem erro | Positivo | Média | Média |

### 7.3 Alterar Senha

| ID | Funcionalidade | Caso de Teste | Pré-condições | Passos | Resultado Esperado | Tipo | Criticidade | Prioridade |
|----|----------------|---------------|---------------|--------|-------------------|------|-------------|------------|
| PERF-008 | Senha | Alterar senha corretamente | Usuário logado conhece senha atual | 1. Acessar Perfil 2. Clicar "Alterar Senha" 3. Digitar senha atual 4. Digitar nova senha 5. Confirmar 6. Salvar | Senha alterada. Próximo login usa nova senha | Positivo | Alta | Alta |
| PERF-009 | Senha | Alterar com senha atual incorreta | Usuário logado | 1. Clicar "Alterar Senha" 2. Digitar senha atual errada 3. Tentar salvar | Erro "Senha atual incorreta" | Negativo | Alta | Alta |
| PERF-010 | Senha | Nova senha muito curta | Usuário logado | 1. Tentar alterar para senha "123" | Erro "Senha deve ter no mínimo 6 caracteres" | Negativo | Alta | Alta |
| PERF-011 | Senha | Confirmação não confere | Usuário logado | 1. Digitar nova senha "senha123" 2. Confirmar "senha456" | Erro "As senhas não coincidem" | Negativo | Alta | Alta |

---

## 8. Módulo: Eventos Colaborativos (Rolês)

### 8.1 Amigo Secreto - Criar Evento

| ID | Funcionalidade | Caso de Teste | Pré-condições | Passos | Resultado Esperado | Tipo | Criticidade | Prioridade |
|----|----------------|---------------|---------------|--------|-------------------|------|-------------|------------|
| ROLE-001 | Criar | Criar Amigo Secreto | Usuário logado | 1. Acessar Rolês 2. Clicar "Criar Rolê" 3. Selecionar "Amigo Secreto" 4. Preencher nome, data, local 5. Criar | Evento criado. Página de gerenciamento exibida | Positivo | Alta | Alta |
| ROLE-002 | Criar | Criar sem nome | Usuário logado | 1. Tentar criar sem preencher nome | Validação exibe "Nome é obrigatório" | Negativo | Alta | Alta |
| ROLE-003 | Criar | Criar com data passada | Usuário logado | 1. Tentar criar com data no passado | Validação exibe "Data deve ser futura" | Negativo | Alta | Alta |

### 8.2 Amigo Secreto - Participantes

| ID | Funcionalidade | Caso de Teste | Pré-condições | Passos | Resultado Esperado | Tipo | Criticidade | Prioridade |
|----|----------------|---------------|---------------|--------|-------------------|------|-------------|------------|
| ROLE-004 | Participantes | Adicionar participante | Evento criado | 1. Acessar aba "Participantes" 2. Clicar "Convidar" 3. Preencher nome e email 4. Adicionar | Participante adicionado. Email de convite enviado | Positivo | Alta | Alta |
| ROLE-005 | Participantes | Adicionar participante sem email | Evento criado | 1. Tentar adicionar sem email | Validação exibe "E-mail é obrigatório" | Negativo | Alta | Alta |
| ROLE-006 | Participantes | Adicionar email duplicado | Participante já adicionado | 1. Tentar adicionar mesmo email novamente | Erro "Este participante já foi adicionado" | Negativo | Alta | Alta |
| ROLE-007 | Participantes | Remover participante antes do sorteio | Participante pendente | 1. Clicar remover 2. Confirmar | Participante removido da lista | Positivo | Média | Média |
| ROLE-008 | Participantes | Adicionar mínimo de participantes | Evento vazio | 1. Adicionar apenas 2 participantes 2. Tentar sortear | Erro "Mínimo 3 participantes para realizar sorteio" | Negativo | Alta | Alta |

### 8.3 Amigo Secreto - Sorteio

| ID | Funcionalidade | Caso de Teste | Pré-condições | Passos | Resultado Esperado | Tipo | Criticidade | Prioridade |
|----|----------------|---------------|---------------|--------|-------------------|------|-------------|------------|
| ROLE-009 | Sorteio | Realizar sorteio | 4+ participantes confirmados | 1. Clicar "Realizar Sorteio" 2. Confirmar | Pares gerados. Emails enviados para cada participante com quem tirou | Positivo | Crítica | Alta |
| ROLE-010 | Sorteio | Verificar que ninguém tira a si mesmo | Sorteio realizado | 1. Verificar resultados do sorteio | Nenhum participante tirou a si mesmo | Positivo | Crítica | Alta |
| ROLE-011 | Sorteio | Refazer sorteio | Sorteio já realizado | 1. Clicar "Refazer Sorteio" 2. Confirmar | Novos pares gerados. Novos emails enviados | Positivo | Alta | Alta |
| ROLE-012 | Sorteio | Adicionar participante após sorteio | Sorteio realizado | 1. Tentar adicionar novo participante | Aviso "É necessário refazer o sorteio para incluir novos participantes" | Negativo | Alta | Alta |
| ROLE-013 | Sorteio | Visualizar resultado (organizador) | Sorteio realizado | 1. Acessar aba "Participantes" como organizador | Organizador vê todos os pares formados | Positivo | Média | Média |

### 8.4 Amigo Secreto - Configurações

| ID | Funcionalidade | Caso de Teste | Pré-condições | Passos | Resultado Esperado | Tipo | Criticidade | Prioridade |
|----|----------------|---------------|---------------|--------|-------------------|------|-------------|------------|
| ROLE-014 | Config | Definir valor mínimo e máximo | Evento criado | 1. Acessar "Configurações" 2. Definir mín R$30, máx R$80 3. Salvar | Valores salvos. Exibidos no email do sorteio | Positivo | Alta | Alta |
| ROLE-015 | Config | Valor mínimo maior que máximo | Evento criado | 1. Definir mín R$100, máx R$50 2. Salvar | Erro "Valor mínimo não pode ser maior que máximo" | Negativo | Média | Média |
| ROLE-016 | Config | Adicionar regras personalizadas | Evento criado | 1. Preencher campo "Regras" com texto 2. Salvar | Regras salvas. Incluídas no email do sorteio | Positivo | Média | Média |

### 8.5 Indicador de Perfil

| ID | Funcionalidade | Caso de Teste | Pré-condições | Passos | Resultado Esperado | Tipo | Criticidade | Prioridade |
|----|----------------|---------------|---------------|--------|-------------------|------|-------------|------------|
| ROLE-017 | Perfil | Ver indicador de perfil preenchido | Participante tem conta no Giviti | 1. Acessar lista de participantes | Ícone especial ao lado do nome indica perfil preenchido | Positivo | Média | Média |
| ROLE-018 | Perfil | Clicar para ver preferências | Participante com perfil | 1. Clicar no ícone de perfil | Popup/modal exibe preferências do participante | Positivo | Média | Média |

### 8.6 Evento Temático

| ID | Funcionalidade | Caso de Teste | Pré-condições | Passos | Resultado Esperado | Tipo | Criticidade | Prioridade |
|----|----------------|---------------|---------------|--------|-------------------|------|-------------|------------|
| ROLE-019 | Temático | Criar evento temático | Usuário logado | 1. Criar Rolê 2. Selecionar "Evento Temático" 3. Escolher categoria 4. Criar | Evento temático criado com categoria selecionada | Positivo | Alta | Alta |
| ROLE-020 | Temático | Selecionar subcategoria | Evento temático | 1. Escolher categoria "Jantar" 2. Selecionar subcategoria "Mexicano" | Subcategoria aplicada ao evento | Positivo | Média | Média |
| ROLE-021 | Temático | Adicionar participantes | Evento temático | 1. Adicionar participantes 2. Enviar convites | Convites enviados com tema do evento | Positivo | Alta | Alta |

### 8.7 Presente Coletivo

| ID | Funcionalidade | Caso de Teste | Pré-condições | Passos | Resultado Esperado | Tipo | Criticidade | Prioridade |
|----|----------------|---------------|---------------|--------|-------------------|------|-------------|------------|
| ROLE-022 | Coletivo | Criar presente coletivo | Usuário logado | 1. Criar Rolê 2. Selecionar "Presente Coletivo" 3. Definir meta de valor 4. Criar | Evento criado com meta de arrecadação | Positivo | Alta | Alta |
| ROLE-023 | Coletivo | Definir presente alvo | Evento coletivo | 1. Descrever o presente que será comprado | Descrição salva e visível para participantes | Positivo | Alta | Alta |
| ROLE-024 | Coletivo | Adicionar contribuintes | Evento coletivo | 1. Adicionar participantes contribuintes | Contribuintes adicionados à lista | Positivo | Alta | Alta |
| ROLE-025 | Coletivo | Acompanhar progresso | Evento com contribuições | 1. Acessar página do evento | Barra de progresso mostra quanto falta para meta | Positivo | Média | Média |

---

## 9. Módulo: Painel Administrativo

### 9.1 Acesso ao Painel

| ID | Funcionalidade | Caso de Teste | Pré-condições | Passos | Resultado Esperado | Tipo | Criticidade | Prioridade |
|----|----------------|---------------|---------------|--------|-------------------|------|-------------|------------|
| ADM-001 | Acesso | Acessar como admin | Usuário com role "admin" | 1. Fazer login 2. Acessar /admin | Painel administrativo exibido com todas as opções | Positivo | Crítica | Alta |
| ADM-002 | Acesso | Acesso negado para usuário comum | Usuário com role "user" | 1. Fazer login 2. Tentar acessar /admin | Acesso negado. Redirecionado para Dashboard | Negativo | Crítica | Alta |
| ADM-003 | Acesso | Acessar sem login | Sem sessão | 1. Tentar acessar /admin diretamente | Redirecionado para página de login | Negativo | Crítica | Alta |

### 9.2 Gerenciamento de Usuários

| ID | Funcionalidade | Caso de Teste | Pré-condições | Passos | Resultado Esperado | Tipo | Criticidade | Prioridade |
|----|----------------|---------------|---------------|--------|-------------------|------|-------------|------------|
| ADM-004 | Usuários | Listar todos os usuários | Admin logado | 1. Acessar seção Usuários | Lista paginada de usuários com nome, email, role, status | Positivo | Alta | Alta |
| ADM-005 | Usuários | Buscar usuário por nome | Usuários existentes | 1. Digitar nome no campo de busca | Lista filtrada por nome | Positivo | Média | Média |
| ADM-006 | Usuários | Buscar usuário por email | Usuários existentes | 1. Digitar email no campo de busca | Usuário encontrado por email | Positivo | Média | Média |
| ADM-007 | Usuários | Ativar/Desativar usuário | Usuário existente | 1. Clicar toggle de status do usuário | Status alterado. Usuário não consegue mais logar se desativado | Positivo | Alta | Alta |
| ADM-008 | Usuários | Alterar role do usuário | Usuário existente | 1. Selecionar novo role (admin/user) 2. Salvar | Role atualizado. Permissões refletem mudança | Positivo | Alta | Alta |
| ADM-009 | Usuários | Admin não pode desativar a si mesmo | Admin logado | 1. Tentar desativar própria conta | Ação bloqueada. Erro "Não é possível desativar sua própria conta" | Negativo | Alta | Alta |

### 9.3 Gerenciamento de Passes VIP

| ID | Funcionalidade | Caso de Teste | Pré-condições | Passos | Resultado Esperado | Tipo | Criticidade | Prioridade |
|----|----------------|---------------|---------------|--------|-------------------|------|-------------|------------|
| ADM-010 | Passes | Criar novo Passe VIP | Admin logado | 1. Acessar Controle de Acesso 2. Clicar "Novo Passe" 3. Preencher código, destinatário, máximo de contas 4. Salvar | Passe criado e exibido na lista | Positivo | Crítica | Alta |
| ADM-011 | Passes | Criar com código duplicado | Código já existe | 1. Tentar criar com código existente | Erro "Já existe um passe VIP com este código" | Negativo | Alta | Alta |
| ADM-012 | Passes | Gerar código aleatório | Admin no formulário de criação | 1. Clicar "Gerar" | Código aleatório preenchido automaticamente | Positivo | Baixa | Baixa |
| ADM-013 | Passes | Editar Passe VIP | Passe existente | 1. Clicar editar 2. Alterar máximo de contas 3. Salvar | Dados atualizados | Positivo | Alta | Alta |
| ADM-014 | Passes | Ativar/Desativar Passe | Passe existente | 1. Toggle de status do passe | Status alterado. Passe inativo não permite registros | Positivo | Alta | Alta |
| ADM-015 | Passes | Excluir Passe VIP | Passe existente | 1. Clicar excluir 2. Confirmar | Passe removido da lista | Positivo | Alta | Alta |
| ADM-016 | Passes | Copiar código do passe | Passe existente | 1. Clicar ícone copiar | Código copiado. Notificação "Código copiado!" | Positivo | Baixa | Baixa |
| ADM-017 | Passes | Visualizar uso do passe | Passe com usos | 1. Clicar "Visualizar" no passe | Lista de usuários que usaram o passe (nome, email, data) | Positivo | Média | Média |
| ADM-018 | Passes | Passe sem usos | Passe recém-criado | 1. Clicar "Visualizar" | Mensagem "Nenhum usuário usou este passe ainda" | Positivo | Baixa | Baixa |

### 9.4 Lista de Espera

| ID | Funcionalidade | Caso de Teste | Pré-condições | Passos | Resultado Esperado | Tipo | Criticidade | Prioridade |
|----|----------------|---------------|---------------|--------|-------------------|------|-------------|------------|
| ADM-019 | Waitlist | Visualizar lista de espera | Inscrições na lista | 1. Acessar aba "Lista de Espera" | Tabela com nome, email, status, data de inscrição | Positivo | Média | Média |
| ADM-020 | Waitlist | Remover da lista de espera | Inscrição existente | 1. Clicar excluir na inscrição 2. Confirmar | Inscrição removida da lista | Positivo | Média | Média |
| ADM-021 | Waitlist | Lista de espera vazia | Nenhuma inscrição | 1. Acessar aba "Lista de Espera" | Mensagem "Lista de espera vazia" | Positivo | Baixa | Baixa |

### 9.5 Categorias de Presentes

| ID | Funcionalidade | Caso de Teste | Pré-condições | Passos | Resultado Esperado | Tipo | Criticidade | Prioridade |
|----|----------------|---------------|---------------|--------|-------------------|------|-------------|------------|
| ADM-022 | Categorias | Listar categorias | Admin logado | 1. Acessar seção Categorias | Lista de todas as categorias com nome e keywords | Positivo | Média | Média |
| ADM-023 | Categorias | Criar nova categoria | Admin logado | 1. Clicar "Nova Categoria" 2. Preencher nome e keywords 3. Salvar | Categoria criada | Positivo | Alta | Alta |
| ADM-024 | Categorias | Criar categoria sem nome | Admin logado | 1. Tentar criar sem nome | Validação exibe erro | Negativo | Alta | Alta |
| ADM-025 | Categorias | Editar categoria | Categoria existente | 1. Clicar editar 2. Alterar keywords 3. Salvar | Dados atualizados | Positivo | Média | Média |
| ADM-026 | Categorias | Excluir categoria | Categoria existente | 1. Excluir categoria 2. Confirmar | Categoria removida. Sugestões associadas atualizadas | Positivo | Média | Média |

### 9.6 Sugestões de Presentes (Admin)

| ID | Funcionalidade | Caso de Teste | Pré-condições | Passos | Resultado Esperado | Tipo | Criticidade | Prioridade |
|----|----------------|---------------|---------------|--------|-------------------|------|-------------|------------|
| ADM-027 | Sugestões | Listar todas as sugestões | Sugestões cadastradas | 1. Acessar seção Sugestões | Lista paginada de sugestões com nome, preço, categoria | Positivo | Média | Média |
| ADM-028 | Sugestões | Criar nova sugestão | Admin logado | 1. Clicar "Nova Sugestão" 2. Preencher todos os campos 3. Salvar | Sugestão criada e disponível para usuários | Positivo | Alta | Alta |
| ADM-029 | Sugestões | Criar sugestão sem preço | Admin logado | 1. Tentar criar sem informar preço | Validação exibe erro | Negativo | Alta | Alta |
| ADM-030 | Sugestões | Editar sugestão | Sugestão existente | 1. Editar preço e descrição 2. Salvar | Dados atualizados | Positivo | Média | Média |
| ADM-031 | Sugestões | Adicionar cupom à sugestão | Sugestão existente | 1. Editar sugestão 2. Adicionar código de cupom e validade 3. Salvar | Cupom associado à sugestão | Positivo | Média | Média |
| ADM-032 | Sugestões | Excluir sugestão | Sugestão existente | 1. Excluir sugestão 2. Confirmar | Sugestão removida | Positivo | Média | Média |

### 9.7 Logs de Auditoria

| ID | Funcionalidade | Caso de Teste | Pré-condições | Passos | Resultado Esperado | Tipo | Criticidade | Prioridade |
|----|----------------|---------------|---------------|--------|-------------------|------|-------------|------------|
| ADM-033 | Auditoria | Visualizar logs de auditoria | Ações realizadas no sistema | 1. Acessar seção Auditoria | Lista de ações com data, usuário, ação, entidade, detalhes | Positivo | Alta | Alta |
| ADM-034 | Auditoria | Filtrar por tipo de ação | Logs existentes | 1. Selecionar filtro "CREATE" | Apenas ações de criação exibidas | Positivo | Média | Média |
| ADM-035 | Auditoria | Filtrar por usuário | Logs existentes | 1. Selecionar usuário específico | Apenas ações do usuário exibidas | Positivo | Média | Média |
| ADM-036 | Auditoria | Verificar registro de login | Usuário fez login | 1. Filtrar logs por "LOGIN" | Login registrado com data, IP, usuário | Positivo | Alta | Alta |
| ADM-037 | Auditoria | Verificar registro de criação de passe | Passe criado | 1. Buscar logs de access_ticket | Criação registrada com código do passe | Positivo | Alta | Alta |

---

## 10. Testes de Segurança e Performance

### 10.1 Segurança

| ID | Funcionalidade | Caso de Teste | Pré-condições | Passos | Resultado Esperado | Tipo | Criticidade | Prioridade |
|----|----------------|---------------|---------------|--------|-------------------|------|-------------|------------|
| SEC-001 | Autenticação | Tentativas de login com força bruta | N/A | 1. Tentar login incorreto 10+ vezes seguidas | Sistema implementa rate limiting ou bloqueio temporário | Negativo | Crítica | Alta |
| SEC-002 | Autorização | Acessar dados de outro usuário | Dois usuários diferentes | 1. Usuário A tenta acessar presenteados do Usuário B via API | Acesso negado. Erro 403 | Negativo | Crítica | Alta |
| SEC-003 | Autorização | Modificar evento de outro usuário | Evento de outro usuário | 1. Tentar editar/excluir evento de outro usuário | Ação bloqueada | Negativo | Crítica | Alta |
| SEC-004 | Sessão | Token de sessão expira | Sessão ativa há muito tempo | 1. Deixar sessão inativa por período prolongado | Sessão expira. Usuário redirecionado para login | Positivo | Alta | Alta |
| SEC-005 | XSS | Injeção de script em campos de texto | Usuário logado | 1. Inserir `<script>alert('xss')</script>` em campo de texto 2. Salvar | Script não executado. Texto escapado/sanitizado | Negativo | Crítica | Alta |
| SEC-006 | SQL Injection | Tentativa de SQL injection | Usuário logado | 1. Inserir `'; DROP TABLE users; --` em campo de busca | Query não afetada. Erro tratado graciosamente | Negativo | Crítica | Alta |

### 10.2 Performance

| ID | Funcionalidade | Caso de Teste | Pré-condições | Passos | Resultado Esperado | Tipo | Criticidade | Prioridade |
|----|----------------|---------------|---------------|--------|-------------------|------|-------------|------------|
| PERF-012 | Carregamento | Tempo de carregamento do Dashboard | Usuário com muitos dados | 1. Acessar Dashboard | Página carrega em menos de 3 segundos | Positivo | Média | Média |
| PERF-013 | Sugestões | Performance com muitas sugestões | 1000+ sugestões no banco | 1. Acessar página de Sugestões | Paginação funciona. Primeira página carrega em menos de 3 segundos | Positivo | Média | Média |
| PERF-014 | Busca | Tempo de resposta da busca | Muitos dados | 1. Realizar busca complexa | Resultados retornam em menos de 2 segundos | Positivo | Média | Média |

---

## Dados de Teste Sugeridos

### Passes VIP para Teste
| Código | Destinatário | Max Contas | Status |
|--------|--------------|------------|--------|
| TESTE2024 | Testador QA | 10 | Ativo |
| ESGOTADO | Teste Limite | 2 | Ativo (2/2 usados) |
| INATIVO2024 | Teste Inativo | 5 | Inativo |
| VIP001 | Usuário VIP | 1 | Ativo |

### Usuários para Teste
| Email | Senha | Role | Status |
|-------|-------|------|--------|
| admin@giviti.com | Admin123! | admin | Ativo |
| teste@giviti.com | Teste123! | user | Ativo |
| inativo@giviti.com | Teste123! | user | Inativo |
| maria@email.com | Maria123! | user | Ativo |

### Presenteados para Teste
| Nome | Idade | Gênero | Relacionamento | Interesses |
|------|-------|--------|----------------|------------|
| Maria Silva | 28 | Feminino | Amiga | Moda, Tecnologia |
| João Santos | 35 | Masculino | Família | Esportes, Games |
| Ana Costa | 45 | Feminino | Colega | Livros, Viagem |

---

## Histórico de Versões

| Versão | Data | Autor | Descrição |
|--------|------|-------|-----------|
| 1.0 | Janeiro 2026 | QA Team | Versão inicial do plano de testes |

---

**Giviti** - Você presente.
