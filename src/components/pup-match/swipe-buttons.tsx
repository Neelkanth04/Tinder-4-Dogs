"use client";

import { Button } from "@/components/ui/button";
import { Heart, X } from "lucide-react";

interface SwipeButtonsProps {
  onLike: () => void;
  onDislike: () => void;
  disabled?: boolean;
}

export function SwipeButtons({ onLike, onDislike, disabled }: SwipeButtonsProps) {
  return (
    <div className="flex justify-center space-x-6 mt-8">
      <Button
        variant="outline"
        size="icon"
        className="w-20 h-20 rounded-full shadow-lg border-destructive/50 hover:bg-destructive/10"
        onClick={onDislike}
        aria-label="Dislike"
        disabled={disabled}
      >
        <X className="w-10 h-10 text-destructive" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="w-20 h-20 rounded-full shadow-lg border-accent hover:bg-accent/20"
        onClick={onLike}
        aria-label="Like"
        disabled={disabled}
      >
        <Heart className="w-10 h-10 text-accent fill-accent" />
      </Button>
    </div>
  );
}
