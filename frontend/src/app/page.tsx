"use client";

import Container from "./components/Container";
import { useState, useEffect } from "react";
import Loading from "./components/Loading";

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
        <Container>
          Landing Page
          </Container>
    </div>
  );
}
