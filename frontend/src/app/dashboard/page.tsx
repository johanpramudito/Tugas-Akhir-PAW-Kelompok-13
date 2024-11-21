"use client";

import useAutoLogout from "../../../hook/useAutoLogout";
import { useState, useEffect } from "react";
import Loading from "../components/Loading";
import Container from "../components/Container";
import AutoLogoutModal from "../components/AutoLogoutModal";
import AccountCard from "../components/dashboard/AccountCard";
import DoughnutChart from "../components/chart/DoughnutChart";
import LineChart from "../components/chart/LineChart";
import { MdFastfood } from "react-icons/md";
import { Progress } from "@/components/ui/progress";
import DropdownFilter from "@/app/components/dashboard/DropdownFilter";

export default function Dashboard() {
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const { showModal, countdown, resetTimer } = useAutoLogout(10 * 60 * 1000); //10 minutes no activity
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set loading to false after the component mounts
    setLoading(false);
  }, []);

  if (loading) {
    return <Loading />; // Show loading screen while loading is true
  }

  const dummyData = [
    { label: "Red", value: 300 },
    { label: "Blue", value: 50 },
    { label: "Yellow", value: 100 },
    { label: "Green", value: 150 },
    { label: "Purple", value: 200 },
  ];

  const handleSelect = (month: string | null, year: number | null) => {
    setSelectedMonth(month);
    setSelectedYear(year);
  };

  return (
    <div>
      <Container>
        <div className="h-fit w-full p-4 bg-[#fafbfd] gap-y-4 flex flex-col">
          <div className="lg:flex lg:flex-row grid grid-cols-2 gap-x-3 gap-y-3">
            <AccountCard type="Cash" amount={0} />
            <AccountCard type="Debit Account" amount={1000000} />
            <AccountCard type="Credit Account" amount={500000} />
            <button>
              <div className="flex flex-row items-center justify-center rounded-lg p-3 gap-2 w-full h-full border-gray-200 border-dashed border-4 hover:bg-gray-100 hover:text-gray-600 text-black">
                + Create Account
              </div>
            </button>
          </div>
          <div>
          <DropdownFilter onSelect={handleSelect} />

            <div className="mt-4">
              <p className="text-gray-700">
                Selected Month: <span className="font-semibold">{selectedMonth}</span>
              </p>
              <p className="text-gray-700">
                Selected Year: <span className="font-semibold">{selectedYear}</span>
              </p>
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
                <h3 className="font-GeistMonoVF text-black text-2xl">-Rp3.000.000</h3>
                <DoughnutChart data={dummyData}></DoughnutChart>
              </div>
            </div>
            <div className="p-5 rounded-lg bg-gray-200">
              <h2 className="font-GeistVF font-semibold text-black text-3xl py-2">
                Last Records
              </h2>
              <div className="w-full h-[1px] bg-black mb-2"></div>
              <div className="flex flex-col gap-y-2">
                <div>
                  <div className="flex flex-row items-center justify-between p-2 bg-white rounded-lg  ">
                    <div className="flex flex-row justify-center items-center gap-x-3">
                      <div className="flex justify-center items-center w-7 h-7 rounded-full bg-red-300">
                        <div style={{color: "#FFFFFFF"}}>
                          <MdFastfood/>
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
                <div>
                  <div className="flex flex-row items-center justify-between p-2 bg-white rounded-lg  ">
                    <div className="flex flex-row justify-center items-center gap-x-3">
                      <div className="flex justify-center items-center w-7 h-7 rounded-full bg-red-300">
                        <div style={{color: "#FFFFFFF"}}>
                          <MdFastfood/>
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
              <h3 className="font-GeistVF font-medium text-lg text-gray-500">This Month</h3>
              <h3 className="font-GeistMonoVF text-black text-2xl">Rp1.000.000</h3>
              <div>
                <div className="flex flex-row justify-between">
                  <h4>Income</h4>
                  <h4>Rp.1.000.000</h4>
                </div>
                <Progress value={90} />
              </div>
              <div>
                <div className="flex flex-row justify-between">
                  <h4>Expense</h4>
                  <h4>Rp.220.000</h4>
                </div>
                <Progress value={5}/>
              </div>
            </div>
            <div className="p-5 rounded-lg bg-gray-200">
              <h2 className="font-GeistVF font-semibold text-black text-3xl py-2">
                Balance Trend
              </h2>
              <div className="w-full h-[1px] bg-black"></div>
              <h3 className="font-GeistVF font-medium text-lg text-gray-500">Today</h3>
              <h3 className="font-GeistMonoVF text-black text-2xl">Rp1.000.000</h3>
              <LineChart />
            </div>
          </div>
        </div>
      </Container>
      {showModal && (
        <AutoLogoutModal countdown={countdown} onStaySignedIn={resetTimer} />
      )}
    </div>
  );
}
