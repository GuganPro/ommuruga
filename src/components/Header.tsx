"use client";

import { useContext } from 'react';
import Link from 'next/link';
import { ShoppingCart, User, Menu, X } from 'lucide-react';
import { AppContext } from '@/context/AppContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';

export default function Header() {
  const { cart, isLoggedIn } = useContext(AppContext);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = (
    <>
      <Link href="/" className="transition-colors hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
      <Link href="/seller" className="transition-colors hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>Seller</Link>
    </>
  );

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="font-headline text-2xl font-bold text-primary">
          Om Muruga Online
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          {navLinks}
        </nav>
        <div className="flex items-center gap-4">
          <Link href={isLoggedIn ? "/profile" : "/login"}>
            <Button variant="ghost" size="icon" aria-label="User Profile">
              <User className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/checkout">
            <Button variant="ghost" size="icon" className="relative" aria-label="Shopping Cart">
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs"
                >
                  {cartItemCount}
                </Badge>
              )}
            </Button>
          </Link>
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <div className="flex flex-col gap-6 p-6">
                    <Link href="/" className="font-headline text-2xl font-bold text-primary" onClick={() => setIsMobileMenuOpen(false)}>
                    Om Muruga Online
                    </Link>
                    <nav className="flex flex-col gap-4 text-lg">
                        {navLinks}
                    </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
