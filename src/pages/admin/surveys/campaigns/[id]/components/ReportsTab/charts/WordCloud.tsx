import { useCallback } from "react";
import { Text } from "@visx/text";
import { scaleLog } from "@visx/scale";
import Wordcloud from "@visx/wordcloud/lib/Wordcloud";

interface WordCloudProps {
  words: Array<{
    text: string;
    value: number;
  }>;
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

  const getFontSize = useCallback((datum: { size: number }) => {
    const scale = scaleLog({
      domain: [
        Math.min(...words.map((w) => w.value)),
        Math.max(...words.map((w) => w.value)),
      ],
      range: [12, 32],
    });
    return scale(datum.size);
  }, [words]);

  const getColor = useCallback((datum: { size: number }) => {
    // Use size to determine color - bigger words get darker colors
    const index = Math.floor(
      (datum.size / Math.max(...words.map((w) => w.value))) * colors.length
    );
    return colors[Math.min(index, colors.length - 1)];
  }, [words]);

  return (
    <div className="w-full h-[300px] bg-white">
      <Wordcloud
        words={formattedWords}
        width={600}
        height={300}
        fontSize={getFontSize}
        font={"Inter"}
        padding={2}
        rotate={getRotation}
        spiral="rectangular"
      >
        {(cloudWords) => (
          <g transform={`translate(${600 / 2},${300 / 2})`}>
            {cloudWords.map((w, i) => (
              <Text
                key={i}
                fill={getColor(w)}
                textAnchor="middle"
                transform={`translate(${w.x}, ${w.y}) rotate(${w.rotate})`}
                fontSize={w.size}
                fontFamily={w.font}
              >
                {w.text}
              </Text>
            ))}
          </g>
        )}
      </Wordcloud>
    </div>
  );
}