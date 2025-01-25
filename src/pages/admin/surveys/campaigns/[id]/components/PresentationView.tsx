import { useParams } from "react-router-dom";

export default function PresentationView() {
  const { id } = useParams();
  
  return (
    <div className="min-h-screen bg-background">
      <h1>Presentation View for Campaign {id}</h1>
      {/* We'll implement the Slidev integration here in Phase 3 */}
    </div>
  );
}