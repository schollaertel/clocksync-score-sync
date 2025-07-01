
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Trophy, DollarSign, Zap, QrCode } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const plans = [
    {
      name: "Kickoff",
      price: "Free",
      description: "14-day trial",
      features: ["1 field", "Basic scoreboard", "QR code access"],
      color: "bg-gray-100",
      popular: false,
    },
    {
      name: "Game Day",
      price: "$99/field",
      description: "per month",
      features: ["Unlimited fields", "Sponsor management", "Revenue tracking", "Priority support"],
      color: "bg-blue-50 border-blue-200",
      popular: true,
    },
    {
      name: "Season Pass",
      price: "$79/field",
      description: "min 3 fields",
      features: ["Volume discount", "Advanced analytics", "White labeling", "API access"],
      color: "bg-green-50 border-green-200",
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Clock<span className="text-green-400">Sync</span>
                </h1>
                <p className="text-xs text-gray-300">Sports Technology</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-white font-mono text-sm">
                  {currentTime.toLocaleTimeString()}
                </div>
                <div className="text-green-400 text-xs">LIVE SYNC</div>
              </div>
              <Button 
                onClick={() => navigate("/login")}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                Login
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Badge className="mb-6 bg-green-500/20 text-green-400 border-green-500/50">
            Real-time Sports Timing Solutions
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Synchronize Your Game,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
              Elevate Your Event
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Professional timing technology that generates revenue through digital advertising 
            while providing seamless tournament management for organizers, scorekeepers, and spectators.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 text-lg"
              onClick={() => navigate("/demo")}
            >
              <Zap className="w-5 h-5 mr-2" />
              Start Free Trial
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white/20 text-white hover:bg-white/10 px-8 py-4 text-lg"
              onClick={() => navigate("/spectator")}
            >
              <QrCode className="w-5 h-5 mr-2" />
              View Live Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Revenue Model */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-white mb-12">
            Revenue-Generating Sports Technology
          </h2>
          <div className="grid md:grid-3 gap-8">
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-white">Sponsor Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4">
                  Generate $400-600/month per field through integrated sponsor advertising
                </p>
                <div className="text-2xl font-bold text-green-400">$7,200/year</div>
                <div className="text-sm text-gray-400">per field potential</div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20">
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

            <Card className="bg-white/10 backdrop-blur-md border-white/20">
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
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-white mb-4">
            Field-Based Pricing
          </h2>
          <p className="text-center text-gray-300 mb-12">
            Pay per field, maximize revenue from each location
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <Card key={plan.name} className={`${plan.color} relative`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500 text-white">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl text-gray-800">{plan.name}</CardTitle>
                  <div className="text-3xl font-bold text-gray-900">{plan.price}</div>
                  <div className="text-gray-600">{plan.description}</div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center text-gray-700">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => navigate("/signup")}
                  >
                    Start {plan.name}
                  </Button>
                </CardContent>
              </Card>
            ))}
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
              className="bg-orange-500 hover:bg-orange-600 text-white p-8 h-auto"
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
              className="bg-blue-500 hover:bg-blue-600 text-white p-8 h-auto"
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
            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">
              Clock<span className="text-green-400">Sync</span>
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
