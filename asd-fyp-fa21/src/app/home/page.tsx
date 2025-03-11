import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AutoScrollCarousel } from "@/components/ui/auto-scroll-carousel";
import FeaturesSection from "./feature-section";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="container mx-auto flex items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded bg-blue-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white"
            >
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
          <span className="font-bold">ASD</span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-sm hover:text-blue-400">
            Features
          </Link>
          <Link href="#testimonials" className="text-sm hover:text-blue-400">
            Testimonials
          </Link>
          <Link href="#contact" className="text-sm hover:text-blue-400">
            Contact
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="text-white hover:text-blue-400">
            Login
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            Book Consultation
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-black/80 z-0"></div>
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=800&width=1600')] bg-cover bg-center opacity-20 z-[-1]"></div>
        <div className="container mx-auto text-center relative z-10">
          <div className="max-w-3xl mx-auto mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Diagnose your ASD in minutes, not hours
            </h1>
            <p className="text-lg text-gray-300 mb-8">
              With our state of the art scanning page, we are to back know
              testing services, you can check your website in seconds.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Book Consultation
              </Button>
              <Button
                variant="outline"
                className="border-gray-700 text-white hover:bg-gray-800"
              >
                Go to the Dashboard
              </Button>
            </div>
          </div>

          <div className="relative mx-auto max-w-5xl">
            <div className="absolute -left-1 top-1/4 h-1/2 w-1 bg-gradient-to-b from-orange-500 to-orange-600"></div>
            <Image
              src="/image.jpg"
              alt="ASD Dashboard"
              width={1000}
              height={600}
              className="rounded-lg border border-gray-800 shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="w-full py-12 md:py-24 lg:py-32 bg-black"
      >
        <FeaturesSection />
      </section>

      {/* Testimonials Section */}
      <section
        id="testimonials"
        className="w-full py-12 md:py-24 lg:py-32 bg-black"
      >
        <div className="container px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              What Our Users Are Saying
            </h2>
            <p className="mt-4 text-gray-400 max-w-[600px] mx-auto">
              Hear from families, educators, and professionals who have
              benefited from our platform.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <AutoScrollCarousel
              testimonials={[
                {
                  content:
                    "This platform bridges the gap between technology and ASD diagnosis. It's a powerful, user-friendly tool that complements our clinical assessments.",
                  author: "John Carter",
                  role: "Child Psychologist",
                  company: "A Dream Within a Dream",
                },
                {
                  content:
                    "Using this platform was a game-changer for us. The AI-driven results were fast, clear, and the insights helped us take early steps for our child's development.",
                  author: "Sarah Mitchell",
                  role: "Parent",
                  company: "A Dream Within a Dream",
                },
                {
                  content:
                    "As an educator, identifying early signs of ASD is challenging. This platform's clear, data-driven predictions help support children more effectively in the classroom.",
                  author: "James Davidson",
                  role: "Special Educator",
                  company: "A Dream Within a Dream",
                },
              ]}
            />
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-black">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold mb-6">
                Have questions or need support? We're here to help!
              </h2>
              <p className="text-gray-400 mb-8">
                Whether you need assistance with the platform, have feedback to
                share, or want to learn more about our services, our team is
                ready to assist you.
              </p>
              <div className="flex flex-wrap gap-2 mb-8">
                {[1, 2, 3, 4, 5].map((star) => (
                  <div
                    key={star}
                    className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-white"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500">Trusted by 2,000+ doctors</p>
            </div>

            <Card className="bg-gray-900 border-gray-800 p-8">
              <h3 className="text-xl font-bold mb-6">
                In case of any queries reach out to us by filling the form below
              </h3>
              <form className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium mb-2"
                  >
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium mb-2"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your email address"
                  />
                </div>
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium mb-2"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    rows={5}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your queries for better understanding"
                  ></textarea>
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Book Consultation
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 border-t border-gray-800">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <input type="checkbox" id="access" className="mr-2" />
            <label htmlFor="access" className="text-sm text-gray-400">
              Access the dashboard
            </label>
          </div>
          <div className="text-sm text-gray-500">
            © Copyright Startup 2024. All rights reserved.
          </div>
          <div className="text-sm text-gray-400 mt-4 md:mt-0">
            <Link href="#" className="hover:text-blue-400">
              Terms & Conditions
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
