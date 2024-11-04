'use client'

import { IconType } from "react-icons";

interface ButtonProps{
    label: string,
    disabled?: boolean,
    outline?: boolean,
    small?: boolean,
    custom?: string,
    icon?: IconType
    onClick: (e: React.MouseEvent<HTMLButtonElement>)
    => void;
}

const Button: React.FC<ButtonProps>= ({
    label,
    disabled,
    outline,
    small,
    custom,
    icon: Icon,
    onClick,
}) => {
    return ( <button disabled = {disabled} className={`disabled:opacity-70 disabled: cursor-not-allowed rounded-md hover:opacity-80 transition w-full flex items-center justify-center gap-2 ${outline ? "bg-white" : "bg-green-500"} ${outline ? " text-black": "text-white"} ${small ? "text-sm font-normal" : "text-md font-semibold"} ${custom ? custom : ''}`}>
        {Icon && <Icon size={24}/>}
        {label}
    </button> );
}
 
export default Button;