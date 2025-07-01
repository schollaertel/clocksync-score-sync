
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Clock, Settings, LogOut, Menu } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PlanBadge } from '@/components/PlanBadge';

export const Header: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (!user) return null;

  return (
    <header className="bg-gradient-to-r from-slate-900 to-slate-800 shadow-lg border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
              <div className="relative">
                <img 
                  src="/clocksynk-logo.png" 
                  alt="ClockSynk Logo" 
                  className="w-10 h-10 object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  Clock<span className="text-green-400">Synk</span>
                </h1>
                <p className="text-xs text-gray-300">Sports Technology</p>
              </div>
            </div>
            
            <nav className="hidden md:flex space-x-2">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/fields')}
                className="text-gray-300 hover:text-white hover:bg-white/10 border-0"
              >
                Fields
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => navigate('/scorekeeper')}
                className="text-gray-300 hover:text-white hover:bg-white/10 border-0"
              >
                Scorekeeper
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => navigate('/spectator')}
                className="text-gray-300 hover:text-white hover:bg-white/10 border-0"
              >
                Spectator Demo
              </Button>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2">
              <PlanBadge />
              {profile && profile.plan_tier === 'covered_game' && (
                <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/50">
                  {profile.total_games_played}/2 games
                </Badge>
              )}
              <span className="text-sm text-gray-300">
                {user.email?.split('@')[0] || 'User'}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/fields')}
                className="text-gray-300 hover:text-white hover:bg-white/10 border-0"
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button 
                size="sm"
                onClick={handleSignOut}
                className="bg-orange-500 hover:bg-orange-600 text-white border-0"
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
