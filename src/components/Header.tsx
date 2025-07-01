
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Clock, Settings, LogOut } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (!user) return null;

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Clock<span className="text-green-500">Sync</span>
                </h1>
                <p className="text-xs text-gray-500">Sports Technology</p>
              </div>
            </div>
            
            <nav className="hidden md:flex space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/fields')}
                className="text-gray-700 hover:text-gray-900"
              >
                Fields
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => navigate('/scorekeeper')}
                className="text-gray-700 hover:text-gray-900"
              >
                Scorekeeper
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => navigate('/spectator')}
                className="text-gray-700 hover:text-gray-900"
              >
                Spectator Demo
              </Button>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">Welcome, {user.email}</span>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/fields')}
              className="text-gray-600 hover:text-gray-900"
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleSignOut}
              className="text-gray-700 border-gray-300 hover:bg-gray-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
