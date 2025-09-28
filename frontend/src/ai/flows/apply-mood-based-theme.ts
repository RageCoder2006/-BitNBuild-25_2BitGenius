'use server';

/**
 * @fileOverview Applies a mood-based theme to the app based on the detected mood in an image.
 *
 * - applyMoodBasedTheme - A function that determines the appropriate theme based on the image.
 * - ApplyMoodBasedThemeInput - The input type for the applyMoodBasedTheme function.
 * - ApplyMoodBasedThemeOutput - The return type for the applyMoodBasedTheme function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ApplyMoodBasedThemeInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "A photo, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ApplyMoodBasedThemeInput = z.infer<typeof ApplyMoodBasedThemeInputSchema>;

const ApplyMoodBasedThemeOutputSchema = z.object({
  theme: z
    .enum(['Serenity', 'Sad', 'Joy', 'Calm', 'Neutral'])
    .describe('The determined theme based on the mood of the image.'),
});
export type ApplyMoodBasedThemeOutput = z.infer<typeof ApplyMoodBasedThemeOutputSchema>;

export async function applyMoodBasedTheme(
  input: ApplyMoodBasedThemeInput
): Promise<ApplyMoodBasedThemeOutput> {
  return applyMoodBasedThemeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'applyMoodBasedThemePrompt',
  input: {schema: ApplyMoodBasedThemeInputSchema},
  output: {schema: ApplyMoodBasedThemeOutputSchema},
  prompt: `Based on the mood of the image, determine the best theme for the app.

Here are the possible themes:
- Serenity (pale greens and blues)
- Sad (muted grays and blues)
- Joy (bright yellows and oranges)
- Calm (soft blues and purples)
- Neutral (light grays)

Analyze the following image and return the theme that best matches its mood.

Image: {{media url=imageDataUri}}`,
});

const applyMoodBasedThemeFlow = ai.defineFlow(
  {
    name: 'applyMoodBasedThemeFlow',
    inputSchema: ApplyMoodBasedThemeInputSchema,
    outputSchema: ApplyMoodBasedThemeOutputSchema,
  },
  async input => {
    let retries = 3;
    while (retries > 0) {
      try {
        const {output} = await prompt(input);
        return output!;
      } catch (e: any) {
        if (e.message.includes('503') && retries > 1) {
          console.log(
            'Service unavailable, retrying applyMoodBasedThemeFlow...'
          );
          retries--;
          await new Promise(resolve => setTimeout(resolve, 1000)); // wait 1s
        } else {
          throw e;
        }
      }
    }
    throw new Error('Failed to apply mood-based theme after multiple retries.');
  }
);
