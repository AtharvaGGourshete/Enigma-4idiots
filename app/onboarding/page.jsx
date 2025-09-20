"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { UserAuth } from "@/context/Authcontext";
import { supabase } from "@/lib/supabaseclient"; // Import your Supabase client
import {
  Heart,
  Activity,
  User,
  Scale,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Loader2,
} from "lucide-react";

// --- Animation Variants (No Change) ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1,
    },
  },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};
const stepVariants = {
  hidden: { opacity: 0, x: 100 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    x: -100,
    transition: { duration: 0.3, ease: "easeIn" },
  },
};

const OnboardingScreen = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = UserAuth();

  // CORRECTED: State keys now match the database schema
  const [vitalsData, setVitalsData] = useState({
    systolic_bp: "",
    diastolic_bp: "",
    heart_rate: "",
    sodium_intake: "",
    physical_activity: "",
    sleep_quality: "",
    stress_level: "",
    age: "",
    smoking_status: "0",
    alcohol_consumption: "",
    previous_hypertensive_episodes: "",
    comorbidity_count: "",
    weight_kg: "",
    height_cm: "",
  });

  const totalSteps = 4;

  const handleInputChange = (field, value) => {
    setVitalsData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          vitalsData.systolic_bp &&
          vitalsData.diastolic_bp &&
          vitalsData.heart_rate
        );
      case 2:
        return (
          vitalsData.sodium_intake &&
          vitalsData.physical_activity &&
          vitalsData.sleep_quality &&
          vitalsData.stress_level
        );
      case 3:
        return (
          vitalsData.age &&
          vitalsData.alcohol_consumption &&
          vitalsData.previous_hypertensive_episodes
        );
      case 4:
        return (
          vitalsData.comorbidity_count && vitalsData.weight_kg && vitalsData.height_cm
        );
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => prev + 1);
      toast.success("Step completed! Moving to the next step.");
    } else {
      toast.error("Please fill in all required fields before continuing.");
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  // UPDATED: handleSubmit now saves data to Supabase
  const handleSubmit = async () => {
    if (!validateCurrentStep()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (!user) {
      toast.error("You must be logged in to save your profile.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id, // Match the user ID
          ...vitalsData, // Spread the rest of the form data
        })
        .eq("id", user.id); // Ensure we are targeting the correct row

      if (error) {
        throw error;
      }

      toast.success(
        "Profile setup complete!"
      );
      router.push("/dashboard");
    } catch (err) {
      console.error("Error saving vitals:", err);
      toast.error("Failed to save your information. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // --- Step Rendering Functions (with corrected input names) ---

  const stepIcons = [Heart, Activity, User, Scale];
  const stepTitles = [
    "Vital Signs",
    "Lifestyle",
    "Demographics",
    "Measurements",
  ];

  const renderStep1 = () => (
    <motion.div key="step1" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
      <div className="text-center mb-6">
        <Heart className="h-12 w-12 text-[#c1e141] mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-black mb-2">Vital Signs</h3>
        <p className="text-black/60">Let's start with your basic vital measurements</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div variants={itemVariants} className="space-y-2">
          <Label htmlFor="systolic_bp" className="text-black font-medium">Systolic Blood Pressure (mmHg)</Label>
          <Input id="systolic_bp" type="number" placeholder="120" value={vitalsData.systolic_bp} onChange={(e) => handleInputChange("systolic_bp", e.target.value)} className="bg-white/70 border-black/20 focus:border-[#c1e141] focus:ring-[#c1e141]"/>
        </motion.div>
        <motion.div variants={itemVariants} className="space-y-2">
          <Label htmlFor="diastolic_bp" className="text-black font-medium">Diastolic Blood Pressure (mmHg)</Label>
          <Input id="diastolic_bp" type="number" placeholder="80" value={vitalsData.diastolic_bp} onChange={(e) => handleInputChange("diastolic_bp", e.target.value)} className="bg-white/70 border-black/20 focus:border-[#c1e141] focus:ring-[#c1e141]"/>
        </motion.div>
      </div>
      <motion.div variants={itemVariants} className="space-y-2">
        <Label htmlFor="heart_rate" className="text-black font-medium">Heart Rate (bpm)</Label>
        <Input id="heart_rate" type="number" placeholder="72" value={vitalsData.heart_rate} onChange={(e) => handleInputChange("heart_rate", e.target.value)} className="bg-white/70 border-black/20 focus:border-[#c1e141] focus:ring-[#c1e141]"/>
      </motion.div>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div key="step2" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
        <div className="text-center mb-6">
            <Activity className="h-12 w-12 text-[#c1e141] mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-black mb-2">Lifestyle & Behavioral Factors</h3>
            <p className="text-black/60">Tell us about your daily habits and lifestyle</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div variants={itemVariants} className="space-y-2">
                <Label htmlFor="sodium_intake" className="text-black font-medium">Sodium Intake (mg/day)</Label>
                <Input id="sodium_intake" type="number" placeholder="2300" value={vitalsData.sodium_intake} onChange={(e) => handleInputChange("sodium_intake", e.target.value)} className="bg-white/70 border-black/20 focus:border-[#c1e141] focus:ring-[#c1e141]"/>
            </motion.div>
            <motion.div variants={itemVariants} className="space-y-2">
                <Label htmlFor="physical_activity" className="text-black font-medium">Physical Activity (minutes/week)</Label>
                <Input id="physical_activity" type="number" placeholder="150" value={vitalsData.physical_activity} onChange={(e) => handleInputChange("physical_activity", e.target.value)} className="bg-white/70 border-black/20 focus:border-[#c1e141] focus:ring-[#c1e141]"/>
            </motion.div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div variants={itemVariants} className="space-y-2">
                <Label htmlFor="sleep_quality" className="text-black font-medium">Sleep Quality Score (1-10)</Label>
                <Select onValueChange={(value) => handleInputChange("sleep_quality", value)} value={vitalsData.sleep_quality}>
                    <SelectTrigger className="bg-white/70 border-black/20 focus:border-[#c1e141] focus:ring-[#c1e141]"><SelectValue placeholder="Select sleep quality" /></SelectTrigger>
                    <SelectContent>{[...Array(10)].map((_, i) => (<SelectItem key={i + 1} value={String(i + 1)}>{i + 1} - {i < 3 ? "Poor" : i < 7 ? "Fair" : "Excellent"}</SelectItem>))}</SelectContent>
                </Select>
            </motion.div>
            <motion.div variants={itemVariants} className="space-y-2">
                <Label htmlFor="stress_level" className="text-black font-medium">Stress Level (1-10)</Label>
                <Select onValueChange={(value) => handleInputChange("stress_level", value)} value={vitalsData.stress_level}>
                    <SelectTrigger className="bg-white/70 border-black/20 focus:border-[#c1e141] focus:ring-[#c1e141]"><SelectValue placeholder="Select stress level" /></SelectTrigger>
                    <SelectContent>{[...Array(10)].map((_, i) => (<SelectItem key={i + 1} value={String(i + 1)}>{i + 1} - {i < 3 ? "Low" : i < 7 ? "Moderate" : "High"}</SelectItem>))}</SelectContent>
                </Select>
            </motion.div>
        </div>
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div key="step3" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
        <div className="text-center mb-6">
            <User className="h-12 w-12 text-[#c1e141] mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-black mb-2">Demographics & Health History</h3>
            <p className="text-black/60">Help us understand your background</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div variants={itemVariants} className="space-y-2">
                <Label htmlFor="age" className="text-black font-medium">Age (years)</Label>
                <Input id="age" type="number" placeholder="30" value={vitalsData.age} onChange={(e) => handleInputChange("age", e.target.value)} className="bg-white/70 border-black/20 focus:border-[#c1e141] focus:ring-[#c1e141]"/>
            </motion.div>
            <motion.div variants={itemVariants} className="space-y-2">
                <Label htmlFor="smoking_status" className="text-black font-medium">Smoking Status</Label>
                <Select value={vitalsData.smoking_status} onValueChange={(value) => handleInputChange("smoking_status", value)}>
                    <SelectTrigger className="bg-white/70 border-black/20 focus:border-[#c1e141] focus:ring-[#c1e141]"><SelectValue placeholder="Select smoking status" /></SelectTrigger>
                    <SelectContent><SelectItem value="0">Non-smoker</SelectItem><SelectItem value="1">Smoker</SelectItem></SelectContent>
                </Select>
            </motion.div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div variants={itemVariants} className="space-y-2">
                <Label htmlFor="alcohol_consumption" className="text-black font-medium">Alcohol Consumption (units/week)</Label>
                <Input id="alcohol_consumption" type="number" placeholder="0" value={vitalsData.alcohol_consumption} onChange={(e) => handleInputChange("alcohol_consumption", e.target.value)} className="bg-white/70 border-black/20 focus:border-[#c1e141] focus:ring-[#c1e141]"/>
            </motion.div>
            <motion.div variants={itemVariants} className="space-y-2">
                <Label htmlFor="previous_hypertensive_episodes" className="text-black font-medium">Previous Hypertensive Episodes</Label>
                <Input id="previous_hypertensive_episodes" type="number" placeholder="0" value={vitalsData.previous_hypertensive_episodes} onChange={(e) => handleInputChange("previous_hypertensive_episodes", e.target.value)} className="bg-white/70 border-black/20 focus:border-[#c1e141] focus:ring-[#c1e141]"/>
            </motion.div>
        </div>
    </motion.div>
  );

  const renderStep4 = () => (
    <motion.div key="step4" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
        <div className="text-center mb-6">
            <Scale className="h-12 w-12 text-[#c1e141] mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-black mb-2">Physical Measurements</h3>
            <p className="text-black/60">Final step - your physical measurements</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div variants={itemVariants} className="space-y-2">
                <Label htmlFor="weight_kg" className="text-black font-medium">Weight (kg)</Label>
                <Input id="weight_kg" name="weight_kg" type="number" step="0.1" placeholder="70.5" value={vitalsData.weight_kg} onChange={(e) => handleInputChange("weight_kg", e.target.value)} className="bg-white/70 border-black/20 focus:border-[#c1e141] focus:ring-[#c1e141]"/>
            </motion.div>
            <motion.div variants={itemVariants} className="space-y-2">
                <Label htmlFor="height_cm" className="text-black font-medium">Height (cm)</Label>
                <Input id="height_cm" name="height_cm" type="number" placeholder="175" value={vitalsData.height_cm} onChange={(e) => handleInputChange("height_cm", e.target.value)} className="bg-white/70 border-black/20 focus:border-[#c1e141] focus:ring-[#c1e141]"/>
            </motion.div>
        </div>
        <motion.div variants={itemVariants} className="space-y-2">
            <Label htmlFor="comorbidity_count" className="text-black font-medium">Comorbidity Count (Diabetes, kidney disease, etc.)</Label>
            <Input id="comorbidity_count" type="number" placeholder="0" value={vitalsData.comorbidity_count} onChange={(e) => handleInputChange("comorbidity_count", e.target.value)} className="bg-white/70 border-black/20 focus:border-[#c1e141] focus:ring-[#c1e141]"/>
        </motion.div>
    </motion.div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      default: return renderStep1();
    }
  };

  // --- Main Return (No Change) ---
  return (
    <div className="min-h-screen w-full bg-[#D9E89A] flex items-center justify-center p-4">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full max-w-3xl">
        <div className="text-center mb-8 mt-20">
          <motion.div variants={itemVariants}>
            <Badge variant="secondary" className="rounded-full px-4 py-2 bg-white/20 text-black border-none">
              Health Profile Setup
            </Badge>
          </motion.div>
          <motion.h1 variants={itemVariants} className="text-3xl lg:text-4xl font-bold text-black mb-2">
            Complete Your Health Profile
          </motion.h1>
          <motion.p variants={itemVariants} className="text-black/70 text-lg">
            Step {currentStep} of {totalSteps} - Help us personalize your experience
          </motion.p>
        </div>
        <motion.div variants={itemVariants} className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {Array.from({ length: totalSteps }, (_, i) => {
              const stepNumber = i + 1;
              const StepIcon = stepIcons[i];
              const isCompleted = stepNumber < currentStep;
              const isActive = stepNumber === currentStep;
              return (
                <div key={stepNumber} className="flex items-center">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${isCompleted ? "bg-[#c1e141] border-[#c1e141] text-black" : isActive ? "bg-white border-[#c1e141] text-[#c1e141]" : "bg-white/20 border-white/40 text-black/40"}`}>
                    {isCompleted ? (<CheckCircle className="h-6 w-6" />) : (<StepIcon className="h-6 w-6" />)}
                  </div>    
                  <div className="ml-2 text-sm hidden md:block">
                    <div className={`font-medium ${isActive ? "text-black" : "text-black/60"}`}>{stepTitles[i]}</div>
                  </div>
                  {stepNumber < totalSteps && (<div className={`w-8 h-0.5 mx-4 ${isCompleted ? "bg-[#c1e141]" : "bg-white/40"}`} />)}
                </div>
              );
            })}
          </div>
        </motion.div>
        <motion.div variants={itemVariants} whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
          <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-xl">
            <CardContent className="p-8 space-y-6">
              <AnimatePresence mode="wait">{renderCurrentStep()}</AnimatePresence>
              <motion.div variants={itemVariants}>
                <div className="w-full bg-white/30 rounded-full h-2"><motion.div className="bg-[#c1e141] h-2 rounded-full" initial={{ width: 0 }} animate={{ width: `${(currentStep / totalSteps) * 100}%` }}/></div>
              </motion.div>
              <div className="flex justify-between pt-4">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button type="button" variant="outline" onClick={prevStep} disabled={currentStep === 1} className="border-black/20 text-black hover:bg-black/5 disabled:opacity-50">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                  </Button>
                </motion.div>
                {currentStep < totalSteps ? (
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button type="button" onClick={nextStep} className="bg-black text-white font-semibold hover:bg-black/90">
                      Next Step <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button type="button" onClick={handleSubmit} disabled={loading} className="bg-[#c1e141] text-black font-semibold hover:bg-[#c1e141]/90">
                      {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Completing...</>) : (<>Complete Setup <CheckCircle className="ml-2 h-4 w-4" /></>)}
                    </Button>
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default OnboardingScreen;
