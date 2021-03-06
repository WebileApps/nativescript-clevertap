import { Common } from "./clevertap.common";
import { CleverTap as CleverTapInterface } from "./";
import * as utils from "tns-core-modules/utils/utils";

declare const com: any;
const CleverTapSdk = com.clevertap.android.sdk;
const CleverTapAPI = CleverTapSdk.CleverTapAPI;
const HashMap = java.util.HashMap;
const ArrayList = java.util.ArrayList;

export class CleverTap extends Common implements CleverTapInterface {
  profileGetProperty(propertyName: string) {
    return this.instance.getProperty(propertyName);
  }

  public register() {
    CleverTapSdk.ActivityLifecycleCallback.register(utils.ad.getApplication());
  }

  get instance() {
    return CleverTapAPI.getDefaultInstance(utils.ad.getApplicationContext());
  }

  public createNotificationChannel({
    channelId = "Clevertap",
    name = "Clevertap",
    description = "Clevertap",
    importance = 5,
    showBadge = true
  }) {
    CleverTapAPI.createNotificationChannel(
      utils.ad.getApplicationContext(),
      channelId,
      name,
      description,
      importance,
      showBadge
    );
  }

  public updateProfile(profile) {
    this.instance.pushProfile(getHashMap(profile));
  }

  public pushEvent(event, eventData) {
    if (eventData) {
      this.instance.pushEvent(event, getHashMap(eventData));
    } else {
      this.instance.pushEvent(event);
    }
  }

  public pushChargedEvent(chargeDetails, items) {
    this.instance.pushChargedEvent(
      getHashMap(chargeDetails),
      getArrayList(items)
    );
  }

  public onUserLogin(profile) {
    this.instance.onUserLogin(getHashMap(profile));
  }

  public async setLocation() {
    // try {
    //   await enableLocation();
    //   this.instance.setLocation(this.instance.getLocation());
    // } catch (error) {
    //   console.log("Error ", error);
    // }
  }

  public pushFcmRegistrationId(fcmRegId) {
    this.instance.pushFcmRegistrationId(fcmRegId, true);
  }

  public handleMessage(message): boolean {
    const extras = new android.os.Bundle();
    Object.keys(message).forEach(key => {
      extras.putString(key, message[key]);
    });
    const info = CleverTapAPI.getNotificationInfo(extras);
    if (info.fromCleverTap) {
      CleverTapAPI.createNotification(utils.ad.getApplicationContext(), extras);
      return true;
    }
    return false;
  }
}

export const cleverTap = new CleverTap();

const getArrayList = items => {
  const arrayList = new ArrayList();
  items.forEach(item => {
    arrayList.add(getHashMap(item));
  });
  return arrayList;
};

const getHashMap = ob => {
  const hashMap = new HashMap();
  Object.keys(ob).forEach(key => {
    hashMap.put(key, getNativeValue(ob[key]));
  });
  return hashMap;
};

const getNativeValue = value => {
  return [
    { predicate: isString, converter: value => value },
    { predicate: isObject, converter: value => getHashMap(value) },
    { predicate: isString, converter: value => value },
    {
      predicate: isDate,
      converter: (date: Date) => new java.util.Date(date.valueOf())
    },
    { predicate: isInt, converter: value => java.lang.Integer.valueOf(value) },
    { predicate: isFloat, converter: value => java.lang.Float.valueOf(value) }
  ]
    .find(({ predicate }) => predicate(value))
    .converter(value);
};

function isDate(date) {
  return date instanceof Date;
}

function isString(value) {
  return typeof value === "string";
}

function isObject(value) {
  return !isDate(value) && typeof value === "object";
}

// Taken from https://stackoverflow.com/a/20779354/4694010
function isInt(nVal) {
  return (
    typeof nVal === "number" &&
    isFinite(nVal) &&
    nVal > -9007199254740992 &&
    nVal < 9007199254740992 &&
    Math.floor(nVal) === nVal
  );
}

function isFloat(nVal) {
  return (
    typeof nVal === "number" &&
    isFinite(nVal) &&
    nVal > -9007199254740992 &&
    nVal < 9007199254740992 &&
    Math.floor(nVal) !== nVal
  );
}
