
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Users, Zap, QrCode, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Spectator = () => {
  const navigate = useNavigate();
  const [gameTime, setGameTime] = useState(734); // Demo time
  const [period] = useState(2);
  const [homeScore] = useState(42);
  const [awayScore] = useState(38);

  useEffect(() => {
    const interval = setInterval(() => {
      setGameTime(time => time - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const sponsors = [
    { name: "SportsCorp", logo: "🏈", revenue: "$550/month" },
    { name: "FitLife Gym", logo: "💪", revenue: "$425/month" },
    { name: "Local Bank", logo: "🏦", revenue: "$600/month" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="text-white border-white/20 hover:bg-white/10"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <div className="flex items-center space-x-3">
            <QrCode className="w-6 h-6 text-green-400" />
            <span className="text-white">Scanned via QR Code</span>
          </div>
          <Badge className="bg-blue-500 text-white">
            SPECTATOR VIEW
          </Badge>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Sponsor Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-4 mb-6 text-center">
          <div className="text-white font-bold text-lg mb-2">🏈 SportsCorp Presents</div>
          <div className="text-white/90 text-sm">Your Premier Sports Equipment Partner</div>
          <div className="text-xs text-white/70 mt-1">Generating $550/month for tournament organizers</div>
        </div>

        {/* Main Scoreboard */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 mb-6">
          <CardHeader className="text-center">
            <CardTitle className="text-white text-2xl">Championship Game</CardTitle>
            <div className="flex items-center justify-center gap-4">
              <Badge className="bg-red-500 text-white">
                <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                LIVE
              </Badge>
              <Badge className="bg-blue-500 text-white">
                Period {period}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {/* Game Clock */}
            <div className="text-center mb-8">
              <div className="text-5xl md:text-7xl font-mono font-bold text-white mb-2">
                {formatTime(gameTime)}
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 font-semibold">LIVE SYNC</span>
              </div>
            </div>

            {/* Teams and Scores */}
            <div className="grid grid-cols-2 gap-8">
              {/* Home Team */}
              <div className="text-center">
                <div className="bg-white/10 rounded-lg p-6">
                  <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-white text-xl font-bold mb-2">Thunder Hawks</h3>
                  <div className="text-5xl font-bold text-white">{homeScore}</div>
                </div>
              </div>

              {/* Away Team */}
              <div className="text-center">
                <div className="bg-white/10 rounded-lg p-6">
                  <div className="w-16 h-16 bg-red-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-white text-xl font-bold mb-2">Storm Eagles</h3>
                  <div className="text-5xl font-bold text-white">{awayScore}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sponsor Showcase */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {sponsors.map((sponsor, index) => (
            <Card key={index} className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-2">{sponsor.logo}</div>
                <div className="text-white font-semibold">{sponsor.name}</div>
                <div className="text-green-400 text-sm font-medium">{sponsor.revenue}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Revenue Demonstration */}
        <Card className="bg-green-500/20 border-green-500/50 mb-6">
          <CardHeader>
            <CardTitle className="text-green-400 flex items-center">
              <Zap className="w-5 h-5 mr-2" />
              Revenue Generation Demo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">$1,575</div>
                <div className="text-sm text-white">Monthly Revenue</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">$18,900</div>
                <div className="text-sm text-white">Annual Revenue</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">247</div>
                <div className="text-sm text-white">QR Scans Today</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">3.2x</div>
                <div className="text-sm text-white">ROI for Sponsors</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Engagement Stats */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Live Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">127</div>
                <div className="text-sm text-white">Spectators Viewing</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-400">45</div>
                <div className="text-sm text-white">Sponsor Interactions</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ClockSync Branding */}
        <div className="text-center mt-8 p-4">
          <div className="flex items-center justify-center space-x-3 mb-2">
            <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">
              Powered by Clock<span className="text-green-400">Sync</span>
            </span>
          </div>
          <p className="text-sm text-gray-400">
            Professional timing technology that generates revenue
          </p>
        </div>
      </div>
    </div>
  );
};

export default Spectator;
