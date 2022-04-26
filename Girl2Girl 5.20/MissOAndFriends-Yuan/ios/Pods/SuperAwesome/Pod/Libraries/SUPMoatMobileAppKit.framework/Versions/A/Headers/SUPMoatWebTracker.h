//
//  SUPMoatWebTracker.h
//  SUPMoatMobileAppKit
//
//  Created by Moat on 6/2/16.
//  Copyright © 2016 Moat. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import "SUPMoatBaseTracker.h"

/** Tracker for tracking Web View based ads.
 *
 * Web View based ads are ads that track:
 * 1. WKWebView class instances or subclasses of WKWebiView
 * 2. Google Mobile Ads (GMA) Banner ads, for example DFPBannerView
 * 3. Hybrid native-webview ads (a very rare case)
 *
 * Each tracker instance must be kept around for the lifetime of the ad impression that it is tracking.
 */

@interface SUPMoatWebTracker : SUPMoatBaseTracker

/**
 * Creates tracker for tracking Web View based ads.
 * @param webViewOrWebViewContainer the UIView that contains the WKWebView to be tracked
 * @return SUPMoatWebTracker instance
 */
+ (SUPMoatWebTracker *)trackerWithWebComponent:(UIView *)webViewOrWebViewContainer;

/**
 * Creates tracker for tracking hybrid Web View based ads.
 * @param adView the UIView where the native ad is being shown
 * @param webViewOrWebViewContainer the WebView that is backing and tracking the native
 * @return SUPMoatWebTracker instance
 * @note Should only be used for ads that consist both of a native UIView and a web-based component.
 */
// Use this to track hybrid, two-view ads that consist both of a native UIView and a web-based component.
+ (SUPMoatWebTracker *)trackerWithAdView:(UIView *)adView withWebComponent:(UIView *)webViewOrWebViewContainer;

/**
 * Call to start tracking the ad.
 * Should be called at the start of an impression.
 */
- (BOOL)startTracking;

/**
 * Call to stop tracking the ad.
 * Should be called at the end of an impression.
 */
- (void)stopTracking;

@end
