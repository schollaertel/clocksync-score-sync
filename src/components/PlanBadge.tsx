
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Lock, Crown, Zap } from 'lucide-react';

export const PlanBadge: React.FC = () => {
  const { profile } = useAuth();

  if (!profile) return null;

  const planConfig = {
    covered_game: {
      icon: Lock,
      label: 'Covered Game',
      className: 'bg-gray-500/20 text-gray-400 border-gray-500/50'
    },
    game_day: {
      icon: Zap,
      label: 'Game Day',
      className: 'bg-blue-500/20 text-blue-400 border-blue-500/50'
    },
    season_pass: {
      icon: Crown,
      label: 'Season Pass',
      className: 'bg-purple-500/20 text-purple-400 border-purple-500/50'
    }
  };

  const config = planConfig[profile.plan_tier];
  const Icon = config.icon;

  return (
    <Badge className={config.className}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </Badge>
  );
};
