//
//  PSMMrecAdViewManager.m
//  MissOAndFriends
//
//  Copyright © 2017 Pinsight Media. All rights reserved.
//

#import "PSMMrecAdViewManager.h"

#import <React/RCTBridge.h>
#import <React/RCTEventDispatcher.h>
#import <React/UIView+React.h>

//#import "SuperAwesomeSDK.h"
#import "SuperAwesome.h"

@interface PSMMrecAdViewManager ()

@end

@implementation PSMMrecAdViewManager

RCT_EXPORT_MODULE()

- (UIView *)view {
  SABannerAd *adView = [[SABannerAd alloc] init];
//#ifndef DEBUG
//#error Code for debugging only!
//#else
//#warning Code for debugging only!
//  [adView enableTestMode];
//#endif
  __weak SABannerAd *weakAdView = adView;
  [adView setCallback:^(NSInteger placementId, SAEvent event) {
    switch (event) {
      case adLoaded: {
        NSLog(@"MSO DEBUG: ad banner adLoaded");
        [weakAdView play];
        break;
      }
      case adEmpty: {
        NSLog(@"MSO DEBUG: ad banner adEmpty");
        break;
      }
      case adFailedToLoad: {
        NSLog(@"MSO DEBUG: ad banner adFailedToLoad");
        break;
      }
      case adAlreadyLoaded: {
        NSLog(@"MSO DEBUG: ad banner adAlreadyLoaded");
        break;
      }
      case adShown: {
        NSLog(@"MSO DEBUG: ad banner adShown");
        break;
      }
      case adFailedToShow: {
        NSLog(@"MSO DEBUG: ad banner adFailedToShow");
        break;
      }
      case adClicked: {
        NSLog(@"MSO DEBUG: ad banner adClicked");
        break;
      }
      case adEnded: {
        NSLog(@"MSO DEBUG: ad banner adEnded");
        break;
      }
      case adClosed: {
        NSLog(@"MSO DEBUG: ad banner adClosed");
        break;
      }
    }
  }];
  
  return adView;
}

RCT_CUSTOM_VIEW_PROPERTY(email, NSString, __unused SABannerAd)
{
  // do nothing, preserved for reasons of compatibility with the old PSMAdView wrapper.
}

#pragma mark - PMAdViewDelegate methods

- (NSDictionary *)adTargetingParameters {
  return @{};
}

@end
