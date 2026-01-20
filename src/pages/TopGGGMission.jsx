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
const HeroSection = ({ onLearnMore }) => (
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
        <Button 
          onClick={onLearnMore}
          className="bg-yellow-500 hover:bg-yellow-400 text-purple-900 font-bold rounded-full px-8 py-6 text-lg"
        >
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
const FeatureCard = ({ image, title, description, features, reverse = false, sectionId, onLearnMore }) => (
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
      <Button 
        variant="outline" 
        className="border-yellow-400 text-yellow-400 hover:bg-yellow-400/10 rounded-full"
        onClick={() => onLearnMore?.(sectionId)}
      >
        Learn More <ArrowRight className="ml-2" size={16} />
      </Button>
    </div>
  </div>
);

// Technology Sections
const TechnologySections = ({ onLearnMore }) => {
  const technologies = [
    {
      image: "https://d64gsuwffb70l.cloudfront.net/68be038a43ca0f0ab13d5a76_1759374410272_b3323cb5.jpeg",
      title: "The Ultranet",
      description: "The Ultranet is the next evolutionary leap beyond the internet — a living network of light and intelligence designed to liberate communications from the toxic confines of microwave frequencies.",
      features: ["Quantum-safe channels", "Non-microwave 6G+", "Natural resonances", "Beyond military encryption"],
      sectionId: "ultranet"
    },
    {
      image: "https://d64gsuwffb70l.cloudfront.net/68be038a43ca0f0ab13d5a76_1759379644843_02b71bc3.jpg",
      title: "Smart StarChain",
      description: "The Smart StarChain redefines blockchain as we know it. Beyond decentralization, it operates as a celestial lattice of trust, linking transactions in radiant star patterns across infinite nodes of light.",
      features: ["Instant settlement", "Infinite scalability", "Eco-conscious", "Sacred geometry"],
      sectionId: "starchain"
    },
    {
      image: "https://d64gsuwffb70l.cloudfront.net/68be038a43ca0f0ab13d5a76_1759377792549_b7f528c0.jpg",
      title: "Smart Card & Super Smart Phone",
      description: "At the heart of user access lies the GGE Smart Card — a sovereign digital identity that fuses personal authentication, gold-backed assets, and encrypted communications into one portable key.",
      features: ["Biometric authentication", "Holographic display", "Quantum wallet", "Non-radiative telecom"],
      sectionId: "smartcard"
    },
    {
      image: "https://d64gsuwffb70l.cloudfront.net/68be038a43ca0f0ab13d5a76_1759380918978_2c5a3abf.jpg",
      title: "Global Digital Commodity Exchange",
      description: "The GDex is the sovereign marketplace for the New Era, where assets are not just traded but transformed.",
      features: ["Resource-backed trading", "Transparent protocols", "Real-time settlement", "Gold integration"],
      sectionId: "gdex"
    },
    {
      image: "https://d64gsuwffb70l.cloudfront.net/68be038a43ca0f0ab13d5a76_1759380560730_20367960.png",
      title: "Neo-NFTs",
      description: "Beyond digital art and speculation, the Neo-NFT is a living digital asset, tethered directly to real-world resources and sovereign guarantees.",
      features: ["Resource-backed assets", "Perpetual authenticity", "Gold-anchored value", "Sacred-digital bridge"],
      sectionId: "neonft"
    },
    {
      image: "https://d64gsuwffb70l.cloudfront.net/68be038a43ca0f0ab13d5a76_1759382484006_3cd7f4af.jpg",
      title: "New Banking",
      description: "GGE Banking is not a reform of the old — it is a rebirth. Operating under Divine Law and sovereign charter, it returns wealth to its rightful foundation: gold, trust, and human dignity.",
      features: ["Gold-backed accounts", "Sovereign lending", "Zero fractional reserves", "Divine Law compliance"],
      sectionId: "banking"
    },
    {
      image: "https://d64gsuwffb70l.cloudfront.net/68be038a43ca0f0ab13d5a76_1759382489512_aceb0c13.jpg",
      title: "Sovereign Gold Vaults & GGRT",
      description: "At the foundation of the GGE ecosystem lie the Sovereign Gold Vaults, protected under divine decree and secured beyond the reach of corporate powers.",
      features: ["Divine decree protection", "Multi-generational trust", "Corporate-proof security", "Integrity allocation"],
      sectionId: "goldvaults"
    }
  ];

  return (
    <section id="technology" className="py-20 px-4 max-w-7xl mx-auto">
      {technologies.map((tech, i) => (
        <FeatureCard key={i} {...tech} reverse={i % 2 !== 0} onLearnMore={onLearnMore} />
      ))}
    </section>
  );
};

// GaiaPay Section
const GaiaPaySection = ({ onLearnMore }) => (
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
const EcosystemGrid = ({ onExplore }) => {
  const items = [
    { icon: Globe, title: "Ultranet", desc: "Non-microwave 6G+ network harmonized with nature", sectionId: "ultranet" },
    { icon: Star, title: "Smart StarChain", desc: "Celestial lattice of trust with infinite scalability", sectionId: "starchain" },
    { icon: CreditCard, title: "Smart Card", desc: "Sovereign digital identity with biometric security", sectionId: "smartcard" },
    { icon: Smartphone, title: "Super Smart Phone", desc: "Quantum-secure device with holographic display", sectionId: "smartcard" },
    { icon: Building2, title: "GDex", desc: "Global exchange backed by sovereign wealth", sectionId: "gdex" },
    { icon: Sparkles, title: "Neo-NFTs", desc: "Living digital assets backed by real resources", sectionId: "neonft" },
    { icon: Building2, title: "New Banking", desc: "Gold-backed accounts under Divine Law", sectionId: "banking" },
    { icon: Vault, title: "Gold Vaults/Coins", desc: "Sovereign storage beyond corporate reach", sectionId: "goldvaults" }
  ];

  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-white text-center mb-12">The Complete Ecosystem</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, i) => (
            <Card 
              key={i} 
              className="bg-purple-900/30 border-purple-700/50 text-white hover:border-yellow-400/50 transition-all cursor-pointer group"
              onClick={() => onExplore?.(item.sectionId)}
            >
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
          <Button 
            variant="outline" 
            className="border-yellow-400 text-yellow-400 hover:bg-yellow-400/10 rounded-full"
            onClick={() => onExplore?.('overview')}
          >
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
const CTASection = ({ onWhitepaper }) => (
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
        <Button 
          variant="outline" 
          className="border-yellow-400 text-yellow-400 hover:bg-yellow-400/10 rounded-full px-8 py-6 text-lg"
          onClick={onWhitepaper}
        >
          <BookOpen className="mr-2" size={20} /> Interactive Whitepaper
        </Button>
        <a href="https://gaiaglobal.gold/" target="_blank" rel="noopener noreferrer">
          <Button variant="outline" className="border-yellow-400 text-yellow-400 hover:bg-yellow-400/10 rounded-full px-8 py-6 text-lg">
            <Coins className="mr-2" size={20} /> Gold Coin Page
          </Button>
        </a>
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

// Interactive Whitepaper Modal
const WhitepaperModal = ({ open, onClose, initialSection = 'overview' }) => {
  const [activeSection, setActiveSection] = useState(initialSection);

  const sections = [
    { id: 'overview', label: 'Overview', icon: Globe },
    { id: 'ultranet', label: 'The Ultranet', icon: Network },
    { id: 'starchain', label: 'Smart StarChain', icon: Star },
    { id: 'smartcard', label: 'Smart Card', icon: CreditCard },
    { id: 'gdex', label: 'GDex Exchange', icon: Building2 },
    { id: 'neonft', label: 'Neo-NFTs', icon: Sparkles },
    { id: 'banking', label: 'New Banking', icon: Vault },
    { id: 'gaiapay', label: 'GaiaPay', icon: CreditCard },
    { id: 'goldvaults', label: 'Gold Vaults', icon: Shield },
    { id: 'roadmap', label: 'Roadmap', icon: ChevronRight },
  ];

  const sectionContent = {
    overview: {
      title: "The Ultranet Vision",
      subtitle: "Sovereign Digital Infrastructure for Humanity's Golden Age",
      content: `The Ultranet represents the most significant technological leap in human history — a complete reimagining of digital infrastructure designed to serve humanity rather than exploit it.

**Our Core Principles:**

1. **Sovereignty First**: Every individual owns their data, identity, and digital assets absolutely.

2. **Health-Conscious Technology**: Non-microwave communications that work in harmony with human biology and the natural world.

3. **Gold-Backed Value**: All digital assets anchored to real-world resources, eliminating speculative volatility.

4. **Divine Law Compliance**: Operations structured under natural law, ensuring fairness and integrity.

5. **Infinite Scalability**: Architecture designed to serve all of humanity without degradation.

**The Problem We Solve:**

The current internet infrastructure is fundamentally flawed:
- Built on harmful microwave radiation
- Controlled by corporate interests
- Vulnerable to surveillance and manipulation
- Based on speculative, unbacked digital currencies
- Designed to extract value rather than create it

**Our Solution:**

The Ultranet creates a parallel infrastructure that:
- Uses quantum-safe, non-radiative communications
- Returns control to sovereign individuals
- Backs all value with physical gold reserves
- Operates transparently under divine law
- Empowers every participant to thrive`
    },
    ultranet: {
      title: "The Ultranet Network",
      subtitle: "Beyond the Internet — A Living Network of Light",
      content: `The Ultranet is the next evolutionary leap beyond the internet — a living network of light and intelligence designed to liberate communications from the toxic confines of microwave frequencies.

**Technical Architecture:**

**6G+ Non-Microwave Protocol**
Unlike conventional wireless that bathes humanity in harmful radiation, the Ultranet operates on natural resonance frequencies that harmonize with biological systems:
- Schumann resonance integration (7.83 Hz carrier waves)
- Scalar wave propagation for unlimited range
- Zero electromagnetic pollution

**Quantum-Safe Encryption**
Every packet is protected by encryption that cannot be broken by any computer — including quantum computers:
- Post-quantum cryptographic algorithms
- Entanglement-based key distribution
- Zero-knowledge proof authentication

**Sacred Geometry Architecture**
The network topology follows natural patterns found throughout creation:
- Phi-ratio node distribution
- Fibonacci scaling algorithms
- Merkaba-structured data centers

**Performance Specifications:**
- Latency: Sub-millisecond global
- Bandwidth: Unlimited per user
- Security: Beyond military grade
- Coverage: Global + orbital
- Energy: Zero-point powered nodes

**Deployment Timeline:**
- Phase 1: Major cities (Complete)
- Phase 2: Regional expansion (2025)
- Phase 3: Global coverage (2026)
- Phase 4: Space integration (2027)`
    },
    starchain: {
      title: "Smart StarChain",
      subtitle: "The Celestial Lattice of Trust",
      content: `The Smart StarChain redefines blockchain as we know it. Beyond decentralization, it operates as a celestial lattice of trust, linking transactions in radiant star patterns across infinite nodes of light.

**Revolutionary Features:**

**Star Pattern Consensus**
Unlike linear blockchain structures, StarChain uses a radiant topology:
- Each transaction validates in multiple simultaneous patterns
- Zero confirmation wait times
- Infinite parallel processing capacity

**Instant Settlement**
Traditional blockchains suffer from confirmation delays. StarChain achieves:
- Immediate finality (< 0.001 seconds)
- No pending transactions
- Real-time global synchronization

**Infinite Scalability**
The star pattern allows unlimited growth:
- No block size limitations
- Automatic load distribution
- Zero network congestion possible

**Eco-Conscious Design**
Unlike proof-of-work systems:
- Zero energy waste consensus
- Powered by ambient field energy
- Actually generates more energy than it uses

**Sacred Geometry Integration:**
- Golden ratio transaction ordering
- Platonic solid data structures
- Harmonic frequency validation

**Token Economics:**
- GGRT (Gaia Gold Reserve Token): Primary unit
- GGG (Gaia Global Gold): Utility token
- All tokens backed 1:1 by physical gold`
    },
    smartcard: {
      title: "Smart Card & Super Smart Phone",
      subtitle: "Your Sovereign Digital Identity",
      content: `At the heart of user access lies the GGE Smart Card — a sovereign digital identity that fuses personal authentication, gold-backed assets, and encrypted communications into one portable key.

**GGE Smart Card Features:**

**Biometric Authentication**
- Multi-factor biometric fusion
- Heartbeat pattern recognition
- Consciousness signature verification
- Impossible to forge or steal

**Holographic Display**
- 3D augmented reality interface
- Dynamic balance visualization
- Real-time market data
- Personalized AI assistant

**Quantum Wallet**
- Unlimited asset storage
- Instant cross-border transfers
- Multi-currency support
- Gold-backed stability

**Physical Security:**
- Indestructible nano-carbon composite
- Self-destruct on tampering
- GPS recovery system
- 100-year operational lifespan

---

**Super Smart Phone:**

The companion device that replaces harmful smartphones:

**Non-Radiative Communications**
- Zero microwave emissions
- Crystal-clear quantum calls
- Telepresence holography
- Global instant connectivity

**Holographic Interface**
- 3D projected display
- Gesture and thought control
- Ambient light powered
- Indestructible housing

**Integrated Features:**
- StarChain node capability
- Local gold reserve verification
- Health monitoring suite
- Divine law reference library`
    },
    gdex: {
      title: "Global Digital Commodity Exchange",
      subtitle: "The Sovereign Marketplace",
      content: `The GDex is the sovereign marketplace for the New Era, where assets are not just traded but transformed into instruments of abundance.

**Exchange Architecture:**

**Resource-Backed Trading**
Every asset on GDex is backed by real resources:
- Physical gold reserves
- Commodity inventories
- Land and property rights
- Intellectual property pools

**Transparent Protocols**
Complete visibility into all operations:
- Real-time reserve auditing
- Open-source algorithms
- Public transaction ledger
- Zero hidden mechanisms

**Real-Time Settlement**
Trades complete instantly:
- No clearing house delays
- Direct peer-to-peer exchange
- Automatic compliance verification
- Instant ownership transfer

**Available Markets:**

**Precious Metals:**
- Gold (GGRT, GGG)
- Silver (GST)
- Platinum (GPT)
- Palladium (GPD)

**Commodities:**
- Agricultural products
- Energy certificates
- Water rights
- Carbon credits

**Real Assets:**
- Tokenized real estate
- Equipment shares
- Infrastructure bonds
- Community currencies

**Trading Features:**
- Zero trading fees (0%)
- Instant liquidity
- AI-assisted portfolio management
- Risk-free escrow system`
    },
    neonft: {
      title: "Neo-NFTs",
      subtitle: "Living Digital Assets",
      content: `Beyond digital art and speculation, the Neo-NFT is a living digital asset, tethered directly to real-world resources and sovereign guarantees.

**What Makes Neo-NFTs Different:**

**Resource-Backed Value**
Every Neo-NFT is backed by physical assets:
- Minimum gold reserve requirement
- Auditable backing certificates
- Redemption guarantee
- Appreciating floor value

**Perpetual Authenticity**
Verification that never expires:
- Quantum-encrypted provenance
- Immutable ownership history
- Cross-platform verification
- Physical world linkage

**Living Asset Properties**
Neo-NFTs evolve and generate value:
- Dividend distributions
- Governance rights
- Utility unlocks over time
- Community benefits

**Categories:**

**Sovereign Identity:**
- Personal sovereignty certificates
- Professional credentials
- Achievement records
- Reputation scores

**Property Rights:**
- Land title deeds
- Resource extraction rights
- Intellectual property
- Revenue shares

**Access Tokens:**
- Community memberships
- Service subscriptions
- Event access
- Educational programs

**Collectibles:**
- Artist collaborations
- Historical artifacts
- Cultural preservation
- Generative art with utility`
    },
    banking: {
      title: "New Banking System",
      subtitle: "Wealth Restored to Its Rightful Foundation",
      content: `GGE Banking is not a reform of the old — it is a rebirth. Operating under Divine Law and sovereign charter, it returns wealth to its rightful foundation: gold, trust, and human dignity.

**Core Principles:**

**Gold-Backed Accounts**
Every unit of currency fully backed:
- 1:1 gold reserve ratio
- Daily reserve verification
- Instant redemption rights
- No fractional reserve lending

**Sovereign Lending**
Loans that empower rather than enslave:
- Zero interest financing available
- Profit-sharing models
- Community-backed guarantees
- No predatory terms

**Zero Fractional Reserves**
What you deposit is what exists:
- Full reserve banking
- No money creation from nothing
- Transparent balance sheets
- Depositor-first priorities

**Divine Law Compliance**
Operations structured under natural law:
- Fair dealing requirements
- Transparent fee structures
- Dispute resolution courts
- Community accountability

**Account Types:**

**Personal Sovereign Account:**
- Gold-backed checking
- Multi-currency savings
- Investment portfolio
- Credit facilities

**Business Sovereign Account:**
- Payroll integration
- Invoice financing
- Trade credit
- Treasury management

**Community Account:**
- Shared savings pools
- Group investments
- Local currency issuance
- Cooperative lending

**Benefits:**
- No account fees
- Instant global transfers
- Privacy protection
- Inheritance planning`
    },
    gaiapay: {
      title: "GaiaPay System",
      subtitle: "The Future of Money Has Arrived",
      content: `GaiaPay isn't an accessory to legacy systems — it replaces them entirely. This is the world's first sovereign payment system that merges fiat, crypto, and digital identity into one seamless experience.

**Revolutionary Features:**

**Unified Smart Card + Wallet**
One card does everything:
- Preloaded and auto-activated
- Eliminates Apple Pay, Google Pay
- No centralized intermediaries
- Your wallet IS your bank

**Instant Exchange & Conversion**
Seamless currency translation:
- Auto-detects merchant currency
- Bitcoin, USDC, fiat — all accepted
- Clears in under 1 second
- Zero third-party fees

**Quantum-Level Security**
Unbreakable protection:
- Quantum-grade encryption
- Biometric validation required
- Every transaction tokenized
- Complete anonymity option

**Technical Specifications:**

**Supported Currencies:**
- All world fiat currencies
- Major cryptocurrencies
- GGRT/GGG tokens
- Local community currencies

**Transaction Speed:**
- Point of sale: < 0.5 seconds
- Online: < 0.1 seconds
- Cross-border: < 1 second

**Security Features:**
- Multi-signature authorization
- Fraud impossible by design
- Instant freeze capability
- Recovery protocols

**Merchant Benefits:**
- Zero processing fees
- Instant settlement
- Chargeback protection
- Global customer base`
    },
    goldvaults: {
      title: "Sovereign Gold Vaults & GGRT",
      subtitle: "The Foundation of Real Wealth",
      content: `At the foundation of the GGE ecosystem lie the Sovereign Gold Vaults, protected under divine decree and secured beyond the reach of corporate powers.

**Vault Network:**

**Divine Decree Protection**
Vaults operate under sovereign immunity:
- Beyond government jurisdiction
- Protected by natural law
- Community-verified security
- Multi-signature access only

**Physical Security:**
- Deep underground facilities
- Quantum-locked chambers
- Biometric + consciousness access
- Real-time monitoring globally

**Multi-Generational Trust**
Designed for centuries:
- 1000-year vault architecture
- Automatic inheritance protocols
- Family dynasty support
- Legacy preservation

**GGRT Token:**

**Gaia Gold Reserve Token (GGRT)**
The primary digital representation of physical gold:

**1:1 Gold Backing:**
- Each GGRT = 1 gram of gold
- Instantly redeemable
- Audited continuously
- Physical delivery available

**Token Utility:**
- Store of value
- Medium of exchange
- Collateral for loans
- Governance rights

**Redemption Process:**
1. Request redemption in app
2. Select physical or transfer
3. Verify identity
4. Receive gold within 48 hours

**Storage Options:**

**Vault Allocation:**
- Personal allocated storage
- Pooled community vaults
- Family trust vaults
- Business treasury vaults

**Home Storage Program:**
- Certified home safes
- Insurance included
- Verification technology
- Reintegration easy`
    },
    roadmap: {
      title: "Development Roadmap",
      subtitle: "Building the Golden Age Infrastructure",
      content: `The Ultranet development follows a carefully orchestrated timeline designed to ensure stability, security, and global accessibility.

**Phase 1: Foundation (2024) ✓ COMPLETE**
- Core StarChain deployment
- Initial vault network activation
- Smart Card pilot program
- GDex beta launch

**Phase 2: Expansion (2025) 🔄 IN PROGRESS**
- Global vault network completion
- GaiaPay merchant integration
- Super Smart Phone release
- Neo-NFT marketplace launch
- 100+ country coverage

**Phase 3: Integration (2026)**
- Full Ultranet network activation
- Legacy system bridges
- Universal basic income pilot
- Space-based node deployment
- 1 billion user capacity

**Phase 4: Transformation (2027)**
- Complete sovereignty toolkit
- AI assistant integration
- Telepresence networks
- Planetary coordination systems
- Full Golden Age infrastructure

**Current Status:**

✅ **Live Systems:**
- StarChain mainnet
- GDex trading platform
- Smart Card issuance
- Vault network (12 locations)

🔄 **In Development:**
- GaiaPay global rollout
- Super Smart Phone
- Ultranet 6G+ nodes
- Neo-NFT marketplace

📋 **Planned:**
- Space infrastructure
- AI sovereignty tools
- Community currencies
- Universal services

**How to Participate:**

1. **Get Your Smart Card**: Apply through authorized centers
2. **Open Sovereign Account**: Begin gold accumulation
3. **Join Community**: Connect with local chapters
4. **Spread Awareness**: Share the vision
5. **Build Together**: Contribute your skills`
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[85vh] p-0 bg-gradient-to-b from-purple-950 to-black border-purple-700/50">
        <div className="flex h-full">
          {/* Sidebar Navigation */}
          <div className="w-64 bg-purple-900/50 border-r border-purple-700/50 p-4 hidden md:block">
            <div className="flex items-center gap-2 mb-6">
              <BookOpen className="text-yellow-400" size={24} />
              <h3 className="text-yellow-400 font-bold">Whitepaper</h3>
            </div>
            <nav className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-all",
                    activeSection === section.id
                      ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                      : "text-gray-300 hover:bg-purple-800/50 hover:text-white"
                  )}
                >
                  <section.icon size={16} />
                  {section.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content Area */}
          <div className="flex-1 flex flex-col">
            <DialogHeader className="px-6 py-4 border-b border-purple-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-2xl text-yellow-400">
                    {sectionContent[activeSection]?.title}
                  </DialogTitle>
                  <p className="text-gray-400 text-sm mt-1">
                    {sectionContent[activeSection]?.subtitle}
                  </p>
                </div>
                {/* Mobile Section Selector */}
                <select
                  value={activeSection}
                  onChange={(e) => setActiveSection(e.target.value)}
                  className="md:hidden bg-purple-800 text-white border border-purple-600 rounded-lg px-3 py-2 text-sm"
                >
                  {sections.map((section) => (
                    <option key={section.id} value={section.id}>
                      {section.label}
                    </option>
                  ))}
                </select>
              </div>
            </DialogHeader>

            <ScrollArea className="flex-1 p-6">
              <div className="prose prose-invert prose-yellow max-w-none">
                <div className="whitespace-pre-wrap text-gray-200 leading-relaxed">
                  {sectionContent[activeSection]?.content.split('\n').map((line, i) => {
                    if (line.startsWith('**') && line.endsWith('**')) {
                      return <h3 key={i} className="text-yellow-400 font-bold text-lg mt-6 mb-2">{line.replace(/\*\*/g, '')}</h3>;
                    }
                    if (line.startsWith('- ')) {
                      return <li key={i} className="text-gray-300 ml-4">{line.substring(2)}</li>;
                    }
                    if (line.startsWith('✅') || line.startsWith('🔄') || line.startsWith('📋')) {
                      return <p key={i} className="text-gray-200 font-medium mt-4">{line}</p>;
                    }
                    if (line.trim() === '---') {
                      return <hr key={i} className="border-purple-700 my-6" />;
                    }
                    if (line.trim() === '') {
                      return <br key={i} />;
                    }
                    return <p key={i} className="text-gray-300 mb-2">{line}</p>;
                  })}
                </div>
              </div>
            </ScrollArea>

            {/* Navigation Footer */}
            <div className="px-6 py-4 border-t border-purple-700/50 flex items-center justify-between">
              <Button
                variant="outline"
                className="border-purple-600 text-purple-300 hover:bg-purple-800"
                onClick={() => {
                  const idx = sections.findIndex(s => s.id === activeSection);
                  if (idx > 0) setActiveSection(sections[idx - 1].id);
                }}
                disabled={activeSection === sections[0].id}
              >
                ← Previous
              </Button>
              <span className="text-gray-500 text-sm">
                {sections.findIndex(s => s.id === activeSection) + 1} / {sections.length}
              </span>
              <Button
                className="bg-yellow-500 hover:bg-yellow-400 text-purple-900"
                onClick={() => {
                  const idx = sections.findIndex(s => s.id === activeSection);
                  if (idx < sections.length - 1) setActiveSection(sections[idx + 1].id);
                }}
                disabled={activeSection === sections[sections.length - 1].id}
              >
                Next →
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Main Page Component
export default function TopGGGMission() {
  const [whitepaperOpen, setWhitepaperOpen] = useState(false);
  const [whitepaperSection, setWhitepaperSection] = useState('overview');

  const openWhitepaper = (section = 'overview') => {
    setWhitepaperSection(section);
    setWhitepaperOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-950 via-purple-900 to-black text-white">
      <InPageNavigation />
      <HeroSection onLearnMore={() => openWhitepaper('overview')} />
      <TechnologySections onLearnMore={openWhitepaper} />
      <GaiaPaySection onLearnMore={() => openWhitepaper('gaiapay')} />
      <RevolutionaryFeatures />
      <ComparisonSection />
      <PowerStatsSection />
      <EcosystemGrid onExplore={openWhitepaper} />
      <MissionSection />
      <CTASection onWhitepaper={() => openWhitepaper('overview')} />
      <Footer />
      
      {/* Interactive Whitepaper Modal */}
      <WhitepaperModal 
        open={whitepaperOpen} 
        onClose={() => setWhitepaperOpen(false)}
        initialSection={whitepaperSection}
      />
    </div>
  );
}