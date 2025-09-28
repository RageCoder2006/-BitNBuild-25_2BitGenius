'use client';

import { useState, useCallback, useEffect } from 'react';
import type { ChangeEvent, DragEvent } from 'react';
import Image from 'next/image';
import {
  FileImage,
  Sparkles,
  Clipboard,
  Copy,
  UploadCloud,
  X,
  Loader2,
  Settings2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { moodThemes } from '@/lib/themes';

import { generateImageCaption } from '@/ai/flows/generate-image-caption';
import { generateRelevantHashtags } from '@/ai/flows/generate-relevant-hashtags';
import { applyMoodBasedTheme } from '@/ai/flows/apply-mood-based-theme';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

type AiOutput = {
  caption: string;
  hashtags: string[];
};

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [aiOutput, setAiOutput] = useState<AiOutput | null>(null);
  const [isAutoTheme, setIsAutoTheme] = useState(true);
  const [currentTheme, setCurrentTheme] = useState<string | null>(null);

  const { toast } = useToast();

  const handleFileChange = (files: FileList | null) => {
    if (files && files[0]) {
      const selectedFile = files[0];
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please select a file smaller than 10MB.',
          variant: 'destructive',
        });
        return;
      }
      setFile(selectedFile);
      setAiOutput(null);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(selectedFile);
    }
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files);
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFileChange(e.target.files);
  };

  const resetState = () => {
    setFile(null);
    setPreview(null);
    setAiOutput(null);
    setDescription('');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied to clipboard!' });
  };

  const applyTheme = useCallback((themeName: string | null) => {
    const root = document.documentElement;
    const theme = themeName ? moodThemes[themeName as keyof typeof moodThemes] : null;

    if (theme) {
      Object.entries(theme).forEach(([key, value]) => {
        root.style.setProperty(key, value as string);
      });
      setCurrentTheme(themeName);
    } else {
      // Reset to default theme by removing inline styles
      const defaultThemeKeys = Object.keys(moodThemes.Joy); // use any theme to get keys
      defaultThemeKeys.forEach(key => root.style.removeProperty(key));
      setCurrentTheme(null);
    }
  }, []);

  useEffect(() => {
    if (!isAutoTheme) {
      applyTheme(null);
    } else if (currentTheme) {
       applyTheme(currentTheme);
    }
  }, [isAutoTheme, applyTheme, currentTheme]);

  const handleSubmit = async () => {
    if (!file) {
      toast({
        title: 'No file selected',
        description: 'Please upload an image to continue.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setProgress(0);
    setAiOutput(null);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const photoDataUri = reader.result as string;

      // Progress simulation
      const interval = setInterval(() => {
        setProgress(prev => (prev < 90 ? prev + 10 : 90));
      }, 500);

      try {
        const promises = [
            generateImageCaption({ photoDataUri, description }),
            generateRelevantHashtags({ imageDataUri: photoDataUri, description }),
        ];
        if (isAutoTheme) {
            promises.push(applyMoodBasedTheme({imageDataUri: photoDataUri}));
        }

        const [captionRes, hashtagsRes, themeRes] = await Promise.all(promises);

        setAiOutput({
          caption: captionRes.caption,
          hashtags: hashtagsRes.hashtags,
        });

        if (isAutoTheme && themeRes) {
            applyTheme(themeRes.theme);
        }

      } catch (error) {
        console.error(error);
        toast({
          title: 'An error occurred',
          description: 'Failed to process the image. Please try again.',
          variant: 'destructive',
        });
      } finally {
        clearInterval(interval);
        setProgress(100);
        setTimeout(() => setIsLoading(false), 500);
      }
    };
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-8">
            <div className="space-y-4">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-8 w-1/4 ml-auto" />
            </div>
            <div className="space-y-4">
                <Skeleton className="h-8 w-1/3" />
                <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-8 w-20 rounded-full" />
                    <Skeleton className="h-8 w-24 rounded-full" />
                    <Skeleton className="h-8 w-16 rounded-full" />
                    <Skeleton className="h-8 w-28 rounded-full" />
                    <Skeleton className="h-8 w-20 rounded-full" />
                </div>
                 <Skeleton className="h-8 w-1/4 ml-auto" />
            </div>
        </div>
      )
    }
    if (aiOutput) {
      return (
        <div className="space-y-8 animate-in fade-in-50 duration-500">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2"><Sparkles className="text-primary"/> Generated Caption</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => copyToClipboard(aiOutput.caption)}>
                <Copy className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-lg">{aiOutput.caption}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2"><Sparkles className="text-accent"/> Relevant Hashtags</CardTitle>
               <Button variant="ghost" size="icon" onClick={() => copyToClipboard(aiOutput.hashtags.join(' '))}>
                <Copy className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {aiOutput.hashtags.map((tag, i) => (
                  <Badge key={i} variant="secondary" className="text-base px-3 py-1">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
           <Button size="lg" className="w-full">
                Post to Socials <Clipboard className="ml-2"/>
            </Button>
        </div>
      );
    }
    return (
        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
            <Sparkles className="h-16 w-16 mb-4"/>
            <h3 className="text-xl font-semibold">Your content will appear here</h3>
            <p>Upload an image and generate content to see the magic happen.</p>
        </div>
    )
  };

  return (
    <div className="min-h-screen w-full">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4">
            <div className="flex h-16 items-center justify-between">
                <div className="flex items-center gap-2 text-xl font-bold text-primary">
                    <Sparkles/>
                    <span>SocialSpark</span>
                </div>
                 <div className="flex items-center space-x-2">
                    <Switch id="auto-theme" checked={isAutoTheme} onCheckedChange={setIsAutoTheme}/>
                    <Label htmlFor="auto-theme" className="flex items-center gap-1"><Settings2 className="h-4 w-4"/> Auto-Theme</Label>
                </div>
            </div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Create Your Post</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {preview ? (
                <div className="relative group">
                  <Image
                    src={preview}
                    alt="Image preview"
                    width={500}
                    height={300}
                    className="w-full rounded-lg object-cover aspect-video"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={resetState}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                  className={cn(
                    'flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors',
                    isDragging ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                  )}
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <UploadCloud className="h-12 w-12 text-muted-foreground mb-2" />
                  <p className="font-semibold">Drag & drop an image or click to upload</p>
                  <p className="text-sm text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    accept="image/png, image/jpeg, image/gif"
                    onChange={onFileChange}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="description">Describe your image (optional)</Label>
                <Textarea
                  id="description"
                  placeholder="e.g., A beautiful sunset over the ocean."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <Button
                onClick={handleSubmit}
                disabled={!file || isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Generate Content
              </Button>
              {isLoading && <Progress value={progress} className="w-full" />}
            </CardContent>
          </Card>

          <div className="w-full space-y-4">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}
