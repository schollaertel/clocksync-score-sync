
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Play, Pause, RotateCcw, Plus, Minus, Users, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Scorekeeper = () => {
  const navigate = useNavigate();
  const [gameTime, setGameTime] = useState(900); // 15 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [period, setPeriod] = useState(1);
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [penalties, setPenalties] = useState<Array<{id: number, team: string, player: string, time: number}>>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && gameTime > 0) {
      interval = setInterval(() => {
        setGameTime(time => time - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, gameTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleClock = () => {
    setIsRunning(!isRunning);
  };

  const resetClock = () => {
    setGameTime(900);
    setIsRunning(false);
  };

  const addPenalty = (team: string) => {
    const newPenalty = {
      id: Date.now(),
      team,
      player: `#${Math.floor(Math.random() * 99) + 1}`,
      time: 120 // 2 minutes
    };
    setPenalties([...penalties, newPenalty]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-6">
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
            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">
              Clock<span className="text-green-400">Sync</span>
            </span>
          </div>
          <Badge className="bg-orange-500 text-white">
            SCOREKEEPER MODE
          </Badge>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Main Scoreboard */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 mb-6">
          <CardHeader className="text-center">
            <CardTitle className="text-white text-2xl">Championship Game</CardTitle>
            <Badge className="mx-auto bg-green-500 text-white">
              Period {period} • LIVE
            </Badge>
          </CardHeader>
          <CardContent>
            {/* Game Clock */}
            <div className="text-center mb-8">
              <div className="text-6xl md:text-8xl font-mono font-bold text-white mb-4">
                {formatTime(gameTime)}
              </div>
              <div className="flex justify-center gap-4">
                <Button
                  size="lg"
                  onClick={toggleClock}
                  className={`${isRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white px-8`}
                >
                  {isRunning ? <Pause className="w-6 h-6 mr-2" /> : <Play className="w-6 h-6 mr-2" />}
                  {isRunning ? 'Pause' : 'Start'}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={resetClock}
                  className="border-white/20 text-white hover:bg-white/10 px-8"
                >
                  <RotateCcw className="w-6 h-6 mr-2" />
                  Reset
                </Button>
              </div>
            </div>

            {/* Scores */}
            <div className="grid grid-cols-2 gap-8">
              {/* Home Team */}
              <div className="text-center">
                <div className="bg-white/10 rounded-lg p-6 mb-4">
                  <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-white text-xl font-bold mb-2">Thunder Hawks</h3>
                  <div className="text-5xl font-bold text-white mb-4">{homeScore}</div>
                  <div className="flex justify-center gap-2">
                    <Button
                      onClick={() => setHomeScore(homeScore + 1)}
                      className="bg-green-500 hover:bg-green-600 text-white"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => setHomeScore(Math.max(0, homeScore - 1))}
                      className="bg-red-500 hover:bg-red-600 text-white"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <Button
                  onClick={() => addPenalty('home')}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white"
                >
                  Add Penalty
                </Button>
              </div>

              {/* Away Team */}
              <div className="text-center">
                <div className="bg-white/10 rounded-lg p-6 mb-4">
                  <div className="w-16 h-16 bg-red-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-white text-xl font-bold mb-2">Storm Eagles</h3>
                  <div className="text-5xl font-bold text-white mb-4">{awayScore}</div>
                  <div className="flex justify-center gap-2">
                    <Button
                      onClick={() => setAwayScore(awayScore + 1)}
                      className="bg-green-500 hover:bg-green-600 text-white"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => setAwayScore(Math.max(0, awayScore - 1))}
                      className="bg-red-500 hover:bg-red-600 text-white"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <Button
                  onClick={() => addPenalty('away')}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white"
                >
                  Add Penalty
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Game Controls */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Period Control */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Period Control</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-white">Current Period:</span>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => setPeriod(Math.max(1, period - 1))}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="text-2xl font-bold text-white px-4">{period}</span>
                  <Button
                    size="sm"
                    onClick={() => setPeriod(period + 1)}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Penalties */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Active Penalties</CardTitle>
            </CardHeader>
            <CardContent>
              {penalties.length === 0 ? (
                <p className="text-gray-400 text-center">No active penalties</p>
              ) : (
                <div className="space-y-2">
                  {penalties.map((penalty) => (
                    <div key={penalty.id} className="flex items-center justify-between bg-white/10 rounded p-2">
                      <span className="text-white">{penalty.team === 'home' ? 'Thunder Hawks' : 'Storm Eagles'} {penalty.player}</span>
                      <span className="text-yellow-400">{formatTime(penalty.time)}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sync Status */}
        <Card className="bg-green-500/20 border-green-500/50 mt-6">
          <CardContent className="pt-4">
            <div className="flex items-center justify-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 font-semibold">LIVE SYNC ACTIVE</span>
              <span className="text-gray-300">• Spectators are viewing real-time updates</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Scorekeeper;
