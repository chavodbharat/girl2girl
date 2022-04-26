//
//  Service.m
//  SAGDPRKisMinor
//
//  Created by Guilherme Mota on 27/04/2018.
//

// import header
#import "Service.h"

// import other important headers
#import "SAAgeCheck.h"
#import "SANetwork.h"

@interface Service ()
@property (nonatomic, strong) SANetwork *network;
@end

@implementation Service

// MARK: Init functions

- (id) init {
    if (self = [super init]) {
        _network = [[SANetwork alloc] init];
    }
    return self;
}

// MARK: KWSRequestProtocol method

- (NSString*) getEndpoint {
    return NULL;
}

- (HTTP_METHOD) getMethod {
    return GET;
}

- (BOOL) needsLoggedUser {
    return true;
}

- (NSDictionary*) getQuery {
    return @{};
}

- (NSDictionary*) getHeader {
    return @{};
}

- (NSDictionary*) getBody {
    return @{};
}

- (void) successWithStatus:(NSInteger)status andPayload:(NSString *)payload andSuccess:(BOOL)success{
    // do nothing
}

// MARK: Base class methods

- (void) execute {
    
    //TODO here
    url = [[SAAgeCheck sdk] getURL];
    
        // safe block self
        __block id blockSelf = self;
        
        switch ([self getMethod]) {
            case GET: {
                [_network sendGET:[NSString stringWithFormat:@"%@%@", url, [self getEndpoint]]
                        withQuery:[self getQuery]
                        andHeader:[self getHeader]
                     withResponse:^(NSInteger status, NSString *payload, BOOL success) {
                         [blockSelf successWithStatus:(int)status andPayload:payload andSuccess:success];
                     }];
                break;
            }
        }
}

- (void) execute:(id)param {
    [self execute];
}

@end
