"use client";

import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const router = useRouter();
  
  return (
    <header>
        <nav className="flex gap-10">
            <p>askSudo</p>
            <Button onClick={() => router.push("/login")}>Log In</Button>
            <Button onClick={() => router.push("/signin")}>Sign In</Button>
        </nav>
    </header>
  )
}

export default Navbar