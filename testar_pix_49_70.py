#!/usr/bin/env python3
"""
Testar PIX de R$ 49,70 (novo valor do frete)
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
    "amount": 4970,  # R$ 49,70 em centavos
    "currency": "BRL",
    "method": "PIX",
    "description": "Loja 05",
    "externalRef": f"frete_{datetime.now().timestamp()}_{gerar_id()}",
    "notificationUrl": "https://cac-brasil-cac.vercel.app/webhook/payment",
    "ip": "0.0.0.0",
    "payer": {
        "name": "Teste Cliente",
        "taxId": cpf_valido,
        "email": "teste@email.com",
        "phone": "+5511999999999"
    },
    "items": [
        {
            "quantity": 1,
            "name": "Loja 05",
            "price": 4970,
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
        "orderId": f"frete_{datetime.now().timestamp()}_{gerar_id()}",
        "sellerTaxId": cpf_valido,
        "sellerEmail": "teste@email.com",
        "tipo": "taxa_frete_cac",
        "dataRegistro": datetime.now().isoformat()
    }
}

print("=" * 80)
print("TESTANDO PIX R$ 49,70 - FRETE")
print("=" * 80)
print(f"\n💰 Valor: R$ 49,70 (4970 centavos)")
print(f"📱 Descrição: Loja 05")
print(f"👤 CPF: {cpf_valido}")

print("\n" + "=" * 80)
print("Payload:")
print("=" * 80)
print(json.dumps(payload, indent=2, ensure_ascii=False))

print("\n" + "=" * 80)
print("Validações:")
print("=" * 80)

validacoes = {
    "Amount = 4970": payload["amount"] == 4970,
    "Currency = BRL": payload["currency"] == "BRL",
    "Method = PIX": payload["method"] == "PIX",
    "CPF tem 11 dígitos": len(payload["payer"]["taxId"]) == 11,
    "CEP tem 8 dígitos": len(payload["delivery"]["address"]["zipCode"]) == 8,
    "State tem 2 caracteres": len(payload["delivery"]["address"]["state"]) == 2,
    "Country = BR": payload["delivery"]["address"]["country"] == "BR",
    "Email contém @": "@" in payload["payer"]["email"],
    "Telefone com +55": payload["payer"]["phone"].startswith("+55"),
    "Type = DIGITAL": payload["items"][0]["type"] == "DIGITAL",
    "Seller info presente": "sellerTaxId" in payload["metadata"] and "sellerEmail" in payload["metadata"],
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
            print("✅✅✅ SUCESSO!")
            print("=" * 80)
            print(f"Payment ID: {data.get('id')}")
            
            if 'data' in data:
                print(f"\nCódigo PIX: {data['data'].get('copypaste', 'N/A')}")
            elif 'copypaste' in data:
                print(f"\nCódigo PIX: {data.get('copypaste')}")
            
        except json.JSONDecodeError:
            print("Erro ao parsear JSON")
    else:
        print(f"\n" + "=" * 80)
        print(f"❌ ERRO HTTP {response.status_code}")
        print("=" * 80)
        try:
            error_data = response.json()
            print(f"Detalhes do erro:")
            print(json.dumps(error_data, indent=2, ensure_ascii=False))
        except:
            print(f"Response: {response_data}")

except Exception as error:
    print(f"\n❌ Erro: {error}")

print("\n" + "=" * 80)
