#!/usr/bin/env python3
"""
Testar geração de PIX de R$ 81,20 na gateway AvenPayments
Com dados válidos e formatação correta
"""

import requests
import json
from datetime import datetime
import random
import string

# Gera ID único
def gerar_id():
    return 'test_' + ''.join(random.choices(string.ascii_lowercase + string.digits, k=10))

# Payload EXATAMENTE como deve ser enviado
payload = {
    "amount": 8120,  # R$ 81,20 em centavos
    "currency": "BRL",
    "method": "PIX",
    "description": "Serviço de Tratamento Sigiloso",
    "externalRef": f"upsell_{datetime.now().timestamp()}_{gerar_id()}",
    "notificationUrl": "https://cac-brasil-cac.vercel.app/webhook/payment",
    "ip": "0.0.0.0",
    "payer": {
        "name": "Teste Cliente",
        "taxId": "12345678900",  # EXATAMENTE 11 dígitos
        "email": "teste@email.com",
        "phone": "+5511999999999"  # Com +55
    },
    "items": [
        {
            "quantity": 1,
            "name": "Serviço de Tratamento Sigiloso",
            "price": 8120,
            "type": "SERVICE"
        }
    ],
    "delivery": {
        "fee": 0,
        "address": {
            "country": "BR",
            "state": "SP",  # 2 caracteres
            "city": "São Paulo",
            "district": "Centro",
            "street": "Avenida Paulista",
            "number": "1000",
            "complement": "",
            "zipCode": "01310100"  # EXATAMENTE 8 dígitos
        }
    },
    "metadata": {
        "provider": "registro-cac",
        "orderId": f"upsell_{datetime.now().timestamp()}_{gerar_id()}",
        "tipo": "taxa_obrigatoria_frete_sigilo",
        "dataRegistro": datetime.now().isoformat()
    }
}

print("=" * 80)
print("TESTANDO GERAÇÃO DE PIX R$ 81,20 - UPSELL")
print("=" * 80)
print("\nPayload a enviar:")
print(json.dumps(payload, indent=2, ensure_ascii=False))

print("\n" + "=" * 80)
print("Validações:")
print("=" * 80)

validacoes = {
    "Amount = 8120": payload["amount"] == 8120,
    "Currency = BRL": payload["currency"] == "BRL",
    "Method = PIX": payload["method"] == "PIX",
    "CPF tem 11 dígitos": len(payload["payer"]["taxId"]) == 11,
    "CEP tem 8 dígitos": len(payload["delivery"]["address"]["zipCode"]) == 8,
    "State tem 2 caracteres": len(payload["delivery"]["address"]["state"]) == 2,
    "Country = BR": payload["delivery"]["address"]["country"] == "BR",
    "Email contém @": "@" in payload["payer"]["email"],
    "Telefone com +55": payload["payer"]["phone"].startswith("+55"),
    "Type = SERVICE": payload["items"][0]["type"] == "SERVICE",
    "Quantity = 1": payload["items"][0]["quantity"] == 1,
    "Fee = 0": payload["delivery"]["fee"] == 0,
}

todas_validas = True
for descricao, resultado in validacoes.items():
    status = "✓" if resultado else "✗"
    print(f"{status} {descricao}")
    if not resultado:
        todas_validas = False

print("\n" + "=" * 80)
print("Enviando para API...")
print("=" * 80)

headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer 2zxA50CzfpTMZgKCwuotYv681fsfo4bcrXrdttHxdD4'
}

try:
    response = requests.post(
        'https://api.avenpayments.com/v1/payment',
        json=payload,
        headers=headers,
        timeout=15
    )
    
    print(f"\n✓ Requisição enviada")
    print(f"Status HTTP: {response.status_code}")
    
    response_data = response.text
    print(f"\nResponse:\n{response_data}")
    
    if response.status_code in [200, 201]:
        try:
            data = response.json()
            print(f"\n" + "=" * 80)
            print("✅ SUCESSO!")
            print("=" * 80)
            print(f"Payment ID: {data.get('id')}")
            
            if 'data' in data:
                print(f"PIX Copypaste: {data['data'].get('copypaste', 'N/A')}")
                print(f"PIX QRCode: {data['data'].get('qrCode', 'N/A')}")
            elif 'copypaste' in data:
                print(f"PIX Copypaste: {data.get('copypaste')}")
            
            print(f"\nResponse completo:")
            print(json.dumps(data, indent=2, ensure_ascii=False))
            
        except json.JSONDecodeError:
            print("Erro ao parsear JSON da resposta")
    else:
        print(f"\n" + "=" * 80)
        print(f"❌ ERRO HTTP {response.status_code}")
        print("=" * 80)
        try:
            error_data = response.json()
            print(f"Erro da API:")
            print(json.dumps(error_data, indent=2, ensure_ascii=False))
        except:
            print(f"Response raw: {response_data}")

except requests.exceptions.Timeout:
    print("\n❌ Timeout na requisição")
except requests.exceptions.ConnectionError:
    print("\n❌ Erro de conexão")
except Exception as error:
    print(f"\n❌ Erro: {error}")

print("\n" + "=" * 80)
