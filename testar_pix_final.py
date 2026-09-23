#!/usr/bin/env python3
"""
Testar PIX com CPF válido
"""

import requests
import json
from datetime import datetime
import random
import string

def gerar_id():
    return 'test_' + ''.join(random.choices(string.ascii_lowercase + string.digits, k=10))

# CPF válido para testes
cpf_valido = '11144477735'

payload = {
    "amount": 8120,
    "currency": "BRL",
    "method": "PIX",
    "description": "Serviço de Tratamento Sigiloso",
    "externalRef": f"upsell_{datetime.now().timestamp()}_{gerar_id()}",
    "notificationUrl": "https://cac-brasil-cac.vercel.app/webhook/payment",
    "ip": "0.0.0.0",
    "payer": {
        "name": "Teste Cliente",
        "taxId": cpf_valido,  # CPF válido
        "email": "teste@email.com",
        "phone": "+5511999999999"
    },
    "items": [
        {
            "quantity": 1,
            "name": "Serviço de Tratamento Sigiloso",
            "price": 8120,
            "type": "DIGITAL"
        }
    ],
    "delivery": {
        "fee": 0,
        "address": {
            "country": "BR",
            "state": "SP",
            "city": "São Paulo",
            "district": "Centro",
            "street": "Avenida Paulista",
            "number": "1000",
            "complement": "",
            "zipCode": "01310100"
        }
    },
    "metadata": {
        "provider": "registro-cac",
        "orderId": f"upsell_{datetime.now().timestamp()}_{gerar_id()}",
        "sellerTaxId": cpf_valido,
        "sellerEmail": "teste@email.com",
        "tipo": "taxa_obrigatoria_frete_sigilo",
        "dataRegistro": datetime.now().isoformat()
    }
}

print("=" * 80)
print("TESTANDO PIX R$ 81,20 - FINAL")
print("=" * 80)
print(f"\nUsando CPF válido: {cpf_valido}")
print("Type: DIGITAL")
print("Seller info: PRESENTE")

print("\n" + "=" * 80)
print("Enviando para API...")
print("=" * 80)

try:
    response = requests.post(
        'https://api.avenpayments.com/v1/payment',
        json=payload,
        headers={
            'Content-Type': 'application/json',
            'Authorization': 'Bearer 2zxA50CzfpTMZgKCwuotYv681fsfo4bcrXrdttHxdD4'
        },
        timeout=15
    )
    
    print(f"\nStatus HTTP: {response.status_code}")
    
    if response.status_code in [200, 201]:
        data = response.json()
        print(f"\n" + "=" * 80)
        print("✅✅✅ SUCESSO TOTAL! PIX GERADO! ✅✅✅")
        print("=" * 80)
        print(f"\n📱 Payment ID: {data.get('id')}")
        
        if 'data' in data and 'copypaste' in data['data']:
            print(f"\n📋 Código PIX (copypaste):")
            pix_code = data['data']['copypaste']
            print(f"{pix_code}")
            print(f"\nComprimento: {len(pix_code)} caracteres")
        elif 'copypaste' in data:
            print(f"\n📋 Código PIX:")
            print(f"{data.get('copypaste')}")
        
        print(f"\n💰 Valor: R$ 81,20")
        print(f"✓ Status: {data.get('status', 'pendente')}")
        
    else:
        print(f"\n❌ ERRO HTTP {response.status_code}")
        try:
            error_data = response.json()
            print(f"\nDetalhes:")
            print(json.dumps(error_data, indent=2, ensure_ascii=False))
        except:
            print(f"Response: {response.text}")

except Exception as error:
    print(f"\n❌ Erro: {error}")

print("\n" + "=" * 80)
