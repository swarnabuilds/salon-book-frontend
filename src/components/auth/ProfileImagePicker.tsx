"use client";

import React, { useEffect, useState } from "react";
import { Upload, Link2, Sparkles, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { validateImageFile } from "@/lib/validation/authValidation";
import type { ImageInputMode } from "@/types/auth";

interface ProfileImagePickerProps {
  mode: ImageInputMode;
  onModeChange: (mode: ImageInputMode) => void;
  fallbackInitial?: string;
}

export function ProfileImagePicker({
  mode,
  onModeChange,
  fallbackInitial = "SB",
}: ProfileImagePickerProps) {
  const [filePreview, setFilePreview] = useState<string>("");
  const [urlInput, setUrlInput] = useState<string>("");

  useEffect(() => {
    return () => {
      if (filePreview) {
        URL.revokeObjectURL(filePreview);
      }
    };
  }, [filePreview]);

  // Handle local file selection and preview
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setFilePreview("");
      return;
    }

    const errorMessage = validateImageFile(file);
    if (errorMessage) {
      toast.error(errorMessage);
      event.target.value = "";
      setFilePreview("");
      return;
    }

    if (filePreview) {
      URL.revokeObjectURL(filePreview);
    }
    setFilePreview(URL.createObjectURL(file));
    toast.success("Image selected successfully!");
  };

  const activePreview = mode === "upload" ? filePreview : urlInput.trim();

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-br from-stone-50 via-amber-50/20 to-stone-100/60 border border-stone-200/80 space-y-3.5 shadow-inner">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-semibold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-amber-600" />
          Profile Avatar
        </Label>
        <span className="text-[11px] text-stone-500 font-medium">
          ImgBB Upload or URL
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Live Preview Avatar */}
        <Avatar className="h-16 w-16 border-2 border-white shadow-md shrink-0">
          <AvatarImage src={activePreview} className="object-cover" />
          <AvatarFallback className="bg-amber-100 text-amber-900 font-serif text-lg">
            {fallbackInitial}
          </AvatarFallback>
        </Avatar>

        <Tabs
          value={mode}
          onValueChange={(value) => onModeChange(value as ImageInputMode)}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 h-8 bg-stone-200/70 p-0.5 rounded-lg">
            <TabsTrigger
              value="upload"
              className="text-xs rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <Upload className="h-3.5 w-3.5 mr-1.5 text-stone-600" />
              Upload
            </TabsTrigger>
            <TabsTrigger
              value="url"
              className="text-xs rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <Link2 className="h-3.5 w-3.5 mr-1.5 text-stone-600" />
              Image URL
            </TabsTrigger>
          </TabsList>

          {/* Upload Tab with direct clickable label trigger */}
          <TabsContent value="upload" className="mt-2.5">
            <label
              htmlFor="avatar-file-input"
              className="flex items-center justify-center gap-2 w-full h-9 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium cursor-pointer shadow-sm transition-all"
            >
              <ImageIcon className="h-3.5 w-3.5 text-amber-300" />
              <span>Choose Image from Device</span>
            </label>
            <input
              id="avatar-file-input"
              name="imageFile"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </TabsContent>

          {/* Image URL Tab */}
          <TabsContent value="url" className="mt-2.5">
            <Input
              name="imageUrl"
              type="url"
              placeholder="https://i.ibb.co/image.jpg"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="h-9 text-xs bg-white rounded-xl border-stone-200"
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}