import { createClient } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import CartSidebar from '@/components/CartSidebar'
import ProductCard from '@/components/ProductCard'
import Footer from '@/components/Footer'
import HomeClient from './HomeClient'

export default async function Home() {
  const supabase = createClient()

  // فیچرڈ پروڈکٹس — سرور سائیڈ
  const { data: featured } = await supabase
    .from('products')
    .select('*, profiles(*)')
    .eq('is_featured', true)
    .eq('is_approved', true)
    .order('created_at', { ascending: false })
    .limit(6)

  // تازہ ترین
  const { data: latest } = await supabase
    .from('products')
    .select('*, profiles(*)')
    .eq('is_approved', true)
    .order('created_at', { ascending: false })
    .limit(9)

  // اعداد و شمار
  const { count: productCount } = await supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_approved', true)
  const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })

  return (
    <>
      <Navbar />
      <CartSidebar />
      <HomeClient
        featured={featured || []}
        latest={latest || []}
        productCount={productCount || 0}
        userCount={userCount || 0}
      />
      <Footer />
    </>
  )
}
