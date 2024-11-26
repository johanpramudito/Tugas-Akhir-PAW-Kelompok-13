/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useUserContext } from "@/context/UserContext";
import Loading from "../components/Loading";
import useAutoLogout from "../../../hook/useAutoLogout";
import AutoLogoutModal from "../components/AutoLogoutModal";
import apiAccount from "@utils/apiAccount";
import apiRecord from "@utils/apiRecord";
import { FaChevronDown, FaChevronRight } from "react-icons/fa"; // Import icons from react-icons
export const revalidate = 60;


type Record = {
  _id: string;
  category: string;
  amount: number;
  dateTime: string;
  accountId: Account;
  toAccountId: Account;
  type: string;
  note: string;
  location: string;
}

const categories = [
  "Food & Beverages",
  "Shopping",
  "Housing",
  "Transport",
  "Entertainment",
  "Recreation",
  "Income",
  "Transfer",
];

type Account = {
    _id: string;
    name: string;
    type: string;
    initialAmount: number;
    balance: number;
  };

export default function RecordsDashboard() {
  const { showModal, countdown, resetTimer } = useAutoLogout(10 * 60 * 1000); // 10 minutes
  const { currentUser } = useUserContext();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [selectedRange, setSelectedRange] = useState("All");
  const [isCustomRange, setIsCustomRange] = useState(false);
  const [allAccounts, setAllAccounts] = useState<Account[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [newRecord, setNewRecord] = useState({ category: '', type: 'Expense', amount: 0, dateTime: '', accountId: accounts.length ? accounts[0]._id : null, toAccountId: '', note: '',  location: ''});
  const [recordType, setRecordType] = useState<string>('Expense');
  

  const predefinedRanges = [
    { label: "Today", start: new Date().toISOString().split("T")[0], end: new Date().toISOString().split("T")[0] },
    { label: "Last 7 days", start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], end: new Date().toISOString().split("T")[0] },
    { label: "Last 30 days", start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], end: new Date().toISOString().split("T")[0] },
    { label: "This week", start: new Date(new Date().setDate(new Date().getDate() - new Date().getDay())).toISOString().split("T")[0], end: new Date().toISOString().split("T")[0] },
    { label: "Last 90 days", start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], end: new Date().toISOString().split("T")[0] },
    { label: "This month", start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0], end: new Date().toISOString().split("T")[0] },
    { label: "Last 12 months", start: new Date(new Date().getFullYear() - 1, new Date().getMonth(), new Date().getDate()).toISOString().split("T")[0], end: new Date().toISOString().split("T")[0] },
    { label: "This year", start: new Date(new Date().getFullYear(), 0, 1).toISOString().split("T")[0], end: new Date().toISOString().split("T")[0] },
    { label: "All", start: "2000-01-01", end: new Date().toISOString().split("T")[0] }, // Replace 2000-01-01 with your app's earliest date
  ];
  

  // Records state
  const [records, setRecords] = useState<Record[]>([]);
  const [allRecords, setAllRecords] = useState<Record[]>([]);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedAccount, setSelectedAccount] = useState("All Accounts");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [sortType, setSortType] = useState("default");
  const [isAccountsDropdownVisible, setIsAccountsDropdownVisible] = useState(false);
  const [isCategoriesDropdownVisible, setIsCategoriesDropdownVisible] = useState(false);
  
  // Initialize user data
  useEffect(() => {
    const initializeUser = async () => {
      try {
        if (currentUser?.id) {
          setUserId(currentUser?.id);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error getting current user:', error);
        setLoading(false);
      }
    };

    initializeUser();
  }, [currentUser]);

  // Fetch records when userId is available
  useEffect(() => {
    if (userId) {
      fetchAccounts();
      fetchRecords();
    }
  }, [userId]);

  const fetchAccounts = async () => {
    if (!userId) return;
  
    try {
      const response = await apiAccount.getAccounts(userId);

      
      setAccounts(response.data);
      setAllAccounts(response.data); // Store the fetched accounts for searching
    } catch (error: unknown) {
      if ((error as any).response?.status === 404) {
        // Handle case where no accounts are found
        console.warn('No accounts found for this user.');
        setAccounts([]); // Set empty accounts array
        setAllAccounts([]); // Clear allAccounts array
      } else {
        console.error('Error fetching accounts:', error);
      }
    }
  };

  const fetchRecords = async () => {
    if (!userId) return;
  
    try {
      const response = await apiRecord.getRecords(userId);
  
      // Process transfer records to create separate entries
      const processedRecords = response.data.flatMap((record: Record) => {
        if (record.type === "Transfer") {
          // Create two separate records for transfer
          return [
            {
              ...record,
              amount: -Math.abs(record.amount), // Negative for source account
              type: "Transfer (Outgoing)",
            },
            {
              ...record,
              amount: Math.abs(record.amount), // Positive for destination account
              accountId: record.toAccountId,
              toAccountId: record.accountId,
              type: "Transfer (Incoming)",
            },
          ];
        }else if (record.type === "Expense") {
          return [
            {
              ...record,
              amount: -Math.abs(record.amount), // Negative for source account
            },
          ];
        }else if (record.type === "Income"){
          return [
            {
              ...record,
              amount: +Math.abs(record.amount), // Negative for source account
            },
          ];
        }
        return [record];
      });
  
      setRecords(processedRecords);
      setAllRecords(processedRecords);
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.warn('No Records found for this user.');
        setRecords([]);
        setAllRecords([]);
      } else {
        console.error('Error fetching accounts:', error);
      }
    }
  };  

  const getDisplayDate = (
    selectedRange: string | null,
    isCustomRange: boolean,
    dateRange: { start: string; end: string }
  ): string => {
    if (isCustomRange) {
      return `${dateRange.start} to ${dateRange.end}`;
    }
    return selectedRange || "Select Range";
  };
  

  const handlePredefinedRange = (range: { label: string; start: string; end: string }): void => {
    setSelectedRange(range.label);
    setDateRange({ start: range.start, end: range.end });
    setIsCustomRange(false);
    setShowDateFilter(false);
    filterAndSortRecords(sortType, selectedCategory, selectedAccount, range.start, range.end);
  };
  

  const handleCustomRange = () => {
    if (dateRange.start && dateRange.end) {
      setSelectedRange("Custom");
      setIsCustomRange(true);
      setShowDateFilter(false);
      filterAndSortRecords(sortType, selectedCategory, selectedAccount, dateRange.start, dateRange.end);
    }
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSortType = e.target.value;
    setSortType(newSortType);
    filterAndSortRecords(
      newSortType,
      selectedCategory,
      selectedAccount,
      dateRange.start,
      dateRange.end
    );
  };
  

  const filterAndSortRecords = (
    sort: string,
    category: string,
    account: string,
    startDate?: string,
    endDate?: string
  ) => {
    let filtered = [...allRecords];
  
    // Apply date filter
    if (startDate && endDate) {
      filtered = filtered.filter((record) => {
        const recordDate = new Date(record.dateTime);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return recordDate >= start && recordDate < new Date(end.getTime() + 86400000);
      });
    }
  
    // Apply category filter
    if (category !== "All Categories") {
      filtered = filtered.filter((record) => 
        record.category === category || 
        // For transfers, use the original category if needed
        (record.type.includes("Transfer") && category === "Transfer")
      );
    }
  
    // Apply account filter
    if (account !== "All Accounts") {
      filtered = filtered.filter((record) => 
        record.accountId.name === account
      );
    }
  
    // Apply sorting
    switch (sort) {
      case "TimeNewest":
        filtered.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
        break;
      case "TimeOldest":
        filtered.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
        break;
      case "AmountHighest":
        filtered.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));
        break;
      case "AmountLowest":
        filtered.sort((a, b) => Math.abs(a.amount) - Math.abs(b.amount));
        break;
    }
  
    setRecords(filtered);
  };
  
  const resetForm = () => {
    setNewRecord({ category: '', type: 'Expense', amount: 0, dateTime: '', accountId: accounts.length ? accounts[0]._id : null, toAccountId: '', note: '',  location: '' });
    setSelectedRecord(null);
    setIsEditMode(false);
    setRecordType('Expense')
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const openDeleteModal = (id: string) => {
    setIsDeleteModalOpen(true);
    setRecordToDelete(id);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewRecord((prevRecord) => ({
      ...prevRecord,
      [name]: value,
    }));
  };
  

  const handleAddRecord = async () => {
    if (!userId) return;
  
    try {
      // Pastikan semua field yang diperlukan diatur
      const recordToSave = {
        ...newRecord,
        type: recordType, // Gunakan recordType saat ini
        accountId: newRecord.accountId || (accounts.length ? accounts[0]._id : ''),
        toAccountId: recordType === 'Transfer' ? newRecord.toAccountId || '' : '',
        category: recordType === 'Expense' ? newRecord.category : recordType,
        amount: parseFloat(newRecord.amount.toString())
      };
  
      if (!recordToSave.accountId) {
        console.error('No account selected');
        return;
      }
  
      if (recordType === 'Transfer' && !recordToSave.toAccountId) {
        console.error('No target account selected for transfer');
        return;
      }
  
      if (isEditMode && selectedRecord) {
        // Edit existing record
        await apiRecord.updateRecord(selectedRecord._id, recordToSave);
      } else {
        if (recordType === 'Transfer') {
          // Tambahkan transfer baru
          await apiRecord.addTransfer(recordToSave);
        } else {
          // Tambahkan record baru (Income/Expense)
          await apiRecord.addRecord(recordToSave);
        }
      }
  
      fetchRecords();
      handleCloseModal();
      resetForm();
    } catch (error) {
      console.error('Error saving record:', error);
    }
  };
  

  const handleEditRecord = (record: Record) => {
    setSelectedRecord(record);
    setRecordType(record.type);
    setNewRecord({
      type: record.type,
      amount: record.amount,
      category: record.category,
      note: record.note,
      location: record.location,
      accountId: record.accountId._id,
      toAccountId: record.toAccountId?._id || '', // Pastikan ada nilai default untuk transfer
      dateTime: record.dateTime,
    });
    setIsEditMode(true);
    setIsModalOpen(true);
  };
  

  const handleDeleteRecord = async () => {
    if (recordToDelete) {
      try {
        await apiRecord.deleteRecord(recordToDelete);
        setAccounts(accounts.filter((record) => record._id !== recordToDelete));
        console.log(`Account with ID: ${recordToDelete} has been deleted.`);
      } catch (error) {
        console.error("Error deleting account:", error);
      } finally {
        fetchRecords();
        setIsDeleteModalOpen(false);
        resetForm();
        setRecordToDelete(null);
      }
    }
  };

  const calculateBalance = () => {
    return records.reduce((sum, record) => sum + record.amount, 0);
  };

  function getCategoryEmoji(category: string): string {
    const emojis: { [key: string]: string } = {
      "Food & Beverages": "🍔",
      "Shopping": "🛍",
      "Housing": "🏠",
      "Transport": "🚗",
      "Entertainment": "🎮",
      "Recreation": "🏞",
      "Income": "💰",
      "Transfer": "🔄"
    };
    return emojis[category] || "📂";
  }

  if (loading) {
    return <Loading />;
  }
  

  return (
<div className="container mx-auto p-4">
  <div className="flex flex-col md:flex-row gap-4">
    {/* Sidebar */}
    <div className="bg-white p-4 rounded-lg shadow-md w-full md:w-1/4">
      <h2 className="text-xl font-bold mb-4">Records</h2>
      <button
        onClick={() => setIsModalOpen(true)}
        className="px-4 py-2 mb-4 rounded-lg bg-[#17CF97] text-white hover:bg-green-700 w-full"
      >
        + Add
      </button>

        {/* Accounts */}
        <h3
        className="font-bold mb-4 cursor-pointer flex items-center"
        onClick={() => setIsAccountsDropdownVisible(!isAccountsDropdownVisible)}
      >
        {/* Dropdown Icon */}
        <span className="mr-2">
          {isAccountsDropdownVisible ? <FaChevronDown /> : <FaChevronRight />}
        </span>
        ACCOUNTS
      </h3>
      
      {/* Dropdown */}
      {isAccountsDropdownVisible && (
      <div className="mb-4">
  {["All Accounts", ...accounts.map(account => account.name)].map((accountName) => (
    <div
      key={accountName}
      onClick={() => {
        setSelectedAccount(accountName);
        filterAndSortRecords(
          sortType,
          selectedCategory,
          accountName,
          dateRange.start,
          dateRange.end
        );
      }}
      className={`cursor-pointer py-1 ${
        selectedAccount === accountName ? "text-blue-600 font-bold" : "text-gray-600"
      }`}
    >
      {accountName}
    </div>
  ))}
</div>
)}

      {/* Categories */}
      <h3
        className="font-bold mb-4 cursor-pointer flex items-center"
        onClick={() => setIsCategoriesDropdownVisible(!isCategoriesDropdownVisible)}
      >
        {/* Dropdown Icon */}
        <span className="mr-2">
          {isCategoriesDropdownVisible ? <FaChevronDown /> : <FaChevronRight />}
        </span>
        CATEGORIES
      </h3>
        {/* Dropdown */}
      {isCategoriesDropdownVisible && (
      <div>
        {["All Categories", ...categories].map((category) => (
          <div
          key={category}
          onClick={() => {
            setSelectedCategory(category);
            filterAndSortRecords(
              sortType,
              category,
              selectedAccount,
              dateRange.start,
              dateRange.end
            );
          }}
          className={`cursor-pointer py-1 ${
            selectedCategory === category ? "text-blue-600 font-bold" : "text-gray-600"
          }`}
        >
          {category}
        </div>
        ))}
      </div>
            )}
    </div>
    

    {/* Main Content */}
    <div className="flex-1 bg-gray-100 p-4 rounded-lg shadow-md">

       {/* Balance, Sort by, and Date Filter Section */}
<div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm mb-4">
  {/* Balance */}
  <div>
    <h3 className="text-lg font-bold mb-2">Balance</h3>
    <p
      className={`text-xl font-bold ${
        calculateBalance() >= 0 ? "text-green-500" : "text-red-500"
      }`}
    >
      IDR {Math.abs(calculateBalance()).toLocaleString("id-ID")}
    </p>
  </div>

  {/* Date Filter and Sort by */}
  <div className="flex items-center gap-4">
    {/* Date Filter */}
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

    {/* Sort by */}
    <div>
      <select
        value={sortType}
        onChange={handleSortChange}
        className="w-48 px-3 py-2 border border-gray-300 rounded-lg focus:outline-blue-600"
      >
        <option value="TimeNewest">Time (Newest)</option>
        <option value="TimeOldest">Time (Oldest)</option>
        <option value="AmountHighest">Amount (Highest)</option>
        <option value="AmountLowest">Amount (Lowest)</option>
      </select>
    </div>
  </div>
</div>


      {/* Records List */}
      {records.map((record, index) => (
        <div
          key={`${record._id}-${index}`}
          className="flex justify-between items-center bg-white p-4 mb-4 rounded-lg shadow-sm"
        >
          <div className="flex w-full items-center">
            {/* Category & Date */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span>{getCategoryEmoji(record.category)}</span>
                <h3 className="font-bold">{record.category}</h3>
              </div>
              <p className="text-sm text-gray-500">
                    {new Date(record.dateTime).toLocaleString("id-ID", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false, // Optional: Use 24-hour time format
                    })}
                  </p>
            </div>

            {/* Account Info */}
            <div className="flex-1 text-center">
              {record.type === "Transfer (Outgoing)" ? (
                <p className="text-md font-semibold text-blue-600">
                  {record.accountId.name}
                </p>
              ) : record.type === "Transfer (Incoming)" ? (
                <p className="text-md font-semibold text-blue-600">
                  {record.accountId?.name}
                </p>
              ) : record.type === "Income" ? (
                <p className="text-md font-semibold text-blue-600">
                  {record.accountId.name}
                </p>
              ) : record.type === "Expense" ? (
                <p className="text-md font-semibold text-blue-600">
                  {record.accountId.name}
                </p>
              ) : null}
            </div>

            {/* Notes */}
            <div className="flex-1 text-center">
              <p className="text-sm text-gray-600">{record.note}</p>
            </div>

            {/* Notes */}
            <div className="flex-1 text-center">
              <p className="text-md text-black">{record.location}</p>
            </div>

            {/* Amount */}
            <div className="flex-1 text-right">
              <p className={`font-bold ${record.amount >= 0 ? "text-green-500" : "text-red-500"}`}>
                {record.amount >= 0 ? "+" : "-"}IDR {Math.abs(record.amount)}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 ml-4">
              <button
                onClick={() => handleEditRecord(record)}
                className="p-2 text-gray-600 hover:text-blue-600"
              >
                <Pencil size={20} />
              </button>
              <button
                onClick={() => openDeleteModal(record._id)}
                className="p-2 text-gray-600 hover:text-red-600"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>

  {/* Delete Confirmation Modal */}
  {isDeleteModalOpen && (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-200 bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">Delete Record</h2>
        <p>Are you sure you want to delete this record? This action cannot be undone.</p>
        <div className="mt-6 flex justify-end gap-4">
          <button
            onClick={() => setIsDeleteModalOpen(false)}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteRecord}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )}

{/* Add/Edit Record Modal */}
{isModalOpen && (
  <div className="fixed inset-0 flex items-center justify-center bg-slate-200 bg-opacity-50 z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg w-[40rem]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{isEditMode ? 'Edit Record' : 'Add New Record'}</h2>
        <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-800">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Tabs for Record Type */}
      <div className="flex justify-between mb-4">
        {['Expense', 'Income', 'Transfer'].map((type) => (
          <button
            key={type}
            onClick={() => setRecordType(type)}
            className={`px-4 py-2 rounded-lg ${
              recordType === type ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAddRecord();
        }}
      >
        {/* Two-Column Layout */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700">Account</label>
            <select
              name="accountId"
              value={newRecord.accountId || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-blue-600"
              required
            >
              {accounts.map((account) => (
                <option key={account._id} value={account._id}>
                  {account.name}
                </option>
              ))}
            </select>
          </div>

          {recordType === 'Expense' && (
            <div>
              <label className="block text-gray-700">Category</label>
              <select
              name="category"
              value={newRecord.category}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-blue-600"
              required
            >
              <option value="" disabled>
                Choose
              </option>
              {['Food & Beverages', 'Shopping', 'Housing', 'Transport', 'Entertainment', 'Recreation'].map(
                (category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                )
              )}
            </select>
            </div>
          )}

          {recordType === 'Transfer' && (
            <div>
              <label className="block text-gray-700">To Account</label>
              <select
                name="toAccountId"
                value={newRecord.toAccountId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-blue-600"
                required
              >
                {accounts.map((account) => (
                  <option key={account._id} value={account._id}>
                    {account.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-gray-700">Amount</label>
            <input
              type="number"
              name="amount"
              value={newRecord.amount}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-blue-600"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700">Date & Time</label>
            <input
              type="datetime-local"
              name="dateTime"
              value={newRecord.dateTime}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-blue-600"
              required
            />
          </div>

          {/* Location Field */}
          <div className="col-span-2">
            <label className="block text-gray-700">Location</label>
            <input
              type="text"
              name="location"
              value={newRecord.location}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-blue-600"
              placeholder="Enter the location"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-gray-700">Note</label>
            <textarea
              name="note"
              value={newRecord.note}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-blue-600"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-[#17CF97] text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          {isEditMode ? 'Save Changes' : 'Add Record'}
        </button>
      </form>
    </div>
  </div>
)}


  {/* Auto Logout Modal */}
  {showModal && <AutoLogoutModal countdown={countdown} onStaySignedIn={resetTimer} />}
</div>
  );
}