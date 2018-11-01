export interface CleverTap {
  register();
  
  updateProfile(profile);

  pushEvent(event, eventMeta);

  pushChargedEvent(chargeDetails, items);

  onUserLogin(profile);
}

export const cleverTap: CleverTap;