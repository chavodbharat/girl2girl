/**
 * @Copyright:   SuperAwesome Trading Limited 2017
 * @Author:      Gabriel Coman (gabriel.coman@superawesome.tv)
 */

#import <UIKit/UIKit.h>

#define SA_KEY_PREFIX @"sasdkkey_"

/**
 * This class represents a single File Item - an object that
 * tries to group two pieces of
 * information:
 *  - the details of where a file is downloaded (and if it has been
 *    successfully downloaded)
 *  - all the possible 3rd parties that would be interested in knowing
 *    if the file has been downloaded (by using a List of
 *    seqDownloadResponse to keep a track of who needs to be notified)
 */
@interface SAFileItem : NSObject

@property (nonatomic, strong) NSURL     *url;
@property (nonatomic, strong) NSString  *fileName;
@property (nonatomic, strong) NSString  *filePath;
@property (nonatomic, strong) NSString  *key;

// an array of of responses / callbacks to be called when a file has
// been downloaded, in order to communicate to library users
@property (nonatomic, strong) NSMutableArray *responses;

/**
 * Init with a single file Url to be downloaded
 *
 * @param  url     the url of the file to be downloaded
 * @return id      a new instance of the object
 */
- (id) initWithUrl:(NSString *) url;

/**
 * Checks the file item for validity
 *
 * @return true or false
 */
- (BOOL) isValid;

@end
