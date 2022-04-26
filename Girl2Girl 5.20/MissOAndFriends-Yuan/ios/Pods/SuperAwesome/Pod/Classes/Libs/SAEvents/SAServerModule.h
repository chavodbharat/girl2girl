/**
 * @Copyright:   SuperAwesome Trading Limited 2017
 * @Author:      Gabriel Coman (gabriel.coman@superawesome.tv)
 */


#import <Foundation/Foundation.h>
#import "SAServerEvent.h"

@protocol SASessionProtocol;
@class SAAd;
@class SAClickEvent;
@class SAImpressionEvent;
@class SAViewableImpressionEvent;
@class SAPGOpenEvent;
@class SAPGFailEvent;
@class SAPGCloseEvent;
@class SAPGSuccessEvent;

@interface SAServerModule : NSObject

@property (nonatomic, strong) SAClickEvent              *clickEvent;
@property (nonatomic, strong) SAImpressionEvent         *impressionEvent;
@property (nonatomic, strong) SAViewableImpressionEvent *viewableImpressionEvent;
@property (nonatomic, strong) SAPGOpenEvent             *pgOpenEvent;
@property (nonatomic, strong) SAPGFailEvent             *pgFailEvent;
@property (nonatomic, strong) SAPGCloseEvent            *pgCloseEvent;
@property (nonatomic, strong) SAPGSuccessEvent          *pgSuccessEvent;

- (id) initWithAd: (SAAd*) ad
       andSession: (id<SASessionProtocol>) session;

- (void) triggerClickEvent: (saDidTriggerEvent) response;
- (void) triggerImpressionEvent: (saDidTriggerEvent) response;
- (void) triggeViewableImpressionEvent: (saDidTriggerEvent) response;
- (void) triggerPgOpenEvent: (saDidTriggerEvent) response;
- (void) triggerPgFailEvent: (saDidTriggerEvent) response;
- (void) triggerPgCloseEvent: (saDidTriggerEvent) response;
- (void) triggerPgSuccessEvent: (saDidTriggerEvent) response;

@end
