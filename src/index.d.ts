export interface CleverTap {
  register();
  
  updateProfile(profile);

  pushEvent(event: string, eventMeta : any);

  pushChargedEvent(chargeDetails : any, items : any[]);

  onUserLogin(profile);

  profileGetProperty(propertyName : string);
}

export const cleverTap: CleverTap;