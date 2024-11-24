import Container from "../Container";
import Profile from "./Profile";
import { getCurrentUser } from "../../../../actions/getCurrentUser";
import NavLink from "./Navlink";

const Navbar = async () => {
    const currentUser = await getCurrentUser();

    return (
        <div className="sticky top-0 w-full bg-white z-30 shadow-sm">
            <div className="py-4 border-b-[1px]">
                <Container>
                    <div className="flex items-center justify-between gap-3 md:gap-0">
                        <div className="flex items-center gap-8 md:gap-12">
                        <div className="hidden md:flex items-center space-x-2">
                            <img src={'./logo.svg'} alt="logo" width={30} height={30}/>
                            <div className="font-semibold">Expense Tracker</div>
                        </div>
                            {currentUser ? (
                                <>
                                    <NavLink href="/dashboard">Dashboard</NavLink>
                                    <NavLink href="/accounts">Accounts</NavLink>
                                    <NavLink href="/records">Records</NavLink>
                                </>
                            ) : (
                                <div className=" flex items-center space-x-2 md:hidden">
                                    <img src={'./logo.svg'} alt="logo" width={30} height={30}/>
                                    <div className="font-semibold">Expense Tracker</div>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center">
                            <Profile currentUser={currentUser} />
                        </div>
                    </div>
                </Container>
            </div>
        </div>
    );
}

export default Navbar;
