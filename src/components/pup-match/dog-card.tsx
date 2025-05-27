"use client";

import Image from "next/image";
import type { DogProfile } from "@/app/page";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TagCloud } from "./tag-cloud";
import { Skeleton } from "@/components/ui/skeleton";
import React, { useState, useEffect, useRef } from 'react';
import { ExternalLink } from "lucide-react";

interface DogCardProps {
  dog: DogProfile;
  isLoadingQuote: boolean;
  onSwipe: (action: "like" | "dislike") => void;
  dislikeCanceled: boolean;
  onDislikeCancel: () => void;
}

const SWIPE_THRESHOLD = 100; // pixels
const ROTATION_FACTOR = 0.05; // degrees per pixel moved from center
const MAX_ROTATION = 15; // degrees
const SNAP_BACK_TRANSITION = "transform 0.3s ease-out, opacity 0.3s ease-out";
const SWIPE_OUT_TRANSITION = "transform 0.3s ease-out, opacity 0.3s ease-out";


export function DogCard({ dog, isLoadingQuote, onSwipe, dislikeCanceled, onDislikeCancel }: DogCardProps) {
  const [translateX, setTranslateX] = useState(0);
  const [rotate, setRotate] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false);
  const [cardStyle, setCardStyle] = useState<React.CSSProperties>({});

  const cardRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);

  useEffect(() => {
    setTranslateX(0);
    setRotate(0);
    setIsInteracting(false);
    setCardStyle({
      transform: 'translateX(0px) rotate(0deg)',
      opacity: 1,
      transition: 'none',
    });
  }, [dog.id]);

  useEffect(() => {
    if (dislikeCanceled) {
      setTranslateX(0);
      setRotate(0);
      setCardStyle({
        transform: 'translateX(0px) rotate(0deg)',
        opacity: 1,
        transition: SNAP_BACK_TRANSITION,
      });
      onDislikeCancel();
    }
  }, [dislikeCanceled, onDislikeCancel]);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (isLoadingQuote || event.button !== 0) return;
    const targetElement = event.target as HTMLElement;
    if (targetElement.closest('[data-adopt-button="true"]')) {
      return;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsInteracting(true);
    startXRef.current = event.clientX;
    setCardStyle(prev => ({ ...prev, transition: 'none' }));
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isInteracting || isLoadingQuote) return;

    const currentX = event.clientX;
    const deltaX = currentX - startXRef.current;

    let newRotate = deltaX * ROTATION_FACTOR;
    newRotate = Math.max(-MAX_ROTATION, Math.min(MAX_ROTATION, newRotate));

    setTranslateX(deltaX);
    setRotate(newRotate);
    setCardStyle({
      transform: `translateX(${deltaX}px) rotate(${newRotate}deg)`,
      opacity: 1 - Math.abs(deltaX) / (SWIPE_THRESHOLD * 2),
      transition: 'none',
    });
  };

  const handlePointerUpOrLeave = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isInteracting || isLoadingQuote) return;

    setIsInteracting(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (Math.abs(translateX) > SWIPE_THRESHOLD) {
      const direction = translateX > 0 ? "like" : "dislike";
      const cardWidth = cardRef.current?.offsetWidth || 300;
      const finalTranslateX = translateX > 0 ? cardWidth * 1.5 : -cardWidth * 1.5;
      const finalRotate = rotate * 1.5;

      setCardStyle({
        transform: `translateX(${finalTranslateX}px) rotate(${finalRotate}deg)`,
        opacity: 0,
        transition: SWIPE_OUT_TRANSITION,
      });

      setTimeout(() => {
        onSwipe(direction);
      }, 300);
    } else {
      setTranslateX(0);
      setRotate(0);
      setCardStyle({
        transform: 'translateX(0px) rotate(0deg)',
        opacity: 1,
        transition: SNAP_BACK_TRANSITION,
      });
    }
  };

  return (
    <Card
      ref={cardRef}
      className="w-full max-w-md mx-auto rounded-2xl overflow-hidden touch-none select-none cursor-grab active:cursor-grabbing bg-[#FFF6E5] border-l-[8px] border-t-[4px] border-r-[4px] border-b-[4px] border-[#FFADC6] sm:max-h-none max-h-[90vh] flex flex-col"
      style={cardStyle}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUpOrLeave}
      onPointerLeave={handlePointerUpOrLeave}
      role="button"
      tabIndex={0}
      aria-roledescription="swipeable dog card"
      onKeyDown={(e) => {
        if (isLoadingQuote) return;
        if (e.key === 'ArrowLeft') {
            setCardStyle({ transform: `translateX(-${(cardRef.current?.offsetWidth || 300) * 1.5}px) rotate(${-MAX_ROTATION * 1.5}deg)`, opacity: 0, transition: SWIPE_OUT_TRANSITION });
            setTimeout(() => onSwipe("dislike"), 300);
        } else if (e.key === 'ArrowRight') {
            setCardStyle({ transform: `translateX(${(cardRef.current?.offsetWidth || 300) * 1.5}px) rotate(${MAX_ROTATION * 1.5}deg)`, opacity: 0, transition: SWIPE_OUT_TRANSITION });
            setTimeout(() => onSwipe("like"), 300);
        }
      }}
    >
      <div className="relative w-full aspect-square flex-shrink-0">
        <Image
          src={dog.photoUrl}
          alt={dog.name}
          fill
          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 50vw, 448px"
          className="object-cover bg-muted pointer-events-none"
          data-ai-hint={dog.dataAiHint}
          priority
        />
      </div>
      <div className="flex flex-col flex-grow sm:overflow-visible overflow-y-auto">
        <CardHeader className="p-6 text-center flex-shrink-0">
          <CardTitle className="text-4xl sm:text-5xl font-bold text-foreground font-bahiana">{dog.name}</CardTitle>
          {dog.realName && (
            <p className="text-md text-foreground/70 -mt-1">(Also known as: {dog.realName})</p>
          )}
          <CardDescription className="text-lg text-foreground/90 font-medium">{dog.breed}</CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-0 space-y-4 flex-grow">
          <div className="min-h-[60px] bg-primary p-4 rounded-lg shadow-inner text-center">
            {isLoadingQuote ? (
              <div className="space-y-2 pt-1">
                <Skeleton className="h-4 w-3/4 mx-auto bg-primary-foreground/50" />
                <Skeleton className="h-4 w-1/2 mx-auto bg-primary-foreground/50" />
              </div>
            ) : (
              <p className="text-lg italic text-primary-foreground">"{dog.memeQuote || 'Thinking of a good meme...'}"</p>
            )}
          </div>
          <TagCloud tags={dog.traits} />
          {dog.adoptionUrl && (
            <Button
              data-adopt-button="true"
              variant="default"
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground mt-4 py-3 text-lg font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 focus:ring-4 focus:ring-accent/50"
              onClick={(e) => {
                e.stopPropagation();
                window.open(dog.adoptionUrl, '_blank', 'noopener,noreferrer');
              }}
            >
              <ExternalLink className="mr-2 h-5 w-5" />
              Adopt {dog.realName || dog.name}!
            </Button>
          )}
        </CardContent>
      </div>
    </Card>
  );
}
