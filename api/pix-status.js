/**
 * Proxy Serverless para API Pingupag - Consulta de Status
 * Contorna CORS chamando a API do lado do servidor
 */

const PINGUPAG_API_KEY = 'pingupag_sk_5a4a884661598e034154315cc12ce8e55ebfd026625c057dcf673b7ca7512384';
const PINGUPAG_BASE_URL = 'https://app.pingupag.com/gateway/v1';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ status: 'error', message: 'Parâmetro id obrigatório' });
    }

    const response = await fetch(
      `${PINGUPAG_BASE_URL}/query?action=get_transaction&id=${encodeURIComponent(id)}`,
      {
        method: 'GET',
        headers: {
          'X-API-Key': PINGUPAG_API_KEY
        }
      }
    );

    const data = await response.json();
    return res.status(response.ok ? 200 : response.status).json(data);

  } catch (error) {
    console.error('[PIX-STATUS] Erro:', error.message);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};