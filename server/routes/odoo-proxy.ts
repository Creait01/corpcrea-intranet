import { Router } from 'express';

const router = Router();

/**
 * POST /api/odoo/proxy
 * 
 * Proxy genérico para llamadas a Odoo.
 * Recibe { odooUrl, apiKey, endpoint, data } y reenvía server-to-server.
 * Esto evita problemas de CORS ya que la llamada se hace desde el servidor.
 */
router.post('/proxy', async (req, res) => {
  try {
    const { odooUrl, apiKey, endpoint, data } = req.body;

    if (!odooUrl || !endpoint) {
      res.status(400).json({ success: false, error: 'odooUrl y endpoint son requeridos' });
      return;
    }

    const url = `${odooUrl.replace(/\/+$/, '')}${endpoint}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (apiKey) {
      headers['X-API-Key'] = apiKey;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data || {}),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const contentType = response.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      const result = await response.json();
      res.status(response.status).json(result);
    } else {
      const text = await response.text();
      res.status(response.status).json({ 
        success: false, 
        error: `Odoo respondió con ${response.status}: ${text.substring(0, 200)}` 
      });
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      res.status(504).json({ success: false, error: 'Tiempo de espera agotado al conectar con Odoo.' });
      return;
    }
    console.error('Odoo proxy error:', error.message);
    res.status(502).json({ 
      success: false, 
      error: `Error de conexión con Odoo: ${error.message}` 
    });
  }
});

/**
 * POST /api/odoo/test
 * 
 * Prueba la conexión con Odoo (version_info)
 */
router.post('/test', async (req, res) => {
  try {
    const { odooUrl } = req.body;

    if (!odooUrl) {
      res.status(400).json({ success: false, message: 'URL de Odoo no proporcionada' });
      return;
    }

    const url = `${odooUrl.replace(/\/+$/, '')}/web/webclient/version_info`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'call', params: {} }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const version = data?.result?.server_version || 'desconocida';
      res.json({ success: true, message: `Conectado a Odoo v${version}` });
    } else {
      res.json({ success: false, message: `Error HTTP: ${response.status}` });
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      res.json({ success: false, message: 'Tiempo de espera agotado.' });
      return;
    }
    res.json({ success: false, message: `Error: ${error.message}` });
  }
});

export default router;
