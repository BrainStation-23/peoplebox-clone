import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="text-2xl font-bold text-primary">SurveyFlow</div>
        <Button 
          variant="outline" 
          onClick={() => navigate('/login')}
          className="font-medium"
        >
          Login
        </Button>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Streamline Your Survey Management
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Create, distribute, and analyze surveys with ease. Get valuable insights from your team in real-time.
          </p>
          <Button 
            size="lg"
            onClick={() => navigate('/login')}
            className="font-medium"
          >
            Get Started <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Anonymous Surveys",
              description: "Ensure honest feedback with anonymous survey options"
            },
            {
              title: "Real-time Analytics",
              description: "Get instant insights with powerful analytics dashboard"
            },
            {
              title: "Easy Distribution",
              description: "Share surveys effortlessly with your team"
            }
          ].map((feature, index) => (
            <div 
              key={index}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <CheckCircle className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t">
        <div className="text-center text-gray-600">
          © {new Date().getFullYear()} SurveyFlow. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Index;