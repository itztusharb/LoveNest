
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Heart } from 'lucide-react';
import { signInUser } from '@/ai/flows/auth-flow';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string(),
});

export default function SignInPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values) {
    setIsLoading(true);
    try {
      await signInUser(values);
      toast({
        title: 'Signed In!',
        description: 'Welcome back!',
      });
      // Redirect to the root, which will handle routing to the dashboard.
      router.replace('/');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description:
          error.message || 'There was a problem with your request.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="w-full max-w-md space-y-8 px-4 py-12 sm:px-6 lg:px-8">
        <div>
            <Heart className="mx-auto h-12 w-auto text-primary" />
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-foreground">
            Sign in to your Lovebirds account
            </h2>
            <p className="mt-2 text-center text-sm text-muted-foreground">
            Or{' '}
            <Link
                href="/sign-up"
                className="font-medium text-primary hover:text-primary/90"
            >
                create a new account
            </Link>
            </p>
        </div>
        <Card>
            <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
                Enter your credentials to access your account.
            </CardDescription>
            </CardHeader>
            <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                        <Input
                            type="email"
                            placeholder="you@example.com"
                            {...field}
                        />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                        <Input
                            type="password"
                            placeholder="••••••••"
                            {...field}
                        />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>
                </form>
            </Form>
            </CardContent>
        </Card>
        </div>
    </div>
  );
}
