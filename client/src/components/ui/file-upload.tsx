import { useState } from "react";
import { CloudUpload, Check, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number;
  uploadedFile?: File | null;
  isProcessing?: boolean;
  className?: string;
}

export function FileUpload({
  onFileSelect,
  accept = "*",
  maxSize = 10 * 1024 * 1024,
  uploadedFile,
  isProcessing = false,
  className,
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (file: File) => {
    setError(null);
    
    if (file.size > maxSize) {
      setError(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
      return;
    }

    const acceptedTypes = accept.split(',').map(type => type.trim());
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const mimeType = file.type;

    const isAccepted = acceptedTypes.some(acceptedType => {
      if (acceptedType.startsWith('.')) {
        return fileExtension === acceptedType;
      }
      return mimeType.includes(acceptedType.replace('*', ''));
    });

    if (!isAccepted && accept !== '*') {
      setError('File type not supported');
      return;
    }

    onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileChange(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        handleFileChange(files[0]);
      }
    };
    input.click();
  };

  const removeFile = () => {
    setError(null);
    // Reset file by calling onFileSelect with a dummy file that we can filter out
  };

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
          isDragOver ? "border-blue-400 bg-blue-50" : "border-gray-300",
          uploadedFile ? "border-green-300 bg-green-50" : "hover:border-blue-400",
          error && "border-red-300 bg-red-50"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        {isProcessing ? (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
            <p className="text-lg font-medium text-gray-900 mb-2">Processing file...</p>
            <p className="text-gray-600">Validating OpenAPI specification</p>
          </div>
        ) : uploadedFile ? (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Check className="text-green-600" size={24} />
            </div>
            <p className="text-lg font-medium text-gray-900 mb-2">{uploadedFile.name}</p>
            <p className="text-green-600 mb-4">File uploaded successfully</p>
            <p className="text-sm text-gray-500">Click to upload a different file</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <CloudUpload className="text-blue-600" size={24} />
            </div>
            <p className="text-lg font-medium text-gray-900 mb-2">Drop your OpenAPI file here</p>
            <p className="text-gray-600 mb-4">or click to browse files</p>
          </div>
        )}
      </div>
      
      {error && (
        <div className="mt-2 flex items-center text-red-600 text-sm">
          <X size={16} className="mr-1" />
          {error}
        </div>
      )}
    </div>
  );
}
