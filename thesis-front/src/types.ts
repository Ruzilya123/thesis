export interface Product {
  id: number
  name: string
  description: string
  flavor_profile: string
  origin: string
  price: string
  stock: number
  weight_grams: number
  image_url: string
  category: number
  category_name: string
  roast: number | null
  roast_name: string | null
  grind: number | null
  grind_name: string | null
}

export interface Category {
  id: number
  name: string
  parent: number | null
}

export interface FilterOption {
  id: number
  name: string
}

export interface DeliveryMethod {
  id: number
  name: string
  cost: string
  estimated_days: number
}

export interface CartItem {
  product_id: number
  name: string
  price: string
  quantity: number
  image_url: string
  stock: number
}

export interface OrderCalculation {
  subtotal: string
  discount: string
  bonus_used: string
  delivery_cost: string
  total: string
  bonus_earned: string
}

export interface OrderItem {
  id: number
  product: number
  product_name: string
  quantity: number
  price_at_order: string
}

export interface Order {
  id: number
  status: string
  status_display: string
  recipient_name: string
  recipient_phone: string
  address_text: string
  payment_method: string
  subtotal: string
  discount: string
  bonus_used: string
  delivery_cost: string
  total: string
  bonus_earned: string
  delivery_method: number
  delivery_method_name: string
  items: OrderItem[]
  created_at: string
}

export interface UserProfile {
  id: number
  username: string
  email: string
  phone: string
  full_name: string
}

export interface LoyaltyAccount {
  balance: string
  level_name: string
  earn_percent: string
  transactions: {
    id: number
    amount: string
    transaction_type: string
    comment: string
    created_at: string
    order: number | null
  }[]
}
