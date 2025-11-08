"use client";

import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const router = useRouter();
  
  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
      <div className="px-6 py-3 border border-white/30 rounded-full backdrop-blur-xl bg-black/40 shadow-2xl">
        <div className="flex items-center gap-20">
          <span className="font-sans text-white tracking-tighter font-bold">askSUDO</span>
            <div className="flex gap-10">
            <a href="#features" className="text-white/60 hover:text-white transition-colors duration-200 cursor-pointer">Features</a>
            <a href="#pricing" className="text-white/60 hover:text-white transition-colors duration-200 cursor-pointer">Pricing</a>
            <a href="#about" className="text-white/60 hover:text-white transition-colors duration-200 cursor-pointer">About</a>
          </div>
          <Button onClick={() => router.push("/signin")} variant="secondary" size="sm">Get Started</Button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar