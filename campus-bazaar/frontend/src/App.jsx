import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "./lib/supabase";
import { getProfile, upsertProfile } from "./lib/profile";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Signup from "./pages/Signup";

/* ─── Minimal full-screen spinner shown while session is resolving ─── */
function LoadingScreen() {
  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "#FDFAF5",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexDirection: "column", gap: 16,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: "50%",
        border: "3px solid #E8E0D4",
        borderTopColor: "#E8A830",
        animation: "spin .75s linear infinite",
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ fontFamily: "system-ui, sans-serif", fontSize: ".85rem", color: "#9A8E82" }}>
        Loading Campus Bazaar…
      </p>
    </div>
  );
}

// Module-level cache: survives Vite HMR hot-updates (module is patched, not re-run).
// Prevents the LoadingScreen from flashing every time you save a file in dev.
let _sessionCache = undefined;

export default function App() {
  // Start with cached session (set on previous render) — avoids HMR blank screen
  const [session, setSession] = useState(_sessionCache);
  const [profile, setProfile] = useState(null);

  /* ── Load profile for a given user ─────────────────────────────── */
  const loadProfile = useCallback(async (user) => {
    if (!user) { setProfile(null); return; }

    // Always build a fallback from auth data so the UI is never blank
    const authFallback = {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name || user.user_metadata?.name || null,
      college: null, year: null, branch: null, phone: null, bio: null,
    };

    try {
      let prof = await getProfile(user.id);
      if (!prof) {
        // First login — try to seed the profile row
        try {
          prof = await upsertProfile({
            id: user.id,
            email: user.email,
            name: user.user_metadata?.full_name || user.user_metadata?.name || null,
            college: user.user_metadata?.college || null,
            year: user.user_metadata?.year || null,
            branch: user.user_metadata?.branch || null,
          });
        } catch {
          // Upsert failed (e.g. RLS not yet applied) — use auth fallback
          prof = authFallback;
        }
      }
      // Merge: prefer DB values but fill missing fields from auth data
      setProfile({
        ...authFallback,
        ...prof,
        // ensure email is never null if auth has it
        email: prof.email || user.email,
      });
    } catch (err) {
      console.error("Profile load error:", err);
      // Use auth data as the floor so the UI is never completely empty
      setProfile(authFallback);
    }
  }, []);

  /* ── Expose a refresh helper so Dashboard can trigger a re-fetch ── */
  const refreshProfile = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    if (data?.session?.user) await loadProfile(data.session.user);
  }, [loadProfile]);

  /* ── Single source of truth: onAuthStateChange ──────────────────── *
   *  The INITIAL_SESSION event fires immediately with the stored       *
   *  session (or null), so we don't need a separate init() call.       *
   *  This removes the race condition that caused blank screens.        *
   * ──────────────────────────────────────────────────────────────── */
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, sess) => {
        _sessionCache = sess ?? null; // keep module cache in sync for HMR
        setSession(sess ?? null);
        await loadProfile(sess?.user ?? null);
      }
    );
    return () => subscription.unsubscribe();
  }, [loadProfile]);

  // session === undefined means we haven't heard from Supabase yet
  if (session === undefined) return <LoadingScreen />;

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />

        <Route
          path="/login"
          element={session ? <Navigate to="/dashboard" /> : <Login />}
        />

        <Route
          path="/signup"
          element={session ? <Navigate to="/dashboard" /> : <Signup />}
        />

        {/* Protected */}
        <Route
          path="/dashboard"
          element={
            session
              ? <Dashboard profile={profile} refreshProfile={refreshProfile} />
              : <Navigate to="/login" />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}