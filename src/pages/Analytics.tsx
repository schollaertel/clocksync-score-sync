import React from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useRevenue } from '@/hooks/useRevenue';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlanGate } from '@/components/PlanGate';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, DollarSign, Users, Activity, TrendingUp, Eye } from 'lucide-react';

const Analytics: React.FC = () => {
  const { data: analyticsData, loading: analyticsLoading } = useAnalytics();
  const { data: revenueData, loading: revenueLoading } = useRevenue();

  if (analyticsLoading || revenueLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading analytics...</div>
      </div>
    );
  }

  return (
    <PlanGate feature="analytics">
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
              <p className="text-gray-300">Track your performance and revenue insights</p>
            </div>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-slate-800 border-slate-700">
              <TabsTrigger value="overview" className="text-white data-[state=active]:bg-slate-700">
                Overview
              </TabsTrigger>
              <TabsTrigger value="revenue" className="text-white data-[state=active]:bg-slate-700">
                Revenue
              </TabsTrigger>
              <TabsTrigger value="performance" className="text-white data-[state=active]:bg-slate-700">
                Performance
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-300">Total Fields</CardTitle>
                    <BarChart3 className="h-4 w-4 text-blue-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{analyticsData?.totalFields || 0}</div>
                    <p className="text-xs text-gray-400">Active venues</p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-300">Total Games</CardTitle>
                    <Activity className="h-4 w-4 text-green-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{analyticsData?.totalGames || 0}</div>
                    <p className="text-xs text-gray-400">
                      {analyticsData?.activeGames || 0} currently active
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-300">QR Scans Today</CardTitle>
                    <Eye className="h-4 w-4 text-purple-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{analyticsData?.qrScansToday || 0}</div>
                    <p className="text-xs text-gray-400">Spectator engagement</p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-300">Monthly Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-yellow-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">
                      ${revenueData?.monthlyRevenue?.toLocaleString() || '0'}
                    </div>
                    <p className="text-xs text-gray-400">This month</p>
                  </CardContent>
                </Card>
              </div>

              {/* Top Performing Fields */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Top Performing Fields</CardTitle>
                  <CardDescription className="text-gray-400">
                    Fields with highest engagement and revenue
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData?.topFields?.map((field, index) => (
                      <div key={field.name} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="text-white font-medium">{field.name}</p>
                            <p className="text-gray-400 text-sm">{field.scans} scans</p>
                          </div>
                        </div>
                        <div className="text-green-400 font-medium">
                          ${field.revenue.toLocaleString()}/mo
                        </div>
                      </div>
                    )) || (
                      <div className="text-gray-400 text-center py-8">
                        No field data available yet
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="revenue" className="space-y-6">
              {/* Revenue Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Sponsor Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-400">
                      ${revenueData?.sponsorRevenue?.toLocaleString() || '0'}
                    </div>
                    <p className="text-gray-400 text-sm">This month</p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Subscription Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-400">
                      ${revenueData?.subscriptionRevenue?.toLocaleString() || '0'}
                    </div>
                    <p className="text-gray-400 text-sm">This month</p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Platform Fees</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-400">
                      ${revenueData?.platformFees?.toLocaleString() || '0'}
                    </div>
                    <p className="text-gray-400 text-sm">This month</p>
                  </CardContent>
                </Card>
              </div>

              {/* Revenue by Field */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Revenue by Field</CardTitle>
                  <CardDescription className="text-gray-400">
                    Monthly sponsor revenue breakdown
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {revenueData?.revenueByField?.map((field) => (
                      <div key={field.fieldName} className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">{field.fieldName}</p>
                          <p className="text-gray-400 text-sm">{field.sponsors} sponsors</p>
                        </div>
                        <div className="text-green-400 font-medium">
                          ${field.revenue.toLocaleString()}/mo
                        </div>
                      </div>
                    )) || (
                      <div className="text-gray-400 text-center py-8">
                        No revenue data available yet
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance" className="space-y-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Performance Metrics</CardTitle>
                  <CardDescription className="text-gray-400">
                    Spectator engagement and field utilization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Spectator Views</h3>
                      <div className="text-3xl font-bold text-purple-400">
                        {analyticsData?.totalSpectatorViews?.toLocaleString() || '0'}
                      </div>
                      <p className="text-gray-400">Total page views</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Field Utilization</h3>
                      <div className="text-3xl font-bold text-blue-400">
                        {analyticsData?.totalFields ? 
                          Math.round((analyticsData.activeGames / analyticsData.totalFields) * 100) : 0}%
                      </div>
                      <p className="text-gray-400">Currently active</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PlanGate>
  );
};

export default Analytics;
