//
//  Service.h
//  SAGDPRKisMinor
//
//  Created by Guilherme Mota on 27/04/2018.
//

#import <UIKit/UIKit.h>

typedef NS_ENUM(NSInteger, HTTP_METHOD) {
    GET
};

@protocol NetworkProtocol <NSObject>

- (NSString*) getEndpoint;
- (HTTP_METHOD) getMethod;
- (NSDictionary*) getQuery;
- (NSDictionary*) getHeader;
- (NSDictionary*) getBody;
- (void) successWithStatus:(NSInteger)status andPayload:(NSString*)payload andSuccess:(BOOL) success;

@end

@interface Service : NSObject <NetworkProtocol> {
    NSString *url;
}

// request basic functions
- (void) execute;
- (void) execute:(id)param;

@end
