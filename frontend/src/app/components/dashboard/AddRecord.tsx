import { useState } from "react";
import PropTypes from "prop-types";

function AddRecordModal({ isOpen, onClose, onSave, accounts, categories }) {
  const [type, setType] = useState("expense");
  const [accountFrom, setAccountFrom] = useState("");
  const [accountTo, setAccountTo] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [notes, setNotes] = useState("");

  const getCurrentDateTime = () => {
    const now = new Date();
    return now.toISOString().slice(0, 16); // Format sesuai input datetime-local
  };

  const handleSave = () => {
    const autoFillAccount = accounts.find((account) => account !== "All Accounts") || "Default Account";
    const autoFillCategory = categories.find((cat) => cat !== "All Categories" && cat !== "Transfer" && cat !== "Income") || "General";

    const record = {
      type,
      accountFrom: type === "income" ? null : accountFrom || autoFillAccount,
      accountTo: type === "income" || type === "transfer" ? accountTo || autoFillAccount : null,
      amount: type === "expense" ? -Math.abs(parseFloat(amount || 0)) : Math.abs(parseFloat(amount || 0)),
      category: type === "transfer" ? "Transfer" : type === "income" ? "Income" : category || autoFillCategory,
      date: new Date(dateTime || getCurrentDateTime()).toISOString(),
      notes: notes || "",
    };

    onSave(record);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded shadow-lg w-96">
        <h2 className="text-lg font-bold mb-4">Add Record</h2>

        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Type</label>
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              if (e.target.value === "transfer") {
                setCategory("Transfer");
              } else if (e.target.value === "income") {
                setCategory("Income");
              } else {
                setCategory("");
              }
            }}
            className="w-full border p-2 rounded"
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
            <option value="transfer">Transfer</option>
          </select>
        </div>

        {type === "expense" && (
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">From Account</label>
            <select
              value={accountFrom}
              onChange={(e) => setAccountFrom(e.target.value)}
              className="w-full border p-2 rounded"
            >
              {accounts
                .filter((account) => account !== "All Accounts")
                .map((account, index) => (
                  <option key={index} value={account}>
                    {account}
                  </option>
                ))}
            </select>
          </div>
        )}

        {type === "income" && (
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">To Account</label>
            <select
              value={accountTo}
              onChange={(e) => setAccountTo(e.target.value)}
              className="w-full border p-2 rounded"
            >
              {accounts
                .filter((account) => account !== "All Accounts")
                .map((account, index) => (
                  <option key={index} value={account}>
                    {account}
                  </option>
                ))}
            </select>
          </div>
        )}

        {type === "transfer" && (
          <>
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">From Account</label>
              <select
                value={accountFrom}
                onChange={(e) => setAccountFrom(e.target.value)}
                className="w-full border p-2 rounded"
              >
                {accounts
                  .filter((account) => account !== "All Accounts")
                  .map((account, index) => (
                    <option key={index} value={account}>
                      {account}
                    </option>
                  ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">To Account</label>
              <select
                value={accountTo}
                onChange={(e) => setAccountTo(e.target.value)}
                className="w-full border p-2 rounded"
              >
                {accounts
                  .filter((account) => account !== "All Accounts")
                  .map((account, index) => (
                    <option key={index} value={account}>
                      {account}
                    </option>
                  ))}
              </select>
            </div>
          </>
        )}

        {type === "expense" && (
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border p-2 rounded"
            >
              {categories
                .filter((cat) => cat !== "Transfer" && cat !== "Income" && cat !== "All Categories")
                .map((cat, index) => (
                  <option key={index} value={cat}>
                    {cat}
                  </option>
                ))}
            </select>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Date and Time</label>
          <input
            type="datetime-local"
            value={dateTime || getCurrentDateTime()}
            onChange={(e) => setDateTime(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Notes (Optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="Enter notes here (e.g., purpose, details)"
          ></textarea>
        </div>

        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

AddRecordModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  accounts: PropTypes.arrayOf(PropTypes.string).isRequired,
  categories: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default AddRecordModal;
