import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, X, User, LogOut, LogIn, Map, PlusCircle, Compass } from 'lucide-react';

const Header = () => {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActivePath = (path: string) => {
    return pathname === path;
  };

  const handleLoginClick = () => {
    router.push('/social_login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Map className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold">Travel Planner</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                isActivePath('/') ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              홈
            </Link>
            <Link 
              href="/Explore" 
              className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                isActivePath('/Explore') ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              탐색하기
            </Link>
            <Link 
              href="/create_plan" 
              className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                isActivePath('/create_plan') ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              계획 만들기
            </Link>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 p-0">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>{session.user?.name || '사용자'}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center text-red-600" onClick={() => signOut()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>로그아웃</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                variant="ghost" 
                onClick={handleLoginClick}
                className="flex items-center space-x-2"
              >
                <LogIn className="h-5 w-5" />
                <span>로그인</span>
              </Button>
            )}
            <Button 
              onClick={() => router.push('/create_plan')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> 새 여행 계획
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 space-y-4">
            <Link
              href="/"
              className="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Map className="inline-block mr-2 h-4 w-4" /> 홈
            </Link>
            <Link
              href="/Explore"
              className="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Compass className="inline-block mr-2 h-4 w-4" /> 탐색하기
            </Link>
            <Link
              href="/create_plan"
              className="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <PlusCircle className="inline-block mr-2 h-4 w-4" /> 계획 만들기
            </Link>
            {session ? (
              <>
                <div className="px-4 py-2 text-sm text-gray-600">
                  <User className="inline-block mr-2 h-4 w-4" />
                  {session.user?.name || '사용자'}
                </div>
                <button
                  onClick={() => {
                    signOut();
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-gray-100 rounded-lg"
                >
                  <LogOut className="inline-block mr-2 h-4 w-4" /> 로그아웃
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  handleLoginClick();
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-100 rounded-lg"
              >
                <LogIn className="inline-block mr-2 h-4 w-4" /> 로그인
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;