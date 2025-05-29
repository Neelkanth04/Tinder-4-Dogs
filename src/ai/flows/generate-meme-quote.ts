
'use server';

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
  prompt: `Create a short, funny, and flirty one-liner for a dog's dating profile.

Requirements:
• Be completely original and creative — steer clear of common dog meme phrases
• Avoid starting with: "Certified", "Fluent in", "Professional", or similar phrases
• No clichés like: "Will work for treats", "I bury bones", "My love language is..."
• Don't use common dog behaviors (sniffing, fetching, belly rubs, squirrels) as main themes
• Aim for something a real dog might say on a dating show — quirky, charming, and full of personality

Examples (create something very different from these):
• "I'm here to steal your heart, not your socks... maybe just one or two. 😉"
• "I can't promise I'll be good, but I'll definitely be unforgettable 🐾"
• "Looking for someone to share my comfy spot on the couch. Bonus points if you bring snacks."
• "Not just a dog — I'm the adopted life of the party."
• "If you can keep up with my zoomies, we're in business!"
• "I'll never ghost you... unless it's a game of hide-and-seek. 👀"
• "Let's wag our tails together — I promise I'm worth the chase."
• "I don't just chase cars — I chase dreams. Want to be part of mine?"
• "Who says we can't be besties, and also something a little more? 💕"
• "My bark might be loud, but my love is even louder. 🐕"
• "Looking for a pup to be my partner in crime — let's make mischief together!"
• "You bring the snacks, I'll bring the charm. Deal?"
• "Will sit, stay, and look adorable — all you need to do is say 'yes'!"
• "I don't fetch balls, but I'll definitely catch your heart. 💘"
• "I might be a dog, but I'm all about human connection. Let's vibe!"
• "Forget fetch — let's fetch some memories together!"
• "In the mood for a cuddle... or an adventure... or both! 😏"
• "Not every dog can handle my charisma. Think you can? 😎"
• "I'm paws-itively ready for my next adventure, are you in?"
• "If I had a dollar for every time I've wagged my tail at someone... well, I'd be rich in love!"`,
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
