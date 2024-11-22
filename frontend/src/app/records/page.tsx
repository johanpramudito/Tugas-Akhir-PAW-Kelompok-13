"use client";

import useAutoLogout from "../../../hook/useAutoLogout";
import { useState, useEffect } from "react";
import Loading from "../components/Loading";
import Container from "../components/Container";
import AutoLogoutModal from "../components/AutoLogoutModal";

const categories = [
  "Food & Beverages",
  "Shopping",
  "Housing",
  "Transportation",
  "Vehicle",
  "Life & Entertainment",
  "Communication, PC",
];
const accounts = ["Cash", "Debit Card", "Credit Card"];

const getDateRange = (type) => {
  const now = new Date();
  const start = new Date();

  switch (type) {
    case "lastWeek":
      start.setDate(now.getDate() - 7);
      break;
    case "lastMonth":
      start.setMonth(now.getMonth() - 1);
      break;
    case "thisWeek":
      start.setDate(now.getDate() - now.getDay());
      break;
    case "thisMonth":
      start.setDate(1);
      break;
    case "custom":
      // Custom range will not modify start/end here
      break;
    default:
      return { start: null, end: null };
  }

  return { start, end: now };
};

export default function Records() {
  const { showModal, countdown, resetTimer } = useAutoLogout(10 * 60 * 1000); // 10 minutes no activity
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedAccount, setSelectedAccount] = useState("All Accounts");
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [dateFilterLabel, setDateFilterLabel] = useState("All Dates");
  const [transactions, setTransactions] = useState([
    { id: 1, category: "Food & Beverages", method: "Cash", amount: 22000, date: "2024-11-11" },
    { id: 2, category: "Shopping", method: "Credit Card", amount: 50000, date: "2024-11-20" },
  ]);

  const [showDateFilter, setShowDateFilter] = useState(false);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 1000); // Set loading to false after 1 second
  }, []);

  if (loading) {
    return <Loading />;
  }

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
  };

  const handleAccountFilter = (account) => {
    setSelectedAccount(account);
  };

  const handleDateFilter = (type) => {
    const { start, end } = getDateRange(type);
    setDateRange({ start, end });

    switch (type) {
      case "lastWeek":
        setDateFilterLabel("Last Week");
        break;
      case "lastMonth":
        setDateFilterLabel("Last Month");
        break;
      case "thisWeek":
        setDateFilterLabel("This Week");
        break;
      case "thisMonth":
        setDateFilterLabel("This Month");
        break;
      case "custom":
        setDateFilterLabel("Custom Date");
        break;
      default:
        setDateFilterLabel("All Dates");
    }
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date);

    const matchesDate =
      !dateRange.start ||
      (transactionDate >= dateRange.start && transactionDate <= dateRange.end);

    return (
      (selectedCategory === "All Categories" || transaction.category === selectedCategory) &&
      (selectedAccount === "All Accounts" || transaction.method === selectedAccount) &&
      matchesDate
    );
  });

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="w-1/4 bg-gray-100 p-4">
        <button
          className="w-full bg-green-500 text-white py-2 px-4 rounded mb-4 hover:bg-green-600"
        >
          + Add
        </button>

        {/* Filter Section */}
        <div className="mb-6">
          <h2 className="font-bold mb-2">ACCOUNTS</h2>
          <ul>
            <li
              onClick={() => handleAccountFilter("All Accounts")}
              className={`cursor-pointer mb-1 ${
                selectedAccount === "All Accounts" ? "font-bold" : ""
              }`}
            >
              All Accounts
            </li>
            {accounts.map((account) => (
              <li
                key={account}
                onClick={() => handleAccountFilter(account)}
                className={`cursor-pointer mb-1 ${
                  selectedAccount === account ? "font-bold" : ""
                }`}
              >
                {account}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-bold mb-2">CATEGORIES</h2>
          <ul>
            <li
              onClick={() => handleCategoryFilter("All Categories")}
              className={`cursor-pointer mb-1 ${
                selectedCategory === "All Categories" ? "font-bold" : ""
              }`}
            >
              All Categories
            </li>
            {categories.map((category) => (
              <li
                key={category}
                onClick={() => handleCategoryFilter(category)}
                className={`cursor-pointer mb-1 ${
                  selectedCategory === category ? "font-bold" : ""
                }`}
              >
                {category}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-3/4 p-4 relative">
        <Container>
          <div className="mb-4 flex justify-between">
            <h1 className="text-xl font-bold">Records</h1>
            <div className="relative">
              <button
                onClick={() => setShowDateFilter(!showDateFilter)}
                className="bg-blue-500 text-white py-2 px-4 rounded mb-4 hover:bg-blue-600"
              >
                Filter by Date: {dateFilterLabel}
              </button>

              {/* Date filter pop-up */}
              {showDateFilter && (
                <div className="absolute left-0 mt-2 w-48 bg-white border rounded shadow-lg z-10">
                  <div className="p-2">
                    <label className="block mb-2">
                      <input
                        type="radio"
                        name="dateFilter"
                        onClick={() => handleDateFilter("thisWeek")}
                        checked={dateFilterLabel === "This Week"}
                        className="mr-2"
                      />
                      This Week
                    </label>
                    <label className="block mb-2">
                      <input
                        type="radio"
                        name="dateFilter"
                        onClick={() => handleDateFilter("thisMonth")}
                        checked={dateFilterLabel === "This Month"}
                        className="mr-2"
                      />
                      This Month
                    </label>
                    <label className="block mb-2">
                      <input
                        type="radio"
                        name="dateFilter"
                        onClick={() => handleDateFilter("lastWeek")}
                        checked={dateFilterLabel === "Last Week"}
                        className="mr-2"
                      />
                      Last Week
                    </label>
                    <label className="block mb-2">
                      <input
                        type="radio"
                        name="dateFilter"
                        onClick={() => handleDateFilter("lastMonth")}
                        checked={dateFilterLabel === "Last Month"}
                        className="mr-2"
                      />
                      Last Month
                    </label>
                    <label className="block mb-2">
                      <input
                        type="radio"
                        name="dateFilter"
                        onClick={() => handleDateFilter("custom")}
                        checked={dateFilterLabel === "Custom Date"}
                        className="mr-2"
                      />
                      Custom Date
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex justify-between items-center p-2 border-b"
              >
                <div>
                  <h3 className="font-semibold">{transaction.category}</h3>
                  <p>{transaction.method}</p>
                </div>
                <div className="text-right">
                  <p>IDR {transaction.amount.toLocaleString()}</p>
                  <p>{transaction.date}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </div>

      {showModal && <AutoLogoutModal countdown={countdown} onStaySignedIn={resetTimer} />}
    </div>
  );
}
