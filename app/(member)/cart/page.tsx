import { Metadata } from 'next';
import CartClient from './CartClient';

export const metadata: Metadata = {
 title: 'Keranjang Belanja - Amania',
 description: 'Kelola aset digital pilihan Anda sebelum melakukan pembayaran.',
};

export default function CartPage() {
 return (
 <div className="w-full">
 <CartClient />
 </div>
 );
}