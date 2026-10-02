/**
 * Webhook intermediário: Even Pay → Pushcut
 * Formata notificações de pagamento para enviar ao Pushcut
 */

// Chave da API Even Pay
const EVEN_PAY_API_KEY = '2zxA50CzfpTMZgKCwuotYv681fsfo4bcrXrdttHxdD4';

// URLs do Pushcut
const PUSHCUT_URLS = {
    pendente: 'https://api.pushcut.io/vDugtAoggC9xef2AU2kQs/notifications/Aven',
    pago: 'https://api.pushcut.io/vDugtAoggC9xef2AU2kQs/notifications/AvenPay'
};

// URL base da API Even Pay
const EVEN_PAY_BASE_URL = 'https://api.evenpay.com.br';

// Função para fazer requisições autenticadas à API Even Pay
async function chamarEvenPayAPI(endpoint, metodo = 'GET', dados = null) {
    try {
        const opcoes = {
            method: metodo,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${EVEN_PAY_API_KEY}`
            }
        };
        
        if (dados && ['POST', 'PUT', 'PATCH'].includes(metodo)) {
            opcoes.body = JSON.stringify(dados);
        }
        
        const url = `${EVEN_PAY_BASE_URL}${endpoint}`;
        const response = await fetch(url, opcoes);
        
        if (!response.ok) {
            throw new Error(`Even Pay retornou status ${response.status}`);
        }
        
        const resultado = await response.json();
        return { sucesso: true, dados: resultado };
    } catch (error) {
        console.error(`Erro ao chamar Even Pay API (${endpoint}):`, error);
        return { sucesso: false, erro: error.message };
    }
}

// Função para formatar valor em reais
function formatarValor(centavos) {
    return (centavos / 100).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

// Função para formatar CPF (oculta dígitos do meio)
function formatarCPF(cpf) {
    if (!cpf) return 'N/A';
    const limpo = cpf.replace(/\D/g, '');
    if (limpo.length !== 11) return cpf;
    return `***.${limpo.substring(3, 6)}.${limpo.substring(6, 9)}-**`;
}

// Função para registrar/atualizar webhook na Even Pay
async function registrarWebhookEvenPay(urlWebhook) {
    const dadosWebhook = {
        url: urlWebhook,
        eventos: ['payment.pending', 'payment.approved', 'payment.refused'],
        ativo: true
    };
    
    const resultado = await chamarEvenPayAPI('/webhooks', 'POST', dadosWebhook);
    
    if (resultado.sucesso) {
        console.log('Webhook registrado na Even Pay com sucesso:', resultado.dados);
    } else {
        console.error('Erro ao registrar webhook na Even Pay:', resultado.erro);
    }
    
    return resultado;
}

// Função para enviar notificação ao Pushcut
async function enviarPushcut(url, titulo, mensagem) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: titulo,
                text: mensagem,
                sound: 'default'
            })
        });
        
        if (!response.ok) {
            throw new Error(`Pushcut retornou status ${response.status}`);
        }
        
        console.log('Notificação enviada com sucesso ao Pushcut');
        return true;
    } catch (error) {
        console.error('Erro ao enviar notificação ao Pushcut:', error);
        return false;
    }
}

// Handler principal
export default async function handler(req, res) {
    // Aceita apenas POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido. Use POST.' });
    }
    
    // Valida a chave Even Pay no header (segurança)
    const chaveRecebida = req.headers['x-even-pay-key'];
    if (chaveRecebida && chaveRecebida !== EVEN_PAY_API_KEY) {
        return res.status(401).json({ error: 'Chave Even Pay inválida' });
    }
    
    console.log('=== Webhook recebido da Even Pay ===');
    console.log('Body:', JSON.stringify(req.body, null, 2));
    
    try {
        const dados = req.body;
        
        // Extrai informações do pagamento
        const id = dados.id || 'N/A';
        const amount = dados.amount || 0;
        const status = dados.status || 'UNKNOWN';
        const method = dados.method || 'PIX';
        
        // Informações do pagador
        const payerName = dados.payer?.name || 'Cliente';
        const payerTaxId = dados.payer?.taxId || '';
        const payerEmail = dados.payer?.email || '';
        
        // Formata o valor
        const valorFormatado = formatarValor(amount);
        const cpfFormatado = formatarCPF(payerTaxId);
        
        // Data/hora
        const agora = new Date().toLocaleString('pt-BR');
        
        console.log(`Status: ${status} | Valor: ${valorFormatado} | Cliente: ${payerName}`);
        
        // Determina qual notificação enviar baseado no status
        let titulo, mensagem, pushcutUrl;
        
        switch (status) {
            case 'PENDING':
            case 'AWAITING_PAYMENT':
                // PIX gerado mas ainda não pago
                titulo = '🟡 Venda Pendente';
                mensagem = `R$ ${valorFormatado}`;
                pushcutUrl = PUSHCUT_URLS.pendente;
                break;
                
            case 'PAID':
            case 'APPROVED':
                // PIX foi pago - VENDA CONFIRMADA! 🎉
                titulo = '💰 Venda Aprovada';
                mensagem = `R$ ${valorFormatado}`;
                pushcutUrl = PUSHCUT_URLS.pago;
                break;
                
            case 'REFUSED':
            case 'CANCELLED':
                // Pagamento recusado/cancelado
                titulo = '❌ Cancelado';
                mensagem = `R$ ${valorFormatado}`;
                pushcutUrl = PUSHCUT_URLS.pendente; // Envia como pendente
                break;
                
            default:
                // Status desconhecido
                console.log(`Status desconhecido: ${status}`);
                titulo = `⚠️ ${status}`;
                mensagem = `R$ ${valorFormatado}`;
                pushcutUrl = PUSHCUT_URLS.pendente;
        }
        
        // Envia notificação ao Pushcut
        const sucesso = await enviarPushcut(pushcutUrl, titulo, mensagem);
        
        if (sucesso) {
            return res.status(200).json({
                success: true,
                message: 'Notificação enviada ao Pushcut com sucesso',
                status: status,
                valor: valorFormatado,
                evenPayKey: '✓ Configurada'
            });
        } else {
            return res.status(500).json({
                success: false,
                message: 'Erro ao enviar notificação ao Pushcut'
            });
        }
        
    } catch (error) {
        console.error('Erro ao processar webhook:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}
