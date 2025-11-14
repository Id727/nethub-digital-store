import { createClient } from '@supabase/supabase-js';

// Pastikan Environment Variables sudah diatur di Vercel (SUPABASE_URL dan SUPABASE_KEY)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Fungsi utama handler Vercel
export default async function handler(req, res) {
    // Ambil metode HTTP (GET, POST, PUT, DELETE), body data, dan query parameters
    const { method, body, query } = req;

    // --- 1. LOGIKA GET (BACA/AMBIL DATA PRODUK) ---
    if (method === 'GET') {
        const { data, error } = await supabase
            .from('products')
            .select('*'); // Ambil semua data produk

        if (error) return res.status(500).json({ error: error.message });
        
        // Mengelompokkan produk berdasarkan category_id
        // Ini adalah logika yang diperlukan agar frontend HTML Anda yang lama tetap bisa berjalan
        const groupedProducts = data.reduce((acc, product) => {
            const categoryId = product.category_id;
            
            // Asumsi: ID kategori di HTML Anda adalah string, misalnya 'cat-1' atau '1'
            // Kita gunakan ID kategori dari database Supabase sebagai kunci
            const key = categoryId.toString(); 

            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(product);
            return acc;
        }, {});
        
        // Mengirimkan data dalam format objek terkelompok
        return res.status(200).json(groupedProducts);
    }
    
    // --- 2. LOGIKA POST (TAMBAH PRODUK BARU) ---
    if (method === 'POST') {
        const { data, error } = await supabase
            .from('products')
            .insert(body) // Masukkan data baru dari body request
            .select(); // Mengembalikan data yang baru ditambahkan

        if (error) return res.status(500).json({ error: error.message });
        return res.status(201).json(data[0]); // 201 Created
    }

    // --- 3. LOGIKA PUT (EDIT PRODUK) ---
    if (method === 'PUT') {
        const productId = query.id; // ID produk diambil dari URL query (contoh: /api/products?id=123)
        if (!productId) return res.status(400).json({ error: 'Product ID required for PUT' });

        // Hapus ID dari body agar tidak mencoba mengupdate kolom ID
        delete body.id; 
        
        const { data, error } = await supabase
            .from('products')
            .update(body) // Update data yang dikirim di body
            .eq('id', productId) // Hanya baris dengan ID ini yang diupdate
            .select();

        if (error) return res.status(500).json({ error: error.message });
        if (data.length === 0) return res.status(404).json({ error: 'Product not found' });
        return res.status(200).json(data[0]);
    }

    // --- 4. LOGIKA DELETE (HAPUS PRODUK) ---
    if (method === 'DELETE') {
        const productId = query.id; // ID produk diambil dari URL query
        if (!productId) return res.status(400).json({ error: 'Product ID required for DELETE' });

        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', productId); // Hapus baris dengan ID ini

        if (error) return res.status(500).json({ error: error.message });
        return res.status(204).end(); // 204 No Content (Sukses hapus)
    }

    // Tangani metode HTTP yang tidak diizinkan
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${method} Not Allowed`);
}
