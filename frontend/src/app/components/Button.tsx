'use client'

import { IconType } from "react-icons";

interface ButtonProps {
    label: string,
    disabled?: boolean,
    outline?: boolean,
    small?: boolean,
    custom?: string,
    icon?: IconType
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const Button: React.FC<ButtonProps> = ({
    label,
    disabled,
    outline,
    small,
    custom,
    icon: Icon,
    onClick,  // Add onClick to the destructured props
}) => {
    return (
        <button 
            onClick={onClick}  // Add the onClick handler here
            disabled={disabled} 
            className={`
                disabled:opacity-70 
                disabled:cursor-not-allowed 
                rounded-md 
                hover:opacity-80 
                transition 
                w-full 
                flex 
                items-center 
                justify-center 
                gap-2 
                ${outline ? "bg-blue-500" : "bg-green-500"}
                ${outline ? "text-white" : "text-black"}
                ${small ? "text-sm font-normal" : "text-md font-semibold"}
                ${custom ? custom : ''}
            `}
        >
            {Icon && <Icon size={24}/>}
            {label}
        </button>
    );
}
 
export default Button;