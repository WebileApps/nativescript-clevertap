# NativeScript CleverTap Plugin

## Install and Integration
`tns plugin  add nativescript-cleartap`
### iOS
Add the following to your `Info.plist`.  under `app/App_Resources/iOS`
```plist
	<key>CleverTapAccountID</key>
	<string>YOUR-TEST-ACCOUNTID</string>
	<key>CleverTapToken</key>
	<string>YOUR-TEST-TOKEN</string>
```
### Android
Add the following to your `AndroidManifestxml`.  under `app/App_Resources/Android/src/main`
```
	<meta-data
		android:name="CLEVERTAP_ACCOUNT_ID"
		android:value="YOUR-TEST-ACCOUNTID>"/>

	<meta-data
		android:name="CLEVERTAP_TOKEN"
		android:value="YOUR-TEST-TOKEN"/>
```

## Additional Resources
- [CleverTap Android SDK Integration guide](https://support.clevertap.com/docs/android/getting-started.html)
- [CleverTap iOS SDK Integration guide](https://support.clevertap.com/docs/ios/getting-started.html)

## Example JS Usage
### Grab a reference  
`import { cleverTap } from 'clevertap-react-native';`

### Record an event  
`cleverTap.pushEvent('testEvent', { attr1 : "val1"});`

### Update a user profile  
`cleverTap.updateProfile({'Name': 'testUserA1', 'Identity': '123456', 'Email': 'test@test.com', 'custom1': 123});`

### For more: 
 - [see the included Example Project](demo)
 - [see the CleverTap TS interface](src/index.d.ts)

### Road Ahead:
Implement all the methods that are available in the sdk. 

Pull requests are always welcome!

## License

Apache License Version 2.0, January 2004