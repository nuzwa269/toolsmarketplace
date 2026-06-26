import { createClient } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import ProductDetailClient from './ProductDetailClient'

export default async function ProductPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const { data: product } = await supabase
    .from('products')
    .select('*, profiles(*)')
    .eq('id', params.id)
    .eq('is_approved', true)
    .single()

  if (!product) notFound()

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, profiles(*)')
    .eq('product_id', params.id)
    .order('created_at', { ascending: false })

  return <ProductDetailClient product={product} reviews={reviews || []} />
}
