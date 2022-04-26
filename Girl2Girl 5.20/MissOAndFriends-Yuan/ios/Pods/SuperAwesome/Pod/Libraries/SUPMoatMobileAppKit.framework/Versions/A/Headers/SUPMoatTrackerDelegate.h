//
//  SUPMoatTrackerDelegate.h
//  SUPMoatMobileAppKit
//
//  Created by Moat 740 on 3/27/17.
//  Copyright © 2017 Moat. All rights reserved.
//

#import "SUPMoatAdEventType.h"

#ifndef SUPMoatTrackerDelegate_h
#define SUPMoatTrackerDelegate_h

typedef enum : NSUInteger {
    SUPMoatStartFailureTypeNone = 0, //Default none value
    SUPMoatStartFailureTypeActive,   //The tracker was already active
    SUPMoatStartFailureTypeRestart,  //The tracker was stopped already
    SUPMoatStartFailureTypeBadArgs,  //The arguments provided upon initialization or startTracking were invalid.
} SUPMoatStartFailureType;

@class SUPMoatBaseTracker;
@class SUPMoatBaseVideoTracker;

@protocol SUPMoatTrackerDelegate <NSObject>

@optional

/**
 Notifies delegate that the tracker has started tracking.
 */

- (void)trackerStartedTracking:(SUPMoatBaseTracker *)tracker;

/**
 Notifies delegate that the tracker has stopped tracking.
 */

- (void)trackerStoppedTracking:(SUPMoatBaseTracker *)tracker;

/**
 Notifies delegate that the tracker failed to start.
 
 @param type Type of startTracking failure.
 @param reason A human readable string on why the tracking failed.
 */

- (void)tracker:(SUPMoatBaseTracker *)tracker failedToStartTracking:(SUPMoatStartFailureType)type reason:(NSString *)reason;

@end

#pragma mark

@protocol SUPMoatVideoTrackerDelegate <NSObject>

@optional

/**
 Notifies delegate an ad event type is being dispatched (i.e. start, pause, quarterly events).
 
 @param adEventType The type of event fired.
 */
- (void)tracker:(SUPMoatBaseVideoTracker *)tracker sentAdEventType:(SUPMoatAdEventType)adEventType;

@end

#endif /* SUPMoatTrackerDelegate_h */
