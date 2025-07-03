import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building, Trophy, User } from 'lucide-react';
import type { OrganizationType } from '@/types/auth';

interface OrganizationTypeSelectorProps {
  value: OrganizationType;
  onChange: (value: OrganizationType) => void;
  disabled?: boolean;
}

export const OrganizationTypeSelector: React.FC<OrganizationTypeSelectorProps> = ({
  value,
  onChange,
  disabled = false
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="orgType" className="text-gray-300">Organization Type</Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
          <SelectValue placeholder="Select organization type" />
        </SelectTrigger>
        <SelectContent className="bg-slate-700 border-slate-600">
          <SelectItem value="facility" className="text-white">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4" />
              <div>
                <div>Sports Facility</div>
                <div className="text-xs text-gray-400">Permanent fields, permanent QR codes</div>
              </div>
            </div>
          </SelectItem>
          <SelectItem value="tournament_company" className="text-white">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              <div>
                <div>Tournament Company</div>
                <div className="text-xs text-gray-400">Traveling events, flexible QR codes</div>
              </div>
            </div>
          </SelectItem>
          <SelectItem value="individual" className="text-white">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <div>
                <div>Individual/Other</div>
                <div className="text-xs text-gray-400">Personal use, standard features</div>
              </div>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
