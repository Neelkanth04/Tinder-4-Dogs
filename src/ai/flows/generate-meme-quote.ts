
'use server';

/**
 * @fileOverview Generates a meme-style quote for a dog profile.
 *
 * - generateMemeQuote - A function that generates a meme-style quote for a dog profile.
 * - GenerateMemeQuoteInput - The input type for the generateMemeQuote function.
 * - GenerateMemeQuoteOutput - The return type for the generateMemeQuote function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMemeQuoteInputSchema = z.object({
  dogBreed: z.string().describe('The breed of the dog.'),
  dogTraits: z.array(z.string()).describe('A list of personality traits of the dog.'),
});
export type GenerateMemeQuoteInput = z.infer<typeof GenerateMemeQuoteInputSchema>;

const GenerateMemeQuoteOutputSchema = z.object({
  memeQuote: z.string().describe('A very short, flirty, meme-style quote for a dog, ideally 1-2 lines.'),
});
export type GenerateMemeQuoteOutput = z.infer<typeof GenerateMemeQuoteOutputSchema>;

export async function generateMemeQuote(input: GenerateMemeQuoteInput): Promise<GenerateMemeQuoteOutput> {
  return generateMemeQuoteFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMemeQuotePrompt',
  input: {schema: GenerateMemeQuoteInputSchema},
  output: {schema: GenerateMemeQuoteOutputSchema},
  prompt: `You are a flirty meme generator for a dog dating app.
Your task is to create a very short, playful, and meme-style quote for a dog's profile.
The quote MUST be extremely concise, ideally 1-2 short lines. Think punchy one-liners or brief, witty phrases.
Make it catchy and a bit cheeky, something that would make someone smile and want to "swipe right".
Do NOT use the dog's specific name in the quote. Create a general flirty pun or meme-style comment.
You can draw inspiration from the dog's breed and personality traits if provided.

Dog Information (for inspiration, do not mention name):
Breed: {{{dogBreed}}}
Personality Traits: {{#each dogTraits}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

Generate a very short, flirty meme quote.
Examples:
"Too glam to give a dam... about your ex. 😉"
"Will work for belly rubs & pizza crusts."
"Swipe right if you like bad boys who are actually good boys."
"My love language: snacks and head scratches."
`,
});

const generateMemeQuoteFlow = ai.defineFlow(
  {
    name: 'generateMemeQuoteFlow',
    inputSchema: GenerateMemeQuoteInputSchema,
    outputSchema: GenerateMemeQuoteOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
