import React from "react";
import { FaCoins } from "react-icons/fa";

// Definisikan tipe untuk props AccountCard
interface AccountCardProps {
  type: "Cash" | "Debit Account" | "Credit Account";
  amount: number;
}

const AccountCard: React.FC<AccountCardProps> = ({ type, amount }) => {
  // Tentukan warna berdasarkan tipe akun
  const getBackgroundColor = (): string => {
    switch (type) {
      case "Cash":
        return "#d32f2e"; // Merah
      case "Debit Account":
        return "#1565c0"; // Biru
      case "Credit Account":
        return "#388e3c"; // Hijau
      default:
        return "#fafbfd"; // Default (jika tipe tidak dikenali)
    }
  };

  return (
      <button
        className="flex flex-row items-center rounded-lg p-3 gap-2 w-full hover:opacity-80"
        style={{ backgroundColor: getBackgroundColor() }}
      >
        <div>
          <FaCoins size={24} color="#FFF" />
        </div>
        <div className="flex flex-col">
          <h2 className="text-white">{type}</h2>
          <p className="text-white text-2xl">Rp {amount.toLocaleString("id-ID")}</p>
        </div>
      </button>
  );
};

export default AccountCard;
