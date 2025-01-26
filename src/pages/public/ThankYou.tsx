import { useParams } from "react-router-dom";

export default function ThankYouPage() {
  const { token } = useParams();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">Thank You!</h1>
        <p className="text-muted-foreground mb-8">
          Your response has been submitted successfully. You can now close this window.
        </p>
      </div>
    </div>
  );
}