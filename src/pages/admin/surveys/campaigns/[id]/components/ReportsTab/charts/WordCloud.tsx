import { useCallback } from "react";
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
  const colors = [
    "#2563eb", // blue-600
    "#3b82f6", // blue-500
    "#60a5fa", // blue-400
    "#93c5fd", // blue-300
  ];

  // Convert our data format to what @visx/wordcloud expects
  const formattedWords = words.map((w) => ({
    text: w.text,
    size: w.value,
  }));

  const getRotation = useCallback(() => {
    // Randomly rotate between -30 and 30 degrees
    return Math.random() * 60 - 30;
  }, []);

  const getFontSize = useCallback((word: WordData) => {
    const maxSize = Math.max(...words.map((w) => w.value));
    const minSize = Math.min(...words.map((w) => w.value));
    const scale = (word.size - minSize) / (maxSize - minSize);
    return 12 + scale * 20; // Scale between 12px and 32px
  }, [words]);

  const getColor = useCallback((word: WordData) => {
    const maxSize = Math.max(...words.map((w) => w.value));
    const index = Math.floor((word.size / maxSize) * colors.length);
    return colors[Math.min(index, colors.length - 1)];
  }, [words]);

  return (
    <div className="w-full h-full bg-white">
      <Wordcloud
        words={formattedWords}
        width={600}
        height={300}
        fontSize={(w) => getFontSize(w as WordData)}
        font={"Inter"}
        padding={2}
        rotate={getRotation}
        spiral="rectangular"
      >
        {(cloudWords) => (
          <g transform={`translate(${600 / 2},${300 / 2})`}>
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