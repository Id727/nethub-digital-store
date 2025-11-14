// api/products.js
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { return res.status(200).end(); }

  if (req.method === 'GET') {
    const { data: products, error } = await supabase.from('products').select('*');
    if (error) { return res.status(500).json({ error: error.message }); }
    const groupedProducts = products.reduce((acc, product) => {
      const categoryId = product.category_id;
      if (!acc[categoryId]) { acc[categoryId] = []; }
      acc[categoryId].push(product);
      return acc;
    }, {});
    return res.status(200).json(groupedProducts);
  }

  if (req.method === 'POST') {
    const newProduct = req.body;
    const { data, error } = await supabase.from('products').insert([newProduct]).select();
    if (error) { return res.status(500).json({ error: error.message }); }
    return res.status(201).json(data[0]);
  }

  if (req.method === 'PUT') {
    const updateData = req.body;
    const { id } = updateData;
    const { data, error } = await supabase.from('products').update(updateData).eq('id', id).select();
    if (error) { return res.status(500).json({ error: error.message }); }
    return res.status(200).json(data[0]);
  }

  if (req.method === 'DELETE') {
    const { id } = req.body; 
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) { return res.status(500).json({ error: error.message }); }
    return res.status(204).end();
  }
  res.status(405).json({ error: 'Method Not Allowed' });
};
