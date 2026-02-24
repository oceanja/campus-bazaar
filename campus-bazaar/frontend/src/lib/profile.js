import { supabase } from "./supabase";

/* ─────────────────────────────────────────────
   upsertProfile
   Safe for first-time signup AND existing users.
   Uses ON CONFLICT to avoid duplicates.
────────────────────────────────────────────── */
export const upsertProfile = async ({ id, email, name, college, year, branch, phone, bio, upi_id }) => {
    const { data, error } = await supabase
        .from("profiles")
        .upsert(
            {
                id,
                email,
                name: name || null,
                college: college || null,
                year: year || null,
                branch: branch || null,
                phone: phone || null,
                bio: bio || null,
                upi_id: upi_id || null,
            },
            {
                onConflict: "id",
                ignoreDuplicates: false, // always update if row already exists
            }
        )
        .select()
        .single();

    if (error) throw error;
    return data;
};

/* ─────────────────────────────────────────────
   getProfile
   Returns the profile row for a user, or null.
────────────────────────────────────────────── */
export const getProfile = async (userId) => {
    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle(); // returns null instead of error when no row found

    if (error) throw error;
    return data; // null if not found
};

/* ─────────────────────────────────────────────
   updateProfile
   Partial update — only fields you pass are changed.
────────────────────────────────────────────── */
export const updateProfile = async (userId, patch) => {
    const { data, error } = await supabase
        .from("profiles")
        .update(patch)
        .eq("id", userId)
        .select()
        .single();

    if (error) throw error;
    return data;
};

/* ─────────────────────────────────────────────
   getProfileCompleteness
   Returns { pct, missing } based on filled fields.
   
   Scoring:
     name     → always required (not counted in optional pct)
     college  → 25%
     year     → 25%
     branch   → 20%
     phone    → 15%
     bio      → 15%
────────────────────────────────────────────── */
const SCORED_FIELDS = [
    { key: "college", weight: 25, label: "College" },
    { key: "year", weight: 25, label: "Year of Study" },
    { key: "branch", weight: 20, label: "Branch / Stream" },
    { key: "phone", weight: 15, label: "Phone Number" },
    { key: "bio", weight: 15, label: "Short Bio" },
];

export const getProfileCompleteness = (profile) => {
    if (!profile) return { pct: 0, missing: SCORED_FIELDS.map((f) => f.label) };

    let earned = 0;
    const missing = [];

    for (const field of SCORED_FIELDS) {
        if (profile[field.key]?.trim()) {
            earned += field.weight;
        } else {
            missing.push(field.label);
        }
    }

    return { pct: earned, missing };
};

/* Helper: derive display initials from a name string */
export const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};
