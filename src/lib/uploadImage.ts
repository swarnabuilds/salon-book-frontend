// Shared ImgBB upload used by profile and service image pickers.
// The assignment requires image uploads (not image URLs), so forms call this
// helper with the selected File and store the returned hosted URL.
export async function uploadImageToImgbb(
  file: File
): Promise<{ success: boolean; url?: string; message?: string }> {
  const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      message:
        "ImgBB API key is missing. Add NEXT_PUBLIC_IMGBB_API_KEY to your environment.",
    };
  }

  try {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${apiKey}`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json().catch(() => null);

    if (!response.ok || !data?.success || !data?.data?.url) {
      return {
        success: false,
        message: data?.error?.message || "Image upload failed.",
      };
    }

    return {
      success: true,
      url: String(data.data.url),
    };
  } catch (error: unknown) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to upload image.",
    };
  }
}

// Simple string-returning wrapper used by the sign-up form, which only needs
// the hosted URL and relies on a thrown error to show its own message.
export async function uploadImageToImgBB(file: File): Promise<string> {
  const result = await uploadImageToImgbb(file);

  if (!result.success || !result.url) {
    throw new Error(result.message || "Image upload failed.");
  }

  return result.url;
}
