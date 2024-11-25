"use client";
import useAutoLogout from "../../../hook/useAutoLogout";
import { useState, useEffect } from "react";
import Loading from "../components/Loading";
import Container from "../components/Container";
import AutoLogoutModal from "../components/AutoLogoutModal";
import api from "@utils/apiAccount";
import { useUserContext } from "@/context/UserContext";
import { FiEdit, FiTrash } from "react-icons/fi";

type Account = {
  _id: string;
  name: string;
  type: string;
  initialAmount: number;
  balance: number;
};

export default function Dashboard() {
  const { showModal, countdown, resetTimer } = useAutoLogout(10 * 60 * 1000); // 10 minutes no activity
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [newAccount, setNewAccount] = useState({
    name: "",
    type: "Cash",
    initialAmount: 0,
  });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const { currentUser } = useUserContext();

  // Initialize user data
  useEffect(() => {
    const initializeUser = async () => {
      try {
        if (currentUser?.id) {
          setUserId(currentUser?.id);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error getting current user:", error);
        setLoading(false);
      }
    };

    initializeUser();
  }, [currentUser]);

  // Fetch accounts when userId is available
  useEffect(() => {
    if (userId) {
      fetchAccounts();
    }
  }, [userId]);

  // Function to fetch accounts
  const fetchAccounts = async () => {
    if (!userId) return;

    try {
      const response = await api.getAccounts(userId);
      setAccounts(response.data);
      setAccounts(response.data);
    } catch (error) {
      console.error("Error fetching accounts:", error);
    }
  };

  useEffect(() => {
    // Set loading to false after the component mounts
    setLoading(false);
  }, []);

  if (loading) {
    return <Loading />; // Show loading screen while loading is true
  }

  // Handle adding new account or editing existing account
  const handleAddAccount = async () => {
    if (!userId) return;

    try {
      if (selectedAccount) {
        // Edit existing account
        await api.updateAccount(selectedAccount._id, newAccount);
      } else {
        // Add new account
        await api.addAccount(userId, newAccount);
      }

      fetchAccounts();
      handleCloseModal();
      resetForm();
    } catch (error) {
      console.error("Error saving account:", error);
    }
  };

  const resetForm = () => {
    setNewAccount({ name: "", type: "Cash", initialAmount: 0 });
    setSelectedAccount(null);
    setIsEditMode(false);
  };

  // Handle input change
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewAccount({ ...newAccount, [name]: value });
  };

  // Handle delete account
  const handleDeleteAccount = async () => {
    if (accountToDelete) {
      try {
        await api.deleteAccount(accountToDelete);
        setAccounts(
          accounts.filter((account) => account._id !== accountToDelete)
        );
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

  const handleOpenModal = () => {
    setIsModalOpen(true);
    resetForm();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  return (
    <div>
      <Container>
        <div className="h-fit w-full p-4 bg-[#fafbfd] gap-y-4 flex flex-col">
          <div className="lg:flex lg:flex-row grid grid-cols-2 gap-x-3 gap-y-3">
            <div className="flex flex-row bg-gray-100 p-4 rounded-lg shadow-md w-full gap-x-3">
              {accounts.map((account) => (
                <div
                  key={account._id}
                  className={`flex justify-between items-center p-4 rounded-lg shadow-sm w-full ${
                    account.type === "Bank"
                      ? "bg-blue-200"
                      : account.type === "Cash"
                      ? "bg-red-200"
                      : "bg-white"
                  }`}
                >
                  <div className="flex flex-col w-full items-center overflow-auto">
                    <div className="flex flex-row justify-center items-center gap-x-2">
                      {/* Account Name */}
                      <div className="flex-1 text-left">
                        <h3 className="text-lg font-bold">{account.name}</h3>
                      </div>

                      {/* Account Type */}
                      <div className="flex-1 text-center">
                        <p className="text-gray-500">{account.type}</p>
                      </div>
                    </div>

                    <div>
                      {/* Account Balance */}
                      <div className="flex-1 text-right">
                        <span
                          className={`text-lg font-bold ${
                            account.balance < 0
                              ? "text-red-500"
                              : "text-green-500"
                          }`}
                        >
                          IDR {account.balance.toLocaleString("id-ID")}
                        </span>
                      </div>
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
            <button onClick={handleOpenModal}>
              <div className="flex flex-row items-center justify-center rounded-lg p-3 gap-2 w-full h-full border-gray-200 border-dashed border-4 hover:bg-gray-100 hover:text-gray-600 text-black">
                + Create Account
              </div>
            </button>
          </div>
        </div>
        <div className="grid lg:grid-cols-4 grid-cols-2 gap-4 auto-rows-fr">
            <div className="p-5 rounded-lg bg-gray-200 font">
              <h2 className="font-GeistVF font-semibold text-black text-3xl py-2">
                Expense Structure
              </h2>
              <div className="w-full h-[1px] bg-black"></div>
              <div>
                <h3 className="font-GeistVF font-medium text-lg text-gray-500">
                  This Month
                </h3>
                <h3 className="font-GeistMonoVF text-black text-2xl">
                  -Rp3.000.000
                </h3>
                {/* <DoughnutChart data={dummyData}></DoughnutChart> */}
              </div>
            </div>
            <div className="p-5 rounded-lg bg-gray-200">
              <h2 className="font-GeistVF font-semibold text-black text-3xl py-2">
                Last Records
              </h2>
              <div className="w-full h-[1px] bg-black mb-2"></div>
              <div className="flex flex-col gap-y-2">
                {/* <div>
                  <div className="flex flex-col gap-y-2">
                    {records.map((record) => (
                      <div
                        key={record.id}
                        className="flex flex-row items-center justify-between p-2 bg-white rounded-lg"
                      >
                        <div className="flex flex-row justify-center items-center gap-x-3">
                          <div className="flex justify-center items-center w-7 h-7 rounded-full bg-red-300">
                            <div style={{ color: "#FFFFFFF" }}>
                              <MdFastfood />
                            </div>
                          </div>
                          <div className="flex flex-col">
                            <h2>{record.category}</h2>
                            <h3>{record.accountId}</h3>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <h3>Rp.{record.amount}</h3>
                          <h3>{new Date(record.date).toLocaleString()}</h3>
                        </div>
                      </div>
                    ))}
                  </div>
                </div> */}
                <div>
                  <div className="flex flex-row items-center justify-between p-2 bg-white rounded-lg  ">
                    <div className="flex flex-row justify-center items-center gap-x-3">
                      <div className="flex justify-center items-center w-7 h-7 rounded-full bg-red-300">
                        <div style={{ color: "#FFFFFFF" }}>
                          {/* <MdFastfood /> */}
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <h2>Food & Beverage</h2>
                        <h3>Cash</h3>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <h3>Rp.100.000</h3>
                      <h3>19.00 21/10/2024</h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-5 rounded-lg bg-gray-200">
              <h2 className="font-GeistVF font-semibold text-black text-3xl py-2">
                Cash Flow
              </h2>
              <div className="w-full h-[1px] bg-black"></div>
              <h3 className="font-GeistVF font-medium text-lg text-gray-500">
                This Month
              </h3>
              <h3 className="font-GeistMonoVF text-black text-2xl">
                Rp1.000.000
              </h3>
              <div>
                <div className="flex flex-row justify-between">
                  <h4>Income</h4>
                  <h4>Rp.1.000.000</h4>
                </div>
                {/* <Progress value={90} /> */}
              </div>
              <div>
                <div className="flex flex-row justify-between">
                  <h4>Expense</h4>
                  <h4>Rp.220.000</h4>
                </div>
                {/* <Progress value={5} /> */}
              </div>
            </div>
            <div className="p-5 rounded-lg bg-gray-200">
              <h2 className="font-GeistVF font-semibold text-black text-3xl py-2">
                Balance Trend
              </h2>
              <div className="w-full h-[1px] bg-black"></div>
              <h3 className="font-GeistVF font-medium text-lg text-gray-500">
                Today
              </h3>
              <h3 className="font-GeistMonoVF text-black text-2xl">
                Rp1.000.000
              </h3>
              {/* <LineChart /> */}
            </div>
          </div>
      </Container>

      {/* Add/Edit Account Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-200 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {isEditMode ? "Edit Account" : "Add New Account"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-800"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddAccount(); // Memanggil logika yang sama untuk menambah atau mengedit akun
                setIsModalOpen(false); // Tutup modal setelah akun berhasil dibuat
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
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Account Type</label>
                <select
                  name="type"
                  value={newAccount.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-blue-600"
                  required
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
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                {isEditMode ? "Save Changes" : "Add Account"}
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
            <p>
              Are you sure you want to delete this account? This action cannot
              be undone.
            </p>
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
