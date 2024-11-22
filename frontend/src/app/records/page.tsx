"use client";

import useAutoLogout from "../../../hook/useAutoLogout";
import { useState, useEffect } from "react";
import { DateRangePicker } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { format } from "date-fns";
import Loading from "../components/Loading";
import Container from "../components/Container";
import AutoLogoutModal from "../components/AutoLogoutModal";

const categories = [
  "Food & Beverages",
  "Shopping",
  "Housing",
  "Transportation",
  "Entertainment",
  "Recreation (Ticket)",
];
const accounts = ["Cash", "Debit Card", "Credit Card", "Bank Account 1", "Bank Account 2"];

export default function Records() {
  const { showModal, countdown, resetTimer } = useAutoLogout(10 * 60 * 1000);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedAccount, setSelectedAccount] = useState("All Accounts");
  const [dateRange, setDateRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
  });
  const [selectedRange, setSelectedRange] = useState("All Dates");
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [sortOrder, setSortOrder] = useState("asc");
  const [transactions, setTransactions] = useState([
    { id: 1, category: "Food & Beverages", method: "Cash", amount: 22000, date: "2024-11-11" },
    { id: 2, category: "Shopping", method: "Credit Card", amount: 50000, date: "2024-11-20" },
    { id: 3, category: "Housing", method: "Cash", amount: 150000, date: "2024-11-15" },
  ]);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [transactionType, setTransactionType] = useState("Expense"); // New state for transaction type
  const [formData, setFormData] = useState({
    fromAccount: "Cash", // For Transfer
    toAccount: "Debit Card", // For Transfer
    amount: "",
    category: "",
    date: new Date(),
    note: "",
    location: "",
  });

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000); // Simulate loading
  }, []);

  const handleSortToggle = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const handleRangeChange = (ranges) => {
    if (ranges && ranges.selection) {
      const { startDate, endDate } = ranges.selection;
      setDateRange(ranges.selection);
      // Update selectedRange with formatted dates
      const startFormatted = format(startDate, "yyyy-MM-dd");
      const endFormatted = format(endDate, "yyyy-MM-dd");
      setSelectedRange(`${startFormatted} - ${endFormatted}`);
    }
  };

  const handleDelete = (id) => {
    setTransactions((prevTransactions) =>
      prevTransactions.filter((transaction) => transaction.id !== id)
    );
  };

  const handleEdit = (transaction) => {
    setEditingTransaction({ ...transaction });
    setShowEditModal(true);
  };

  const handleUpdate = () => {
    if (editingTransaction) {
      setTransactions((prevTransactions) =>
        prevTransactions.map((transaction) =>
          transaction.id === editingTransaction.id ? editingTransaction : transaction
        )
      );
      setShowEditModal(false);
      setEditingTransaction(null);
    }
  };

  const handleAddTransaction = () => {
    const newTransaction = {
      id: transactions.length + 1,
      category: formData.category,
      method: transactionType === "Transfer" ? formData.fromAccount : formData.toAccount, // Based on type
      amount: parseFloat(formData.amount),
      date: format(formData.date, "yyyy-MM-dd"),
      note: formData.note,
      location: formData.location,
      fromAccount: formData.fromAccount,
      toAccount: formData.toAccount,
    };
    setTransactions((prev) => [...prev, newTransaction]);
    setShowAddModal(false);
  };

  const filteredTransactions = transactions
    .filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      const matchesDate =
        (dateRange.startDate &&
          dateRange.endDate &&
          transactionDate >= dateRange.startDate &&
          transactionDate <= dateRange.endDate) ||
        !dateRange.startDate; // Additional check to ensure it's valid
      return (
        (selectedCategory === "All Categories" || transaction.category === selectedCategory) &&
        (selectedAccount === "All Accounts" || transaction.method === selectedAccount) &&
        matchesDate
      );
    })
    .sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="flex relative">
      {/* Sidebar */}
      <div className="w-1/4 bg-gray-100 p-4">
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full bg-green-500 text-white py-2 px-4 rounded mb-4 hover:bg-green-600"
        >
          + Add
        </button>
        {/* Account Filters */}
        <div className="mb-6">
          <h2 className="font-bold mb-2">ACCOUNTS</h2>
          <ul>
            <li
              onClick={() => setSelectedAccount("All Accounts")}
              className={`cursor-pointer mb-1 ${selectedAccount === "All Accounts" ? "font-bold" : ""}`}
            >
              All Accounts
            </li>
            {accounts.map((account) => (
              <li
                key={account}
                onClick={() => setSelectedAccount(account)}
                className={`cursor-pointer mb-1 ${selectedAccount === account ? "font-bold" : ""}`}
              >
                {account}
              </li>
            ))}
          </ul>
        </div>
        {/* Category Filters */}
        <div>
          <h2 className="font-bold mb-2">CATEGORIES</h2>
          <ul>
            <li
              onClick={() => setSelectedCategory("All Categories")}
              className={`cursor-pointer mb-1 ${selectedCategory === "All Categories" ? "font-bold" : ""}`}
            >
              All Categories
            </li>
            {categories.map((category) => (
              <li
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`cursor-pointer mb-1 ${selectedCategory === category ? "font-bold" : ""}`}
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
          <div className="mb-4 flex justify-between items-center">
            <h1 className="text-xl font-bold">Records</h1>
            <div className="flex space-x-4">
              <button
                onClick={handleSortToggle}
                className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
              >
                Sort by Date ({sortOrder === "asc" ? "Ascending" : "Descending"})
              </button>
              <button
                onClick={() => setShowDateFilter(!showDateFilter)}
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
              >
                Filter by Date: {selectedRange}
              </button>
            </div>
          </div>
          {showDateFilter && (
            <div className="absolute top-16 right-4 bg-white shadow-md rounded p-4 z-10">
              <DateRangePicker
                ranges={[dateRange]} // Send the ranges properly
                onChange={handleRangeChange}
                rangeColors={["#4F46E5"]}
              />
            </div>
          )}
          <div>
            {filteredTransactions.length === 0 ? (
              <p>No transactions found</p>
            ) : (
              filteredTransactions.map((transaction) => (
                <div key={transaction.id} className="bg-white p-4 rounded shadow mb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold">{transaction.category}</h3>
                      <p>{transaction.method}</p>
                      <p>{transaction.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl">{transaction.amount}</p>
                      <button
                        onClick={() => handleEdit(transaction)}
                        className="bg-yellow-500 text-white py-1 px-3 rounded hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(transaction.id)}
                        className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Container>
      </div>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-1/3">
            <h2 className="text-xl font-bold mb-4">Add Transaction</h2>
            <form>
              <div className="mb-4">
                <label className="block">Transaction Type</label>
                <select
                  className="w-full p-2 border rounded"
                  value={transactionType}
                  onChange={(e) => setTransactionType(e.target.value)}
                >
                  <option value="Expense">Expense</option>
                  <option value="Income">Income</option>
                  <option value="Transfer">Transfer</option>
                </select>
              </div>

              {/* Conditional Fields Based on Transaction Type */}
              {transactionType !== "Transfer" && (
                <>
                  <div className="mb-4">
                    <label className="block">Account</label>
                    <select
                      className="w-full p-2 border rounded"
                      value={formData.fromAccount} // For Expense and Income
                      onChange={(e) => setFormData({ ...formData, fromAccount: e.target.value })}
                    >
                      {accounts.map((account) => (
                        <option key={account} value={account}>
                          {account}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block">Amount</label>
                    <input
                      type="number"
                      className="w-full p-2 border rounded"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    />
                  </div>
                </>
              )}
              {transactionType === "Transfer" && (
                <>
                  <div className="mb-4">
                    <label className="block">From Account</label>
                    <select
                      className="w-full p-2 border rounded"
                      value={formData.fromAccount}
                      onChange={(e) => setFormData({ ...formData, fromAccount: e.target.value })}
                    >
                      {accounts.map((account) => (
                        <option key={account} value={account}>
                          {account}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block">To Account</label>
                    <select
                      className="w-full p-2 border rounded"
                      value={formData.toAccount}
                      onChange={(e) => setFormData({ ...formData, toAccount: e.target.value })}
                    >
                      {accounts.map((account) => (
                        <option key={account} value={account}>
                          {account}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block">Amount</label>
                    <input
                      type="number"
                      className="w-full p-2 border rounded"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    />
                  </div>
                </>
              )}

              {/* Common Fields */}
              <div className="mb-4">
                <label className="block">Category</label>
                <select
                  className="w-full p-2 border rounded"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block">Date</label>
                <input
                  type="date"
                  className="w-full p-2 border rounded"
                  value={format(formData.date, "yyyy-MM-dd")}
                  onChange={(e) => setFormData({ ...formData, date: new Date(e.target.value) })}
                />
              </div>
              <div className="mb-4">
                <label className="block">Note</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                />
              </div>
              <div className="mb-4">
                <label className="block">Location</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
              <div className="flex justify-between">
                <button
                  type="button"
                  className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
                  onClick={handleAddTransaction}
                >
                  Add
                </button>
                <button
                  type="button"
                  className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
