import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader } from 'lucide-react';
import API_BASE from '../utils/apiBase';
import { toast } from 'sonner';

export default function ImageUpload({ value, onChange, label = "Image" }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(value || '');
  const fileInputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = async (file) => {
    // Vérifier le type
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image valide');
      return;
    }

    // Vérifier la taille (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image trop volumineuse. Taille max: 5MB');
      return;
    }

    // Créer un aperçu local immédiatement
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
    };
    reader.readAsDataURL(file);

    // Upload vers le serveur
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch(`${API_BASE}/admin/upload_image.php`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      const data = await res.json();

      if (data.success) {
        setPreview(data.url);
        onChange(data.url);
        toast.success('Image uploadée avec succès !');
      } else {
        toast.error(data.error || 'Erreur lors de l\'upload');
        setPreview(value || '');
      }
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('Erreur lors de l\'upload de l\'image');
      setPreview(value || '');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview('');
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-semibold mb-2">{label}</label>
      
      {preview ? (
        // Afficher l'aperçu
        <div className="relative group">
          <img
            src={preview}
            alt="Aperçu"
            className="w-full h-48 object-cover rounded-lg border-2 border-gray-300"
          />
          {uploading && (
            <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
              <Loader className="w-8 h-8 text-white animate-spin" />
            </div>
          )}
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        // Zone de drop
        <div
          onClick={handleClick}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-all duration-200
            ${isDragging 
              ? 'border-purple-500 bg-purple-50' 
              : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
            }
            ${uploading ? 'pointer-events-none opacity-50' : ''}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
          />
          
          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader className="w-12 h-12 text-purple-500 animate-spin" />
              <p className="text-sm text-gray-600">Upload en cours...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              {isDragging ? (
                <>
                  <Upload className="w-12 h-12 text-purple-500" />
                  <p className="text-sm font-semibold text-purple-600">Déposez l'image ici</p>
                </>
              ) : (
                <>
                  <ImageIcon className="w-12 h-12 text-gray-400" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-gray-700">
                      Glissez-déposez une image ici
                    </p>
                    <p className="text-xs text-gray-500">
                      ou cliquez pour sélectionner
                    </p>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    JPG, PNG, GIF, WEBP • Max 5MB
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* URL manuelle optionnelle */}
      {!preview && (
        <div className="mt-3">
          <div className="text-xs text-gray-500 text-center mb-2">ou</div>
          <input
            type="url"
            placeholder="Entrez une URL d'image"
            value={value || ''}
            onChange={(e) => {
              onChange(e.target.value);
              setPreview(e.target.value);
            }}
            className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      )}
    </div>
  );
}
