export type OrderDraft = {
  isGift: boolean;
  note: string;
  buyerName: string;
  buyerPhone: string;
  recipientName: string;
  recipientPhone: string;
  city: string;
  deliveryAreaId: string;
  district: string;
  address: string;
  payment: "bank" | "cod";
};

export type Receipt = { file: File; url: string | null };

export type Snapshot = { draft: OrderDraft; receipt: Receipt | null };

export type FieldName = "buyerName" | "buyerPhone" | "recipientName" | "recipientPhone" | "city" | "deliveryAreaId" | "district" | "address";
