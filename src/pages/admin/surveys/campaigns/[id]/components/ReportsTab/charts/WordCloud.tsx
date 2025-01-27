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
    return Math.random() * 60 - 30;
  }, []);

  const getFontSize = useCallback((word: WordData) => {
    const maxSize = Math.max(...words.map((w) => w.value));
    const minSize = Math.min(...words.map((w) => w.value));
    const scale = (word.size - minSize) / (maxSize - minSize || 1);
    return 12 + scale * 20; // Scale between 12px and 32px
  }, [words]);

  const getColor = useCallback((word: WordData) => {
    const maxSize = Math.max(...words.map((w) => w.value));
    const index = Math.floor((word.size / maxSize) * colors.length);
    return colors[Math.min(index, colors.length - 1)];
  }, [words]);

  return (
    <div ref={containerRef} className="w-full h-[400px] relative">
      <Wordcloud
        words={formattedWords}
        width={containerRef.current?.clientWidth || 600}
        height={400}
        fontSize={(w) => getFontSize(w as WordData)}
        font={"Inter"}
        padding={2}
        rotate={getRotation}
        spiral="rectangular"
      >
        {(cloudWords) => (
          <g transform={`translate(${(containerRef.current?.clientWidth || 600) / 2},200)`}>
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