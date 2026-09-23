# 🎯 Guia de Integração - Popup Obrigado + Upsell

## 📋 Visão Geral do Fluxo

```
Cliente Paga (R$ 65,20)
        ↓
   ✅ PIX Confirmado
        ↓
   🎉 Popup "Obrigado" aparece
        ↓
  Cliente clica "Continuar"
        ↓
   🎁 Popup "Upsell" aparece (Guia Premium - R$ 97,00)
        ↓
   ├─ ACEITA → Novo pagamento PIX
   │   └─ ✅ Acesso ao Premium liberado
   │
   └─ RECUSA → Encerra e vai para painel
```

---

## 🔧 Implementação Técnica

### 1. **Adicionar HTML do Popup ao `aprovado etapa 5/index.html`**

Antes do `</body>`, adicione:

```html
<!-- POPUP DE OBRIGADO -->
<div id="thankYouModal" class="modal-backdrop">
    <div class="modal-content bg-white rounded-lg shadow-2xl p-8 max-w-md mx-auto text-center">
        <div class="mb-6">
            <div class="bg-green-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto">
                <i class="fas fa-check text-green-600 text-5xl"></i>
            </div>
        </div>
        <h2 class="text-3xl font-bold text-green-800 mb-4">Pagamento Confirmado!</h2>
        <p class="text-gray-600 mb-6 text-lg">
            Obrigado por seu pagamento de <strong>R$ 65,20</strong>
        </p>
        <div class="bg-green-50 border-l-4 border-green-500 p-4 mb-6 text-left">
            <p class="text-sm text-gray-700 mb-2">
                <strong>ID do Pagamento:</strong><br>
                <span id="paymentIdDisplay" class="font-mono text-xs text-gray-600"></span>
            </p>
        </div>
        <p class="text-gray-700 mb-8">
            Seu Certificado será enviado em até 30 dias.
        </p>
        <button 
            onclick="showUpsellModal()" 
            class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition"
        >
            Continuar <i class="fas fa-arrow-right ml-2"></i>
        </button>
    </div>
</div>

<!-- POPUP DE UPSELL -->
<div id="upsellModal" class="modal-backdrop">
    <div class="modal-content bg-white rounded-lg shadow-2xl p-8 max-w-lg mx-auto">
        <div class="absolute top-0 right-0 bg-red-500 text-white px-4 py-2 rounded-bl-lg text-sm font-bold">
            ⚡ OFERTA ESPECIAL
        </div>
        <div class="text-center mb-6">
            <h2 class="text-3xl font-bold text-gray-800 mb-2">Aproveite Agora!</h2>
            <p class="text-gray-600">Você desbloqueou uma oferta exclusiva</p>
        </div>
        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6 border-2 border-blue-200">
            <h3 class="text-xl font-bold text-gray-800 mb-1">Guia Completo CAC Premium</h3>
            <p class="text-gray-600 text-sm mb-3">Acesso exclusivo a:</p>
            <ul class="space-y-2 text-sm text-gray-700">
                <li><i class="fas fa-check text-green-500 mr-2"></i>Legislação em PDF</li>
                <li><i class="fas fa-check text-green-500 mr-2"></i>Vídeos (3 horas)</li>
                <li><i class="fas fa-check text-green-500 mr-2"></i>Suporte prioritário</li>
                <li><i class="fas fa-check text-green-500 mr-2"></i>Atualizações por 12 meses</li>
            </ul>
        </div>
        <div class="text-center mb-6">
            <p class="text-gray-600 text-sm mb-2">Normal: <strike class="text-gray-400">R$ 299,00</strike></p>
            <div class="text-4xl font-bold text-blue-600 mb-2">R$ 97,00</div>
            <p class="text-green-600 font-semibold text-sm">💰 Economize 67%!</p>
        </div>
        <div class="space-y-3">
            <button 
                onclick="acceptUpsell()" 
                class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition"
            >
                <i class="fas fa-shopping-cart mr-2"></i>Aproveitar - R$ 97,00
            </button>
            <button 
                onclick="skipUpsell()" 
                class="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-lg transition"
            >
                Não, obrigado
            </button>
        </div>
    </div>
</div>

<!-- CSS para os modals -->
<style>
    .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: none;
        align-items: center;
        justify-content: center;
        z-index: 9000;
    }

    .modal-backdrop.active {
        display: flex;
    }

    @keyframes popupEntry {
        from {
            opacity: 0;
            transform: scale(0.9);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }

    .modal-content {
        animation: popupEntry 0.4s ease-out;
    }
</style>
```

---

### 2. **Modificar `onPaymentSuccess()` em `pix-payment.js`**

**Substituir:**
```javascript
function onPaymentSuccess(paymentData) {
    // ... código anterior ...
    
    const pixContainer = document.getElementById('pix-container');
    if (pixContainer) {
        pixContainer.innerHTML = `
            <div class="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto text-center">
                <div class="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-check text-green-700 text-4xl"></i>
                </div>
                <h2 class="text-2xl font-bold text-green-800 mb-4">Pagamento Confirmado!</h2>
                ...
            </div>
        `;
    }
}
```

**Por:**
```javascript
function onPaymentSuccess(paymentData) {
    // ... código anterior (Pushcut, Facebook Pixel, etc) ...
    
    // 🎯 NOVO: Mostrar popup de obrigado em vez de exibir na página
    showThankYouPopup(paymentData);
}
```

---

### 3. **Adicionar Funções de Controle em `pix-payment.js`**

```javascript
// ====== CONTROLE DE POPUPS ======

// Mostra popup de obrigado
function showThankYouPopup(paymentData) {
    // Preenche ID do pagamento
    document.getElementById('paymentIdDisplay').textContent = paymentData.id;
    
    // Mostra modal
    document.getElementById('thankYouModal').classList.add('active');
    
    // Confete de celebração
    createConfetti();
    
    // Salva dados para uso posterior
    window.lastPaymentData = paymentData;
    
    console.log('✅ Modal de obrigado exibida');
}

// Mostra popup de upsell
function showUpsellModal() {
    document.getElementById('thankYouModal').classList.remove('active');
    document.getElementById('upsellModal').classList.add('active');
    
    // Facebook Pixel: Upsell offer shown
    if (typeof fbq !== 'undefined') {
        fbq('track', 'ViewContent', {
            content_name: 'Guia Premium CAC',
            content_type: 'product',
            value: 97.00,
            currency: 'BRL'
        });
    }
    
    console.log('🎁 Modal de upsell exibida');
}

// Aceita upsell
function acceptUpsell() {
    console.log('🛒 Upsell aceito! Gerando novo PIX...');
    
    // Fecha modal
    document.getElementById('upsellModal').classList.remove('active');
    
    // Facebook Pixel: Iniciou checkout do upsell
    if (typeof fbq !== 'undefined') {
        fbq('track', 'InitiateCheckout', {
            content_name: 'Guia Premium CAC',
            value: 97.00,
            currency: 'BRL'
        });
    }
    
    // Cria novo pagamento para o upsell
    createUpsellPayment();
}

// Recusa upsell
function skipUpsell() {
    console.log('❌ Upsell recusado');
    
    document.getElementById('upsellModal').classList.remove('active');
    
    // Facebook Pixel: Recusou upsell
    if (typeof fbq !== 'undefined') {
        fbq('track', 'AddToCart', {
            content_name: 'Guia Premium CAC - Recusado',
            value: 0,
            currency: 'BRL'
        });
    }
    
    // Mostra mensagem final
    showFinalMessage();
}

// Cria novo pagamento para upsell
async function createUpsellPayment() {
    console.log('=== Criando pagamento de upsell ===');
    
    try {
        // Cria novo payload com dados do upsell
        const upsellPayload = {
            amount: 9700, // R$ 97,00 em centavos
            currency: 'BRL',
            method: 'PIX',
            description: 'Guia Premium CAC',
            externalRef: `upsell_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            payer: {
                name: AVEN_API.getUserData().nome,
                taxId: AVEN_API.getUserData().cpf,
                email: AVEN_API.getUserData().email,
                phone: `+55${AVEN_API.getUserData().telefone.replace(/\D/g, '')}`
            },
            items: [{
                quantity: 1,
                name: 'Guia Premium CAC',
                price: 9700,
                type: 'DIGITAL'
            }],
            metadata: {
                tipo: 'upsell_guia_premium',
                referencePayment: window.lastPaymentData.id
            }
        };
        
        // Envia para API
        const response = await fetch(`${AVEN_API.baseURL}/payment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${AVEN_API.apiKey}`
            },
            body: JSON.stringify(upsellPayload)
        });
        
        const upsellData = await response.json();
        
        if (!response.ok) {
            throw new Error(upsellData.message || 'Erro ao gerar PIX do upsell');
        }
        
        console.log('✅ PIX de upsell gerado:', upsellData);
        
        // Exibe PIX do upsell
        showUpsellPixPayment(upsellData);
        
    } catch (error) {
        console.error('❌ Erro ao criar upsell:', error);
        alert('Erro ao processar oferta. Tente novamente.');
    }
}

// Exibe PIX do upsell na página
function showUpsellPixPayment(paymentData) {
    // Você pode reutilizar a função showPixPayment ou criar uma nova específica
    const pixCode = paymentData.data?.copypaste || paymentData.copypaste;
    
    const container = document.getElementById('pix-container');
    if (container) {
        container.innerHTML = `
            <div class="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
                <div class="text-center mb-6">
                    <div class="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-qrcode text-blue-700 text-3xl"></i>
                    </div>
                    <h2 class="text-2xl font-bold text-blue-800 mb-2">Pagamento Upsell</h2>
                    <p class="text-gray-600 text-lg font-semibold">R$ 97,00</p>
                </div>
                
                <div id="upsell-qrcode" class="flex justify-center mb-4 p-4 bg-gray-50 rounded"></div>
                
                <div class="mb-4">
                    <input 
                        type="text" 
                        id="upsell-pix-code" 
                        value="${pixCode}" 
                        readonly 
                        class="w-full px-3 py-2 border border-gray-300 rounded text-sm font-mono"
                    >
                    <button 
                        onclick="copyUpsellPixCode()" 
                        class="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold mt-2"
                    >
                        <i class="fas fa-copy mr-2"></i>Copiar PIX
                    </button>
                </div>
                
                <p class="text-sm text-gray-500 text-center">
                    Escaneie o QR Code ou copie o código PIX para pagar
                </p>
            </div>
        `;
        
        // Gera QR Code
        new QRCode(document.getElementById('upsell-qrcode'), {
            text: pixCode,
            width: 256,
            height: 256,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H
        });
    }
    
    // Inicia verificação de pagamento do upsell
    startPaymentVerification(paymentData.id);
}

// Copia código PIX do upsell
function copyUpsellPixCode() {
    const pixCodeInput = document.getElementById('upsell-pix-code');
    pixCodeInput.select();
    document.execCommand('copy');
    
    alert('Código PIX copiado!');
}

// Mensagem final
function showFinalMessage() {
    const container = document.getElementById('pix-container');
    if (container) {
        container.innerHTML = `
            <div class="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto text-center">
                <div class="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-check text-green-700 text-4xl"></i>
                </div>
                <h2 class="text-2xl font-bold text-green-800 mb-4">Pronto!</h2>
                <p class="text-gray-600 mb-6">
                    Seu Certificado CAC será processado e enviado em até 30 dias.
                </p>
                <p class="text-sm text-gray-500">
                    Você pode acessar sua conta e acompanhar o status a qualquer momento.
                </p>
            </div>
        `;
    }
}

// Confete
function createConfetti() {
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.style.position = 'fixed';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.top = '-10px';
        confetti.style.width = Math.random() * 10 + 5 + 'px';
        confetti.style.height = confetti.style.width;
        confetti.style.background = ['#4ade80', '#60a5fa', '#fbbf24', '#f87171'][Math.floor(Math.random() * 4)];
        confetti.style.borderRadius = '50%';
        confetti.style.pointerEvents = 'none';
        confetti.style.zIndex = '8999';
        confetti.style.animation = `fall 3s ease-in forwards`;
        document.body.appendChild(confetti);
        
        setTimeout(() => confetti.remove(), 3000);
    }
}

// CSS para animação
const style = document.createElement('style');
style.textContent = `
    @keyframes fall {
        to {
            transform: translateY(100vh) rotateZ(360deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
```

---

## 📊 Fluxo de Facebook Pixel

```javascript
// Pagamento principal
Purchase {
    value: 65.20,
    currency: 'BRL',
    content_name: 'Loja 05'
}
        ↓
// Upsell oferecido
ViewContent {
    content_name: 'Guia Premium CAC',
    value: 97.00
}
        ↓
// Se aceita
InitiateCheckout {
    content_name: 'Guia Premium CAC',
    value: 97.00
}
        ↓
// Se completa
Purchase {
    value: 97.00,
    currency: 'BRL',
    content_name: 'Guia Premium CAC'
}
```

---

## 🎯 Pontos Importantes

1. **Timing**: O popup aparece LOGO APÓS o pagamento ser confirmado
2. **Psychology**: Cliente está em estado positivo (pagamento aprovado)
3. **Opção de sair**: Botão "Não, obrigado" evita frustração
4. **Rastreamento**: Facebook Pixel rastreia cada etapa
5. **Upsell amount**: R$ 97,00 é bom ponto de preço (nem muito alto, nem muito baixo)

---

## ✅ Checklist de Implementação

- [ ] Adicionar HTML dos popups ao `index.html`
- [ ] Adicionar CSS dos modals
- [ ] Modificar `onPaymentSuccess()` para chamar `showThankYouPopup()`
- [ ] Adicionar todas as funções de controle
- [ ] Testar fluxo completo
- [ ] Verificar Facebook Pixel em cada etapa
- [ ] Fazer commit e push
- [ ] Testar em produção (Vercel)

---

## 🧪 Como Testar

1. Abra `EXEMPLO_POPUP_UPSELL.html` no navegador
2. Clique em "🧪 Testar Fluxo"
3. Veja o popup de obrigado
4. Clique "Continuar" para ver upsell
5. Teste ambos os botões (Aceitar/Recusar)

Pronto! 🚀
