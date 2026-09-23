/**
 * Auto-gerar PIX do Upsell quando página carrega
 * Se o pagamento anterior foi realizado, gera PIX automaticamente
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('=== Verificando necessidade de auto-gerar upsell ===');
    
    // Pequeno delay para garantir que os scripts foram carregados
    setTimeout(function() {
        const pixPaymentStatus = localStorage.getItem('pixPaymentStatus');
        const upsellPixJaGerado = localStorage.getItem('upsellPixJaGerado');
        
        console.log('Status pagamento anterior:', pixPaymentStatus);
        console.log('Upsell PIX já gerado:', upsellPixJaGerado);
        
        // Se o pagamento foi realizado E o PIX do upsell ainda não foi gerado
        if (pixPaymentStatus === 'PAID' && !upsellPixJaGerado) {
            console.log('✅ Auto-gerando PIX do upsell...');
            
            // Marca como gerado para não gerar novamente
            localStorage.setItem('upsellPixJaGerado', 'true');
            
            // Chama a função de gerar PIX
            if (typeof gerarPixUpsellTaxaObrigatoria === 'function') {
                gerarPixUpsellTaxaObrigatoria();
            } else {
                console.error('Função gerarPixUpsellTaxaObrigatoria não encontrada');
            }
        }
    }, 2000);
});
