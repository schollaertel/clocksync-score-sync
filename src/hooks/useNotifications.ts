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

// Your real VAPID public key
const VAPID_PUBLIC_KEY = 'BGRUptM9YKDXZWQ_64h_KmmSGTPZZtw5l-Z6Ym5ijBNvtmG2yZ3inqgHj59OiDz4su1hA7pHLk6N0qHNs_AofxY';

export const useNotifications = () => {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<NotificationSubscription[]>([]);
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Check if notifications are supported
    setIsSupported('Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window);
    setPermission(Notification.permission);
    
    // Register service worker on component mount
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('Service Worker registered:', registration);
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) {
      console.warn('Push notifications not supported');
      return false;
    }

    const result = await Notification.requestPermission();
    setPermission(result);
    return result === 'granted';
  };

  const subscribe = async (fieldId?: string, gameId?: string, eventTypes: string[] = ['penalty_end', 'goal']) => {
    if (!user || !isSupported || permission !== 'granted') {
      console.warn('Cannot subscribe - user, support, or permission issue');
      return false;
    }

    try {
      // Get or register service worker
      let registration = await navigator.serviceWorker.getRegistration('/sw.js');
      if (!registration) {
        registration = await navigator.serviceWorker.register('/sw.js');
      }

      // Convert VAPID key from base64 to Uint8Array
      const urlBase64ToUint8Array = (base64String: string) => {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
          .replace(/-/g, '+')
          .replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
          outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
      };

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
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
      console.log('Push notification subscription successful');
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
