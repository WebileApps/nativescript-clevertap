export interface CleverTap {
  register();
  
  updateProfile(profile);

  pushEvent(event: string, eventMeta : any);

  pushChargedEvent(chargeDetails : any, items : any[]);

  onUserLogin(profile);

  profileGetProperty(propertyName : string);

  setLocation(): Promise<void>;

  pushFcmRegistrationId(fcmRegId);

  handleMessage(message): boolean;

  createNotificationChannel({ channelId, name, description, importance, showBadge });
}

export const cleverTap: CleverTap;