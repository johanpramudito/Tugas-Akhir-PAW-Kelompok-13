"use client";
import useAutoLogout from "../../../hook/useAutoLogout";
import { useState, useEffect } from "react";
import Loading from "../components/Loading";
import Container from "../components/Container";
import AutoLogoutModal from "../components/AutoLogoutModal";
import apiAccount from "@utils/apiAccount";
import apiRecord from "@utils/apiRecord";
import { useUserContext } from "@/context/UserContext";
import { FiEdit, FiTrash } from "react-icons/fi";
import { AiOutlineSelect } from "react-icons/ai";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2"; // Import Doughnut
export const revalidate = 60;


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
  const [chartData, setChartData] = useState<{
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string[];
      hoverOffset: number;
    }[];
  } | null>(null);
  const [totalExpense, setTotalExpense] = useState(0);
  type Record = {
    _id: string;
    category: string;
    note?: string;
    amount: number;
    dateTime: string;
    type: string;
  };

  const [latestRecords, setLatestRecords] = useState<Record[]>([]);
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);

  const categoryColors = {
    "Food & Beverages": "#FF6384",
    Shopping: "#36A2EB",
    Housing: "#FFCE56",
    Transport: "#4BC0C0",
    Entertainment: "#9966FF",
    Recreation: "#FF9F40",
    Income: "#4CAF50",
    Transfer: "#F44336",
  };

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
      const response = await apiAccount.getAccounts(userId);
      setAccounts(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching accounts:", error);
    }
  };

  const fetchRecords = async (accountId?: string) => {
    try {
      if (!userId) return;
  
      // Ambil data akun berdasarkan userId
      const AccountResponse = await apiAccount.getAccounts(userId);
      const accounts = AccountResponse.data;
  
      // Hitung initialAmount dari akun yang dipilih (jika ada)
      let initialAmountFromAccounts = 0;
  
      if (accountId) {
        // Jika ada akun yang dipilih, hanya hitung initialAmount dari akun tersebut
        const selectedAccount = accounts.find((account: Account) => account._id === accountId);
        if (selectedAccount) {
          initialAmountFromAccounts = selectedAccount.initialAmount || 0;
        }
      } else {
        // Jika tidak ada akun yang dipilih, jumlahkan initialAmount dari semua akun Cash dan Bank
        initialAmountFromAccounts = accounts
          .filter(
            (account: Account) =>
              account.type === "Cash" || account.type === "Bank"
          )
          .reduce(
            (acc: number, account: Account) => acc + (account.initialAmount || 0),
            0
          );
      }
  
      let records: Record[] = [];
  
      // Ambil data records berdasarkan akun yang dipilih (jika ada)
      if (accountId) {
        const response = await apiRecord.getRecordByAccount(accountId); // Ambil records berdasarkan accountId
        records = response.data;
      } else {
        // Ambil semua data records (Expense dan Income) berdasarkan userId
        const response = await apiRecord.getRecordByUser(userId);
        records = response.data;
      }
  
      // Filter untuk hanya mengambil records bertipe "Expense"
      const expenseRecords = records.filter(
        (record: Record) => record.type === "Expense"
      );
  
      // Hitung total expense
      const totalExpense = expenseRecords.reduce(
        (sum: number, record: Record) => sum + (record.amount || 0), // Pastikan amount ada
        0
      );
  
      // Set total expense ke state
      setTotalExpense(totalExpense);
  
      // Hitung total income, termasuk initialAmount dari akun yang dipilih atau semua akun "Cash" dan "Bank"
      const incomeRecords = records.filter(
        (record: Record) => record.type === "Income"
      );
  
      const totalIncome = incomeRecords.reduce(
        (acc: number, record: Record) => acc + (record.amount || 0), // Pastikan amount ada
        initialAmountFromAccounts // Tambahkan initialAmount sesuai kondisi
      );
  
      // Set nilai total Income dan Expense ke state
      setIncome(totalIncome);
      setExpense(totalExpense);
  
      // Kategori chart: group by category dan total expense per kategori
      const categories: { [key: string]: number } = {};
      expenseRecords.forEach((record: Record) => {
        categories[record.category] =
          (categories[record.category] || 0) + (record.amount || 0);
      });
  
      const labels = Object.keys(categories);
      const data = Object.values(categories);
  
      // Set chart data
      setChartData({
        labels,
        datasets: [
          {
            label: "Expenses by Category",
            data,
            backgroundColor: labels.map(
              (label) =>
                categoryColors[label as keyof typeof categoryColors] || "#FF0000", // Default warna jika tidak ada match
            ),
            hoverOffset: 4,
          },
        ],
      });
  
      // Urutkan data berdasarkan dateTime secara menurun
      const sortedRecords = records.sort(
        (a: Record, b: Record) =>
          new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
      );
  
      // Ambil 5 record terbaru
      const latestRecords = sortedRecords.slice(0, 5);
      setLatestRecords(latestRecords); // Simpan data untuk dirender
    } catch (error) {
      console.error("Error fetching records:", error);
    }
  };
  

  useEffect(() => {
    // Set loading to false after the component mounts
    setLoading(false);
  }, []);

  useEffect(() => {
    if (userId) {
      fetchRecords();
    }
  }, [userId]);

  if (loading) {
    return <Loading />; // Show loading screen while loading is true
  }

  // Handle adding new account or editing existing account
  const handleAddAccount = async () => {
    if (!userId) return;

    try {
      if (selectedAccount) {
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
        await apiAccount.deleteAccount(accountToDelete);
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

  ChartJS.register(ArcElement, Tooltip, Legend);

  return (
    <div>
      <Container>
        <div className="h-fit w-full p-4 bg-[#fafbfd] gap-y-4 flex flex-col">
          <div className="lg:flex lg:flex-row flex-col w-full gap-x-3 gap-y-3 items-center justify-center">
            <div className="flex lg:flex-row flex-col bg-gray-100 p-4 rounded-lg shadow-md w-full gap-y-3 lg:gap-y-0 lg:gap-x-3">
              {accounts.map((account) => (
                <div
                  key={account._id}
                  onClick={() => {
                    setSelectedAccount(account); // Set akun yang dipilih
                    fetchRecords(account._id); // Panggil fetchRecords dengan accountId yang dipilih
                  }}
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
                    <button className="text-gray-600 hover:text-teal-600">
                      <AiOutlineSelect size={20} />
                    </button>
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
        <div className="flex lg:flex-row flex-col gap-4 auto-rows-fr justify-center ">
          <div className="p-5 rounded-lg bg-gray-200 w-full lg:w-[500px]">
            <h2 className="font-GeistVF font-semibold text-black text-3xl py-2">
              Expense Structure
            </h2>
            <div className="w-full h-[1px] bg-black"></div>
            <div>
              <h3 className="font-GeistMonoVF text-black text-2xl">
                {totalExpense === 0
                  ? "No Expenses"
                  : `Rp${totalExpense.toLocaleString("id-ID")}`}
              </h3>

              {chartData ? (
                <Doughnut
                  data={chartData}
                  options={{
                    cutout: "50%", // Ukuran lubang tengah (50% dari diameter chart)
                    plugins: {
                      legend: {
                        display: true,
                        position: "bottom",
                      },
                    },
                  }}
                />
              ) : (
                <div>Loading chart...</div>
              )}
            </div>
          </div>
          <div className="p-5 rounded-lg bg-gray-200 w-full lg:w-[500px]">
            <h2 className="font-GeistVF font-semibold text-black text-3xl py-2">
              Last Records
            </h2>
            <div className="w-full h-[1px] bg-black mb-2"></div>
            <div className="flex flex-col gap-y-2">
              <div className="flex flex-col gap-y-4">
                {latestRecords.length > 0 ? (
                  latestRecords.map((record) => (
                    <div
                      key={record._id}
                      className="flex flex-row items-center justify-between p-2 bg-white rounded-lg"
                    >
                      <div className="flex flex-row justify-center items-center gap-x-3">
                        <div
                          className="flex justify-center items-center w-7 h-7 rounded-full"
                          style={{
                            backgroundColor:
                              categoryColors[
                                record.category as keyof typeof categoryColors
                              ] || "#FF0000",
                          }}
                        ></div>
                        <div className="flex flex-col">
                          <h2 className="xl:text-lg font-semibold">
                            {record.category}
                          </h2>
                          <h3>{record.note || "No note"}</h3>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <h3>Rp.{record.amount.toLocaleString("id-ID")}</h3>
                        <h3>
                          {new Date(record.dateTime).toLocaleTimeString(
                            "id-ID",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}{" "}
                          {new Date(record.dateTime).toLocaleDateString(
                            "id-ID"
                          )}
                        </h3>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex justify-center items-center p-4 bg-gray-100 rounded-lg">
                    <h2 className="text-gray-500 text-lg">
                      No Record Available
                    </h2>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="p-5 rounded-lg bg-gray-200 w-full lg:w-[500px]">
            <h2 className="font-GeistVF font-semibold text-black text-3xl py-2">
              Cash Flow
            </h2>
            <div className="w-full h-[1px] bg-black"></div>
            <h3 className="font-GeistMonoVF text-black text-2xl">
              {selectedAccount ? (  
                `Rp${selectedAccount.balance.toLocaleString("id-ID")}`
                ): ( `Rp${income - expense > 0 ? income - expense : 0}` )
              }
            </h3>{" "}
            {/* Menampilkan saldo bulan ini */}
            {/* Income */}
            <div>
              <div className="flex flex-row justify-between">
                <h4>Income</h4>
                <h4>Rp{income.toLocaleString("id-ID")}</h4>{" "}
              </div>
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <span className="text-xs font-medium">Progress</span>
                  <span className="text-xs font-medium">
                    {((income / (expense + income)) * 100).toFixed(0)}%
                  </span>
                </div>
                {/* Progress bar for Income */}
                <div className="flex mb-2 w-full h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{
                      width: `${((income / (expense + income)) * 100).toFixed(
                        0
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
            {/* Expense */}
            <div>
              <div className="flex flex-row justify-between">
                <h4>Expense</h4>
                <h4>Rp{expense.toLocaleString("id-ID")}</h4>{" "}
              </div>
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <span className="text-xs font-medium">Progress</span>
                  <span className="text-xs font-medium">
                    {((expense / (expense + income)) * 100).toFixed(0)}%
                  </span>
                </div>
                {/* Progress bar for Expense */}
                <div className="flex mb-2 w-full h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-full bg-red-500 rounded-full"
                    style={{
                      width: `${((expense / (expense + income)) * 100).toFixed(
                        0
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
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
