"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserAuth } from "@/context/Authcontext";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUpNewUser } = UserAuth(); // Assumes this hook is correctly set up
  const router = useRouter();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(""); // Clear previous errors
    try {
      const result = await signUpNewUser(email, password);
      if (result.success) {
        router.push("/"); // Redirect to home on successful sign-up
      } else {
        setError(result.error?.message || "An unknown error occurred.");
      }
    } catch (err) {
      console.error("Error during sign-up:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-fullantialiased bg-grid-white/[0.02] flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-black border-neutral-800 ">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Create an Account</CardTitle>
          <CardDescription className="text-neutral-400">
            Get started today. It's free.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSignUp}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-neutral-700 focus:ring-white"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-neutral-700 focus:ring-white"
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          </CardContent>
          <CardFooter className="flex flex-col gap-4 mt-5">
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black font-semibold hover:bg-neutral-200"
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </Button>
            <p className="text-sm text-neutral-400">
              Already have an account?{" "}
              <Link href="/sign-in" className="font-semibold text-black hover:underline">
                Sign In
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Signup;
