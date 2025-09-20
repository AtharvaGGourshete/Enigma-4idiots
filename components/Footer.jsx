import React from 'react';
import Link from 'next/link';
import { HeartHandshake, Twitter, Linkedin, Github } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-black text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Brand & Mission */}
          <div className="space-y-4 md:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-10 h-10 bg-[#c1e141] rounded-full">
                <HeartHandshake className="h-5 w-5 text-black" />
              </div>
              <span className="text-2xl font-bold text-white tracking-wide">
                Vital Circle
              </span>
            </Link>
            <p className="text-neutral-400 text-pretty">
              A predictive ecosystem for proactive health management. We leverage AI to empower patients and clinicians in the journey against chronic conditions.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg tracking-wider text-neutral-300">Platform</h3>
            <ul className="space-y-3">
              <li><Link href="/#features" className="text-neutral-400 hover:text-[#c1e141] hover:underline transition-colors">Features</Link></li>
              <li><Link href="/#dashboard" className="text-neutral-400 hover:text-[#c1e141] hover:underline transition-colors">Dashboard</Link></li>
              <li><Link href="/#community" className="text-neutral-400 hover:text-[#c1e141] hover:underline transition-colors">Community</Link></li>
              <li><Link href="/onboarding" className="text-neutral-400 hover:text-[#c1e141] hover:underline transition-colors">Get Started</Link></li>
            </ul>
          </div>

          {/* Support Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg tracking-wider text-neutral-300">Support</h3>
            <ul className="space-y-3">
              <li><Link href="/#contact" className="text-neutral-400 hover:text-[#c1e141] hover:underline transition-colors">Contact Us</Link></li>
              <li><Link href="/faq" className="text-neutral-400 hover:text-[#c1e141] hover:underline transition-colors">FAQ</Link></li>
              <li><Link href="/clinicians" className="text-neutral-400 hover:text-[#c1e141] hover:underline transition-colors">For Clinicians</Link></li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg tracking-wider text-neutral-300">Legal</h3>
            <ul className="space-y-3">
              <li><Link href="/privacy-policy" className="text-neutral-400 hover:text-[#c1e141] hover:underline transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms-of-service" className="text-neutral-400 hover:text-[#c1e141] hover:underline transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-12 pt-8 border-t border-neutral-800 text-center text-xs text-neutral-500">
          <p>
            The information provided by Vital Circle is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
          </p>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-neutral-900/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <p className="text-sm text-neutral-500">
            © {new Date().getFullYear()} Vital Circle. All Rights Reserved.
          </p>
          <div className="flex items-center space-x-6">
            <a href="#" aria-label="Twitter" className="text-neutral-500 hover:text-[#c1e141] transition-colors">
              <Twitter className="h-5 w-5" />
            </a>
            <a href="#" aria-label="LinkedIn" className="text-neutral-500 hover:text-[#c1e141] transition-colors">
              <Linkedin className="h-5 w-5" />
            </a>
            <a href="#" aria-label="GitHub" className="text-neutral-500 hover:text-[#c1e141] transition-colors">
              <Github className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
