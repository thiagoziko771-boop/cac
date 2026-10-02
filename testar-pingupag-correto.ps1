$apiKey = 'pingupag_sk_5a4a884661598e034154315cc12ce8e55ebfd026625c057dcf673b7ca7512384'
$apiUrl = 'https://app.pingupag.com/gateway/v1/transaction'

# Conforme documentação oficial
$body = @{
    amount = 8990
    description = 'Loja 05'
    reference = "LOJA05-$(Get-Date -UFormat %s)"
    source = 'api_externa'
    customer = @{
        name = 'Cliente Teste'
        email = 'teste@loja05.com.br'
        document = '12345678909'
        phone = '11999998888'
    }
    address = @{
        street = 'Avenida Paulista'
        number = '1000'
        neighborhood = 'Bela Vista'
        city = 'São Paulo'
        state = 'SP'
        zipcode = '01310-100'
    }
} | ConvertTo-Json

Write-Host "=== TESTE PINGUPAG CONFORME DOCUMENTAÇÃO ===" -ForegroundColor Green
Write-Host ""
Write-Host "URL: $apiUrl" -ForegroundColor Cyan
Write-Host "Chave: $($apiKey.Substring(0, 20))..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Payload:" -ForegroundColor Yellow
Write-Host $body
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

    Write-Host "=== RESPOSTA ===" -ForegroundColor Green
    Write-Host ($result | ConvertTo-Json -Depth 10)
    Write-Host ""
    
    if ($result.status -eq 'success') {
        Write-Host "✅ SUCESSO NA PINGUPAG!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Transaction ID: $($result.transaction_id)" -ForegroundColor Cyan
        Write-Host "Valor: R$ $([math]::Round($result.amount / 100, 2))" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "QR Code:" -ForegroundColor Yellow
        Write-Host $result.qr_code
    }
} catch {
    Write-Host "❌ ERRO!" -ForegroundColor Red
    Write-Host "$($_.Exception.Message)" -ForegroundColor Red
}
