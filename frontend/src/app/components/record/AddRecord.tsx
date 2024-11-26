import React, { useState, useEffect } from "react";

// Define the props interface
interface AddRecordProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: any) => void; // Adjust `any` to the specific type of record if known
  accounts: string[];
  categories: string[];
  editRecord?: {
    type?: string;
    accountFrom?: string;
    accountTo?: string;
    amount?: number;
    category?: string;
    date?: string;
    notes?: string;
  };
}

const AddRecordModal: React.FC<AddRecordProps> = ({ isOpen, onClose, onSave, accounts, categories, editRecord }) => {
  const [type, setType] = useState<string>("expense");
  const [accountFrom, setAccountFrom] = useState<string>("");
  const [accountTo, setAccountTo] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [dateTime, setDateTime] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [error, setError] = useState<string>("");

    // Populate fields when editing
    useEffect(() => {
        if (isOpen && editRecord) {
          setType(editRecord.type || "expense");
          setAccountFrom(editRecord.accountFrom || "");
          setAccountTo(editRecord.accountTo || "");
          setAmount(editRecord.amount ? Math.abs(editRecord.amount).toString() : "");
          setCategory(editRecord.category || "");
          setDateTime(editRecord.date ? new Date(editRecord.date).toISOString().slice(0, 16) : "");
          setNotes(editRecord.notes || "");
        } else if (isOpen) {
          resetForm();
        }
      }, [editRecord, isOpen]);
    
      const getCurrentDateTime = () => {
        const now = new Date();
        return now.toISOString().slice(0, 16); // For datetime-local format
      };
    
      const handleSave = () => {
        setError("");
    
        // Input validation
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
    
        const formattedDate = new Date(dateTime || getCurrentDateTime()).toISOString();
    
        // Record structure
        const newRecord = {
          type,
          accountFrom: type === "income" || type === "transfer" ? accountFrom : null,
          accountTo: type === "expense" || type === "transfer" ? accountTo : null,
          amount: type === "expense" ? -Math.abs(parseFloat(amount)) : Math.abs(parseFloat(amount)),
          category: type === "income" ? "Income" : type === "transfer" ? "Transfer" : category,
          date: formattedDate,
          notes,
        };
    
        if (type === "transfer") {
          const fromRecord = { ...newRecord, amount: -Math.abs(parseFloat(amount)) };
          const toRecord = { ...newRecord, amount: Math.abs(parseFloat(amount)) };
    
          onSave([fromRecord, toRecord]); // Save both as array or adjust per your save logic
        } else {
          onSave(editRecord ? { ...editRecord, ...newRecord } : newRecord);
        }
    
        resetForm();
        onClose();
      };
    
      const resetForm = () => {
        setType("expense");
        setAccountFrom("");
        setAccountTo("");
        setAmount("");
        setCategory("");
        setDateTime(getCurrentDateTime());
        setNotes("");
        setError("");
      };
    
      if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-200 bg-opacity-50 z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
      <h2 className="text-lg font-bold mb-4">{editRecord ? "Edit Record" : "Add Record"}</h2>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {/* Type Tabs */}
      <div className="flex mb-6">
        {["expense", "income", "transfer"].map((tab) => (
          <button
            key={tab}
            onClick={() => setType(tab)}
            className={`flex-1 py-2 text-center rounded-t-md ${
              type === tab ? "bg-blue-500 text-white font-bold" : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Dynamic Form Fields */}
      {type !== "income" && (
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">From Account</label>
          <select
            value={accountFrom}
            onChange={(e) => setAccountFrom(e.target.value)}
            className="w-full border p-2 rounded"
          >
            <option value="">Select Account</option>
            {accounts.map((acc, idx) => (
              <option key={idx} value={acc}>
                {acc}
              </option>
            ))}
          </select>
        </div>
      )}

      {type !== "expense" && (
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">To Account</label>
          <select
            value={accountTo}
            onChange={(e) => setAccountTo(e.target.value)}
            className="w-full border p-2 rounded"
          >
            <option value="">Select Account</option>
            {accounts.map((acc, idx) => (
              <option key={idx} value={acc}>
                {acc}
              </option>
            ))}
          </select>
        </div>
      )}

      {type === "expense" && (
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border p-2 rounded"
          >
            <option value="">Select Category</option>
            {categories.map((cat, idx) => (
              <option key={idx} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      )}

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
          value={dateTime}
          onChange={(e) => setDateTime(e.target.value)}
          className="w-full border p-2 rounded"
        />
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 font-bold mb-2">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full border p-2 rounded"
          placeholder="Enter notes here (optional)"
        />
      </div>

      <div className="flex justify-end space-x-2">
        <button onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
          Cancel
        </button>
        <button onClick={handleSave} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
          {editRecord ? "Update" : "Save"}
        </button>
      </div>
    </div>
  </div>
  );
};

export default AddRecordModal;
