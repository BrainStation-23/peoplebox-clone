import { useCallback, useRef, useEffect } from "react";
import Wordcloud from "@visx/wordcloud/lib/Wordcloud";

interface WordCloudProps {
  words: Array<{
    text: string;
    value: number;
  }>;
}

interface WordData {
  text: string;
  size: number;
}

export function WordCloud({ words }: WordCloudProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const colors = [
    "#9b87f5",  // Primary Purple
    "#F97316",  // Bright Orange
    "#0EA5E9",  // Ocean Blue
    "#D946EF",  // Magenta Pink
    "#8B5CF6",  // Vivid Purple
    "#D6BCFA",  // Light Purple
  ];

  useEffect(() => {
    console.log("WordCloud received words:", words);
  }, [words]);

  // Convert our data format to what @visx/wordcloud expects
  const formattedWords = words.map((w) => ({
    text: w.text,
    size: w.value,
  }));

  const getRotation = useCallback(() => {
    return 0; // Fixed rotation for better readability
  }, []);

  const getFontSize = useCallback((word: WordData) => {
    const maxSize = Math.max(...words.map((w) => w.value));
    const minSize = Math.min(...words.map((w) => w.value));
    const scale = (word.size - minSize) / (maxSize - minSize || 1);
    return 14 + scale * 36; // Scale between 14px and 50px
  }, [words]);

  const getColor = useCallback((word: WordData) => {
    // Use the word's text to generate a consistent but random index
    const index = Math.abs(word.text.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0)) % colors.length;
    return colors[index];
  }, []);


  return (
    <div ref={containerRef} className="w-full h-[500px] flex items-center justify-center p-4">
      <Wordcloud
        words={formattedWords}
        width={containerRef.current?.clientWidth || 800}
        height={500}
        fontSize={(w) => getFontSize(w as WordData)}
        font={"Inter"}
        padding={3}
        rotate={getRotation}
        spiral="archimedean"
      >
        {(cloudWords) => (
          <g>
            {cloudWords.map((w, i) => (
              <text
                key={i}
                fill={getColor(w as WordData)}
                textAnchor="middle"
                transform={`translate(${w.x}, ${w.y}) rotate(${w.rotate})`}
                fontSize={w.size}
                fontFamily={w.font}
                style={{ userSelect: "none" }}
              >
                {w.text}
              </text>
            ))}
          </g>
        )}
      </Wordcloud>
    </div>
  );
}
