export type ProductWriting = { language: "ar" | "en"; text: string };

export type CartEntry = { id: string; quantity: number; writing?: ProductWriting; sizeId?: string };
