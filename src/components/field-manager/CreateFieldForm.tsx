
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';

interface CreateFieldFormProps {
  fieldName: string;
  fieldLocation: string;
  onFieldNameChange: (value: string) => void;
  onFieldLocationChange: (value: string) => void;
  onSubmit: () => void;
}

export const CreateFieldForm: React.FC<CreateFieldFormProps> = ({
  fieldName,
  fieldLocation,
  onFieldNameChange,
  onFieldLocationChange,
  onSubmit
}) => {
  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Create New Field
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="fieldName" className="text-gray-300">Field Name</Label>
            <Input
              id="fieldName"
              value={fieldName}
              onChange={(e) => onFieldNameChange(e.target.value)}
              placeholder="Enter field name"
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>
          <div>
            <Label htmlFor="fieldLocation" className="text-gray-300">Location</Label>
            <Input
              id="fieldLocation"
              value={fieldLocation}
              onChange={(e) => onFieldLocationChange(e.target.value)}
              placeholder="Enter field location"
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>
        </div>
        <Button onClick={onSubmit} className="bg-green-600 hover:bg-green-700">
          Create Field
        </Button>
      </CardContent>
    </Card>
  );
};
