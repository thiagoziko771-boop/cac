/**
 * Auto-gerar PIX do Upsell quando página carrega
 * Se o pagamento anterior foi realizado E a página recarregar, gera PIX automaticamente
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('=== Verificando necessidade de auto-gerar upsell ===');
    
    // Pequeno delay para garantir que os scripts foram carregados
    setTimeout(function() {
        const pixPaymentStatus = localStorage.getItem('pixPaymentStatus');
        const pixPaymentConfirmedAt = localStorage.getItem('pixPaymentConfirmedAt');
        const upsellPixJaGerado = localStorage.getItem('upsellPixJaGerado');
        
        console.log('Status pagamento anterior:', pixPaymentStatus);
        console.log('Pagamento confirmado em:', pixPaymentConfirmedAt);
        console.log('Upsell PIX já gerado:', upsellPixJaGerado);
        
        // RIGOROSO: Só mostra upsell se:
        // 1. Status é PAID
        // 2. Tem timestamp de confirmação
        // 3. PIX do upsell ainda não foi gerado
        if (pixPaymentStatus === 'PAID' && pixPaymentConfirmedAt && !upsellPixJaGerado) {
            console.log('✅ Auto-gerando PIX do upsell...');
            
            // Marca como gerado para não gerar novamente
            localStorage.setItem('upsellPixJaGerado', 'true');
            
            // Esconde o PIX anterior
            const pixContainer = document.getElementById('pix-container');
            if (pixContainer) {
                pixContainer.style.display = 'none';
            }
            
            // Chama a função de gerar PIX
            if (typeof gerarPixUpsellTaxaObrigatoria === 'function') {
                gerarPixUpsellTaxaObrigatoria();
            } else {
                console.error('Função gerarPixUpsellTaxaObrigatoria não encontrada');
            }
        } else {
            console.log('❌ Não atende aos critérios para mostrar upsell');
            console.log('Critério 1 (PAID):', pixPaymentStatus === 'PAID');
            console.log('Critério 2 (timestamp):', !!pixPaymentConfirmedAt);
            console.log('Critério 3 (não gerado):', !upsellPixJaGerado);
        }
    }, 2000);
});
