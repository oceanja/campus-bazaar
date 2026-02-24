import { supabase } from "./supabase";

/* ─────────────────────────────────────────────
   uploadListingImage
   Uploads a file to storage and returns its public URL.
   Files are stored under listing-images/{userId}/{uuid}.{ext}
────────────────────────────────────────────── */
export const uploadListingImage = async (file, userId) => {
    const ext = file.name.split(".").pop();
    const path = `${userId}/${crypto.randomUUID()}.${ext}`;

    const { error } = await supabase.storage
        .from("listing-images")
        .upload(path, file, { cacheControl: "3600", upsert: false });

    if (error) throw error;

    const { data } = supabase.storage
        .from("listing-images")
        .getPublicUrl(path);

    return data.publicUrl;
};

/* ─────────────────────────────────────────────
   createListing
   Inserts a new listing row. Returns the created row.
────────────────────────────────────────────── */
export const createListing = async ({
    sellerId,
    title,
    description,
    category,
    condition,
    price,
    originalPrice,
    negotiable,
    imageUrl,
}) => {
    // Use .select() without .single() to avoid PGRST116 if RLS returns 0 rows
    const { data, error } = await supabase
        .from("listings")
        .insert({
            seller_id: sellerId,
            title,
            description: description || null,
            category: category || null,
            condition: condition || null,
            price: parseInt(price, 10),
            original_price: originalPrice ? parseInt(originalPrice, 10) : null,
            negotiable: !!negotiable,
            image_url: imageUrl || null,
            status: "active",
        })
        .select();

    if (error) throw error;
    if (!data || data.length === 0) throw new Error("Insert returned no rows — check RLS policies on the listings table.");
    return data[0];
};

/* ─────────────────────────────────────────────
   getListings
   Fetches all active listings, joined with seller profile.
   Optionally filtered by category.
────────────────────────────────────────────── */
export const getListings = async (category = null) => {
    // Step 1: fetch listings (no FK join to profiles needed)
    let query = supabase
        .from("listings")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

    if (category && category !== "All") {
        query = query.eq("category", category);
    }

    const { data: listings, error } = await query;
    if (error) throw error;
    if (!listings || listings.length === 0) return [];

    // Step 2: fetch profiles for all unique seller_ids
    const sellerIds = [...new Set(listings.map(l => l.seller_id))];
    const { data: profiles } = await supabase
        .from("profiles")
        .select("id, name, college, email")
        .in("id", sellerIds);

    // Merge seller profile data onto each listing
    const profileMap = {};
    (profiles ?? []).forEach(p => { profileMap[p.id] = p; });
    return listings.map(l => ({ ...l, profiles: profileMap[l.seller_id] ?? null }));
};

/* ─────────────────────────────────────────────
   getMyListings
   Fetches all listings by a specific seller (any status).
────────────────────────────────────────────── */
export const getMyListings = async (userId) => {
    const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("seller_id", userId)
        .neq("status", "removed")
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data ?? [];
};

/* ─────────────────────────────────────────────
   updateListingStatus
   Soft-update status: 'active' | 'sold' | 'removed'
────────────────────────────────────────────── */
export const updateListingStatus = async (id, status) => {
    const { error } = await supabase
        .from("listings")
        .update({ status })
        .eq("id", id);

    if (error) throw error;
};

/* ─────────────────────────────────────────────
   updateListing
   Updates editable fields of an existing listing.
────────────────────────────────────────────── */
export const updateListing = async (id, fields) => {
    const payload = {};
    if (fields.title !== undefined) payload.title = fields.title;
    if (fields.description !== undefined) payload.description = fields.description || null;
    if (fields.category !== undefined) payload.category = fields.category || null;
    if (fields.condition !== undefined) payload.condition = fields.condition || null;
    if (fields.price !== undefined) payload.price = parseInt(fields.price, 10);
    if (fields.originalPrice !== undefined) payload.original_price = fields.originalPrice ? parseInt(fields.originalPrice, 10) : null;
    if (fields.negotiable !== undefined) payload.negotiable = !!fields.negotiable;

    const { error } = await supabase
        .from("listings")
        .update(payload)
        .eq("id", id);

    if (error) throw error;
};

