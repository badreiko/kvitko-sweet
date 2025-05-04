import { Link } from "react-router-dom";
import logoSvg from "@/assets/logo.svg";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

const Logo = ({ className = "", size = "md", showText = true }: LogoProps) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  return (
    <Link to="/" className={`flex items-center gap-2 ${className}`}>
      <img 
        src={logoSvg} // Используем импортированный SVG
        alt="Kvitko Sweet Logo" 
        className={`${sizeClasses[size]}`} 
      />
      {showText && (
        <div>
          <h1 className="text-xl font-bold text-foreground">Kvitko Sweet</h1>
          <p className="text-xs text-muted-foreground">Květinové studio</p>
        </div>
      )}
    </Link>
  );
};

export default Logo;