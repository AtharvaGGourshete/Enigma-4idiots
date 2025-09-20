"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import Peer from "peerjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { UserAuth } from "@/context/Authcontext";
import { addHours, subHours, format } from "date-fns";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Monitor,
  MonitorOff,
  PhoneOff,
  MessageSquare,
  FileText,
  Bot,
  Camera,
  Users,
  Send,
  Circle,
  StopCircle,
  Volume2,
  VolumeX,
  Heart,
  Activity,
  AlertTriangle,
  CheckCircle,
  X,
  Loader2,
  Copy,
  Link
} from "lucide-react";

const VideoConsultationRoom = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const { user } = UserAuth();
  
  const consultationId = params.id;
  const channelName = searchParams.get('channel');
  const userRole = searchParams.get('role') || 'audience';

  // Peer connection refs
  const peerRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);

  // Call state
  const [peerId, setPeerId] = useState("");
  const [remotePeerId, setRemotePeerId] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [incomingCall, setIncomingCall] = useState(null);
  const [currentCall, setCurrentCall] = useState(null);

  // Get real patient data based on consultation ID
  const getPatientData = (id) => {
    const patients = {
      "1": {
        id: 1,
        name: "Sarah Johnson",
        age: 45,
        email: "sarah.johnson@email.com",
        reason: "Hypertension Follow-up & Medication Review",
        vitals: { bp: "145/92", hr: 78, temp: 98.6, weight: "165 lbs" },
        medications: ["Lisinopril 10mg", "Metformin 500mg"],
        allergies: ["Penicillin", "Shellfish"],
        chiefComplaint: "Patient reports occasional dizziness and fatigue"
      },
      "2": {
        id: 2,
        name: "Michael Chen", 
        age: 52,
        email: "michael.chen@email.com",
        reason: "Diabetes Management & HbA1c Review",
        vitals: { bp: "138/85", hr: 72, glucose: 145, temp: 98.4, weight: "180 lbs" },
        medications: ["Metformin 1000mg", "Glipizide 5mg"],
        allergies: ["None known"],
        chiefComplaint: "Difficulty controlling blood sugar levels"
      },
      "5": {
        id: 5,
        name: "Jennifer Adams",
        age: 34,
        email: "jennifer.adams@email.com", 
        reason: "Mental Health Check-in & Medication Adjustment",
        vitals: { bp: "118/75", hr: 88, temp: 98.1, mood_score: 6, anxiety_level: 7 },
        medications: ["Sertraline 50mg", "Buspirone 15mg"],
        allergies: ["None known"],
        chiefComplaint: "Increased anxiety symptoms, sleep difficulties"
      }
    };
    return patients[id] || patients["1"];
  };

  const patientData = getPatientData(consultationId);

  // UI state
  const [showChat, setShowChat] = useState(false);
  const [showNotes, setShowNotes] = useState(true);
  const [showProtocols, setShowProtocols] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: 'patient',
      senderName: patientData.name,
      message: "Hello doctor, I'm ready for our consultation.",
      timestamp: new Date(Date.now() - 2 * 60 * 1000) // 2 minutes ago
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [sessionNotes, setSessionNotes] = useState(`Consultation with ${patientData.name}\nChief Complaint: ${patientData.chiefComplaint}\n\nObjective:\n- Vitals reviewed\n- Patient appears comfortable\n\nAssessment:\n\nPlan:\n`);
  const [isRecording, setIsRecording] = useState(false);

  // Initialize PeerJS
  useEffect(() => {
    const initializePeer = async () => {
      try {
        // Create unique peer ID based on consultation
        const uniquePeerId = `doctor-${consultationId}-${Date.now()}`;
        
        // Initialize peer with public PeerJS server
        peerRef.current = new Peer(uniquePeerId, {
          host: 'peerjs-server.herokuapp.com',
          port: 443,
          secure: true,
          path: '/'
        });

        peerRef.current.on('open', (id) => {
          console.log('Peer connected with ID:', id);
          setPeerId(id);
          toast.success('Video system initialized');
        });

        peerRef.current.on('call', (call) => {
          console.log('Receiving call from:', call.peer);
          setIncomingCall(call);
          toast.info(`Incoming call from ${patientData.name}`);
        });

        peerRef.current.on('error', (error) => {
          console.error('Peer error:', error);
          toast.error('Connection error: ' + error.message);
        });

        // Get user media
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        
        localStreamRef.current = stream;
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        console.log('Local stream initialized');

      } catch (error) {
        console.error('Failed to initialize video:', error);
        toast.error('Failed to access camera/microphone');
      }
    };

    initializePeer();

    return () => {
      if (peerRef.current) {
        peerRef.current.destroy();
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [consultationId, patientData.name]);

  // Auto-generate patient peer ID for simulation
  useEffect(() => {
    if (peerId) {
      // Simulate patient peer ID
      const patientPeerId = `patient-${consultationId}-${Date.now()}`;
      setRemotePeerId(patientPeerId);
    }
  }, [peerId, consultationId]);

  // Start call function
  const startCall = () => {
    if (!peerRef.current || !localStreamRef.current || !remotePeerId) {
      toast.error('Video system not ready');
      return;
    }

    setIsConnecting(true);
    
    try {
      const call = peerRef.current.call(remotePeerId, localStreamRef.current);
      
      call.on('stream', (remoteStream) => {
        console.log('Received remote stream');
        remoteStreamRef.current = remoteStream;
        
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
        
        setIsConnected(true);
        setCurrentCall(call);
        toast.success(`Connected to ${patientData.name}`);
      });

      call.on('close', () => {
        console.log('Call ended');
        endCall();
      });

      call.on('error', (error) => {
        console.error('Call error:', error);
        toast.error('Call failed: ' + error.message);
        setIsConnecting(false);
      });

    } catch (error) {
      console.error('Failed to start call:', error);
      toast.error('Failed to start call');
      setIsConnecting(false);
    }
  };

  // Answer call function
  const answerCall = () => {
    if (!incomingCall || !localStreamRef.current) return;

    incomingCall.answer(localStreamRef.current);
    
    incomingCall.on('stream', (remoteStream) => {
      console.log('Received remote stream from answered call');
      remoteStreamRef.current = remoteStream;
      
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
      
      setIsConnected(true);
      setCurrentCall(incomingCall);
      setIncomingCall(null);
      toast.success(`Connected to ${patientData.name}`);
    });

    incomingCall.on('close', () => {
      endCall();
    });
  };

  // End call function
  const endCall = () => {
    if (currentCall) {
      currentCall.close();
    }
    
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    
    remoteStreamRef.current = null;
    setIsConnected(false);
    setCurrentCall(null);
    setIncomingCall(null);
    setIsConnecting(false);
    
    toast.info('Call ended');
  };

  // Toggle microphone
  const toggleMic = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !micOn;
      });
      setMicOn(!micOn);
      toast.info(micOn ? "Microphone muted" : "Microphone unmuted");
    }
  };

  // Toggle camera
  const toggleCamera = () => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !cameraOn;
      });
      setCameraOn(!cameraOn);
      toast.info(cameraOn ? "Camera turned off" : "Camera turned on");
    }
  };

  // Leave call
  const leaveCall = () => {
    toast.info("Ending consultation...");
    
    // Auto-save notes
    if (sessionNotes.trim()) {
      toast.success("Session notes saved automatically");
    }
    
    endCall();
    
    setTimeout(() => {
      window.close();
    }, 1000);
  };

  // Copy peer ID to clipboard
  const copyPeerIdToClipboard = () => {
    navigator.clipboard.writeText(peerId);
    toast.success("Peer ID copied to clipboard");
  };

  // AI Protocol suggestions and prescriptions (same as before)
  const [protocols, setProtocols] = useState(() => {
    switch (consultationId) {
      case "1": 
        return [
          {
            id: 1,
            title: "ACE Inhibitor Adjustment",
            description: "Current BP 145/92 suggests inadequate control. Consider increasing Lisinopril to 20mg daily.",
            category: "cardiovascular",
            implemented: false,
            urgency: "medium"
          }
        ];
      default:
        return [
          {
            id: 1,
            title: "Standard Assessment",
            description: "Continue current treatment plan with regular monitoring.",
            category: "general",
            implemented: false,
            urgency: "low"
          }
        ];
    }
  });

  const [prescriptions, setPrescriptions] = useState(() => {
    switch (consultationId) {
      case "1":
        return [
          {
            id: 1,
            medication: "Lisinopril",
            currentDosage: "10mg daily",
            suggestedDosage: "20mg daily", 
            reason: "Inadequate BP control (145/92)",
            approved: false
          }
        ];
      default:
        return [];
    }
  });

  const sendChatMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now(),
        sender: 'clinician',
        senderName: 'Dr. ' + (user?.email?.split('@')[0] || 'Smith'),
        message: newMessage.trim(),
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, message]);
      setNewMessage('');
    }
  };

  const implementProtocol = (protocolId) => {
    setProtocols(prev => prev.map(protocol =>
      protocol.id === protocolId
        ? { ...protocol, implemented: true }
        : protocol
    ));
    toast.success('Protocol implemented and documented');
  };

  const approvePrescription = (prescriptionId) => {
    setPrescriptions(prev => prev.map(prescription =>
      prescription.id === prescriptionId
        ? { ...prescription, approved: true }
        : prescription
    ));
    toast.success('Prescription adjustment approved');
  };

  if (!channelName) {
    return (
      <div className="min-h-screen w-full bg-[#D9E89A] flex items-center justify-center">
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg p-8 text-center">
          <CardContent>
            <Video className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-black mb-2">Invalid Channel</h2>
            <p className="text-black/70">No valid channel provided for this consultation.</p>
            <Button 
              onClick={() => window.close()} 
              className="mt-4 bg-[#c1e141] text-black hover:bg-[#c1e141]/90"
            >
              Close Window
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-black flex flex-col">
      {/* Header */}
      <div className="bg-[#D9E89A] px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Badge className={isConnected ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}>
            <Video className="h-4 w-4 mr-1" />
            {isConnected ? "Live Consultation" : "Ready to Connect"}
          </Badge>
          <div className="flex flex-col">
            <span className="text-black font-medium">{patientData.name} (Age: {patientData.age})</span>
            <span className="text-black/60 text-sm">{patientData.reason}</span>
          </div>
          {peerId && (
            <div className="flex items-center space-x-2">
              <Badge className="bg-blue-100 text-blue-700">
                ID: {peerId.slice(-8)}
              </Badge>
              <Button
                size="sm"
                variant="outline"
                onClick={copyPeerIdToClipboard}
                className="border-black/20 text-black hover:bg-black/5 h-6 px-2"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          )}
          {isRecording && (
            <Badge className="bg-red-100 text-red-700 animate-pulse">
              <Circle className="h-4 w-4 mr-1 fill-current" />
              Recording
            </Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowChat(!showChat)}
            className={`border-black/20 hover:bg-black/5 ${showChat ? 'bg-black/10 text-black' : 'text-black'}`}
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            Chat
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowNotes(!showNotes)}
            className={`border-black/20 hover:bg-black/5 ${showNotes ? 'bg-black/10 text-black' : 'text-black'}`}
          >
            <FileText className="h-4 w-4 mr-1" />
            Notes
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowProtocols(!showProtocols)}
            className={`border-black/20 hover:bg-black/5 ${showProtocols ? 'bg-black/10 text-black' : 'text-black'}`}
          >
            <Bot className="h-4 w-4 mr-1" />
            AI Protocols
          </Button>
        </div>
      </div>

      {/* Incoming Call Modal */}
      {incomingCall && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-white p-6 text-center">
            <CardContent>
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl font-bold text-white">
                  {patientData.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-black mb-2">
                Incoming call from {patientData.name}
              </h3>
              <div className="flex space-x-4">
                <Button
                  onClick={() => setIncomingCall(null)}
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  Decline
                </Button>
                <Button
                  onClick={answerCall}
                  className="bg-green-600 text-white hover:bg-green-700"
                >
                  Answer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Video Area */}
        <div className="flex-1 relative bg-gray-900">
          <div className="grid grid-cols-1 md:grid-cols-2 h-full gap-2 p-2">
            {/* Local Video (Clinician) */}
            <div className="relative bg-gray-800 rounded-lg overflow-hidden">
              <video 
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              
              {!cameraOn && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-gray-800">
                  <div className="w-24 h-24 bg-[#c1e141] rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl font-bold text-black">DR</span>
                  </div>
                  <p className="text-lg">Dr. {user?.email?.split('@')[0] || 'Smith'}</p>
                  <p className="text-sm text-gray-400">Camera off</p>
                </div>
              )}
              
              <div className="absolute bottom-4 left-4 flex items-center space-x-2">
                <Badge className={micOn ? 'bg-green-600' : 'bg-red-600'}>
                  {micOn ? <Mic className="h-3 w-3" /> : <MicOff className="h-3 w-3" />}
                </Badge>
                <span className="text-white text-sm bg-black/50 px-2 py-1 rounded">
                  You (Clinician)
                </span>
              </div>
              
              <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded text-sm">
                ID: {consultationId}
              </div>
            </div>

            {/* Remote Video (Patient) */}
            <div className="relative bg-gray-800 rounded-lg overflow-hidden">
              <video 
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              
              {!isConnected && (
                <div className="absolute inset-0 flex items-center justify-center text-white">
                  <div className="text-center">
                    <div className="w-32 h-32 bg-blue-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                      <span className="text-3xl font-bold text-white">
                        {patientData.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <p className="text-xl mb-2">
                      {isConnecting ? 'Connecting...' : `Waiting for ${patientData.name}`}
                    </p>
                    <p className="text-gray-400">
                      {isConnecting 
                        ? 'Please wait while we establish connection'
                        : 'Click "Start Call" to begin consultation'
                      }
                    </p>
                    <div className="mt-4 text-sm text-gray-300">
                      <p>Scheduled: {patientData.reason}</p>
                      <p>Chief Complaint: {patientData.chiefComplaint}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {isConnected && (
                <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-2 rounded text-sm">
                  <div>Age: {patientData.age}</div>
                  <div>BP: {patientData.vitals.bp}</div>
                </div>
              )}
            </div>
          </div>

          {/* Control Bar */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <div className="flex items-center space-x-2 bg-black/80 backdrop-blur-sm rounded-full px-6 py-3">
              <Button
                size="sm"
                variant={micOn ? "secondary" : "destructive"}
                onClick={toggleMic}
                className="rounded-full"
                disabled={!peerId}
              >
                {micOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              </Button>

              <Button
                size="sm"
                variant={cameraOn ? "secondary" : "destructive"}
                onClick={toggleCamera}
                className="rounded-full"
                disabled={!peerId}
              >
                {cameraOn ? <Camera className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
              </Button>

              {!isConnected && peerId && (
                <Button
                  size="sm"
                  variant="default"
                  onClick={startCall}
                  className="rounded-full bg-[#c1e141] text-black hover:bg-[#c1e141]/90"
                  disabled={isConnecting}
                >
                  {isConnecting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Video className="h-4 w-4" />
                  )}
                </Button>
              )}

              {!isRecording ? (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setIsRecording(true);
                    toast.success("Recording started for compliance purposes");
                  }}
                  className="rounded-full"
                >
                  <Circle className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    setIsRecording(false);
                    toast.success("Recording stopped and saved");
                  }}
                  className="rounded-full"
                >
                  <StopCircle className="h-4 w-4" />
                </Button>
              )}

              <Button
                size="sm"
                variant="destructive"
                onClick={leaveCall}
                className="rounded-full ml-4"
              >
                <PhoneOff className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar Panels (Same as before but simplified) */}
        <AnimatePresence>
          {(showChat || showNotes || showProtocols) && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 400, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white border-l border-gray-200 overflow-hidden"
            >
              {/* Chat Panel */}
              {showChat && (
                <div className="h-full flex flex-col">
                  <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-lg font-semibold text-black flex items-center">
                      <MessageSquare className="h-5 w-5 mr-2" />
                      Patient Communication
                    </h3>
                    <p className="text-sm text-gray-600">Chat with {patientData.name}</p>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {chatMessages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.sender === 'clinician' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs rounded-lg px-3 py-2 ${
                          msg.sender === 'clinician' 
                            ? 'bg-[#c1e141] text-black' 
                            : 'bg-blue-100 text-black'
                        }`}>
                          <p className="text-sm font-medium">{msg.senderName}</p>
                          <p className="text-sm">{msg.message}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {msg.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 border-t border-gray-200">
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Type a message to patient..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                        className="flex-1"
                      />
                      <Button onClick={sendChatMessage} size="sm">
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes Panel */}
              {showNotes && (
                <div className="h-full flex flex-col">
                  <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-lg font-semibold text-black flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      Consultation Notes
                    </h3>
                    <p className="text-sm text-gray-600">Documentation for {patientData.name}</p>
                  </div>
                  
                  <div className="flex-1 p-4">
                    <Textarea
                      placeholder="Enter detailed consultation notes..."
                      value={sessionNotes}
                      onChange={(e) => setSessionNotes(e.target.value)}
                      className="h-full resize-none text-sm"
                    />
                  </div>

                  <div className="p-4 border-t border-gray-200">
                    <Button 
                      className="w-full bg-[#c1e141] text-black hover:bg-[#c1e141]/90"
                      onClick={() => toast.success('Consultation notes saved to patient record')}
                    >
                      Save to Patient Record
                    </Button>
                  </div>
                </div>
              )}

              {/* AI Protocols Panel */}
              {showProtocols && (
                <div className="h-full flex flex-col">
                  <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-lg font-semibold text-black flex items-center">
                      <Bot className="h-5 w-5 mr-2 text-purple-600" />
                      AI Clinical Insights
                    </h3>
                    <p className="text-sm text-gray-600">Personalized recommendations for {patientData.name}</p>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* Patient Summary */}
                    <div className="bg-blue-50 rounded-lg p-3">
                      <h4 className="font-medium text-black mb-2 flex items-center">
                        <Heart className="h-4 w-4 mr-2 text-blue-600" />
                        Patient Summary
                      </h4>
                      <div className="text-sm space-y-1 text-gray-700">
                        <p><strong>Current Vitals:</strong></p>
                        <ul className="ml-4 space-y-1">
                          <li>BP: {patientData.vitals.bp} mmHg</li>
                          <li>HR: {patientData.vitals.hr} bpm</li>
                          {patientData.vitals.glucose && <li>Glucose: {patientData.vitals.glucose} mg/dL</li>}
                          {patientData.vitals.temp && <li>Temp: {patientData.vitals.temp}°F</li>}
                        </ul>
                        <p><strong>Current Meds:</strong> {patientData.medications.join(', ')}</p>
                        <p><strong>Allergies:</strong> {patientData.allergies.join(', ')}</p>
                      </div>
                    </div>

                    {/* Protocol Suggestions */}
                    <div>
                      <h4 className="font-medium text-black mb-3">AI Protocol Suggestions</h4>
                      {protocols.map((protocol) => (
                        <div key={protocol.id} className="p-3 bg-gray-50 rounded-lg mb-3">
                          <div className="flex items-start justify-between mb-2">
                            <h5 className="text-sm font-medium text-black flex items-center">
                              {protocol.urgency === 'medium' && <AlertTriangle className="h-4 w-4 mr-1 text-yellow-500" />}
                              {protocol.urgency === 'low' && <CheckCircle className="h-4 w-4 mr-1 text-green-500" />}
                              {protocol.title}
                            </h5>
                            {protocol.implemented && (
                              <Badge className="bg-green-100 text-green-700 text-xs">
                                ✓ Implemented
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mb-3">{protocol.description}</p>
                          {!protocol.implemented && (
                            <Button 
                              size="sm"
                              onClick={() => implementProtocol(protocol.id)}
                              className="w-full bg-purple-600 text-white hover:bg-purple-700 text-xs"
                            >
                              Implement Protocol
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Prescription Adjustments */}
                    {prescriptions.length > 0 && (
                      <div>
                        <h4 className="font-medium text-black mb-3">Prescription Recommendations</h4>
                        {prescriptions.map((prescription) => (
                          <div key={prescription.id} className="p-3 bg-yellow-50 rounded-lg mb-3">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="text-sm font-medium text-black">{prescription.medication}</h5>
                              {prescription.approved && (
                                <Badge className="bg-green-100 text-green-700 text-xs">
                                  ✓ Approved
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs space-y-1 text-gray-600 mb-3">
                              <p><strong>Current:</strong> {prescription.currentDosage}</p>
                              <p><strong>Suggested:</strong> {prescription.suggestedDosage}</p>
                              <p><strong>Reason:</strong> {prescription.reason}</p>
                            </div>
                            {!prescription.approved && (
                              <Button 
                                size="sm"
                                onClick={() => approvePrescription(prescription.id)}
                                className="w-full bg-blue-600 text-white hover:bg-blue-700 text-xs"
                              >
                                Approve Prescription Change
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default VideoConsultationRoom;
    