/**
 * @Copyright:   SuperAwesome Trading Limited 2017
 * @Author:      Gabriel Coman (gabriel.coman@superawesome.tv)
 */

#import <UIKit/UIKit.h>
#import "SASessionDefines.h"
#import "SASessionProtocol.h"

/**
 * Class that manages an AwesomeAds session, containing all variables 
 * needed to setup loading for a certain ad
 */
@interface SASession : NSObject <SASessionProtocol>

- (void) setTestMode:(BOOL) testEnabled;
- (void) enableTestMode;
- (void) disableTestMode;
- (void) setDauId:(NSUInteger)dauId;
- (void) setVersion:(NSString *)version;
- (void) setConfiguration:(SAConfiguration) configuration;
- (void) setConfigurationProduction;
- (void) setConfigurationStaging;
- (void) setInstl: (SARTBInstl) instl;
- (void) setPlaybackMethod: (SARTBPlaybackMethod) playbackMethod;
- (void) setPos: (SARTBPosition) pos;
- (void) setSkip: (SARTBSkip) skip;
- (void) setStartDelay: (SARTBStartDelay) startDelay;
- (void) setWidth: (NSInteger) width;
- (void) setHeight: (NSInteger) height;
- (void) setLanguage: (NSString*) lang;
- (void) setLanguage: (NSString*) langage forLocale: (NSLocale*) locale;
@end
