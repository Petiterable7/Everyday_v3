import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const motivationalQuotes = [
  "Every day is a new beginning. Take a deep breath and start again.",
  "You are capable of amazing things. Believe in yourself today.",
  "Progress, not perfection. Every step forward counts.",
  "Today is your day to shine. You've got this!",
  "Small steps every day lead to big changes over time.",
  "You are stronger than you think and more loved than you know.",
  "Today's accomplishments are tomorrow's foundations.",
  "Your potential is endless. Focus on what you can do today.",
  "Every task completed is a victory worth celebrating.",
  "You have the power to make today amazing.",
  "Trust the process. You're exactly where you need to be.",
  "Today is a perfect day to start something wonderful.",
  "Your dreams are valid. Take one step closer today.",
  "You are worthy of all the good things coming your way.",
  "Today's efforts are tomorrow's results. Keep going!",
  "You have survived 100% of your worst days. You're doing great.",
  "Every moment is a fresh beginning. Make it count.",
  "You are not just existing, you are growing and becoming.",
  "Today is full of possibilities. Choose to see them.",
  "Your journey is unique and beautiful. Embrace every step."
];

export function QuoteBanner() {
  const [currentQuote, setCurrentQuote] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const getRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
    return motivationalQuotes[randomIndex];
  };

  const refreshQuote = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setCurrentQuote(getRandomQuote());
      setIsRefreshing(false);
    }, 300);
  };

  useEffect(() => {
    // Set initial quote
    setCurrentQuote(getRandomQuote());
  }, []);

  return (
    <Card className="bg-gradient-to-r from-purple-100/80 via-blue-100/80 to-cyan-100/80 backdrop-blur-md border-purple-200/50 shadow-sm mb-6">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <p className="text-gray-700 font-medium italic flex-1" data-testid="quote-text">
            "{currentQuote}"
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={refreshQuote}
          disabled={isRefreshing}
          className="p-2 hover:bg-white/50 rounded-full transition-colors flex-shrink-0 ml-3"
          data-testid="button-refresh-quote"
        >
          <RefreshCw className={`h-4 w-4 text-purple-600 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>
    </Card>
  );
}