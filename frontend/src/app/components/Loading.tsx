const messages = ["Upcoming", "Synchronization", "Data initialization"];

import { useState, useEffect } from 'react';
import Image from 'next/image';

const Loading: React.FC = () => {
  const [currentMessage, setCurrentMessage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage((prevMessage) => (prevMessage + 1) % messages.length);
    }, 1000);

    return () => clearInterval(interval);
  }, []); // No warnings here as `messages` is external

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50">
      {/* Logo and Title Text inline */}
      <div className="flex items-center space-x-2 mb-2">
        <Image src={'/logo.svg'} alt="logo" width={40} height={40} />
        <div className="text-2xl font-semibold text-black">Expense Tracker</div>
      </div>
      <p className="text-sm text-gray-600">by Kelompok 13</p>

      {/* Spinner */}
      <div className="mt-4 animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-600"></div>

      {/* Rotating Loading Messages */}
      <p className="mt-2 text-gray-500">{messages[currentMessage]}</p>
    </div>
  );
};

export default Loading;