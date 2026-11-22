export type AppRoute =
  | { view: 'vitrine' }
  | { view: 'market-home' }
  | { view: 'market-catalogue'; segment?: MarketSegment; shopId?: string }
  | { view: 'market-product'; productId: string }
  | { view: 'market-cart' }
  | { view: 'market-login'; redirectTo?: 'cart' | 'account' | 'assistant' }
  | { view: 'market-account' }
  | { view: 'market-assistant'; tab?: 'buyer' | 'seller' };

export type ProductCondition = 'neuf' | 'frip';

export type MarketSegment =
  | 'Tous'
  | 'Homme'
  | 'Femme'
  | 'Chaussure'
  | 'Enfant'
  | 'Accessoires';

export type SortOption = 'featured' | 'price-asc' | 'price-desc';

export type PaymentMethod = 'mtn_money' | 'moov_money' | 'cod' | 'card';

export interface ProductReview {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Shop {
  id: string;
  name: string;
  city: string;
  rating: number;
  reviewCount: number;
  specialty: string;
  description: string;
  verified: boolean;
}

export interface Product {
  id: string;
  reference: string;
  name: string;
  brand: string;
  shopId: string;
  shopName: string;
  condition: ProductCondition;
  segment: Exclude<MarketSegment, 'Tous'>;
  priceFcfa: number;
  material: string;
  origin: string;
  sizes: string[];
  stockCount: number;
  isUniquePiece: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  images: string[];
  description: string;
  geoCity: string;
  paymentMethods: PaymentMethod[];
  reviews: ProductReview[];
  featuredNote?: string;
}

export interface CartItem {
  productId: string;
  name: string;
  priceFcfa: number;
  imageUrl: string;
  selectedSize: string;
  quantity: number;
  isUniquePiece: boolean;
  shopName: string;
  maxStock: number;
}

export interface UserSession {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  provider: 'google' | 'phone';
  rememberMe: boolean;
  createdAt: string;
}

export interface CheckoutFormValues {
  fullName: string;
  phone: string;
  city: string;
  address: string;
  paymentMethod: PaymentMethod;
}

export interface OrderConfirmation {
  orderNumber: string;
  customerName: string;
  phone: string;
  city: string;
  address: string;
  paymentMethod: PaymentMethod;
  subtotalFcfa: number;
  shippingFcfa: number;
  totalFcfa: number;
  itemCount: number;
  estimatedDelivery: string;
  createdAt: string;
  items: CartItem[];
}

export interface DeliveryCheckResult {
  deliverable: boolean;
  city: string;
  delay: string;
  feeFcfa: number;
  payOnDelivery: boolean;
  message: string;
}

export interface SellerDraft {
  name: string;
  condition: ProductCondition;
  segment: Exclude<MarketSegment, 'Tous'>;
  priceFcfa: string;
  material: string;
  sizesInput: string;
  geoCity: string;
  description: string;
  isUniquePiece: boolean;
}

export interface AiBuyerResponse {
  advice: string;
  recommendedIds: string[];
  stylingNotes: string;
}

export interface AiSellerResponse {
  optimizedTitle: string;
  seoDescription: string;
  geoSummary: string;
  keywords: string[];
  suggestedPriceFcfa: number;
}
