
"use client";

import { Badge } from "@/components/ui/badge";

interface TagCloudProps {
  tags: string[];
}

const tagColors = [
  "bg-primary text-primary-foreground hover:bg-primary/90",
  "bg-accent text-accent-foreground hover:bg-accent/90",
  "bg-secondary text-secondary-foreground hover:bg-secondary/90",
];

export function TagCloud({ tags }: TagCloudProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag, index) => (
        <Badge
          key={tag}
          variant="outline"
          className={`px-3 py-1 rounded-full text-sm border-none shadow-sm ${tagColors[index % tagColors.length]}`}
        >
          {/* Using text emojis for fun, as per "fun emoji icons" + "tag cloud" */}
          {tag === 'Clingy' && '🥰 '}
          {tag === 'Needy' && '🥺 '}
          {tag === 'Ick' && '😬 '}
          {tag}
        </Badge>
      ))}
    </div>
  );
}
