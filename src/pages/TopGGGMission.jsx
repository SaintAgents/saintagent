import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Shield, Gem, Heart, Crown, Zap, Star, Lock, Globe, Smartphone, 
  CreditCard, Building2, Vault, Coins, ArrowRight, Check, X, 
  Infinity, Clock, Sparkles, Radio, Cpu, Network, Database,
  ChevronDown, Menu, Play, ExternalLink, BookOpen, ChevronRight
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// In-page Navigation (sticky within content area)
const InPageNavigation = () => {
  const navItems = [
    { label: 'Ultranet', href: '#ultranet' },
    { label: 'Technology', href: '#technology' },
    { label: 'Banking', href: '#banking' },
    { label: 'Exchange', href: '#exchange' },
    { label: 'Mission', href: '#mission' },
  ];

  return (
    <div className="sticky top-0 z-40 bg-purple-900/95 backdrop-blur-md border-b border-purple-700/50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src="https://d64gsuwffb70l.cloudfront.net/68be038a43ca0f0ab13d5a76_1759376854470_b9626868.png" 
            alt="GGE Logo" 
            className="h-8 w-8 object-contain"
          />
          <span className="text-yellow-400 font-bold text-base tracking-wide hidden sm:block">GAIA GLOBAL ENTERPRISE</span>
        </div>
        
        {/* Desktop Nav */}
        <div className="flex items-center gap-4 md:gap-6 overflow-x-auto">
          {navItems.map((item) => (
            <a 
              key={item.label}
              href={item.href}
              className="text-gray-200 hover:text-yellow-400 transition-colors font-medium text-sm whitespace-nowrap"
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

// Hero Section
const HeroSection = () => (
  <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
    {/* Background Image */}
    <div 
      className="absolute inset-0 bg-cover bg-center"
      style={{ backgroundImage: `url('https://d64gsuwffb70l.cloudfront.net/68be038a43ca0f0ab13d5a76_1759376096966_a58745c3.jpg')` }}
    />
    <div className="absolute inset-0 bg-gradient-to-b from-purple-900/70 via-purple-900/50 to-purple-900/90" />
    
    {/* Content */}
    <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
      <img 
        src="https://d64gsuwffb70l.cloudfront.net/68be038a43ca0f0ab13d5a76_1759376854470_b9626868.png" 
        alt="GGE Coin" 
        className="w-32 h-32 mx-auto mb-8 animate-pulse"
      />
      <h1 className="text-6xl md:text-8xl font-bold text-yellow-400 mb-6 tracking-wider" style={{ fontFamily: 'serif' }}>
        THE ULTRANET ERA
      </h1>
      <p className="text-2xl md:text-3xl text-yellow-300 mb-4 font-light">
        The Sovereign Digital Infrastructure for Humanity's Golden Age
      </p>
      <p className="text-lg text-gray-300 mb-10 max-w-2xl mx-auto">
        Securing humanity's future through the Ultranet: sovereign, safe, and limitless.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button className="bg-yellow-500 hover:bg-yellow-400 text-purple-900 font-bold rounded-full px-8 py-6 text-lg">
          Learn More
        </Button>
        <Button variant="outline" className="border-yellow-400 text-yellow-400 hover:bg-yellow-400/10 rounded-full px-8 py-6 text-lg">
          <Play className="mr-2" size={20} /> Watch Vision
        </Button>
      </div>
    </div>

    {/* Scroll Indicator */}
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
      <ChevronDown className="text-yellow-400" size={32} />
    </div>
  </section>
);

// Feature Card Component
const FeatureCard = ({ image, title, description, features, reverse = false }) => (
  <div className={cn(
    "flex flex-col lg:flex-row items-center gap-8 py-16",
    reverse && "lg:flex-row-reverse"
  )}>
    <div className="flex-1">
      <img 
        src={image} 
        alt={title}
        className="rounded-2xl shadow-2xl shadow-purple-500/20 w-full max-w-lg mx-auto"
      />
    </div>
    <div className="flex-1 text-left">
      <h2 className="text-4xl font-bold text-yellow-400 mb-4">{title}</h2>
      <p className="text-gray-300 text-lg mb-6 leading-relaxed">{description}</p>
      <ul className="space-y-3 mb-6">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-3 text-gray-200">
            <div className="w-2 h-2 bg-yellow-400 rounded-full" />
            {feature}
          </li>
        ))}
      </ul>
      <Button variant="outline" className="border-yellow-400 text-yellow-400 hover:bg-yellow-400/10 rounded-full">
        Learn More <ArrowRight className="ml-2" size={16} />
      </Button>
    </div>
  </div>
);

// Technology Sections
const TechnologySections = () => {
  const technologies = [
    {
      image: "https://d64gsuwffb70l.cloudfront.net/68be038a43ca0f0ab13d5a76_1759374410272_b3323cb5.jpeg",
      title: "The Ultranet",
      description: "The Ultranet is the next evolutionary leap beyond the internet — a living network of light and intelligence designed to liberate communications from the toxic confines of microwave frequencies.",
      features: ["Quantum-safe channels", "Non-microwave 6G+", "Natural resonances", "Beyond military encryption"]
    },
    {
      image: "https://d64gsuwffb70l.cloudfront.net/68be038a43ca0f0ab13d5a76_1759379644843_02b71bc3.jpg",
      title: "Smart StarChain",
      description: "The Smart StarChain redefines blockchain as we know it. Beyond decentralization, it operates as a celestial lattice of trust, linking transactions in radiant star patterns across infinite nodes of light.",
      features: ["Instant settlement", "Infinite scalability", "Eco-conscious", "Sacred geometry"]
    },
    {
      image: "https://d64gsuwffb70l.cloudfront.net/68be038a43ca0f0ab13d5a76_1759377792549_b7f528c0.jpg",
      title: "Smart Card & Super Smart Phone",
      description: "At the heart of user access lies the GGE Smart Card — a sovereign digital identity that fuses personal authentication, gold-backed assets, and encrypted communications into one portable key.",
      features: ["Biometric authentication", "Holographic display", "Quantum wallet", "Non-radiative telecom"]
    },
    {
      image: "https://d64gsuwffb70l.cloudfront.net/68be038a43ca0f0ab13d5a76_1759380918978_2c5a3abf.jpg",
      title: "Global Digital Commodity Exchange",
      description: "The GDex is the sovereign marketplace for the New Era, where assets are not just traded but transformed.",
      features: ["Resource-backed trading", "Transparent protocols", "Real-time settlement", "Gold integration"]
    },
    {
      image: "https://d64gsuwffb70l.cloudfront.net/68be038a43ca0f0ab13d5a76_1759380560730_20367960.png",
      title: "Neo-NFTs",
      description: "Beyond digital art and speculation, the Neo-NFT is a living digital asset, tethered directly to real-world resources and sovereign guarantees.",
      features: ["Resource-backed assets", "Perpetual authenticity", "Gold-anchored value", "Sacred-digital bridge"]
    },
    {
      image: "https://d64gsuwffb70l.cloudfront.net/68be038a43ca0f0ab13d5a76_1759382484006_3cd7f4af.jpg",
      title: "New Banking",
      description: "GGE Banking is not a reform of the old — it is a rebirth. Operating under Divine Law and sovereign charter, it returns wealth to its rightful foundation: gold, trust, and human dignity.",
      features: ["Gold-backed accounts", "Sovereign lending", "Zero fractional reserves", "Divine Law compliance"]
    },
    {
      image: "https://d64gsuwffb70l.cloudfront.net/68be038a43ca0f0ab13d5a76_1759382489512_aceb0c13.jpg",
      title: "Sovereign Gold Vaults & GGRT",
      description: "At the foundation of the GGE ecosystem lie the Sovereign Gold Vaults, protected under divine decree and secured beyond the reach of corporate powers.",
      features: ["Divine decree protection", "Multi-generational trust", "Corporate-proof security", "Integrity allocation"]
    }
  ];

  return (
    <section id="technology" className="py-20 px-4 max-w-7xl mx-auto">
      {technologies.map((tech, i) => (
        <FeatureCard key={i} {...tech} reverse={i % 2 !== 0} />
      ))}
    </section>
  );
};

// GaiaPay Section
const GaiaPaySection = () => (
  <section className="py-20 px-4 bg-gradient-to-b from-purple-900/50 to-black/50">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <p className="text-yellow-400 text-sm tracking-widest mb-2">Sovereign Payment System</p>
        <h2 className="text-5xl font-bold text-white mb-6">THE FUTURE OF MONEY HAS ARRIVED</h2>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          GaiaPay isn't an accessory to legacy systems — it replaces them.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-12 mb-16">
        <div className="flex-1">
          <img 
            src="https://d64gsuwffb70l.cloudfront.net/68be038a43ca0f0ab13d5a76_1761101252788_1ada585e.png"
            alt="GaiaPay Card"
            className="max-w-md mx-auto"
          />
        </div>
        <div className="flex-1 text-left">
          <p className="text-gray-300 text-lg mb-8 leading-relaxed">
            This is the world's first sovereign smart card and wallet that merges fiat, crypto, and digital identity into one seamless experience. GaiaPay transforms how value moves, translating currencies and crypto assets into real-time checkout equivalents anywhere on Earth.
          </p>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            {[
              { label: "Instant", sub: "Currency Exchange" },
              { label: "Quantum", sub: "Grade Security" },
              { label: "Global", sub: "Network Access" },
              { label: "Unified", sub: "Smart Wallet" }
            ].map((item, i) => (
              <div key={i} className="bg-purple-800/30 border border-purple-700/50 rounded-xl p-4 text-center">
                <p className="text-yellow-400 font-bold text-lg">{item.label}</p>
                <p className="text-gray-400 text-sm">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {[
          {
            title: "Unified Smart Card + Wallet",
            description: "Preloaded, activated, and secured within your personal Smart Wallet. Eliminates Apple Pay, Google Pay, and centralized intermediaries.",
            highlight: "Your wallet becomes your bank"
          },
          {
            title: "Instant Exchange & Conversion",
            description: "Auto-detects merchant currency and instantly exchanges your balance or crypto. Bitcoin, USDC, or fiat — clears in seconds.",
            highlight: "No third-party fees"
          },
          {
            title: "Quantum-Level Security",
            description: "Quantum-grade encryption, biometric validation, multi-layer sovereign trust. Every transaction tokenized and anonymized.",
            highlight: "You control the ledger"
          }
        ].map((card, i) => (
          <Card key={i} className="bg-purple-900/40 border-purple-700/50 text-white">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-yellow-400 mb-3">{card.title}</h3>
              <p className="text-gray-300 mb-4">{card.description}</p>
              <p className="text-yellow-300 font-medium">{card.highlight}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-12">
        {[
          { value: "∞", label: "Currencies Supported", sub: "Fiat + Crypto Universal" },
          { value: "<1s", label: "Transaction Speed", sub: "Real-time Settlement" },
          { value: "0%", label: "Third-Party Fees", sub: "Direct P2P Network" }
        ].map((stat, i) => (
          <div key={i} className="text-center bg-purple-800/20 border border-purple-700/30 rounded-xl p-6">
            <p className="text-4xl font-bold text-yellow-400 mb-2">{stat.value}</p>
            <p className="text-white font-medium">{stat.label}</p>
            <p className="text-gray-400 text-sm">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Feature List */}
      <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          "Preloaded & Auto-Activated Smart Card",
          "Fiat-to-Crypto Instant Translation",
          "Offline & Online Payment Capability",
          "Integrated Biometric Identity",
          "Dynamic Balance Sync",
          "Direct Treasury Connection"
        ].map((feature, i) => (
          <div key={i} className="bg-purple-900/30 border border-purple-700/40 rounded-lg p-4 text-center">
            <p className="text-gray-200 text-sm">{feature}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// Revolutionary Features Section
const RevolutionaryFeatures = () => {
  const features = [
    { icon: Shield, title: "Quantum-Safe Security", description: "Military-grade encryption that transcends current technology, ensuring your data remains secure against even future quantum computing threats." },
    { icon: Coins, title: "Gold-Backed Stability", description: "Every digital asset is anchored to real-world resources, providing unprecedented stability and intrinsic value to your holdings." },
    { icon: Heart, title: "Health-Conscious Design", description: "Non-microwave telecommunications protect your biological systems while delivering faster, more reliable connectivity." },
    { icon: Crown, title: "Sovereign Freedom", description: "True ownership and control of your identity, assets, and communications - free from corporate surveillance and manipulation." },
    { icon: Zap, title: "Lightning Speed", description: "Experience instantaneous transactions and communications powered by 6G+ technology and sacred geometry architecture." },
    { icon: Infinity, title: "Infinite Scalability", description: "Built to grow with humanity, the Ultranet expands seamlessly to serve billions without compromising speed or security." }
  ];

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-black/50 to-purple-900/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Revolutionary Features</h2>
          <p className="text-gray-300 text-lg">Experience the future of digital infrastructure designed for humanity's Golden Age</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <Card key={i} className="bg-purple-900/30 border-purple-700/50 text-white hover:border-yellow-400/50 transition-all">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-yellow-400/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="text-yellow-400" size={32} />
                </div>
                <h3 className="text-xl font-bold text-yellow-400 mb-3">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

// Comparison Section
const ComparisonSection = () => {
  const comparisons = [
    { icon: Lock, label: "Security", traditional: "Vulnerable to hacking", ultranet: "Quantum-safe encryption" },
    { icon: Heart, label: "Health", traditional: "Microwave radiation", ultranet: "Non-radiative channels" },
    { icon: Zap, label: "Speed", traditional: "5G limitations", ultranet: "6G+ light-speed" },
    { icon: Coins, label: "Backing", traditional: "Speculative value", ultranet: "Gold-backed assets" },
    { icon: Crown, label: "Control", traditional: "Corporate ownership", ultranet: "Sovereign autonomy" },
    { icon: Infinity, label: "Scalability", traditional: "Limited capacity", ultranet: "Infinite expansion" }
  ];

  return (
    <section className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">The Ultranet Advantage</h2>
          <p className="text-gray-300 text-lg">See how the Ultranet transcends traditional internet infrastructure</p>
        </div>

        <div className="grid gap-4">
          {comparisons.map((item, i) => (
            <div key={i} className="bg-purple-900/30 border border-purple-700/50 rounded-xl p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-400/10 rounded-full flex items-center justify-center flex-shrink-0">
                <item.icon className="text-yellow-400" size={24} />
              </div>
              <div className="flex-1 grid grid-cols-3 gap-4 items-center">
                <p className="text-yellow-400 font-bold">{item.label}</p>
                <div className="flex items-center gap-2 text-red-400">
                  <X size={16} /> <span className="text-gray-400">{item.traditional}</span>
                </div>
                <div className="flex items-center gap-2 text-green-400">
                  <Check size={16} /> <span className="text-gray-200">{item.ultranet}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Power Stats Section
const PowerStatsSection = () => {
  const stats = [
    { value: "6G+", label: "Network Generation" },
    { value: "∞", label: "Scalability" },
    { value: "100%", label: "Gold-Backed" },
    { value: "0ms", label: "Latency Target" },
    { value: "Quantum", label: "Security Level" },
    { value: "Divine", label: "Encryption Grade" }
  ];

  return (
    <section className="py-16 px-4 bg-gradient-to-r from-purple-900/50 via-purple-800/50 to-purple-900/50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-white text-center mb-12">The Power of Sovereignty</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-3xl font-bold text-yellow-400 mb-1">{stat.value}</p>
              <p className="text-gray-300 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Ecosystem Grid
const EcosystemGrid = () => {
  const items = [
    { icon: Globe, title: "Ultranet", desc: "Non-microwave 6G+ network harmonized with nature" },
    { icon: Star, title: "Smart StarChain", desc: "Celestial lattice of trust with infinite scalability" },
    { icon: CreditCard, title: "Smart Card", desc: "Sovereign digital identity with biometric security" },
    { icon: Smartphone, title: "Super Smart Phone", desc: "Quantum-secure device with holographic display" },
    { icon: Building2, title: "GDex", desc: "Global exchange backed by sovereign wealth" },
    { icon: Sparkles, title: "Neo-NFTs", desc: "Living digital assets backed by real resources" },
    { icon: Building2, title: "New Banking", desc: "Gold-backed accounts under Divine Law" },
    { icon: Vault, title: "Gold Vaults/Coins", desc: "Sovereign storage beyond corporate reach" }
  ];

  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-white text-center mb-12">The Complete Ecosystem</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, i) => (
            <Card key={i} className="bg-purple-900/30 border-purple-700/50 text-white hover:border-yellow-400/50 transition-all cursor-pointer group">
              <CardContent className="p-6">
                <item.icon className="text-yellow-400 mb-4" size={32} />
                <h3 className="text-lg font-bold text-yellow-400 mb-2">{item.title}</h3>
                <p className="text-gray-300 text-sm mb-4">{item.desc}</p>
                <p className="text-yellow-400 text-sm group-hover:underline">Explore →</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-center mt-8">
          <Button variant="outline" className="border-yellow-400 text-yellow-400 hover:bg-yellow-400/10 rounded-full">
            View All 12 Technologies
          </Button>
        </div>
      </div>
    </section>
  );
};

// Mission Section
const MissionSection = () => (
  <section id="mission" className="py-20 px-4 bg-gradient-to-b from-purple-900/30 to-black/50">
    <div className="max-w-4xl mx-auto text-center">
      <h2 className="text-4xl font-bold text-white mb-8">Our Mission</h2>
      <p className="text-gray-300 text-lg leading-relaxed mb-8">
        Gaia Global Enterprise exists to restore sovereignty to humanity by building the Ultranet — the world's first non-microwave 6G+ communications network harmonized with nature, encrypted beyond compromise, and anchored in sovereign gold.
      </p>
      <p className="text-gray-300 text-lg leading-relaxed mb-8">
        Our mission is to unify technology, finance, and human dignity through the Smart StarChain, global digital commodity exchange, and secure smart devices, creating a safe, lightning-fast, and transparent infrastructure for the Golden Age. We stand as guardians of wealth, truth, and freedom — ensuring that the Ultranet empowers every individual to thrive without exploitation, surveillance, or control.
      </p>
      <blockquote className="text-xl text-yellow-400 italic border-l-4 border-yellow-400 pl-6 text-left">
        "Securing humanity's future through the Ultranet: sovereign, safe, and limitless."
      </blockquote>
    </div>
  </section>
);

// CTA Section
const CTASection = () => (
  <section className="py-20 px-4 bg-gradient-to-b from-black/50 to-purple-900/50">
    <div className="max-w-4xl mx-auto text-center">
      <h2 className="text-4xl font-bold text-white mb-6">Join the Golden Age</h2>
      <p className="text-gray-300 text-lg mb-10">
        Step into a future where technology serves humanity, wealth is sovereign, and freedom is guaranteed by divine law.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
        <Button className="bg-yellow-500 hover:bg-yellow-400 text-purple-900 font-bold rounded-full px-8 py-6 text-lg">
          Access the Ultranet
        </Button>
        <Button variant="outline" className="border-yellow-400 text-yellow-400 hover:bg-yellow-400/10 rounded-full px-8 py-6 text-lg">
          Interactive Whitepaper
        </Button>
        <Link to="https://gaiaglobal.gold/" target="_blank">
          <Button variant="outline" className="border-yellow-400 text-yellow-400 hover:bg-yellow-400/10 rounded-full px-8 py-6 text-lg">
            <Coins className="mr-2" size={20} /> Gold Coin Page
          </Button>
        </Link>
      </div>
      
      {/* Status Indicators */}
      <div className="flex justify-center gap-8">
        {[
          { label: "Network Live", color: "bg-green-500" },
          { label: "Vaults Secured", color: "bg-green-500" },
          { label: "StarChain Active", color: "bg-green-500" }
        ].map((status, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={cn("w-3 h-3 rounded-full animate-pulse", status.color)} />
            <span className="text-gray-300">{status.label}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// Footer
const Footer = () => (
  <footer className="py-8 px-4 border-t border-purple-700/50 bg-black/50">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <img 
          src="https://d64gsuwffb70l.cloudfront.net/68be038a43ca0f0ab13d5a76_1759376854470_b9626868.png" 
          alt="GGE Logo" 
          className="h-8 w-8 object-contain"
        />
        <span className="text-yellow-400 font-bold">GAIA GLOBAL ENTERPRISE</span>
      </div>
      <p className="text-gray-400 text-sm">© 2026 Gaia Global Enterprise. Sovereign Rights Reserved.</p>
    </div>
  </footer>
);

// Main Page Component
export default function TopGGGMission() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-950 via-purple-900 to-black text-white">
      <InPageNavigation />
      <HeroSection />
      <TechnologySections />
      <GaiaPaySection />
      <RevolutionaryFeatures />
      <ComparisonSection />
      <PowerStatsSection />
      <EcosystemGrid />
      <MissionSection />
      <CTASection />
      <Footer />
    </div>
  );
}