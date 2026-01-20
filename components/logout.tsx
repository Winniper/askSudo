"use client";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";

const LogOut = () => {
    const router = useRouter();

    const handleOnclick = () => {
        signOut().then(() => {
            router.push("/");
        });
    }
  return (
    <Button onClick={handleOnclick}>LogOut</Button>
  )
}

export default LogOut