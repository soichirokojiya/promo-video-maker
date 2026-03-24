"use client";

import { useRef, useState, useCallback } from "react";

export interface UploadedImage {
  data: string;
  mediaType: string;
  preview: string;
  name: string;
}

export function ImageUpload({
  images,
  onChange,
  disabled,
}: {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFiles = useCallback(
    async (files: File[]) => {
      const newImages: UploadedImage[] = [];

      for (const file of files) {
        if (!file.type.startsWith("image/")) continue;
        if (file.size > 10 * 1024 * 1024) continue;

        const base64 = await fileToBase64(file);
        newImages.push({
          data: base64,
          mediaType: file.type,
          preview: URL.createObjectURL(file),
          name: file.name,
        });
      }

      if (newImages.length > 0) {
        onChange([...images, ...newImages]);
      }
    },
    [images, onChange]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(Array.from(e.target.files));
    }
    e.target.value = "";
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (disabled) return;
      if (e.dataTransfer.files) {
        processFiles(Array.from(e.dataTransfer.files));
      }
    },
    [disabled, processFiles]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(images[index].preview);
    onChange(images.filter((_, i) => i !== index));
  };

  const openFilePicker = () => {
    inputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      {/* Drop zone / button */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={disabled ? undefined : openFilePicker}
        className={`
          flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-dashed cursor-pointer transition
          ${
            isDragging
              ? "border-indigo-500 bg-indigo-500/10 text-white"
              : "border-white/15 text-white/50 hover:text-white hover:border-white/30"
          }
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
        <span className="text-xs">
          {isDragging
            ? "ここにドロップ"
            : "スクショを追加（クリックまたはドラッグ&ドロップ）"}
        </span>
        {images.length > 0 && (
          <span className="text-xs text-white/30 ml-1">
            {images.length}枚
          </span>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/gif,image/webp"
        multiple
        onChange={handleFileInput}
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          overflow: "hidden",
          clip: "rect(0,0,0,0)",
          whiteSpace: "nowrap",
          border: 0,
        }}
      />

      {/* Thumbnails */}
      {images.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {images.map((img, i) => (
            <div
              key={i}
              className="relative group w-24 h-16 rounded-lg overflow-hidden border border-white/10"
            >
              <img
                src={img.preview}
                alt={img.name}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(i);
                }}
                disabled={disabled}
                className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/80 text-white text-xs flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition"
              >
                &times;
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white/70 text-[9px] px-1 py-0.5 truncate">
                {img.name}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
