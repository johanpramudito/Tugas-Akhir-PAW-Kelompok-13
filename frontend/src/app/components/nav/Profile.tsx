"use client"; // Ensure this component is a client component

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Correct import for client component routing in app directory
import Avatar from "../Avatar";
import { AiFillCaretDown } from "react-icons/ai";
import MenuProfile from "../Menuitem";
import { SafeUser } from "../../../../types";
import { signIn, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

interface ProfileProps {
    currentUser: SafeUser | null;
}

const Profile: React.FC<ProfileProps> = ({ currentUser }) => {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();  // Get current path using usePathname

    // Only perform the redirect if `currentUser` exists and this is running in the browser
    useEffect(() => {
        if (currentUser) {
            // Check the current path and redirect accordingly
            if (pathname === '/') {
                router.push('/dashboard');
            } else if (pathname === '/dashboard') {
                router.push('/dashboard');
            } else if (pathname === '/accounts') {
                router.push('/accounts');
            } else if (pathname === '/records') {
                router.push('/records');
            }
        } else {
            router.push('/');
        }
    }, [currentUser, pathname, router]);  // Include pathname in dependencies

    const toggleOpen = useCallback(() => {
        setIsOpen((prev) => !prev);
    }, []);

    return (
        <div className="relative z-30">
            <div onClick={toggleOpen} className="p-2 border-[1px] flex flex-row items-center gap-1 rounded-full cursor-pointer hover:shadow-md transition text-black">
                <Avatar src={currentUser?.image}/>
                <p className="hidden lg:block">{currentUser?.name}</p>
                <AiFillCaretDown />
            </div>
            {isOpen && (
                <div className="absolute rounded-md shadow-md w-[170px] bg-white overflow-hidden right-0 top-12 text-sm flex flex-col cursor-pointer">
                    {currentUser ? (
                        <div>
                            <MenuProfile onClick={() => { toggleOpen(); signOut(); }}>Logout</MenuProfile>
                        </div>
                    ) : (
                        <div>
                            <MenuProfile onClick={() => { toggleOpen(); signIn("google"); }}>Login</MenuProfile>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default Profile;
