#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Gerar PIX com valor de R$ 81,20 - UPSELL Taxa Obrigatória
"""

import json
import requests
from datetime import datetime

api_key = '2zxA50CzfpTMZgKCwuotYv681fsfo4bcrXrdttHxdD4'
url = 'https://api.avenpayments.com/v1/payment'

payload = {
    'amount': 8120,  # R$ 81,20 em centavos
    'currency': 'BRL',
    'method': 'PIX',
    'description': 'Taxa Fixa de Tratamento Sigiloso',
    'externalRef': f'upsell_taxa_{int(datetime.now().timestamp())}',
    'payer': {
        'name': 'Teste Upsell',
        'taxId': '11144477735',
        'email': 'teste@upsell.com',
        'phone': '+5511999999999'
    },
    'items': [
        {
            'quantity': 1,
            'name': 'Taxa Fixa de Tratamento Sigiloso',
            'price': 8120,
            'type': 'DIGITAL'
        }
    ],
    'metadata': {
        'provider': 'registro-cac-upsell',
        'orderId': f'upsell_taxa_{int(datetime.now().timestamp())}',
        'sellerTaxId': '11144477735',
        'sellerEmail': 'teste@upsell.com'
    }
}

headers = {
    'Authorization': f'Bearer {api_key}',
    'Content-Type': 'application/json'
}

try:
    print('=' * 80)
    print('🧪 GERANDO PIX DE UPSELL - R$ 81,20')
    print('=' * 80)
    print()
    
    response = requests.post(url, json=payload, headers=headers, timeout=10)
    
    print('Status HTTP:', response.status_code)
    print()
    
    data = response.json()
    
    if response.status_code != 200:
        print('❌ ERRO!')
        print('Mensagem:', data.get('message'))
        print('Resposta completa:')
        print(json.dumps(data, indent=2, ensure_ascii=False))
    else:
        print('✅ PIX GERADO COM SUCESSO!')
        print()
        print('ID do Pagamento:', data.get('id'))
        print('Valor:', f"R$ {data.get('amount', 0) / 100:.2f}")
        print('Descrição:', data.get('description'))
        print('Status:', data.get('status'))
        print()
        print('=' * 80)
        print('📱 CÓDIGO PIX (COPIA E COLA):')
        print('=' * 80)
        print(data['data']['copypaste'])
        print()
        print('=' * 80)
        print('📋 RESPOSTA COMPLETA:')
        print('=' * 80)
        print(json.dumps(data, indent=2, ensure_ascii=False))
        print()
        print('✅ Teste realizado com sucesso!')
        
except Exception as e:
    print(f'❌ Erro: {e}')
