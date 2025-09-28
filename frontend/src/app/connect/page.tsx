import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Instagram, Facebook, Twitter, Linkedin, Youtube, Rss } from 'lucide-react';

const socialAccounts = [
  { name: 'Instagram', icon: Instagram, connected: true },
  { name: 'Facebook', icon: Facebook, connected: false },
  { name: 'Twitter / X', icon: Twitter, connected: false },
  { name: 'LinkedIn', icon: Linkedin, connected: true },
  { name: 'YouTube', icon: Youtube, connected: false },
  { name: 'Blog', icon: Rss, connected: false },
];

export default function ConnectPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Connect Your Accounts</CardTitle>
          <CardDescription>
            Connect your social media accounts to post your generated content directly.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {socialAccounts.map((account) => (
            <div
              key={account.name}
              className="mb-4 grid grid-cols-[25px_1fr_auto] items-center gap-4"
            >
              <account.icon className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">{account.name}</span>
              <Button variant={account.connected ? 'secondary' : 'default'} size="sm" className='w-[100px]'>
                {account.connected ? 'Connected' : 'Connect'}
              </Button>
            </div>
          ))}
        </CardContent>
        <CardFooter>
          <Button className="w-full" asChild>
            <Link href="/home">Continue to App</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
