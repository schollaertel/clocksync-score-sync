import React from 'react';
import { useAdminData } from '@/hooks/useAdminData';
import { useUserRoles } from '@/hooks/useUserRoles';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, Building2, DollarSign, Activity, Clock } from 'lucide-react';
import { format } from 'date-fns';

const AdminDashboard: React.FC = () => {
  const { hasRole } = useUserRoles();
  const { data: adminData, loading } = useAdminData();

  // Check if user has admin access
  if (!hasRole('super_admin') && !hasRole('admin')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <Card className="bg-slate-800 border-slate-700 max-w-md">
          <CardHeader className="text-center">
            <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <CardTitle className="text-white">Access Denied</CardTitle>
            <CardDescription className="text-gray-400">
              You don't have permission to access the admin dashboard.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-gray-300">Platform administration and monitoring</p>
          </div>
          <Badge className="bg-red-500/20 text-red-400 border-red-500/50">
            <Shield className="w-4 h-4 mr-2" />
            Admin Access
          </Badge>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800 border-slate-700">
            <TabsTrigger value="overview" className="text-white data-[state=active]:bg-slate-700">
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="text-white data-[state=active]:bg-slate-700">
              Users
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-white data-[state=active]:bg-slate-700">
              Analytics
            </TabsTrigger>
            <TabsTrigger value="audit" className="text-white data-[state=active]:bg-slate-700">
              Audit Logs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Platform Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{adminData?.totalUsers || 0}</div>
                  <p className="text-xs text-gray-400">Platform users</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Organizations</CardTitle>
                  <Building2 className="h-4 w-4 text-green-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{adminData?.totalOrganizations || 0}</div>
                  <p className="text-xs text-gray-400">Active organizations</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Total Fields</CardTitle>
                  <Activity className="h-4 w-4 text-purple-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{adminData?.totalFields || 0}</div>
                  <p className="text-xs text-gray-400">
                    {adminData?.activeGames || 0} active games
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Platform Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-yellow-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    ${adminData?.totalRevenue?.toLocaleString() || '0'}
                  </div>
                  <p className="text-xs text-gray-400">Total revenue</p>
                </CardContent>
              </Card>
            </div>

            {/* Platform Analytics Chart */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Platform Growth</CardTitle>
                <CardDescription className="text-gray-400">
                  Organizations and revenue trends over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {adminData?.platformAnalytics?.slice(0, 10).map((record) => (
                    <div key={record.date} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span className="text-white">
                          {format(new Date(record.date), 'MMM dd, yyyy')}
                        </span>
                      </div>
                      <div className="flex space-x-6 text-sm">
                        <span className="text-gray-400">
                          {record.total_organizations} orgs
                        </span>
                        <span className="text-green-400">
                          ${record.total_mrr?.toLocaleString() || '0'} MRR
                        </span>
                      </div>
                    </div>
                  )) || (
                    <div className="text-gray-400 text-center py-8">
                      No platform analytics available yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Recent Users</CardTitle>
                <CardDescription className="text-gray-400">
                  Latest user registrations and activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {adminData?.recentUsers?.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                      <div>
                        <p className="text-white font-medium">{user.full_name || 'Unnamed User'}</p>
                        <p className="text-gray-400 text-sm">{user.email}</p>
                        <p className="text-gray-500 text-xs">{user.organization}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-400 text-sm">
                          {format(new Date(user.created_at), 'MMM dd, yyyy')}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          New User
                        </Badge>
                      </div>
                    </div>
                  )) || (
                    <div className="text-gray-400 text-center py-8">
                      No user data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Platform Analytics</CardTitle>
                <CardDescription className="text-gray-400">
                  Detailed platform performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Monthly Recurring Revenue</h3>
                    <div className="space-y-2">
                      {adminData?.platformAnalytics?.slice(0, 6).map((record) => (
                        <div key={record.date} className="flex justify-between">
                          <span className="text-gray-400">
                            {format(new Date(record.date), 'MMM yyyy')}
                          </span>
                          <span className="text-green-400">
                            ${record.total_mrr?.toLocaleString() || '0'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Organization Growth</h3>
                    <div className="space-y-2">
                      {adminData?.platformAnalytics?.slice(0, 6).map((record) => (
                        <div key={record.date} className="flex justify-between">
                          <span className="text-gray-400">
                            {format(new Date(record.date), 'MMM yyyy')}
                          </span>
                          <span className="text-blue-400">
                            {record.total_organizations || 0} orgs
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Audit Logs</CardTitle>
                <CardDescription className="text-gray-400">
                  System actions and administrative changes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {adminData?.auditLogs?.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-white text-sm">{log.action}</p>
                          <p className="text-gray-400 text-xs">
                            by {log.admin_email || 'System'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-400 text-xs">
                          {format(new Date(log.created_at), 'MMM dd, HH:mm')}
                        </p>
                        {log.target_id && (
                          <p className="text-gray-500 text-xs">
                            Target: {log.target_id.slice(0, 8)}...
                          </p>
                        )}
                      </div>
                    </div>
                  )) || (
                    <div className="text-gray-400 text-center py-8">
                      No audit logs available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
