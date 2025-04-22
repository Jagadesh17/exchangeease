import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import { uploadProfilePicture } from "@/utils/storage";

type Profile = {
  id: string;
  name: string | null;
  email: string | null;
  location: string | null;
  bio: string | null;
  profile_pic: string | null;
};

type AuthContextType = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Profile & { profile_pic_file?: File }>) => Promise<{ error?: string }>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Helpers
  const getProfile = async (uid: string) => {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", uid).single();
    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
    return data as Profile;
  };

  // Create profile if it doesn't exist
  const createProfileIfNotExists = async (uid: string, email: string | undefined) => {
    // Check if profile exists
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", uid)
      .single();
    
    if (error && error.code === "PGRST116") {
      // Profile doesn't exist, create one
      const { error: insertError } = await supabase
        .from("profiles")
        .insert({
          id: uid,
          email: email || null,
          name: email ? email.split('@')[0] : "New User",
        });
      
      if (insertError) {
        console.error("Error creating profile:", insertError);
        return false;
      }
      return true;
    } else if (error) {
      console.error("Error checking profile:", error);
      return false;
    }
    
    return true; // Profile exists
  };

  // Auth state management (persisted)
  useEffect(() => {
    // First set up the auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange((event, newSession) => {
      console.log("Auth state changed:", event, newSession?.user?.id);
      setSession(newSession);
      setUser(newSession?.user ?? null);
      
      if (newSession?.user) {
        // Use setTimeout to avoid potential deadlock with Supabase auth state
        setTimeout(async () => {
          // Create profile if it doesn't exist
          await createProfileIfNotExists(newSession.user.id, newSession.user.email);
          // Then get the profile
          const userProfile = await getProfile(newSession.user.id);
          setProfile(userProfile);
        }, 0);
      } else {
        setProfile(null);
      }
    });

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log("Get session result:", currentSession?.user?.id);
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        // Create profile if needed and fetch it
        setTimeout(async () => {
          await createProfileIfNotExists(currentSession.user.id, currentSession.user.email);
          const userProfile = await getProfile(currentSession.user.id);
          setProfile(userProfile);
          setLoading(false);
        }, 0);
      } else {
        setLoading(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Sign in with email/password
  const signIn = async (email: string, password: string) => {
    const { error, data } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    
    if (data.session?.user) {
      // Create profile if needed
      await createProfileIfNotExists(data.session.user.id, data.session.user.email);
      // Get profile
      const prof = await getProfile(data.session.user.id);
      setProfile(prof);
    }
    
    return {};
  };

  // Sign out
  const signOut = async () => {
    await supabase.auth.signOut();
    toast.info("Logged out successfully");
  };

  // Update profile (including picture)
  const updateProfile = async (update: Partial<Profile & { profile_pic_file?: File }>) => {
    if (!user) return { error: "Not authenticated" };
    
    let profilePicUrl = profile?.profile_pic || null;

    // Upload if file provided
    if (update.profile_pic_file) {
      try {
        // Use the default 'avatars' bucket that should be pre-created in Supabase
        profilePicUrl = await uploadProfilePicture(update.profile_pic_file, user.id);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to upload profile picture";
        console.error("Error uploading profile pic:", errorMessage);
        return { error: errorMessage };
      }
    }

    try {
      // Remove profile_pic_file from update object as it's not a database column
      const { profile_pic_file, ...profileUpdate } = update;

      // Update profile table
      const { error } = await supabase
        .from("profiles")
        .update({
          ...profileUpdate,
          profile_pic: profilePicUrl,
        })
        .eq("id", user.id);

      if (error) {
        console.error("Error updating profile:", error);
        return { error: error.message };
      }
      
      // Reload profile
      await refreshProfile();
      return {};
    } catch (err) {
      console.error("Error in profile update:", err);
      return { error: err instanceof Error ? err.message : "Failed to update profile" };
    }
  };

  // Manual profile refresh
  const refreshProfile = async () => {
    if (user) {
      const prof = await getProfile(user.id);
      setProfile(prof);
    }
  };

  return (
    <AuthContext.Provider
      value={{ 
        user, 
        session, 
        profile, 
        signIn, 
        signOut, 
        updateProfile, 
        refreshProfile 
      }}
    >
      {!loading ? children : <div className="p-20 text-center">Loading...</div>}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
