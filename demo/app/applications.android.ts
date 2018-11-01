import { cleverTap } from "nativescript-clevertap";

@JavaProxy("org.myApp.Application")
class Application extends android.app.Application {
    public onCreate(): void {
        cleverTap.register();
        super.onCreate();
    }

}