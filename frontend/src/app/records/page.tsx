"use client";

import { useState, useEffect } from "react";
import AddRecordModal from "../components/dashboard/AddRecord";

const categories = [
  "All Categories",
  "Food & Beverages",
  "Shopping",
  "Housing",
  "Transport",
  "Entertainment",
  "Recreation",
  "Income",
  "Transfer",
];

const accounts = ["All Accounts", "Cash", "Debit Card", "Credit Card"];
const predefinedRanges = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
  { label: "Last 12 months", months: 12 },
  { label: "Today", today: true },
  { label: "This week", week: true },
  { label: "This month", month: true },
  { label: "This year", year: true },
  { label: "All Dates", all: true },
];

const getDisplayDate = (selectedRange, isCustomRange, dateRange) => {
  if (!isCustomRange) {
    return selectedRange;
  }
  const startDate = new Date(dateRange.start).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const endDate = new Date(dateRange.end).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  return `${startDate} - ${endDate}`;
};

export default function RecordsDashboard() {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState("All Accounts");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [sortOption, setSortOption] = useState("Time (newest first)");
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [selectedRange, setSelectedRange] = useState("All Dates");
  const [isCustomRange, setIsCustomRange] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAddRecordModal, setShowAddRecordModal] = useState(false);

  useEffect(() => {
    const dummyData = [
      {
        id: "1",
        accountFrom: "Cash", // Tambahkan accountFrom
        category: "Food & Beverages",
        amount: -2135.0,
        date: new Date("2024-11-22"),
      },
      {
        id: "2",
        account: "Debit Card",
        category: "Shopping",
        amount: -1200.0,
        date: new Date("2024-11-11"),
      },
      {
        id: "3",
        account: "Credit Card",
        category: "Transport",
        amount: -500.0,
        date: new Date("2024-11-15"),
      },
      {
        id: "4",
        account: "Cash",
        category: "Housing",
        amount: -8000.0,
        date: new Date("2024-10-01"),
      },
      {
        id: "5",
        account: "Debit Card",
        category: "Entertainment",
        amount: -150.0,
        date: new Date("2024-09-20"),
      },
      {
        id: "6",
        account: "Credit Card",
        category: "Recreation",
        amount: -200.0,
        date: new Date("2024-09-15"),
      },
      {
        id: "7",
        account: "Cash",
        category: "Shopping",
        amount: -300.0,
        date: new Date("2024-08-18"),
      },
      {
        id: "8",
        account: "Debit Card",
        category: "Transport",
        amount: -100.0,
        date: new Date("2024-07-12"),
      },
      {
        id: "9",
        account: "Credit Card",
        category: "Food & Beverages",
        amount: -500.0,
        date: new Date("2024-07-05"),
      },
      {
        id: "10",
        account: "Cash",
        category: "Entertainment",
        amount: -75.0,
        date: new Date("2024-06-25"),
      },
      {
        id: "11",
        account: "Debit Card",
        category: "Recreation",
        amount: -220.0,
        date: new Date("2024-06-18"),
      },
      {
        id: "12",
        account: "Credit Card",
        category: "Housing",
        amount: -7500.0,
        date: new Date("2024-05-10"),
      },
      {
        id: "13",
        account: "Cash",
        category: "Shopping",
        amount: -600.0,
        date: new Date("2024-05-08"),
      },
      {
        id: "14",
        account: "Debit Card",
        category: "Food & Beverages",
        amount: -300.0,
        date: new Date("2024-04-22"),
      },
      {
        id: "15",
        account: "Credit Card",
        category: "Transport",
        amount: -120.0,
        date: new Date("2024-04-15"),
      },
      {
        id: "16",
        account: "Cash",
        category: "Entertainment",
        amount: -90.0,
        date: new Date("2024-03-05"),
      },
      {
        id: "17",
        account: "Debit Card",
        category: "Recreation",
        amount: -140.0,
        date: new Date("2024-03-02"),
      },
      {
        id: "18",
        account: "Credit Card",
        category: "Housing",
        amount: -8800.0,
        date: new Date("2024-02-20"),
      },
      {
        id: "19",
        account: "Cash",
        category: "Transport",
        amount: -50.0,
        date: new Date("2024-02-10"),
      },
      {
        id: "20",
        account: "Debit Card",
        category: "Shopping",
        amount: -250.0,
        date: new Date("2024-01-25"),
      },
    ];

    setTimeout(() => {
      setTransactions(dummyData);
      setFilteredTransactions(dummyData);
      setLoading(false);
    }, 1000);
  }, []);

  const applyFilters = () => {
    let filtered = transactions;

    if (selectedAccount !== "All Accounts") {
      filtered = filtered.filter(
        (transaction) => transaction.account === selectedAccount
      );
    }

    if (selectedCategory !== "All Categories") {
      filtered = filtered.filter(
        (transaction) => transaction.category === selectedCategory
      );
    }

    if (dateRange.start && dateRange.end) {
      filtered = filtered.filter(
        (transaction) =>
          transaction.date >= new Date(dateRange.start) &&
          transaction.date <= new Date(dateRange.end)
      );
    }

    if (sortOption === "Time (newest first)") {
      filtered.sort((a, b) => b.date - a.date);
    } else if (sortOption === "Time (oldest first)") {
      filtered.sort((a, b) => a.date - b.date);
    } else if (sortOption === "Amount (lowest first)") {
      filtered.sort((a, b) => Math.abs(a.amount) - Math.abs(b.amount));
    } else if (sortOption === "Amount (highest first)") {
      filtered.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));
    }

    setFilteredTransactions(filtered);
  };

  const handlePredefinedRange = (range) => {
    setIsCustomRange(false);
    setSelectedRange(range.label);

    if (range.all) {
      setDateRange({ start: "", end: "" });
    } else {
      const now = new Date();
      let start, end;

      if (range.days) {
        start = new Date();
        start.setDate(now.getDate() - range.days);
        end = now;
      } else if (range.today) {
        start = end = now;
      } else if (range.week) {
        start = new Date();
        start.setDate(now.getDate() - now.getDay());
        end = now;
      } else if (range.month) {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = now;
      } else if (range.year) {
        start = new Date(now.getFullYear(), 0, 1);
        end = now;
      } else if (range.months) {
        start = new Date();
        start.setMonth(now.getMonth() - range.months);
        end = now;
      }

      setDateRange({
        start: start.toISOString().split("T")[0],
        end: end.toISOString().split("T")[0],
      });
    }

    setShowDateFilter(false);
    applyFilters();
  };

  const handleCustomRange = () => {
    if (dateRange.start && dateRange.end) {
      setIsCustomRange(true);
      setSelectedRange("Custom Range");
      setShowDateFilter(false);
      applyFilters();
    }
  };

  const handleAccountFilter = (account) => {
    setSelectedAccount(account);
    applyFilters();
  };

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
    applyFilters();
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const getCategoryEmoji = (category) => {
    switch (category) {
      case "Food & Beverages":
        return "🍔";
      case "Shopping":
        return "🛍️";
      case "Housing":
        return "🏠";
      case "Transport":
        return "🚗";
      case "Entertainment":
        return "🎮";
      case "Recreation":
        return "🏞️";
      default:
        return "📂";
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <aside className="w-1/4 bg-white shadow-md p-4">
        <h2 className="text-lg font-bold mb-4">Records</h2>
        <button
          className="bg-green-500 text-white w-full py-2 px-4 rounded mb-4 hover:bg-green-600"
          onClick={() => setShowAddRecordModal(true)} // Buka modal ketika tombol diklik
        >
          + Add
        </button>
        <div className="mb-6">
          <h3 className="font-bold mb-2">ACCOUNTS</h3>
          <ul>
            {accounts.map((account, index) => (
              <li
                key={index}
                onClick={() => handleAccountFilter(account)}
                className={`mb-2 text-gray-700 cursor-pointer hover:underline ${
                  selectedAccount === account ? "font-bold text-blue-500" : ""
                }`}
              >
                {account}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-bold mb-2">CATEGORIES</h3>
          <ul>
            {categories.map((category, index) => (
              <li
                key={index}
                onClick={() => handleCategoryFilter(category)}
                className={`mb-2 text-gray-700 cursor-pointer hover:underline ${
                  selectedCategory === category ? "font-bold text-blue-500" : ""
                }`}
              >
                {category}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Add Record Modal */}
      <AddRecordModal
        isOpen={showAddRecordModal} // Properti untuk membuka modal
        onClose={() => setShowAddRecordModal(false)} // Fungsi untuk menutup modal
        onSave={(newRecord) => {
          const formattedRecord = {
            ...newRecord,
            accountFrom: newRecord.accountFrom || null,
            accountTo: newRecord.accountTo || "No Account Specified", // Pastikan accountTo memiliki nilai
            date: new Date(newRecord.date).toISOString(),
          };

          setTransactions([...transactions, formattedRecord]);
          setFilteredTransactions([...filteredTransactions, formattedRecord]);
          applyFilters();
        }}
        accounts={accounts} // Kirim daftar akun
        categories={categories} // Kirim daftar kategori
      />

      <main className="flex-grow flex flex-col">
        <div className="p-6 shadow-md bg-white">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-lg font-bold">Records</h1>
            <div className="flex items-center space-x-8">
              <div className="relative">
                <button
                  onClick={() => setShowDateFilter(!showDateFilter)}
                  className="h-10 px-4 border rounded bg-gray-200 hover:bg-gray-300 w-48 flex items-center justify-center overflow-hidden whitespace-nowrap"
                >
                  <span className="truncate">
                    {getDisplayDate(selectedRange, isCustomRange, dateRange)}
                  </span>
                </button>

                {showDateFilter && (
                  <div className="absolute right-0 mt-2 bg-white shadow-lg p-4 rounded w-72 z-10">
                    <h3 className="font-bold mb-2">Range</h3>
                    {predefinedRanges.map((range, index) => (
                      <div key={index} className="mb-2">
                        <label className="cursor-pointer flex items-center">
                          <input
                            type="radio"
                            name="dateRange"
                            checked={selectedRange === range.label}
                            className="mr-2"
                            onChange={() => handlePredefinedRange(range)}
                          />
                          <span className="truncate">{range.label}</span>
                        </label>
                      </div>
                    ))}
                    <div className="mt-4">
                      <h3 className="font-bold mb-2">Custom Range</h3>
                      <div className="flex flex-col space-y-2">
                        <input
                          type="date"
                          value={dateRange.start}
                          onChange={(e) =>
                            setDateRange((prev) => ({
                              ...prev,
                              start: e.target.value,
                            }))
                          }
                          className="p-2 border rounded"
                        />
                        <input
                          type="date"
                          value={dateRange.end}
                          onChange={(e) =>
                            setDateRange((prev) => ({
                              ...prev,
                              end: e.target.value,
                            }))
                          }
                          className="p-2 border rounded"
                        />
                      </div>
                      <button
                        onClick={handleCustomRange}
                        className="bg-blue-500 text-white py-2 px-4 rounded mt-4 hover:bg-blue-600 w-full"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <select
                value={sortOption}
                onChange={(e) => {
                  setSortOption(e.target.value);
                  applyFilters();
                }}
                className="h-10 px-4 border rounded"
              >
                <option>Time (newest first)</option>
                <option>Time (oldest first)</option>
                <option>Amount (lowest first)</option>
                <option>Amount (highest first)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex-grow p-6 overflow-y-auto">
          {filteredTransactions.length > 0 ? (
            filteredTransactions
              .flatMap((transaction) => {
                if (transaction.type === "transfer") {
                  return [
                    /* Pengirim */
                    {
                      id: `${transaction.id}-from`,
                      type: "transfer",
                      direction: "out", // Arah keluar
                      account: transaction.accountFrom,
                      amount: -transaction.amount,
                      category: "Transfer",
                      date: transaction.date,
                    },
                    /* Penerima */
                    {
                      id: `${transaction.id}-to`,
                      type: "transfer",
                      direction: "in", // Arah masuk
                      account: transaction.accountTo,
                      amount: transaction.amount,
                      category: "Transfer",
                      date: transaction.date,
                    },
                  ];
                }
                return [transaction];
              })
              .map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex justify-between items-center bg-white p-4 mb-4 rounded shadow"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-4">
                      <span className="text-red-500 text-lg">
                        {getCategoryEmoji(transaction.category)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-700">
                        {transaction.category}
                      </h3>
                      {transaction.notes && (
                        <p className="text-sm text-gray-500 italic">
                          Note: {transaction.notes}
                        </p>
                      )}
                      <p className="text-sm text-gray-500">
                        {transaction.date
                          ? new Intl.DateTimeFormat("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: false,
                            }).format(new Date(transaction.date))
                          : "No Date Available"}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-gray-700">
                      <strong>Account:</strong> {transaction.account}
                    </p>
                    <div
                      className={`font-bold ${
                        transaction.type === "income"
                          ? "text-green-500"
                          : transaction.type === "expense"
                          ? "text-red-500"
                          : ""
                      }`}
                    >
                      {transaction.type === "income"
                        ? "+"
                        : transaction.type === "expense"
                        ? "-"
                        : ""}
                      IDR {Math.abs(transaction.amount).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
          ) : (
            <p className="text-gray-500 text-center">No transactions found.</p>
          )}
        </div>
      </main>
    </div>
  );
}
