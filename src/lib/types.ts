export interface Profile {
  id: string
  full_name: string | null
  university: string | null
  avatar_url: string | null
  phone: string | null
  bank_account: string | null
  skills: string[]
  bio: string | null
  role: 'admin' | 'user'
  is_approved_seller: boolean
  is_rejected: boolean
  reject_reason: string | null
  created_at: string
}

export interface Product {
  id: string
  seller_id: string
  name: string
  name_en: string | null
  description: string
  description_en: string | null
  category: 'extension' | 'app' | 'tool' | 'website'
  price: number
  image_url: string | null
  download_url: string
  tags: string[]
  is_featured: boolean
  is_approved: boolean
  rating: number
  review_count: number
  sales_count: number
  created_at: string
  updated_at: string
  profiles?: Profile
}

export interface Review {
  id: string
  product_id: string
  user_id: string
  rating: number
  comment: string | null
  created_at: string
  profiles?: Profile
}

export interface Order {
  id: string
  buyer_id: string
  total_amount: number
  status: string
  created_at: string
  order_items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  product_name: string
  price: number
  download_url: string | null
  created_at: string
}

export interface AdminNote {
  id: string
  admin_id: string
  student_id: string
  note: string
  created_at: string
  profiles?: Profile
}

export interface CartItem {
  product: Product
  quantity: number
}

export type Lang = 'ur' | 'en'
