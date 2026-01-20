import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Ticket, Trophy, Coins, Sparkles, Clock, Users, Gift, Loader2, Check, X } from 'lucide-react';
import { format, startOfMonth, endOfMonth, addMonths } from 'date-fns';

const TICKET_PRICE_GGG = 0.0077240;
const TICKET_PRICE_USD = 1.11;
const POT_FLOOR_USD = 10000;

export default function LotteryCard() {
  const [ticketCount, setTicketCount] = useState(1);
  const [customNumbers, setCustomNumbers] = useState(['', '', '', '', '', '']);
  const [useCustomNumbers, setUseCustomNumbers] = useState(false);
  const queryClient = useQueryClient();

  const currentMonth = format(new Date(), 'yyyy-MM');
  const nextDrawDate = endOfMonth(new Date());
  const daysUntilDraw = Math.ceil((nextDrawDate - new Date()) / (1000 * 60 * 60 * 24));

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: profile } = useQuery({
    queryKey: ['userProfile', currentUser?.email],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ user_id: currentUser.email });
      return profiles[0];
    },
    enabled: !!currentUser?.email
  });

  const { data: currentDraw } = useQuery({
    queryKey: ['currentLotteryDraw', currentMonth],
    queryFn: async () => {
      const draws = await base44.entities.LotteryDraw.filter({ lottery_month: currentMonth });
      return draws[0];
    }
  });

  const { data: myTickets = [] } = useQuery({
    queryKey: ['myLotteryTickets', currentUser?.email, currentMonth],
    queryFn: () => base44.entities.LotteryTicket.filter({ 
      user_id: currentUser.email, 
      lottery_month: currentMonth 
    }),
    enabled: !!currentUser?.email
  });

  const { data: allTickets = [] } = useQuery({
    queryKey: ['allLotteryTickets', currentMonth],
    queryFn: () => base44.entities.LotteryTicket.filter({ lottery_month: currentMonth })
  });

  const { data: pastDraws = [] } = useQuery({
    queryKey: ['pastLotteryDraws'],
    queryFn: () => base44.entities.LotteryDraw.filter({ status: 'drawn' }, '-draw_date', 5)
  });

  // Calculate pot
  const ticketRevenue = allTickets.length * TICKET_PRICE_USD;
  const currentPotUSD = Math.max(POT_FLOOR_USD, ticketRevenue);
  const currentPotGGG = currentPotUSD / (TICKET_PRICE_USD / TICKET_PRICE_GGG);

  const generateRandomNumber = () => {
    return String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
  };

  const buyTicketMutation = useMutation({
    mutationFn: async () => {
      // Ensure draw exists
      if (!currentDraw) {
        await base44.entities.LotteryDraw.create({
          lottery_month: currentMonth,
          status: 'active',
          total_pot_ggg: 0,
          total_pot_usd: POT_FLOOR_USD,
          total_tickets: 0
        });
      }

      const tickets = [];
      for (let i = 0; i < ticketCount; i++) {
        const ticketNumber = useCustomNumbers && i === 0
          ? customNumbers.join('')
          : generateRandomNumber();
        
        tickets.push({
          user_id: currentUser.email,
          user_name: profile?.display_name || currentUser.full_name,
          ticket_number: ticketNumber,
          lottery_month: currentMonth,
          ggg_spent: TICKET_PRICE_GGG,
          status: 'active'
        });
      }

      // Deduct GGG from user profile
      const totalCost = TICKET_PRICE_GGG * ticketCount;
      if (profile && profile.ggg_balance >= totalCost) {
        await base44.entities.UserProfile.update(profile.id, {
          ggg_balance: profile.ggg_balance - totalCost
        });
      }

      // Create tickets
      await base44.entities.LotteryTicket.bulkCreate(tickets);

      // Update draw stats
      const draws = await base44.entities.LotteryDraw.filter({ lottery_month: currentMonth });
      if (draws[0]) {
        await base44.entities.LotteryDraw.update(draws[0].id, {
          total_tickets: (draws[0].total_tickets || 0) + ticketCount,
          total_pot_ggg: (draws[0].total_pot_ggg || 0) + totalCost,
          total_pot_usd: Math.max(POT_FLOOR_USD, ((draws[0].total_pot_usd || 0) + (TICKET_PRICE_USD * ticketCount)))
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myLotteryTickets'] });
      queryClient.invalidateQueries({ queryKey: ['allLotteryTickets'] });
      queryClient.invalidateQueries({ queryKey: ['currentLotteryDraw'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      setTicketCount(1);
      setCustomNumbers(['', '', '', '', '', '']);
    }
  });

  const handleDigitChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newNumbers = [...customNumbers];
      newNumbers[index] = value;
      setCustomNumbers(newNumbers);
      
      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`lottery-digit-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const canBuyTicket = profile && (profile.ggg_balance || 0) >= (TICKET_PRICE_GGG * ticketCount);

  return (
    <Card className="bg-gradient-to-br from-amber-50 to-yellow-100 border-amber-200 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-amber-800">
            <Ticket className="w-5 h-5" />
            GGG Lottery
          </CardTitle>
          <Badge className="bg-amber-500 text-white">
            <Clock className="w-3 h-3 mr-1" />
            {daysUntilDraw} days left
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Jackpot Display */}
        <div className="bg-gradient-to-r from-amber-500 to-yellow-500 rounded-xl p-4 text-center text-white">
          <div className="text-xs uppercase tracking-wider opacity-80">Current Jackpot</div>
          <div className="text-3xl font-bold mt-1">
            ${currentPotUSD.toLocaleString()}
          </div>
          <div className="text-sm opacity-80 mt-1">
            ≈ {currentPotGGG.toFixed(2)} GGG
          </div>
          <div className="flex items-center justify-center gap-4 mt-3 text-xs">
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {allTickets.length} tickets sold
            </div>
            <div className="flex items-center gap-1">
              <Trophy className="w-3 h-3" />
              Draws {format(nextDrawDate, 'MMM d')}
            </div>
          </div>
        </div>

        {/* Ticket Purchase */}
        <div className="bg-white/50 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-amber-900">Buy Tickets</span>
            <span className="text-xs text-amber-700">
              {TICKET_PRICE_GGG.toFixed(7)} GGG (${TICKET_PRICE_USD}) each
            </span>
          </div>

          {/* Ticket Count */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}
              className="border-amber-300"
            >
              -
            </Button>
            <Input
              type="number"
              value={ticketCount}
              onChange={(e) => setTicketCount(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-20 text-center border-amber-300"
              min={1}
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => setTicketCount(ticketCount + 1)}
              className="border-amber-300"
            >
              +
            </Button>
            <div className="flex-1 text-right text-sm text-amber-800">
              Total: ${(ticketCount * TICKET_PRICE_USD).toFixed(2)}
            </div>
          </div>

          {/* Custom Number Option */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-amber-800 cursor-pointer">
              <input
                type="checkbox"
                checked={useCustomNumbers}
                onChange={(e) => setUseCustomNumbers(e.target.checked)}
                className="rounded border-amber-300"
              />
              Pick your own number (first ticket only)
            </label>
            
            {useCustomNumbers && (
              <div className="flex items-center justify-center gap-1">
                {customNumbers.map((digit, i) => (
                  <Input
                    key={i}
                    id={`lottery-digit-${i}`}
                    value={digit}
                    onChange={(e) => handleDigitChange(i, e.target.value)}
                    className="w-10 h-12 text-center text-xl font-mono border-amber-300"
                    maxLength={1}
                  />
                ))}
              </div>
            )}
          </div>

          <Button
            className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white"
            onClick={() => buyTicketMutation.mutate()}
            disabled={!canBuyTicket || buyTicketMutation.isPending}
          >
            {buyTicketMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Purchasing...
              </>
            ) : !canBuyTicket ? (
              'Insufficient GGG Balance'
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Buy {ticketCount} Ticket{ticketCount > 1 ? 's' : ''}
              </>
            )}
          </Button>
        </div>

        {/* My Tickets */}
        {myTickets.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-amber-900 flex items-center gap-2">
              <Ticket className="w-4 h-4" />
              My Tickets ({myTickets.length})
            </div>
            <ScrollArea className="h-24">
              <div className="grid grid-cols-2 gap-2">
                {myTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="bg-white rounded-lg p-2 border border-amber-200 flex items-center justify-between"
                  >
                    <span className="font-mono text-lg tracking-wider text-amber-800">
                      {ticket.ticket_number}
                    </span>
                    {ticket.status === 'won' && (
                      <Trophy className="w-4 h-4 text-amber-500" />
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Past Winners */}
        {pastDraws.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-amber-900 flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Past Winners
            </div>
            <div className="space-y-1">
              {pastDraws.map((draw) => (
                <div
                  key={draw.id}
                  className="bg-white/50 rounded-lg p-2 flex items-center justify-between text-xs"
                >
                  <span className="text-amber-700">{format(new Date(draw.draw_date), 'MMM yyyy')}</span>
                  <span className="font-mono text-amber-900">{draw.winning_number}</span>
                  <span className="text-amber-600">{draw.winner_name || 'No winner'}</span>
                  <span className="font-medium text-amber-800">${draw.total_pot_usd?.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info */}
        <div className="text-[10px] text-amber-700 text-center space-y-1">
          <p>Drawing happens on the last day of each month at midnight UTC</p>
          <p>Winning number: 6 random digits (000000-999999)</p>
          <p>Minimum pot floor: $10,000 USD in GGG</p>
        </div>
      </CardContent>
    </Card>
  );
}