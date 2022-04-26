//
//  PSMInterstitialAdViewManager.m
//  MissOAndFriends
//
//  Copyright © 2017 Pinsight Media. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "PSMInterstitialAdViewManager.h"
#import "SuperAwesomeSDK.h"

// class extension/anonymous category, to bring in PSMInterstitialAdDelegate delegation
@interface PSMInterstitialAdViewManager ()

@property (nonatomic, readonly) NSString *placementId;

@end

@implementation PSMInterstitialAdViewManager

RCT_EXPORT_MODULE(PSMInterstitialAdView)

- (id)init {
  if (self = [super init]) {
    
    [SAVideoAd setConfigurationProduction];
    
//#ifndef DEBUG
//#error Code for debugging only!
//#else
//#warning Code for debugging only!
//    [SAVideoAd enableTestMode];
//#endif
    [SAVideoAd setOrientationPortrait];
    [SAVideoAd enableCloseButton];
    [SAVideoAd enableCloseAtEnd];
  }
  return self;
}

-(NSString *)placementId {
  return @"moaf_int";
}

RCT_EXPORT_METHOD(show)
{
  dispatch_async(dispatch_get_main_queue(), ^{
//#ifndef DEBUG
//#error Code for debugging only!
//#else
//#warning Code for debugging only!
//    //TODO: replace with real ID;
//    const NSInteger interstitialPlacement = 30473; // Test ID!
//#endif
    const NSInteger interstitialPlacement = 39782;
    
    if ([SAVideoAd hasAdAvailable:interstitialPlacement]) {
      NSLog(@"MSO DEBUG: Interstitial show");
      UIViewController *topViewController = [UIApplication sharedApplication].windows.firstObject.rootViewController;
      [SAVideoAd play:interstitialPlacement fromVC:topViewController];
    }
    else {
      NSLog(@"MSO DEBUG: Interstitial load");
      [SAVideoAd load:interstitialPlacement];
    }
  });
}

+(BOOL)requiresMainQueueSetup {
  return YES;
}

@end
