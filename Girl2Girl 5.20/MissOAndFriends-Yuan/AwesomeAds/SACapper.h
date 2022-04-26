/**
 * @Copyright:   SuperAwesome Trading Limited 2017
 * @Author:      Gabriel Coman (gabriel.coman@superawesome.tv)
 */

#import <UIKit/UIKit.h>
#import "SACapperProtocol.h"

/**
 * Class that abstracts away generating a distinct ID called "DAU ID", 
 * which consists of:
 * - the Advertising ID int
 * - a random ID
 * - the package name
 * each hashed and then XOR-ed together
 */
@interface SACapper : NSObject <SACapperProtocol>
@end
