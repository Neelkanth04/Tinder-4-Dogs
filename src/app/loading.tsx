
"use client";

import { useState, useEffect } from 'react';

const dogQuotes = [
  "Fetching the goodest boys and girls… 🐾",
  "Downloading cuteness… 🐶✨",
  "Matching you with a furry soulmate… 💘",
  "If it takes too long, they’re sniffing a tree 🌳",
  "Bork server is chasing squirrels… please wait 🐿️",
  "Pawse for a moment… loading adorableness 🐾",
  "Tail wagging in progress… 🌀",
];

export default function Loading() {
  const [loadingText, setLoadingText] = useState("Loading...");

  useEffect(() => {
    const randomQuote = dogQuotes[Math.floor(Math.random() * dogQuotes.length)];
    setLoadingText(randomQuote);
  }, []);

  return (
    <div className="bg-[#EAF4FB] flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="animate-bounce text-6xl mb-6">🐶</div>
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">
          {loadingText}
        </h1>
        <div className="animate-spin rounded-full h-10 w-10 mx-auto border-t-4 border-pink-500 border-solid"></div>
      </div>
    </div>
  );
}
