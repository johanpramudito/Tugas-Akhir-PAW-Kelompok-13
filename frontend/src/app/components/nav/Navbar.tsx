import Container from "../Container";
import Link from "next/link";
import Profile from "./Profile";
import { getCurrentUser } from "../../../../actions/getCurrentUser";

const Navbar =  async() => {
    
    const currentUser = await getCurrentUser();

    return (
    <div className="sticky top-0 w-full bg-white z-30 shadow-sm">
        <div className="py-4 border-b-[1px]">
            <Container>
                <div className="flex items-center justify-between gap-3 md:gap-0">
                    <div className="flex items-center gap-8 md:gap-12">
                    <div className="hidden md:block font-semibold">Expense Tracker</div>
                    <Link href="/" className={' text-gray-400'}>Dashboard</Link>
                    <Link href="/accounts" className={' text-gray-400'}>Accounts</Link>
                    <Link href="/records" className={' text-gray-400'}>Records</Link>
                    </div>
                    <div className="flex items-center">
                    <Profile currentUser={currentUser}/>
                    </div>
                </div>
            </Container>
        </div>
    </div>
    );
}

export default Navbar;