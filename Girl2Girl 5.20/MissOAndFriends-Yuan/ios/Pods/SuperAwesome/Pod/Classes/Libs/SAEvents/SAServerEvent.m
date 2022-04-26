/**
 * @Copyright:   SuperAwesome Trading Limited 2017
 * @Author:      Gabriel Coman (gabriel.coman@superawesome.tv)
 */

#import "SAServerEvent.h"
#import "SAAd.h"
#import "SAUtils.h"
#import "SANetwork.h"
#import "SASessionProtocol.h"

@interface SAServerEvent ()
@property (nonatomic, strong) SANetwork *network;
@end

@implementation SAServerEvent

- (id) initWithAd: (SAAd*) newAd andSession: (id<SASessionProtocol>) newSession {
    if (self = [super init]) {
        ad = newAd;
        session = newSession;
        _network = [[SANetwork alloc] init];
    }
    
    return self;
}

- (NSString*) getUrl {
    if (session) {
        return [session getBaseUrl];
    } else {
        return nil;
    }
}

- (NSString*) getEndpoint {
    return @"";
}

- (NSDictionary*) getHeader {
    NSMutableDictionary *header = [@{@"Content-Type": @"application/json"} mutableCopy];
    if (session != nil) {
        [header setObject:[session getUserAgent] forKey:@"User-Agent"];
    }
    return header;
}

- (NSDictionary*) getQuery {
    return @{};
}

- (void) triggerEvent {
    
    [_network sendGET:[NSString stringWithFormat:@"%@%@", [self getUrl], [self getEndpoint]]
            withQuery:[self getQuery]
            andHeader:[self getHeader]
         withResponse:^(NSInteger status, NSString *payload, BOOL success) {
    
             // do nothing
             
         }];
}

- (void) triggerEvent: (saDidTriggerEvent) response {
    
    [_network sendGET:[NSString stringWithFormat:@"%@%@", [self getUrl], [self getEndpoint]]
            withQuery:[self getQuery]
            andHeader:[self getHeader]
         withResponse:^(NSInteger status, NSString *payload, BOOL success) {
             
             if ((status == 200 || status == 302) && success) {
                 if (response != nil) {
                     response (true);
                 }
             } else {
                 if (response != nil) {
                     response (false);
                 }
             }
             
         }];
}

@end
