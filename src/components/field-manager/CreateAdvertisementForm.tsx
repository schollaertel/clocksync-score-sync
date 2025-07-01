
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import type { Field } from '@/types/game';

interface CreateAdvertisementFormProps {
  fields: Field[];
  selectedField: Field | null;
  advertiserName: string;
  monthlyRate: string;
  position: string;
  onFieldSelect: (field: Field | null) => void;
  onAdvertiserNameChange: (value: string) => void;
  onMonthlyRateChange: (value: string) => void;
  onPositionChange: (value: string) => void;
  onSubmit: () => void;
}

export const CreateAdvertisementForm: React.FC<CreateAdvertisementFormProps> = ({
  fields,
  selectedField,
  advertiserName,
  monthlyRate,
  position,
  onFieldSelect,
  onAdvertiserNameChange,
  onMonthlyRateChange,
  onPositionChange,
  onSubmit
}) => {
  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Create Advertisement
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-gray-300">Select Field</Label>
          <Select value={selectedField?.id || ''} onValueChange={(value) => 
            onFieldSelect(fields.find(f => f.id === value) || null)
          }>
            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
              <SelectValue placeholder="Choose a field" />
            </SelectTrigger>
            <SelectContent>
              {fields.map((field) => (
                <SelectItem key={field.id} value={field.id}>
                  {field.name} - {field.location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="adName" className="text-gray-300">Advertiser Name</Label>
            <Input
              id="adName"
              value={advertiserName}
              onChange={(e) => onAdvertiserNameChange(e.target.value)}
              placeholder="Company or sponsor name"
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>
          <div>
            <Label htmlFor="adRate" className="text-gray-300">Monthly Rate ($)</Label>
            <Input
              id="adRate"
              type="number"
              value={monthlyRate}
              onChange={(e) => onMonthlyRateChange(e.target.value)}
              placeholder="400"
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>
          <div>
            <Label className="text-gray-300">Position</Label>
            <Select value={position} onValueChange={onPositionChange}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="primary">Primary</SelectItem>
                <SelectItem value="secondary">Secondary</SelectItem>
                <SelectItem value="banner">Banner</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={onSubmit} className="bg-purple-600 hover:bg-purple-700">
          Create Advertisement
        </Button>
      </CardContent>
    </Card>
  );
};
