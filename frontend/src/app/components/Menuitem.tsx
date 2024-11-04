interface MenuProfileProps{
    children: React.ReactNode;
    onClick:() => void;
}


const MenuProfile: React.FC<MenuProfileProps> = ({children, onClick}) => {
    return ( <div onClick={onClick} className=" px-4 py-3 hover:bg-neutral-400 transition">{children}</div> );
}
 
export default MenuProfile;