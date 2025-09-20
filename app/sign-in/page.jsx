"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserAuth } from "@/context/Authcontext";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

const Signin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signInUser } = UserAuth();
  const router = useRouter();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signInUser(email, password);
      if (result.success) {
        toast.success("Welcome back! 👋");
        router.push("/");
      } else {
        toast.error(result.error?.message || "Invalid credentials. Please try again.");
      }
    } catch (err) {
      console.error("Error during sign-in:", err);
      toast.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#D9E89A] flex items-center justify-center p-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div variants={itemVariants}>
            <Badge variant="secondary" className="rounded-full px-4 py-2 bg-white/20 text-black border-none mb-4">
              Welcome Back
            </Badge>
          </motion.div>
          <motion.h1 
            variants={itemVariants}
            className="text-3xl lg:text-4xl font-bold text-black mb-2"
          >
            Sign In
          </motion.h1>
          <motion.p 
            variants={itemVariants}
            className="text-black/70 text-lg"
          >
            Access your health dashboard
          </motion.p>
        </div>

        <motion.div
          variants={itemVariants}
          whileHover={{ y: -5 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-xl">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-bold text-center text-black">Welcome Back</CardTitle>
              <CardDescription className="text-center text-black/60">
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSignIn}>
              <CardContent className="space-y-4">
                <motion.div 
                  variants={itemVariants}
                  className="space-y-2"
                >
                  <Label htmlFor="email" className="text-black font-medium">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-black/50" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-white/50 border-black/20 focus:border-[#c1e141] focus:ring-[#c1e141] text-black placeholder:text-black/50"
                      required
                    />
                  </div>
                </motion.div>

                <motion.div 
                  variants={itemVariants}
                  className="space-y-2"
                >
                  <Label htmlFor="password" className="text-black font-medium">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-black/50" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 bg-white/50 border-black/20 focus:border-[#c1e141] focus:ring-[#c1e141] text-black placeholder:text-black/50"
                      required
                    />
                  </div>
                </motion.div>

                <div className="text-right">
                  <Link
                    href="/forgot-password"
                    className="text-sm text-black/60 hover:text-black transition-colors duration-200 underline underline-offset-4"
                  >
                    Forgot password?
                  </Link>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col space-y-4 pt-6">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full"
                >
                  <Button
                    type="submit"
                    className="w-full bg-black hover:bg-black/90 text-white font-semibold py-3 rounded-lg transition-all duration-300 hover:shadow-lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </motion.div>

                <div className="text-center text-sm">
                  <span className="text-black/60">Don't have an account? </span>
                  <Link
                    href="/sign-up"
                    className="font-medium text-black hover:text-[#c1e141] transition-colors duration-200 underline underline-offset-4"
                  >
                    Sign up here
                  </Link>
                </div>
              </CardFooter>
            </form>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Signin;
