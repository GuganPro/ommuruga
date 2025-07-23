"use client";

import { useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProfilePage() {
  const { isLoggedIn, logout, user, loading } = useContext(AppContext);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, loading, router]);
  
  if (loading || !isLoggedIn || !user) {
    return (
        <div className="container mx-auto flex h-[70vh] items-center justify-center">
            <p>Loading...</p>
        </div>
    ); 
  }

  const getInitials = (email: string | null) => {
    if (!email) return "U";
    return email.substring(0, 2).toUpperCase();
  }
  
  const getMemberSince = (creationTime: string | undefined) => {
    if (!creationTime) return "N/A";
    const date = new Date(creationTime);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  return (
    <div className="container mx-auto flex max-w-md items-center justify-center p-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full"
      >
        <Card>
          <CardHeader className="items-center text-center">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.photoURL || `https://avatar.vercel.sh/${user.email}.png`} />
              <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
            </Avatar>
            <CardTitle className="pt-4 font-headline text-2xl">User Profile</CardTitle>
            <CardDescription>Your account details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium">{user.email}</span>
             </div>
             <div className="flex justify-between">
                <span className="text-muted-foreground">Member Since:</span>
                <span className="font-medium">{getMemberSince(user.metadata.creationTime)}</span>
             </div>
            <Button onClick={logout} className="w-full" variant="destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
