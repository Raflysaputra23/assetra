"use client"

import SplashScreen from "@/components/SplashScreen";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { loading, session } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if(loading) { 
      if(session) {
        router.push("/dashboard"); 
      } else {
        router.push("/auth");
      }
    }
  }, [router, loading, session]);


  return <SplashScreen duration={10000} />;
}
