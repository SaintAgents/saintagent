import React from 'react';
import { ExternalLink, Book, Heart, Brain, Zap, Scale, DollarSign, Vote, Download, Play, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const HERO_IMAGE = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/ssa_hero.jpg';

const INTERNAL_ASPECTS = [
  { title: 'Spiritual', icon: Zap, description: 'Connect with your higher self and divine purpose' },
  { title: 'Emotional', icon: Heart, description: 'Master your emotional intelligence and inner peace' },
  { title: 'Mental/Intellectual', icon: Brain, description: 'Expand your knowledge and critical thinking' },
  { title: 'Physical', icon: Zap, description: 'Honor and strengthen your physical vessel' },
];

const EXTERNAL_ASPECTS = [
  { title: 'Legal', icon: Scale, description: 'Understand your rights and legal standing' },
  { title: 'Economic/Financial', icon: DollarSign, description: 'Achieve financial sovereignty and freedom' },
  { title: 'Political', icon: Vote, description: 'Engage with systems from a position of power' },
];

const RECOMMENDED_BOOKS = [
  { title: "Sovereign's Handbook (3 Volumes)", author: "Johnny Liberty", url: "https://sovereignshandbook.com/freedom-catalog" },
  { title: "Fruits from a Poisonous Tree", author: "Mel Stamper", url: "https://www.amazon.com/Fruit-Poisonous-Tree-Mel-Stamper/dp/0595524966" },
  { title: "Word Magic: The Powers & Occult Definitions of Words", author: "Pao Chang", url: "https://www.amazon.com/Word-Magic-Powers-Occult-Definitions/dp/0578589842" },
  { title: "Chained to the Sky", author: "Charles Booker", url: "https://www.amazon.com/Chained-Sky-Discharging-through-Postal/dp/108006852X" },
  { title: "Your American Yardstick", author: "Hamilton Abert Long", url: "https://www.amazon.com/Your-American-Yardstick-Principles-Traditional/dp/1258399237" },
  { title: "Unrebutted Affidavits Stand As Truth", author: "David Robinson", url: "https://www.amazon.com/Unrebutted-Affidavits-Stand-As-Truth/dp/1718993404" },
];

const FREE_DOWNLOADS = [
  { title: "Laws of Being / Natural Law", url: "https://sovereignspiritalliance.org/wp-content/uploads/2023/05/Laws_of_Being.pdf" },
  { title: "THE 'NAME' GAME: You Are Not Who 'They' Presume You Are", url: "https://sovereignspiritalliance.org/wp-content/uploads/2023/05/Are-You-Playing-the-NAME-GAME-AZ.pdf" },
  { title: "Edward Mandell House's private meeting with Woodrow Wilson", url: "https://sovereignspiritalliance.org/wp-content/uploads/2023/04/Edward_Mandell_House_Predicts_Creation_Of_STRAWMAN.pdf" },
  { title: "Corporation vs. Sovereign", url: "https://sovereignspiritalliance.org/wp-content/uploads/2023/12/Corporation-vs.-Sovereign.pdf" },
  { title: "STATUTES ARE NOT LAW!", url: "https://sovereignspiritalliance.org/wp-content/uploads/2023/07/STATUTES-ARE-NOT-LAW.pdf" },
  { title: "Four Bodies (Sovereign Living Library)", url: "https://sovereignspiritalliance.org/wp-content/uploads/2023/05/Four_Bodies.pdf" },
];

export default function SovereignAlliance() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-6xl mx-auto px-4 py-16 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
              <span className="text-3xl font-bold text-white">SSA</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Sovereign Spirit Alliance</h1>
          <p className="text-xl md:text-2xl text-purple-100 mb-2">The A to Z Guide to Freedom</p>
          <p className="text-lg text-purple-200 max-w-3xl mx-auto mb-8">
            A comprehensive source for Education & Action about Sovereignty & Freedom. 
            Watch video clips and download the free resources below to start your journey.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <a 
              href="https://sovereignspiritalliance.org" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Button className="bg-white text-purple-700 hover:bg-purple-100 gap-2">
                <ExternalLink className="w-4 h-4" />
                Visit Original Site
              </Button>
            </a>
            <a 
              href="https://sovereignspiritalliance.org/shop" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="border-white text-white hover:bg-white/20 gap-2">
                Browse Sovereign Products
              </Button>
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* 7 Aspects of Sovereignty */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center text-purple-900 mb-8">7 Aspects of Sovereignty</h2>
          
          <Tabs defaultValue="internal" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
              <TabsTrigger value="internal">Internal Aspects</TabsTrigger>
              <TabsTrigger value="external">External Aspects</TabsTrigger>
            </TabsList>
            
            <TabsContent value="internal">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {INTERNAL_ASPECTS.map((aspect) => (
                  <Card key={aspect.title} className="text-center hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center mb-4">
                        <aspect.icon className="w-8 h-8 text-white" />
                      </div>
                      <CardTitle className="text-purple-900">{aspect.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-600 text-sm">{aspect.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="mt-8 text-center">
                <a 
                  href="https://sovereignspiritalliance.org/wp-content/uploads/2023/05/Four_Bodies.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" className="gap-2">
                    <Download className="w-4 h-4" />
                    Read about the Four Bodies
                  </Button>
                </a>
              </div>
            </TabsContent>
            
            <TabsContent value="external">
              <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                {EXTERNAL_ASPECTS.map((aspect) => (
                  <Card key={aspect.title} className="text-center hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-4">
                        <aspect.icon className="w-8 h-8 text-white" />
                      </div>
                      <CardTitle className="text-purple-900">{aspect.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-600 text-sm">{aspect.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="mt-8 text-center">
                <a 
                  href="https://sovereignspiritalliance.org/508c/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="bg-amber-500 hover:bg-amber-600 gap-2">
                    <ArrowRight className="w-4 h-4" />
                    Create a Sovereign Entity
                  </Button>
                </a>
              </div>
            </TabsContent>
          </Tabs>
        </section>

        {/* Pallas Athena Quote */}
        <section className="mb-16">
          <Card className="bg-gradient-to-r from-purple-100 to-indigo-100 border-purple-200">
            <CardContent className="p-8 text-center">
              <p className="text-lg italic text-purple-800 mb-4">
                "I wish you would understand this day that when I say I AM Truth incarnate, I must rely upon your body, 
                your flesh and your blood, your mind and your soul to be the incarnation of the Word of Truth that I AM!…"
              </p>
              <p className="text-purple-600 font-medium">— Pallas Athena</p>
            </CardContent>
          </Card>
        </section>

        {/* References Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center text-purple-900 mb-8">References & Resources</h2>
          
          <Tabs defaultValue="books" className="w-full">
            <TabsList className="grid w-full max-w-lg mx-auto grid-cols-2 mb-8">
              <TabsTrigger value="books">Recommended Reading</TabsTrigger>
              <TabsTrigger value="downloads">Free Downloads</TabsTrigger>
            </TabsList>
            
            <TabsContent value="books">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {RECOMMENDED_BOOKS.map((book) => (
                  <a 
                    key={book.title}
                    href={book.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Card className="h-full hover:shadow-lg hover:border-purple-300 transition-all cursor-pointer">
                      <CardContent className="p-4">
                        <Book className="w-8 h-8 text-purple-500 mb-2" />
                        <h3 className="font-semibold text-purple-900 text-sm mb-1">{book.title}</h3>
                        <p className="text-xs text-slate-500">by {book.author}</p>
                      </CardContent>
                    </Card>
                  </a>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="downloads">
              <div className="grid md:grid-cols-2 gap-4">
                {FREE_DOWNLOADS.map((doc) => (
                  <a 
                    key={doc.title}
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Card className="hover:shadow-lg hover:border-purple-300 transition-all cursor-pointer">
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                          <Download className="w-5 h-5 text-purple-600" />
                        </div>
                        <p className="font-medium text-purple-900 text-sm">{doc.title}</p>
                      </CardContent>
                    </Card>
                  </a>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </section>

        {/* Quiz CTA */}
        <section className="mb-16">
          <Card className="bg-gradient-to-r from-amber-400 to-orange-500 text-white">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">How Sovereign Am I?</h3>
              <p className="mb-6 text-amber-100">Take the quiz by Happyo and Johnny Liberty to discover your sovereignty level.</p>
              <a 
                href="https://sovereignspiritalliance.org/how-sovereign-am-i-1"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="bg-white text-amber-600 hover:bg-amber-50 gap-2">
                  Take the Quiz
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </a>
            </CardContent>
          </Card>
        </section>

        {/* Footer Link */}
        <div className="text-center py-8 border-t">
          <p className="text-slate-600 mb-4">This content is sourced from Sovereign Spirit Alliance</p>
          <a 
            href="https://sovereignspiritalliance.org" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-800 font-medium"
          >
            <ExternalLink className="w-4 h-4" />
            Visit sovereignspiritalliance.org
          </a>
        </div>
      </div>
    </div>
  );
}