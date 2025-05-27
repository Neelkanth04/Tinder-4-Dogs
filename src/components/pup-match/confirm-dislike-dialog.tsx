
"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PawIcon } from "@/components/icons/paw-icon";

interface ConfirmDislikeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  dogName?: string;
}

const sadPuppyEyesQuotes = [
  "Are you absolutely, positively, paw-sitively sure?",
  "But... but I thought we had a connection! \uD83E\uDD7A",
  "This little tail might stop wagging forever if you do this.",
  "Somewhere, a tiny squeaky toy just lost its squeak.",
  "Is there no room in your heart (or your screen) for this face?",
];

export function ConfirmDislikeDialog({
  open,
  onOpenChange,
  onConfirm,
  dogName,
}: ConfirmDislikeDialogProps) {
  const [randomQuote, setRandomQuote] = React.useState(sadPuppyEyesQuotes[0]);

  React.useEffect(() => {
    if (open) {
      setRandomQuote(sadPuppyEyesQuotes[Math.floor(Math.random() * sadPuppyEyesQuotes.length)]);
    }
  }, [open]);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-lg bg-card/95 backdrop-blur-sm">
        <AlertDialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <PawIcon className="w-16 h-16 text-destructive/70 animate-pulse" />
          </div>
          <AlertDialogTitle className="text-2xl font-bahiana text-destructive">
            Woah There, Heartbreaker!
          </AlertDialogTitle>
          <AlertDialogDescription className="text-foreground/80 text-md pt-2">
            You're about to swipe left on{" "}
            <span className="font-semibold text-primary">{dogName || "this adorable pup"}</span>.
            <br />
            {randomQuote}
            <br />
            Think of the lonely walks and un-booped snoots! Are you sure you want to proceed?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4 grid grid-cols-2 gap-3">
          <AlertDialogCancel
            onClick={() => onOpenChange(false)}
            className="bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg py-3 text-md font-semibold shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 focus:ring-4 focus:ring-secondary/50"
          >
            No, I have a soul!
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className="bg-destructive hover:bg-destructive/80 text-destructive-foreground rounded-lg py-3 text-md font-semibold shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 focus:ring-4 focus:ring-destructive/50"
          >
            Yes, I'm heartless.
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
