import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Activity, 
  Badge, 
  BrainCircuit, // New icon for AI
  MessageSquareQuote, // New icon for Nudges
  Users, // New icon for Community
  ShieldCheck, // New icon for Clinician Connect
  TrendingUp, // New icon for Progress
  HeartHandshake, // New icon for Peer Support
  Star, 
  Stethoscope,
  Lightbulb,
  Heart,
  MapPin,
  Phone,
  Mail,
  Clock
} from "lucide-react";
import Image from "next/image";

export default function Home() {
  return (
    <main className="bg-[#D9E89A] text-black font-sans w-full overflow-hidden">
      {/* --- Hero Section: Predictive Health Insights --- */}
      <section id="home" className="py-20 lg:py-32 bg-gradient-to-br from-background to-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="rounded-full px-4 py-2 bg-[#c1e141]/30 text-black border-[#c1e141]/50">
                  The Future of Chronic Care
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold text-balance leading-tight tracking-tighter">
                  <p className="text-center -mb-20">From Reactive Care</p> <br/> to <span className="text-[#c1e141]">Proactive Well-being</span>
                </h1>
                <div className="flex justify-center">
                <p className="text-xl text-muted-foreground text-pretty max-w-lg text-center">
                  Our AI-powered ecosystem anticipates health risks, provides personalized nudges, and connects you with a supportive community and care team.
                </p></div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="rounded-full bg-black hover:bg-black/90 text-white transition-transform duration-300 hover:scale-105 hover:shadow-lg cursor-pointer">
                  Start Your Health Journey
                </Button>
                <Button size="lg" variant="outline" className="rounded-full bg-transparent border-black/20 hover:bg-black/5 hover:border-black transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer">
                  How It Works
                </Button>
              </div>
              <div className="flex items-center space-x-12 pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#c1e141]">95%</div>
                  <div className="text-sm text-muted-foreground font-medium">Risk Prediction Accuracy</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#c1e141]">2M+</div>
                  <div className="text-sm text-muted-foreground font-medium">Personalized Nudges Sent</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#c1e141]">15K+</div>
                  <div className="text-sm text-muted-foreground font-medium">Community Members</div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* --- Core Features Section --- */}
      <section id="features" className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="secondary" className="rounded-full px-4 py-2">
              Our Ecosystem
            </Badge>
            <h2 className="text-3xl lg:text-5xl font-bold text-balance">A New Era of Co-Managed Health</h2>
            <p className="text-xl text-muted-foreground text-pretty max-w-3xl mx-auto">
              We replace data silos and manual logging with a smart, predictive platform that empowers both patients and clinicians.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: BrainCircuit,
                title: "Predictive Risk Engine",
                description: "Our AI-driven 'Stability Score' forecasts potential health risks before they become critical events.",
              },
              {
                icon: MessageSquareQuote,
                title: "Context-Aware Nudges",
                description: "Receive hyper-personalized prompts on your dashboard to encourage healthier choices in real-time.",
              },
              {
                icon: ShieldCheck,
                title: "Closed-Loop Clinician Connect",
                description: "A secure portal for your doctor with AI-suggested protocols for faster, more effective interventions.",
              },
              {
                icon: HeartHandshake,
                title: "Community & Peer Support",
                description: "Join moderated forums to share coping strategies, success stories, and find emotional support.",
              },
            ].map((feature, index) => (
              <Card key={index} className="group hover:shadow-2xl hover:border-[#c1e141] transition-all duration-300 border-border bg-card">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto bg-[#c1e141]/10 p-4 rounded-full w-fit group-hover:bg-[#c1e141]/20 transition-colors">
                    <feature.icon className="h-8 w-8 text-[#c1e141]" />
                  </div>
                </CardHeader>
                <CardContent className="text-center space-y-2">
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-pretty">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* --- Goal & Progress Dashboard Section --- */}
      <section id="dashboard" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-20">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div>
                    <Badge variant="secondary" className="rounded-full px-4 py-2">
                        Your Journey
                    </Badge>
                    <h2 className="text-3xl lg:text-5xl font-bold text-balance mt-4">Track Your Progress Visually</h2>
                    <p className="text-xl text-muted-foreground text-pretty max-w-lg mt-4">
                        Our interactive dashboard helps you see the bigger picture. Monitor symptom stability, medication adherence, and lifestyle habits with intuitive charts and journey maps.
                    </p>
                    <Button size="lg" className="rounded-full bg-black hover:bg-black/90 text-white mt-8">
                        View Your Dashboard
                    </Button>
                </div>
                <div>
                    <Image
                        src="/OnlineDoctor-bro.png" // Re-using an image, ideally replace with a dashboard screenshot
                        width={500}
                        height={400}
                        alt="A visual dashboard showing health trends and progress"
                        className="mx-auto"
                    />
                </div>
            </div>
        </div>
      </section>

      {/* --- Community & Peer Support Section (formerly Testimonials) --- */}
      <section id="community" className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="secondary" className="rounded-full px-4 py-2">
              Community Hub
            </Badge>
            <h2 className="text-3xl lg:text-5xl font-bold text-balance">You're Not Alone in This Journey</h2>
             <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
                Hear from others who are managing their health with Vital Circle.
             </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Jennifer S.",
                role: "Managing Hypertension for 5 years",
                comment: "The stability score is a game-changer. I feel so much more in control knowing what's ahead. The community forums are my go-to for tips on low-sodium recipes!",
              },
              {
                name: "Robert J.",
                role: "Joined 3 months ago",
                comment: "My doctor and I are finally on the same page. He gets clear summaries, and I get actionable advice without feeling overwhelmed. It's a true partnership.",
              },
              {
                name: "Maria G.",
                role: "Caregiver for a parent with Diabetes",
                comment: "The context-aware nudges help me support my father better. It’s like having a helpful assistant reminding us of small but important daily habits.",
              },
            ].map((testimonial, index) => (
              <Card key={index} className="border-border bg-card cursor-pointer hover:shadow-2xl hover:border-[#c1e141] transition-all duration-300">
                <CardContent className="p-6 space-y-4">
                  <p className="text-muted-foreground text-pretty">"{testimonial.comment}"</p>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-[#c1e141] font-medium">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* --- Contact Section (Remains mostly the same) --- */}
      <section id="contact" className="py-20 bg-muted/30">
          {/* This section can remain as is, as contact information is still relevant */}
          {/* You might want to update the heading to "Connect with Our Team" */}
      </section>
    </main>
  );
}
