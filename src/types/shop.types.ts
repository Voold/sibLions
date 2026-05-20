export interface Product {
  uuid: string;
  name: string;
  description: string;
  price: number;
  image: string | null;
  points: number;
}

export interface ShopCheckoutPayload {
  items: Array<{ item: string; count: number }>;
}

export interface ShopCheckoutResult {
  orders: Array<{
    id: number;
    userId: number;
    productId: number;
    quantity: number | null;
    totalPoints: number;
    status: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  }>;
  spentPoints: number;
  remainingPoints: number;
}
