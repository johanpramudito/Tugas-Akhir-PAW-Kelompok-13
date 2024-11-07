"use client";

import Container from "./components/Container";
import useAutoLogout from "../../hook/useAutoLogout";
import AutoLogoutModal from "./components/AutoLogoutModal";
import { useState, useEffect } from "react";
import Loading from "./components/Loading";

export default function Home() {
  const { showModal, countdown, resetTimer } = useAutoLogout(10 * 60 * 1000); //10 minutes no activity
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
        <Container>Dashboard</Container>
      {showModal && (
            <AutoLogoutModal countdown={countdown} onStaySignedIn={resetTimer} />
          )}
    </div>
  );
}
