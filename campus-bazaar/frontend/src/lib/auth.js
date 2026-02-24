import { supabase } from "./supabase";
import { upsertProfile } from "./profile";

/* Get current session */
export const getSession = async () => {
  const { data } = await supabase.auth.getSession();
  return data.session;
};

/* Email + password signup
   Accepts optional college/year/branch from step 2 of signup form
   so the profile row is pre-populated immediately. */
export const signupWithEmail = async ({ email, password, name, college, year, branch }) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, college, year, branch }, // saved in user_metadata — survives email confirmation
    },
  });

  if (error) {
    // Supabase free tier rate-limits signup confirmation emails (2/hour)
    if (error.message?.toLowerCase().includes("email rate limit")) {
      throw new Error(
        "Too many sign-up attempts. Please wait an hour before trying again, or use 'Sign up with Google' instead."
      );
    }
    throw error;
  }

  // Attempt to pre-populate the profile row.
  // NOTE: If email confirmation is enabled, there's no active session yet so
  // auth.uid() returns null and RLS will block the INSERT — that's OK.
  // The database trigger (handle_new_user) creates the base profile row
  // server-side. We swallow the RLS error here; the full profile update
  // (name, college, year) will succeed on first login via App.jsx's
  // onAuthStateChange once the user has a real session.
  if (data.user) {
    try {
      await upsertProfile({
        id: data.user.id,
        email: data.user.email,
        name,
        college: college || null,
        year: year || null,
        branch: branch || null,
      });
    } catch (profileErr) {
      // Silently ignore RLS errors here — the trigger handles row creation.
      // Any other unexpected errors are also non-fatal at this stage.
      console.warn("Profile pre-population skipped (will retry on login):", profileErr.message);
    }
  }

  return data;
};

/* Email + password login */
export const loginWithEmail = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
};

/* Google OAuth login
   Profile row is created/upserted in App.jsx's onAuthStateChange handler
   so it works for both new and returning Google users. */
export const loginWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/dashboard`,
    },
  });

  if (error) throw error;
  return data;
};

/* Logout */
export const logout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};