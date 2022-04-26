//
//  SuperAwesome.h
//  SuperAwesome
//
//  Created by Gabriel Coman on 17/12/2018.
//

#ifndef SuperAwesome_h
#define SuperAwesome_h

#import "SABannerAd.h"
#import "SAInterstitialAd.h"
#import "SACallback.h"
#import "SAOrientation.h"
#import "SADefines.h"

@protocol SAVideoPlayerControlsView;
@protocol SAVideoPlayerControlsViewDelegate;
@class SAVideoAd;

#if defined(__has_include)
#if __has_include(<SAGDPRKisMinor/SAAgeCheck.h>)
#import <SAGDPRKisMinor/SAAgeCheck.h>
#else
#import "SAAgeCheck.h"
#endif
#endif

#endif
