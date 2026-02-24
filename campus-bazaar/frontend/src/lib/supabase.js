import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,           // keep session in localStorage across refreshes
        autoRefreshToken: true,         // silently renew JWT before it expires
        detectSessionInUrl: true,       // handles Google OAuth ?code= callback correctly
        // storageKey intentionally omitted — custom keys cause Navigator Lock
        // timeouts when the same app is open in multiple tabs simultaneously

        // Bypass Navigator Locks entirely: the default lock causes a deadlock on the
        // second listing publish because autoRefreshToken's background timer and the
        // DB/storage call both try to acquire the same lock simultaneously.
        lock: async (_name, _acquireTimeout, fn) => fn(),
    },
    realtime: {
        params: {
            eventsPerSecond: 10,
        },
    },
});
