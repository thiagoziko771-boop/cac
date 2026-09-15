/**
 * Integração com API AvenPayments - PIX
 * API Key: d_5SKkAF0pnKaSJ0OLKrsPdbr9LRcw8Qyox6Kz1keXw
 */

const AVEN_API = {
    baseURL: 'https://api.avenpayments.com/v1',
    apiKey: 'd_5SKkAF0pnKaSJ0OLKrsPdbr9LRcw8Qyox6Kz1keXw',
    
    // Valor da taxa CAC em centavos (R$ 299,90)
    amount: 29990,
    
    // Gera um ID único para a transação
    generateExternalRef() {
        return `cac_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },
    
    // Busca dados do usuário do localStorage
    getUserData() {
        try {
            const cpf = localStorage.getItem('cpf') || '';
            const nomeCompleto = localStorage.getItem('nomeCompleto') || '';
            const telefone = localStorage.getItem('telefone') || '';
            const email = localStorage.getItem('email') || '';
            
            // Busca endereço da etapa 2
            const cep = localStorage.getItem('cep') || '';
            const logradouro = localStorage.getItem('logradouro') || '';
            const numero = localStorage.getItem('numero') || '';
            const complemento = localStorage.getItem('complemento') || '';
            const bairro = localStorage.getItem('bairro') || '';
            const cidade = localStorage.getItem('cidade') || '';
            const estado = localStorage.getItem('estado') || '';
            
            return {
                cpf: cpf.replace(/\D/g, ''),
                nome: nomeCompleto,
                telefone: telefone.replace(/\D/g, ''),
                email: email,
                endereco: {
                    cep: cep.replace(/\D/g, ''),
                    logradouro,
                    numero,
                    complemento,
                    bairro,
                    cidade,
                    estado
                }
            };
        } catch (error) {
            console.error('Erro ao buscar dados do usuário:', error);
            return null;
        }
    },
    
    // Cria pagamento PIX
    async createPixPayment() {
        const userData = this.getUserData();
        
        if (!userData || !userData.cpf || !userData.nome || !userData.email) {
            throw new Error('Dados do usuário incompletos. Por favor, volte e preencha todos os campos obrigatórios.');
        }
        
        const externalRef = this.generateExternalRef();
        
        const payload = {
            amount: this.amount,
            currency: 'BRL',
            method: 'PIX',
            description: 'Taxa de Registro CAC - Certificado de Registro',
            externalRef: externalRef,
            notificationUrl: window.location.origin + '/webhook/payment',
            ip: await this.getClientIP(),
            payer: {
                name: userData.nome,
                taxId: userData.cpf,
                email: userData.email,
                phone: userData.telefone || '00000000000'
            },
            items: [
                {
                    quantity: 1,
                    name: 'Taxa de Registro CAC - Certificado de Registro',
                    price: this.amount,
                    type: 'DIGITAL'
                }
            ],
            delivery: {
                fee: 0,
                address: {
                    country: 'BR',
                    state: userData.endereco.estado || 'SP',
                    city: userData.endereco.cidade || 'São Paulo',
                    district: userData.endereco.bairro || 'Centro',
                    street: userData.endereco.logradouro || 'Rua Exemplo',
                    number: userData.endereco.numero || '0',
                    complement: userData.endereco.complemento || null,
                    zipCode: userData.endereco.cep || '00000000'
                }
            },
            metadata: {
                provider: 'registro-cac',
                orderId: externalRef,
                sellerTaxId: userData.cpf,
                sellerEmail: userData.email,
                checkoutUrl: window.location.href,
                returnUrl: window.location.href,
                shopUrl: window.location.origin,
                referrerLink: document.referrer || null,
                extra: {
                    tipo: 'taxa_registro_cac',
                    dataRegistro: new Date().toISOString()
                }
            }
        };
        
        try {
            const response = await fetch(`${this.baseURL}/payment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erro ao criar pagamento PIX');
            }
            
            const data = await response.json();
            
            // Salva informações do pagamento no localStorage
            localStorage.setItem('pixPaymentId', data.id);
            localStorage.setItem('pixPaymentData', JSON.stringify(data));
            
            return data;
            
        } catch (error) {
            console.error('Erro na API:', error);
            throw error;
        }
    },
    
    // Busca IP do cliente (fallback para "0.0.0.0")
    async getClientIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            console.warn('Não foi possível obter IP do cliente:', error);
            return '0.0.0.0';
        }
    },
    
    // Verifica status do pagamento
    async checkPaymentStatus(paymentId) {
        try {
            const response = await fetch(`${this.baseURL}/payment/${paymentId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
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
function showPixPayment(paymentData) {
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
            
            <div class="mb-6">
                <div id="qrcode" class="flex justify-center mb-4 p-4 bg-gray-50 rounded"></div>
                <p class="text-sm text-gray-600 text-center mb-4">Escaneie o QR Code com o app do seu banco</p>
            </div>
            
            <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">Ou copie o código PIX:</label>
                <div class="flex gap-2">
                    <input 
                        type="text" 
                        id="pix-code" 
                        value="${paymentData.data.copypaste}" 
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
                        <p>Após o pagamento, seu certificado será processado automaticamente.</p>
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
        new QRCode(document.getElementById('qrcode'), {
            text: paymentData.data.copypaste,
            width: 256,
            height: 256,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H
        });
    } catch (error) {
        console.error('Erro ao gerar QR Code:', error);
    }
    
    // Inicia verificação automática do pagamento
    startPaymentVerification(paymentData.id);
}

// Função para copiar código PIX
function copyPixCode() {
    const pixCodeInput = document.getElementById('pix-code');
    pixCodeInput.select();
    pixCodeInput.setSelectionRange(0, 99999); // Para mobile
    
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

function startPaymentVerification(paymentId) {
    // Verifica a cada 5 segundos
    verificationInterval = setInterval(async () => {
        try {
            const status = await AVEN_API.checkPaymentStatus(paymentId);
            
            if (status.status === 'PAID') {
                clearInterval(verificationInterval);
                onPaymentSuccess(status);
            } else if (status.status === 'REFUSED' || status.status === 'REFUNDED') {
                clearInterval(verificationInterval);
                onPaymentError('Pagamento recusado ou cancelado');
            }
        } catch (error) {
            console.error('Erro ao verificar status:', error);
        }
    }, 5000);
    
    // Para a verificação após 30 minutos
    setTimeout(() => {
        if (verificationInterval) {
            clearInterval(verificationInterval);
        }
    }, 30 * 60 * 1000);
}

// Callback de sucesso
function onPaymentSuccess(paymentData) {
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
                    será processado e enviado para o endereço cadastrado em até 30 dias.
                </p>
                <div class="bg-green-50 border border-green-200 rounded p-4 mb-6">
                    <p class="text-sm text-green-800">
                        <strong>ID do Pagamento:</strong><br>
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
    
    // Salva status no localStorage
    localStorage.setItem('pixPaymentStatus', 'PAID');
    localStorage.setItem('pixPaymentConfirmedAt', new Date().toISOString());
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
    // Verifica se já existe um pagamento pendente
    const savedPaymentData = localStorage.getItem('pixPaymentData');
    const savedPaymentStatus = localStorage.getItem('pixPaymentStatus');
    
    if (savedPaymentData && savedPaymentStatus !== 'PAID') {
        try {
            const paymentData = JSON.parse(savedPaymentData);
            // Exibe o PIX salvo
            showPixPayment(paymentData);
        } catch (error) {
            console.error('Erro ao carregar pagamento salvo:', error);
        }
    }
});

// Expõe funções globalmente
window.AVEN_API = AVEN_API;
window.showPixPayment = showPixPayment;
window.copyPixCode = copyPixCode;
