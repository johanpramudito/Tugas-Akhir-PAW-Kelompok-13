'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
}

const NavLink: React.FC<NavLinkProps> = ({ href, children }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link 
      href={href} 
      className={`
        ${isActive ? 'font-semibold text-black' : 'text-gray-500'} 
        hover:text-black 
        transition-colors 
        duration-200
      `}
    >
      {children}
    </Link>
  );
};

export default NavLink;