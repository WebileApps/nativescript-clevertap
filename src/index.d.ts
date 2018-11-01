export interface CleverTap {
  register();
  
  updateProfile(profile);

  pushEvent(event);

  onUserLogin(profile);
}

export const cleverTap: CleverTap;