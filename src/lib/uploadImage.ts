import type { ImgBBApiResponse } from "@/types/auth";

export async function uploadImageToImgBB(file: File): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
  if (!apiKey) {
    throw new Error("ImgBB API key is missing in environment variables.");
  }

  const uploadBody = new FormData();
  uploadBody.append("image", file);

  const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
    method: "POST",
    body: uploadBody,
  });

  const result = (await response.json()) as ImgBBApiResponse;

  if (!response.ok || !result.success || !result.data?.display_url) {
    throw new Error(
      result.error?.message || "Failed to upload image to ImgBB."
    );
  }

  return result.data.display_url;
}