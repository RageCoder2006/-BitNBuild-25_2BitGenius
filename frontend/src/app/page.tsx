import Image from 'next/image';
import Link from 'next/link';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { LoginForm } from '@/components/login-form';
import { RegisterForm } from '@/components/register-form';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function AuthenticationPage() {
  const loginBg = PlaceHolderImages.find(img => img.id === 'moodboost-login-bg');

  return (
    <div className="w-full min-h-screen lg:grid lg:grid-cols-2">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
        <div className="absolute inset-0 bg-primary/80" />
        {loginBg && (
            <Image
                src={loginBg.imageUrl}
                alt={loginBg.description}
                fill
                className="object-cover"
                data-ai-hint={loginBg.imageHint}
                priority
            />
        )}
        <div className="relative z-20 flex items-center text-lg font-medium">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 h-6 w-6"
          >
            <path d="M15 6.5A5.5 5.5 0 1 1 4 6.5a5.5 5.5 0 0 1 11 0z" />
            <path d="M15 6.5C15 9.57 12.33 12 9.5 12S4 9.57 4 6.5" />
            <path d="M19 19a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4" />
            <path d="M19 19a4 4 0 0 0-4-4" />
            <path d="M14 12c-2 0-4 2-4 4" />
            <path d="M22 12c-2 0-4 2-4 4" />
          </svg>
            Social Spark
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;This app has supercharged my social media engagement. The AI-powered captions and hashtags are a game-changer!&rdquo;
            </p>
            <footer className="text-sm">Sofia Davis</footer>
          </blockquote>
        </div>
      </div>
      <div className="flex items-center justify-center py-12 px-4 sm:px-0">
        <div className="mx-auto w-full max-w-[400px] space-y-6">
            <Tabs defaultValue="login" className="w-full">
            <Card className="border-0 shadow-none sm:border sm:shadow-sm">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold tracking-tight">Welcome to SocialSpark</CardTitle>
                    <CardDescription>
                        Choose how you'd like to get started
                    </CardDescription>
                     <TabsList className="grid w-full grid-cols-2 mx-auto mt-4">
                        <TabsTrigger value="login">Login</TabsTrigger>
                        <TabsTrigger value="register">Register</TabsTrigger>
                    </TabsList>
                </CardHeader>
                <CardContent className="space-y-4">
                    <TabsContent value="login">
                        <LoginForm />
                    </TabsContent>
                    <TabsContent value="register">
                        <RegisterForm />
                    </TabsContent>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-2 text-muted-foreground">
                            Or
                            </span>
                        </div>
                    </div>

                    <Button variant="outline" className="w-full" asChild>
                        <Link href="/home">Skip for now</Link>
                    </Button>
                </CardContent>
            </Card>
            </Tabs>
        </div>
      </div>
    </div>
  );
}
