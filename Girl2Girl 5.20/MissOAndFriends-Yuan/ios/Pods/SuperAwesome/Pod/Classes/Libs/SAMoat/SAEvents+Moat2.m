#import "SAEvents+Moat2.h"
#import <SUPMoatMobileAppKit/SUPMoatMobileAppKit.h>
#import <WebKit/WebKit.h>

#define MOAT_SERVER                 @"https://z.moatads.com"
#define MOAT_URL                    @"moatad.js"
#define MOAT_DISPLAY_PARTNER_CODE   @"superawesomeinappdisplay731223424656"
#define MOAT_VIDEO_PARTNER_CODE     @"superawesomeinappvideo467548716573"

@interface SAMoatModule () <SUPMoatTrackerDelegate, SUPMoatVideoTrackerDelegate>
@end

@implementation SAMoatModule (Moat)

+ (void) internalInitMoat: (BOOL) loggingEnabled {
    
    SUPMoatOptions *options = [[SUPMoatOptions alloc] init];
    options.locationServicesEnabled = false;
    options.IDFACollectionEnabled = false;
    options.debugLoggingEnabled = loggingEnabled;
    SUPMoatAnalytics *analytics = [SUPMoatAnalytics sharedInstance];
    [analytics startWithOptions:options];
}

- (NSString*) internalStartMoatTrackingForDisplay:(WKWebView*)webView
                                  andAdDictionary:(NSDictionary*)adDict {
    
    self.webTracker = [SUPMoatWebTracker trackerWithWebComponent:webView];
    self.webTracker.trackerDelegate = self;
    BOOL result = [self.webTracker startTracking];
    
    NSMutableString *moatQuery = [[NSMutableString alloc] init];
    [moatQuery appendFormat:@"moatClientLevel1=%@", [adDict objectForKey:@"advertiser"]];
    [moatQuery appendFormat:@"&moatClientLevel2=%@", [adDict objectForKey:@"campaign"]];
    [moatQuery appendFormat:@"&moatClientLevel3=%@", [adDict objectForKey:@"line_item"]];
    [moatQuery appendFormat:@"&moatClientLevel4=%@", [adDict objectForKey:@"creative"]];
    [moatQuery appendFormat:@"&moatClientSlicer1=%@", [adDict objectForKey:@"app"]];
    [moatQuery appendFormat:@"&moatClientSlicer2=%@", [adDict objectForKey:@"placement"]];
    [moatQuery appendFormat:@"&moatClientSlicer3=%@", [adDict objectForKey:@"publisher"]];
    
    NSString *stringResult = [NSString stringWithFormat:
            @"<script src=\"%@/%@/%@?%@\" type=\"text/javascript\"></script>",
            MOAT_SERVER,
            MOAT_DISPLAY_PARTNER_CODE,
            MOAT_URL,
            moatQuery];
    
    NSLog(@"SuperAwesome-Moat Started Moat web stracking with result %d and JS tag %@", result, stringResult);
    
    return stringResult;
}

- (BOOL) internalStopMoatTrackingForDisplay {
    if (self.webTracker) {
        [self.webTracker stopTracking];
        NSLog(@"SuperAwesome-Moat Stoped Moat web tracking");
        return true;
    } else {
        NSLog(@"SuperAwesome-Moat Failed to stop Moat web tracking because webTracker is null");
        return false;
    }
}

- (BOOL) internalStartMoatTrackingForVideoPlayer:(AVPlayer*)player
                                       withLayer:(AVPlayerLayer*)layer
                                         andView:(UIView*)view
                                 andAdDictionary:(NSDictionary*)adDict {
    
    NSDictionary *moatDictionary = @{
                                     @"level1": [adDict objectForKey:@"advertiser"],
                                     @"level2": [adDict objectForKey:@"campaign"],
                                     @"level3": [adDict objectForKey:@"line_item"],
                                     @"level4": [adDict objectForKey:@"creative"],
                                     @"slicer1": [adDict objectForKey:@"app"],
                                     @"slicer2": [adDict objectForKey:@"placement"],
                                     @"slicer3": [adDict objectForKey:@"publisher"]
                                     };

    self.avVideoTracker = [SUPMoatAVVideoTracker trackerWithPartnerCode:MOAT_VIDEO_PARTNER_CODE];
    self.avVideoTracker.trackerDelegate = self;
    self.avVideoTracker.videoTrackerDelegate = self;
    BOOL result = [self.avVideoTracker trackVideoAd:moatDictionary player:player layer:layer];
    NSLog(@"SuperAwesome-Moat Started Moat video tracking with result %d", result);
    return result;
}

- (BOOL) internalStopMoatTrackingForVideoPlayer {
    if (self.avVideoTracker) {
        [self.avVideoTracker stopTracking];
        NSLog(@"SuperAwesome-Moat Stoped Moat video tracking");
        return true;
    } else {
        NSLog(@"SuperAwesome-Moat Failed to stop Moat video tracking because videoTracker is null");
        return false;
    }
}

- (void)trackerStartedTracking:(SUPMoatBaseTracker *)tracker {
    NSLog(@"SuperAwesome-Moat Tracker %@ started tracking", tracker);
}

- (void)trackerStoppedTracking:(SUPMoatBaseTracker *)tracker {
    NSLog(@"SuperAwesome-Moat Tracker %@ stopped tracking", tracker);
}

- (void)tracker:(SUPMoatBaseTracker *)tracker
failedToStartTracking:(SUPMoatStartFailureType)type
         reason:(NSString *)reason {
    NSLog(@"SuperAwesome-Moat Tracker %@ failed to start tracking because %@", tracker, reason);
}

- (void)tracker:(SUPMoatBaseVideoTracker *)tracker
sentAdEventType:(SUPMoatAdEventType)adEventType {
    NSLog(@"SuperAwesome-Moat Tracker %@ sending event %lu", tracker, (unsigned long)adEventType);
}

@end
