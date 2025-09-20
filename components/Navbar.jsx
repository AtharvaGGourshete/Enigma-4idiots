  "use client";

  import React, { useEffect, useState } from "react";
  import Link from "next/link";
  import { useRouter } from "next/navigation";
  import { motion } from "framer-motion";
  import { toast } from "sonner";
  import { Button } from "@/components/ui/button";
  import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
  } from "@/components/ui/dropdown-menu";
  import { Badge } from "@/components/ui/badge";
  import { UserAuth } from "@/context/Authcontext";
  import { 
    User, 
    LogOut, 
    Settings, 
    Heart,
    Menu,
    X,
    Activity
  } from "lucide-react";

  const navVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const logoVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        delay: 0.2,
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const Navbar = () => {
    const { user, signOut } = UserAuth();
    const router = useRouter();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
      const handleScroll = () => {
        setIsScrolled(window.scrollY > 20);
      };

      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleSignOut = async () => {
      try {
        await signOut();
        toast.success("Signed out successfully");
        router.push("/sign-in");
      } catch (error) {
        toast.error("Error signing out");
      }
    };

    const navigationLinks = [
      { href: "/#home", label: "Home" },
      { href: "/#services", label: "Services" },
      { href: "/#doctors", label: "Doctors" },
      { href: "/#contact", label: "Contact" },
    ];

    return (
      <>
        <motion.nav
          variants={navVariants}
          initial="hidden"
          animate="visible"
          className={`fixed w-full z-50 transition-all duration-300 `}
        >
          <div className=" mx-auto px-4 sm:px-6 lg:px-8 mb-20">
            <motion.div 
              className={`
                flex justify-between items-center transition-all duration-300
                ${isScrolled 
                  ? "bg-white/95 backdrop-blur-md shadow-lg border border-black/10"   
                  : "bg-white/80 backdrop-blur-sm border border-black/5"
                }
                rounded-b-2xl px-6 py-3 
              `}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              {/* Logo */}
              <motion.div 
                variants={logoVariants}
                className="flex items-center space-x-2"
              >
                <div className="flex items-center justify-center w-10 h-10 bg-[#c1e141] rounded-full">
                  <Heart className="h-5 w-5 text-black" />
                </div>
                <Link href="/" className="text-xl lg:text-2xl font-bold text-black tracking-wide hover:text-[#c1e141] transition-colors duration-200">
                  Vital Circle
                </Link>
              </motion.div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-8">
                {navigationLinks.map((link, index) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index, duration: 0.3 }}
                  >
                    <Link
                      href={link.href}
                      className="text-black/80 hover:text-black font-medium transition-colors duration-200 relative group"
                    >
                      {link.label}
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#c1e141] transition-all duration-300 group-hover:w-full"></span>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* User Actions */}
              <div className="flex items-center space-x-4">
                {user ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.3 }}
                    className="flex items-center space-x-3"
                  >
                    {/* Health Status Badge */}
                    <Badge 
                      variant="secondary" 
                      className="hidden sm:flex bg-[#c1e141]/20 text-black border-[#c1e141]/30 hover:bg-[#c1e141]/30 transition-colors"
                    >
                      <Activity className="h-3 w-3 mr-1" />
                      Active
                    </Badge>

                    {/* User Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Avatar className="cursor-pointer border-2 border-[#c1e141]/30 hover:border-[#c1e141] transition-colors">
                            <AvatarImage 
                              src={user.user_metadata?.avatar_url || ""} 
                              alt={user.email}
                            />
                            <AvatarFallback className="bg-[#c1e141] text-black font-semibold">
                              {user.email?.[0]?.toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                        </motion.div>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent 
                        align="end" 
                        className="w-56 bg-white/95 backdrop-blur-sm border-black/10 shadow-xl"
                      >
                        <div className="px-3 py-2">
                          <p className="text-sm font-medium text-black">Signed in as</p>
                          <p className="text-xs text-black/60 truncate">{user.email}</p>
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => router.push("/update-metrics")}
                          className="cursor-pointer hover:bg-[#c1e141]/10 text-black"
                        >
                          <User className="mr-2 h-4 w-4" />
                          Update metrics
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => router.push("/profile")}
                          className="cursor-pointer hover:bg-[#c1e141]/10 text-black"
                        >
                          <User className="mr-2 h-4 w-4" />
                          Edit Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => router.push("/settings")}
                          className="cursor-pointer hover:bg-[#c1e141]/10 text-black"
                        >
                          <Settings className="mr-2 h-4 w-4" />
                          Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={handleSignOut}
                          className="cursor-pointer hover:bg-red-50 text-red-600 focus:bg-red-50 focus:text-red-600"
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Sign Out
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4, duration: 0.3 }}
                    className="flex items-center space-x-3"
                  >
                    <Link href="/signin">
                      <Button 
                        variant="ghost" 
                        className="text-black hover:bg-black/5 font-medium"
                      >
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/sign-up">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button className="bg-black text-white font-semibold hover:bg-black/90 rounded-full px-6 shadow-lg hover:shadow-xl transition-all duration-300">
                          Get Started
                        </Button>
                      </motion.div>
                    </Link>
                  </motion.div>
                )}

                {/* Mobile Menu Button */}
                <div className="md:hidden">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 text-black hover:bg-black/5 rounded-lg transition-colors"
                  >
                    {isMobileMenuOpen ? (
                      <X className="h-5 w-5" />
                    ) : (
                      <Menu className="h-5 w-5" />
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Mobile Menu */}
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ 
              opacity: isMobileMenuOpen ? 1 : 0, 
              height: isMobileMenuOpen ? "auto" : 0 
            }}
            transition={{ duration: 0.3 }}
            className="md:hidden overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-2">
              <div className="bg-white/95 backdrop-blur-md border border-black/10 rounded-2xl p-4 shadow-lg">
                <div className="flex flex-col space-y-3">
                  {navigationLinks.map((link, index) => (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index, duration: 0.3 }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block py-2 px-3 text-black hover:bg-[#c1e141]/10 rounded-lg font-medium transition-colors"
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  ))}
                  
                  {!user && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4, duration: 0.3 }}
                      className="pt-3 border-t border-black/10 space-y-2"
                    >
                      <Link href="/sign-in" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start text-black hover:bg-black/5">
                          Sign In
                        </Button>
                      </Link>
                      <Link href="/sign-up" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button className="w-full bg-black text-white hover:bg-black/90">
                          Get Started
                        </Button>
                      </Link>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.nav>

        {/* Spacer to prevent content from being hidden behind fixed navbar */}     
      </>
    );
  };

  export default Navbar;
