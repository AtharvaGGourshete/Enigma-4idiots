"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  Activity, 
  User, 
  Scale, 
  Save,
  RefreshCw,
  ArrowLeft,
  Loader2,
  TrendingUp
} from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

const page = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Dummy current values (simulate existing data)
  const [metricsData, setMetricsData] = useState({
    systolicBP: "125",
    diastolicBP: "82",
    heartRate: "75",
    sodiumIntake: "2200",
    physicalActivity: "180",
    sleepQuality: "7",
    stressLevel: "4",
    age: "28",
    smokingStatus: "0",
    alcoholConsumption: "3",
    previousHypertensiveEpisodes: "1",
    comorbidityCount: "0",
    weight: "72.5",
    height: "175"
  });

  const handleInputChange = (field, value) => {
    setMetricsData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUpdate = async () => {
    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log("Updated Metrics Data:", metricsData);
      
      toast.success("Health metrics updated successfully! 📊");
    } catch (err) {
      console.error("Error updating metrics:", err);
      toast.error("Failed to update your metrics. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetToDefaults = () => {
    setMetricsData({
      systolicBP: "125",
      diastolicBP: "82",
      heartRate: "75",
      sodiumIntake: "2200",
      physicalActivity: "180",
      sleepQuality: "7",
      stressLevel: "4",
      age: "28",
      smokingStatus: "0",
      alcoholConsumption: "3",
      previousHypertensiveEpisodes: "1",
      comorbidityCount: "0",
      weight: "72.5",
      height: "175"
    });
    toast.info("Reset to current values");
  };

  const metricSections = [
    {
      title: "Vital Signs",
      icon: Heart,
      color: "text-red-500",
      fields: [
        { key: "systolicBP", label: "Systolic Blood Pressure (mmHg)", type: "number", placeholder: "120" },
        { key: "diastolicBP", label: "Diastolic Blood Pressure (mmHg)", type: "number", placeholder: "80" },
        { key: "heartRate", label: "Heart Rate (bpm)", type: "number", placeholder: "72" }
      ]
    },
    {
      title: "Lifestyle & Behavioral",
      icon: Activity,
      color: "text-green-500",
      fields: [
        { key: "sodiumIntake", label: "Sodium Intake (mg/day)", type: "number", placeholder: "2300" },
        { key: "physicalActivity", label: "Physical Activity (minutes/week)", type: "number", placeholder: "150" },
        { key: "sleepQuality", label: "Sleep Quality Score (1-10)", type: "select", options: Array.from({length: 10}, (_, i) => ({ value: String(i + 1), label: `${i + 1} - ${i < 3 ? "Poor" : i < 7 ? "Fair" : "Excellent"}` })) },
        { key: "stressLevel", label: "Stress Level (1-10)", type: "select", options: Array.from({length: 10}, (_, i) => ({ value: String(i + 1), label: `${i + 1} - ${i < 3 ? "Low" : i < 7 ? "Moderate" : "High"}` })) }
      ]
    },
    {
      title: "Demographics & Health History",
      icon: User,
      color: "text-blue-500",
      fields: [
        { key: "age", label: "Age (years)", type: "number", placeholder: "30" },
        { key: "smokingStatus", label: "Smoking Status", type: "select", options: [{ value: "0", label: "Non-smoker" }, { value: "1", label: "Smoker" }] },
        { key: "alcoholConsumption", label: "Alcohol Consumption (units/week)", type: "number", placeholder: "0" },
        { key: "previousHypertensiveEpisodes", label: "Previous Hypertensive Episodes", type: "number", placeholder: "0" }
      ]
    },
    {
      title: "Physical Measurements",
      icon: Scale,
      color: "text-purple-500",
      fields: [
        { key: "weight", label: "Weight (kg)", type: "number", step: "0.1", placeholder: "70.5" },
        { key: "height", label: "Height (cm)", type: "number", placeholder: "175" },
        { key: "comorbidityCount", label: "Comorbidity Count", type: "number", placeholder: "0" }
      ]
    }
  ];

  return (
    <div className="min-h-screen w-full bg-[#D9E89A] flex items-center justify-center p-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-6xl"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div variants={itemVariants}>
            <Badge variant="secondary" className="rounded-full px-4 py-2 bg-white/20 text-black border-none mb-4">
              <TrendingUp className="h-4 w-4 mr-2" />
              Update Health Metrics
            </Badge>
          </motion.div>
          <motion.h1 variants={itemVariants} className="text-3xl lg:text-4xl font-bold text-black mb-2">
            Update Your Health Profile
          </motion.h1>
          <motion.p variants={itemVariants} className="text-black/70 text-lg">
            Keep your health data current for better insights and recommendations
          </motion.p>
        </div>

        {/* Navigation */}
        <motion.div variants={itemVariants} className="mb-6">
          <Button
            onClick={() => router.back()}
            variant="ghost"
            className="text-black hover:bg-white/20 mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </motion.div>

        {/* Metrics Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {metricSections.map((section, sectionIndex) => {
            const IconComponent = section.icon;
            return (
              <motion.div
                key={section.title}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-lg h-full">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full bg-gray-100`}>
                        <IconComponent className={`h-5 w-5 ${section.color}`} />
                      </div>
                      <div>
                        <CardTitle className="text-xl text-black">{section.title}</CardTitle>
                        <CardDescription className="text-black/60">
                          Current values shown below
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {section.fields.map((field, fieldIndex) => (
                      <motion.div 
                        key={field.key}
                        variants={itemVariants}
                        className="space-y-2"
                      >
                        <Label htmlFor={field.key} className="text-black font-medium">
                          {field.label}
                        </Label>
                        
                        {field.type === "select" ? (
                          <Select 
                            value={metricsData[field.key]}
                            onValueChange={(value) => handleInputChange(field.key, value)}
                          >
                            <SelectTrigger className="bg-white/70 border-black/20 focus:border-[#c1e141] focus:ring-[#c1e141]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {field.options.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            id={field.key}
                            type={field.type}
                            step={field.step}
                            placeholder={field.placeholder}
                            value={metricsData[field.key]}
                            onChange={(e) => handleInputChange(field.key, e.target.value)}
                            className="bg-white/70 border-black/20 focus:border-[#c1e141] focus:ring-[#c1e141] text-black placeholder:text-black/50"
                          />
                        )}
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row justify-center gap-4"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={resetToDefaults}
              variant="outline"
              className="border-black/20 text-black hover:bg-white/20 px-8 py-3"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset Changes
            </Button>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={handleUpdate}
              disabled={loading}
              className="bg-[#c1e141] text-black font-semibold hover:bg-[#c1e141]/90 px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Update Metrics
                </>
              )}
            </Button>
          </motion.div>
        </motion.div>

        {/* Last Updated Info */}
        <motion.div variants={itemVariants} className="text-center mt-8">
          <p className="text-black/60 text-sm">
            Last updated: September 15, 2025 at 2:30 PM
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default page;
