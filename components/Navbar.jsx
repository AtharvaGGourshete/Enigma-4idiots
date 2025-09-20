"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAuth } from "@/context/Authcontext";

const Navbar = () => {
  const { user, signOut } = UserAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/sign-in");
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-30 flex justify-between items-center p-6 backdrop-blur-sm text-black">
      <div className="text-2xl font-bold text-black tracking-wider ml-4">
        <Link href="/">Vital Circle</Link>
      </div>

      {/* <div className="hidden md:flex items-center gap-6 text-black">
        <Link href="/features" className="hover:text-white transition-colors">
          Features
        </Link>
        <Link href="/pricing" className="hover:text-white transition-colors">
          Pricing
        </Link>
        <Link href="/about" className="hover:text-white transition-colors">
          About
        </Link>
      </div> */}

      <div className="mr-4">
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar className="cursor-pointer">
                <AvatarImage src={user.user_metadata?.avatar_url || ""} />
                <AvatarFallback>
                  {user.email?.[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => router.push("/profile")}>
                Edit Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSignOut}>
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link href="/sign-up">
            <Button className="cursor-pointer bg-white text-black font-semibold hover:bg-neutral-200 border-0">
              Sign Up
            </Button>
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
