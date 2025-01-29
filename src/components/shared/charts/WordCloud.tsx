import { Text } from '@visx/text';
import { scaleLog } from '@visx/scale';
import Wordcloud from '@visx/wordcloud/lib/Wordcloud';

interface WordCloudProps {
  words: Array<{
    text: string;
    value: number;
  }>;
}

export function WordCloud({ words }: WordCloudProps) {
  const fontScale = scaleLog({
    domain: [
      Math.min(...words.map((w) => w.value)),
      Math.max(...words.map((w) => w.value)),
    ],
    range: [10, 48],
  });

  return (
    <div className="w-full h-[400px]">
      <Wordcloud
        words={words}
        width={800}
        height={400}
        fontSize={(w) => fontScale(w.value)}
        font="Impact"
        padding={2}
        spiral="rectangular"
      >
        {(cloudWords) =>
          cloudWords.map((w, i) => (
            <Text
              key={w.text}
              fill={`hsl(${(i * 360) / cloudWords.length}, 70%, 50%)`}
              textAnchor="middle"
              transform={`translate(${w.x}, ${w.y}) rotate(${w.rotate})`}
              fontSize={w.size}
              fontFamily={w.font}
            >
              {w.text}
            </Text>
          ))
        }
      </Wordcloud>
    </div>
  );
}