//
//  SAAgeCheck.h
//  SAGDPRKisMinor
//
//  Created by Guilherme Mota on 27/04/2018.
//

#import <UIKit/UIKit.h>
#import "GetIsMinorProcess.h"

@class GetIsMinorProcess;

@interface SAAgeCheck : NSObject

// singleton func
+ (instancetype) sdk;

// Get is minor
- (void) getIsMinor:(NSString*) dateOfBirth :(GetIsMinorBlock)response;

// other setters & getters

- (NSString*) getURL;

@end
