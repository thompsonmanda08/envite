"use client";
import { LANDING_PAGE as mockData } from "@/configs/data";
import { ArrowRight, Upload, Users, Send, Star, Check } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import Logo from "./base/logo";
import HeroSection from "./landing-page/hero";
import Navbar from "./landing-page/navbar";

const LandingPage = () => {
  const [selectedPlan, setSelectedPlan] = useState("starter");

  return (
    <div className="">
      {/* How It Works - Mobile First */}
      <section
        id="how-it-works"
        className="py-12 sm:py-16 md:py-20 lg:py-24 xl:py-30"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
          <div className="text-center mb-8 sm:mb-12 md:mb-16 lg:mb-20 max-w-3xl mx-auto">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-medium leading-tight text-primary mb-3 sm:mb-4">
              How e-nvite Works
            </h2>
            <p className="text-base sm:text-lg md:text-xl leading-relaxed text-primary px-2">
              Three simple steps to stunning invitations
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10 lg:gap-12">
            {mockData.steps.map((step, index) => (
              <div
                key={index}
                className="text-center px-4 sm:px-6 py-6 sm:py-8 bg-warm-beige relative"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 text-primary">
                  {step.icon === "upload" && (
                    <Upload size={20} className="sm:w-6 sm:h-6" />
                  )}
                  {step.icon === "users" && (
                    <Users size={20} className="sm:w-6 sm:h-6" />
                  )}
                  {step.icon === "send" && (
                    <Send size={20} className="sm:w-6 sm:h-6" />
                  )}
                </div>
                <div className="absolute top-3 sm:top-4 right-3 sm:right-4 text-xs font-semibold text-text-light">
                  {step.number}
                </div>
                <h3 className="text-base sm:text-lg md:text-xl font-medium leading-normal text-primary mb-2 sm:mb-3">
                  {step.title}
                </h3>
                <p className="text-sm sm:text-base leading-relaxed text-primary">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Mobile First */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 xl:py-30 bg-foreground/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 lg:gap-16 xl:gap-20 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-medium leading-tight text-primary mb-4 sm:mb-6 text-center lg:text-left">
                Everything You Need for Perfect Invitations
              </h2>
              <div className="flex flex-col gap-4 sm:gap-5 md:gap-6">
                {mockData.features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 sm:gap-4 py-2 sm:py-3 md:py-4"
                  >
                    <Check
                      size={18}
                      className="sm:w-5 sm:h-5 text-text-meta mt-1 flex-shrink-0"
                    />
                    <div>
                      <h4 className="text-base sm:text-lg font-medium leading-normal text-primary mb-1 sm:mb-2">
                        {feature.title}
                      </h4>
                      <p className="text-sm sm:text-base leading-relaxed text-primary">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="order-1 lg:order-2 flex items-center justify-center">
              <div className="bg-white border border-border-light rounded-lg p-6 sm:p-8 md:p-10 lg:p-12 text-center max-w-sm w-full mx-auto shadow-lg">
                <div className="text-center">
                  <h3 className="text-lg sm:text-xl md:text-2xl mb-3 sm:mb-4 text-primary">
                    Sarah & Mike's Wedding
                  </h3>
                  <p className="mb-2 text-sm sm:text-base text-text-secondary">
                    June 15, 2024
                  </p>
                  <p className="mb-2 text-sm sm:text-base text-text-secondary">
                    Garden Venue, Downtown
                  </p>
                  <p className="italic text-xs sm:text-sm mt-4 sm:mt-6 text-text-secondary">
                    Please RSVP by May 1st
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-30 ">
        <div className="max-w-7xl mx-auto px-10 lg:px-6 md:px-4">
          <div className="text-center mb-20 max-w-2xl mx-auto">
            <h2 className="text-4xl lg:text-3xl font-medium leading-tight text-primary mb-4">
              Choose Your Plan
            </h2>
            <p className="text-lg leading-relaxed text-primary">
              Accessible pricing for every celebration
            </p>
          </div>

          <div className="grid grid-cols-3 lg:grid-cols-1 gap-8">
            {mockData.pricing.map((plan, index) => (
              <div
                key={index}
                className={`bg-warm-beige border border-border-light rounded-lg p-8 text-center cursor-pointer transition-all duration-200 hover:transform hover:-translate-y-1 hover:shadow-xl relative ${selectedPlan === plan.id ? "border-text-primary bg-white" : ""}`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                <div className="mb-8">
                  <h3 className="text-2xl font-medium leading-snug text-primary mb-3">
                    {plan.name}
                  </h3>
                  <div className="flex items-center justify-center mb-6 gap-1">
                    <span className="text-lg text-text-secondary">$</span>
                    <span className="text-5xl font-semibold text-primary">
                      {plan.price}
                    </span>
                    <span className="text-sm text-text-secondary">
                      /{plan.period}
                    </span>
                  </div>
                  <p className="text-base leading-relaxed text-primary">
                    {plan.description}
                  </p>
                </div>

                <div className="text-left mb-8 flex flex-col gap-3">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <Check size={16} className="text-text-meta" />
                      <span className="text-primary">{feature}</span>
                    </div>
                  ))}
                </div>

                <button className="w-full bg-transparent text-foreground border border-border rounded-lg px-6 py-4 text-sm font-semibold cursor-pointer transition-all duration-200 inline-flex items-center justify-center hover:bg-foreground hover:text-white mt-6">
                  {plan.popular ? "Get Started" : "Choose Plan"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample Designs */}
      <section id="designs" className="py-30 bg-secondary/5">
        <div className="max-w-7xl mx-auto px-10 lg:px-6 md:px-4">
          <div className="text-center mb-20 max-w-2xl mx-auto">
            <h2 className="text-4xl lg:text-3xl font-medium leading-tight text-primary mb-4">
              Beautiful Design Templates
            </h2>
            <p className="text-lg leading-relaxed text-primary">
              Curated designs for every occasion
            </p>
          </div>

          <div className="grid grid-cols-3 lg:grid-cols-1 gap-8">
            {mockData.sampleDesigns.map((design, index) => (
              <div
                key={index}
                className="bg-white rounded-lg overflow-hidden transition-all duration-200 hover:transform hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="h-50 flex items-center justify-center">
                  <div
                    className={`w-35 h-45 rounded-lg flex flex-col items-center justify-center text-center p-4 text-white text-xs ${
                      design.style === "floral"
                        ? "bg-gradient-to-br from-yellow-600 to-yellow-700"
                        : design.style === "minimal"
                          ? "bg-primary"
                          : design.style === "vintage"
                            ? "bg-gradient-to-br from-yellow-800 to-yellow-900"
                            : design.style === "corporate"
                              ? "bg-gradient-to-br from-gray-600 to-gray-800"
                              : design.style === "rustic"
                                ? "bg-gradient-to-br from-amber-700 to-amber-800"
                                : "bg-gradient-to-br from-green-700 to-green-800"
                    }`}
                  >
                    <h4 className="text-white">{design.title}</h4>
                    <p className="text-white">{design.occasion}</p>
                  </div>
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-lg leading-normal text-primary">
                    {design.name}
                  </h3>
                  <p className="text-sm leading-normal text-text-secondary">
                    {design.category}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-30">
        <div className="max-w-7xl mx-auto px-10 lg:px-6 md:px-4">
          <div className="text-center mb-20 max-w-2xl mx-auto">
            <h2 className="text-4xl lg:text-3xl font-medium leading-tight text-primary mb-4">
              What Our Clients Say
            </h2>
          </div>

          <div className="grid grid-cols-3 lg:grid-cols-1 gap-8">
            {mockData.testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-warm-beige p-8 rounded-lg text-center"
              >
                <div className="flex justify-center gap-1 mb-6 text-yellow-600">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
                <p className="text-base leading-relaxed italic mb-6 text-primary">
                  "{testimonial.text}"
                </p>
                <div>
                  <strong className="block mb-1 text-base leading-relaxed text-primary">
                    {testimonial.author}
                  </strong>
                  <span className="text-sm leading-normal text-text-secondary">
                    {testimonial.event}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-30 bg-primary text-center">
        <div className="max-w-7xl mx-auto px-10 lg:px-6 md:px-4">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-4xl lg:text-3xl font-normal leading-snug text-primary mb-4">
              Ready to Create Your Perfect Invitation?
            </h2>
            <p className="text-lg leading-relaxed text-primary mb-8">
              Join thousands of happy hosts who trust e-nvite for their special
              moments.
            </p>
            <div className="flex lg:flex-col items-center justify-center gap-6 lg:gap-4">
              <button className="bg-transparent text-foreground border border-border rounded-lg px-6 py-4 min-w-[160px] h-[52px] text-sm font-semibold cursor-pointer transition-all duration-200 inline-flex items-center justify-center gap-2 hover:bg-foreground hover:text-white">
                Start Your Free Trial
                <ArrowRight size={16} />
              </button>
              <button className="bg-transparent border-none px-4 py-3 text-sm text-foreground cursor-pointer relative transition-colors duration-200 group">
                Schedule a Demo
                <span className="absolute bottom-2 left-4 w-0 h-px bg-foreground transition-all duration-300 group-hover:w-[calc(100%-2rem)]"></span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className=" border-t border-border-light py-20 lg:py-16">
        <div className="max-w-7xl mx-auto px-10 lg:px-6 md:px-4">
          <div className="grid grid-cols-3 lg:grid-cols-1 gap-20 lg:gap-12 mb-12">
            <div>
              <h3 className="text-2xl font-semibold text-primary no-underline mb-4">
                e-nvite
              </h3>
              <p className="text-sm leading-normal text-text-secondary">
                Elegant invitations for every celebration
              </p>
            </div>

            <div className="grid grid-cols-3 lg:grid-cols-2 md:grid-cols-1 gap-8">
              <div>
                <h4 className="text-base font-semibold text-primary mb-4">
                  Product
                </h4>
                <a
                  href="#"
                  className="block text-text-secondary no-underline text-sm mb-2 transition-colors duration-200 hover:text-primary"
                >
                  Features
                </a>
                <a
                  href="#"
                  className="block text-text-secondary no-underline text-sm mb-2 transition-colors duration-200 hover:text-primary"
                >
                  Pricing
                </a>
                <a
                  href="#"
                  className="block text-text-secondary no-underline text-sm mb-2 transition-colors duration-200 hover:text-primary"
                >
                  Templates
                </a>
              </div>
              <div>
                <h4 className="text-base font-semibold text-primary mb-4">
                  Support
                </h4>
                <a
                  href="#"
                  className="block text-text-secondary no-underline text-sm mb-2 transition-colors duration-200 hover:text-primary"
                >
                  Help Center
                </a>
                <a
                  href="#"
                  className="block text-text-secondary no-underline text-sm mb-2 transition-colors duration-200 hover:text-primary"
                >
                  Contact
                </a>
                <a
                  href="#"
                  className="block text-text-secondary no-underline text-sm mb-2 transition-colors duration-200 hover:text-primary"
                >
                  FAQ
                </a>
              </div>
              <div>
                <h4 className="text-base font-semibold text-primary mb-4">
                  Company
                </h4>
                <a
                  href="#"
                  className="block text-text-secondary no-underline text-sm mb-2 transition-colors duration-200 hover:text-primary"
                >
                  About
                </a>
                <a
                  href="#"
                  className="block text-text-secondary no-underline text-sm mb-2 transition-colors duration-200 hover:text-primary"
                >
                  Privacy
                </a>
                <a
                  href="#"
                  className="block text-text-secondary no-underline text-sm mb-2 transition-colors duration-200 hover:text-primary"
                >
                  Terms
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-border-light pt-8 text-center">
            <p className="text-sm leading-normal text-text-secondary">
              © 2024 e-nvite. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
