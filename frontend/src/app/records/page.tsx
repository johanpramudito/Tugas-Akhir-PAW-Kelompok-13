"use client";

import { useState, useEffect } from "react";
import { Pencil, Trash2 } from "lucide-react"; // Import icons
import AddRecordModal from "../components/dashboard/AddRecord";

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
  const [editingRecord, setEditingRecord] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);

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

  const handleEditRecord = (record) => {
    setEditingRecord(record);
    setShowAddRecordModal(true);
  };

  const handleDeleteRecord = (record) => {
    setRecordToDelete(record);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (recordToDelete) {
      const newTransactions = transactions.filter(
        (t) => t.id !== recordToDelete.id
      );
      setTransactions(newTransactions);
      setFilteredTransactions(newTransactions);
      setRecordToDelete(null);
      setShowDeleteConfirm(false);
    }
  };

  const handleSaveRecord = (updatedRecord) => {
    if (editingRecord) {
      // Update existing record
      const newTransactions = transactions.map((t) =>
        t.id === editingRecord.id
          ? { ...updatedRecord, id: editingRecord.id }
          : t
      );
      setTransactions(newTransactions);
      setFilteredTransactions(newTransactions);
      setEditingRecord(null);
    } else {
      // Add new record
      const newRecord = {
        ...updatedRecord,
        id: Date.now().toString(), // Simple ID generation
        accountFrom: updatedRecord.accountFrom || null,
        accountTo: updatedRecord.accountTo || "No Account Specified",
        date: updatedRecord.date
          ? new Date(updatedRecord.date).toISOString()
          : new Date().toISOString(),
      };
      setTransactions((prev) => [...prev, newRecord]);
      setFilteredTransactions((prev) => [...prev, newRecord]);
    }
    applyFilters();
  };

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
        accountTo: "Debit Card",
        category: "Income",
        amount: 1200.0,
        date: new Date("2024-11-11"),
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
      filtered = filtered.filter((transaction) => {
        if (transaction.type === "transfer") {
          return (
            transaction.accountFrom === selectedAccount ||
            transaction.accountTo === selectedAccount
          );
        }
        if (transaction.type === "income") {
          return transaction.accountTo === selectedAccount;
        }
        return transaction.accountFrom === selectedAccount; // Untuk expense
      });
    }

    if (selectedCategory !== "All Categories") {
      filtered = filtered.filter(
        (transaction) => transaction.category === selectedCategory
      );
    }

    if (dateRange.start && dateRange.end) {
      if (!validateDateRange()) return; // Hentikan jika validasi gagal
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

  const handleSortChange = (option) => {
    setSortOption(option);
    setFilteredTransactions((prevFiltered) => {
      const sorted = [...prevFiltered];
      if (option === "Time (newest first)") {
        sorted.sort((a, b) => b.date - a.date);
      } else if (option === "Time (oldest first)") {
        sorted.sort((a, b) => a.date - b.date);
      } else if (option === "Amount (lowest first)") {
        sorted.sort((a, b) => Math.abs(a.amount) - Math.abs(b.amount));
      } else if (option === "Amount (highest first)") {
        sorted.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));
      }
      return sorted;
    });
  };

  const handlePredefinedRange = (range) => {
    setIsCustomRange(false);
    setSelectedRange(range.label);

    if (range.all) {
      setDateRange({ start: "", end: "" });
      setFilteredTransactions(transactions); // Reset semua filter
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

      const filtered = transactions.filter(
        (transaction) => transaction.date >= start && transaction.date <= end
      );

      setDateRange({
        start: start.toISOString().split("T")[0],
        end: end.toISOString().split("T")[0],
      });

      setFilteredTransactions(filtered); // Update hasil filter
    }

    setShowDateFilter(false);
  };

  const handleCustomRange = () => {
    if (dateRange.start && dateRange.end) {
      if (!validateDateRange()) return; // NEW: Validasi tambahan sebelum filter
      setIsCustomRange(true);
      setSelectedRange("Custom Range");
      setShowDateFilter(false);
      applyFilters();
    }
  };

  const handleAccountFilter = (account) => {
    setSelectedAccount(account);
    setFilteredTransactions((prevTransactions) =>
      transactions.filter((transaction) =>
        account === "All Accounts"
          ? true
          : transaction.accountFrom === account ||
            transaction.accountTo === account
      )
    );
  };
  // Calculate balance dynamically based on the selected filter
  const calculateBalance = () => {
    let balance = 0;

    // Filter transactions based on the selected account
    const filteredForAccount = filteredTransactions.filter((transaction) => {
      if (selectedAccount === "All Accounts") {
        return true; // Include all transactions if "All Accounts" is selected
      }
      if (
        transaction.accountFrom === selectedAccount ||
        transaction.accountTo === selectedAccount
      ) {
        return true; // Include transactions involving the selected account
      }
      return false;
    });
    // Sum up the amounts for the filtered transactions
    filteredForAccount.forEach((transaction) => {
      balance += transaction.amount;
    });

    return balance;
  };

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
    setFilteredTransactions((prevTransactions) =>
      transactions.filter((transaction) =>
        category === "All Categories" ? true : transaction.category === category
      )
    );
  };

  if (loading) {
    // NEW: Indikator loading
    return (
      <div className="flex justify-center items-center h-screen">
        <div
          className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-blue-500"
          role="status"
        ></div>
      </div>
    );
  }

  function getCategoryEmoji(category) {
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
      case "Income": // Emoji untuk Income
        return "💰";
      case "Transfer": // Emoji untuk Transfer
        return "🔄";
      default:
        return "📂"; // Default emoji untuk kategori yang tidak dikenal
    }
  }

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
            accountTo: newRecord.accountTo || "No Account Specified",
            date: newRecord.date
              ? new Date(newRecord.date).toISOString()
              : new Date().toISOString(),
          };

          setTransactions((prevTransactions) => [
            ...prevTransactions,
            formattedRecord,
          ]); // Update transactions langsung
          setFilteredTransactions((prevFiltered) => [
            ...prevFiltered,
            formattedRecord,
          ]); // Update filteredTransactions langsung
          applyFilters();
        }}
        accounts={accounts} // Kirim daftar akun
        categories={categories} // Kirim daftar kategori
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-bold mb-4">Confirm Delete</h3>
            <p className="mb-6">Are you sure you want to delete this record?</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-grow flex flex-col">
        <div className="p-6 shadow-md bg-white">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-lg font-bold">Records</h1>
            <div className="flex items-center space-x-8">
            <div>
            <p className="font-bold text-lg">
              Balance: IDR {Math.abs(calculateBalance()).toLocaleString()}
            </p>
            <p className={`text-${calculateBalance() < 0 ? "red" : "green"}-500`}>
              {calculateBalance() < 0 ? "-IDR" : "+IDR"} {Math.abs(calculateBalance()).toLocaleString()}
            </p>
          </div>
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
                onChange={(e) => handleSortChange(e.target.value)} // Ganti pemanggilan fungsi
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
                  className="grid grid-cols-5 gap-4 bg-white p-4 mb-4 rounded shadow items-center"
                >
                  {/* Kolom 1: Kategori dan Tanggal */}
                  <div className="flex flex-col">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-4">
                        <span className="text-red-500 text-lg">
                          {getCategoryEmoji(transaction.category)}
                        </span>
                      </div>
                      <h3 className="font-bold text-gray-700">
                        {transaction.category}
                      </h3>
                    </div>
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

                  {/* Kolom 2: Notes */}
                  <div>
                    <p className="text-sm text-gray-700">
                      {transaction.notes || ""}
                    </p>
                  </div>

                  {/* Kolom 3: Account */}
                  <div className="text-right">
                    {transaction.type === "transfer" ? (
                      <p className="text-sm font-bold text-gray-700">
                        {transaction.accountFrom && transaction.accountTo
                          ? `${transaction.accountFrom} → ${transaction.accountTo}`
                          : "No Account From → No Account To"}
                      </p>
                    ) : transaction.type === "income" ? (
                      <p className="text-sm font-bold text-gray-700">
                        To Account: {transaction.accountTo || "No Account To"}
                      </p>
                    ) : (
                      <p className="text-sm font-bold text-gray-700">
                        From Account:{" "}
                        {transaction.accountFrom || "No Account From"}
                      </p>
                    )}
                  </div>

                  {/* Kolom 4: Amount */}
                  <div className="text-right">
                    <p
                      className={`text-lg font-bold ${
                        transaction.amount < 0
                          ? "text-red-500"
                          : "text-green-500"
                      }`}
                    >
                      {transaction.amount < 0 ? "-IDR " : "+IDR "}
                      {Math.abs(transaction.amount).toLocaleString()}
                    </p>
                  </div>

                  {/* Kolom 5: Actions */}
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleEditRecord(transaction)}
                      className="p-2 text-blue-500 hover:bg-blue-50 rounded-full"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteRecord(transaction)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                    >
                      <Trash2 size={16} />
                    </button>
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
