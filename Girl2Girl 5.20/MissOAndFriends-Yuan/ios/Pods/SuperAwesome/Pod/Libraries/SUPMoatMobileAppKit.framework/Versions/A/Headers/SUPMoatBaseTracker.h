//
//  SUPMoatBaseTracker.h
//  SUPMoatMobileAppKit
//
//  Created by Moat on 7/27/16.
//  Copyright © 2016 Moat. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import "SUPMoatTrackerDelegate.h"

@interface SUPMoatBaseTracker : NSObject

/**
 Delegate Property for SUPMoatBaseTracker and its subclasses to have to report start tracking, stop tracking, and other events.
 */
@property (weak, nonatomic) id<SUPMoatTrackerDelegate> trackerDelegate;

/*
 * Randomly generated ID to uniquely identify the tracker.
 */
@property (strong, nonatomic, readonly) NSNumber *trackerID;

@end
