import { Common } from "./clevertap.common";
import { CleverTap as CleverTapInterface } from "./";
import {	
  on as onApplicationEvent,	
  launchEvent	
} from "tns-core-modules/application";

declare const CleverTap;

export class CleverTapImpl extends Common implements CleverTapInterface {
  constructor() {
    super();
    CleverTap.autoIntegrate();	
  }

  register() {
    throw new Error("Method not implemented.");
  }

  updateProfile(profile: any) {
    CleverTap.sharedInstance().profilePush(profile);
  }

  pushEvent(event: string, eventMeta: any) {
    CleverTap.sharedInstance().recordEventWithProps(event, eventMeta);
  }

  pushChargedEvent(chargeDetails: any, items: any) {
    CleverTap.sharedInstance().recordChargedEventWithDetailsAndItems(
      chargeDetails,
      items
    );
  }

  onUserLogin(profile: any) {
    CleverTap.sharedInstance().onUserLogin(profile);
  }

  profileGetProperty(propertyName: string) {
    return CleverTap.sharedInstance().profileGet(propertyName);
  }

  public async setLocation() {
  }

  public pushFcmRegistrationId(fcmRegId) {
    throw new Error("Method not implemented on iOS.");
  }

  public handleMessage(message): boolean {
    throw new Error("Method not implemented.");
  }

  public createNotificationChannel() {
  }
}

export const cleverTap = new CleverTapImpl();
