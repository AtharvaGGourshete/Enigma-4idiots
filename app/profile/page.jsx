"use client";

import React, { useState, useEffect } from "react";
import { useProfile } from "../hooks/useProfile";

const EditProfile = () => {
  const { profile, loading: profileLoading, error, updateProfile } = useProfile();

  const [editing, setEditing] = useState(false);
  // CORRECTED: State keys now perfectly match the database and hook
  const [formState, setFormState] = useState({
    username: "",
    age: "",
    height_cm: "",
    weight_kg: "",
    email: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormState(profile);
    }
  }, [profile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState({ ...formState, [name]: value });
  };

  const handleToggleEditing = () => {
    if (editing && profile) {
      setFormState(profile); // reset on cancel
    }
    setEditing(!editing);
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    const result = await updateProfile(formState);

    if (result.success) {
      alert("Profile updated successfully!");
      setEditing(false);
    } else {
      alert("Error updating profile: " + result.error);
    }
    setIsSaving(false);
  };

  if (profileLoading && !profile) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-lg text-gray-700 animate-pulse">Loading Profile...</p>
      </div>
    );
  }

  return (
   <main className="bg-[#D9E89A] w-full min-h-screen p-4 sm:p-6 lg:p-10">
  <div className="container mx-auto max-w-6xl">
    <header className="mb-10 text-center">
      <h1 className="text-4xl font-extrabold text-black tracking-wide mt-12">Account Settings</h1>
      <p className="text-lg text-black/70 max-w-xl mx-auto">
        Manage your profile and personal information.
      </p>
    </header>
    <div className="bg-white bg-opacity-90 rounded-3xl shadow-xl overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-10 p-8">
        <aside className="md:col-span-1 p-6 border-b md:border-b-0 md:border-r border-black/10 rounded-lg shadow-sm bg-white">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">{formState.username || "No Name"}</h2>
            <p className="text-sm text-gray-600 mb-6 break-all">{formState.email}</p>
            <div className="space-y-2 text-gray-700 font-semibold text-left text-sm">
              <p><span className="text-black">Age:</span> {formState.age || 'N/A'}</p>
              <p><span className="text-black">Height:</span> {formState.height_cm ? `${formState.height_cm} cm` : 'N/A'}</p>
              <p><span className="text-black">Weight:</span> {formState.weight_kg ? `${formState.weight_kg} kg` : 'N/A'}</p>
            </div>
          </div>
        </aside>
        <section className="md:col-span-3 p-8 bg-white rounded-3xl shadow-md">
          <h3 className="text-3xl font-extrabold text-gray-900 mb-8 tracking-wide">General Information</h3>
          {error && (
            <p className="mb-6 text-center text-red-600 font-semibold border border-red-300 rounded p-3 bg-red-50">
              Error: {error}
            </p>
          )}
          <form onSubmit={handleSaveChanges} className="space-y-8 max-w-4xl mx-auto">
            <div>
              <label
                htmlFor="username"
                className="block mb-3 font-semibold text-gray-700 text-lg"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={formState.username}
                onChange={handleInputChange}
                disabled={!editing}
                className={`w-full rounded-xl border border-gray-300 text-lg px-6 py-4 focus:ring-4 focus:ring-[#c1e141] focus:border-[#c1e141] ${
                  !editing ? "bg-gray-100 cursor-not-allowed text-gray-500" : "bg-white"
                }`}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div>
                <label
                  htmlFor="age"
                  className="block mb-2 font-semibold text-gray-700 text-lg"
                >
                  Age
                </label>
                <input
                  id="age"
                  name="age"
                  type="number"
                  value={formState.age}
                  onChange={handleInputChange}
                  disabled={!editing}
                  className={`w-full rounded-xl border border-gray-300 px-6 py-4 text-lg focus:ring-4 focus:ring-[#c1e141] focus:border-[#c1e141] ${
                    !editing ? "bg-gray-100 cursor-not-allowed text-gray-500" : "bg-white"
                  }`}
                />
              </div>
              <div>
                <label
                  htmlFor="height_cm"
                  className="block mb-2 font-semibold text-gray-700 text-lg"
                >
                  Height (cm)
                </label>
                <input
                  id="height_cm"
                  name="height_cm"
                  type="number"
                  value={formState.height_cm}
                  onChange={handleInputChange}
                  disabled={!editing}
                  className={`w-full rounded-xl border border-gray-300 px-6 py-4 text-lg focus:ring-4 focus:ring-[#c1e141] focus:border-[#c1e141] ${
                    !editing ? "bg-gray-100 cursor-not-allowed text-gray-500" : "bg-white"
                  }`}
                />
              </div>
              <div>
                <label
                  htmlFor="weight_kg"
                  className="block mb-2 font-semibold text-gray-700 text-lg"
                >
                  Weight (kg)
                </label>
                <input
                  id="weight_kg"
                  name="weight_kg"
                  type="number"
                  step="0.1"
                  value={formState.weight_kg}
                  onChange={handleInputChange}
                  disabled={!editing}
                  className={`w-full rounded-xl border border-gray-300 px-6 py-4 text-lg focus:ring-4 focus:ring-[#c1e141] focus:border-[#c1e141] ${
                    !editing ? "bg-gray-100 cursor-not-allowed text-gray-500" : "bg-white"
                  }`}
                />
              </div>
            </div>

            <div className="flex justify-end gap-6">
              {editing ? (
                <>
                  <button
                    type="button"
                    onClick={handleToggleEditing}
                    className="rounded-xl bg-gray-200 px-8 py-3 font-semibold text-gray-700 hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="rounded-xl bg-[#c1e141] px-8 py-3 font-semibold text-black hover:bg-[#a9be29] disabled:bg-[#bec78d] disabled:cursor-not-allowed transition-colors"
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleToggleEditing}
                  className="rounded-xl bg-black px-8 py-3 font-semibold text-white hover:bg-gray-900 transition-colors"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </form>
        </section>
      </div>
    </div>
    </div>
  </main>

  );
};

export default EditProfile;
