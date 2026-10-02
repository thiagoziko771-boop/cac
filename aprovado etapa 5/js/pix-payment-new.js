/**
 * Integração com API Pingupag - PIX
 * API Key: pingupag_sk_5a4a884661598e034154315cc12ce8e55ebfd026625c057dcf673b7ca7512384
 */

console.log('=== PIX PAYMENT SCRIPT (PINGUPAG) CARREGADO ===');
console.log('Timestamp:', new Date().toISOString());
console.log('URL atual:', window.location.href);

const PINGUPAG_API = {
    baseURL: 'https://app.pingupag.com/gateway/v1',
    apiKey: 'pingupag_sk_5a4a884661598e034154315cc12ce8e55ebfd026625c057dcf673b7ca7512384',
    
    // Valor da taxa CAC em centavos (R$ 89,90)
    amount: 8990,
    
    // Gera um ID único para a transação
    generateReference() {
        return `cac_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },
    
    // Busca dados do usuário do localStorage
    getUserData() {
        try {
            const cpf = localStorage.getItem('cpf');
            const nomeCompleto = localStorage.getItem('nome') || localStorage.getItem('nomeCompleto');
            const telefone = localStorage.getItem('telefone');
            const email = localStorage.getItem('email');
            
            const cep = localStorage.getItem('cep');
            const logradouro = localStorage.getItem('logradouro');
            const numero = localStorage.getItem('numero');
            const complemento = localStorage.getItem('complemento') || '';
            const bairro = localStorage.getItem('bairro');
            const cidade = localStorage.getItem('cidade');
            const estado = localStorage.getItem('estado');
            
            console.log('=== Dados do localStorage ===');
            console.log('CPF:', cpf);
            console.log('Nome:', nomeCompleto);
            console.log('Telefone:', telefone);
            console.log('Email:', email);
            
            // Limpa e valida dados
            const cpfLimpo = cpf ? cpf.replace(/\D/g, '') : '12345678900';
            let telefoneLimpo = telefone ? telefone.replace(/\D/g, '') : '5511999999999';
            
            // Garante que telefone tem 11 dígitos
            if (telefoneLimpo.length < 11) {
                telefoneLimpo = telefoneLimpo.padEnd(11, '0');
            }
            
            let cepLimpo = cep ? cep.replace(/\D/g, '') : '01310100';
            // Garante que CEP tem 8 dígitos
            if (cepLimpo.length < 8) {
                cepLimpo = cepLimpo.padEnd(8, '0');
            }
            
            // Valida email
            const emailValido = email && email.includes('@') ? email : 'teste@cac.com.br';
            
            return {
                cpf: cpfLimpo,
                nome: nomeCompleto || 'Usuário Teste CAC',
                telefone: telefoneLimpo,
                email: emailValido,
                endereco: {
                    cep: cepLimpo,
                    logradouro: (logradouro || 'Avenida Paulista').substring(0, 255),
                    numero: (numero || '1000').toString().substring(0, 10),
                    complemento: (complemento || '').substring(0, 255),
                    bairro: (bairro || 'Bela Vista').substring(0, 255),
                    cidade: (cidade || 'São Paulo').substring(0, 255),
                    estado: (estado || 'SP').substring(0, 2).toUpperCase()
                }
            };
        } catch (error) {
            console.error('Erro ao buscar dados do usuário:', error);
            return {
                cpf: '12345678900',
                nome: 'Usuário Teste CAC',
                telefone: '5511999999999',
                email: 'teste@cac.com.br',
                endereco: {
                    cep: '01310100',
                    logradouro: 'Avenida Paulista',
                    numero: '1000',
                    complemento: '',
                    bairro: 'Bela Vista',
                    cidade: 'São Paulo',
                    estado: 'SP'
                }
            };
        }
    },
    
    // Cria pagamento PIX na Pingupag
    async createPixPayment() {
        const userData = this.getUserData();
        console.log('Dados do usuário para pagamento:', userData);
        
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
                street: userData.endereco.logradouro,
                number: userData.endereco.numero,
                complement: userData.endereco.complemento,
                neighborhood: userData.endereco.bairro,
                city: userData.endereco.cidade,
                state: userData.endereco.estado,
                zipcode: userData.endereco.cep
            },
            tracking: {
                utm_source: 'registro-cac',
                utm_campaign: 'taxa-registro',
                utm_medium: 'pix'
            }
        };
        
        try {
            console.log('=== Enviando payload para Pingupag ===');
            console.log('URL:', `${this.baseURL}/transaction`);
            console.log('Payload:', JSON.stringify(payload, null, 2));
            
            const response = await fetch(`${this.baseURL}/transaction`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': this.apiKey
                },
                body: JSON.stringify(payload),
                mode: 'cors',
                credentials: 'omit'
            });
            
            console.log('=== Resposta da Pingupag ===');
            console.log('Status:', response.status);
            console.log('Status Text:', response.statusText);
            
            const responseText = await response.text();
            console.log('Response Body (raw):', responseText);
            
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                throw new Error(`Erro ao parsear resposta: ${responseText}`);
            }
            
            if (!response.ok) {
                console.error('=== Erro da Pingupag ===');
                console.error('Error Data:', data);
                throw new Error(data.message || `Erro ${response.status}: ${response.statusText}`);
            }
            
            console.log('=== Pagamento criado com sucesso ===');
            console.log('Payment Data:', data);
            
            // Salva informações do pagamento no localStorage
            localStorage.setItem('pixPaymentId', data.transaction_id);
            localStorage.setItem('pixPaymentData', JSON.stringify(data));
            
            return data;
            
        } catch (error) {
            console.error('Erro na Pingupag:', error);
            throw error;
        }
    },
    
    // Verifica status do pagamento
    async checkPaymentStatus(transactionId) {
        try {
            const response = await fetch(`${this.baseURL}/query?action=get_transaction&id=${transactionId}`, {
                method: 'GET',
                headers: {
                    'X-API-Key': this.apiKey
                }
            });
            
            if (!response.ok) {
                throw new Error('Erro ao verificar status do pagamento');
            }
            
            return await response.json();
            
        } catch (error) {
            console.error('Erro ao verificar pagamento:', error);
            throw error;
        }
    }
};

// Função para exibir o PIX na tela
function showPixPayment(paymentData, userData = null) {
    console.log('=== showPixPayment chamada ===');
    console.log('Payment Data recebido:', paymentData);
    
    // Se não passou userData, tenta buscar do localStorage
    if (!userData) {
        userData = PINGUPAG_API.getUserData();
    }
    
    // Remove loading se existir
    const loadingElement = document.getElementById('pix-loading');
    if (loadingElement) {
        loadingElement.style.display = 'none';
    }
    
    // Cria container para o PIX
    const pixContainer = document.getElementById('pix-container');
    if (!pixContainer) {
        console.error('Container pix-container não encontrado');
        return;
    }
    
    // Tenta encontrar o código PIX
    let pixCode = paymentData.qr_code;
    
    console.log('Código PIX encontrado:', pixCode);
    
    if (!pixCode) {
        console.error('Código PIX não encontrado na resposta:', paymentData);
        pixContainer.innerHTML = `
            <div class="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
                <div class="flex items-start">
                    <i class="fas fa-exclamation-triangle text-yellow-500 mt-1 mr-3"></i>
                    <div>
                        <p class="font-semibold text-yellow-800 mb-1">Pagamento criado mas código PIX não encontrado</p>
                        <p class="text-sm text-yellow-700">Resposta da API:</p>
                        <pre class="text-xs mt-2 overflow-auto">${JSON.stringify(paymentData, null, 2)}</pre>
                    </div>
                </div>
            </div>
        `;
        return;
    }
    
    // Formata o valor
    const valorFormatado = (paymentData.amount / 100).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
    
    // HTML do PIX
    pixContainer.innerHTML = `
        <div class="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
            <div class="text-center mb-6">
                <div class="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-qrcode text-green-700 text-3xl"></i>
                </div>
                <h2 class="text-2xl font-bold text-green-800 mb-2">Pagamento via PIX</h2>
                <p class="text-gray-600 text-lg font-semibold">${valorFormatado}</p>
            </div>
            
            <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <h3 class="text-red-700 font-bold mb-2">⚠️ Observações Importantes:</h3>
                <div class="text-red-700 text-sm space-y-2">
                    <p>Informamos que, caso o pagamento não seja realizado dentro do prazo estabelecido, o <strong>CPF do responsável</strong> será bloqueado no sistema CAC pelo período de <strong>18 (dezoito) meses</strong>.</p>
                    <p>O valor da taxa, acrescido de multas, será registrado junto aos órgãos de proteção ao crédito (<strong>SPC e SERASA</strong>).</p>
                    <p class="text-xs mt-2 text-red-600">Emitido em ${new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</p>
                </div>
            </div>
            
            <div class="mb-6">
                <div id="qrcode" class="flex justify-center mb-4 p-4 bg-gray-50 rounded"></div>
                <p class="text-sm text-gray-600 text-center mb-4">Escaneie o QR Code com o app do seu banco</p>
                
                <div class="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4">
                    <div class="flex items-start">
                        <i class="fas fa-info-circle text-yellow-600 mt-0.5 mr-2"></i>
                        <div class="text-sm">
                            <p class="font-semibold text-yellow-800 mb-1">⚠️ Recebedor:</p>
                            <p class="text-yellow-700">Processado por <strong>Pingupag</strong></p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">Ou copie o código PIX:</label>
                <div class="flex gap-2">
                    <input 
                        type="text" 
                        id="pix-code" 
                        value="${pixCode}" 
                        readonly 
                        class="flex-1 px-3 py-2 border border-gray-300 rounded text-sm font-mono"
                    >
                    <button 
                        onclick="copyPixCode()" 
                        class="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded font-semibold text-sm flex items-center gap-2"
                    >
                        <i class="fas fa-copy"></i>
                        Copiar
                    </button>
                </div>
                <p id="copy-feedback" class="text-green-600 text-sm mt-2 hidden">✓ Código copiado!</p>
            </div>
            
            <div class="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                <div class="flex items-start">
                    <i class="fas fa-info-circle text-blue-500 mt-1 mr-3"></i>
                    <div class="text-sm text-blue-800">
                        <p class="font-semibold mb-1">Aguardando pagamento...</p>
                        <p class="mb-2">Após realizar o pagamento, o sistema verificará automaticamente.</p>
                        <p class="text-xs">💡 Se o pagamento não for detectado, recarregue esta página.</p>
                    </div>
                </div>
            </div>
            
            <div class="text-center">
                <div class="spinner-border text-green-700 mb-2" role="status">
                    <span class="sr-only">Aguardando confirmação...</span>
                </div>
                <p class="text-sm text-gray-500">Verificando pagamento automaticamente...</p>
            </div>
        </div>
    `;
    
    // Gera QR Code
    try {
        console.log('Gerando QR Code...');
        new QRCode(document.getElementById('qrcode'), {
            text: pixCode,
            width: 256,
            height: 256,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H
        });
        console.log('QR Code gerado com sucesso');
    } catch (error) {
        console.error('Erro ao gerar QR Code:', error);
    }
    
    // Inicia verificação automática do pagamento
    startPaymentVerification(paymentData.transaction_id);
}

// Função para copiar código PIX
function copyPixCode() {
    const pixCodeInput = document.getElementById('pix-code');
    pixCodeInput.select();
    pixCodeInput.setSelectionRange(0, 99999);
    
    try {
        document.execCommand('copy');
        
        // Feedback visual
        const feedback = document.getElementById('copy-feedback');
        feedback.classList.remove('hidden');
        setTimeout(() => {
            feedback.classList.add('hidden');
        }, 3000);
    } catch (error) {
        console.error('Erro ao copiar:', error);
        alert('Erro ao copiar código. Por favor, copie manualmente.');
    }
}

// Verificação automática do pagamento
let verificationInterval = null;

function startPaymentVerification(transactionId) {
    console.log('=== Iniciando verificação automática de pagamento ===');
    console.log('Transaction ID:', transactionId);
    
    let checkCount = 0;
    const maxChecks = 360; // 360 checks * 5s = 30 minutos
    
    verificationInterval = setInterval(async () => {
        checkCount++;
        
        if (checkCount > maxChecks) {
            console.log('Tempo limite de verificação atingido (30 minutos)');
            clearInterval(verificationInterval);
            return;
        }
        
        try {
            console.log(`Verificando pagamento (tentativa ${checkCount})...`);
            
            const status = await PINGUPAG_API.checkPaymentStatus(transactionId);
            
            console.log('Status do pagamento:', status);
            
            if (status.status === 'approved') {
                console.log('✅ Pagamento confirmado!');
                clearInterval(verificationInterval);
                onPaymentSuccess(status);
            } else if (status.status === 'failed' || status.status === 'refunded') {
                console.log('❌ Pagamento recusado ou cancelado');
                clearInterval(verificationInterval);
                onPaymentError('Pagamento recusado ou cancelado');
            } else {
                console.log('⏳ Pagamento ainda pendente, aguardando...');
            }
        } catch (error) {
            if (checkCount % 12 === 0) {
                console.warn('Verificação automática indisponível:', error.message);
            }
        }
    }, 5000);
}

// Callback de sucesso
function onPaymentSuccess(paymentData) {
    console.log('✅ Pagamento confirmado com sucesso!');
    
    localStorage.setItem('pixPaymentStatus', 'APPROVED');
    localStorage.setItem('pixPaymentConfirmedAt', new Date().toISOString());
    
    const pixContainer = document.getElementById('pix-container');
    if (pixContainer) {
        pixContainer.innerHTML = `
            <div class="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto text-center">
                <div class="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-check text-green-700 text-4xl"></i>
                </div>
                <h2 class="text-2xl font-bold text-green-800 mb-4">Pagamento Confirmado!</h2>
                <p class="text-gray-600 mb-6">
                    Seu pagamento foi confirmado com sucesso. Seu Certificado de Registro CAC 
                    será processado e enviado em até 30 dias.
                </p>
                <div class="bg-green-50 border border-green-200 rounded p-4 mb-6">
                    <p class="text-sm text-green-800">
                        <strong>ID da Transação:</strong><br>
                        <span class="font-mono text-xs">${paymentData.id}</span>
                    </p>
                </div>
                <button 
                    onclick="window.location.reload()" 
                    class="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded font-semibold"
                >
                    Concluir
                </button>
            </div>
        `;
    }
}

// Callback de erro
function onPaymentError(message) {
    const pixContainer = document.getElementById('pix-container');
    if (pixContainer) {
        pixContainer.innerHTML = `
            <div class="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto text-center">
                <div class="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-times text-red-700 text-4xl"></i>
                </div>
                <h2 class="text-2xl font-bold text-red-800 mb-4">Erro no Pagamento</h2>
                <p class="text-gray-600 mb-6">${message}</p>
                <button 
                    onclick="window.location.reload()" 
                    class="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded font-semibold"
                >
                    Tentar Novamente
                </button>
            </div>
        `;
    }
}

// Inicialização ao carregar a página
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== PIX (Pingupag): DOMContentLoaded disparado ===');
    
    // Verifica se já existe um pagamento pendente
    const savedPaymentData = localStorage.getItem('pixPaymentData');
    const savedPaymentStatus = localStorage.getItem('pixPaymentStatus');
    
    if (savedPaymentData && savedPaymentStatus !== 'APPROVED') {
        try {
            const paymentData = JSON.parse(savedPaymentData);
            showPixPayment(paymentData);
        } catch (error) {
            console.error('Erro ao carregar pagamento salvo:', error);
            gerarPix();
        }
    } else {
        console.log('Gerando PIX automaticamente...');
        gerarPix();
    }
});

// Função principal para gerar PIX
async function gerarPix() {
    console.log('=== Iniciando geração de PIX (Pingupag) ===');
    
    const loadingElement = document.getElementById('pix-loading');
    if (loadingElement) {
        loadingElement.classList.remove('hidden');
        loadingElement.style.display = 'block';
    }
    
    try {
        const paymentData = await PINGUPAG_API.createPixPayment();
        console.log('Pagamento PIX criado com sucesso:', paymentData);
        showPixPayment(paymentData);
    } catch (error) {
        console.error('❌ Erro ao gerar PIX:', error);
        
        const pixContainer = document.getElementById('pix-container');
        if (pixContainer) {
            pixContainer.innerHTML = `
                <div class="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                    <div class="flex items-start">
                        <i class="fas fa-exclamation-circle text-red-600 text-3xl mr-4 mt-1"></i>
                        <div>
                            <h3 class="font-bold text-red-800 mb-2">Erro ao Gerar PIX</h3>
                            <p class="text-red-700 text-sm mb-4">${error.message}</p>
                            <button 
                                onclick="gerarPix()" 
                                class="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded text-sm font-semibold"
                            >
                                Tentar Novamente
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }
        
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
    }
}
