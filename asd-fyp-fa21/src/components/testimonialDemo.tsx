import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";

export function AnimatedTestimonialsDemo() {
  const testimonials = [
    {
      quote:
        "Receiving an autism diagnosis through this AI tool was empowering. It opened doors to resources I hadn't considered.",
      name: "Morgan Smith",
      designation:
        "Age: 09, Support Level: Level 2 (Requiring substantial support)",
      src: "https://images.unsplash.com/photo-1490168040734-2226e72962f6?q=80&w=2076&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      quote:
        "The AI detection system was straightforward and insightful, helping me understand myself better.",
      name: "Jordan Lee",
      designation: "Age: 28, Support Level: Level 1 (Requiring support)",
      src: "https://images.unsplash.com/photo-1586297135537-94bc9ba060aa?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTJ8fGF1dGlzbSUyMHVzZXJ8ZW58MHx8MHx8fDA%3D",
    },
    {
      quote:
        "Discovering my autism through this AI system was a revelation. It provided clarity and a path forward.",
      name: "Alex Rivera",
      designation: "Age: 17, Support Level: Level 1 (Requiring support)",
      src: "https://images.unsplash.com/photo-1632609217247-bc97c2b9f6f9?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NjB8fGF1dGlzbSUyMHVzZXJ8ZW58MHx8MHx8fDA%3D",
    },

    {
      quote:
        "The AI system's accuracy and ease of use made the diagnostic process less daunting. I'm grateful for the insights it provided.",
      name: "Casey Nguyen",
      designation: "Age: 04, Support Level: Level 1 (Requiring support)",
      src: "https://images.unsplash.com/photo-1514486926376-b0ce3e56c145?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fGF1dGlzbSUyMHVzZXJ8ZW58MHx8MHx8fDA%3D",
    },
    {
      quote:
        "This AI detection system was a game-changer for me. It validated my experiences and guided me toward appropriate support.",
      name: "Taylor Morgan",
      designation:
        "Age: 08, Support Level: Level 2 (Requiring substantial support)",
      src: "https://images.unsplash.com/photo-1490168040734-2226e72962f6?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGF1dGlzbSUyMHVzZXJ8ZW58MHx8MHx8fDA%3D",
    },
  ];
  return <AnimatedTestimonials testimonials={testimonials} />;
}
