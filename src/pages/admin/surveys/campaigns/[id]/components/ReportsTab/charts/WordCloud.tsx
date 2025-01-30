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
    "#2563eb", // blue-600
    "#3b82f6", // blue-500
    "#60a5fa", // blue-400
    "#93c5fd", // blue-300
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
    const maxSize = Math.max(...words.map((w) => w.value));
    const index = Math.floor((word.size / maxSize) * colors.length);
    return colors[Math.min(index, colors.length - 1)];
  }, [words]);

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
          <g transform={`translate(${(containerRef.current?.clientWidth || 800) / 2},250)`}>
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