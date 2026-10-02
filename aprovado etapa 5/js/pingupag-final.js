/**
 * PINGUPAG - VERSÃO CORRIGIDA
 * Chama API diretamente do browser com melhor tratamento de erros
 */

console.log('[PINGUPAG] Iniciando sistema...');

// Remove tudo antigo
delete window.AVEN_API;
delete window.EvenPay;
delete window.PAYMENT_API;

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
        
        console.log('[PINGUPAG] Tentativa de conexão com Pingupag...');
        console.log('[PINGUPAG] URL:', this.baseURL + '/transaction');
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // timeout 15s
        
        try {
            const response = await fetch(`${this.baseURL}/transaction`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': this.apiKey,
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload),
                signal: controller.signal,
                credentials: 'omit',
                mode: 'cors'
            });
            
            clearTimeout(timeoutId);
            
            console.log('[PINGUPAG] Status HTTP:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('[PINGUPAG] Resposta recebida:', data);
            
            window.lastResponse = data;
            
            // Validação: Pingupag deve retornar qr_code
            if (!data.qr_code) {
                console.error('[PINGUPAG] ❌ Resposta NÃO é Pingupag! Campo qr_code não encontrado');
                console.error('[PINGUPAG] Campos recebidos:', Object.keys(data));
                if (data.data && data.data.copypaste) {
                    throw new Error('ERRO DE BACKEND: Recebeu resposta EvenPay ao invés de Pingupag. Contate o administrador.');
                }
                throw new Error('API retornou resposta inválida (sem QR Code)');
            }
            
            console.log('[PINGUPAG] ✅ QR Code Pingupag obtido com sucesso!');
            
            localStorage.setItem('pixPaymentId', data.transaction_id || data.id || reference);
            localStorage.setItem('pixPaymentData', JSON.stringify(data));
            
            return data;
            
        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                console.error('[PINGUPAG] ❌ TIMEOUT: A API de Pingupag não respondeu em 15 segundos');
                throw new Error('Timeout: API não respondeu. Tente novamente.');
            }
            
            console.error('[PINGUPAG] ❌ ERRO:', error.message);
            window.lastError = error;
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
                    },
                    credentials: 'omit',
                    mode: 'cors'
                }
            );
            
            return await response.json();
        } catch (e) {
            throw e;
        }
    }
};

window.showPixPayment = function(paymentData) {
    const pixContainer = document.getElementById('pix-container');
    const pixLoading = document.getElementById('pix-loading');
    
    if (!pixContainer) {
        console.error('[PINGUPAG] Elemento pix-container não encontrado no HTML');
        return;
    }
    
    if (pixLoading) pixLoading.style.display = 'none';
    
    const pixCode = paymentData.qr_code;
    if (!pixCode) {
        console.error('[PINGUPAG] QR Code não encontrado em paymentData');
        pixContainer.innerHTML = `
            <div class="bg-red-50 border-2 border-red-300 rounded-lg p-6 text-center">
                <p class="text-red-700 font-bold text-lg">❌ QR Code não encontrado</p>
                <p class="text-gray-600 mt-2">Resposta recebida:</p>
                <pre class="bg-gray-100 p-2 mt-2 text-xs overflow-auto text-left max-h-48">${JSON.stringify(paymentData, null, 2)}</pre>
                <button onclick="console.log(window.lastResponse); console.log(window.lastError);" class="mt-2 bg-blue-600 text-white px-4 py-1 text-xs rounded">
                    Ver Console
                </button>
            </div>
        `;
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
            
            <div class="text-center">
                <p class="text-gray-600 text-sm">Aguardando confirmação do pagamento...</p>
                <div class="mt-2"><i class="fas fa-spinner fa-spin text-green-600"></i></div>
            </div>
        </div>
    `;
    
    const qrContainer = document.getElementById('qrcode');
    let qrRendered = false;

    // Fallback 1: usar imagem base64 retornada pela API Pingupag
    if (paymentData.qr_code_base64 && qrContainer) {
        try {
            qrContainer.innerHTML = `<img src="${paymentData.qr_code_base64}" alt="QR Code PIX" style="width:256px;height:256px;image-rendering:pixelated;">`;
            qrRendered = true;
            console.log('[PINGUPAG] ✅ QR Code renderizado via base64 da API');
        } catch (e) {
            console.warn('[PINGUPAG] Falha ao renderizar base64:', e);
        }
    }

    // Fallback 2: tentar QRCode.js se base64 não funcionou
    if (!qrRendered && typeof QRCode !== 'undefined' && qrContainer) {
        try {
            qrContainer.innerHTML = '';
            new QRCode(qrContainer, {
                text: pixCode,
                width: 256,
                height: 256,
                colorDark: '#000000',
                colorLight: '#ffffff',
                correctLevel: QRCode.CorrectLevel.H
            });
            qrRendered = true;
            console.log('[PINGUPAG] ✅ QR Code renderizado via QRCode.js');
        } catch (e) {
            console.error('[PINGUPAG] Erro QRCode.js:', e);
        }
    }

    // Fallback 3: exibir código copia-e-cola em destaque se nada funcionar
    if (!qrRendered && qrContainer) {
        qrContainer.innerHTML = `
            <div class="text-center p-4">
                <p class="text-orange-600 font-semibold mb-2">⚠️ QR Code não pôde ser exibido</p>
                <p class="text-sm text-gray-600">Use o código copia-e-cola abaixo para pagar</p>
            </div>`;
        console.warn('[PINGUPAG] ⚠️ QR Code não renderizado - usando fallback textual');
    }
    
    if (paymentData.transaction_id || paymentData.id) {
        window.startPaymentVerification(paymentData.transaction_id || paymentData.id);
    }
};

window.copiarPix = function() {
    const pixCode = document.getElementById('pix-code');
    if (pixCode) {
        pixCode.select();
        document.execCommand('copy');
        alert('✓ PIX copiado para a área de transferência!');
    }
};

let verificationInterval = null;

window.startPaymentVerification = function(transactionId) {
    console.log('[PINGUPAG] Iniciando verificação de pagamento para:', transactionId);
    let attempts = 0;
    
    verificationInterval = setInterval(async () => {
        attempts++;
        if (attempts > 360) { // 30 minutos
            clearInterval(verificationInterval);
            console.log('[PINGUPAG] Verificação expirou após 30 minutos');
            return;
        }
        
        try {
            const status = await window.PINGUPAG_API.checkPaymentStatus(transactionId);
            if (status && (status.status === 'approved' || status.status === 'paid' || status.payment_status === 'paid')) {
                clearInterval(verificationInterval);
                console.log('[PINGUPAG] ✅ Pagamento confirmado!');
                window.onPaymentSuccess(status);
            }
        } catch (e) {
            // Silencia erros de verificação
        }
    }, 5000);
};

window.onPaymentSuccess = function(paymentData) {
    console.log('[PINGUPAG] Exibindo tela de sucesso');
    localStorage.setItem('pixPaymentStatus', 'APPROVED');
    const pixContainer = document.getElementById('pix-container');
    if (pixContainer) {
        pixContainer.innerHTML = `
            <div class="bg-white rounded-lg shadow-xl p-8 max-w-2xl mx-auto text-center">
                <div class="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-check text-green-700 text-4xl"></i>
                </div>
                <h2 class="text-2xl font-bold text-green-800 mb-2">Pagamento Confirmado! ✅</h2>
                <p class="text-gray-600">Seu registro foi processado com sucesso.</p>
                <p class="text-sm text-gray-500 mt-4">Você será redirecionado em breve...</p>
            </div>
        `;
    }
};

console.log('[PINGUPAG] Sistema carregado e pronto');

/**
 * Função chamada quando a página carrega (onload)
 * Inicia automaticamente a geração de PIX
 */
window.gerarQrCodeOnLoad = async function() {
    console.log('[PINGUPAG] === INICIANDO GERAÇÃO DE PIX ===');
    
    try {
        const loading = document.getElementById('pix-loading');
        const container = document.getElementById('pix-container');
        
        if (!container) {
            console.error('[PINGUPAG] ERRO: Elemento pix-container não encontrado no HTML');
            return;
        }
        
        if (loading) loading.style.display = 'block';
        
        console.log('[PINGUPAG] Mostrando loader e chamando API...');
        
        // Cria o pagamento
        const paymentData = await window.PINGUPAG_API.createPixPayment();
        
        console.log('[PINGUPAG] Pagamento criado, exibindo QR Code');
        // Mostra o QR code
        window.showPixPayment(paymentData);
        
    } catch (error) {
        console.error('[PINGUPAG] === ERRO CRÍTICO ===');
        console.error('[PINGUPAG] Mensagem:', error.message);
        console.error('[PINGUPAG] Stack:', error.stack);
        
        const container = document.getElementById('pix-container');
        if (container) {
            container.innerHTML = `
                <div class="bg-red-50 border-2 border-red-300 rounded-lg p-6 text-center">
                    <p class="text-red-700 font-bold text-lg">❌ Erro ao gerar PIX</p>
                    <p class="text-gray-700 mt-3">${error.message}</p>
                    <details class="text-left mt-4 bg-red-100 p-3 rounded text-xs">
                        <summary class="cursor-pointer font-bold">Debug (F12 para mais info)</summary>
                        <pre class="mt-2 overflow-auto">${error.message}</pre>
                    </details>
                    <button onclick="location.reload()" class="mt-4 bg-blue-600 text-white px-6 py-2 rounded font-semibold">
                        Tentar Novamente
                    </button>
                </div>
            `;
            
            const loading = document.getElementById('pix-loading');
            if (loading) loading.style.display = 'none';
        }
    }
};

console.log('[PINGUPAG] ✅ Script carregado - aguardando onload()');


