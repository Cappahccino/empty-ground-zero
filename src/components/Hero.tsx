
import { ArrowRight } from "lucide-react";
import { Button } from "./ui/button";

const Hero = () => {
  return (
    <div className="bg-gradient-to-b from-secondary/50 to-background py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-6">
          Your Project Starts Here
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10">
          A clean, responsive foundation for your next web application. Built with React, Tailwind CSS, and ready for customization.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button className="bg-primary text-white hover:bg-primary/90 text-base px-6 py-6">
            Get Started
          </Button>
          <Button variant="outline" className="text-primary border-primary hover:bg-primary/10 text-base px-6 py-6">
            Learn More <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Hero;
