
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Home } from "lucide-react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { RealtimeScoreboard } from '@/components/scoreboard/RealtimeScoreboard';

const Spectator = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const params = useParams();
  
  // Extract parameters from URL hash and search params
  const getHashParams = () => {
    const hash = window.location.hash.substring(1); // Remove the #
    const params = new URLSearchParams(hash);
    return params;
  };

  const hashParams = getHashParams();
  const fieldId = searchParams.get('field') || hashParams.get('field') || params.fieldId;
  const gameIdFromQuery = searchParams.get('gameId') || hashParams.get('gameId');
  const gameIdFromParams = params.gameId;
  const gameId = gameIdFromParams || gameIdFromQuery;
  
  console.log('Spectator URL parameters:', { fieldId, gameId, gameIdFromQuery, gameIdFromParams });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-4">
          <Button
            className="bg-orange-500 hover:bg-orange-600 text-white border-0"
            onClick={() => navigate("/")}
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <div className="flex items-center space-x-3">
            <img 
              src="/clocksynk-logo.png" 
              alt="ClockSynk Logo" 
              className="w-8 h-8 object-contain"
            />
            <span className="text-xl font-bold text-white">
              Clock<span className="text-green-400">Synk</span>
            </span>
          </div>
          <Badge className="bg-blue-500 text-white">
            SPECTATOR VIEW
          </Badge>
        </div>
      </div>

      {/* Real-time Scoreboard */}
      <div className="max-w-4xl mx-auto">
        <RealtimeScoreboard 
          gameId={gameId} 
          fieldId={fieldId} 
          showAds={true}
        />
      </div>
    </div>
  );
};

export default Spectator;
