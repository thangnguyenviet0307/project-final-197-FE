"use client"

import React from "react"
import { StoreHeader } from "@/pages/public/landing/components/store-header"
import { StoreNavbar } from "@/pages/public/landing/components/store-navbar"
import { HeroSection } from "@/pages/public/landing/components/hero-section"
import { LogoCarousel } from "@/pages/public/landing/components/logo-carousel"
import { StatsSection } from "@/pages/public/landing/components/stats-section"
import { FeaturesSection } from "@/pages/public/landing/components/features-section"
import { TeamSection } from "@/pages/public/landing/components/team-section"
import { TestimonialsSection } from "@/pages/public/landing/components/testimonials-section"
import { BlogSection } from "@/pages/public/landing/components/blog-section"
import { PricingSection } from "@/pages/public/landing/components/pricing-section"
import { CTASection } from "@/pages/public/landing/components/cta-section"
import { ContactSection } from "@/pages/public/landing/components/contact-section"
import { FaqSection } from "@/pages/public/landing/components/faq-section"
import { LandingFooter } from "@/pages/public/landing/components/footer"
import {
  LandingThemeCustomizer,
  LandingThemeCustomizerTrigger,
} from "@/pages/public/landing/components/landing-theme-customizer"
import { AboutSection } from "@/pages/public/landing/components/about-section"

export default function LandingPage() {
  const [themeCustomizerOpen, setThemeCustomizerOpen] = React.useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Store Header */}
        <StoreHeader />

      {/* Store Navigation */}
        <StoreNavbar />

      {/* Main Content */}
      <main>
        <HeroSection />
        <LogoCarousel />
        <StatsSection />
        <AboutSection />
        <FeaturesSection />
        <TeamSection />
        <PricingSection />
        <TestimonialsSection />
        <BlogSection />
        <FaqSection />
        <CTASection />
        <ContactSection />
      </main>

      {/* Footer */}
      <LandingFooter />

      {/* Theme Customizer */}
      <LandingThemeCustomizerTrigger
        onClick={() => setThemeCustomizerOpen(true)}
      />
      <LandingThemeCustomizer
        open={themeCustomizerOpen}
        onOpenChange={setThemeCustomizerOpen}
      />
    </div>
  )
}
