import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlanBadge } from '@/components/PlanBadge';
import { FieldsTab } from '@/components/field-manager/FieldsTab';
import { GamesTab } from '@/components/field-manager/GamesTab';
import { AdvertisementsTab } from '@/components/field-manager/AdvertisementsTab';
import { useFieldManagerData } from '@/hooks/useFieldManagerData';
import { useFieldOperations } from '@/hooks/useFieldOperations';
import { useGameOperations } from '@/hooks/useGameOperations';
import { useAdvertisementOperations } from '@/hooks/useAdvertisementOperations';

const FieldManager: React.FC = () => {
  const { user } = useAuth();
  const { fields, games, advertisements, loading, fetchFields, fetchGames, fetchAdvertisements, refetchData } = useFieldManagerData();
  
  const fieldOps = useFieldOperations(fetchFields);
  const gameOps = useGameOperations(fetchGames);
  const adOps = useAdvertisementOperations(fetchAdvertisements);

  console.log('FieldManager render - loading:', loading, 'user:', !!user);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading field manager...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-xl">Please log in to access field management.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Field Management</h1>
            <p className="text-gray-300 flex items-center gap-2">
              Manage your fields, games, and advertisements
              <PlanBadge />
            </p>
          </div>
        </div>

        <Tabs defaultValue="fields" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800 border-slate-700">
            <TabsTrigger value="fields" className="text-white data-[state=active]:bg-slate-700">
              Fields ({fields.length})
            </TabsTrigger>
            <TabsTrigger value="games" className="text-white data-[state=active]:bg-slate-700">
              Games ({games.length})
            </TabsTrigger>
            <TabsTrigger value="ads" className="text-white data-[state=active]:bg-slate-700">
              Advertisements ({advertisements.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="fields">
            <FieldsTab
              fields={fields}
              games={games}
              fieldName={fieldOps.newFieldName}
              fieldLocation={fieldOps.newFieldLocation}
              onFieldNameChange={fieldOps.setNewFieldName}
              onFieldLocationChange={fieldOps.setNewFieldLocation}
              onCreateField={fieldOps.createField}
              onFieldUpdated={refetchData}
            />
          </TabsContent>

          <TabsContent value="games">
            <GamesTab
              fields={fields}
              games={games}
              selectedField={gameOps.selectedField}
              homeTeam={gameOps.newGameHomeTeam}
              awayTeam={gameOps.newGameAwayTeam}
              dateTime={gameOps.newGameDateTime}
              onFieldSelect={gameOps.setSelectedField}
              onHomeTeamChange={gameOps.setNewGameHomeTeam}
              onAwayTeamChange={gameOps.setNewGameAwayTeam}
              onDateTimeChange={gameOps.setNewGameDateTime}
              onCreateGame={gameOps.createGame}
            />
          </TabsContent>

          <TabsContent value="ads">
            <AdvertisementsTab
              fields={fields}
              advertisements={advertisements}
              selectedField={adOps.selectedField}
              advertiserName={adOps.newAdName}
              monthlyRate={adOps.newAdRate}
              position={adOps.newAdPosition}
              onFieldSelect={adOps.setSelectedField}
              onAdvertiserNameChange={adOps.setNewAdName}
              onMonthlyRateChange={adOps.setNewAdRate}
              onPositionChange={adOps.setNewAdPosition}
              onCreateAdvertisement={adOps.createAdvertisement}
              onToggleAdvertisement={adOps.toggleAdvertisement}
              onDeleteAdvertisement={adOps.deleteAdvertisement}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FieldManager;
