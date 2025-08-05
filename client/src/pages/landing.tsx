import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle, Sparkles } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/70 backdrop-blur-md border-purple-100 shadow-lg shadow-purple-100/50">
        <CardContent className="pt-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Calendar className="h-8 w-8 text-white" />
          </div>
          
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
            Everyday
          </h1>
          
          <p className="text-gray-600 text-lg mb-8">
            Your colorful task companion for a productive day
          </p>
          
          <div className="space-y-4 mb-8">
            <div className="flex items-center space-x-3 text-left">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
              <span className="text-gray-700">Beautiful calendar views</span>
            </div>
            <div className="flex items-center space-x-3 text-left">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="text-gray-700">Colorful task management</span>
            </div>
            <div className="flex items-center space-x-3 text-left">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Calendar className="h-4 w-4 text-white" />
              </div>
              <span className="text-gray-700">Sync across all devices</span>
            </div>
          </div>
          
          <Button 
            onClick={() => window.location.href = '/api/login'}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-3 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
            data-testid="button-login"
          >
            Get Started
          </Button>
          
          <p className="text-xs text-gray-500 mt-4">
            Sign in to start organizing your tasks
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
