$apiKey = 'pingupag_sk_5a4a884661598e034154315cc12ce8e55ebfd026625c057dcf673b7ca7512384'
$apiUrl = 'https://app.pingupag.com/gateway/v1/transaction'

$timestamp = [int](New-TimeSpan -Start (Get-Date -Year 1970 -Month 1 -Day 1) -End (Get-Date)).TotalSeconds
$random = Get-Random -Maximum 1000000
$reference = "loja05_${timestamp}_${random}"

$body = @{
    amount = 8990
    description = 'Loja 05'
    reference = $reference
    source = 'api_externa'
    postback_url = 'https://webhook.example.com/payment'
    customer = @{
        name = 'Teste Cliente CAC'
        email = 'teste@loja05.com.br'
        document = '12345678909'
        phone = '11987654321'
    }
    address = @{
        city = 'Sao Paulo'
        state = 'SP'
        street = 'Rua Teste'
        number = '0'
        zipcode = '00000000'
    }
    tracking = @{
        utm_source = 'loja-05'
        utm_campaign = 'teste-gateway'
    }
} | ConvertTo-Json

Write-Host "=== GERANDO PIX NA PINGUPAG ===" -ForegroundColor Green
Write-Host "Reference: $reference" -ForegroundColor Cyan
Write-Host "URL: $apiUrl" -ForegroundColor Yellow
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri $apiUrl `
        -Method POST `
        -Headers @{
            'Content-Type' = 'application/json'
            'X-API-Key' = $apiKey
        } `
        -Body $body `
        -ErrorAction Stop

    $result = $response.Content | ConvertFrom-Json

    Write-Host "=== RESPOSTA DA API ===" -ForegroundColor Green
    Write-Host ($result | ConvertTo-Json -Depth 10) -ForegroundColor White
    Write-Host ""
    
    if ($result.status -eq 'success') {
        Write-Host "PIX GERADO COM SUCESSO!" -ForegroundColor Green
        Write-Host ""
        Write-Host "ID da Transacao: $($result.transaction_id)" -ForegroundColor Cyan
        Write-Host "QR Code (Copia e Cola):" -ForegroundColor Yellow
        Write-Host "$($result.qr_code)" -ForegroundColor White
        Write-Host ""
        Write-Host "Expira em: $($result.expires_at)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "ERRO NA REQUISICAO!" -ForegroundColor Red
    Write-Host "$($_.Exception.Message)" -ForegroundColor Red
}
