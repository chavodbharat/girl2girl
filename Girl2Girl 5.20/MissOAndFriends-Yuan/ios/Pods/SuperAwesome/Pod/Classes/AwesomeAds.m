
#import "AwesomeAds.h"
#import "SAEvents.h"
#import "SAFileDownloader.h"

#if defined(__has_include)
#if __has_include(<SuperAwesomeUnity/SuperAwesomeUnity-Swift.h>)
#import <SuperAwesomeUnity/SuperAwesomeUnity-Swift.h>
#else
//#import "SuperAwesomeUnity-Swift.h"
#endif
#endif

#if defined(__has_include)
#if __has_include(<SuperAwesome/SuperAwesome-Swift.h>)
#import <SuperAwesome/SuperAwesome-Swift.h>
#else
#import "SuperAwesome-Swift.h"
#endif
#endif

static BOOL isInitialised = false;

@implementation AwesomeAds

+ (void) initSDK: (BOOL) loggingEnabled {
    if (!isInitialised) {
        NSLog(@"Initialising AwesomeAds");
        [SAEvents initMoat: loggingEnabled];
        [SAFileDownloader cleanup];
        [SADependencyContainer initModules: SAModuleContainer.new];
        isInitialised = true;
    } else {
        NSLog(@"Already initialised AwesomeAds");
    }
}

+ (void) triggerAgeCheck: (NSString*) age response:(GetIsMinorBlock)response {
    [[SAAgeCheck sdk] getIsMinor:age :response];
}

@end
