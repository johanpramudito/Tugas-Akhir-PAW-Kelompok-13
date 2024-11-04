"use client"

// Profile.tsx
import { useCallback, useState } from "react";
import Avatar from "../Avatar";
import { AiFillCaretDown } from "react-icons/ai";
import MenuProfile from "../Menuitem";
import { SafeUser } from "../../../../types"; // Make sure to import SafeUser
import { signIn, signOut } from "next-auth/react";

interface ProfileProps {
    currentUser: SafeUser | null;
}

const Profile: React.FC<ProfileProps> = ({ currentUser }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleOpen = useCallback(() => {
        setIsOpen((prev) => !prev);
    }, []);

    return (
        <div className="relative z-30">
            <div onClick={toggleOpen} className="p-2 border-[1px] flex flex-row items-center gap-1 rounded-full cursor-pointer hover:shadow-md transition text-black">
                <Avatar src={currentUser?.image}/>
                <p className="hidden md:block">{currentUser?.name}</p>
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
