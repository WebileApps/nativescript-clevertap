import { Common } from "./clevertap.common";
import * as utils from "tns-core-modules/utils/utils";

declare const com: any;
const CleverTapSdk = com.clevertap.android.sdk;
const CleverTapAPI = CleverTapSdk.CleverTapAPI;
const HashMap = java.util.HashMap;
const ArrayList = java.util.ArrayList;
export class CleverTap extends Common {
  public register() {
    CleverTapSdk.ActivityLifecycleCallback.register(utils.ad.getApplication());
  }

  get instance() {
    return CleverTapAPI.getDefaultInstance(utils.ad.getApplicationContext());
  }

  public updateProfile(profile) {
    this.instance.pushProfile(getHashMap(profile));
  }

  public pushEvent(event, eventMeta) {
    if (eventMeta) {
      this.instance.event.push(event, getHashMap(eventMeta));
    } else {
      this.instance.event.push(event);
    }
  }

  public pushChargedEvent(chargeDetails, items) {
    this.instance.event.push(
      CleverTapAPI.CHARGED_EVENT,
      getHashMap(chargeDetails),
      getArrayList(items)
    );
  }

  public onUserLogin(profile) {
    this.instance.onUserLogin(getHashMap(profile));
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
  return typeof value === "object";
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
