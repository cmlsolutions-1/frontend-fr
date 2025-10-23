// src/components/product-upload/index.tsx
import type React from "react";
import { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Upload, X, Check, Loader2, ImageIcon } from "lucide-react";
import { uploadImages } from "@/services/bancoImagenes.service";


function cn(...inputs: (string | boolean | undefined)[]) {
  return inputs.filter(Boolean).join(' ');
}

interface ImageFile {
  id: string;
  file: File;
  preview: string;
}

export default function ProductUpload() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;

    const newImages: ImageFile[] = [];
    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        const id = Math.random().toString(36).substring(7);
        const preview = URL.createObjectURL(file);
        newImages.push({ id, file, preview });
      }
    });

    setImages((prev) => [...prev, ...newImages]);
    setUploadSuccess(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files);
    },
    [handleFiles],
  );

  const removeImage = useCallback((id: string) => {
    setImages((prev) => {
      const image = prev.find((img) => img.id === id);
      if (image) {
        URL.revokeObjectURL(image.preview); // Liberar memoria de la URL del objeto
      }
      return prev.filter((img) => img.id !== id);
    });
    setUploadSuccess(false);
  }, []);



  const handleUpload = async () => {
    if (images.length === 0) return;

    setIsUploading(true);
    setUploadSuccess(false);

    try {
      // --- LÓGICA REAL DE SUBIDA AL BACKEND ---
      // Extraer los archivos del estado
      const filesToUpload = images.map(img => img.file);

      // Llamar a la función del servicio
      const uploadResponse = await uploadImages(filesToUpload);

      setIsUploading(false);
      setUploadSuccess(true);

      // --- LIMPIAR IMÁGENES DESPUÉS DE SUBIR ---
      setImages([]); // Limpia el estado de imágenes seleccionadas
      // --- FIN LIMPIEZA ---

      // Limpiar éxito después de 3 segundos
      setTimeout(() => {
        setUploadSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Error al subir imágenes:", error);
      setIsUploading(false);
      // Aquí puedes manejar el error, por ejemplo, mostrando un mensaje
      alert(`Ocurrió un error al subir las imágenes: ${error instanceof Error ? error.message : "Error desconocido"}`);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-white"> {/* Añadido mx-auto para centrar en el contenedor padre */}
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Banco de Imágenes</CardTitle>
        <CardDescription>
          Carga las imagenes de los productos para su uso en el sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Área de carga */}
        <div className="space-y-2">
          <Label htmlFor="images">Imágenes del Producto</Label>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "relative border-2 border-dashed rounded-lg p-8 transition-colors",
              isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
              images.length > 0 && "pb-4",
            )}
          >
            <input
              ref={fileInputRef}
              id="images"
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileInput}
              className="sr-only"
            />

            <div className="flex flex-col items-center justify-center gap-4 text-center">
              <div className="rounded-full bg-gray-200 p-4">
                <Upload className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  Arrastra y suelta tus imágenes aquí
                </p>
                <p className="text-xs text-muted-foreground">
                  o haz clic en el botón para examinar
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 flex items-center gap-2 hover:bg-gray-400 hover:text-gray-800"
              >
                <ImageIcon className="h-4 w-4" />
                Examinar Archivos
              </Button>
            </div>
          </div>
        </div>

        {/* Vista previa de imágenes */}
        {images.length > 0 && (
          <div className="space-y-3">
            <Label>Imágenes Seleccionadas ({images.length})</Label>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="group relative aspect-square overflow-hidden rounded-lg border bg-muted"
                >
                  <img
                    src={image.preview}
                    alt={image.file.name}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                  <button
                    onClick={() => removeImage(image.id)}
                    className="absolute right-2 top-2 rounded-full bg-destructive p-1.5 text-destructive-foreground opacity-0 transition-opacity hover:bg-destructive/90 group-hover:opacity-100"
                    aria-label="Eliminar imagen"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                    <p className="truncate text-xs text-white">
                      {image.file.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botón de sincronización */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={handleUpload}
            disabled={
              images.length === 0 || isUploading || uploadSuccess
            }
            size="lg"
            className={cn(
              "w-full transition-all flex items-center justify-center gap-2",
              uploadSuccess && "bg-success hover:bg-success" // Asegúrate de que 'bg-success' y 'text-success-foreground' estén definidos en tu CSS/Tailwind
            )}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Sincronizando...
              </>
            ) : uploadSuccess ? (
              <>
                <Check className="mr-2 h-5 w-5" />
                Sincronización Exitosa
              </>
            ) : (
              <>
                <Upload className="mr-2 h-5 w-5" />
                Subir y Sincronizar
              </>
            )}
          </Button>

          {uploadSuccess && (
            <div className="rounded-lg bg-success/10 border border-success/20 p-4 text-center"> {/* Asegúrate de que 'bg-success/10' y 'text-success-foreground' estén definidos */}
              <p className="text-sm font-medium text-success-foreground">
                ¡Las imágenes se han sincronizado correctamente!
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}