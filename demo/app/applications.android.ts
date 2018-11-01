import { cleverTap } from "nativescript-clevertap";

@JavaProxy("in.rowdyclub.Application")
class Application extends android.app.Application {
    public onCreate(): void {
        cleverTap.register();
        super.onCreate();
    }

}