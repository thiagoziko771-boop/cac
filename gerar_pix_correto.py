#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para gerar PIX na AvenPayments - Conforme Documentacao Oficial
Produto: Loja 05
Valor: R$ 48,70
"""

import requests
import json
from datetime import datetime
import random
import string

# Configuracoes conforme documentacao AvenPayments
API_URL = "https://api.avenpayments.com/v1/payment"
API_KEY = "2zxA50CzfpTMZgKCwuotYv681fsfo4bcrXrdttHxdD4"

# Gera referencia unica
def gerar_ref():
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    random_str = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
    return f"loja05_{timestamp}_{random_str}"

# Payload conforme documentacao
payload = {
    "amount": 4920,  # R$ 49,20 em centavos
    "currency": "BRL",
    "method": "PIX",
    "description": "Loja 05",
    "externalRef": gerar_ref(),
    "notificationUrl": "https://portal-registro-cac.org/webhook/payment",
    "payer": {
        "name": "Teste Loja 05",
        "taxId": "12345678909",
        "email": "teste@loja05.com.br",
        "phone": "11987654321"
    },
    "items": [
        {
            "quantity": 1,
            "name": "Loja 05",
            "price": 4920,
            "type": "DIGITAL"
        }
    ]
}

# Headers conforme documentacao (Bearer Token)
headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

print("=" * 80)
print("GERANDO PIX NA AVENPAYMENTS")
print("=" * 80)
print(f"\nURL: {API_URL}")
print(f"Chave API (primeiros 20 caracteres): {API_KEY[:20]}...")
print(f"\nPayload que sera enviado:")
print(json.dumps(payload, indent=2, ensure_ascii=False))

print(f"\nHeaders:")
print(f"  Authorization: Bearer {API_KEY[:20]}...")
print(f"  Content-Type: application/json")

print(f"\n" + "=" * 80)
print("Enviando requisicao...")
print("=" * 80)

try:
    response = requests.post(
        API_URL,
        json=payload,
        headers=headers,
        timeout=30
    )
    
    print(f"\nStatus HTTP: {response.status_code}")
    print(f"Headers da resposta: {dict(response.headers)}")
    
    if response.text:
        print(f"\nCorpo da resposta:")
        try:
            result = response.json()
            print(json.dumps(result, indent=2, ensure_ascii=False))
            
            if response.status_code in [200, 201]:
                print("\n" + "=" * 80)
                print("SUCESSO! PIX GERADO NA AVENPAYMENTS!")
                print("=" * 80)
                
                if "data" in result:
                    data = result["data"]
                    print(f"\nID do Pagamento: {data.get('id', 'N/A')}")
                    print(f"Status: {data.get('status', 'N/A')}")
                    print(f"Valor: R$ {data.get('amount', 4870) / 100:.2f}")
                    print(f"Descricao: {data.get('description', 'N/A')}")
                    print(f"Referencia Externa: {data.get('externalRef', 'N/A')}")
                    
                    if "copypaste" in data:
                        print(f"\nCodigo PIX (Copia e Cola):")
                        print(data["copypaste"])
                    elif "pix" in data and "brcode" in data["pix"]:
                        print(f"\nCodigo PIX (Copia e Cola):")
                        print(data["pix"]["brcode"])
        except json.JSONDecodeError:
            print(f"Resposta (texto): {response.text[:500]}")
    
except requests.exceptions.Timeout:
    print("ERRO: Timeout - A requisicao demorou demais")
except requests.exceptions.ConnectionError:
    print("ERRO: Conexao recusada")
except requests.exceptions.RequestException as e:
    print(f"ERRO na requisicao: {e}")
except Exception as e:
    print(f"ERRO inesperado: {e}")

print("\n" + "=" * 80)
