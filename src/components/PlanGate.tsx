
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Crown, Zap } from 'lucide-react';

interface PlanGateProps {
  children: React.ReactNode;
  feature: 'scoreboard' | 'ads' | 'analytics';
  fallback?: React.ReactNode;
}

const planInfo = {
  covered_game: {
    name: 'Covered Game',
    icon: Lock,
    color: 'bg-gray-500',
    description: 'Free with sponsor ads'
  },
  game_day: {
    name: 'Game Day',
    icon: Zap,
    color: 'bg-blue-500',
    description: '$99/field/month'
  },
  season_pass: {
    name: 'Season Pass',
    icon: Crown,
    color: 'bg-purple-500',
    description: '$79/field/month (3+ fields)'
  }
};

export const PlanGate: React.FC<PlanGateProps> = ({ children, feature, fallback }) => {
  const { profile, canAccessScoreboard, canCreateAds } = useAuth();

  if (!profile) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const hasAccess = () => {
    switch (feature) {
      case 'scoreboard':
        return canAccessScoreboard;
      case 'ads':
        return canCreateAds;
      case 'analytics':
        return profile.plan_tier !== 'covered_game' || profile.active_ads_count > 0;
      default:
        return false;
    }
  };

  if (hasAccess()) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  const PlanIcon = planInfo[profile.plan_tier].icon;

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Badge className={`${planInfo[profile.plan_tier].color} text-white`}>
            <PlanIcon className="w-4 h-4 mr-2" />
            {planInfo[profile.plan_tier].name}
          </Badge>
        </div>
        <CardTitle className="text-xl">Feature Locked</CardTitle>
        <CardDescription>
          {feature === 'scoreboard' && profile.plan_tier === 'covered_game' && (
            <>
              You've used {profile.total_games_played} of your 2 free games. 
              {profile.active_ads_count < profile.fields_count ? (
                <> Add sponsor ads to unlock unlimited games, or upgrade your plan.</>
              ) : (
                <> Your sponsor ads have unlocked unlimited games!</>
              )}
            </>
          )}
          {feature === 'analytics' && (
            <>Access to analytics requires an active plan or sponsor advertisements.</>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className={profile.plan_tier === 'covered_game' ? 'border-2 border-gray-300' : 'opacity-50'}>
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-2">
                <Lock className="w-5 h-5 text-gray-500" />
                <CardTitle className="text-lg">Covered Game</CardTitle>
              </div>
              <CardDescription>Free with ads</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1">
                <li>• 2 free games</li>
                <li>• Unlimited with ads</li>
                <li>• 60% ad revenue</li>
              </ul>
            </CardContent>
          </Card>

          <Card className={profile.plan_tier === 'game_day' ? 'border-2 border-blue-300' : 'opacity-50'}>
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-blue-500" />
                <CardTitle className="text-lg">Game Day</CardTitle>
              </div>
              <CardDescription>$99/field/month</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1">
                <li>• Unlimited games</li>
                <li>• Full analytics</li>
                <li>• 20% ad revenue</li>
              </ul>
            </CardContent>
          </Card>

          <Card className={profile.plan_tier === 'season_pass' ? 'border-2 border-purple-300' : 'opacity-50'}>
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-2">
                <Crown className="w-5 h-5 text-purple-500" />
                <CardTitle className="text-lg">Season Pass</CardTitle>
              </div>
              <CardDescription>$79/field/month</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1">
                <li>• Everything in Game Day</li>
                <li>• Volume discount</li>
                <li>• 10% ad revenue</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {profile.plan_tier === 'covered_game' && profile.active_ads_count < profile.fields_count && (
          <div className="text-center pt-4">
            <Button className="mr-2">Add Sponsor Ads</Button>
            <Button variant="outline">Upgrade Plan</Button>
          </div>
        )}

        {profile.plan_tier !== 'season_pass' && (
          <div className="text-center pt-4">
            <Button>Upgrade Plan</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
