#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para gerar PIX na gateway EVEN PAY
Produto: Loja 05
Valor: R$ 48,70
"""

import requests
import json
from datetime import datetime
import random
import string

# Configurações da API EVEN PAY
# Testando endpoints diferentes
endpoints = [
    "https://api.evenpay.com.br/payment",
    "https://api.evenpay.com.br/v1/payment",
    "https://evenpay.com.br/api/v1/payment",
    "https://api.evenpay.com.br/transactions",
]

API_KEY = "2zxA50CzfpTMZgKCwuotYv681fsfo4bcrXrdttHxdD4"

# Gera referência única
def gerar_ref():
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    random_str = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
    return f"loja05_{timestamp}_{random_str}"

# Payload do PIX
payload = {
    "amount": 4870,  # R$ 48,70 em centavos
    "currency": "BRL",
    "method": "PIX",
    "description": "Loja 05",
    "externalRef": gerar_ref(),
    "payer": {
        "name": "Teste Loja 05",
        "taxId": "12345678909",
        "email": "teste@loja05.com.br",
        "phone": "+5511987654321"
    },
    "items": [
        {
            "quantity": 1,
            "name": "Loja 05",
            "price": 4870,
            "type": "DIGITAL"
        }
    ]
}

print("=" * 70)
print("GERANDO PIX NA GATEWAY EVEN PAY")
print("=" * 70)
print(f"\nTestando chave Even Pay: {API_KEY}")
print(f"Payload do PIX:")
print(json.dumps(payload, indent=2, ensure_ascii=False))

for endpoint in endpoints:
    print(f"\n{'=' * 70}")
    print(f"Tentando: {endpoint}")
    print(f"{'=' * 70}")
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}"
    }

    try:
        response = requests.post(endpoint, json=payload, headers=headers, timeout=10)
        
        print(f"Resposta Recebida (Status: {response.status_code})")
        
        if response.text:
            try:
                result = response.json()
                print(json.dumps(result, indent=2, ensure_ascii=False))
                
                if response.status_code in [200, 201]:
                    print("\n" + "=" * 70)
                    print("SUCESSO! PIX GERADO NA EVEN PAY!")
                    print("=" * 70)
                    break
            except:
                print(f"Resposta (texto): {response.text[:200]}")
        
    except requests.exceptions.Timeout:
        print(f"Timeout")
    except requests.exceptions.ConnectionError:
        print(f"Conexao recusada")
    except Exception as e:
        print(f"Erro: {str(e)[:100]}")

print("\n" + "=" * 70)
print("NOTA: Se todos os endpoints falharam, verifique:")
print("  1. A chave Even Pay esta correta?")
print("  2. Ha firewall bloqueando a conexao?")
print("  3. A Even Pay requer autenticacao diferente?")
print("=" * 70)
