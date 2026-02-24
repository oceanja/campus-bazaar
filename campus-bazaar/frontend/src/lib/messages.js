import { supabase } from "./supabase";

/* ─────────────────────────────────────────────────────────────────
   CONVERSATIONS
───────────────────────────────────────────────────────────────── */

/**
 * Find or create a conversation between two users about a listing.
 * Returns the conversation row.
 */
export const getOrCreateConversation = async (myId, otherId, listingId = null) => {
    // Always store user1_id < user2_id so the UNIQUE constraint works
    const [user1_id, user2_id] = [myId, otherId].sort();

    const { data, error } = await supabase
        .from("conversations")
        .upsert(
            { user1_id, user2_id, listing_id: listingId },
            { onConflict: "user1_id,user2_id,listing_id", ignoreDuplicates: false }
        )
        .select()
        .single();

    if (error) throw error;
    return data;
};

/**
 * Fetch all conversations for the current user, enriched with:
 *  - other user's profile (name, college)
 *  - listing title
 *  - last message text + timestamp
 */
export const getConversations = async (myId) => {
    const { data, error } = await supabase
        .from("conversations")
        .select(`
      id,
      listing_id,
      created_at,
      user1_id,
      user2_id,
      listings ( title, image_url, seller_id ),
      messages ( text, created_at, sender_id )
    `)
        .or(`user1_id.eq.${myId},user2_id.eq.${myId}`)
        .order("created_at", { ascending: false });

    if (error) throw error;

    // For each conversation, determine the "other" user and fetch their profile
    const conversations = data || [];
    const otherIds = conversations.map((c) =>
        c.user1_id === myId ? c.user2_id : c.user1_id
    );

    const uniqueOtherIds = [...new Set(otherIds)];
    let profileMap = {};

    if (uniqueOtherIds.length > 0) {
        const { data: profiles } = await supabase
            .from("profiles")
            .select("id, name, college, email, upi_id")
            .in("id", uniqueOtherIds);

        (profiles || []).forEach((p) => {
            profileMap[p.id] = p;
        });
    }

    // Sort messages by created_at and pick last one
    return conversations.map((c) => {
        const otherId = c.user1_id === myId ? c.user2_id : c.user1_id;
        const otherProfile = profileMap[otherId] || {};
        const sortedMsgs = (c.messages || []).sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        const lastMsg = sortedMsgs[0] || null;

        return {
            id: c.id,
            otherId,
            otherName:
                otherProfile.name ||
                otherProfile.email?.split("@")[0] ||
                "Student",
            otherCollege: otherProfile.college || "",
            listingTitle: c.listings?.title || null,
            listingImage: c.listings?.image_url || null,
            listingSellerId: c.listings?.seller_id || null,
            otherUpiId: otherProfile.upi_id || null,
            lastMessage: lastMsg?.text || "",
            lastAt: lastMsg?.created_at || c.created_at,
        };
    });
};

/* ─────────────────────────────────────────────────────────────────
   MESSAGES
───────────────────────────────────────────────────────────────── */

/**
 * Fetch all messages in a conversation, ordered oldest → newest.
 */
export const getMessages = async (conversationId) => {
    const { data, error } = await supabase
        .from("messages")
        .select("id, sender_id, text, created_at")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

    if (error) throw error;
    return data || [];
};

/**
 * Insert a new message into a conversation.
 */
export const sendMessage = async (conversationId, senderId, text) => {
    const { data, error } = await supabase
        .from("messages")
        .insert({ conversation_id: conversationId, sender_id: senderId, text })
        .select()
        .single();

    if (error) throw error;
    return data;
};

/**
 * Subscribe to new messages in a conversation via Supabase Realtime.
 * Returns an unsubscribe function — call it on component unmount.
 *
 * @param {string} conversationId
 * @param {(message: object) => void} onNew  called with each new message row
 * @returns {() => void}  cleanup function
 */
export const subscribeToMessages = (conversationId, onNew) => {
    const channel = supabase
        .channel(`messages:${conversationId}`)
        .on(
            "postgres_changes",
            {
                event: "INSERT",
                schema: "public",
                table: "messages",
                filter: `conversation_id=eq.${conversationId}`,
            },
            (payload) => {
                if (payload.new) onNew(payload.new);
            }
        )
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
};
