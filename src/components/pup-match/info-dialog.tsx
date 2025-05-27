
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import type { ReactNode } from "react";

export function InfoDialog({ children }: { children: ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-lg bg-background/95 backdrop-blur-sm">
        <Tabs defaultValue="background" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="background">Background</TabsTrigger>
            <TabsTrigger value="manifesto">Manifesto</TabsTrigger>
          </TabsList>
          <TabsContent value="background">
            <DialogHeader className="mt-4">
              <DialogTitle className="text-primary text-center">About the Background</DialogTitle>
              <DialogDescription className="text-foreground/80 text-sm text-left pt-2">
                The background you see on this page is from the movie 777 Charlie, a beautiful Kannada film that follows the journey of a grumpy guy and a super sweet Labrador named Charlie. If you’ve seen it, you know it’s an emotional rollercoaster that hits you right in the feels — in the best way.
                <br /><br />
                We picked this image because Charlie perfectly represents what dogs bring into our lives: unconditional love, chaos, comfort, and pure joy. That’s exactly what this site is about too — celebrating every goofy, loving, adoptable dog out there.
                <br /><br />
                <em>&quot;Charlie didn’t just walk into Dharma’s house — she walked into his heart.&quot;</em> 💛🐾
                <br /><br />
                Image Source: Movie still from 777 Charlie (2022), directed by Kiranraj K. All credits to the amazing creators of the film.
              </DialogDescription>
            </DialogHeader>
          </TabsContent>
          <TabsContent value="manifesto">
            <DialogHeader className="mt-4">
              <DialogTitle className="text-primary text-center">Our Paw-sitive Manifesto</DialogTitle>
              <DialogDescription className="text-foreground/80 text-sm text-left pt-2">
                At Tinder for Dogs, we believe:
              </DialogDescription>
            </DialogHeader>
            <ul className="mt-3 space-y-2 text-sm text-foreground/90 list-disc list-inside pl-2">
              <li>Every wag tells a story.</li>
              <li>In the magic of a wet nose and a happy bark.</li>
              <li>Finding the right match is about personality, playful puns, and paw-sitivity!</li>
              <li>Life is better with a dog (or two, or three...).</li>
              <li>Belly rubs are a universal love language.</li>
              <li>In celebrating the unique charm of every breed and mix.</li>
              <li>Silliness is a superpower.</li>
            </ul>
            <p className="mt-4 text-xs text-foreground/70 italic text-center">
              Sniff, swipe, and smile!
            </p>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
