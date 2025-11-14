import { createClient } from '@supabase/supabase-js';

// Pastikan Environment Variables sudah diatur di Vercel
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
    const { method, body, query } = req;

    // --- 1. LOGIKA GET (BACA KATEGORI) ---
    if (method === 'GET') {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('category_order', { ascending: true }); // Urutkan kategori

        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json(data);
    }

    // --- 2. LOGIKA POST (TAMBAH KATEGORI BARU) ---
    if (method === 'POST') {
        const { data, error } = await supabase
            .from('categories')
            .insert(body)
            .select();

        if (error) return res.status(500).json({ error: error.message });
        return res.status(201).json(data[0]); // 201 Created
    }
    
    // --- 3. LOGIKA PUT (EDIT KATEGORI) ---
    if (method === 'PUT') {
        const categoryId = query.id;
        if (!categoryId) return res.status(400).json({ error: 'Category ID required for PUT' });

        const { data, error } = await supabase
            .from('categories')
            .update(body)
            .eq('id', categoryId)
            .select();

        if (error) return res.status(500).json({ error: error.message });
        if (data.length === 0) return res.status(404).json({ error: 'Category not found' });
        return res.status(200).json(data[0]);
    }
    
    // --- 4. LOGIKA DELETE (HAPUS KATEGORI) ---
    if (method === 'DELETE') {
        const categoryId = query.id;
        if (!categoryId) return res.status(400).json({ error: 'Category ID required for DELETE' });

        // **PENTING:** Hapus juga semua produk yang category_id-nya sama (menghindari error data yatim)
        const { error: productError } = await supabase
            .from('products')
            .delete()
            .eq('category_id', categoryId);

        if (productError) console.error("Error deleting related products:", productError);
        
        // Hapus Kategori
        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', categoryId);

        if (error) return res.status(500).json({ error: error.message });
        return res.status(204).end(); // 204 No Content
    }

    // Tangani metode HTTP yang tidak diizinkan
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${method} Not Allowed`);
}
