
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white border-b border-gray-200 py-4 px-6 w-full">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <a href="/" className="text-xl font-bold text-primary">Brand</a>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-8">
          <a href="#" className="text-gray-600 hover:text-primary transition-colors">Home</a>
          <a href="#" className="text-gray-600 hover:text-primary transition-colors">Features</a>
          <a href="#" className="text-gray-600 hover:text-primary transition-colors">About</a>
          <a href="#" className="text-gray-600 hover:text-primary transition-colors">Contact</a>
        </div>
        
        <div className="hidden md:block">
          <Button className="bg-primary text-white hover:bg-primary/90">Get Started</Button>
        </div>
        
        {/* Mobile menu button */}
        <div className="md:hidden">
          <button onClick={toggleMenu} className="text-gray-500 hover:text-gray-700">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden pt-4 pb-3 px-2 space-y-3 mt-2">
          <a href="#" className="block px-3 py-2 text-gray-600 hover:text-primary hover:bg-gray-50 rounded-md">Home</a>
          <a href="#" className="block px-3 py-2 text-gray-600 hover:text-primary hover:bg-gray-50 rounded-md">Features</a>
          <a href="#" className="block px-3 py-2 text-gray-600 hover:text-primary hover:bg-gray-50 rounded-md">About</a>
          <a href="#" className="block px-3 py-2 text-gray-600 hover:text-primary hover:bg-gray-50 rounded-md">Contact</a>
          <Button className="w-full mt-3 bg-primary text-white hover:bg-primary/90">Get Started</Button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
