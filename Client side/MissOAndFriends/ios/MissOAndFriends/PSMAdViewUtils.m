//
//  PSMAdViewUtils.m
//  MissOAndFriends
//
//  Created by stepan on 17/07/2018.
//  Copyright © 2018 Facebook. All rights reserved.
//

#import "PSMAdViewUtils.h"
#import <React/RCTUIManager.h>
#import <React/RCTUIManagerUtils.h>

#import "SuperAwesomeSDK.h"

@implementation PSMAdViewUtils

enum PSMAdViewUtilsAction {
  PSMAdViewUtilsActionStart,
  PSMAdViewUtilsActionResume,
  PSMAdViewUtilsActionPause
};

@synthesize bridge = _bridge;

RCT_EXPORT_MODULE(AdView)

RCT_EXPORT_METHOD(startAdView:(int)adViewId) {
  [self withView:adViewId action:PSMAdViewUtilsActionStart];
}

RCT_EXPORT_METHOD(resumeAdView:(int)adViewId) {
  [self withView:adViewId action:PSMAdViewUtilsActionResume];
}

RCT_EXPORT_METHOD(pauseAdView:(int)adViewId) {
  [self withView:adViewId action:PSMAdViewUtilsActionPause];
}

- (void)withView:(int)viewId action:(enum PSMAdViewUtilsAction)action {
  RCTUIManager *uiManager = self.bridge.uiManager;
  dispatch_async(RCTGetUIManagerQueue(), ^{
    [uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *,UIView *> *viewRegistry) {
      
      
      UIView *view = viewRegistry[@(viewId)];
      if ([view isKindOfClass:[SABannerAd class]]) {
        SABannerAd *adview = (SABannerAd *)view;
        
//#ifndef DEBUG
//#error Code for debugging only!
//#else
//#warning Code for debugging only!
//        const NSInteger mrecPlacementId = 30472; // test id!
//#endif
        const NSInteger mrecPlacementId = 39881;
        
        if (action == PSMAdViewUtilsActionStart) {
          NSLog(@"MSO DEBUG JS bridged call: Starting ad view %d", viewId);
          [adview load:mrecPlacementId];
        }
        else if (action == PSMAdViewUtilsActionResume) {
          NSLog(@"MSO DEBUG JS bridged call: Resuming ad view %d", viewId);
//          [adview start];
        }
        else {
          NSLog(@"MSO DEBUG JS bridged call: Pausing ad view %d", viewId);
//          [adview stop];
        }
      }
      else {
        NSLog(@"MSO DEBUG JS bridged call: Error: expected view %d to be instance of PSMAdView, but found: %@", viewId, view);
      }
      
      
      
    }];
  });
}

@end
