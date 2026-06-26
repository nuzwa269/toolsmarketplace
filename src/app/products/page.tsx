import { createClient } from '@/lib/supabase'
import ProductsClient from './ProductsClient'

export default async function ProductsPage({ searchParams }: { searchParams: { q?: string; cat?: string; sort?: string } }) {
  const supabase = createClient()
  let query = supabase.from('products').select('*, profiles(*)').eq('is_approved', true)

  if (searchParams.cat && searchParams.cat !== 'all') {
    query = query.eq('category', searchParams.cat)
  }

  if (searchParams.q) {
    query = query.or(`name.ilike.%${searchParams.q}%,description.ilike.%${searchParams.q}%,tags.cs.{${searchParams.q}}`)
  }

  switch (searchParams.sort) {
    case 'popular': query = query.order('sales_count', { ascending: false }); break
    case 'price-low': query = query.order('price', { ascending: true }); break
    case 'price-high': query = query.order('price', { ascending: false }); break
    case 'rating': query = query.order('rating', { ascending: false }); break
    default: query = query.order('created_at', { ascending: false })
  }

  const { data: products } = await query

  return <ProductsClient products={products || []} initialCat={searchParams.cat || 'all'} initialQ={searchParams.q || ''} initialSort={searchParams.sort || 'latest'} />
}
