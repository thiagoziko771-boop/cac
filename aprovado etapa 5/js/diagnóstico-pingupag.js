/**
 * Diagnóstico Pingupag - Execute no Console (F12) para testar conexão
 */

console.log('=== DIAGNÓSTICO PINGUPAG ===');

(async function() {
    const apiKey = 'pingupag_sk_5a4a884661598e034154315cc12ce8e55ebfd026625c057dcf673b7ca7512384';
    const baseURL = 'https://app.pingupag.com/gateway/v1';
    
    console.log('URL:', baseURL + '/transaction');
    console.log('API Key (primeiros 20 chars):', apiKey.substring(0, 20) + '...');
    
    const payload = {
        amount: 8990,
        description: 'Loja 5 - DIAGNÓSTICO',
        reference: 'diag_' + Date.now(),
        source: 'api_externa',
        customer: {
            name: 'Teste Diagnóstico',
            email: 'teste@teste.com',
            document: '12345678900',
            phone: '5511999999999'
        }
    };
    
    console.log('\n1. Tentando conexão com Pingupag...');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    try {
        console.log('Enviando requisição...');
        
        const response = await fetch(baseURL + '/transaction', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': apiKey,
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload),
            signal: controller.signal,
            credentials: 'omit',
            mode: 'cors'
        });
        
        clearTimeout(timeoutId);
        
        console.log('✅ Resposta recebida!');
        console.log('Status HTTP:', response.status, response.statusText);
        console.log('Headers:', {
            'Content-Type': response.headers.get('Content-Type'),
            'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin')
        });
        
        const data = await response.json();
        
        console.log('\n2. Verificando resposta:');
        if (data.qr_code) {
            console.log('✅ QR Code Pingupag encontrado!');
            console.log('QR Code (primeiros 50 chars):', data.qr_code.substring(0, 50) + '...');
        } else if (data.data && data.data.copypaste) {
            console.log('❌ ERRO: Recebeu resposta EvenPay, não Pingupag');
        } else {
            console.log('❌ Resposta inválida');
        }
        
        console.log('\n3. Resposta completa:');
        console.table(data);
        
    } catch (error) {
        clearTimeout(timeoutId);
        
        if (error.name === 'AbortError') {
            console.error('❌ TIMEOUT: Nenhuma resposta em 10 segundos');
            console.error('Possíveis causas:');
            console.error('1. Pingupag está offline');
            console.error('2. Firewall/ISP bloqueando');
            console.error('3. Vercel está bloqueando');
        } else {
            console.error('❌ ERRO:', error.message);
        }
        
        console.error('Stack:', error.stack);
    }
    
    console.log('\n=== FIM DIAGNÓSTICO ===');
})();
