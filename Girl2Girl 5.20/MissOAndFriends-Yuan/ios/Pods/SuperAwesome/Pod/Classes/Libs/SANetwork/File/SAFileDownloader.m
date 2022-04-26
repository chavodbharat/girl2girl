/**
 * @Copyright:   SuperAwesome Trading Limited 2017
 * @Author:      Gabriel Coman (gabriel.coman@superawesome.tv)
 */

#import "SAFileDownloader.h"
#import "SAFileItem.h"

#define TIMEOUT_INTERVAL 15

@interface SAFileDownloader ()

@property (nonatomic, strong) NSFileManager *fileManager;
@property (nonatomic, strong) NSUserDefaults *defs;

@end

@implementation SAFileDownloader

/**
 * Overridden "init" methid that initializes all the objects needed by the
 * singleton. Only called once.
 *
 * @return a new instance of the object, just once
 */
- (id) init {
    if (self = [super init]) {
        
        // set defs & file manager
        _defs = [NSUserDefaults standardUserDefaults];
        _fileManager = [NSFileManager defaultManager];
    }
    
    return self;
}

- (void) downloadFileFrom:(NSString*) url
              andResponse:(saDidDownloadFile) downloadResponse {
    
    // check the URL for nullness
    if (url == nil || url == (NSString*)[NSNull null] || [url isEqualToString:@""]) {
        if (downloadResponse != nil) {
            downloadResponse (false, nil, nil);
        }
        return;
    }
    
    SAFileItem *item = [[SAFileItem alloc] initWithUrl:url];
    
    BOOL fileAlreadyExists = [self->_fileManager fileExistsAtPath:[item filePath]];

    if (fileAlreadyExists) {
        if (downloadResponse != nil) {
            downloadResponse(true, [item key], [item fileName]);
        }
        return;
    }
    
    NSMutableURLRequest *request = [[NSMutableURLRequest alloc] init];
    [request setURL:[item url]];
    [request setTimeoutInterval: TIMEOUT_INTERVAL];
    [request setHTTPMethod:@"GET"];
    
    // set a session
    NSURLSession *session = [NSURLSession sharedSession];
    NSURLSessionTask *task = [session downloadTaskWithRequest:request completionHandler:^(NSURL * _Nullable location, NSURLResponse * _Nullable response, NSError * _Nullable error) {
       
        // success case
        if (response != nil && error == nil) {
            
            NSURL *destURL = [NSURL fileURLWithPath:[item filePath]];
            
            // move the file
            NSError *fileError = nil;
            
            // first delete, if exists
            [self->_fileManager removeItemAtPath:[item filePath] error:nil];
            // then re-write
            [self->_fileManager moveItemAtURL:location toURL:destURL error:&fileError];
            
            NSLog(@"File error is %@", fileError);
            
            // save to be able to delete afterwards
            if (fileError == nil) {
                [self->_defs setObject:[item fileName] forKey:[item key]];
                [self->_defs synchronize];
            }
            
            dispatch_async(dispatch_get_main_queue(), ^{
                // send responses
                if (downloadResponse != nil) {
                    downloadResponse (true, [item key], [item fileName]);
                }
            });
        }
        // error case
        else {
            dispatch_async(dispatch_get_main_queue(), ^{
                if (downloadResponse != nil) {
                    downloadResponse (false, nil, nil);
                }
            });
        }
    }];
    
    // start the task
    [task resume];
}

/**
 * Method that takes a file path (a simple name) and returns it's full path
 * as it would be in the iOS Documents directory.
 *
 * @param fpath    the name of the file
 * @return         the full file name with documents directory added
 */
- (NSString*) filePathInDocuments:(NSString*)fpath {
    NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
    NSString *basePath = paths.firstObject;
    return [basePath stringByAppendingPathComponent:fpath];
}

+ (void) cleanup {
    
    NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
    NSString *basePath = paths.firstObject;
    NSUserDefaults *defs = [NSUserDefaults standardUserDefaults];
    NSFileManager *fileManager = [NSFileManager defaultManager];
    NSMutableArray<NSString*> *keysToDel = [@[] mutableCopy];
    
    for (NSString *key in [[defs dictionaryRepresentation] allKeys]) {
        
        if ([key rangeOfString:SA_KEY_PREFIX].location != NSNotFound) {
            
            NSString *filePath = [defs objectForKey:key];
            NSString *fullFilePath = [basePath stringByAppendingPathComponent:filePath];
            
            if ([fileManager fileExistsAtPath:fullFilePath] && [fileManager isDeletableFileAtPath:fullFilePath]) {
                [fileManager removeItemAtPath:fullFilePath error:nil];
                NSLog(@"[true] | DEL | %@", filePath);
            } else {
                NSLog(@"[false] | DEL | %@", filePath);
            }
            
            [keysToDel addObject:key];
        }
    }
    
    for (NSString* key in keysToDel) {
        [defs removeObjectForKey:key];
    }
    [defs synchronize];
}

@end
