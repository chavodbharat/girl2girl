/**
 * @Copyright:   SuperAwesome Trading Limited 2017
 * @Author:      Gabriel Coman (gabriel.coman@superawesome.tv)
 */

#import "SALoader.h"
#import "SAProcessHTML.h"

#if defined(__has_include)
#if __has_include(<SAModelSpace/SAResponse.h>)
#import <SAModelSpace/SAResponse.h>
#else
#import "SAResponse.h"
#endif
#endif

#if defined(__has_include)
#if __has_include(<SAModelSpace/SAAd.h>)
#import <SAModelSpace/SAAd.h>
#else
#import "SAAd.h"
#endif
#endif

#if defined(__has_include)
#if __has_include(<SAModelSpace/SACreative.h>)
#import <SAModelSpace/SACreative.h>
#else
#import "SACreative.h"
#endif
#endif

#if defined(__has_include)
#if __has_include(<SAModelSpace/SADetails.h>)
#import <SAModelSpace/SADetails.h>
#else
#import "SADetails.h"
#endif
#endif

#if defined(__has_include)
#if __has_include(<SAModelSpace/SAMedia.h>)
#import <SAModelSpace/SAMedia.h>
#else
#import "SAMedia.h"
#endif
#endif

#if defined(__has_include)
#if __has_include(<SAModelSpace/SAVASTAd.h>)
#import <SAModelSpace/SAVASTAd.h>
#else
#import "SAVASTAd.h"
#endif
#endif

#if defined(__has_include)
#if __has_include(<SAModelSpace/SAVASTMedia.h>)
#import <SAModelSpace/SAVASTMedia.h>
#else
#import "SAVASTMedia.h"
#endif
#endif

#if defined(__has_include)
#if __has_include(<SASession/SASession.h>)
#import <SASession/SASession.h>
#else
#import "SASession.h"
#endif
#endif

#if defined(__has_include)
#if __has_include(<SAModelSpace/SAResponse.h>)
#import <SASession/SASessionProtocol.h>
#else
#import "SASessionProtocol.h"
#endif
#endif

#if defined(__has_include)
#if __has_include(<SAUtils/SAUtils.h>)
#import <SAUtils/SAUtils.h>
#else
#import "SAUtils.h"
#endif
#endif

#if defined(__has_include)
#if __has_include(<SANetworking/SANetwork.h>)
#import <SANetworking/SANetwork.h>
#else
#import "SANetwork.h"
#endif
#endif

#if defined(__has_include)
#if __has_include(<SAVASTParser/SAVASTParser.h>)
#import <SAVASTParser/SAVASTParser.h>
#else
#import "SAVASTParser.h"
#endif
#endif

#if defined(__has_include)
#if __has_include(<SANetworking/SAFileDownloader.h>)
#import <SANetworking/SAFileDownloader.h>
#else
#import "SAFileDownloader.h"
#endif
#endif

@implementation SALoader

- (NSString*) getAwesomeAdsEndpoint: (id<SASessionProtocol>) session
                forPlacementId:(NSInteger) placementId {
    
    if (session) {
        return [NSString stringWithFormat:@"%@/ad/%ld",
                [session getBaseUrl],
                (long) placementId];
    } else {
        return nil;
    }
}


- (NSDictionary*) getAwesomeAdsQuery: (id<SASessionProtocol>) session {
    
    if (session) {
        
        return @{@"test": @([session getTestMode]),
                 @"sdkVersion": [session getVersion],
                 @"rnd": @([session getCachebuster]),
                 @"ct": @([session getConnectivityType]),
                 @"bundle": [session getBundleId],
                 @"name": [session getAppName],
                 @"dauid": @([session getDauId]),
                 @"lang": [session getLang],
                 @"device": [session getDevice],
                 @"pos": @([session getPos]),
                 @"skip": @([session getSkip]),
                 @"playbackmethod": @([session getPlaybackMethod]),
                 @"startdelay": @([session getStartDelay]),
                 @"instl": @([session getInstl]),
                 @"w": @([session getWidth]),
                 @"h": @([session getHeight])
                 // @"preload": @(true)
          };
    } else {
        return @{};
    }
}

- (NSDictionary*) getAwesomeAdsHeader: (id<SASessionProtocol>) session {
    if (session) {
        return @{@"Content-Type":@"application/json",
                 @"User-Agent": [session getUserAgent]
                 };
    } else {
        return @{};
    }
}

- (void) loadAd:(NSInteger) placementId
    withSession:(id<SASessionProtocol>) session
      andResult:(saDidLoadAd) result  {
    
    NSDictionary *query = [self getAwesomeAdsQuery:session];
    NSDictionary *header = [self getAwesomeAdsHeader:session];
    NSString *endpoint = [self getAwesomeAdsEndpoint:session
                                      forPlacementId:placementId];
    
    [self loadAd:endpoint
       withQuery:query
       andHeader:header
  andPlacementId:placementId
      andSession:session
       andResult:result];
}

- (void) loadAd:(NSString*) endpoint
      withQuery:(NSDictionary*) query
      andHeader:(NSDictionary*) header
 andPlacementId:(NSInteger) placementId
     andSession:(id<SASessionProtocol>) session
      andResult:(saDidLoadAd) result {
    
    
    
    // send a network request
    SANetwork *network = [[SANetwork alloc] init];
    [network sendGET:endpoint withQuery:query andHeader:header withResponse:^(NSInteger status, NSString *data, BOOL success) {
        
        [self processAd:placementId andData:data andStatus:status andSession:session andResult:result];
        
    }];
}

- (void) processAd:(NSInteger) placementId
           andData:(NSString*) data
         andStatus:(NSInteger) status
        andSession:(id<SASessionProtocol>) session
         andResult:(saDidLoadAd) result {
    
    // make sure the local result is never nil
    __block saDidLoadAd localResult = result ? result : ^(SAResponse* response){};
    
    // create a new object of type SAResponse
    __block SAResponse *response = [[SAResponse alloc] init];
    response.placementId = placementId;
    response.status = status;
    
    // error case, just bail out with a non-null invalid response
    if (data == nil) {
        localResult (response);
    }
    // good case, continue trying to figure out what kind of ad this is
    else {
        
        NSDictionary *jsonDict = [[NSDictionary alloc] initWithJsonString:data];
        
        // Normal Ad case
        if (jsonDict != nil) {
            
            // parse the final ad
            __block SAAd *ad = [[SAAd alloc] initWithPlacementId:placementId
                                               andJsonDictionary:jsonDict];
            
            // update type in response as well
            response.format = ad.creative.format;
            [response.ads addObject:ad];
            
            switch (ad.creative.format) {
                    // in this case return whatever we have at this moment
                case SA_Appwall:
                case SA_Invalid: {
                    localResult (response);
                    break;
                }
                    // in this case process the HTML and return the response
                case SA_Image: {
                    ad.creative.details.media.html = [SAProcessHTML formatCreativeIntoImageHTML:ad];
                    localResult (response);
                    break;
                }
                case SA_Rich:{
                    ad.creative.details.media.html = [SAProcessHTML formatCreativeIntoRichMediaHTML:ad withRandom:[SAUtils getCachebuster]];
                    localResult (response);
                    break;
                }
                case SA_Tag:{
                    ad.creative.details.media.html = [SAProcessHTML formatCreativeIntoTagHTML:ad];
                    localResult (response);
                    break;
                }
                case SA_Video:{
                    SAVASTParser *parser = [[SAVASTParser alloc] init];
                    [parser parseVAST:ad.creative.details.vast withResponse:^(SAVASTAd *savastAd) {
                        
                        // add the vast ad
                        ad.creative.details.media.vastAd = savastAd;
                        // copy the vast media
                        ad.creative.details.media.url = savastAd.url;
                        // download file
                        [[[SAFileDownloader alloc] init] downloadFileFrom:ad.creative.details.media.url andResponse:^(BOOL success, NSString *key, NSString *diskPath) {
                            
                            // add final details
                            ad.creative.details.media.path = diskPath;
                            ad.creative.details.media.isDownloaded = diskPath != nil && diskPath != (NSString*)[NSNull null];
                            
                            // finally respond
                            localResult (response);
                            
                        }];
                        
                    }];
                    break;
                }
            }
            
        }
        // it's not a normal ad or an app wall, then return
        else {
            localResult (response);
        }
    }
    
}

@end
