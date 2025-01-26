import { SlideProps } from "../types";
import { format } from "date-fns";

export function TitleSlide({ campaign, isActive }: SlideProps) {
  return (
    <div className={`slide ${isActive ? 'active' : ''} p-8 space-y-6`}>
      <h1 className="text-4xl font-bold">{campaign.name}</h1>
      {campaign.description && (
        <p className="text-xl text-muted-foreground">{campaign.description}</p>
      )}
      <div className="space-y-2">
        <p className="text-lg">
          <span className="font-semibold">Period:</span>{" "}
          {format(new Date(campaign.starts_at), "PPP")} -{" "}
          {format(new Date(campaign.ends_at), "PPP")}
        </p>
        <p className="text-lg">
          <span className="font-semibold">Completion Rate:</span>{" "}
          {campaign.completion_rate.toFixed(1)}%
        </p>
      </div>
    </div>
  );
}