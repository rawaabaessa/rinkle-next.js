export type AdminSize = { id: string; label: string; price: number; servings: string };
export type AdminPhoto = { id: string; src: string; alt: string };
export type AdminProduct = {
  id: string;
  name: string;
  description: string;
  category: string;
  photos: AdminPhoto[];
  price: number;
  sizes: AdminSize[];
  available: boolean;
  availableToday: boolean;
  writing: { enabled: boolean; arabic: boolean; english: boolean; maxLength: number };
  candle: { enabled: boolean; price: number };
  deliveryEstimate: string;
  updatedAt: string | null;
};
