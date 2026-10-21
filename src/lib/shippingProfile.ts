import { supabase } from "@/integrations/supabase/client";
import type { ShippingData } from "@/components/ShippingDialog";

export async function saveShippingProfile(userId: string, shipping: ShippingData) {
  const { error } = await supabase.from("profiles").upsert({
    user_id: userId,
    full_name: shipping.recipient_name,
    phone: shipping.phone,
    address: `${shipping.exact_address}, ${shipping.district}, ${shipping.canton}, ${shipping.province}`,
    shipping_phone: shipping.phone,
    shipping_province: shipping.province,
    shipping_canton: shipping.canton,
    shipping_district: shipping.district,
    shipping_exact_address: shipping.exact_address,
  }, { onConflict: "user_id" });
  if (error) throw error;
}