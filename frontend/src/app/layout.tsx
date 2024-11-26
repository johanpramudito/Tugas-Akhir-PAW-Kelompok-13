import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/nav/Navbar";
import { Poppins } from "next/font/google"
import { getCurrentUser } from "../../actions/getCurrentUser";
import { UserProvider } from "@/context/UserContext";

const poppins = Poppins({ subsets: ["latin"], weight:['400', '700']})

export const metadata: Metadata = {
  title: "Expense Tracker",
  icons: "/logo.svg",
  description: "Kelompok 13 App",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const currentUser = await getCurrentUser();

  console.log("user<<<", currentUser);

  return (
    <html lang="en">
      <body className={poppins.className}>
        <div className="flex flex-col min-h-screen">
        <UserProvider initialUser={currentUser}>
        <Navbar/>
       <main className="flex-grow bg-gray-50">{children}</main>
       </UserProvider>
       </div>
      </body>
    </html>
  );
}
