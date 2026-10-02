/**
 * PAYMENT HANDLER - PINGUPAG ONLY
 * Arquivo FINAL e ÚNICO para pagamentos
 * Carregado no HEAD para garantir disponibilidade
 */

console.log('[PAYMENT-HANDLER] Inicializando...');

// Limpa tudo antigo
delete window.AVEN_API;
delete window.EvenPay;
delete window.even_pay_api;

// Define API ÚNICA
window.PINGUPAG_API = {
    baseURL: 'https://app.pingupag.com/gateway/v1',
    apiKey: 'pingupag_sk_5a4a884661598e034154315cc12ce8e55ebfd026625c057dcf673b7ca7512384',
    amount: 8990,
    
    generateReference() {
        return `cac_${Date.now()}_${Math.floor(Math.random() * 999999)}`;
    },
    
    getUserData() {
        return {
            cpf: (localStorage.getItem('cpf') || '12345678900').replace(/\D/g, ''),
            nome: localStorage.getItem('nome') || 'Usuário CAC',
            telefone: (localStorage.getItem('telefone') || '5511999999999').replace(/\D/g, ''),
            email: localStorage.getItem('email') || 'usuario@cac.com.br',
            cidade: localStorage.getItem('cidade') || 'São Paulo',
            estado: localStorage.getItem('estado') || 'SP'
        };
    },
    
    async createPixPayment() {
        const userData = this.getUserData();
        const reference = this.generateReference();
        
        const payload = {
            amount: this.amount,
            description: 'Loja 5',
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
        
        try {
            const response = await fetch(`${this.baseURL}/transaction`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': this.apiKey
                },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.status !== 'success' || !data.qr_code) {
                throw new Error('Resposta inválida da API: falta qr_code ou status != success');
            }
            
            localStorage.setItem('pixPaymentId', data.transaction_id);
            localStorage.setItem('pixPaymentData', JSON.stringify(data));
            
            return data;
        } catch (error) {
            console.error('[PAYMENT-HANDLER] Erro:', error);
            throw error;
        }
    },
    
    async checkPaymentStatus(transactionId) {
        try {
            const response = await fetch(
                `${this.baseURL}/query?action=get_transaction&id=${transactionId}`,
                {
                    method: 'GET',
                    headers: {
                        'X-API-Key': this.apiKey
                    }
                }
            );
            
            return await response.json();
        } catch (e) {
            throw e;
        }
    }
};

// Exibir PIX
window.showPixPayment = function(paymentData) {
    const pixContainer = document.getElementById('pix-container');
    const pixLoading = document.getElementById('pix-loading');
    
    if (!pixContainer) return;
    if (pixLoading) pixLoading.style.display = 'none';
    
    const pixCode = paymentData.qr_code;
    if (!pixCode) {
        pixContainer.innerHTML = '<div class="text-red-600 font-bold">Erro: QR Code não encontrado</div>';
        return;
    }
    
    const valor = (paymentData.amount / 100).toFixed(2);
    
    pixContainer.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl p-8 max-w-2xl mx-auto">
            <div class="text-center mb-8">
                <div class="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-qrcode text-green-700 text-3xl"></i>
                </div>
                <h2 class="text-3xl font-bold text-gray-800 mb-2">Pagamento via PIX</h2>
                <p class="text-2xl font-bold text-green-600">R$ ${valor}</p>
            </div>
            
            <div id="qrcode" class="flex justify-center mb-6 p-4 bg-gray-50 rounded-lg" style="min-height: 280px;"></div>
            
            <div class="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                <p class="text-blue-900"><strong>ℹ️ Como pagar:</strong></p>
                <ol class="text-blue-800 text-sm mt-2 ml-4 list-decimal">
                    <li>Escaneie o QR Code com seu banco</li>
                    <li>Ou copie e cole o código PIX abaixo</li>
                    <li>Confirme a transação</li>
                </ol>
            </div>
            
            <div class="mb-6">
                <label class="block text-gray-700 font-semibold mb-2">Código PIX (Copia e Cola):</label>
                <div class="flex gap-2">
                    <input 
                        type="text" 
                        id="pix-code" 
                        value="${pixCode}" 
                        readonly 
                        class="flex-1 px-4 py-2 border border-gray-300 rounded font-mono text-xs"
                    >
                    <button 
                        onclick="window.copiarPix()" 
                        class="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-semibold"
                    >
                        <i class="fas fa-copy"></i> Copiar
                    </button>
                </div>
            </div>
            
            <div class="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
                <p class="text-yellow-900 font-semibold">PINGUPAG - Gateway de Pagamento PIX</p>
            </div>
            
            <div class="text-center">
                <p class="text-gray-600 text-sm">Aguardando confirmação...</p>
                <div class="mt-2"><i class="fas fa-spinner fa-spin text-green-600"></i></div>
            </div>
        </div>
    `;
    
    try {
        if (typeof QRCode !== 'undefined') {
            new QRCode(document.getElementById('qrcode'), {
                text: pixCode,
                width: 256,
                height: 256,
                colorDark: '#000000',
                colorLight: '#ffffff',
                correctLevel: QRCode.CorrectLevel.H
            });
        }
    } catch (e) {
        console.error('[PAYMENT-HANDLER] Erro QR:', e);
    }
    
    window.startPaymentVerification(paymentData.transaction_id);
};

window.copiarPix = function() {
    const pixCode = document.getElementById('pix-code');
    if (pixCode) {
        pixCode.select();
        document.execCommand('copy');
        alert('✓ PIX copiado!');
    }
};

let verificationInterval = null;

window.startPaymentVerification = function(transactionId) {
    let attempts = 0;
    
    verificationInterval = setInterval(async () => {
        attempts++;
        if (attempts > 360) {
            clearInterval(verificationInterval);
            return;
        }
        
        try {
            const status = await window.PINGUPAG_API.checkPaymentStatus(transactionId);
            if (status.status === 'approved' || status.payment_status === 'paid') {
                clearInterval(verificationInterval);
                window.onPaymentSuccess(status);
            }
        } catch (e) {
            // Silencia
        }
    }, 5000);
};

window.onPaymentSuccess = function(paymentData) {
    localStorage.setItem('pixPaymentStatus', 'APPROVED');
    const pixContainer = document.getElementById('pix-container');
    if (pixContainer) {
        pixContainer.innerHTML = `
            <div class="bg-white rounded-lg shadow-xl p-8 max-w-2xl mx-auto text-center">
                <div class="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-check text-green-700 text-4xl"></i>
                </div>
                <h2 class="text-2xl font-bold text-green-800 mb-2">Pagamento Confirmado!</h2>
                <p class="text-gray-600">Seu registro foi processado com sucesso.</p>
            </div>
        `;
    }
};

console.log('[PAYMENT-HANDLER] ✅ Sistema carregado - Apenas Pingupag');
