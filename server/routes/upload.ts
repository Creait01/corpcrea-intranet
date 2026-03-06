import { Router } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { prisma } from '../prisma.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Multer — store in memory for direct Cloudinary stream upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB max (videos)
});

// Helper: configure Cloudinary from DB settings at request time
async function configureCloudinary(): Promise<{ configured: boolean; cloudName: string }> {
  const keys = ['cloudinary_cloud_name', 'cloudinary_api_key', 'cloudinary_api_secret'];
  const settings = await prisma.setting.findMany({ where: { key: { in: keys } } });
  const map: Record<string, string> = {};
  settings.forEach((s: { key: string; value: string }) => (map[s.key] = s.value));

  const cloudName = map['cloudinary_cloud_name'] || '';
  const apiKey = map['cloudinary_api_key'] || '';
  const apiSecret = map['cloudinary_api_secret'] || '';

  if (!cloudName || !apiKey || !apiSecret) {
    return { configured: false, cloudName: '' };
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  return { configured: true, cloudName };
}

// GET /api/upload/cloudinary-config  — public (needed by frontend widget without auth)
router.get('/cloudinary-config', async (_req, res) => {
  try {
    const keys = ['cloudinary_cloud_name', 'cloudinary_upload_preset'];
    const settings = await prisma.setting.findMany({ where: { key: { in: keys } } });
    const map: Record<string, string> = {};
    settings.forEach((s: { key: string; value: string }) => (map[s.key] = s.value));

    const cloudName = map['cloudinary_cloud_name'] || '';
    const uploadPreset = map['cloudinary_upload_preset'] || '';

    if (!cloudName) {
      res.json({ configured: false, cloudName: '', uploadPreset: '' });
      return;
    }

    res.json({ configured: true, cloudName, uploadPreset });
  } catch (err) {
    console.error('Cloudinary config error:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// POST /api/upload  — signed upload via backend
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No se proporcionó archivo' });
      return;
    }

    const { configured } = await configureCloudinary();
    if (!configured) {
      res.status(400).json({ error: 'Cloudinary no está configurado. Ve a Configuración para ingresar los datos de tu cuenta.' });
      return;
    }

    // Determine resource_type from mimetype
    let resourceType: 'image' | 'video' | 'raw' = 'raw';
    if (req.file.mimetype.startsWith('image/')) resourceType = 'image';
    else if (req.file.mimetype.startsWith('video/')) resourceType = 'video';

    // Get folder from query or default
    const folder = (req.query.folder as string) || 'corpocrea';

    // Upload buffer to Cloudinary
    const result = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: resourceType,
          // For documents, keep original filename
          public_id: resourceType === 'raw' ? req.file!.originalname.replace(/\.[^/.]+$/, '') : undefined,
          use_filename: true,
          unique_filename: true,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file!.buffer);
    });

    res.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      resourceType: result.resource_type,
      format: result.format,
      bytes: result.bytes,
      width: result.width || null,
      height: result.height || null,
      originalFilename: req.file.originalname,
    });
  } catch (err: any) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message || 'Error al subir archivo' });
  }
});

// POST /api/upload/multiple  — upload multiple files
router.post('/multiple', upload.array('files', 10), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      res.status(400).json({ error: 'No se proporcionaron archivos' });
      return;
    }

    const { configured } = await configureCloudinary();
    if (!configured) {
      res.status(400).json({ error: 'Cloudinary no está configurado.' });
      return;
    }

    const folder = (req.query.folder as string) || 'corpocrea';

    const results = await Promise.all(
      files.map((file) => {
        let resourceType: 'image' | 'video' | 'raw' = 'raw';
        if (file.mimetype.startsWith('image/')) resourceType = 'image';
        else if (file.mimetype.startsWith('video/')) resourceType = 'video';

        return new Promise<any>((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder, resource_type: resourceType, use_filename: true, unique_filename: true },
            (error, result) => {
              if (error) reject(error);
              else resolve({
                url: result!.secure_url,
                publicId: result!.public_id,
                resourceType: result!.resource_type,
                format: result!.format,
                bytes: result!.bytes,
                originalFilename: file.originalname,
              });
            }
          );
          stream.end(file.buffer);
        });
      })
    );

    res.json({ success: true, files: results });
  } catch (err: any) {
    console.error('Multi-upload error:', err);
    res.status(500).json({ error: err.message || 'Error al subir archivos' });
  }
});

// DELETE /api/upload/:publicId  — remove from Cloudinary
router.delete('/:publicId', async (req, res) => {
  try {
    const { configured } = await configureCloudinary();
    if (!configured) {
      res.status(400).json({ error: 'Cloudinary no está configurado.' });
      return;
    }

    const publicId = String(req.params.publicId);
    const resourceType = (req.query.type as string) || 'image';

    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType as any });
    res.json({ success: true });
  } catch (err: any) {
    console.error('Delete error:', err);
    res.status(500).json({ error: err.message || 'Error al eliminar archivo' });
  }
});

// POST /api/upload/test  — test Cloudinary connection
router.post('/test', async (_req, res) => {
  try {
    const { configured, cloudName } = await configureCloudinary();
    if (!configured) {
      res.json({ success: false, error: 'Credenciales no configuradas' });
      return;
    }

    // Ping Cloudinary by fetching account usage
    const result = await cloudinary.api.ping();
    res.json({ success: true, cloudName, status: result.status });
  } catch (err: any) {
    console.error('Cloudinary test error:', err);
    res.json({ success: false, error: err.message || 'No se pudo conectar' });
  }
});

export default router;
