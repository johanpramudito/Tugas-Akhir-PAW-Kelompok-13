import { useState, useEffect } from "react";
import PropTypes from "prop-types";

function AddRecordModal({ isOpen, onClose, onSave, accounts, categories, editRecord }) {
  const [type, setType] = useState("expense");
  const [accountFrom, setAccountFrom] = useState("");
  const [accountTo, setAccountTo] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (editRecord) {
      // If editing, populate fields with existing data
      setType(editRecord.type);
      setAccountFrom(editRecord.accountFrom || "");
      setAccountTo(editRecord.accountTo || "");
      setAmount(editRecord.amount || "");
      setCategory(editRecord.category || "");
      setDateTime(editRecord.date || "");
      setNotes(editRecord.notes || "");
    } else {
      // Reset the form if no edit record
      resetForm();
    }
  }, [editRecord, isOpen]);

  const getCurrentDateTime = () => {
    const now = new Date();
    return now.toISOString().slice(0, 16); // Format datetime-local
  };

  const handleSave = () => {
    setError(""); // Reset error
  
    // Validate input
    if (!amount || parseFloat(amount) <= 0) {
      setError("Amount must be greater than 0.");
      return;
    }
    if ((type === "expense" || type === "transfer") && !accountFrom) {
      setError("Please select a 'From Account' for Expense or Transfer.");
      return;
    }
    if ((type === "income" || type === "transfer") && !accountTo) {
      setError("Please select a 'To Account' for Income or Transfer.");
      return;
    }
    if (type === "transfer" && accountFrom === accountTo) {
      setError("'From Account' and 'To Account' must be different for a transfer.");
      return;
    }
    if (type === "expense" && !category) {
      setError("Please select a Category.");
      return;
    }
  
    const now = new Date(dateTime || getCurrentDateTime()).toISOString();
  
    // Prepare record data
    const newRecord = {
      type,
      accountFrom: type === "income" || type === "transfer" ? accountFrom : null,
      accountTo: type === "expense" || type === "transfer" ? accountTo : null,
      amount: type === "expense" ? -Math.abs(amount) : // Expense: Subtract from 'From Account'
             type === "income" ? Math.abs(amount) : // Income: Add to 'To Account'
             0, // Transfer is handled separately
      category: type === "income" ? "Income" : (type === "transfer" ? "Transfer" : category),
      date: now,
      notes,
    };
  
    if (type === "transfer") {
      const fromRecord = {
        type: "transfer",
        accountFrom,
        accountTo,
        amount: -Math.abs(amount), // Subtract from 'From Account'
        category: "Transfer",
        date: now,
        notes,
      };
  
      const toRecord = {
        type: "transfer",
        accountFrom,
        accountTo,
        amount: Math.abs(amount), // Add to 'To Account'
        category: "Transfer",
        date: now,
        notes,
      };
  
      onSave(fromRecord); // Save both transfer records
      onSave(toRecord);
    } else {
      if (editRecord) {
        // If in edit mode, update the existing record
        onSave({ ...editRecord, ...newRecord });
      } else {
        // If not in edit mode, create a new record
        onSave(newRecord);
      }
    }
  
    // Reset form after saving
    resetForm();
    onClose();
  };
  

  const resetForm = () => {
    setType("expense");
    setAccountFrom("");
    setAccountTo("");
    setAmount("");
    setCategory("");
    setDateTime("");
    setNotes("");
    setError("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-[500px]">
        <h2 className="text-lg font-bold mb-4">{editRecord ? "Edit Record" : "Add Record"}</h2>

        {/* Error Message */}
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        {/* Tabs for Type */}
        <div className="flex mb-6">
          {["expense", "income", "transfer"].map((tab) => (
            <button
              key={tab}
              onClick={() => setType(tab)}
              className={`flex-1 py-2 text-center rounded-t-md ${
                type === tab
                  ? "bg-blue-500 text-white font-bold"
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content Based on Tab */}
        <div>
          {type === "expense" && (
            <>
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">From Account</label>
                <select
                  value={accountFrom}
                  onChange={(e) => setAccountFrom(e.target.value)}
                  className="w-full border p-2 rounded"
                >
                  <option value="">Select Account</option>
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
                <label className="block text-gray-700 font-bold mb-2">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border p-2 rounded"
                >
                  <option value="">Select Category</option>
                  {categories
                    .filter((cat) => cat !== "All Categories")
                    .filter((cat) => cat !== "Income" && cat !== "Transfer")
                    .map((cat, index) => (
                      <option key={index} value={cat}>
                        {cat}
                      </option>
                    ))}
                </select>
              </div>
            </>
          )}

          {type === "income" && (
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">To Account</label>
              <select
                value={accountTo}
                onChange={(e) => setAccountTo(e.target.value)}
                className="w-full border p-2 rounded"
              >
                <option value="">Select Account</option>
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
                  <option value="">Select Account</option>
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
                  <option value="">Select Account</option>
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
        </div>

        {/* Common Fields */}
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
            value={dateTime || getCurrentDateTime()} // Use current time as default
            onChange={(e) => setDateTime(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 font-bold mb-2">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={`w-full border p-2 rounded ${
              type === "income" ? "h-36" : "h-14"
            }`}
            placeholder="Enter notes here (optional)"
          ></textarea>
        </div>

        <div className="flex justify-end space-x-2">
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            {editRecord ? "Update" : "Save"}
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
  editRecord: PropTypes.object, // New prop for edit record
};

export default AddRecordModal;
