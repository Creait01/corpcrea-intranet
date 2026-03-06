/**
 * Cloudinary Upload Service
 * Handles file uploads via the backend API (signed) or direct Cloudinary widget (unsigned).
 */

export interface UploadResult {
  url: string;
  publicId: string;
  resourceType: 'image' | 'video' | 'raw';
  format: string;
  bytes: number;
  width?: number;
  height?: number;
  originalFilename: string;
}

export interface CloudinaryConfig {
  configured: boolean;
  cloudName: string;
  uploadPreset: string;
}

class CloudinaryUploadService {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  /**
   * Get public Cloudinary config (cloud_name + upload_preset) for widget
   */
  async getConfig(): Promise<CloudinaryConfig> {
    try {
      const res = await fetch('/api/upload/cloudinary-config', {
        headers: this.getHeaders(),
      });
      if (!res.ok) return { configured: false, cloudName: '', uploadPreset: '' };
      return await res.json();
    } catch {
      return { configured: false, cloudName: '', uploadPreset: '' };
    }
  }

  /**
   * Upload a single file via backend (signed upload — most secure)
   */
  async uploadFile(
    file: File,
    folder: string = 'corpocrea',
    onProgress?: (percent: number) => void
  ): Promise<UploadResult> {
    const formData = new FormData();
    formData.append('file', file);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `/api/upload?folder=${encodeURIComponent(folder)}`);

      if (this.token) {
        xhr.setRequestHeader('Authorization', `Bearer ${this.token}`);
      }

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const data = JSON.parse(xhr.responseText);
          if (data.success) {
            resolve(data as UploadResult);
          } else {
            reject(new Error(data.error || 'Upload failed'));
          }
        } else {
          try {
            const err = JSON.parse(xhr.responseText);
            reject(new Error(err.error || `HTTP ${xhr.status}`));
          } catch {
            reject(new Error(`HTTP ${xhr.status}`));
          }
        }
      };

      xhr.onerror = () => reject(new Error('Error de red al subir archivo'));
      xhr.send(formData);
    });
  }

  /**
   * Upload directly to Cloudinary (unsigned — requires upload preset)
   * Used for the frontend widget approach without going through backend
   */
  async uploadDirect(
    file: File,
    cloudName: string,
    uploadPreset: string,
    folder: string = 'corpocrea',
    onProgress?: (percent: number) => void
  ): Promise<UploadResult> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', folder);

    let resourceType = 'auto';
    if (file.type.startsWith('image/')) resourceType = 'image';
    else if (file.type.startsWith('video/')) resourceType = 'video';
    else resourceType = 'raw';

    const url = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', url);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const data = JSON.parse(xhr.responseText);
          resolve({
            url: data.secure_url,
            publicId: data.public_id,
            resourceType: data.resource_type,
            format: data.format,
            bytes: data.bytes,
            width: data.width,
            height: data.height,
            originalFilename: data.original_filename,
          });
        } else {
          reject(new Error(`Error ${xhr.status} al subir a Cloudinary`));
        }
      };

      xhr.onerror = () => reject(new Error('Error de red'));
      xhr.send(formData);
    });
  }

  /**
   * Upload multiple files via backend
   */
  async uploadMultiple(
    files: File[],
    folder: string = 'corpocrea'
  ): Promise<UploadResult[]> {
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));

    const res = await fetch(`/api/upload/multiple?folder=${encodeURIComponent(folder)}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${res.status}`);
    }

    const data = await res.json();
    return data.files;
  }

  /**
   * Delete a file from Cloudinary via backend
   */
  async deleteFile(publicId: string, resourceType: string = 'image'): Promise<void> {
    const res = await fetch(`/api/upload/${encodeURIComponent(publicId)}?type=${resourceType}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Error al eliminar');
    }
  }

  /**
   * Test Cloudinary connection
   */
  async testConnection(): Promise<{ success: boolean; cloudName?: string; error?: string }> {
    try {
      const res = await fetch('/api/upload/test', {
        method: 'POST',
        headers: { ...this.getHeaders(), 'Content-Type': 'application/json' },
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Utility: generate a Cloudinary thumbnail/transform URL
   */
  transform(url: string, options: { width?: number; height?: number; crop?: string; quality?: string }): string {
    if (!url || !url.includes('cloudinary.com')) return url;
    const { width, height, crop = 'fill', quality = 'auto' } = options;
    const parts: string[] = [`q_${quality}`];
    if (width) parts.push(`w_${width}`);
    if (height) parts.push(`h_${height}`);
    if (crop) parts.push(`c_${crop}`);
    // Insert transformation into Cloudinary URL
    return url.replace('/upload/', `/upload/${parts.join(',')}/`);
  }
}

export const cloudinaryService = new CloudinaryUploadService();
