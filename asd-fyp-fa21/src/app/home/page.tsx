"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/ui/navbar";
import { TestimonialsSection } from "@/components/testimonial-section";
import { Footer } from "@/components/footer";
import { BackgroundBeams } from "@/components/ui/background-beams";
import FeaturesSection from "@/components/feature-section";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="container mx-auto px-4 flex items-center justify-between py-4">
        <Navbar />
      </header>

      {/* Hero Section */}
      <section className="relative mt-10 md:mt-20 py-12 md:py-20">
        <BackgroundBeams className="absolute inset-0 z-0" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-3xl mx-auto mb-8 md:mb-12">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">
              Diagnose your ASD in minutes, not hours
            </h1>
            <p className="text-base md:text-lg text-gray-300 mb-6 md:mb-8 px-4">
              With our state of the art scanning page, we are to back know
              testing services, you can check your website in seconds.
            </p>
          </div>

          <div className="relative mx-auto max-w-5xl px-4">
            <div className="absolute -left-1 top-1/4 h-1/2 w-1 bg-gradient-to-b from-orange-500 to-orange-600"></div>
            <Image
              src="/image.jpg"
              alt="ASD Dashboard"
              width={1200}
              height={800}
              className="rounded-lg border border-gray-800 shadow-2xl object-cover w-full"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="w-full py-12 md:py-20 bg-black px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-5xl font-bold tracking-tighter px-4">
            Powerful Features for Accurate ASD Detection
          </h2>
          <p className="mt-4 text-gray-400 max-w-[600px] mx-auto px-4">
            Explore the Features That Simplify Early ASD Detection
          </p>
        </div>
        <FeaturesSection />
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-12 md:py-20 bg-black px-4">
        <TestimonialsSection />
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-12 md:py-20 bg-black px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-5xl font-bold tracking-tighter px-4">
            Get in Touch for Support & Inquiries
          </h2>
          <p className="mt-4 text-gray-400 max-w-[600px] mx-auto">
            We're Here to Assist You
          </p>
        </div>
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            <div className="px-4">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">
                Have questions or need support? We're here to help!
              </h2>
              <p className="text-gray-400 mb-6 md:mb-8">
                Whether you need assistance with the platform, have feedback to
                share, or want to learn more about our services, our team is
                ready to assist you.
              </p>
              <div className="flex flex-wrap gap-2 mb-6 md:mb-8">
                {[1, 2, 3, 4, 5].map((star) => (
                  <div
                    key={star}
                    className="w-8 md:w-10 h-8 md:h-10 rounded-full bg-blue-600 flex items-center justify-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
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

            <Card className="bg-[radial-gradient(circle,#171717_0%,#151515_100%)] border-gray-800 p-4 md:p-8">
              <h3 className="text-lg md:text-xl text-white font-bold mb-4 md:mb-6">
                In case of any queries reach out to us by filling the form below
              </h3>
              <form className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-white mb-2"
                  >
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    className="w-full px-3 py-2 bg-black text-white border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-white mb-2"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="w-full px-3 py-2 bg-black text-white border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your email address"
                  />
                </div>
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-white mb-2"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    rows={4}
                    className="w-full px-3 py-2 bg-black text-white border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your queries for better understanding"
                  ></textarea>
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2">
                  Book a Consultation
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
