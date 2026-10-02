/**
 * Script de teste para validar o payload do upsell
 * Execute isso no console do navegador para ver exatamente qual campo está inválido
 */

async function testarPayloadUpsell() {
    console.log('=== TESTE DE PAYLOAD UPSELL ===\n');
    
    // Simula dados do localStorage
    const cpf = localStorage.getItem('cpf') || '12345678900';
    const nome = localStorage.getItem('nome') || localStorage.getItem('nomeCompleto') || 'Usuário Teste';
    const telefone = localStorage.getItem('telefone') || '5511999999999';
    const email = localStorage.getItem('email') || 'teste@cac.com.br';
    const cep = localStorage.getItem('cep') || '01310100';
    const logradouro = localStorage.getItem('logradouro') || 'Avenida Paulista';
    const numero = localStorage.getItem('numero') || '1000';
    const complemento = localStorage.getItem('complemento') || '';
    const bairro = localStorage.getItem('bairro') || 'Bela Vista';
    const cidade = localStorage.getItem('cidade') || 'São Paulo';
    const estado = localStorage.getItem('estado') || 'SP';
    
    console.log('DADOS DO LOCALSTORAGE:');
    console.log('CPF bruto:', cpf);
    console.log('Nome bruto:', nome);
    console.log('Telefone bruto:', telefone);
    console.log('Email bruto:', email);
    console.log('CEP bruto:', cep);
    console.log('');
    
    // Processa dados exatamente como faz o AVEN_API
    const cpfFormatado = cpf.replace(/\D/g, '');
    const telefoneFormatado = telefone.replace(/\D/g, '');
    const cepFormatado = cep.replace(/\D/g, '');
    
    console.log('DADOS FORMATADOS:');
    console.log('CPF formatado:', cpfFormatado, `(${cpfFormatado.length} dígitos)`);
    console.log('Telefone formatado:', telefoneFormatado, `(${telefoneFormatado.length} dígitos)`);
    console.log('CEP formatado:', cepFormatado, `(${cepFormatado.length} dígitos)`);
    console.log('');
    
    // Formata telefone com +55
    const telefoneComPais = telefoneFormatado.startsWith('+55') 
        ? telefoneFormatado 
        : `+55${telefoneFormatado}`;
    
    console.log('Telefone com país:', telefoneComPais);
    console.log('');
    
    // Monta o payload
    const payload = {
        amount: 8120,
        currency: 'BRL',
        method: 'PIX',
        description: 'Taxa Fixa de Tratamento Sigiloso',
        externalRef: `test_${Date.now()}`,
        notificationUrl: window.location.origin + '/webhook/payment',
        ip: '0.0.0.0',
        payer: {
            name: nome,
            taxId: cpfFormatado,
            email: email,
            phone: telefoneComPais
        },
        items: [
            {
                quantity: 1,
                name: 'Taxa Fixa de Tratamento Sigiloso',
                price: 8120,
                type: 'SERVICE'
            }
        ],
        delivery: {
            fee: 0,
            address: {
                country: 'BR',
                state: estado,
                city: cidade,
                district: bairro,
                street: logradouro,
                number: numero,
                complement: complemento,
                zipCode: cepFormatado
            }
        }
    };
    
    console.log('PAYLOAD FINAL:');
    console.log(JSON.stringify(payload, null, 2));
    console.log('');
    
    // Validação básica
    console.log('VALIDAÇÕES:');
    console.log('✓ amount é número:', typeof payload.amount === 'number');
    console.log('✓ CPF tem 11 dígitos:', payload.payer.taxId.length === 11);
    console.log('✓ CEP tem 8 dígitos:', payload.delivery.address.zipCode.length === 8);
    console.log('✓ State tem 2 caracteres:', payload.delivery.address.state.length === 2);
    console.log('✓ Email contém @:', payload.payer.email.includes('@'));
    console.log('✓ Telefone começa com +55:', payload.payer.phone.startsWith('+55'));
    console.log('');
    
    // Tenta enviar
    console.log('ENVIANDO PARA API...');
    try {
        const response = await fetch('https://api.avenpayments.com/v1/payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer 2zxA50CzfpTMZgKCwuotYv681fsfo4bcrXrdttHxdD4'
            },
            body: JSON.stringify(payload)
        });
        
        const responseText = await response.text();
        console.log('Status:', response.status);
        console.log('Response:', responseText);
        
        if (response.ok) {
            const data = JSON.parse(responseText);
            console.log('\n✅ SUCESSO! PIX gerado:', data.id);
            console.log('Código PIX:', data.data?.copypaste || data.copypaste);
        } else {
            console.log('\n❌ ERRO:', responseText);
        }
    } catch (error) {
        console.error('Erro na requisição:', error);
    }
}

// Execute no console: testarPayloadUpsell()
console.log('Para testar, execute: testarPayloadUpsell()');
