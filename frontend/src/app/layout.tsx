import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "./components/nav/Navbar";
import { Poppins } from "next/font/google"
import { getCurrentUser } from "../../actions/getCurrentUser";

const poppins = Poppins({ subsets: ["latin"], weight:['400', '700']})

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

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
        <Navbar/>
       <main className="flex-grow bg-gray-50">{children}</main>
       </div>
      </body>
    </html>
  );
}
