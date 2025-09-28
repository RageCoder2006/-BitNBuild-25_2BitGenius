'use server';

/**
 * @fileOverview Generates relevant hashtags for an uploaded image.
 *
 * - generateRelevantHashtags - A function that generates relevant hashtags for an image.
 * - GenerateRelevantHashtagsInput - The input type for the generateRelevantHashtags function.
 * - GenerateRelevantHashtagsOutput - The return type for the generateRelevantHashtags function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateRelevantHashtagsInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "A photo, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  description: z.string().describe('The description of the image.'),
});
export type GenerateRelevantHashtagsInput = z.infer<
  typeof GenerateRelevantHashtagsInputSchema
>;

const GenerateRelevantHashtagsOutputSchema = z.object({
  hashtags: z
    .array(z.string())
    .describe('An array of relevant hashtags for the image.'),
});
export type GenerateRelevantHashtagsOutput = z.infer<
  typeof GenerateRelevantHashtagsOutputSchema
>;

export async function generateRelevantHashtags(
  input: GenerateRelevantHashtagsInput
): Promise<GenerateRelevantHashtagsOutput> {
  return generateRelevantHashtagsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateRelevantHashtagsPrompt',
  input: {schema: GenerateRelevantHashtagsInputSchema},
  output: {schema: GenerateRelevantHashtagsOutputSchema},
  prompt: `You are a social media expert. Generate relevant hashtags for the image based on the description and the image itself.

Description: {{{description}}}
Image: {{media url=imageDataUri}}

Please provide only the hashtags, separated by commas.  Do not include any other text.  Do not include the # symbol.

Example output: travel, nature, beautiful, vacation`,
});

const generateRelevantHashtagsFlow = ai.defineFlow(
  {
    name: 'generateRelevantHashtagsFlow',
    inputSchema: GenerateRelevantHashtagsInputSchema,
    outputSchema: GenerateRelevantHashtagsOutputSchema,
  },
  async input => {
    let retries = 3;
    while (retries > 0) {
      try {
        const {output} = await prompt(input);
        const hashtags = output!.hashtags.map(hashtag => '#' + hashtag.trim());
        return {hashtags: output!.hashtags};
      } catch (e: any) {
        if (e.message.includes('503') && retries > 1) {
          console.log(
            'Service unavailable, retrying generateRelevantHashtagsFlow...'
          );
          retries--;
          await new Promise(resolve => setTimeout(resolve, 1000)); // wait 1s
        } else {
          throw e;
        }
      }
    }
    throw new Error('Failed to generate relevant hashtags after multiple retries.');
  }
);
