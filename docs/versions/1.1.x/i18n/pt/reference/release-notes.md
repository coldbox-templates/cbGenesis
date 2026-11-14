---
title: Notas de versão
order: 3
icon: phosphor-duotone:note
summary: Alterações da série 1.1.x.
tags: [reference, releases]
---

# Notas de versão

## 1.1.0

### Adicionado

- **Administração de limites:** consulte contadores, histórico e principais infratores; gerencie bloqueios e exclusões de IP e configurações em System > Rate Limiting.
- **Bloqueio automático e histórico:** bloqueie infratores reincidentes e mantenha um histórico horário limitado.
- **Controles de emergência:** pause os limites de tentativas, use `RATE_LIMITING_ENABLED` como exceção de emergência e aplique um teto global por IP com modo de lockdown.
- **Honeypot de cadastro:** rejeita cadastros automatizados que preenchem o campo oculto.

### Alterado

- O middleware `AppThrottle` substitui o limitador anterior por janelas fixas nas rotas de autenticação e SSO do perfil; o callback do cbSSO e as URLs de autenticação por convenção também são limitados.
- As versões mínimas passaram para ColdBox 8.3 e cbSecurity 3.9; os caminhos de instalação do framework e do TestBox foram corrigidos.
- O tema da documentação, a inicialização do banco de dados e a documentação dos limites foram atualizados.

### Corrigido

- A contagem de tentativas é atômica e somente a primeira solicitação bloqueada por janela é auditada.
- O formulário de login usa a rota protegida pelo limitador.
- A instalação de dependências e os relatórios de testes no CI foram melhorados.

Consulte [Limitação de taxa](../guides/security.md#rate-limiting) e o [registro de alterações](https://github.com/coldbox-templates/cbGenesis/blob/development/changelog.md).
