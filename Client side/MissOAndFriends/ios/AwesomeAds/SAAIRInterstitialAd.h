/**
 * @Copyright:   SuperAwesome Trading Limited 2017
 * @Author:      Gabriel Coman (gabriel.coman@superawesome.tv)
 */

#import <UIKit/UIKit.h>
#import "FlashRuntimeExtensions.h"

/**
 * Native method called from AIR that sets up a new interstitial ad.
 * Usually called only once by the AIR SDK.
 *
 * @param ctx       current FREContext object
 * @param funcData  pointer to extra data
 * @param argc      argc paramter
 * @param argv      argv paramter
 * @return          a new FREObject instance with return data
 */
FREObject SuperAwesomeAIRSAInterstitialAdCreate (FREContext ctx, void* funcData, uint32_t argc, FREObject argv[]);

/**
 * Native method called from AIR that loads a new interstitial ad.
 *
 * @param ctx       current FREContext object
 * @param funcData  pointer to extra data
 * @param argc      argc paramter
 * @param argv      argv paramter
 * @return          a new FREObject instance with return data
 */
FREObject SuperAwesomeAIRSAInterstitialAdLoad (FREContext ctx, void* funcData, uint32_t argc, FREObject argv[]);

/**
 * Native method called from AIR that checks if the interstitial ad is loaded.
 *
 * @param ctx       current FREContext object
 * @param funcData  pointer to extra data
 * @param argc      argc paramter
 * @param argv      argv paramter
 * @return          a new FREObject instance with return data
 */
FREObject SuperAwesomeAIRSAInterstitialAdHasAdAvailable (FREContext ctx, void* funcData, uint32_t argc, FREObject argv[]);

/**
 * Native method called from AIR that plays a new interstitial ad.
 *
 * @param ctx       current FREContext object
 * @param funcData  pointer to extra data
 * @param argc      argc paramter
 * @param argv      argv paramter
 * @return          a new FREObject instance with return data
 */
FREObject SuperAwesomeAIRSAInterstitialAdPlay (FREContext ctx, void* funcData, uint32_t argc, FREObject argv[]);
