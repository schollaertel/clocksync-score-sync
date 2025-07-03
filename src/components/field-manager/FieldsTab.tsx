
import React from 'react';
import { FieldCard } from './FieldCard';
import { CreateFieldForm } from './CreateFieldForm';
import type { Field, Game } from '@/types/game';

interface FieldsTabProps {
  fields: Field[];
  games: Game[];
  fieldName: string;
  fieldLocation: string;
  onFieldNameChange: (value: string) => void;
  onFieldLocationChange: (value: string) => void;
  onCreateField: () => void;
}

export const FieldsTab: React.FC<FieldsTabProps> = ({
  fields,
  games,
  fieldName,
  fieldLocation,
  onFieldNameChange,
  onFieldLocationChange,
  onCreateField
}) => {
  return (
    <div className="space-y-6">
      <CreateFieldForm
        fieldName={fieldName}
        fieldLocation={fieldLocation}
        onFieldNameChange={onFieldNameChange}
        onFieldLocationChange={onFieldLocationChange}
        onSubmit={onCreateField}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {fields.map((field) => (
          <FieldCard
            key={field.id}
            field={field}
            gameCount={games.filter(g => g.field_id === field.id).length}
          />
        ))}
      </div>

      {fields.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No fields created yet. Create your first field above!</p>
        </div>
      )}
    </div>
  );
};
