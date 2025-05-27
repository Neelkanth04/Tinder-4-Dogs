"use client";

import { useState, useEffect, useCallback } from "react";
import { DogCard } from "@/components/pup-match/dog-card";
import { SwipeButtons } from "@/components/pup-match/swipe-buttons";
import { ConfirmDislikeDialog } from "@/components/pup-match/confirm-dislike-dialog";
import { generateMemeQuote } from "@/ai/flows/generate-meme-quote";
import { useToast } from "@/hooks/use-toast";
import { PawIcon } from "@/components/icons/paw-icon";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import dogsData from './dogs.json';

export type DogProfile = {
  id: string;
  name: string; // Creative/Meme name
  photoUrl: string;
  breed?: string; // Make breed optional
  traits: string[];
  memeQuote?: string;
  dataAiHint: string;
  realName?: string; // Real name of the dog
  adoptionUrl?: string; // URL to the dog's actual adoption page
};

const mappedDogs: DogProfile[] = (dogsData as unknown as Array<any>).map((dog, idx) => ({
  id: String(idx + 1),
  name: dog.name,
  photoUrl: dog.image,
  traits: [],
  dataAiHint: '',
  realName: dog.name,
  adoptionUrl: dog.link,
}));

export default function PupMatchPage() {
  const [dogProfiles, setDogProfiles] = useState<DogProfile[]>([]);
  const [currentDogIndex, setCurrentDogIndex] = useState(0);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [showNoMoreDogs, setShowNoMoreDogs] = useState(false);
  const [showConfirmDislikeDialog, setShowConfirmDislikeDialog] = useState(false);
  const [dogToConfirmDislike, setDogToConfirmDislike] = useState<DogProfile | null>(null);
  const [dislikeCanceled, setDislikeCanceled] = useState(false);
  const [isLoadingDogs, setIsLoadingDogs] = useState(true);
  const { toast } = useToast();

  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };
  
  const loadInitialDogs = useCallback(() => {
    setIsLoadingDogs(true);
    const shuffledProfiles = shuffleArray(mappedDogs);
    
    setTimeout(() => {
      setDogProfiles(shuffledProfiles.map(dog => ({...dog, memeQuote: undefined})));
      setCurrentDogIndex(0);
      setShowNoMoreDogs(shuffledProfiles.length === 0);
      setIsLoadingQuote(false);

      setIsLoadingDogs(false);
    }, 500);

  }, [mappedDogs]);

  useEffect(() => {
    loadInitialDogs();
  }, [loadInitialDogs]);

  useEffect(() => {
    if (dogProfiles.length > 0 && currentDogIndex < dogProfiles.length) {
      const currentDog = dogProfiles[currentDogIndex];
      if (!currentDog.memeQuote && !isLoadingQuote) { 
        setIsLoadingQuote(true);
        generateMemeQuote({
          dogBreed: currentDog.breed || '',
          dogTraits: currentDog.traits,
        })
          .then((response) => {
            setDogProfiles((prevProfiles) =>
              prevProfiles.map((dog, index) =>
                index === currentDogIndex
                  ? { ...dog, memeQuote: response.memeQuote }
                  : dog
              )
            );
          })
          .catch((error) => {
            console.error("Error generating meme quote:", error);
            toast({
              title: "Meme Error",
              description: "Could not generate a meme quote. Please try again.",
              variant: "destructive",
            });
            setDogProfiles((prevProfiles) =>
              prevProfiles.map((dog, index) =>
                index === currentDogIndex
                  ? { ...dog, memeQuote: "My lips are sealed... for now! Maybe later if you're cute. 😉" }
                  : dog
              )
            );
          })
          .finally(() => {
            setIsLoadingQuote(false);
          });
      }
    } else if (dogProfiles.length > 0 && currentDogIndex >= dogProfiles.length) {
        setShowNoMoreDogs(true);
    } else if (dogProfiles.length === 0 && !isLoadingQuote) {
        setShowNoMoreDogs(true);
    }

  }, [currentDogIndex, dogProfiles, toast, isLoadingQuote]);

  const processDislike = () => {
    if (!dogToConfirmDislike) return;

    toast({
      title: `You disliked ${dogToConfirmDislike.name}!`,
      description: "A single tear rolls down a furry cheek... 😢",
    });
    
    if (currentDogIndex + 1 < dogProfiles.length) {
      setCurrentDogIndex((prevIndex) => prevIndex + 1);
    } else {
      setShowNoMoreDogs(true);
    }
    setDogToConfirmDislike(null);
  };

  const handleSwipe = (action: "like" | "dislike") => {
    if (currentDogIndex < dogProfiles.length) { 
      const dogSwiped = dogProfiles[currentDogIndex];
      
      if (action === "dislike") {
        setDogToConfirmDislike(dogSwiped);
        setShowConfirmDislikeDialog(true);
      } else {
        toast({
          title: `You liked ${dogSwiped.name}!`,
          description: "Hope it's a match! \uD83D\uDC96 Paws crossed!",
        });
        if (currentDogIndex + 1 < dogProfiles.length) {
          setCurrentDogIndex((prevIndex) => prevIndex + 1);
        } else {
          setShowNoMoreDogs(true);
        }
      }
    }
  };

  const currentDog = dogProfiles.length > 0 && currentDogIndex < dogProfiles.length ? dogProfiles[currentDogIndex] : null;

  return (
    <div 
      className="relative min-h-screen w-full bg-cover bg-center"
      style={{ backgroundImage: "url('/charlie777.jpg')" }}
      data-ai-hint="dog park sunset"
    >
      <div className="absolute inset-0 bg-black/60 pointer-events-none z-0"></div>

      <PawIcon className="fixed top-10 left-10 text-primary/5 opacity-30 text-[200px] transform -rotate-12 select-none pointer-events-none z-10" />
      <PawIcon className="fixed bottom-20 right-10 text-accent/5 opacity-30 text-[250px] transform rotate-12 select-none pointer-events-none z-10" />
      
      <div className="relative min-h-screen w-full flex flex-col items-center p-4">
        <main className="w-full max-w-md mx-auto flex flex-col items-center gap-4 z-10">
          <h1
            className="text-5xl sm:text-7xl font-extrabold mb-8 text-center select-none font-bahiana bg-gradient-to-r from-[hsl(var(--heading-gradient-from))] to-[hsl(var(--heading-gradient-to))] bg-clip-text text-transparent transition-all duration-300 ease-in-out hover:scale-105 hover:brightness-125"
            style={{
              textShadow: `
                -1px -1px 0 hsl(var(--text-stroke-color)), 1px -1px 0 hsl(var(--text-stroke-color)),
                -1px 1px 0 hsl(var(--text-stroke-color)), 1px 1px 0 hsl(var(--text-stroke-color)),
                -1px 0 0 hsl(var(--text-stroke-color)), 1px 0 0 hsl(var(--text-stroke-color)),
                0 -1px 0 hsl(var(--text-stroke-color)), 0 1px 0 hsl(var(--text-stroke-color)),
                -2px -2px 0 hsl(var(--text-stroke-color)), 2px -2px 0 hsl(var(--text-stroke-color)),
                -2px 2px 0 hsl(var(--text-stroke-color)), 2px 2px 0 hsl(var(--text-stroke-color)),
                -2px 0 0 hsl(var(--text-stroke-color)), 2px 0 0 hsl(var(--text-stroke-color)),
                0 -2px 0 hsl(var(--text-stroke-color)), 0 2px 0 hsl(var(--text-stroke-color)),
                -1px -2px 0 hsl(var(--text-stroke-color)), 1px -2px 0 hsl(var(--text-stroke-color)),
                -2px -1px 0 hsl(var(--text-stroke-color)), 2px -1px 0 hsl(var(--text-stroke-color)),
                -1px 2px 0 hsl(var(--text-stroke-color)), 1px 2px 0 hsl(var(--text-stroke-color)),
                -2px 1px 0 hsl(var(--text-stroke-color)), 2px 1px 0 hsl(var(--text-stroke-color))
              `,
            }}
          >
            Tinder for Dogs
          </h1>

          {isLoadingDogs ? (
            <div className="flex flex-col items-center justify-center text-center p-10 bg-card rounded-2xl shadow-xl h-[600px] w-full max-w-md fabric-texture">
              <PawIcon className="w-28 h-28 text-primary/50 mb-6 animate-bounce" />
              <h2 className="text-4xl font-bold text-primary mb-3 font-bahiana">Fetching Pups...</h2>
              <p className="text-lg text-foreground/70 mb-8 px-4">
                Please wait while we find some furry friends for you!
              </p>
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-foreground"></div>
            </div>
          ) : currentDog && !showNoMoreDogs ? (
            <DogCard 
              dog={currentDog} 
              isLoadingQuote={isLoadingQuote}
              onSwipe={handleSwipe} 
              dislikeCanceled={dislikeCanceled}
              onDislikeCancel={() => setDislikeCanceled(false)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-10 bg-card rounded-2xl shadow-xl h-[600px] w-full max-w-md fabric-texture">
              <PawIcon className="w-28 h-28 text-accent/50 mb-6" />
              <h2 className="text-4xl font-bold text-primary mb-3 font-bahiana">Woof! End of the Leash?</h2>
              <p className="text-lg text-foreground/70 mb-8 px-4">
                Looks like you've sniffed out all the current pups!
                <br />
                New furry faces join the park all the time.
              </p>
              <Button 
                onClick={loadInitialDogs}
                variant="default" 
                size="lg" 
                className="bg-accent hover:bg-accent/80 text-accent-foreground rounded-full px-10 py-3 text-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 focus:ring-4 focus:ring-accent/50"
              >
                <RefreshCcw className="mr-3 h-6 w-6" />
                Fetch More Pups!
              </Button>
            </div>
          )}
          
          {!showNoMoreDogs && currentDog && (
            <SwipeButtons
              onLike={() => handleSwipe("like")}
              onDislike={() => handleSwipe("dislike")}
              disabled={isLoadingQuote || !currentDog}
            />
          )}
        </main>
        <footer className="py-4 text-center text-accent-foreground text-sm z-10 select-none">
          Made by Nilaansh with ❤️ for all the good doggos.
        </footer>
      </div>
      {dogToConfirmDislike && (
        <ConfirmDislikeDialog
          open={showConfirmDislikeDialog}
          onOpenChange={(open) => {
            setShowConfirmDislikeDialog(open);
            if (!open && dogToConfirmDislike) {
              setDislikeCanceled(true);
            }
            setDogToConfirmDislike(null);
          }}
          onConfirm={() => {
            processDislike();
          }}
          dogName={dogToConfirmDislike.name}
        />
      )}
    </div>
  );
}
