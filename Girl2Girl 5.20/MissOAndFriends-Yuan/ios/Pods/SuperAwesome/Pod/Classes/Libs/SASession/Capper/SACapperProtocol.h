//
//  SACapperProtocol.h
//  SASession
//
//  Created by Gabriel Coman on 10/05/2018.
//

#import <Foundation/Foundation.h>

@protocol SACapperProtocol

/**
 * Public method that gets the current DAU ID and returns it to
 * the library user.
 *
 * @return an Integer representing a device+app specific integer ID used
 *         in frequency capping by the ad server
 */
- (NSUInteger) getDauId;
@end
