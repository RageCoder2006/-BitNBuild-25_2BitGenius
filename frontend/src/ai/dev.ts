import { config } from 'dotenv';
config();

import '@/ai/flows/generate-image-caption.ts';
import '@/ai/flows/generate-relevant-hashtags.ts';
import '@/ai/flows/apply-mood-based-theme.ts';