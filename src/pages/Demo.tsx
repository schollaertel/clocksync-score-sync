
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock, DollarSign, Users, TrendingUp, Plus, Settings, QrCode, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Demo = () => {
  const navigate = useNavigate();
  const [fields, setFields] = useState(1);
  const [plan, setPlan] = useState("kickoff");
  
  const calculateRevenue = () => {
    const sponsorRevenuePerField = 500; // Average $500/month per field
    const subscriptionCost = plan === "kickoff" ? 0 : plan === "gameday" ? 99 * fields : 79 * fields;
    const grossRevenue = sponsorRevenuePerField * fields;
    const platformFee = grossRevenue * 0.05; // 5% platform fee
    const netRevenue = grossRevenue - platformFee - subscriptionCost;
    
    return {
      grossRevenue,
      subscriptionCost,
      platformFee,
      netRevenue,
      annualNet: netRevenue * 12
    };
  };

  const revenue = calculateRevenue();

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
          <Badge className="bg-green-500 text-white">
            REVENUE CALCULATOR
          </Badge>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Configuration Panel */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Tournament Setup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Plan Selection */}
              <div>
                <Label className="text-white mb-2 block">Subscription Plan</Label>
                <div className="space-y-2">
                  <Button
                    variant={plan === "kickoff" ? "default" : "outline"}
                    className={`w-full justify-start ${plan === "kickoff" ? "bg-green-500 text-white" : "border-white/20 text-white hover:bg-white/10"}`}
                    onClick={() => setPlan("kickoff")}
                  >
                    Kickoff - Free (1 field)
                  </Button>
                  <Button
                    variant={plan === "gameday" ? "default" : "outline"}
                    className={`w-full justify-start ${plan === "gameday" ? "bg-green-500 text-white" : "border-white/20 text-white hover:bg-white/10"}`}
                    onClick={() => setPlan("gameday")}
                  >
                    Game Day - $99/field
                  </Button>
                  <Button
                    variant={plan === "season" ? "default" : "outline"}
                    className={`w-full justify-start ${plan === "season" ? "bg-green-500 text-white" : "border-white/20 text-white hover:bg-white/10"}`}
                    onClick={() => setPlan("season")}
                  >
                    Season Pass - $79/field (3+ fields)
                  </Button>
                </div>
              </div>

              {/* Fields Configuration */}
              <div>
                <Label className="text-white mb-2 block">Number of Fields</Label>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    onClick={() => setFields(Math.max(1, fields - 1))}
                    disabled={plan === "kickoff" && fields <= 1}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    -
                  </Button>
                  <Input
                    type="number"
                    value={fields}
                    onChange={(e) => setFields(Math.max(1, parseInt(e.target.value) || 1))}
                    className="text-center bg-white/10 border-white/20 text-white"
                    min="1"
                    max={plan === "kickoff" ? "1" : "50"}
                  />
                  <Button
                    size="sm"
                    onClick={() => setFields(fields + 1)}
                    disabled={plan === "kickoff" && fields >= 1}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    +
                  </Button>
                </div>
                {plan === "kickoff" && (
                  <p className="text-sm text-gray-400 mt-1">Free plan limited to 1 field</p>
                )}
                {plan === "season" && fields < 3 && (
                  <p className="text-sm text-yellow-400 mt-1">Season Pass requires minimum 3 fields</p>
                )}
              </div>

              {/* Quick Actions */}
              <div className="space-y-2">
                <Button
                  onClick={() => navigate("/scorekeeper")}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Test Scorekeeper
                </Button>
                <Button
                  onClick={() => navigate("/spectator")}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  View Spectator Demo
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Revenue Breakdown */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Revenue Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Sponsor Revenue</span>
                  <span className="text-green-400 font-semibold">
                    ${revenue.grossRevenue.toLocaleString()}/month
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Subscription Cost</span>
                  <span className="text-red-400 font-semibold">
                    -${revenue.subscriptionCost.toLocaleString()}/month
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Platform Fee (5%)</span>
                  <span className="text-red-400 font-semibold">
                    -${revenue.platformFee.toLocaleString()}/month
                  </span>
                </div>
                <hr className="border-white/20" />
                <div className="flex justify-between items-center">
                  <span className="text-white font-semibold">Net Monthly Revenue</span>
                  <span className="text-green-400 font-bold text-lg">
                    ${revenue.netRevenue.toLocaleString()}/month
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white font-semibold">Annual Revenue</span>
                  <span className="text-green-400 font-bold text-xl">
                    ${revenue.annualNet.toLocaleString()}/year
                  </span>
                </div>
              </div>

              <div className="bg-green-500/20 rounded-lg p-4 mt-4">
                <div className="flex items-center mb-2">
                  <TrendingUp className="w-5 h-5 text-green-400 mr-2" />
                  <span className="text-green-400 font-semibold">ROI Analysis</span>
                </div>
                <p className="text-sm text-white">
                  Each field generates an average of $500/month in sponsor revenue. 
                  With ClockSync's professional presentation, you'll attract premium sponsors 
                  willing to pay top rates for quality advertising placement.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Field Management */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Field Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: fields }, (_, i) => (
                  <div key={i} className="bg-white/10 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-semibold">Field {i + 1}</span>
                      <Badge className="bg-green-500 text-white">Active</Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Sponsors</span>
                        <span className="text-green-400">3 active</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Monthly Revenue</span>
                        <span className="text-green-400">$500</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">QR Scans</span>
                        <span className="text-blue-400">847 this month</span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {plan !== "kickoff" && (
                  <Button
                    onClick={() => setFields(fields + 1)}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Field
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Success Metrics */}
        <Card className="bg-gradient-to-r from-green-500/20 to-blue-500/20 border-green-500/50 mt-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-green-400">{fields}</div>
                <div className="text-sm text-white">Active Fields</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-400">{fields * 3}</div>
                <div className="text-sm text-white">Sponsor Partnerships</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-400">{(fields * 847).toLocaleString()}</div>
                <div className="text-sm text-white">Monthly QR Scans</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-400">3.2x</div>
                <div className="text-sm text-white">Sponsor ROI</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Demo;
