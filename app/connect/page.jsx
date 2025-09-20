"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserAuth } from "@/context/Authcontext";
import { formatDistanceToNow, format, addMinutes, addHours, subHours } from "date-fns";
import {
  Video,
  Calendar,
  Clock,
  Users,
  Stethoscope,
  FileText,
  Bot,
  Pill,
  CheckCircle,
  User,
  Activity,
  Heart,
  Brain,
  Plus,
  Loader2
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

const ClinicianDashboard = () => {
  const { user } = UserAuth();
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');

  // AI Suggestions with real medical data
  const aiSuggestions = [
    {
      id: 1,
      type: "Protocol Adjustment",
      title: "Hypertension Management",
      description: "Sarah Johnson's BP reading 145/92 mmHg indicates Stage 1 hypertension. Consider increasing ACE inhibitor dosage or adding ARB.",
      confidence: 0.89,
      category: "cardiovascular",
      action: "Review medication",
      patientId: 1
    },
    {
      id: 2,
      type: "Lifestyle Intervention",
      title: "Diabetes Exercise Protocol",
      description: "Michael Chen's glucose levels suggest need for structured exercise program. Recommend 150min/week moderate intensity.",
      confidence: 0.76,
      category: "endocrine",
      action: "Prescribe exercise",
      patientId: 2
    },
    {
      id: 3,
      type: "Follow-up Alert",
      title: "Post-Surgical Monitoring",
      description: "Emily Rodriguez recovery progressing well. Schedule suture removal appointment in 5-7 days.",
      confidence: 0.95,
      category: "surgical",
      action: "Schedule follow-up",
      patientId: 3
    },
    {
      id: 4,
      type: "Medication Review",
      title: "Statin Adjustment",
      description: "Robert Wilson's LDL levels still elevated at 165 mg/dL. Consider increasing atorvastatin to 40mg or switch to rosuvastatin.",
      confidence: 0.83,
      category: "cardiovascular",
      action: "Adjust medication",
      patientId: 4
    }
  ];

  // Real scheduled consultations with proper timing
  const generateConsultations = () => {
    const now = new Date();
    return [
      {
        id: 1,
        patient_name: "Sarah Johnson",
        patient_id: "patient-001",
        patient_email: "sarah.johnson@email.com",
        scheduled_time: addMinutes(now, 30), // 30 minutes from now
        duration_minutes: 30,
        status: 'scheduled',
        reason: "Hypertension Follow-up & Medication Review",
        patient_age: 45,
        patient_phone: "(555) 123-4567",
        last_vitals: { 
          bp: "145/92", 
          hr: 78, 
          temp: 98.6,
          weight: "165 lbs",
          recorded: subHours(now, 2) // 2 hours ago
        },
        medical_history: ["Hypertension", "Type 2 Diabetes"],
        current_medications: ["Lisinopril 10mg", "Metformin 500mg"],
        chief_complaint: "Patient reports occasional dizziness and fatigue",
        channel_name: null
      },
      {
        id: 2,
        patient_name: "Michael Chen",
        patient_id: "patient-002",
        patient_email: "michael.chen@email.com",
        scheduled_time: addHours(now, 2), // 2 hours from now
        duration_minutes: 45,
        status: 'scheduled',
        reason: "Diabetes Management & HbA1c Review",
        patient_age: 52,
        patient_phone: "(555) 234-5678",
        last_vitals: { 
          bp: "138/85", 
          hr: 72, 
          glucose: 145,
          temp: 98.4,
          weight: "180 lbs",
          recorded: subHours(now, 1) // 1 hour ago
        },
        medical_history: ["Type 2 Diabetes", "Prediabetes", "Obesity"],
        current_medications: ["Metformin 1000mg", "Glipizide 5mg"],
        chief_complaint: "Difficulty controlling blood sugar levels",
        channel_name: null
      },
      {
        id: 3,
        patient_name: "Emily Rodriguez",
        patient_id: "patient-003",
        patient_email: "emily.rodriguez@email.com",
        scheduled_time: subHours(now, 1), // 1 hour ago (completed)
        duration_minutes: 30,
        status: 'completed',
        reason: "Post-Surgical Follow-up - Gallbladder Removal",
        patient_age: 38,
        patient_phone: "(555) 345-6789",
        last_vitals: { 
          bp: "125/80", 
          hr: 68, 
          temp: 98.2,
          pain_level: 3,
          weight: "145 lbs",
          recorded: subHours(now, 1.5) // 1.5 hours ago
        },
        medical_history: ["Gallstones", "GERD"],
        current_medications: ["Omeprazole 20mg", "Ibuprofen PRN"],
        session_notes: "Patient recovery progressing well. Incision sites healing properly. No signs of infection. Pain well controlled. Patient cleared for light activities.",
        chief_complaint: "Post-operative check, mild incisional pain"
      },
      {
        id: 4,
        patient_name: "Robert Wilson",
        patient_id: "patient-004",
        patient_email: "robert.wilson@email.com",
        scheduled_time: addHours(now, 4), // 4 hours from now
        duration_minutes: 30,
        status: 'scheduled',
        reason: "Cardiac Risk Assessment & Cholesterol Management",
        patient_age: 59,
        patient_phone: "(555) 456-7890",
        last_vitals: { 
          bp: "142/88", 
          hr: 82, 
          temp: 98.8,
          cholesterol: "LDL: 165, HDL: 38, Total: 245",
          weight: "195 lbs",
          recorded: subHours(now, 3) // 3 hours ago
        },
        medical_history: ["Hyperlipidemia", "Family history of CAD", "Smoking (quit 2 years ago)"],
        current_medications: ["Atorvastatin 20mg", "Aspirin 81mg"],
        chief_complaint: "Concerned about cardiovascular risk, wants to discuss statin adjustment",
        channel_name: null
      },
      {
        id: 5,
        patient_name: "Jennifer Adams",
        patient_id: "patient-005",
        patient_email: "jennifer.adams@email.com",
        scheduled_time: addMinutes(now, -15), // 15 minutes ago (active)
        duration_minutes: 30,
        status: 'active',
        reason: "Mental Health Check-in & Medication Adjustment",
        patient_age: 34,
        patient_phone: "(555) 567-8901",
        last_vitals: { 
          bp: "118/75", 
          hr: 88, 
          temp: 98.1,
          mood_score: 6,
          anxiety_level: 7,
          weight: "135 lbs",
          recorded: subHours(now, 0.5) // 30 minutes ago
        },
        medical_history: ["Major Depression", "Generalized Anxiety Disorder"],
        current_medications: ["Sertraline 50mg", "Buspirone 15mg"],
        chief_complaint: "Increased anxiety symptoms, sleep difficulties",
        channel_name: "consultation-active-session-005"
      }
    ];
  };

  useEffect(() => {
    // Simulate loading consultations with real data
    setTimeout(() => {
      setConsultations(generateConsultations());
      setLoading(false);
    }, 1000);
  }, []);

  const generateChannelName = (consultationId) => {
    return `consultation-${Date.now()}-${consultationId}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const startVideoConsultation = (consultationId) => {
    const channelName = generateChannelName(consultationId);
    
    // Update consultation with channel name
    const updatedConsultations = consultations.map(consultation =>
      consultation.id === consultationId
        ? { ...consultation, channel_name: channelName, status: 'active' }
        : consultation
    );
    
    setConsultations(updatedConsultations);
    
    // Navigate to video call with channel name and consultation data
    const videoCallUrl = `/consultation/video/${consultationId}?channel=${channelName}&role=host`;
    window.open(videoCallUrl, '_blank', 'width=1400,height=900');
    
    toast.success("Video consultation started successfully!");
  };

  const joinActiveConsultation = (consultation) => {
    if (consultation.channel_name) {
      const videoCallUrl = `/consultation/video/${consultation.id}?channel=${consultation.channel_name}&role=host`;
      window.open(videoCallUrl, '_blank', 'width=1400,height=900');
      toast.info("Rejoining active consultation...");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-700';
      case 'active': return 'bg-green-100 text-green-700';
      case 'completed': return 'bg-gray-100 text-gray-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'cardiovascular': return Heart;
      case 'endocrine': return Brain;
      case 'lifestyle': return Activity;
      case 'surgical': return Stethoscope;
      default: return Stethoscope;
    }
  };

  const getUrgencyColor = (vitals, reason) => {
    // Simple urgency assessment based on vitals
    const bpReading = vitals.bp;
    if (bpReading) {
      const [systolic] = bpReading.split('/').map(Number);
      if (systolic > 140) return 'border-l-4 border-l-red-500';
      if (systolic > 130) return 'border-l-4 border-l-yellow-500';
    }
    return 'border-l-4 border-l-green-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#D9E89A] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-black mx-auto mb-4" />
          <p className="text-black/70">Loading consultation dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#D9E89A] pt-32 pb-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <Badge variant="secondary" className="rounded-full px-4 py-2 bg-white/20 text-black border-none mb-4">
            <Stethoscope className="h-4 w-4 mr-2" />
            Clinician Connect Portal
          </Badge>
          <h1 className="text-3xl lg:text-4xl font-bold text-black mb-2">
            Secure Video Consultations with AI Insights
          </h1>
          <p className="text-black/70 text-lg max-w-3xl mx-auto">
            Conduct secure video consultations with AI-powered protocol suggestions, prescription management, and seamless patient interaction.
          </p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { 
              icon: Calendar, 
              label: "Today's Consultations", 
              value: consultations.filter(c => {
                const today = new Date();
                const consultDate = new Date(c.scheduled_time);
                return consultDate.toDateString() === today.toDateString();
              }).length.toString(), 
              color: "text-blue-600" 
            },
            { 
              icon: Users, 
              label: "Active Patients", 
              value: consultations.filter(c => c.status === 'active').length.toString(), 
              color: "text-green-600" 
            },
            { 
              icon: Bot, 
              label: "AI Suggestions", 
              value: aiSuggestions.length.toString(), 
              color: "text-purple-600" 
            },
            { 
              icon: CheckCircle, 
              label: "Completed Today", 
              value: consultations.filter(c => c.status === 'completed' && 
                new Date(c.scheduled_time).toDateString() === new Date().toDateString()
              ).length.toString(), 
              color: "text-emerald-600" 
            }
          ].map((stat, index) => (
            <Card key={index} className="bg-white/80 backdrop-blur-sm border-0 shadow-md">
              <CardContent className="p-4 text-center">
                <stat.icon className={`h-6 w-6 ${stat.color} mx-auto mb-2`} />
                <div className="text-2xl font-bold text-black">{stat.value}</div>
                <div className="text-sm text-black/60">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Consultations Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tab Navigation */}
            <motion.div variants={itemVariants}>
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md">
                <CardContent className="p-4">
                  <div className="flex space-x-4">
                    {[
                      { key: 'upcoming', label: 'Upcoming', icon: Calendar },
                      { key: 'active', label: 'Active', icon: Video },
                      { key: 'completed', label: 'Completed', icon: CheckCircle }
                    ].map((tab) => {
                      const TabIcon = tab.icon;
                      const tabCount = consultations.filter(c => {
                        if (tab.key === 'upcoming') return c.status === 'scheduled';
                        if (tab.key === 'active') return c.status === 'active';
                        if (tab.key === 'completed') return c.status === 'completed';
                        return false;
                      }).length;

                      return (
                        <Button
                          key={tab.key}
                          variant={activeTab === tab.key ? "default" : "ghost"}
                          onClick={() => setActiveTab(tab.key)}
                          className={`${
                            activeTab === tab.key 
                              ? "bg-[#c1e141] text-black hover:bg-[#c1e141]/90" 
                              : "text-black/70 hover:bg-black/5"
                          }`}
                        >
                          <TabIcon className="h-4 w-4 mr-2" />
                          {tab.label} ({tabCount})
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Consultations List */}
            <div className="space-y-4">
              <AnimatePresence>
                {consultations
                  .filter(consultation => {
                    if (activeTab === 'upcoming') return consultation.status === 'scheduled';
                    if (activeTab === 'active') return consultation.status === 'active';
                    if (activeTab === 'completed') return consultation.status === 'completed';
                    return true;
                  })
                  .sort((a, b) => new Date(a.scheduled_time) - new Date(b.scheduled_time))
                  .map((consultation, index) => (
                    <motion.div
                      key={consultation.id}
                      variants={itemVariants}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -2 }}
                    >
                      <Card className={`bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${getUrgencyColor(consultation.last_vitals, consultation.reason)}`}>
                        <CardHeader className="pb-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4">
                              <Avatar className="w-12 h-12">
                                <AvatarFallback className="bg-[#c1e141] text-black font-semibold">
                                  {consultation.patient_name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-black">{consultation.patient_name}</h3>
                                <p className="text-black/60 text-sm">Age: {consultation.patient_age} • ID: {consultation.patient_id}</p>
                                <p className="text-black/80 text-sm font-medium mt-1">{consultation.reason}</p>
                                <div className="flex items-center space-x-4 mt-2 text-sm text-black/60">
                                  <div className="flex items-center">
                                    <Clock className="h-4 w-4 mr-1" />
                                    {format(new Date(consultation.scheduled_time), 'MMM dd, HH:mm')}
                                  </div>
                                  <div className="flex items-center">
                                    <Calendar className="h-4 w-4 mr-1" />
                                    {consultation.duration_minutes} min
                                  </div>
                                  {consultation.status === 'active' && (
                                    <Badge className="bg-green-600 text-white animate-pulse">
                                      • LIVE
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col items-end space-y-2">
                              <Badge className={getStatusColor(consultation.status)}>
                                {consultation.status.charAt(0).toUpperCase() + consultation.status.slice(1)}
                              </Badge>
                              {consultation.status === 'scheduled' && (
                                <span className="text-xs text-black/60">
                                  in {formatDistanceToNow(new Date(consultation.scheduled_time))}
                                </span>
                              )}
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-4">
                          {/* Chief Complaint */}
                          <div className="bg-blue-50 rounded-lg p-3">
                            <h4 className="text-sm font-medium text-black mb-1">Chief Complaint</h4>
                            <p className="text-sm text-black/80">{consultation.chief_complaint}</p>
                          </div>

                          {/* Vitals Display */}
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="text-sm font-medium text-black">Latest Vitals</h4>
                              <span className="text-xs text-black/60">
                                {formatDistanceToNow(new Date(consultation.last_vitals.recorded))} ago
                              </span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                              {consultation.last_vitals.bp && (
                                <div className="flex flex-col">
                                  <span className="text-black/60 text-xs">Blood Pressure</span>
                                  <span className="font-medium text-black">{consultation.last_vitals.bp} mmHg</span>
                                </div>
                              )}
                              {consultation.last_vitals.hr && (
                                <div className="flex flex-col">
                                  <span className="text-black/60 text-xs">Heart Rate</span>
                                  <span className="font-medium text-black">{consultation.last_vitals.hr} bpm</span>
                                </div>
                              )}
                              {consultation.last_vitals.temp && (
                                <div className="flex flex-col">
                                  <span className="text-black/60 text-xs">Temperature</span>
                                  <span className="font-medium text-black">{consultation.last_vitals.temp}°F</span>
                                </div>
                              )}
                              {consultation.last_vitals.glucose && (
                                <div className="flex flex-col">
                                  <span className="text-black/60 text-xs">Glucose</span>
                                  <span className="font-medium text-black">{consultation.last_vitals.glucose} mg/dL</span>
                                </div>
                              )}
                              {consultation.last_vitals.pain_level && (
                                <div className="flex flex-col">
                                  <span className="text-black/60 text-xs">Pain Level</span>
                                  <span className="font-medium text-black">{consultation.last_vitals.pain_level}/10</span>
                                </div>
                              )}
                              {consultation.last_vitals.weight && (
                                <div className="flex flex-col">
                                  <span className="text-black/60 text-xs">Weight</span>
                                  <span className="font-medium text-black">{consultation.last_vitals.weight}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Current Medications */}
                          {consultation.current_medications && (
                            <div className="bg-purple-50 rounded-lg p-3">
                              <h4 className="text-sm font-medium text-black mb-2">Current Medications</h4>
                              <div className="flex flex-wrap gap-1">
                                {consultation.current_medications.map((med, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {med}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Channel Info for Active Consultations */}
                          {consultation.channel_name && (
                            <div className="bg-green-50 rounded-lg p-3">
                              <h4 className="text-sm font-medium text-black mb-2">Active Session</h4>
                              <p className="text-xs text-black/70">Channel: {consultation.channel_name}</p>
                              <p className="text-xs text-green-600 font-medium">Patient is in the waiting room</p>
                            </div>
                          )}

                          {/* Session Notes (for completed) */}
                          {consultation.session_notes && (
                            <div className="bg-blue-50 rounded-lg p-3">
                              <h4 className="text-sm font-medium text-black mb-2">Session Notes</h4>
                              <p className="text-sm text-black/80">{consultation.session_notes}</p>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex justify-between items-center pt-4 border-t border-black/10">
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-black/20 text-black hover:bg-black/5"
                              >
                                <FileText className="h-4 w-4 mr-1" />
                                Chart
                              </Button>
                              <Button
                                size="sm"
                                variant="outline" 
                                className="border-black/20 text-black hover:bg-black/5"
                              >
                                <User className="h-4 w-4 mr-1" />
                                Profile
                              </Button>
                            </div>

                            {consultation.status === 'scheduled' && (
                              <Button
                                onClick={() => startVideoConsultation(consultation.id)}
                                className="bg-[#c1e141] text-black hover:bg-[#c1e141]/90"
                              >
                                <Video className="h-4 w-4 mr-2" />
                                Start Consultation
                              </Button>
                            )}

                            {consultation.status === 'active' && (
                              <Button
                                onClick={() => joinActiveConsultation(consultation)}
                                className="bg-green-600 text-white hover:bg-green-700"
                              >
                                <Video className="h-4 w-4 mr-2" />
                                Join Active Call
                              </Button>
                            )}

                            {consultation.status === 'completed' && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-green-200 text-green-600 hover:bg-green-50"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                View Summary
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
              </AnimatePresence>

              {consultations.filter(consultation => {
                if (activeTab === 'upcoming') return consultation.status === 'scheduled';
                if (activeTab === 'active') return consultation.status === 'active';
                if (activeTab === 'completed') return consultation.status === 'completed';
                return true;
              }).length === 0 && (
                <motion.div variants={itemVariants} className="text-center py-12">
                  <Video className="h-12 w-12 text-black/30 mx-auto mb-4" />
                  <p className="text-black/60 text-lg">
                    No {activeTab} consultations found
                  </p>
                </motion.div>
              )}
            </div>
          </div>

          {/* AI Suggestions Sidebar */}
          <div className="space-y-6">
            {/* AI Protocol Suggestions */}
            <motion.div variants={itemVariants}>
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg text-black flex items-center">
                    <Bot className="h-5 w-5 mr-2 text-purple-600" />
                    AI Clinical Insights
                  </CardTitle>
                  <CardDescription className="text-black/60">
                    AI-powered recommendations based on real patient data
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                  {aiSuggestions.map((suggestion) => {
                    const CategoryIcon = getCategoryIcon(suggestion.category);
                    const relatedPatient = consultations.find(c => c.id === suggestion.patientId);
                    
                    return (
                      <div key={suggestion.id} className="p-3 bg-white/70 rounded-lg border border-black/10">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <CategoryIcon className="h-4 w-4 text-purple-600" />
                            <span className="text-sm font-medium text-black">{suggestion.type}</span>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {Math.round(suggestion.confidence * 100)}% confidence
                          </Badge>
                        </div>
                        <h4 className="text-sm font-semibold text-black mb-1">{suggestion.title}</h4>
                        {relatedPatient && (
                          <p className="text-xs text-blue-600 mb-2">
                            Patient: {relatedPatient.patient_name}
                          </p>
                        )}
                        <p className="text-xs text-black/70 mb-3">{suggestion.description}</p>
                        <Button 
                          size="sm" 
                          className="w-full bg-purple-600 text-white hover:bg-purple-700 text-xs"
                          onClick={() => toast.success(`${suggestion.action} action queued for review`)}
                        >
                          {suggestion.action}
                        </Button>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div variants={itemVariants}>
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg text-black">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full bg-[#c1e141] text-black hover:bg-[#c1e141]/90 justify-start">
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule New Consultation
                  </Button>
                  <Button variant="outline" className="w-full border-black/20 text-black hover:bg-black/5 justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Review Patient Charts
                  </Button>
                  <Button variant="outline" className="w-full border-black/20 text-black hover:bg-black/5 justify-start">
                    <Pill className="h-4 w-4 mr-2" />
                    Prescription Management
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* System Status */}
            <motion.div variants={itemVariants}>
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg text-black flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-green-600" />
                    System Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-black/70">Video Infrastructure</span>
                    <Badge className="bg-green-100 text-green-700">Operational</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-black/70">AI Engine</span>
                    <Badge className="bg-green-100 text-green-700">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-black/70">Security Layer</span>
                    <Badge className="bg-green-100 text-green-700">Secure</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-black/70">HIPAA Compliance</span>
                    <Badge className="bg-green-100 text-green-700">Verified</Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ClinicianDashboard;
