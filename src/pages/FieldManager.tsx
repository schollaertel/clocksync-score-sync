
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, MapPin } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { QRCodeGenerator } from '@/components/QRCodeGenerator';
import { useToast } from '@/hooks/use-toast';

interface Field {
  id: string;
  name: string;
  location: string;
  qr_code: string;
  created_at: string;
}

const FieldManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [fields, setFields] = useState<Field[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingField, setEditingField] = useState<Field | null>(null);
  const [newField, setNewField] = useState({ name: '', location: '' });
  const [showNewFieldForm, setShowNewFieldForm] = useState(false);

  useEffect(() => {
    if (user) {
      fetchFields();
    }
  }, [user]);

  const fetchFields = async () => {
    try {
      const { data, error } = await supabase
        .from('fields')
        .select('*')
        .eq('organization_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFields(data || []);
    } catch (error) {
      console.error('Error fetching fields:', error);
      toast({
        title: "Error",
        description: "Failed to load fields",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createField = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newField.name || !newField.location) return;

    try {
      const fieldId = crypto.randomUUID();
      const spectatorUrl = `${window.location.origin}/spectator?field=${fieldId}`;
      
      const { error } = await supabase
        .from('fields')
        .insert({
          id: fieldId,
          name: newField.name,
          location: newField.location,
          organization_id: user?.id,
          qr_code: spectatorUrl,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Field created successfully",
      });
      
      setNewField({ name: '', location: '' });
      setShowNewFieldForm(false);
      fetchFields();
    } catch (error) {
      console.error('Error creating field:', error);
      toast({
        title: "Error",
        description: "Failed to create field",
        variant: "destructive",
      });
    }
  };

  const updateField = async (field: Field) => {
    try {
      const { error } = await supabase
        .from('fields')
        .update({
          name: field.name,
          location: field.location,
        })
        .eq('id', field.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Field updated successfully",
      });
      
      setEditingField(null);
      fetchFields();
    } catch (error) {
      console.error('Error updating field:', error);
      toast({
        title: "Error",
        description: "Failed to update field",
        variant: "destructive",
      });
    }
  };

  const deleteField = async (fieldId: string) => {
    if (!confirm('Are you sure you want to delete this field?')) return;

    try {
      const { error } = await supabase
        .from('fields')
        .delete()
        .eq('id', fieldId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Field deleted successfully",
      });
      
      fetchFields();
    } catch (error) {
      console.error('Error deleting field:', error);
      toast({
        title: "Error",
        description: "Failed to delete field",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading fields...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Field Management</h1>
          <Button 
            onClick={() => setShowNewFieldForm(true)}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Field
          </Button>
        </div>

        {/* New Field Form */}
        {showNewFieldForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Create New Field</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={createField} className="space-y-4">
                <div>
                  <Label htmlFor="name">Field Name</Label>
                  <Input
                    id="name"
                    value={newField.name}
                    onChange={(e) => setNewField(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter field name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={newField.location}
                    onChange={(e) => setNewField(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Enter field location"
                    required
                  />
                </div>
                <div className="flex space-x-2">
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                    Create Field
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowNewFieldForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Fields Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fields.map((field) => (
            <Card key={field.id} className="relative">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    {editingField?.id === field.id ? (
                      <div className="space-y-2">
                        <Input
                          value={editingField.name}
                          onChange={(e) => setEditingField(prev => prev ? { ...prev, name: e.target.value } : null)}
                          className="font-semibold"
                        />
                        <Input
                          value={editingField.location}
                          onChange={(e) => setEditingField(prev => prev ? { ...prev, location: e.target.value } : null)}
                          className="text-sm"
                        />
                      </div>
                    ) : (
                      <>
                        <CardTitle className="text-xl">{field.name}</CardTitle>
                        <div className="flex items-center text-gray-600 text-sm">
                          <MapPin className="w-4 h-4 mr-1" />
                          {field.location}
                        </div>
                      </>
                    )}
                  </div>
                  <div className="flex space-x-1">
                    {editingField?.id === field.id ? (
                      <>
                        <Button
                          size="sm"
                          onClick={() => updateField(editingField)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingField(null)}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingField(field)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteField(field.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="text-center">
                <QRCodeGenerator 
                  value={field.qr_code} 
                  size={150}
                  className="mb-4"
                />
                <p className="text-sm text-gray-600">
                  Spectators scan this QR code to view live games
                </p>
                <Button 
                  className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => window.open(field.qr_code, '_blank')}
                >
                  Preview Spectator View
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {fields.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No fields yet</h3>
            <p className="text-gray-600 mb-4">Create your first field to start managing games and sponsors</p>
            <Button 
              onClick={() => setShowNewFieldForm(true)}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Field
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FieldManager;
