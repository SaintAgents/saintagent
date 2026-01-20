import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Ticket, Trophy, Coins, Gift, Users, Clock, TrendingUp, Sparkles } from 'lucide-react';
import { format, endOfMonth } from 'date-fns';
import LotteryCard from '@/components/lottery/LotteryCard';

const TICKET_PRICE_USD = 1.11;
const POT_FLOOR_USD = 10000;

export default function LotteryPage() {
  const currentMonth = format(new Date(), 'yyyy-MM');
  const nextDrawDate = endOfMonth(new Date());

  const { data: allTickets = [] } = useQuery({
    queryKey: ['allLotteryTickets', currentMonth],
    queryFn: () => base44.entities.LotteryTicket.filter({ lottery_month: currentMonth })
  });

  const { data: allDraws = [] } = useQuery({
    queryKey: ['allLotteryDraws'],
    queryFn: () => base44.entities.LotteryDraw.list('-draw_date', 12)
  });

  const { data: topBuyers = [] } = useQuery({
    queryKey: ['topLotteryBuyers', currentMonth],
    queryFn: async () => {
      const tickets = await base44.entities.LotteryTicket.filter({ lottery_month: currentMonth });
      const buyerCounts = {};
      tickets.forEach(t => {
        if (!buyerCounts[t.user_id]) {
          buyerCounts[t.user_id] = { user_id: t.user_id, user_name: t.user_name, count: 0 };
        }
        buyerCounts[t.user_id].count++;
      });
      return Object.values(buyerCounts).sort((a, b) => b.count - a.count).slice(0, 10);
    }
  });

  const ticketRevenue = allTickets.length * TICKET_PRICE_USD;
  const currentPotUSD = Math.max(POT_FLOOR_USD, ticketRevenue);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 p-8 text-white">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?w=1200')] opacity-20 bg-cover bg-center" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <Ticket className="w-10 h-10" />
              <div>
                <h1 className="text-3xl font-bold">GGG Lottery</h1>
                <p className="text-amber-100">Monthly jackpot drawing</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
                <div className="text-amber-100 text-xs">Current Jackpot</div>
                <div className="text-2xl font-bold">${currentPotUSD.toLocaleString()}</div>
              </div>
              <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
                <div className="text-amber-100 text-xs">Tickets Sold</div>
                <div className="text-2xl font-bold">{allTickets.length}</div>
              </div>
              <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
                <div className="text-amber-100 text-xs">Next Drawing</div>
                <div className="text-2xl font-bold">{format(nextDrawDate, 'MMM d')}</div>
              </div>
              <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
                <div className="text-amber-100 text-xs">Ticket Price</div>
                <div className="text-2xl font-bold">$1.11</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Lottery Card */}
          <div className="lg:col-span-2">
            <LotteryCard />
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* How It Works */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Gift className="w-4 h-4 text-amber-500" />
                  How It Works
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-600">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-xs font-bold shrink-0">1</div>
                  <p>Buy tickets for 0.0077240 GGG ($1.11 USD) each</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-xs font-bold shrink-0">2</div>
                  <p>Pick your own 6-digit number or get a random one</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-xs font-bold shrink-0">3</div>
                  <p>Drawing happens on the last day of each month</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-xs font-bold shrink-0">4</div>
                  <p>Match all 6 digits to win the entire pot!</p>
                </div>
                <div className="mt-4 p-3 bg-amber-50 rounded-lg">
                  <div className="text-xs text-amber-800 font-medium">Minimum Pot Floor</div>
                  <div className="text-lg font-bold text-amber-600">$10,000 USD</div>
                  <div className="text-xs text-amber-700">Guaranteed minimum jackpot in GGG</div>
                </div>
              </CardContent>
            </Card>

            {/* Top Ticket Buyers */}
            {topBuyers.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="w-4 h-4 text-violet-500" />
                    Top Ticket Buyers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {topBuyers.slice(0, 5).map((buyer, i) => (
                      <div key={buyer.user_id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                        <div className="flex items-center gap-2">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            i === 0 ? 'bg-amber-400 text-white' : i === 1 ? 'bg-slate-300 text-slate-700' : i === 2 ? 'bg-orange-400 text-white' : 'bg-slate-200 text-slate-600'
                          }`}>
                            {i + 1}
                          </div>
                          <span className="text-sm font-medium truncate max-w-[120px]">{buyer.user_name}</span>
                        </div>
                        <Badge variant="outline">{buyer.count} tickets</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Past Winners */}
            {allDraws.filter(d => d.status === 'drawn').length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    Past Winners
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-48">
                    <div className="space-y-2">
                      {allDraws.filter(d => d.status === 'drawn').map((draw) => (
                        <div key={draw.id} className="p-3 rounded-lg bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-amber-800">
                              {format(new Date(draw.draw_date), 'MMMM yyyy')}
                            </span>
                            <span className="text-lg font-bold text-amber-600">
                              ${draw.total_pot_usd?.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-mono text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                              {draw.winning_number}
                            </span>
                            <span className="text-amber-600">
                              {draw.winner_name || 'No winner - rolled over'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}