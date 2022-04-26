/**
 * @Copyright:   SuperAwesome Trading Limited 2017
 * @Author:      Gabriel Coman (gabriel.coman@superawesome.tv)
 */

#import "SAMoatModule.h"
#import "SAAd.h"
#import "SACreative.h"
#import "SAUtils.h"

#if defined(__has_include)
#if __has_include("SAEvents+Moat.h")
#import "SAEvents+Moat.h"
#endif
#endif

@interface SAMoatModule ()
@property (nonatomic, assign) BOOL moatLimiting;
@property (nonatomic, strong) SAAd *ad;
@end

static BOOL moatEnabled = false;

@implementation SAMoatModule

- (id) initWithAd: (SAAd*) ad {
    if (self = [super init]) {
        
        // init with true
        _moatLimiting = true;
        
        // get the ad
        _ad = ad;
    }
    
    return self;
}

+ (void) initMoat: (BOOL) loggingEnabled {
    // init MOAT, if available
    SEL selector = NSSelectorFromString(@"internalInitMoat:");
    if ([SAMoatModule respondsToSelector:selector]) {
        // init moat
        IMP imp = [SAMoatModule methodForSelector:selector];
        void (*func)(id, SEL, BOOL) = (void*)imp;
        func(self, selector, loggingEnabled);
        moatEnabled = true;
        NSLog(@"SuperAwesome-Moat-Module Called 'internalInitMoat' and moat is %d", moatEnabled);
    } else {
        NSLog(@"SuperAwesome-Moat-Module Could not call 'internalInitMoat' because there is no selector");
    }
}

/**
 * Method that determines is Moat can be triggered at this point
 *
 * @return true or false
 */
- (BOOL) isMoatAllowed {
    NSInteger moatRandInt = [SAUtils randomNumberBetween:0 maxNumber:100];
    CGFloat moatRand = (CGFloat) (moatRandInt / 100.0f);
    BOOL result = _ad != nil && ((moatRand < _ad.moat && _moatLimiting) || !_moatLimiting);
    NSLog(@"SuperAwesome-Moat-Module Is Moat allowed: moatRand=%.2f | ad.moat=%.2f | moatLimiting=%d | result=%d",
          moatRand, _ad.moat, _moatLimiting, result);
    return result;
}

/**
 * Method that registers a Moat event object,
 * according to the moat specifications
 *
 * @param webplayer the web view used by Moat to register events on
 *                  (and that will contain an ad at runtime)
 * @return          returns a MOAT specific string that will need to be
 *                  inserted in the web view so that the JS moat stuff works
 */
- (NSString*) startMoatTrackingForDisplay:(id)webplayer {
    
    // ad data dictionary
    NSDictionary *moatDict = @{
                               @"advertiser": @(_ad.advertiserId),
                               @"campaign": @(_ad.campaignId),
                               @"line_item": @(_ad.lineItemId),
                               @"creative": @(_ad.creative._id),
                               @"app": @(_ad.appId),
                               @"placement": @(_ad.placementId),
                               @"publisher": @(_ad.publisherId)
                               };
    
    // selector
    SEL selector = NSSelectorFromString(@"internalStartMoatTrackingForDisplay:andAdDictionary:");
    
    // perform selector, if available
    if ([self respondsToSelector:selector] && [self isMoatAllowed]) {
        IMP imp = [self methodForSelector:selector];
        NSString* (*func)(id, SEL, id, NSDictionary*) = (void *)imp;
        NSString *moatResponse = func(self, selector, webplayer, moatDict);
        NSLog(@"SuperAwesome-Moat-Module Called 'internalStartMoatTrackingForDisplay' with response %@", moatResponse);
        return moatResponse;
    } else {
        NSLog(@"SuperAwesome-Moat-Module Could not call 'internalStartMoatTrackingForDisplay' because there is no selector");
        return @"";
    }
}

- (BOOL) stopMoatTrackingForDisplay {
    
    // selector
    SEL selector = NSSelectorFromString(@"internalStopMoatTrackingForDisplay");
    
    // perform selector, if available
    if ([self respondsToSelector:selector]) {
        IMP imp = [self methodForSelector:selector];
        BOOL (*func)(id, SEL) = (void*) imp;
        BOOL moatResponse = func(self, selector);
        NSLog(@"SuperAwesome-Moat-Module Called 'internalStopMoatTrackingForDisplay' with response %d", moatResponse);
        return moatResponse;
    } else {
        NSLog(@"SuperAwesome-Moat-Module Could not call 'internalStopMoatTrackingForDisplay' because there is no selector");
        return false;
    }
}

/**
 * Method that registers a Video Moat event
 *
 * @param player    the current AVPlayer needed by Moat to do video tracking
 * @param layer     the current Player layer associated with the video view
 * @return          whether the video moat event started OK
 */
- (BOOL) startMoatTrackingForVideoPlayer:(AVPlayer*) player
                               withLayer:(AVPlayerLayer*) layer
                                 andView:(UIView*) view {
    
    // ad data dictionary
    NSDictionary *moatDict = @{
                               @"advertiser":@(_ad.advertiserId),
                               @"campaign":@(_ad.campaignId),
                               @"line_item":@(_ad.lineItemId),
                               @"creative":@(_ad.creative._id),
                               @"app":@(_ad.appId),
                               @"placement":@(_ad.placementId),
                               @"publisher":@(_ad.publisherId)
                               };
    
    // selector
    SEL selector = NSSelectorFromString(@"internalStartMoatTrackingForVideoPlayer:withLayer:andView:andAdDictionary:");
    
    // perform selector, if available
    if ([self respondsToSelector:selector] && [self isMoatAllowed]) {
        IMP imp = [self methodForSelector:selector];
        BOOL (*func)(id, SEL, AVPlayer*, AVPlayerLayer*, UIView*, NSDictionary*) = (void *)imp;
        BOOL moatResponse = func(self, selector, player, layer, view, moatDict);
        NSLog(@"SuperAwesome-Moat-Module Called 'internalStartMoatTrackingForVideoPlayer' with response %d", moatResponse);
        return moatResponse;
    } else {
        NSLog(@"SuperAwesome-Moat-Module Could not call 'internalStartMoatTrackingForVideoPlayer' because there is no selector");
        return false;
    }
}

- (BOOL) stopMoatTrackingForVideoPlayer {
    
    // selector
    SEL selector = NSSelectorFromString(@"internalStopMoatTrackingForVideoPlayer");
    
    // perform selector, if available
    if ([self respondsToSelector:selector]) {
        IMP imp = [self methodForSelector:selector];
        BOOL (*func)(id, SEL) = (void*) imp;
        BOOL moatResponse = func(self, selector);
        NSLog(@"SuperAwesome-Moat-Module Called 'internalStopMoatTrackingForVideoPlayer' with response %d", moatResponse);
        return moatResponse;
    } else {
        NSLog(@"SuperAwesome-Moat-Module Could not call 'internalStopMoatTrackingForVideoPlayer' because there is no selector");
        return false;
    }
}

/**
 * Method by which Moat can be fully enforced by disabling
 * any limiting applied to it
 */
- (void) disableMoatLimiting {
    _moatLimiting = false;
}

@end
