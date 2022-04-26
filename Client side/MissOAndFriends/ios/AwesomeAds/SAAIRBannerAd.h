/**
 * @Copyright:   SuperAwesome Trading Limited 2017
 * @Author:      Gabriel Coman (gabriel.coman@superawesome.tv)
 */

#import <UIKit/UIKit.h>
#import "FlashRuntimeExtensions.h"

/**
 * Native method called from AIR that creates a new SABannerAd instance.
 *
 * @param ctx       current FREContext object
 * @param funcData  pointer to extra data
 * @param argc      argc paramter
 * @param argv      argv paramter
 * @return          a new FREObject instance with return data
 */
FREObject SuperAwesomeAIRSABannerAdCreate (FREContext ctx, void* funcData, uint32_t argc, FREObject argv[]);

/**
 * Native method called from AIR that loads a new ad in the banner.
 *
 * @param ctx       current FREContext object
 * @param funcData  pointer to extra data
 * @param argc      argc paramter
 * @param argv      argv paramter
 * @return          a new FREObject instance with return data
 */
FREObject SuperAwesomeAIRSABannerAdLoad (FREContext ctx, void* funcData, uint32_t argc, FREObject argv[]);

/**
 * Native method called from AIR that checks if an ad is available 
 * in the banenr.
 *
 * @param ctx       current FREContext object
 * @param funcData  pointer to extra data
 * @param argc      argc paramter
 * @param argv      argv paramter
 * @return          a new FREObject instance with return data
 */
FREObject SuperAwesomeAIRSABannerAdHasAdAvailable (FREContext ctx, void* funcData, uint32_t argc, FREObject argv[]);

/**
 * Native method called from AIR that playes an ad in the banner.
 *
 * @param ctx       current FREContext object
 * @param funcData  pointer to extra data
 * @param argc      argc paramter
 * @param argv      argv paramter
 * @return          a new FREObject instance with return data
 */
FREObject SuperAwesomeAIRSABannerAdPlay (FREContext ctx, void* funcData, uint32_t argc, FREObject argv[]);

/**
 * Native method called from AIR that closes a banner.
 *
 * @param ctx       current FREContext object
 * @param funcData  pointer to extra data
 * @param argc      argc paramter
 * @param argv      argv paramter
 * @return          a new FREObject instance with return data
 */
FREObject SuperAwesomeAIRSABannerAdClose (FREContext ctx, void* funcData, uint32_t argc, FREObject argv[]);
