/**
 * Proxy Serverless para API Pingupag - Criação de Transação PIX
 * Contorna CORS chamando a API do lado do servidor
 */

const PINGUPAG_API_KEY = 'pingupag_sk_5a4a884661598e034154315cc12ce8e55ebfd026625c057dcf673b7ca7512384';
const PINGUPAG_BASE_URL = 'https://app.pingupag.com/gateway/v1';

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const payload = req.body;

    // Validação básica
    if (!payload.amount || !payload.customer || !payload.reference) {
      return res.status(400).json({
        status: 'error',
        message: 'Campos obrigatórios: amount, customer, reference'
      });
    }

    console.log('[PIX-PROXY] Criando transação:', payload.reference);

    const response = await fetch(`${PINGUPAG_BASE_URL}/transaction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': PINGUPAG_API_KEY
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    console.log('[PIX-PROXY] Resposta Pingupag:', {
      status: data.status,
      transaction_id: data.transaction_id,
      has_qr_code: !!data.qr_code
    });

    return res.status(response.ok ? 200 : response.status).json(data);

  } catch (error) {
    console.error('[PIX-PROXY] Erro:', error.message);
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};