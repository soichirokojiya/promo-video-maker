"use client";

import { useRef } from "react";

export interface UploadedImage {
  data: string;
  mediaType: string;
  preview: string; // object URL for display
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

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;

    const newImages: UploadedImage[] = [];

    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      if (file.size > 10 * 1024 * 1024) continue; // 10MB limit

      const base64 = await fileToBase64(file);
      newImages.push({
        data: base64,
        mediaType: file.type,
        preview: URL.createObjectURL(file),
        name: file.name,
      });
    }

    onChange([...images, ...newImages]);
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(images[index].preview);
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
          className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-white/30 transition disabled:opacity-50"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          スクショを追加
        </button>
        {images.length > 0 && (
          <span className="text-xs text-white/30">
            {images.length}枚の画像
          </span>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />

      {images.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {images.map((img, i) => (
            <div
              key={i}
              className="relative group w-20 h-20 rounded-lg overflow-hidden border border-white/10"
            >
              <img
                src={img.preview}
                alt={img.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => removeImage(i)}
                disabled={disabled}
                className="absolute top-0 right-0 w-5 h-5 bg-black/70 text-white text-xs flex items-center justify-center rounded-bl opacity-0 group-hover:opacity-100 transition"
              >
                x
              </button>
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
      // Remove "data:image/png;base64," prefix
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
