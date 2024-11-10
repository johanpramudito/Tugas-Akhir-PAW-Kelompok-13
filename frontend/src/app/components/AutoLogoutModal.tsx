// components/AutoLogoutModal.tsx
"use client";

import React from "react";
import { signOut } from "next-auth/react";

interface AutoLogoutModalProps {
  countdown: number;
  onStaySignedIn: () => void;
}

const AutoLogoutModal: React.FC<AutoLogoutModalProps> = ({
  countdown,
  onStaySignedIn,
}) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-200 bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg text-center">
        <h2 className="text-lg font-semibold">Automatic Logout in...</h2>
        <p className="text-3xl font-bold my-4">{`${Math.floor(
          countdown / 60
        )}:${String(countdown % 60).padStart(2, "0")}`}</p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => signOut()}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Log Out
          </button>
          <button
            onClick={onStaySignedIn} // Only reset timer when this button is clicked
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Stay signed in
          </button>
        </div>
      </div>
    </div>
  );
};

export default AutoLogoutModal;
