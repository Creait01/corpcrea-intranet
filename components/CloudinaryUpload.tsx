import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, CheckCircle, AlertCircle, Loader2, Image as ImageIcon, Film, FileText } from 'lucide-react';
import { cloudinaryService, UploadResult } from '../services/cloudinaryUpload';

interface CloudinaryUploadProps {
  /** Callback when upload completes */
  onUpload: (result: UploadResult) => void;
  /** Optional callback when upload fails */
  onError?: (error: string) => void;
  /** Accepted file types (default: all) */
  accept?: string;
  /** Folder in Cloudinary (default: corpocrea) */
  folder?: string;
  /** Label for the uploader */
  label?: string;
  /** Show preview of current image/video */
  currentUrl?: string;
  /** Max file size in MB (default: 50) */
  maxSizeMB?: number;
  /** UI variant */
  variant?: 'default' | 'compact' | 'avatar';
  /** Disabled state */
  disabled?: boolean;
}

export const CloudinaryUpload: React.FC<CloudinaryUploadProps> = ({
  onUpload,
  onError,
  accept,
  folder = 'corpocrea',
  label = 'Subir archivo',
  currentUrl,
  maxSizeMB = 50,
  variant = 'default',
  disabled = false,
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl || null);
  const [success, setSuccess] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    // Validate size
    if (file.size > maxSizeMB * 1024 * 1024) {
      const msg = `El archivo excede el límite de ${maxSizeMB} MB`;
      setError(msg);
      onError?.(msg);
      return;
    }

    setError(null);
    setSuccess(false);
    setUploading(true);
    setProgress(0);

    // Generate preview for images/videos
    if (file.type.startsWith('image/')) {
      setPreviewUrl(URL.createObjectURL(file));
    } else if (file.type.startsWith('video/')) {
      setPreviewUrl(URL.createObjectURL(file));
    }

    try {
      const result = await cloudinaryService.uploadFile(file, folder, (p) => setProgress(p));
      setPreviewUrl(result.url);
      setSuccess(true);
      onUpload(result);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      const msg = err.message || 'Error al subir archivo';
      setError(msg);
      onError?.(msg);
      setPreviewUrl(currentUrl || null);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, [folder, maxSizeMB, onUpload, onError, currentUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset for same file re-select
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const clearPreview = () => {
    setPreviewUrl(null);
    setError(null);
    setSuccess(false);
  };

  const getFileTypeIcon = () => {
    if (accept?.includes('image')) return <ImageIcon size={variant === 'compact' ? 20 : 32} />;
    if (accept?.includes('video')) return <Film size={variant === 'compact' ? 20 : 32} />;
    return <FileText size={variant === 'compact' ? 20 : 32} />;
  };

  // === AVATAR VARIANT ===
  if (variant === 'avatar') {
    return (
      <div className="relative inline-block">
        <div
          className={`w-24 h-24 rounded-full overflow-hidden border-2 cursor-pointer
            ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-slate-100'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-400'}
            transition-all`}
          onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
          onDrop={!disabled ? handleDrop : undefined}
          onDragOver={!disabled ? handleDragOver : undefined}
          onDragLeave={!disabled ? handleDragLeave : undefined}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept={accept || 'image/*'}
            onChange={handleFileChange}
            disabled={disabled}
          />
          {uploading ? (
            <div className="w-full h-full flex items-center justify-center bg-slate-100">
              <Loader2 size={24} className="animate-spin text-blue-500" />
            </div>
          ) : previewUrl ? (
            <img src={previewUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400">
              <ImageIcon size={24} />
            </div>
          )}
        </div>
        <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-1.5 rounded-full shadow-lg cursor-pointer hover:bg-blue-700 transition-colors"
             onClick={() => !disabled && !uploading && fileInputRef.current?.click()}>
          <Upload size={12} />
        </div>
        {error && <p className="text-xs text-red-500 mt-1 text-center max-w-[120px]">{error}</p>}
      </div>
    );
  }

  // === COMPACT VARIANT ===
  if (variant === 'compact') {
    return (
      <div className="space-y-1">
        <label className="block text-sm font-medium text-slate-700">{label}</label>
        <div
          className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all
            ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:bg-slate-50'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${error ? 'border-red-300 bg-red-50' : ''}
            ${success ? 'border-green-300 bg-green-50' : ''}`}
          onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
          onDrop={!disabled ? handleDrop : undefined}
          onDragOver={!disabled ? handleDragOver : undefined}
          onDragLeave={!disabled ? handleDragLeave : undefined}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept={accept}
            onChange={handleFileChange}
            disabled={disabled}
          />
          {uploading ? (
            <Loader2 size={20} className="animate-spin text-blue-500 flex-shrink-0" />
          ) : success ? (
            <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
          ) : error ? (
            <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
          ) : (
            <div className="text-slate-400 flex-shrink-0">{getFileTypeIcon()}</div>
          )}
          <div className="flex-1 min-w-0">
            {uploading ? (
              <div className="space-y-1">
                <span className="text-xs text-blue-600 font-medium">Subiendo... {progress}%</span>
                <div className="w-full bg-blue-100 rounded-full h-1.5">
                  <div className="bg-blue-600 h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>
            ) : error ? (
              <span className="text-xs text-red-600">{error}</span>
            ) : previewUrl ? (
              <span className="text-xs text-green-700 truncate block">Archivo subido correctamente</span>
            ) : (
              <span className="text-xs text-slate-500">Haz clic o arrastra un archivo aquí</span>
            )}
          </div>
          {previewUrl && !uploading && (
            <button onClick={(e) => { e.stopPropagation(); clearPreview(); }} className="text-slate-400 hover:text-red-500 p-1">
              <X size={14} />
            </button>
          )}
        </div>
      </div>
    );
  }

  // === DEFAULT VARIANT ===
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <div
        className={`relative border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all cursor-pointer group h-48
          ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:bg-slate-50 bg-slate-50'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${error ? 'border-red-300 bg-red-50' : ''}
          ${success ? 'border-green-300 bg-green-50' : ''}`}
        onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
        onDrop={!disabled ? handleDrop : undefined}
        onDragOver={!disabled ? handleDragOver : undefined}
        onDragLeave={!disabled ? handleDragLeave : undefined}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept={accept}
          onChange={handleFileChange}
          disabled={disabled}
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={32} className="animate-spin text-blue-500" />
            <span className="text-sm font-medium text-blue-600">Subiendo... {progress}%</span>
            <div className="w-48 bg-blue-100 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>
        ) : previewUrl && (previewUrl.includes('image') || accept?.includes('image') || previewUrl.match(/\.(jpg|jpeg|png|gif|webp|svg)/i)) ? (
          <div className="relative w-full h-full">
            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover rounded-lg" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
              <span className="text-white font-medium flex items-center gap-2"><Upload size={18}/> Cambiar</span>
            </div>
            {success && (
              <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
                <CheckCircle size={16} />
              </div>
            )}
          </div>
        ) : previewUrl ? (
          <div className="flex flex-col items-center gap-2">
            <CheckCircle size={32} className="text-green-500" />
            <span className="text-sm font-medium text-green-700">Archivo subido</span>
            <span className="text-xs text-slate-500 truncate max-w-full px-4">{previewUrl.split('/').pop()}</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-2 text-red-500">
            <AlertCircle size={32} />
            <span className="text-sm font-medium">{error}</span>
            <span className="text-xs">Haz clic para intentar de nuevo</span>
          </div>
        ) : (
          <div className="text-slate-400 flex flex-col items-center">
            {getFileTypeIcon()}
            <span className="text-sm font-medium text-slate-600 mt-2">Haz clic para subir</span>
            <span className="text-xs">o arrastra el archivo aquí</span>
            <span className="text-[10px] text-slate-400 mt-1">Máx. {maxSizeMB} MB • Almacenado en Cloudinary</span>
          </div>
        )}
      </div>
    </div>
  );
};
