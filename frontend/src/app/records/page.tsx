"use client";

import useAutoLogout from "../../../hook/useAutoLogout";
import { useState, useEffect } from "react";
import Loading from "../components/Loading";
import Container from "../components/Container";
import AutoLogoutModal from "../components/AutoLogoutModal";

type Transaction = {
  id: number;
  category: string;
  method: string;
  amount: number;
  date: string;
};

export default function Records() {
  const { showModal, countdown, resetTimer } = useAutoLogout(10 * 60 * 1000); // 10 minutes no activity
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: 1, category: "Food & Beverage", method: "Cash", amount: 100000, date: "2024-10-21T19:00" },
    { id: 2, category: "Transport", method: "Debit", amount: 50000, date: "2024-10-20T09:00" },
  ]);
  const [filterDate, setFilterDate] = useState<string>("");
  const [sortAmountOrder, setSortAmountOrder] = useState<"asc" | "desc">("asc");
  const [sortDateOrder, setSortDateOrder] = useState<"asc" | "desc">("asc");
  const [newTransaction, setNewTransaction] = useState<Transaction>({
    id: 0,
    category: "",
    method: "",
    amount: 0,
    date: "",
  });

  useEffect(() => {
    setLoading(false); // Set loading to false after the component mounts
  }, []);

  if (loading) {
    return <Loading />; // Show loading screen while loading is true
  }

  const handleFilter = (date: string) => {
    setFilterDate(date);
  };

  const handleSortByAmount = () => {
    const sortedTransactions = [...transactions].sort((a, b) =>
      sortAmountOrder === "asc" ? a.amount - b.amount : b.amount - a.amount
    );
    setTransactions(sortedTransactions);
    setSortAmountOrder(sortAmountOrder === "asc" ? "desc" : "asc");
  };

  const handleSortByDate = () => {
    const sortedTransactions = [...transactions].sort((a, b) =>
      sortDateOrder === "asc"
        ? new Date(a.date).getTime() - new Date(b.date).getTime()
        : new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    setTransactions(sortedTransactions);
    setSortDateOrder(sortDateOrder === "asc" ? "desc" : "asc");
  };

  const handleAddTransaction = () => {
    if (newTransaction.category && newTransaction.method && newTransaction.amount && newTransaction.date) {
      setTransactions([...transactions, { ...newTransaction, id: transactions.length + 1 }]);
      setNewTransaction({ id: 0, category: "", method: "", amount: 0, date: "" });
    }
  };

  const filteredTransactions = transactions.filter((transaction) =>
    filterDate ? transaction.date.startsWith(filterDate) : true
  );

  return (
    <div>
      <Container>
        <h1 className="text-2xl font-bold mb-4">Transaction Records</h1>

        {/* Filter Section */}
        <div className="mb-4">
          <label className="block mb-2">Filter by Date:</label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => handleFilter(e.target.value)}
            className="p-2 border rounded"
          />
        </div>

        {/* Sort Buttons */}
        <div className="mb-4 flex gap-2">
          <button onClick={handleSortByAmount} className="bg-gray-200 p-2 rounded">
            Sort by Amount ({sortAmountOrder === "asc" ? "Ascending" : "Descending"})
          </button>
          <button onClick={handleSortByDate} className="bg-gray-200 p-2 rounded">
            Sort by Date ({sortDateOrder === "asc" ? "Oldest First" : "Newest First"})
          </button>
        </div>

        {/* Transactions List */}
        <div className="mb-4">
          {filteredTransactions.map((transaction) => (
            <div key={transaction.id} className="flex justify-between p-2 bg-gray-100 rounded mb-2">
              <div>
                <h3 className="font-semibold">{transaction.category}</h3>
                <p>{transaction.method}</p>
              </div>
              <div className="text-right">
                <p>Rp{transaction.amount.toLocaleString()}</p>
                <p>{new Date(transaction.date).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Add Transaction Form */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Add New Transaction</h2>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Category"
              value={newTransaction.category}
              onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
              className="p-2 border rounded"
            />
            <input
              type="text"
              placeholder="Payment Method"
              value={newTransaction.method}
              onChange={(e) => setNewTransaction({ ...newTransaction, method: e.target.value })}
              className="p-2 border rounded"
            />
            <input
              type="number"
              placeholder="Amount"
              value={newTransaction.amount}
              onChange={(e) => setNewTransaction({ ...newTransaction, amount: Number(e.target.value) })}
              className="p-2 border rounded"
            />
            <input
              type="datetime-local"
              value={newTransaction.date}
              onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
              className="p-2 border rounded"
            />
          </div>
          <button
            onClick={handleAddTransaction}
            className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Add Transaction
          </button>
        </div>
      </Container>

      {showModal && <AutoLogoutModal countdown={countdown} onStaySignedIn={resetTimer} />}
    </div>
  );
}
