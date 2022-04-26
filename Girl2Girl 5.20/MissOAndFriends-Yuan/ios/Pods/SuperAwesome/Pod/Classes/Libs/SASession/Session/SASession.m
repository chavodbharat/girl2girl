/**
 * @Copyright:   SuperAwesome Trading Limited 2017
 * @Author:      Gabriel Coman (gabriel.coman@superawesome.tv)
 */

#import "SASession.h"
#import "SACapper.h"

#if defined(__has_include)
#if __has_include(<SuperAwesomeUnity/SuperAwesomeUnity-Swift.h>)
#import <SuperAwesomeUnity/SuperAwesomeUnity-Swift.h>
#else
//#import "SuperAwesomeUnity-Swift.h"
#endif
#endif

#if defined(__has_include)
#if __has_include(<SuperAwesome/SuperAwesome-Swift.h>)
#import <SuperAwesome/SuperAwesome-Swift.h>
#else
#import "SuperAwesome-Swift.h"
#endif
#endif

#if defined(__has_include)
#if __has_include(<SAUtils/SAUtils.h>)
#import <SAUtils/SAUtils.h>
#else 
#import "SAUtils.h"
#endif
#endif

// define the production & staging URLs
#define PRODUCTION_URL  @"https://ads.superawesome.tv/v2"
#define STAGING_URL     @"https://ads.staging.superawesome.tv/v2"

// define the type of device to be sent to the ad server
#define DEVICE_PHONE    @"phone"
#define DEVICE_TABLET   @"tablet"

@interface SASession ()

// member variables representing the state of the session
@property (nonatomic, strong) NSString              *baseUrl;
@property (nonatomic, assign) BOOL                  testEnabled;
@property (nonatomic, strong) NSString              *version;
@property (nonatomic, assign) NSUInteger            dauId;
@property (nonatomic, strong) NSString              *bundleId;
@property (nonatomic, strong) NSString              *appName;
@property (nonatomic, strong) NSString              *lang;
@property (nonatomic, strong) NSString              *device;
@property (nonatomic, assign) NSInteger             connectivityType;
@property (nonatomic, strong) NSString              *userAgent;
@property (nonatomic, assign) SAConfiguration       configuration;
@property (nonatomic, assign) SARTBInstl            instl;
@property (nonatomic, assign) SARTBPosition         pos;
@property (nonatomic, assign) SARTBSkip             skip;
@property (nonatomic, assign) SARTBStartDelay       startDelay;
@property (nonatomic, assign) SARTBPlaybackMethod   playbackMethod;
@property (nonatomic, assign) NSInteger             width;
@property (nonatomic, assign) NSInteger             height;
 @end

@implementation SASession

- (id) init {
    if (self = [super init]) {
        
        // set config, testing, version - things that may change
        [self setConfigurationProduction];
        [self disableTestMode];
        [self setVersion:@"0.0.0"];
        
        // get the bundle id, app name, etc, things that might not change
        _bundleId = [[NSBundle mainBundle] bundleIdentifier];
        _appName = [SAUtils encodeURI:[[[NSBundle mainBundle] infoDictionary] objectForKey:@"CFBundleName"]];
        _device = [SAUtils getSystemSize] == size_phone ? DEVICE_PHONE : DEVICE_TABLET;
        // TODO: Convert to use injection
        _userAgent = SADependencyContainer.shared.modules.componentModule.userAgent.name;
        _connectivityType = [SAUtils getNetworkConnectivity];
        _instl = IN_FULLSCREEN;
        _pos = POS_FULLSCREEN;
        _skip = SK_NO_SKIP;
        _startDelay = DL_PRE_ROLL;
        _playbackMethod = PB_WITH_SOUND_ON_SCREEN;
        _width = 0;
        _height = 0;
        
        // get the language
        _lang = @"none";
        
        NSString *shortLang = nil;
        NSString *locale = nil;
        
        NSBundle *main = [NSBundle mainBundle];
        if (main != nil) {
            NSArray *localizations = [main preferredLocalizations];
            if ([localizations count] > 0) {
                shortLang = [localizations objectAtIndex:0];
            }
        }
        NSLocale *cLocale = [NSLocale currentLocale];
        if (cLocale != nil) {
            locale = [[cLocale objectForKey:NSLocaleCountryCode] uppercaseString];
        }
        
        if (shortLang && locale) {
            _lang = [NSString stringWithFormat:@"%@_%@", shortLang, locale];
        }
        
        // get the Dau Id
        SACapper *capper = [[SACapper alloc] init];
        [self setDauId:[capper getDauId]];
    }
    return self;
}

////////////////////////////////////////////////////////////////////////////////
// Setters
////////////////////////////////////////////////////////////////////////////////

- (void) setConfiguration:(SAConfiguration) configuration {
    if (configuration == PRODUCTION) {
        _configuration = PRODUCTION;
        _baseUrl = PRODUCTION_URL;
    } else {
        _configuration = STAGING;
        _baseUrl = STAGING_URL;
    }
}

- (void) setConfigurationProduction {
    [self setConfiguration:PRODUCTION];
}

- (void) setConfigurationStaging {
    [self setConfiguration:STAGING];
}

- (void) setTestMode:(BOOL)testEnabled {
    _testEnabled = testEnabled;
}

- (void) enableTestMode {
    [self setTestMode:true];
}

- (void) disableTestMode {
    [self setTestMode:false];
}


- (void) setDauId:(NSUInteger)dauId {
    _dauId = dauId;
}

- (void) setVersion:(NSString *)version {
    _version = version;
}

- (void) setInstl: (SARTBInstl) instl {
    _instl = instl;
}

- (void) setPlaybackMethod: (SARTBPlaybackMethod) playbackMethod {
    _playbackMethod = playbackMethod;
}

- (void) setPos: (SARTBPosition) pos {
    _pos = pos;
}

- (void) setSkip: (SARTBSkip) skip {
    _skip = skip;
}

- (void) setStartDelay: (SARTBStartDelay) startDelay {
    _startDelay = startDelay;
}

- (void) setWidth: (NSInteger) width {
    _width = width;
}

- (void) setHeight: (NSInteger) height {
    _height = height;
}

- (void) setLanguage: (NSString*) lang {
    _lang = lang;
}

- (void) setLanguage: (NSString*) langage forLocale: (NSLocale*) locale {
    
    NSString* localeStr = @"";
    if (locale != nil) {
        localeStr = [[locale objectForKey:NSLocaleCountryCode] uppercaseString];
    }
    
    _lang = [NSString stringWithFormat:@"%@_%@", langage, localeStr];
}

////////////////////////////////////////////////////////////////////////////////
// Getters
////////////////////////////////////////////////////////////////////////////////

- (NSString*) getBaseUrl {
    return _baseUrl;
}

- (BOOL) getTestMode {
    return _testEnabled;
}

- (NSUInteger) getDauId {
    return _dauId;
}

- (NSString*) getVersion {
    return _version;
}

- (SAConfiguration) getConfiguration {
    return _configuration;
}

- (NSString*) getBundleId {
    return _bundleId;
}

- (NSString*) getAppName {
    return _appName;
}

- (NSString*) getLang {
    return _lang;
}

- (NSString*) getDevice {
    return _device;
}

- (NSInteger) getConnectivityType {
    return _connectivityType;
}

- (NSInteger) getCachebuster {
    return [SAUtils getCachebuster];
}

- (NSString*) getUserAgent {
    return _userAgent;
}

- (SARTBInstl) getInstl {
    return _instl;
}

- (SARTBPlaybackMethod) getPlaybackMethod {
    return _playbackMethod;
}

- (SARTBPosition) getPos {
    return _pos;
}

- (SARTBSkip) getSkip {
    return _skip;
}

- (SARTBStartDelay) getStartDelay {
    return _startDelay;
}

- (NSInteger) getWidth {
    return _width;
}

- (NSInteger) getHeight {
    return _height;
}

@end
