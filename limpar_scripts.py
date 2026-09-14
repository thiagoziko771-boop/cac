import re
import os

def limpar_html(arquivo):
    """Remove todos os scripts de tracking e analytics do arquivo HTML"""
    
    with open(arquivo, 'r', encoding='utf-8') as f:
        conteudo = f.read()
    
    # Backup do conteúdo original
    conteudo_original = conteudo
    
    # 1. Remover script do Clarity (Microsoft)
    conteudo = re.sub(
        r'<script[^>]*>.*?clarity.*?</script>',
        '',
        conteudo,
        flags=re.DOTALL | re.IGNORECASE
    )
    
    # 2. Remover scripts do Kwai Analytics
    conteudo = re.sub(
        r'<script[^>]*>.*?kwaiq.*?</script>',
        '',
        conteudo,
        flags=re.DOTALL | re.IGNORECASE
    )
    
    # 3. Remover Utmify pixel
    conteudo = re.sub(
        r'<script[^>]*>.*?window\.pixelId.*?</script>',
        '',
        conteudo,
        flags=re.DOTALL
    )
    
    # 4. Remover Utmify UTM script
    conteudo = re.sub(
        r'<script[^>]*src="https://cdn\.utmify\.com\.br/scripts/utms/latest\.js"[^>]*>.*?</script>',
        '',
        conteudo,
        flags=re.DOTALL
    )
    
    # 5. Remover Fox Script UTM
    conteudo = re.sub(
        r'<!-- start vega utm script -->.*?<!-- end vega utm script -->',
        '',
        conteudo,
        flags=re.DOTALL
    )
    
    # 6. Remover Fox Script Cart
    conteudo = re.sub(
        r'<!-- start vega cart script -->.*?<!-- end vega cart script -->',
        '',
        conteudo,
        flags=re.DOTALL
    )
    
    # 7. Remover Shopify Web Pixels Manager
    conteudo = re.sub(
        r'<script id="web-pixels-manager-setup">.*?</script>',
        '',
        conteudo,
        flags=re.DOTALL
    )
    
    # 8. Remover Boomerang (Shopify performance)
    conteudo = re.sub(
        r'<script class="boomerang">.*?</script>',
        '',
        conteudo,
        flags=re.DOTALL
    )
    
    # 9. Remover link preload do Boomerang
    conteudo = re.sub(
        r'<link[^>]*boomerang[^>]*>',
        '',
        conteudo,
        flags=re.IGNORECASE
    )
    
    # 10. Remover Shopify perf kit
    conteudo = re.sub(
        r'<script[^>]*shopify-perf-kit[^>]*></script>',
        '',
        conteudo,
        flags=re.IGNORECASE
    )
    
    # 11. Remover trekkie scripts
    conteudo = re.sub(
        r'<script[^>]*trekkie\.storefront[^>]*></script>',
        '',
        conteudo,
        flags=re.IGNORECASE
    )
    
    # 12. Remover async dos scripts trekkie inline
    conteudo = re.sub(
        r'<script[^>]*async=""[^>]*src="js/trekkie\.storefront[^"]*"[^>]*></script>',
        '',
        conteudo,
        flags=re.IGNORECASE
    )
    
    # 13. Remover scripts do Shopify de forma geral
    conteudo = re.sub(
        r'<script[^>]*>.*?Shopify.*?</script>',
        '',
        conteudo,
        flags=re.DOTALL
    )
    
    # 14. Limpar múltiplas linhas vazias
    conteudo = re.sub(r'\n\s*\n\s*\n', '\n\n', conteudo)
    
    # Salvar apenas se houve mudanças
    if conteudo != conteudo_original:
        with open(arquivo, 'w', encoding='utf-8') as f:
            f.write(conteudo)
        print(f"✅ Limpo: {arquivo}")
        return True
    else:
        print(f"⚪ Sem mudanças: {arquivo}")
        return False

# Lista de arquivos HTML para limpar
arquivos_html = [
    'index.html',
    'endereco etapa 2/index.html',
    'quiz etapa 3/index.html',
    'psicotecnico etapa 4/index.html',
    'aprovado etapa 5/index.html'
]

print("🧹 Iniciando limpeza dos scripts de tracking...\n")

total_limpos = 0
for arquivo in arquivos_html:
    caminho_completo = os.path.join(r'c:\Users\chz\Desktop\registro etapa 1', arquivo)
    if os.path.exists(caminho_completo):
        if limpar_html(caminho_completo):
            total_limpos += 1
    else:
        print(f"❌ Arquivo não encontrado: {caminho_completo}")

print(f"\n🎉 Limpeza concluída! {total_limpos} arquivo(s) foram limpos.")
