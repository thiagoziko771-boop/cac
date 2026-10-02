#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para gerar PIX na Pingupag - Conforme Documentacao Oficial
Produto: Registro CAC
Valor: R$ 89,90
"""

import requests
import json
from datetime import datetime
import random
import string
import time

# Configuracoes conforme documentacao Pingupag
API_URL = "https://app.pingupag.com/gateway/v1/transaction"
API_KEY = "pingupag_sk_5a4a884661598e034154315cc12ce8e55ebfd026625c057dcf673b7ca7512384"

# Gera referencia unica
def gerar_ref():
    timestamp = int(time.time())
    random_num = random.randint(100000, 999999)
    return f"cac_{timestamp}_{random_num}"

# Payload conforme documentacao Pingupag
payload = {
    "amount": 8990,  # R$ 89,90 em centavos
    "description": "Registro CAC",
    "reference": gerar_ref(),
    "source": "api_externa",
    "customer": {
        "name": "Cliente Teste",
        "email": "teste@registrocac.com.br",
        "document": "12345678909",
        "phone": "11999998888"
    },
    "address": {
        "street": "Avenida Paulista",
        "number": "1000",
        "neighborhood": "Bela Vista",
        "city": "São Paulo",
        "state": "SP",
        "zipcode": "01310-100"
    }
}

# Headers conforme documentacao Pingupag (X-API-Key)
headers = {
    "X-API-Key": API_KEY,
    "Content-Type": "application/json"
}

print("=" * 80)
print("GERANDO PIX NA PINGUPAG")
print("=" * 80)
print(f"\nURL: {API_URL}")
print(f"Chave API (primeiros 20 caracteres): {API_KEY[:20]}...")
print(f"\nPayload que sera enviado:")
print(json.dumps(payload, indent=2, ensure_ascii=False))

print(f"\nHeaders:")
print(f"  X-API-Key: {API_KEY[:20]}...")
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
                print("SUCESSO! PIX GERADO NA PINGUPAG!")
                print("=" * 80)
                
                if result.get("status") == "success":
                    print(f"\nTransaction ID: {result.get('transaction_id', 'N/A')}")
                    print(f"Status: {result.get('status', 'N/A')}")
                    print(f"Valor: R$ {result.get('amount', 8990) / 100:.2f}")
                    print(f"Descricao: {result.get('description', 'N/A')}")
                    print(f"Referencia: {result.get('reference', 'N/A')}")
                    
                    if result.get("qr_code"):
                        print(f"\nCodigo PIX (Copia e Cola):")
                        print(result["qr_code"])
                    
                    if result.get("expires_at"):
                        print(f"\nExpira em: {result.get('expires_at')}")
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
