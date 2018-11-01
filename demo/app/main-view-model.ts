import { Observable } from "tns-core-modules/data/observable";
import { cleverTap } from "nativescript-clevertap";

export class HelloWorldModel extends Observable {
  public message: string;

  constructor() {
    super();
    this.message = "Hello World";
    cleverTap.onUserLogin({
      Name: "Alex",
      Date: new Date(),
      Identity: 111,
      Email: "alex@helloworld.com"
    });
  }
}
