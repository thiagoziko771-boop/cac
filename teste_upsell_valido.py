#!/usr/bin/env python3
"""
Script para testar a geração de PIX do upsell com dados válidos
Mostra exatamente qual campo está dando erro
"""

import requests
import json
from datetime import datetime

# Dados válidos e formatados
payload = {
    "amount": 8120,
    "currency": "BRL",
    "method": "PIX",
    "description": "Taxa Fixa de Tratamento Sigiloso",
    "externalRef": f"upsell_test_{datetime.now().timestamp()}",
    "notificationUrl": "https://cac-brasil-cac.vercel.app/webhook/payment",
    "ip": "0.0.0.0",
    "payer": {
        "name": "João Silva",
        "taxId": "12345678900",  # 11 dígitos
        "email": "joao@email.com",
        "phone": "+5511999999999"  # com +55
    },
    "items": [
        {
            "quantity": 1,
            "name": "Taxa Fixa de Tratamento Sigiloso",
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
            "zipCode": "01310100"  # 8 dígitos
        }
    },
    "metadata": {
        "provider": "registro-cac",
        "orderId": f"upsell_test_{datetime.now().timestamp()}",
        "tipo": "taxa_obrigatoria_frete_sigilo",
        "dataRegistro": datetime.now().isoformat()
    }
}

print("=" * 60)
print("TESTE DE PAYLOAD UPSELL")
print("=" * 60)
print("\nPayload a ser enviado:")
print(json.dumps(payload, indent=2, ensure_ascii=False))

print("\n" + "=" * 60)
print("Validações:")
print("=" * 60)
print(f"✓ Amount é número: {isinstance(payload['amount'], int)}")
print(f"✓ CPF tem 11 dígitos: {len(payload['payer']['taxId']) == 11}")
print(f"✓ CEP tem 8 dígitos: {len(payload['delivery']['address']['zipCode']) == 8}")
print(f"✓ State tem 2 caracteres: {len(payload['delivery']['address']['state']) == 2}")
print(f"✓ Email contém @: {'@' in payload['payer']['email']}")
print(f"✓ Telefone começa com +55: {payload['payer']['phone'].startswith('+55')}")
print(f"✓ Country é BR: {payload['delivery']['address']['country'] == 'BR'}")

print("\n" + "=" * 60)
print("Enviando para API...")
print("=" * 60)

try:
    response = requests.post(
        'https://api.avenpayments.com/v1/payment',
        json=payload,
        headers={
            'Content-Type': 'application/json',
            'Authorization': 'Bearer 2zxA50CzfpTMZgKCwuotYv681fsfo4bcrXrdttHxdD4'
        },
        timeout=10
    )
    
    print(f"\nStatus HTTP: {response.status_code}")
    print(f"Response:\n{response.text}")
    
    if response.status_code == 200 or response.status_code == 201:
        data = response.json()
        print(f"\n✅ SUCESSO! PIX gerado com ID: {data.get('id')}")
        if 'data' in data:
            print(f"Código PIX: {data['data'].get('copypaste', 'não encontrado')}")
        elif 'copypaste' in data:
            print(f"Código PIX: {data.get('copypaste')}")
    else:
        print(f"\n❌ ERRO na API")
        try:
            error_data = response.json()
            print(f"Detalhes: {json.dumps(error_data, indent=2, ensure_ascii=False)}")
        except:
            print(f"Detalhes: {response.text}")
            
except Exception as error:
    print(f"\n❌ Erro ao fazer requisição: {error}")
