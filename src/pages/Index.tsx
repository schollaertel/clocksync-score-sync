import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Trophy, DollarSign, Zap, QrCode, MapPin, Calendar } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Hero Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          {/* Logo */}
          <div className="flex items-center justify-center space-x-3 mb-8">
            <div className="relative">
              <img 
                src="/clocksynk-logo.png" 
                alt="ClockSynk Logo" 
                className="w-16 h-16 object-contain"
              />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">
                Clock<span className="text-green-400">Synk</span>
              </h1>
              <p className="text-sm text-gray-300">Sports Technology</p>
            </div>
          </div>

          <Badge className="mb-6 bg-green-500/20 text-green-400 border-green-500/50">
            Real-time Sports Timing Solutions
          </Badge>
          
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Synchronize Your Game,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
              Elevate Your Event
            </span>
          </h2>
          
          <p className="text-lg text-gray-300 mb-8 max-w-3xl mx-auto">
            Professional timing technology that generates revenue through digital advertising 
            while providing seamless tournament management for organizers, scorekeepers, and spectators.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-4 text-lg border-0"
              onClick={() => navigate("/demo")}
            >
              <Zap className="w-5 h-5 mr-2" />
              Start Free Trial
            </Button>
            <Button 
              size="lg" 
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-4 text-lg border-0"
              onClick={() => navigate("/spectator")}
            >
              <QrCode className="w-5 h-5 mr-2" />
              View Live Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Main Features Section - Single Row */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-white mb-12">
            Complete Tournament Management Platform
          </h2>
          
          {/* Single row of feature cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all">
              <CardHeader>
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-white">Revenue Generation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4">
                  Generate $400-600/month per field through integrated sponsor advertising
                </p>
                <div className="text-2xl font-bold text-green-400">$7,200/year</div>
                <div className="text-sm text-gray-400">per field potential</div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-white">Spectator Engagement</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4">
                  QR code access drives higher engagement and sponsor ROI
                </p>
                <div className="text-2xl font-bold text-blue-400">3x</div>
                <div className="text-sm text-gray-400">engagement increase</div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mb-4">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-white">Professional Grade</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4">
                  Tournament-quality presentation that attracts premium sponsors
                </p>
                <div className="text-2xl font-bold text-orange-400">Pro</div>
                <div className="text-sm text-gray-400">tournament ready</div>
              </CardContent>
            </Card>
          </div>

          {/* Pricing Section - Improved Layout */}
          <div className="bg-white/5 rounded-2xl p-8 backdrop-blur-md border border-white/10">
            <h3 className="text-2xl font-bold text-center text-white mb-4">
              Field-Based Pricing
            </h3>
            <p className="text-center text-gray-300 mb-8">
              Pay per field, maximize revenue from each location
            </p>
            
            <div className="grid md:grid-cols-3 gap-6">
              {/* Kickoff Plan */}
              <Card className="bg-gray-100 border-gray-200 relative">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl text-gray-800">Kickoff</CardTitle>
                  <div className="text-3xl font-bold text-gray-900">Free</div>
                  <div className="text-gray-600">14-day trial</div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      1 field
                    </li>
                    <li className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      Basic scoreboard
                    </li>
                    <li className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      QR code access
                    </li>
                  </ul>
                  <Button 
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold border-0"
                    onClick={() => navigate("/auth")}
                  >
                    Start Kickoff
                  </Button>
                </CardContent>
              </Card>

              {/* Game Day Plan */}
              <Card className="bg-blue-50 border-blue-200 relative">
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500 text-white border-0">
                  Most Popular
                </Badge>
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl text-gray-800">Game Day</CardTitle>
                  <div className="text-3xl font-bold text-gray-900">$99/field</div>
                  <div className="text-gray-600">per month</div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      Unlimited fields
                    </li>
                    <li className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      Sponsor management
                    </li>
                    <li className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      Revenue tracking
                    </li>
                    <li className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      Priority support
                    </li>
                  </ul>
                  <Button 
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold border-0"
                    onClick={() => navigate("/auth")}
                  >
                    Start Game Day
                  </Button>
                </CardContent>
              </Card>

              {/* Season Pass Plan */}
              <Card className="bg-green-50 border-green-200 relative">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl text-gray-800">Season Pass</CardTitle>
                  <div className="text-3xl font-bold text-gray-900">$79/field</div>
                  <div className="text-gray-600">min 3 fields</div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      Volume discount
                    </li>
                    <li className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      Advanced analytics
                    </li>
                    <li className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      White labeling
                    </li>
                    <li className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      API access
                    </li>
                  </ul>
                  <Button 
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold border-0"
                    onClick={() => navigate("/auth")}
                  >
                    Start Season Pass
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-8">
            See It In Action
          </h2>
          <p className="text-gray-300 mb-8">
            Experience the power of synchronized scoreboards and real-time sponsor revenue tracking
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <Button 
              size="lg"
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold p-8 h-auto border-0"
              onClick={() => navigate("/scorekeeper")}
            >
              <div className="text-center">
                <Clock className="w-8 h-8 mx-auto mb-2" />
                <div className="text-lg font-semibold">Scorekeeper Demo</div>
                <div className="text-sm opacity-90">Control the game clock and scores</div>
              </div>
            </Button>
            <Button 
              size="lg"
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold p-8 h-auto border-0"
              onClick={() => navigate("/spectator")}
            >
              <div className="text-center">
                <QrCode className="w-8 h-8 mx-auto mb-2" />
                <div className="text-lg font-semibold">Spectator Demo</div>
                <div className="text-sm opacity-90">View live games with sponsor ads</div>
              </div>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <img 
              src="/clocksynk-logo.png" 
              alt="ClockSynk Logo" 
              className="w-8 h-8 object-contain"
            />
            <span className="text-xl font-bold text-white">
              Clock<span className="text-green-400">Synk</span>
            </span>
          </div>
          <p className="text-gray-400 mb-4">
            Professional timing technology for every sport
          </p>
          <p className="text-sm text-gray-500">
            © 2024 ClockSync. All rights reserved. • From scorekeeper to spectator - everyone stays in sync.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

