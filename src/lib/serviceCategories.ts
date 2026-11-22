// Categories listed in the SalonBook requirement document.
// Both the create and edit service forms use this list so the stored
// category values always match the public Browse Services filters.
export const SALON_CATEGORIES = [
  "Haircut & Styling",
  "Hair Coloring",
  "Hair Treatment",
  "Facial & Skincare",
  "Makeup",
  "Manicure & Pedicure",
  "Spa & Massage",
] as const;

// Legacy category labels used by older data are mapped to the current
// requirement names so filters and category sections stay consistent.
export function normalizeServiceCategory(value?: string): string {
  const clean = (value || "").trim().toLowerCase();

  if (clean === "skin & facial" || clean === "facial & skincare") {
    return "facial & skincare";
  }
  if (clean === "hair care") return "hair treatment";
  if (clean === "bridal & makeup") return "makeup";
  if (clean === "nail & grooming") return "manicure & pedicure";

  return clean;
}
