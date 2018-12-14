#!/usr/bin/ruby
def addTarget (projectPath, parentBundleIdentifier)
    puts 'Project path ' << projectPath
    puts 'Parent bundle identifer ' << parentBundleIdentifier
    require 'xcodeproj'
    project = Xcodeproj::Project.open(projectPath)
    
    appExtensionExists = project.targets.collect {|target| target.name }.include? 'NotificationExtension'
    if appExtensionExists
        puts 'App Extension already added'
        return
    else
        puts 'Adding Extension to your workspace'
    end

    createInfoPlist projectPath
    
    group = project.new_group('NotificationExtension', './NotificationExtension')
    group.new_reference('./CTNotificationServiceExtension.h');
    notifService = group.new_reference('./CTNotificationServiceExtension.m');
    group.new_reference('./Info.plist');
    
    target = project.targets.first
    nativeTarget = project.new_target(:app_extension, 'NotificationExtension', :ios)
    nativeTarget.build_configuration_list.set_setting('INFOPLIST_FILE', "NotificationExtension/Info.plist")
    nativeTarget.build_configuration_list.set_setting('PRODUCT_NAME', "NotificationExtension")
    nativeTarget.build_configuration_list.set_setting('IPHONEOS_DEPLOYMENT_TARGET', "10.0")
    nativeTarget.build_configuration_list.set_setting('SKIP_INSTALL', "YES")
    nativeTarget.build_configuration_list.set_setting('LD_RUNPATH_SEARCH_PATHS', '$(inherited) @executable_path/Frameworks @executable_path/../../Frameworks')
    
    nativeTarget.build_configuration_list.set_setting('PRODUCT_BUNDLE_IDENTIFIER', parentBundleIdentifier+".NotificationExtension")
    nativeTarget.build_configuration_list.set_setting('DEVELOPMENT_TEAM', '48WQ3KY646')
    
    nativeTarget.add_file_references([notifService])
    
    # Try to embed binary.
    target.add_dependency(nativeTarget)
    
    phase = target.new_copy_files_build_phase("Embed App Extensions")
    phase.dst_subfolder_spec = '13'
    phase.add_file_reference(nativeTarget.product_reference)
    
    project.save
    puts 'Added extension and saved XCodeProj'
end

InfoPlist = <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
<key>CFBundleDevelopmentRegion</key>
<string>en</string>
<key>CFBundleDisplayName</key>
<string>NotificationService</string>
<key>CFBundleExecutable</key>
<string>$(EXECUTABLE_NAME)</string>
<key>CFBundleIdentifier</key>
<string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>
<key>CFBundleInfoDictionaryVersion</key>
<string>6.0</string>
<key>CFBundleName</key>
<string>$(PRODUCT_NAME)</string>
<key>CFBundlePackageType</key>
<string>XPC!</string>
<key>CFBundleShortVersionString</key>
<string>1.0</string>
<key>CFBundleVersion</key>
<string>1</string>
<key>NSExtension</key>
<dict>
    <key>NSExtensionPointIdentifier</key>
    <string>com.apple.usernotifications.service</string>
    <key>NSExtensionPrincipalClass</key>
    <string>CTNotificationServiceExtension</string>
</dict>
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <true/>
</dict>
</dict>
</plist>
EOF

CTNotificationServiceExtensionImpl = <<EOF

#import "CTNotificationServiceExtension.h"

static NSString * const kMediaUrlKey = @"ct_mediaUrl";
static NSString * const kMediaTypeKey = @"ct_mediaType";

static NSString * const kImage = @"image";
static NSString * const kVideo = @"video";
static NSString * const kAudio = @"audio";

@interface CTNotificationServiceExtension()

@property (nonatomic, strong) void (^contentHandler)(UNNotificationContent *contentToDeliver);
@property (nonatomic, strong) UNMutableNotificationContent *bestAttemptContent;

@end

@implementation CTNotificationServiceExtension

- (void)didReceiveNotificationRequest:(UNNotificationRequest *)request withContentHandler:(void (^)(UNNotificationContent * _Nonnull))contentHandler {
    
    self.contentHandler = contentHandler;
    self.bestAttemptContent = [request.content mutableCopy];
    
    NSDictionary *userInfo = request.content.userInfo;
    if (userInfo == nil) {
        [self contentComplete];
        return;
    }
    
    NSString *mediaUrlKey = self.mediaUrlKey ? self.mediaUrlKey : kMediaUrlKey;
    NSString *mediaTypeKey = self.mediaTypeKey ? self.mediaTypeKey : kMediaTypeKey;
    
    NSString *mediaUrl = userInfo[mediaUrlKey];
    NSString *mediaType = userInfo[mediaTypeKey];
    
    if (mediaUrl == nil || mediaType == nil) {
#ifdef DEBUG
        if (mediaUrl == nil) {
             NSLog(@"unable to add attachment: %@ is nil", mediaUrlKey);
        }
        
        if (mediaType == nil) {
            NSLog(@"unable to add attachment: %@ is nil", mediaTypeKey);
        }
       
#endif
        [self contentComplete];
        return;
    }
    
    // load the attachment
    [self loadAttachmentForUrlString:mediaUrl
                            withType:mediaType
                   completionHandler:^(UNNotificationAttachment *attachment) {
                       if (attachment) {
                           self.bestAttemptContent.attachments = [NSArray arrayWithObject:attachment];
                       }
                       [self contentComplete];
                   }];
    
}

- (void)serviceExtensionTimeWillExpire {
    [self contentComplete];
}

- (void)contentComplete {
    self.contentHandler(self.bestAttemptContent);
}

- (NSString *)fileExtensionForMediaType:(NSString *)type {
    NSString *ext = type;
    
    if ([type isEqualToString:kImage]) {
        ext = @"jpg";
    }
    
    if ([type isEqualToString:kVideo]) {
        ext = @"mp4";
    }
    
    if ([type isEqualToString:kAudio]) {
        ext = @"mp3";
    }
    
    return [@"." stringByAppendingString:ext];
}

- (void)loadAttachmentForUrlString:(NSString *)urlString withType:(NSString *)type
                 completionHandler:(void(^)(UNNotificationAttachment *))completionHandler  {
    
    __block UNNotificationAttachment *attachment = nil;
    NSURL *attachmentURL = [NSURL URLWithString:urlString];
    NSString *fileExt = [self fileExtensionForMediaType:type];
    
    NSURLSession *session = [NSURLSession sessionWithConfiguration:[NSURLSessionConfiguration defaultSessionConfiguration]];
    [[session downloadTaskWithURL:attachmentURL
                completionHandler:^(NSURL *temporaryFileLocation, NSURLResponse *response, NSError *error) {
                    if (error != nil) {
                        #ifdef DEBUG
                        NSLog(@"unable to add attachment: %@", error.localizedDescription);
                        #endif
                    } else {
                        NSFileManager *fileManager = [NSFileManager defaultManager];
                        NSURL *localURL = [NSURL fileURLWithPath:[temporaryFileLocation.path stringByAppendingString:fileExt]];
                        [fileManager moveItemAtURL:temporaryFileLocation toURL:localURL error:&error];
                        
                        NSError *attachmentError = nil;
                        attachment = [UNNotificationAttachment attachmentWithIdentifier:@"" URL:localURL options:nil error:&attachmentError];
                        if (attachmentError) {
                            #ifdef DEBUG
                            NSLog(@"unable to add attchment: %@", attachmentError.localizedDescription);
                            #endif
                        }
                    }
                    completionHandler(attachment);
                }] resume];
}

@end
EOF

CTNotificationServiceExtensionHeader = <<EOF
#import <UserNotifications/UserNotifications.h>

@interface CTNotificationServiceExtension : UNNotificationServiceExtension

@property (nonatomic, retain) NSString * _Nullable mediaUrlKey;
@property (nonatomic, retain) NSString * _Nullable mediaTypeKey;

NS_ASSUME_NONNULL_BEGIN

- (void)didReceiveNotificationRequest:(UNNotificationRequest *)request withContentHandler:(void (^)(UNNotificationContent * _Nonnull))contentHandler;

@end

NS_ASSUME_NONNULL_END
EOF

def createInfoPlist(xcodeProjPath)
    require 'fileutils'
    notificationDirPath = File.join(File.dirname(xcodeProjPath), 'NotificationExtension')
    unless File.directory?(notificationDirPath)
        FileUtils.mkdir_p(notificationDirPath)
        puts 'Created folder NotificationService '<< notificationDirPath
    end

    # Write Info.plist
    File.open(File.join(notificationDirPath, 'Info.plist').to_s, 'w') { |file| file.write(InfoPlist) }
    puts 'Wrote ' << File.join(notificationDirPath, 'Info.plist').to_s
    
    # Write CTNotificationServiceExtension.h
    File.open(File.join(notificationDirPath, 'CTNotificationServiceExtension.h').to_s, 'w') { |file| file.write(CTNotificationServiceExtensionHeader) }
    puts 'Wrote ' << File.join(notificationDirPath, 'CTNotificationServiceExtension.h').to_s
    
    # Write CTNotificationServiceExtension.m
    File.open(File.join(notificationDirPath, 'CTNotificationServiceExtension.m').to_s, 'w') { |file| file.write(CTNotificationServiceExtensionImpl) }
    puts 'Wrote ' << File.join(notificationDirPath, 'CTNotificationServiceExtension.m').to_s

end

if ARGV.length >= 2
    addTarget ARGV.shift, ARGV.shift
end