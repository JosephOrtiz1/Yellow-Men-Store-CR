import { writeFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { PUBLIC_PATHS, SITE_URL } from "../src/lib/seo";

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
if (!url || !key) throw new Error("Public catalog configuration is required to generate the sitemap.");
const client = createClient(url, key, { auth: { persistSession: false } });
const paths = new Set(PUBLIC_PATHS);
for (let offset = 0; ; offset += 200) {
  const { data, error } = await client.from("products").select("id,handle").eq("is_active", true).is("deleted_at", null).order("id").range(offset, offset + 199);
  if (error) throw error;
  for (const product of data || []) paths.add(`/product/${encodeURIComponent(product.handle || product.id)}`);
  if (!data || data.length < 200) break;
}
const escapeXml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
writeFileSync("public/sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...paths].map(path => `  <url><loc>${escapeXml(SITE_URL + path)}</loc></url>`).join("\n")}\n</urlset>\n`);
console.log(`Sitemap generated with ${paths.size} public pages.`);