'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppDispatch, useAppSelector } from '@/services/hooks';
import { login, selectAuth } from '@/services/v1/authSlice';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function LoginForm() {
  const router = useRouter(); // useRouter hook from Next.js for navigation

  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector(selectAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Dispatch the login action and wait for it to complete
    const resultAction = await dispatch(login({ email, password }));

    // Check if the login was successful
    if (login.fulfilled.match(resultAction)) {
      router.push('/'); // Redirect to the home page
    } else {
      // Handle login failure (e.g., display an error message)
      console.error('Login failed');
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email and password below to log in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sign In'}
              </Button>
              {error && <p className="text-red-500">{error}</p>}
            </div>
          </form>
          {/* <div className="text-center text-sm">
            <Link href="/signup" className="text-gray-400 transition-colors hover:text-gray-300">
              Create an account? Sign up
            </Link>
          </div> */}
        </CardContent>
      </Card>
    </div>
  );
}
