// Script Node.js para testar Pingupag (copiar e colar no console ou rodas com node)

const PINGUPAG_API_KEY = 'pingupag_sk_5a4a884661598e034154315cc12ce8e55ebfd026625c057dcf673b7ca7512384';
const PINGUPAG_URL = 'https://app.pingupag.com/gateway/v1/transaction';

async function testarPingupag() {
    console.log('🚀 Testando Pingupag...\n');
    
    try {
        const payload = {
            amount: 8990,
            description: 'Loja 05 - Teste',
            reference: `teste_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            source: 'api_externa',
            customer: {
                name: 'Cliente Teste',
                email: 'teste@example.com',
                document: '12345678900',
                phone: '11987654321'
            },
            address: {
                city: 'São Paulo',
                state: 'SP',
                street: 'Rua Teste',
                number: '0',
                zipcode: '00000000'
            }
        };
        
        console.log('📤 Enviando:', JSON.stringify(payload, null, 2));
        console.log('');
        
        const response = await fetch(PINGUPAG_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': PINGUPAG_API_KEY
            },
            body: JSON.stringify(payload)
        });
        
        const dados = await response.json();
        
        console.log('📥 Resposta da API:');
        console.log(JSON.stringify(dados, null, 2));
        console.log('');
        
        if (dados.status === 'success') {
            console.log('✅ SUCESSO!');
            console.log(`Transaction ID: ${dados.transaction_id}`);
            console.log(`Valor: R$ ${(dados.amount / 100).toFixed(2)}`);
            console.log(`QR Code: ${dados.qr_code.substring(0, 50)}...`);
        } else {
            console.log('❌ ERRO:', dados.message);
        }
        
    } catch (erro) {
        console.error('❌ Erro na requisição:', erro.message);
    }
}

// Se rodar com Node.js
if (typeof fetch === 'undefined') {
    // Usar node-fetch ou nativo do Node 18+
    console.log('Execute este código no console do navegador ou em Node.js 18+');
}

testarPingupag();
