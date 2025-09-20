"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { UserAuth } from "@/context/Authcontext";
import { supabase } from "@/lib/supabaseclient";
import {
  Heart,
  Activity,
  User as UserIcon,
  ShieldCheck,
  Loader2,
  AlertTriangle,
  Zap,
  Bed,
  Smile,
  Ruler,
  Weight,
  Flame,
  TrendingUp,
  BrainCircuit,
} from "lucide-react";

// --- Reusable Metric Card Component (for grid layout) ---
const MetricCard = ({ icon: Icon, title, value, description, colorClass = "text-[#c1e141]" }) => (
  <Card className="bg-white/5 border-black/10 hover:border-black/20 hover:bg-white/10 transition-all duration-300">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-neutral-400">{title}</CardTitle>
      {Icon && <Icon className={`h-5 w-5 ${colorClass}`} />}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-white">{value ?? "N/A"}</div>
      {description && <p className="text-xs text-neutral-500">{description}</p>}
    </CardContent>
  </Card>
);

// --- Utility to calculate BMI ---
const calculateBmi = (weight, height) => {
  if (!weight || !height) return "N/A";
  const heightInMeters = height / 100;
  return (weight / (heightInMeters * heightInMeters)).toFixed(1);
};


// --- Main Dashboard Page Component ---
export default function DashboardPage() {
  const { user } = UserAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        if (fetchError) {
          if (fetchError.code === 'PGRST116') { // no rows found
            setProfile(null);
          } else {
            throw fetchError;
          }
        } else {
          setProfile(data);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Could not load your profile data.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [user]);

  // --- UI STATE 1: LOADING ---
  if (loading) {
    return (
      <div className="bg-black text-white min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-[#c1e141]" />
        <p className="mt-4 text-neutral-400">Loading Your Health Data...</p>
      </div>
    );
  }

  // --- UI STATE 2: ERROR ---
  if (error) {
    return (
      <div className="bg-black text-white min-h-screen flex flex-col items-center justify-center text-center p-4">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-red-400">Failed to Load Data</h2>
        <p className="text-neutral-400 mt-2">{error}</p>
      </div>
    );
  }

  // --- UI STATE 3: NO PROFILE ---
  if (!profile) {
    return (
      <div className="bg-black text-white min-h-screen flex flex-col items-center justify-center text-center p-4">
        <h2 className="text-3xl font-bold">Welcome!</h2>
        <p className="text-neutral-400 mt-2 max-w-sm">
          Your dashboard is ready. Complete your health profile to see your personalized insights.
        </p>
        <a href="/onboarding" className="mt-6 bg-[#c1e141] text-black font-semibold py-2 px-6 rounded-lg transition-transform hover:scale-105">
          Complete Onboarding
        </a>
      </div>
    );
  }

  // --- UI STATE 4: SUCCESS ---
  const bmi = calculateBmi(profile.weight_kg, profile.height_cm);
  const healthStabilityScore = 88; // Static value for now

  return (
    <div className="bg-black text-white min-h-screen p-4 sm:p-6 lg:p-8">
      <main className="container mx-auto mt-16">
        <header className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight">Your Health Dashboard</h1>
          <p className="text-neutral-400 mt-2">A summary of your recent vitals and lifestyle metrics.</p>
        </header>

        <div className="grid gap-6 md:grid-cols-12">
          {/* Main Stability Score Card */}
          <div className="md:col-span-12">
            <Card className="bg-gradient-to-br from-neutral-900 to-black border-black/20">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <BrainCircuit className="h-6 w-6 text-[#c1e141]" />
                  <CardTitle className="text-xl text-white">AI Health Stability Score</CardTitle>
                </div>
                <CardDescription className="text-neutral-400 pt-2">An AI-powered assessment of your health trend based on recent data.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-end justify-between">
                    <span className="text-5xl font-bold text-[#c1e141]">{healthStabilityScore}%</span>
                    <Badge className="bg-green-900/50 border-green-500/30 text-green-300">Stable</Badge>
                </div>
                <Progress value={healthStabilityScore} className="[&>*]:bg-[#c1e141]" />
              </CardContent>
            </Card>
          </div>

          {/* Vitals Section */}
          <div className="md:col-span-12">
            <h2 className="text-xl font-semibold tracking-tight mb-4 flex items-center"><Heart className="h-5 w-5 mr-3 text-[#c1e141]" />Core Vitals</h2>
            <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
              <MetricCard icon={Heart} title="Blood Pressure" value={`${profile.systolic_bp} / ${profile.diastolic_bp}`} description="Sys/Dia (mmHg)" colorClass="text-red-400" />
              <MetricCard icon={TrendingUp} title="Heart Rate" value={profile.heart_rate} description="Beats/min" />
              <MetricCard icon={Zap} title="Sodium Intake" value={profile.sodium_intake} description="mg/day" />
            </div>
          </div>

          {/* Lifestyle Section */}
          <div className="md:col-span-12">
            <h2 className="text-xl font-semibold tracking-tight mb-4 flex items-center"><Activity className="h-5 w-5 mr-3 text-[#c1e141]" />Lifestyle Factors</h2>
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
              <MetricCard icon={Activity} title="Physical Activity" value={profile.physical_activity} description="mins/week" />
              <MetricCard icon={Bed} title="Sleep Quality" value={`${profile.sleep_quality}/10`} />
              <MetricCard icon={Smile} title="Stress Level" value={`${profile.stress_level}/10`} />
              <MetricCard icon={Flame} title="Alcohol Use" value={profile.alcohol_consumption} description="units/week" />
            </div>
          </div>

          {/* Profile & Measurements Section */}
          <div className="md:col-span-12">
            <h2 className="text-xl font-semibold tracking-tight mb-4 flex items-center"><UserIcon className="h-5 w-5 mr-3 text-[#c1e141]" />Profile & Measurements</h2>
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
              <MetricCard icon={UserIcon} title="Age" value={profile.age} description="years" />
              <MetricCard icon={Ruler} title="Height" value={profile.height_cm} description="cm" />
              <MetricCard icon={Weight} title="Weight" value={profile.weight_kg} description="kg" />
              <MetricCard title="BMI" value={bmi} description="Body Mass Index" />
            </div>
          </div>

          {/* Risk Assessment Section */}
          <div className="md:col-span-12">
             <h2 className="text-xl font-semibold tracking-tight mb-4 flex items-center"><ShieldCheck className="h-5 w-5 mr-3 text-[#c1e141]" />Risk Assessment</h2>
             <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <Card className="bg-neutral-900 border-neutral-800">
                    <CardHeader><CardTitle>Heart Failure Risk</CardTitle></CardHeader>
                    <CardContent><p className="text-neutral-300">Moderate risk. Maintain healthy lifestyle and regular checkups.</p></CardContent>
                </Card>
                <Card className="bg-neutral-900 border-neutral-800">
                    <CardHeader><CardTitle>Diabetes Risk</CardTitle></CardHeader>
                    <CardContent><p className="text-neutral-300">Low risk based on current data. Continue monitoring diet and activity.</p></CardContent>
                </Card>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
