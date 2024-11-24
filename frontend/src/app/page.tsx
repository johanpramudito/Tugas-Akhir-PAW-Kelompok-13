"use client";

import { useState, useEffect } from "react";
import Loading from "./components/Loading";
import Hero from "./components/Hero";

export default function Home() {
  const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      // Set loading to false after the component mounts
      setLoading(false);
    }, []);
  
    if (loading) {
      return <Loading />; // Show loading screen while loading is true
    }



return (
    <div>
          <Hero/>
    </div>
  );
}
