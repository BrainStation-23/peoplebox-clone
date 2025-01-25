import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ReactWordcloud from "react-wordcloud";
import "tippy.js/dist/tippy.css";
import "tippy.js/animations/scale.css";

interface WordCloudProps {
  title: string;
  words: Array<{
    text: string;
    value: number;
  }>;
}

export function WordCloud({ title, words }: WordCloudProps) {
  const options = {
    rotations: 2,
    rotationAngles: [-90, 0] as [number, number],
    fontSizes: [12, 30] as [number, number],
    padding: 2,
    deterministic: true,
  };

  const callbacks = {
    getWordTooltip: (word: { text: string; value: number }) => 
      `${word.text} (${word.value} occurrences)`,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ height: "300px", width: "100%" }}>
          <ReactWordcloud
            words={words}
            options={options}
            callbacks={callbacks}
          />
        </div>
      </CardContent>
    </Card>
  );
}