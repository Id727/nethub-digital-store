// api/categories.js
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
    const { data: categories, error } = await supabase.from('categories').select('*').order('category_order', { ascending: true });
    if (error) { return res.status(500).json({ error: error.message }); }
    return res.status(200).json(categories);
  }

  if (req.method === 'POST') {
    const newCategory = req.body;
    const { data, error } = await supabase.from('categories').insert([newCategory]).select();
    if (error) { return res.status(500).json({ error: error.message }); }
    return res.status(201).json(data[0]);
  }

  if (req.method === 'PUT') {
    const updateData = req.body;
    const { id } = updateData;
    const { data, error } = await supabase.from('categories').update(updateData).eq('id', id).select();
    if (error) { return res.status(500).json({ error: error.message }); }
    return res.status(200).json(data[0]);
  }

  if (req.method === 'DELETE') {
    const { id } = req.body; 
    const { error: deleteCatError } = await supabase.from('categories').delete().eq('id', id);
    const { error: deleteProdError } = await supabase.from('products').delete().eq('category_id', id);
    if (deleteCatError || deleteProdError) { return res.status(500).json({ error: deleteCatError?.message || deleteProdError?.message }); }
    return res.status(204).end();
  }
  res.status(405).json({ error: 'Method Not Allowed' });
};
