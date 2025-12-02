// Shared helpers for handling hex color values in forms and display.
export const HEX_COLOR_REGEX = /^#?[0-9a-fA-F]{3,8}$/;

export const isValidHexColor = (val: string) => HEX_COLOR_REGEX.test(val.trim());

export const normalizeHexColor = (val: string | null | undefined) => {
  const trimmed = (val ?? "").trim();
  if (!trimmed) return null;
  return trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
};
