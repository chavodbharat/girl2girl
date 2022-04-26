/**
 * @Copyright:   SuperAwesome Trading Limited 2017
 * @Author:      Gabriel Coman (gabriel.coman@superawesome.tv)
 */

#import "SAFileItem.h"

#define MAX_RETRIES 3

@implementation SAFileItem

- (id) init {
    if (self = [super init]) {
        _url = nil;
        _fileName = nil;
        _key = nil;
        _filePath = nil;
    }
    
    return self;
}

- (id) initWithUrl:(NSString *)url {
    if (self = [self init]) {
        
        if (url == nil || url == (NSString*)[NSNull null] || [url isEqualToString:@""]) {
            return self;
        }
        
        _url = [NSURL URLWithString:url];
        
        if (_url != nil) {
            NSString *component = [_url lastPathComponent];
            
            _key = [self getKeyFromDiskName:component];
            _fileName = component;
            _filePath = [NSString stringWithFormat:@"%@/%@", [self getDocumentsDirectory], _fileName];
        }
    }
    
    return self;
}

- (NSString*) getDocumentsDirectory {
    return NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES).firstObject;
}

- (NSString*) getKeyFromDiskName:(NSString*)name {
    return [NSString stringWithFormat:@"%@%@", SA_KEY_PREFIX, name];
}

- (BOOL) isValid {
    return _url != nil && _fileName != nil && _filePath != nil && _key != nil;
}



@end
