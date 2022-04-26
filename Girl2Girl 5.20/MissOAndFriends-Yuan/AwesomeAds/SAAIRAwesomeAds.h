//
//  SAAIRSuperAwesome.h
//  SuperAwesome
//
//  Created by Gabriel Coman on 13/05/2018.
//
#import <UIKit/UIKit.h>
#import "FlashRuntimeExtensions.h"

FREObject SuperAwesomeAIRAwesomeAdsInit (FREContext ctx, void* funcData, uint32_t argc, FREObject argv[]);

/**
 * Native method called from AIR that loads a new video ad.
 *
 * @param ctx       current FREContext object
 * @param funcData  pointer to extra data
 * @param argc      argc paramter
 * @param argv      argv paramter
 * @return          a new FREObject instance with return data
 */
FREObject SuperAwesomeAIRAwesomeAdsTriggerAgeCheck (FREContext ctx, void* funcData, uint32_t argc, FREObject argv[]);
