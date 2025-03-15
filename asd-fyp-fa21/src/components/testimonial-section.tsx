import { TestimonialCarousel } from "./ui/testimonial-carousel";

const testimonials = [
  {
    content:
      "This platform was a game-changer for us. The AI-driven results were fast and clear, and the insights helped us take early steps for our child's development. The entire process was seamless and reassuring.",
    author: "John Carter",
    role: "Child Psychologist",
    company: "A Dream Within a Dream",
  },
  {
    content:
      "This platform bridges the gap between technology and ASD diagnosis. It’s a powerful, user-friendly solution that perfectly complements clinical assessments, making early detection more accessible.",
    author: "Sarah Mitchell",
    role: "Parent",
    company: "A Dream Within a Dream",
  },
  {
    content:
      "As an educator, identifying early signs of ASD can be tough. This tool provides clear, data-driven predictions, allowing us to better support children in the classroom with confidence and precision.",
    author: "James Davidson",
    role: "Special Educator",
    company: "A Dream Within a Dream",
  },
];

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-12 md:py-24 lg:py-32 bg-black">
      <div className="w-full">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-white">
            What Our Users Are Saying
          </h2>
          <p className="mt-4 text-gray-400 max-w-[600px] mx-auto">
            Hear from families, educators, and professionals...
          </p>
        </div>

        <div className="w-full mx-auto">
          <TestimonialCarousel testimonials={testimonials} />
        </div>
      </div>
    </section>
  );
}
