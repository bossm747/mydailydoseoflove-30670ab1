import { Button } from "@/components/ui/button";
import { Heart, DollarSign, CheckSquare, Camera, MessageCircle, Settings, Menu } from "lucide-react";
import { useState } from "react";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { icon: Heart, label: "Dashboard", href: "#dashboard", gradient: "from-secondary to-secondary-light" },
    { icon: DollarSign, label: "Finances", href: "#finances", gradient: "from-success to-success/80" },
    { icon: CheckSquare, label: "Business", href: "#business", gradient: "from-primary to-primary-light" },
    { icon: Camera, label: "Memories", href: "#memories", gradient: "from-warning to-warning/80" },
    { icon: MessageCircle, label: "Messages", href: "#messages", gradient: "from-primary-lighter to-secondary-lighter" },
    { icon: Settings, label: "Settings", href: "#settings", gradient: "from-muted-foreground to-accent-foreground" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
              <Heart className="text-white" size={20} />
            </div>
            <span className="text-xl font-bold gradient-text">Together</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Button
                key={item.label}
                variant="ghost"
                className="group relative overflow-hidden hover:bg-transparent"
                asChild
              >
                <a href={item.href} className="flex items-center space-x-2 px-4 py-2">
                  <div className={`w-8 h-8 bg-gradient-to-r ${item.gradient} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                    <item.icon className="text-white" size={16} />
                  </div>
                  <span className="font-medium group-hover:text-primary transition-colors">
                    {item.label}
                  </span>
                </a>
              </Button>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            <Menu size={20} />
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border bg-white/95 backdrop-blur-md">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <Button
                  key={item.label}
                  variant="ghost"
                  className="group justify-start hover:bg-accent/50"
                  asChild
                >
                  <a href={item.href} className="flex items-center space-x-3 px-4 py-3">
                    <div className={`w-8 h-8 bg-gradient-to-r ${item.gradient} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                      <item.icon className="text-white" size={16} />
                    </div>
                    <span className="font-medium group-hover:text-primary transition-colors">
                      {item.label}
                    </span>
                  </a>
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;