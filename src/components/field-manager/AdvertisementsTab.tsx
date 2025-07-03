
import React from 'react';
import { AdvertisementCard } from './AdvertisementCard';
import { CreateAdvertisementForm } from './CreateAdvertisementForm';
import type { Field, Advertisement } from '@/types/game';

interface AdvertisementsTabProps {
  fields: Field[];
  advertisements: Advertisement[];
  selectedField: Field | null;
  advertiserName: string;
  monthlyRate: string;
  position: string;
  onFieldSelect: (field: Field | null) => void;
  onAdvertiserNameChange: (value: string) => void;
  onMonthlyRateChange: (value: string) => void;
  onPositionChange: (value: string) => void;
  onCreateAdvertisement: () => void;
  onToggleAdvertisement: (adId: string, currentStatus: boolean) => void;
  onDeleteAdvertisement: (adId: string) => void;
}

export const AdvertisementsTab: React.FC<AdvertisementsTabProps> = ({
  fields,
  advertisements,
  selectedField,
  advertiserName,
  monthlyRate,
  position,
  onFieldSelect,
  onAdvertiserNameChange,
  onMonthlyRateChange,
  onPositionChange,
  onCreateAdvertisement,
  onToggleAdvertisement,
  onDeleteAdvertisement
}) => {
  return (
    <div className="space-y-6">
      <CreateAdvertisementForm
        fields={fields}
        selectedField={selectedField}
        advertiserName={advertiserName}
        monthlyRate={monthlyRate}
        position={position}
        onFieldSelect={onFieldSelect}
        onAdvertiserNameChange={onAdvertiserNameChange}
        onMonthlyRateChange={onMonthlyRateChange}
        onPositionChange={onPositionChange}
        onSubmit={onCreateAdvertisement}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {advertisements.map((ad) => (
          <AdvertisementCard
            key={ad.id}
            advertisement={ad}
            fields={fields}
            onToggle={onToggleAdvertisement}
            onDelete={onDeleteAdvertisement}
          />
        ))}
      </div>

      {advertisements.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No advertisements created yet. Create your first advertisement above!</p>
        </div>
      )}
    </div>
  );
};
