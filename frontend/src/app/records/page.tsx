"use client"

import useAutoLogout from "../../../hook/useAutoLogout";
import { useState, useEffect } from "react";
import Loading from "../components/Loading";
import Container from "../components/Container";
import AutoLogoutModal from "../components/AutoLogoutModal";

export default function Records() {
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
          <Container>
            Records
            </Container>
        {showModal && (
              <AutoLogoutModal countdown={countdown} onStaySignedIn={resetTimer} />
            )}
      </div>
    );
  }
  