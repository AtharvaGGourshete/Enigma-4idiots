"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseclient";
import { UserAuth } from "@/context/Authcontext";

export const useProfile = () => {
  const { user } = UserAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Memoized function to fetch the user's profile data
  const fetchProfile = useCallback(async () => {
    if (user) {
      setLoading(true);
      setError(null);

      // Fetch data from the profiles table, using .maybeSingle()
      // to gracefully handle cases where a profile row does not exist yet.
      const { data, error: profileError } = await supabase
        .from("profiles")
        .select("age, height_cm, weight_kg")
        .eq("id", user.id)
        .maybeSingle(); // Use maybeSingle() to avoid errors on no-rows-found

      if (profileError) {
        console.error("Fetch Error:", profileError.message);
        setError(profileError.message);
      } else {
        // Combine auth data and profile data into one unified object
        setProfile({
          username: user.user_metadata?.display_name || "",
          age: data?.age || "",
          height_cm: data?.height_cm || "",
          weight_kg: data?.weight_kg || "",
          email: user.email,
        });
      }
      setLoading(false);
    }
  }, [user]);

  // Effect to trigger the fetch function when the user object is available
  useEffect(() => {
    fetchProfile();
  }, [user, fetchProfile]);

  // Function to update the user's profile
  const updateProfile = async (updatedData) => {
    if (!user) {
      setError("No user logged in.");
      return { success: false };
    }
    setLoading(true);
    setError(null);

    // Separate the username from the rest of the profile data
    const { username, email, ...profileData } = updatedData; // email is excluded from update

    // Use Promise.all to run both database updates concurrently for efficiency
    const [userUpdateResult, profileUpdateResult] = await Promise.all([
      // 1. Update the user metadata (for display_name) in the auth schema
      supabase.auth.updateUser({
        data: { display_name: username },
      }),
      // 2. Update the public profiles table
      supabase
        .from("profiles")
        .update({
          ...profileData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id),
    ]);

    setLoading(false);

    // Check for errors in either of the update operations
    if (userUpdateResult.error || profileUpdateResult.error) {
      const errorMessage =
        userUpdateResult.error?.message || profileUpdateResult.error?.message;
      console.error("Update Error:", errorMessage);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } else {
      // Re-fetch the profile to ensure the UI shows the latest data
      await fetchProfile();
      return { success: true };
    }
  };

  // Return the state and functions for the component to use
  return { profile, loading, error, updateProfile };
};
