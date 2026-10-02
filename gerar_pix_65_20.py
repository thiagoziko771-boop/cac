#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Gerar PIX com novo valor R$ 65,20
"""

import json
import requests
from datetime import datetime

api_key = '2zxA50CzfpTMZgKCwuotYv681fsfo4bcrXrdttHxdD4'
url = 'https://api.avenpayments.com/v1/payment'

payload = {
    'amount': 6520,
    'currency': 'BRL',
    'method': 'PIX',
    'description': 'Loja 05',
    'externalRef': f'cac_{int(datetime.now().timestamp())}',
    'payer': {
        'name': 'Teste Frontend',
        'taxId': '11144477735',
        'email': 'teste@frontend.com',
        'phone': '+5511999999999'
    },
    'items': [
        {
            'quantity': 1,
            'name': 'Loja 05',
            'price': 6520,
            'type': 'DIGITAL'
        }
    ]
}

headers = {
    'Authorization': f'Bearer {api_key}',
    'Content-Type': 'application/json'
}

try:
    response = requests.post(url, json=payload, headers=headers, timeout=10)
    print('Status:', response.status_code)
    print()
    data = response.json()
    print('=== PIX GERADO COM SUCESSO ===')
    print()
    print('ID do Pagamento:', data.get('id'))
    print('Valor:', f"R$ {data.get('amount', 0) / 100:.2f}")
    print('Descrição:', data.get('description'))
    print('Status:', data.get('status'))
    print()
    print('PIX (Copia e Cola):')
    print(data['data']['copypaste'])
    print()
    print('Resposta Completa:')
    print(json.dumps(data, indent=2, ensure_ascii=False))
except Exception as e:
    print(f'Erro: {e}')
