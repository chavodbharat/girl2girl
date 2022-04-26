/**
 * @Copyright:   SuperAwesome Trading Limited 2017
 * @Author:      Gabriel Coman (gabriel.coman@superawesome.tv)
 */

#import <UIKit/UIKit.h>
#import "FlashRuntimeExtensions.h"

/**
 * Native method called from AIR that sets up a video ad.
 * Usually called once by the AIR SDK.
 *
 * @param ctx       current FREContext object
 * @param funcData  pointer to extra data
 * @param argc      argc paramter
 * @param argv      argv paramter
 * @return          a new FREObject instance with return data
 */
FREObject SuperAwesomeAIRSAVideoAdCreate (FREContext ctx, void* funcData, uint32_t argc, FREObject argv[]);

/**
 * Native method called from AIR that loads a new video ad.
 *
 * @param ctx       current FREContext object
 * @param funcData  pointer to extra data
 * @param argc      argc paramter
 * @param argv      argv paramter
 * @return          a new FREObject instance with return data
 */
FREObject SuperAwesomeAIRSAVideoAdLoad (FREContext ctx, void* funcData, uint32_t argc, FREObject argv[]);

/**
 * Native method called from AIR that checks to see if a video ad is available.
 *
 * @param ctx       current FREContext object
 * @param funcData  pointer to extra data
 * @param argc      argc paramter
 * @param argv      argv paramter
 * @return          a new FREObject instance with return data
 */
FREObject SuperAwesomeAIRSAVideoAdHasAdAvailable (FREContext ctx, void* funcData, uint32_t argc, FREObject argv[]);

/**
 * Native method called from AIR that plays a new video ad.
 *
 * @param ctx       current FREContext object
 * @param funcData  pointer to extra data
 * @param argc      argc paramter
 * @param argv      argv paramter
 * @return          a new FREObject instance with return data
 */
FREObject SuperAwesomeAIRSAVideoAdPlay (FREContext ctx, void* funcData, uint32_t argc, FREObject argv[]);

