import { isEnabled, enableLocationRequest } from "nativescript-geolocation";

export const enableLocation = async () => {
  try {
    if (!await isEnabled()) {
      await enableLocationRequest();
      return true;
    }
    return true;
  } catch (error) {
    return false;
  }
};
