//
//  SASessionProtocol.h
//  SASession
//
//  Created by Gabriel Coman on 10/05/2018.
//

#import <Foundation/Foundation.h>
#import "SASessionDefines.h"

@protocol SASessionProtocol
- (NSString*) getBaseUrl;
- (BOOL) getTestMode;
- (NSUInteger) getDauId;
- (NSString*) getVersion;
- (NSInteger) getCachebuster;
- (NSString*) getBundleId;
- (NSString*) getAppName;
- (NSInteger) getConnectivityType;
- (NSString*) getLang;
- (NSString*) getDevice;
- (NSString*) getUserAgent;
- (SAConfiguration) getConfiguration;
- (SARTBInstl) getInstl;
- (SARTBPlaybackMethod) getPlaybackMethod;
- (SARTBPosition) getPos;
- (SARTBSkip) getSkip;
- (SARTBStartDelay) getStartDelay;
- (NSInteger) getWidth;
- (NSInteger) getHeight;
@end
