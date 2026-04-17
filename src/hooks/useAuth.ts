import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [roleChecked, setRoleChecked] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkRole = (userId: string) => {
      // Defer the supabase call to avoid blocking the auth state change callback
      setTimeout(async () => {
        const { data } = await supabase.rpc("has_role", {
          _user_id: userId,
          _role: "admin",
        });
        if (mounted) {
          setIsAdmin(!!data);
          setRoleChecked(true);
        }
      }, 0);
    };

    // 1. Set up listener FIRST (synchronous handler only)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!mounted) return;
      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user) {
        setRoleChecked(false);
        checkRole(newSession.user.id);
      } else {
        setIsAdmin(false);
        setRoleChecked(true);
      }
    });

    // 2. THEN fetch existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      if (!mounted) return;
      setSession(existingSession);
      setUser(existingSession?.user ?? null);

      if (existingSession?.user) {
        checkRole(existingSession.user.id);
      } else {
        setRoleChecked(true);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Auth is "ready" when initial loading is done AND role check finished (or no user)
  const ready = !loading && (user ? roleChecked : true);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
  };

  return { user, session, loading: !ready, isAdmin, signIn, signOut };
};
