
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Workflow } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <div className="max-w-7xl mx-auto py-16 px-6">
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Ready To Use</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-xl font-semibold mb-2">Feature {i}</h3>
                  <p className="text-gray-600">
                    This is a placeholder for feature content. You can replace this with your actual content.
                  </p>
                </div>
              ))}
            </div>
          </section>
          
          <section className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Build Your Workflow</h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-8">
              Create custom data workflows with our intuitive block-based workflow builder.
              Transform, filter, and process your data without writing code.
            </p>
            <Link to="/workflow-builder">
              <Button size="lg" className="gap-2">
                <Workflow className="h-5 w-5" />
                Open Workflow Builder
              </Button>
            </Link>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
