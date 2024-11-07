"use client";

import { useEffect, useState, useRef } from "react";
import { signOut } from "next-auth/react";

const useAutoLogout = (timeout: number) => {
  const [showModal, setShowModal] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const countdownInterval = useRef<NodeJS.Timeout | null>(null);
  const inactivityTimeout = useRef<NodeJS.Timeout | null>(null);
  const modalVisible = useRef(false); // Ref to track modal visibility

  const clearTimers = () => {
    if (countdownInterval.current) {
      clearInterval(countdownInterval.current);
      countdownInterval.current = null;
    }
    if (inactivityTimeout.current) {
      clearTimeout(inactivityTimeout.current);
      inactivityTimeout.current = null;
    }
  };

  const resetTimer = () => {
    setShowModal(false);
    setCountdown(0);
    modalVisible.current = false; 
    clearTimers();
    startInactivityTimer();
  };

  const startCountdown = () => {
    setCountdown(120); 
    countdownInterval.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearTimers();
          signOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startInactivityTimer = () => {
    clearTimers();

    inactivityTimeout.current = setTimeout(() => {
      setShowModal(true);
      modalVisible.current = true; // Set modal visibility in ref
      startCountdown();
    }, timeout);
  };

  const handleUserActivity = () => {
    if (modalVisible.current) return; // Don't reset if modal is showing
    resetTimer();
  };

  useEffect(() => {
    startInactivityTimer();

    window.addEventListener("mousemove", handleUserActivity);
    window.addEventListener("keydown", handleUserActivity);
    window.addEventListener("scroll", handleUserActivity);
    window.addEventListener("click", handleUserActivity);

    return () => {
      window.removeEventListener("mousemove", handleUserActivity);
      window.removeEventListener("keydown", handleUserActivity);
      window.removeEventListener("scroll", handleUserActivity);
      window.removeEventListener("click", handleUserActivity);
      clearTimers();
    };
  }, []); // Empty dependency array to run once when component mounts

  return { showModal, countdown, resetTimer };
};

export default useAutoLogout;
