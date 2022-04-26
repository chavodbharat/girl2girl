//
//  SUPMoatAdEventType.h
//  SUPMoatMobileAppKit
//
//  Created by Moat 740 on 3/27/17.
//  Copyright © 2017 Moat. All rights reserved.
//

#ifndef SUPMoatAdEventType_h
#define SUPMoatAdEventType_h

typedef enum SUPMoatAdEventType : NSUInteger {
    SUPMoatAdEventComplete
    , SUPMoatAdEventStart
    , SUPMoatAdEventFirstQuartile
    , SUPMoatAdEventMidPoint
    , SUPMoatAdEventThirdQuartile
    , SUPMoatAdEventSkipped
    , SUPMoatAdEventStopped
    , SUPMoatAdEventPaused
    , SUPMoatAdEventPlaying
    , SUPMoatAdEventVolumeChange
    , SUPMoatAdEventNone
} SUPMoatAdEventType;

#endif /* SUPMoatAdEventType_h */
