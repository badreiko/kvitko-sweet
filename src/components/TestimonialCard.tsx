// src/components/TestimonialCard.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

interface TestimonialCardProps {
  testimonial: {
    id: string;
    name: string;
    comment: string;
    rating: number;
    imageUrl?: string;
  };
}

export function TestimonialCard({ testimonial }: TestimonialCardProps) {
  return (
    <Card className="border-none bg-background/50 backdrop-blur-sm">
      <CardContent className="p-8 text-center">
        {testimonial.imageUrl && (
          <div className="mb-4 flex justify-center">
            <img
              src={testimonial.imageUrl}
              alt={testimonial.name}
              className="w-16 h-16 rounded-full object-cover"
            />
          </div>
        )}
        <div className="flex justify-center mb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star 
              key={i} 
              className={`h-5 w-5 ${i < testimonial.rating ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`} 
            />
          ))}
        </div>
        <p className="text-lg mb-6 italic">"{testimonial.comment}"</p>
        <p className="font-semibold">{testimonial.name}</p>
      </CardContent>
    </Card>
  );
}
