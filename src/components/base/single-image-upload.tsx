import React, { useState, useRef } from "react";
import { Upload, X, Camera } from "lucide-react";
import { upload } from "@imagekit/next";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { uploadImageAuth } from "@/app/_actions";

import Spinner from "../ui/spinner";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string | null) => void;
  placeholder?: string;
  className?: string;
  classNames?: {
    wrapper?: string;
    image?: string;
    placeholder?: string;
    container?: string;
    preview?: string;
  };
  aspectRatio?: "square" | "cover" | "auto";
  size?: "sm" | "md" | "lg";
}

const SingleImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  placeholder = "Upload image",
  className = "",
  classNames,
  aspectRatio = "square",
  size = "md",
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const sizeClasses = {
    sm: "w-20 h-20",
    md: "w-32 h-32",
    lg: "w-48 h-48",
    full: "w-full h-full",
  };

  const aspectClasses = {
    square: "aspect-square",
    cover: "aspect-[3/1]",
    auto: "",
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");

      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB");

      return;
    }

    setIsLoading(true);

    try {
      // UPLOAD IMAGE
      const uploadedUrl = await handleFileUpload(file);

      onChange(uploadedUrl || null);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Please try again.");
      setPreviewUrl(null);
      onChange(null);
    } finally {
      setIsLoading(false);
    }
  };

  async function handleFileUpload(file: File): Promise<string | undefined> {
    if (!file) return;

    setUploadProgress(0);

    try {
      const authParams = await uploadImageAuth();

      const response = await upload({
        file,
        fileName: file.name,
        folder: "/avatars",
        ...authParams?.data,
        onProgress: (event) => {
          setUploadProgress(Math.round((event.loaded / event.total) * 100));
        },
      });

      if (response?.url) {
        // Create preview URL
        const objectUrl = URL.createObjectURL(file);

        setPreviewUrl(objectUrl);

        // console.log("Uploading file:", file);
        // console.log("Preview URL:", objectUrl);
        // console.log("UPLOADED FILE URL:", response.url);
        toast.success("Image uploaded successfully!");
      }

      return response.url;
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  const handleRemove = () => {
    setPreviewUrl(null);
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    if (!isLoading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div
      className={cn(
        `relative flex flex-1 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400`,
        className,
        classNames?.wrapper,
      )}
    >
      <div
        className={cn(
          `relative overflow-hidden  transition-all duration-200 cursor-pointer group flex flex-1 h-full w-full justify-center items-center`,
          aspectClasses[aspectRatio],
          aspectRatio === "square" && sizeClasses[size],
          {
            "pointer-events-none": isLoading,
          },
          classNames?.container,
        )}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          disabled={isLoading}
          type="file"
          onChange={handleFileSelect}
        />

        {previewUrl ? (
          <>
            <img
              alt="Preview"
              className={cn("w-full h-full object-cover", classNames?.preview)}
              src={previewUrl}
            />

            {/* Overlay with loading or remove button */}
            <div
              className={cn(
                `absolute inset-0 bg-slate-800/50 bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center`,
              )}
            >
              {isLoading ? (
                <div className="bg-white rounded-full p-2">
                  <Spinner size="md" />
                </div>
              ) : (
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                  <button
                    className="bg-white rounded-full p-2 hover:bg-gray-100 transition-colors"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClick();
                    }}
                  >
                    <Camera className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    className="bg-white rounded-full p-2 hover:bg-gray-100 transition-colors"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove();
                    }}
                  >
                    <X className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
            {isLoading ? (
              <div className="flex flex-col items-center gap-2">
                <Spinner size="lg" />
                <span className="text-sm font-medium">Uploading...</span>
              </div>
            ) : (
              <>
                <Upload className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm text-center">{placeholder}</span>
                <span className="text-xs text-gray-400 mt-1">
                  PNG, JPG up to 5MB
                </span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Loading overlay */}
      {isLoading && previewUrl && (
        <div className="absolute inset-0 bg-black/70 bg-opacity-75 flex items-center justify-center rounded-lg">
          <div className="flex flex-col gap-2 items-center">
            <Spinner color="white" size="lg" />
            <span className="text-sm text-gray-100 font-semibold">
              Uploading...
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SingleImageUpload;
