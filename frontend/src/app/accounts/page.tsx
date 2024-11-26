/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import useAutoLogout from "../../../hook/useAutoLogout";
import { useState, useEffect } from "react";
import Loading from "../components/Loading";
import AutoLogoutModal from "../components/AutoLogoutModal";
import apiAccount from "@utils/apiAccount";
import { FiEdit, FiTrash } from 'react-icons/fi'; 
import { useUserContext } from "@/context/UserContext";
export const revalidate = 60;


type Account = {
  _id: string;
  name: string;
  type: string;
  initialAmount: number;
  balance: number;
};

export default function Account() {
  const { showModal, countdown, resetTimer } = useAutoLogout(10 * 60 * 1000); // 10 minutes no activity
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortType, setSortType] = useState('default');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [newAccount, setNewAccount] = useState({ name: '', type: 'Cash', initialAmount: 0 });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const { currentUser } = useUserContext();
  const [allAccounts, setAllAccounts] = useState<Account[]>([]);
  const [query, setQuery] = useState<string>('');
  

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
  }, []);

  // Fetch accounts when userId is available
  useEffect(() => {
    if (userId) {
      fetchAccounts();
    }
  }, [userId]);

  useEffect(() => {
    // Set loading to false after the component mounts
    setLoading(false);
  }, []);

  if (loading) {
    return <Loading />; // Show loading screen while loading is true
  }

  // Function to fetch accounts
  const fetchAccounts = async () => {
    if (!userId) return;
  
    try {
      const response = await apiAccount.getAccounts(userId);
      setAccounts(response.data);
      setAllAccounts(response.data); // Store the fetched accounts for searching
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  // // Fetch accounts on component mount
  // useEffect(() => {
  //   fetchAccounts();
  // }, []);

  // Handle search functionality
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    filterAndSortAccounts(query, sortType);
    if (e.target.value === '') {
      setAccounts(allAccounts); // If search is cleared, show all accounts
    } else {
      // Filter accounts based on search query
      const filteredAccounts = allAccounts.filter(account =>
        account.name.toLowerCase().includes(e.target.value.toLowerCase()));
      setAccounts(filteredAccounts);
    }
  };

  // Function to handle sorting changes
const handleSortChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
  const selectedSort = e.target.value;
  setSortType(selectedSort);

  // Filter and sort based on the selected sort type
  filterAndSortAccounts(searchQuery, selectedSort);
};

const filterAndSortAccounts = (search: string, sort: string) => {
  let filteredAccounts = [...allAccounts];

  // Filter based on search query
  if (search) {
    filteredAccounts = filteredAccounts.filter(account =>
      account.name.toLowerCase().includes(search.toLowerCase()));
  }

  // Sort based on sort type
  if (sort === 'A-Z') {
    filteredAccounts.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sort === 'Z-A') {
    filteredAccounts.sort((a, b) => b.name.localeCompare(a.name));
  } else if (sort === 'BalanceLowest') {
    filteredAccounts.sort((a, b) => a.balance - b.balance);
  } else if (sort === 'BalanceHighest') {
    filteredAccounts.sort((a, b) => b.balance - a.balance);
  }

  setAccounts(filteredAccounts); // Update the accounts state
};

  // Handle adding new account or editing existing account
  const handleAddAccount = async () => {
    if(!userId) return;

    try {
      if (isEditMode && selectedAccount) {
        // Edit existing account
        await apiAccount.updateAccount(selectedAccount._id, newAccount);
      } else {
        // Add new account
        await apiAccount.addAccount(userId, newAccount);
      }

      fetchAccounts();
      handleCloseModal();
      resetForm();
    } catch (error) {
      console.error('Error saving account:', error);
    }
  };

  // Reset form fields
  const resetForm = () => {
    setNewAccount({ name: '', type: 'Cash', initialAmount: 0 });
    setSelectedAccount(null);
    setIsEditMode(false);
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewAccount({ ...newAccount, [name]: value });
  };

  // Handle delete account
  const handleDeleteAccount = async () => {
    if (accountToDelete) {
      try {
        await apiAccount.deleteAccount(accountToDelete);
        setAccounts(accounts.filter((account) => account._id !== accountToDelete));
        console.log(`Account with ID: ${accountToDelete} has been deleted.`);
      } catch (error) {
        console.error("Error deleting account:", error);
      } finally {
        setIsDeleteModalOpen(false);
        setAccountToDelete(null);
      }
    }
  };
  
  const openDeleteModal = (id: string) => {
    setIsDeleteModalOpen(true);
    setAccountToDelete(id);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setAccountToDelete(null);
  };

  // Handle open modal for edit
  const handleEditAccount = (account: Account) => {
    setSelectedAccount(account);
    setNewAccount({
      name: account.name,
      type: account.type,
      initialAmount: account.balance,
    });
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  // Modal control
  const handleOpenModal = () => {
    setIsModalOpen(true);
    resetForm();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Sidebar */}
        <div className="bg-white p-4 rounded-lg shadow-md w-full md:w-1/4">
          <h2 className="text-xl font-bold mb-4">Accounts</h2>
          <button
            onClick={handleOpenModal}
            className="px-4 py-2 mb-4 rounded-lg bg-[#17CF97] text-white hover:bg-green-700"
          >
            + Add
          </button>
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={handleSearch}
            className="w-full mb-4 px-3 py-2 border border-gray-300 rounded-lg focus:outline-blue-600"
          />
          <label className="block mb-2 text-gray-700">Sort by</label>
          <select
            value={sortType}
            onChange={handleSortChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-blue-600"
          >
            <option value="default">Default</option>
            <option value="A-Z">A-Z</option>
            <option value="Z-A">Z-A</option>
            <option value="BalanceLowest">Lowest Balance</option>
            <option value="BalanceHighest">Highest Balance</option>
          </select>
        </div>

       {/* Accounts List */}
         <div className="flex-1 bg-gray-100 p-4 rounded-lg shadow-md">
           {accounts.map((account) => (
            <div
              key={account._id}
              className="flex justify-between items-center bg-white p-4 mb-4 rounded-lg shadow-sm"
            >
              <div className="flex w-full items-center">
                {/* Account Name */}
                <div className="flex-1 text-left">
                  <h3 className="text-lg font-bold">{account.name}</h3>
                </div>

                {/* Account Type */}
                <div className="flex-1 text-center">
                  <p className="text-gray-500">{account.type}</p>
                </div>

                {/* Account Balance */}
                <div className="flex-1 text-right">
                  <span className={`text-lg font-bold ${account.balance < 0 ? 'text-red-500' : 'text-green-500'}`}>
                    IDR {account.balance.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Edit and Delete Buttons */}
              <div className="flex items-center gap-4 ml-4">
                <button
                  onClick={() => handleEditAccount(account)}
                  className="text-gray-600 hover:text-blue-600"
                >
                  <FiEdit size={20} />
                </button>
                <button
                  onClick={() => openDeleteModal(account._id)}
                  className="text-gray-600 hover:text-red-600"
                >
                  <FiTrash size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add/Edit Account Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-200 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{isEditMode ? 'Edit Account' : 'Add New Account'}</h2>
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
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddAccount();
              }}
            >
              <div className="mb-4">
                <label className="block text-gray-700">Account Name</label>
                <input
                  type="text"
                  name="name"
                  value={newAccount.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-blue-600"
                  required // Make this field required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Account Type</label>
                <select
                  name="type"
                  value={newAccount.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-blue-600"
                  required // Make this field required
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank">Bank</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Initial Amount</label>
                <input
                  type="number"
                  name="initialAmount"
                  value={newAccount.initialAmount}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-blue-600"
                  required // Make this field required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                {isEditMode ? 'Save Changes' : 'Add Account'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-200 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Delete Account</h2>
            <p>Are you sure you want to delete this account? This action cannot be undone.</p>
            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

       {showModal && (
        <AutoLogoutModal countdown={countdown} onStaySignedIn={resetTimer} />
      )}
    </div>
  );
}