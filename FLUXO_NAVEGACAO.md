# 🔄 FLUXO DE NAVEGAÇÃO - REGISTRO CAC

## Estrutura do Funil de Vendas

### ✅ ETAPA 1: Página Principal (index.html)
- **Arquivo:** `/index.html`
- **Descrição:** Landing page com informações sobre o CAC
- **Botão:** "Iniciar Cadastro"
- **Função:** `iniciarCadastro()`
- **Ação:** Muda de page1 → page2 (dentro do mesmo arquivo)
- **Próxima Etapa:** Pages 2-8 (internas no index.html)

### ✅ ETAPA 2: Registro de Endereço
- **Arquivo:** `/endereco etapa 2/index.html`
- **Descrição:** Formulário para endereço de armazenamento de armas
- **Campos Obrigatórios:**
  - CEP (com auto-preenchimento via ViaCEP)
  - Logradouro
  - Número
  - Bairro
  - Cidade
  - Estado
- **Botão:** "Prosseguir"
- **Função:** `salvarDados()`
- **Redirecionamento:**
  ```javascript
  window.location.href = '../quiz etapa 3/index.html';
  ```
- **Próxima Etapa:** Etapa 3 (Quiz)

### ✅ ETAPA 3: Quiz / Questionário
- **Arquivo:** `/quiz etapa 3/index.html`
- **Descrição:** Questionário sobre conhecimentos de CAC
- **Botão:** "Enviar Questionário"
- **Redirecionamento:**
  ```javascript
  window.location.href='../psicotecnico etapa 4/index.html';
  ```
- **Próxima Etapa:** Etapa 4 (Psicotécnico)

### ✅ ETAPA 4: Teste Psicotécnico
- **Arquivo:** `/psicotecnico etapa 4/index.html`
- **Descrição:** Testes psicológicos para aptidão com armas
- **Botão:** "Enviar Teste"
- **Redirecionamento:**
  ```javascript
  window.location.href='../aprovado etapa 5/index.html';
  ```
- **Próxima Etapa:** Etapa 5 (Aprovação)

### ✅ ETAPA 5: Aprovação e Pagamento
- **Arquivo:** `/aprovado etapa 5/index.html`
- **Descrição:** Tela de aprovação com geração de PIX
- **Valores:**
  - R$ 48,70 (código identificador: "Loja 05" - atualizado)
  - Método: PIX
- **Funcionalidades:**
  - Geração automática de código PIX
  - Integração com Even Pay
  - Webhook intermediário para notificações Pushcut
  - Exibição do documento CAC simulado
- **Próxima Etapa:** ✓ Finalização (Pagamento)

---

## 🔗 Resumo dos Links de Navegação

| De | Para | Função | Link |
|---|---|---|---|
| index.html (page8) | endereco etapa 2 | finalizarCadastro() | `./endereco etapa 2/index.html` |
| endereco etapa 2 | quiz etapa 3 | salvarDados() | `../quiz etapa 3/index.html` |
| quiz etapa 3 | psicotecnico etapa 4 | submit | `../psicotecnico etapa 4/index.html` |
| psicotecnico etapa 4 | aprovado etapa 5 | submit | `../aprovado etapa 5/index.html` |
| aprovado etapa 5 | Even Pay | gerarPix() | API Even Pay |

---

## 📝 Integrações Externas

### Even Pay (Gateway de Pagamento)
- **URL Base:** `https://api.evenpay.com.br`
- **API Key:** `2zxA50CzfpTMZgKCwuotYv681fsfo4bcrXrdttHxdD4`
- **Descrição do Produto:** "Loja 05"
- **Valor:** R$ 48,70
- **Método:** PIX

### Pushcut (Notificações)
- **URL Pendente:** `https://api.pushcut.io/vDugtAoggC9xef2AU2kQs/notifications/Aven`
- **URL Pago:** `https://api.pushcut.io/vDugtAoggC9xef2AU2kQs/notifications/AvenPay`
- **Função:** Recebe webhooks e envia notificações

### Facebook Pixel
- **ID:** `3148553758675638`
- **Eventos Rastreados:**
  - PageView (inicial)
  - Lead (ao iniciar)
  - InitiateCheckout (após CPF)
  - AddPaymentInfo (ao finalizar)
  - Purchase (ao processar PIX)

### ViaCEP
- **URL:** `https://viacep.com.br/ws/{CEP}/json/`
- **Função:** Auto-preenchimento de endereço

---

## ✅ Verificação de Links (Atualizada)

- ✅ index.html → endereco etapa 2: `./endereco etapa 2/index.html`
- ✅ endereco etapa 2 → quiz etapa 3: `../quiz etapa 3/index.html`
- ✅ quiz etapa 3 → psicotecnico etapa 4: `../psicotecnico etapa 4/index.html`
- ✅ psicotecnico etapa 4 → aprovado etapa 5: `../aprovado etapa 5/index.html`

---

## 🔧 Armazenamento Local (LocalStorage)

Os dados são salvos em LocalStorage nas seguintes etapas:

- **CPF:** Salvo em page2
- **Dados Completos:** Salvo em finalizarCadastro()
- **Telefone:** Salvo em finalizarCadastro()
- **Email:** Salvo em proximaEtapa(8)
- **Nome:** Salvo em selecionarOpcao()
- **Endereço:** Salvo em salvarDados()
- **Timer Sessions:** Salvo em startTimer()

---

**Última Atualização:** 21/09/2026
**Status:** ✅ Vinculações Corrigidas e Testadas
