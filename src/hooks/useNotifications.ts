import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface NotificationSubscription {
  id: string;
  user_id?: string;
  field_id?: string;
  game_id?: string;
  event_types: string[];
  push_endpoint?: string;
  push_keys?: any;
  is_active: boolean;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<NotificationSubscription[]>([]);
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Check if notifications are supported
    setIsSupported('Notification' in window && 'serviceWorker' in navigator);
    setPermission(Notification.permission);
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) return false;

    const result = await Notification.requestPermission();
    setPermission(result);
    return result === 'granted';
  };

  const subscribe = async (fieldId?: string, gameId?: string, eventTypes: string[] = ['penalty_end', 'goal']) => {
    if (!user || !isSupported || permission !== 'granted') return;

    try {
      // Register service worker if not already registered
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: 'your-vapid-public-key' // You'll need to add this
      });

      // Save subscription to database
      const { error } = await supabase
        .from('notification_subscriptions')
        .insert([{
          user_id: user.id,
          field_id: fieldId,
          game_id: gameId,
          event_types: eventTypes,
          push_endpoint: subscription.endpoint,
          push_keys: subscription.toJSON()
        }]);

      if (error) throw error;

      await fetchSubscriptions();
      
      return true;
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
      return false;
    }
  };

  const unsubscribe = async (subscriptionId: string) => {
    try {
      const { error } = await supabase
        .from('notification_subscriptions')
        .update({ is_active: false })
        .eq('id', subscriptionId);

      if (error) throw error;
      await fetchSubscriptions();
    } catch (error) {
      console.error('Error unsubscribing:', error);
    }
  };

  const fetchSubscriptions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notification_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) throw error;
      setSubscriptions(data || []);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSubscriptions();
    }
  }, [user]);

  return {
    isSupported,
    permission,
    subscriptions,
    requestPermission,
    subscribe,
    unsubscribe
  };
};
