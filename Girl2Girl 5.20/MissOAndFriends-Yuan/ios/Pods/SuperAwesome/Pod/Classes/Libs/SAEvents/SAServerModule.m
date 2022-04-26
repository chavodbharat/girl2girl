/**
 * @Copyright:   SuperAwesome Trading Limited 2017
 * @Author:      Gabriel Coman (gabriel.coman@superawesome.tv)
 */


#import "SAServerModule.h"
#import "SAAd.h"
#import "SASession.h"
#import "SASessionProtocol.h"
#import "SAClickEvent.h"
#import "SAImpressionEvent.h"
#import "SAViewableImpressionEvent.h"
#import "SAPGOpenEvent.h"
#import "SAPGFailEvent.h"
#import "SAPGCloseEvent.h"
#import "SAPGSuccessEvent.h"

@interface SAServerModule ()
@end

@implementation SAServerModule

- (id) initWithAd: (SAAd*) ad
       andSession: (id<SASessionProtocol>) session {
    
    if (self = [super init]) {
        
        _clickEvent = [[SAClickEvent alloc] initWithAd:ad andSession:session];
        _impressionEvent = [[SAImpressionEvent alloc] initWithAd:ad andSession:session];
        _viewableImpressionEvent = [[SAViewableImpressionEvent alloc] initWithAd:ad andSession:session];
        _pgOpenEvent = [[SAPGOpenEvent alloc] initWithAd:ad andSession:session];
        _pgFailEvent = [[SAPGFailEvent alloc] initWithAd:ad andSession:session];
        _pgCloseEvent = [[SAPGCloseEvent alloc] initWithAd:ad andSession:session];
        _pgSuccessEvent = [[SAPGSuccessEvent alloc] initWithAd:ad andSession:session];
    }
    
    return self;
}

- (void) triggerClickEvent: (saDidTriggerEvent) response {
    if (_clickEvent) {
        [_clickEvent triggerEvent:response];
    }
}

- (void) triggerImpressionEvent: (saDidTriggerEvent) response {
    if (_impressionEvent) {
        [_impressionEvent triggerEvent: response];
    }
}

- (void) triggeViewableImpressionEvent: (saDidTriggerEvent) response {
    if (_viewableImpressionEvent) {
        [_viewableImpressionEvent triggerEvent: response];
    }
}

- (void) triggerPgOpenEvent: (saDidTriggerEvent) response {
    if (_pgOpenEvent) {
        [_pgOpenEvent triggerEvent: response];
    }
}

- (void) triggerPgFailEvent: (saDidTriggerEvent) response {
    if (_pgFailEvent) {
        [_pgFailEvent triggerEvent: response];
    }
}

- (void) triggerPgCloseEvent: (saDidTriggerEvent) response {
    if (_pgCloseEvent) {
        [_pgCloseEvent triggerEvent: response];
    }
}

- (void) triggerPgSuccessEvent: (saDidTriggerEvent) response {
    if (_pgSuccessEvent) {
        [_pgSuccessEvent triggerEvent: response];
    }
}

@end
