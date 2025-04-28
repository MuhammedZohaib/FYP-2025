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
      <header className="container mx-auto flex items-center justify-between py-4">
        <Navbar />
      </header>

      {/* Hero Section */}
      <section className="relative mt-20 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-black/80 z-0"></div>
        <div className="absolute inset-0 bg-cover bg-center opacity-20 z-[-1]"></div>
        <div className="container mx-auto text-center relative z-10">
          <div className="max-w-3xl mx-auto mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Diagnose your ASD in minutes, not hours
            </h1>
            <p className="text-lg text-gray-300 mb-8">
              With our state of the art scanning page, we are to back know
              testing services, you can check your website in seconds.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Book Consultation
              </Button>

              <Link href={"/dashboard"}>
                <Button
                  variant="outline"
                  className="border-gray-700 text-white bg-gray-700"
                >
                  Go to the Dashboard
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative mx-auto max-w-5xl">
            <div className="absolute -left-1 top-1/4 h-1/2 w-1 bg-gradient-to-b from-orange-500 to-orange-600"></div>
            <Image
              src="/image.jpg"
              alt="ASD Dashboard"
              width={1200}
              height={800}
              className="rounded-lg border border-gray-800 shadow-2xl object-cover"
            />
          </div>
        </div>
        <BackgroundBeams />
      </section>

      {/* Features Section */}
      <section id="features" className="w-full py-12 bg-black">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
            Powerful Features for Accurate ASD Detection
          </h2>
          <p className="mt-4 text-gray-400 max-w-[600px] mx-auto">
            Explore the Features That Simplify Early ASD Detection
          </p>
        </div>
        <FeaturesSection />
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-12 bg-black">
        <TestimonialsSection></TestimonialsSection>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-black">
        <div className="p-12 text-center mb-16 px-[2rem]">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
            Get in Touch for Support & Inquiries
          </h2>
          <p className="mt-4 text-gray-400 max-w-[600px] mx-auto">
            We're Here to Assist You
          </p>
        </div>
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

            <Card className="bg-[radial-gradient(circle,#171717_0%,#151515_100%)] border-gray-800 p-8">
              <h3 className="text-xl text-white font-bold mb-6">
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
                    className="w-full px-4 py-2 bg-black text-white border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-4 py-2 bg-black text-white border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    rows={5}
                    className="w-full px-4 py-2 bg-black text-white border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your queries for better understanding"
                  ></textarea>
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium">
                  Book a Consultation
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer></Footer>
    </div>
  );
}
