//
//  MoatAdEvent.h
//  MoatMobileAppKit
//
//  Created by Moat on 2/5/16.
//  Copyright © 2016 Moat. All rights reserved.
//
//  This class is simply a data object that encapsulates info relevant to a particular playback event.

#import <Foundation/Foundation.h>
#import "SUPMoatAdEventType.h"

static NSTimeInterval const SUPMoatTimeUnavailable = NAN;
static float const SUPMoatVolumeUnavailable = NAN;

@interface SUPMoatAdEvent : NSObject

@property (assign, nonatomic) SUPMoatAdEventType eventType;
@property (assign, nonatomic) NSTimeInterval adPlayhead;
@property (assign, nonatomic) float adVolume;
@property (assign, nonatomic, readonly) NSTimeInterval timeStamp;

- (id)initWithType:(SUPMoatAdEventType)eventType withPlayheadMillis:(NSTimeInterval)playhead;
- (id)initWithType:(SUPMoatAdEventType)eventType withPlayheadMillis:(NSTimeInterval)playhead withVolume:(float)volume;
- (NSDictionary *)asDict;
- (NSString *)eventAsString;

@end
