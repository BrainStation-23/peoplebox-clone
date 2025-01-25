import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useRef } from "react";

interface WordCloudProps {
  title: string;
  words: Array<{
    text: string;
    value: number;
  }>;
}

export function WordCloud({ title, words }: WordCloudProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // TODO: Implement word cloud visualization
    // We'll need to add a word cloud library dependency
    // For now, display the words in a simple format
  }, [words]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div ref={containerRef} className="h-[300px] flex flex-wrap gap-2">
          {words.map((word) => (
            <span
              key={word.text}
              style={{
                fontSize: `${Math.max(12, Math.min(30, word.value * 5))}px`,
              }}
              className="text-primary"
            >
              {word.text}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}