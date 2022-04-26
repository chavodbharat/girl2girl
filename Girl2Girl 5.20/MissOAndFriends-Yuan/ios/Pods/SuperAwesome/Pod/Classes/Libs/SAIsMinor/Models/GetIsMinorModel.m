//
//  GetIsMinorModel.m
//  SAGDPRKisMinor
//
//  Created by Guilherme Mota on 27/04/2018.
//

#import "GetIsMinorModel.h"

@implementation GetIsMinorModel

- (id) initWithJsonDictionary:(NSDictionary *)jsonDictionary {
    if (self = [super initWithJsonDictionary:jsonDictionary]) {
        
        _country = [jsonDictionary safeObjectForKey:@"country"];
        _consentAgeForCountry = [[jsonDictionary safeObjectForKey:@"consentAgeForCountry"] integerValue];
        _age = [[jsonDictionary safeObjectForKey:@"age"] integerValue];
        _isMinor = [[jsonDictionary safeObjectForKey:@"isMinor"] boolValue];
    }
    return self;
}

- (BOOL) isValid {
    return true;
}

- (NSDictionary*) dictionaryRepresentation {
    return @{
             @"country": nullSafe(_country),
             @"consentAgeForCountry": @(_consentAgeForCountry),
             @"age": @(_age),
             @"isMinor": @(_isMinor)
             };
}

@end
