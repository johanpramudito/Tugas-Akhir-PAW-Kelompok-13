import { useState } from "react";

type DropdownFilterProps = {
  onSelect: (month: string | null, year: number | null) => void;
};

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

export default function DropdownFilter({ onSelect }: DropdownFilterProps) {
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleConfirm = () => {
    onSelect(selectedMonth, selectedYear);
    setIsModalOpen(false);
  };

  return (
    <>
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        onClick={() => setIsModalOpen(true)}
      >
        Select Month/Year
      </button>
      
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-xs w-full">
            <h2 className="text-xl font-semibold text-center mb-4">Select Month and Year</h2>
            
            <label className="block text-gray-700 mb-2">Select Month</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              onChange={(e) => setSelectedMonth(e.target.value)}
              value={selectedMonth || ""}
            >
              <option value="" disabled>Select a month</option>
              {months.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
            
            <label className="block text-gray-700 mb-2">Select Year</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              value={selectedYear || ""}
            >
              <option value="" disabled>Select a year</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>

            <div className="flex justify-end mt-4 space-x-2">
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                onClick={handleConfirm}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
