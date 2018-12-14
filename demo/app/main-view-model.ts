import { Observable } from "tns-core-modules/data/observable";
import { cleverTap } from "nativescript-clevertap";

export class HelloWorldModel extends Observable {
  public message: string;
  public userId : string;

  constructor() {
    super();
    this.onGetUserIdTapped();
  }

  onLoginTapped() {
    cleverTap.onUserLogin({
      Name: "Harsha Nutal",
      Date: new Date(),
      Identity: 112,
      Email: "harsha@webileapps.com"
    });
  }

  onGetUserIdTapped() {
    this.message = "Hello "+(cleverTap.profileGetProperty("Identity") ? cleverTap.profileGetProperty("Identity") : "Anonymous");
    // console.log(this.message);
  }

  onPushEventTapped() {
    cleverTap.pushEvent( "SampleEvent1", {
      SampleProp1 : "SampleValue"+ Math.round(1000 * Math.random())
    });
  }

  onPushChargedEventTapped() {
    const charge = {
      "Amount" : 300,
      "Payment mode": "Credit Card",
      "Charged ID": 24052013 
    };
    
    const item1 = {
      "Category": "books",
      "Book name": "The Millionaire next door",
      "Quantity": 1
    };
    
    const item2 = {
      "Category": "books",
      "Book name": "Achieving inner zen",
      "Quantity": 1
    };
    
    const item3 = {
      "Category": "books",
      "Book name": "Chuck it, let's do it",
      "Quantity": 5
    };
    cleverTap.pushChargedEvent( charge, [item1, item2, item3]);
  }

  onRegisterForPushNotifications() {
    UNUserNotificationCenter.currentNotificationCenter().requestAuthorizationWithOptionsCompletionHandler(UNAuthorizationOptions.Alert, null);
    UIApplication.sharedApplication.registerForRemoteNotifications();
  }
}
