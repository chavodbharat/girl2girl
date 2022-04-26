//
//  SASessionDefines.h
//  Pods
//
//  Created by Gabriel Coman on 03/05/2018.
//

#ifndef SASessionDefines_h
#define SASessionDefines_h

#import <Foundation/Foundation.h>

typedef NS_ENUM(NSInteger, SAConfiguration) {
    PRODUCTION  = 0,
    STAGING     = 1
};

static inline SAConfiguration getConfigurationFromInt (int configuration) {
    return configuration == 0 ? PRODUCTION : STAGING;
}

typedef NS_ENUM(NSInteger, SARTBPosition) {
    POS_ABOVE_THE_FOLD  = 1,
    POS_BELOW_THE_FOLD  = 3,
    POS_FULLSCREEN      = 7
};

static inline SARTBPosition getRTBPositionFromInt (int pos) {
    switch (pos) {
        case 1: return  POS_ABOVE_THE_FOLD;
        case 3: return  POS_BELOW_THE_FOLD;
        default: return POS_FULLSCREEN;
    }
}

typedef NS_ENUM(NSInteger, SARTBSkip) {
    SK_NO_SKIP = 0,
    SK_SKIP    = 1
};

static inline SARTBSkip getRTBSkipFromInt (int skip) {
    switch (skip) {
        case 1: return  SK_SKIP;
        default: return SK_NO_SKIP;
    }
}

typedef NS_ENUM(NSInteger, SARTBStartDelay) {
    DL_POST_ROLL        = -2,
    DL_GENERIC_MID_ROLL = -1,
    DL_PRE_ROLL         = 0,
    DL_MID_ROLL         = 1
};

static inline SARTBStartDelay getRTBStartDelayFromInt (int delay) {
    switch (delay) {
        case -2: return DL_POST_ROLL;
        case -1: return DL_GENERIC_MID_ROLL;
        case 0: return  DL_PRE_ROLL;
        default: return DL_MID_ROLL;
    }
}

typedef NS_ENUM(NSInteger, SARTBInstl) {
    IN_NOT_FULLSCREEN  = 0,
    IN_FULLSCREEN      = 1
};

static inline SARTBInstl getRTBInstlFromInt (int fs) {
    switch (fs) {
        case 1: return  IN_FULLSCREEN;
        default: return IN_NOT_FULLSCREEN;
    }
}

typedef NS_ENUM(NSInteger, SARTBPlaybackMethod) {
    PB_WITH_SOUND_ON_SCREEN = 5
};

static inline SARTBPlaybackMethod getRTBPlaybackMethodFromInt (int fs) {
    return PB_WITH_SOUND_ON_SCREEN;
}

#endif /* SASessionDefines_h */
