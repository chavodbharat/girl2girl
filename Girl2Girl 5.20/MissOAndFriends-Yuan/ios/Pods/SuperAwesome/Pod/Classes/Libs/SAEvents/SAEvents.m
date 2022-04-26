/**
 * @Copyright:   SuperAwesome Trading Limited 2017
 * @Author:      Gabriel Coman (gabriel.coman@superawesome.tv)
 */

#import "SAEvents.h"
#import "SAServerModule.h"
#import "SAMoatModule.h"
#import "SAViewableModule.h"
#import "SAVASTModule.h"
#import "SASessionProtocol.h"

@interface SAEvents ()
@end

@implementation SAEvents

- (void) setAd: (SAAd*) ad
    andSession: (id<SASessionProtocol>) session {
    
    _serverModule = [[SAServerModule alloc] initWithAd:ad andSession:session];
    _moatModule = [[SAMoatModule alloc] initWithAd:ad];
    _viewableModule = [[SAViewableModule alloc] init];
    _vastModule = [[SAVASTModule alloc] initWithAd:ad];
    
}

- (void) unsetAd {
    
    _serverModule = nil;
    _moatModule = nil;
    [_viewableModule close];
    _viewableModule = nil;
    _vastModule = nil;
    
}

- (void) triggerClickEvent {
    if (_serverModule) {
        [_serverModule triggerClickEvent: nil];
    }
}

- (void) triggerImpressionEvent {
    if (_serverModule) {
        [_serverModule triggerImpressionEvent: nil];
    }
}

- (void) triggerViewableImpressionEvent {
    if (_serverModule) {
        [_serverModule triggeViewableImpressionEvent: nil];
    }
}

- (void) triggerPgOpenEvent {
    if (_serverModule) {
        [_serverModule triggerPgOpenEvent: nil];
    }
}

- (void) triggerPgCloseEvent {
    if (_serverModule) {
        [_serverModule triggerPgCloseEvent: nil];
    }
}

- (void) triggerPgFailEvent {
    if (_serverModule) {
        [_serverModule triggerPgFailEvent: nil];
    }
}

- (void) triggerPgSuccessEvent {
    if (_serverModule) {
        [_serverModule triggerPgSuccessEvent: nil];
    }
}

- (NSString*) getVASTClickThroughEvent {
    return _vastModule ? [_vastModule getVASTClickThroughEvent] : @"";
}

- (void) triggerVASTClickThroughEvent {
    if (_vastModule) {
        [_vastModule triggerVASTClickThroughEvent: nil];
    }
}

- (void) triggerVASTErrorEvent {
    if (_vastModule) {
        [_vastModule triggerVASTErrorEvent: nil];
    }
}

- (void) triggerVASTImpressionEvent {
    if (_vastModule) {
        [_vastModule triggerVASTImpressionEvent: nil];
    }
}

- (void) triggerVASTCreativeViewEvent {
    if (_vastModule) {
        [_vastModule triggerVASTCreativeViewEvent: nil];
    }
}

- (void) triggerVASTStartEvent {
    if (_vastModule) {
        [_vastModule triggerVASTStartEvent: nil];
    }
}

- (void) triggerVASTFirstQuartileEvent {
    if (_vastModule) {
        [_vastModule triggerVASTFirstQuartileEvent: nil];
    }
}

- (void) triggerVASTMidpointEvent {
    if (_vastModule) {
        [_vastModule triggerVASTMidpointEvent: nil];
    }
}

- (void) triggerVASTThirdQuartileEvent {
    if (_vastModule) {
        [_vastModule triggerVASTThirdQuartileEvent: nil];
    }
}

- (void) triggerVASTCompleteEvent {
    if (_vastModule) {
        [_vastModule triggerVASTCompleteEvent: nil];
    }
}

- (void) triggerVASTClickTrackingEvent {
    if (_vastModule) {
        [_vastModule triggerVASTClickTrackingEvent: nil];
    }
}

- (void) checkViewableStatusForDisplay:(UIView*)view
                           andResponse:(saDidFindViewOnScreen) response {

    if (_viewableModule) {
        [_viewableModule checkViewableImpressionForDisplay:view
                                               andResponse:response];
    }
    
}

- (void) checkViewableStatusForVideo:(UIView*)view
                         andResponse:(saDidFindViewOnScreen) response {
    
    if (_viewableModule) {
        [_viewableModule checkViewableImpressionForVideo:view
                                             andResponse:response];
    }
    
}

- (BOOL) isChildInViewableRect: (UIView*) view {
    if (_viewableModule) {
        return [_viewableModule isChildInViewableRect:view];
    } else {
        return false;
    }
}

- (NSString*) startMoatTrackingForDisplay:(id)webplayer {
    return _moatModule ? [_moatModule startMoatTrackingForDisplay:webplayer] : @"";
}

- (BOOL) stopMoatTrackingForDisplay {
    return _moatModule ? [_moatModule stopMoatTrackingForDisplay] : false;
}

- (BOOL) startMoatTrackingForVideoPlayer:(AVPlayer*) player
                               withLayer:(AVPlayerLayer*) layer
                                 andView:(UIView*) view {
    return _moatModule ? [_moatModule startMoatTrackingForVideoPlayer:player withLayer:layer andView:view] : false;
}

- (BOOL) stopMoatTrackingForVideoPlayer {
    return _moatModule ? [_moatModule stopMoatTrackingForVideoPlayer] : false;
}

- (void) disableMoatLimiting {
    if (_moatModule) {
        [_moatModule disableMoatLimiting];
    }
}

+ (void) initMoat: (BOOL) loggingEnabled {
    [SAMoatModule initMoat:loggingEnabled];
}

@end
