//
//  GetIsMinorProcess.m
//  SAGDPRKisMinor
//
//  Created by Guilherme Mota on 27/04/2018.
//

#import "GetIsMinorProcess.h"
#import "GetIsMinorModel.h"

@interface GetIsMinorProcess ()
@property (nonatomic, strong) NSString *bundleId;
@property (nonatomic, strong) NSString *dateOfBirth;
@property (nonatomic, strong) GetIsMinorBlock getIsMinorModel;
@end

@implementation GetIsMinorProcess

- (id) initWithValues:(NSString*)dateOfBirth : (NSString*) bundleId {
    _bundleId = bundleId;
    _dateOfBirth = dateOfBirth;
    return self;
}

- (NSString*) getEndpoint {
    return @"v1/countries/child-age";
}

- (HTTP_METHOD) getMethod {
    return GET;
}

- (NSDictionary *)getQuery{
    
    return @{
             @"bundleId": nullSafe(_bundleId),
             @"dob": nullSafe(_dateOfBirth)
             };
    
}

- (void) successWithStatus:(NSInteger)status andPayload:(NSString *)payload andSuccess:(BOOL)success {
    if (!success) {
        _getIsMinorModel(nil);
    } else {
        if ((status == 200 || status == 204) && payload != NULL) {
            GetIsMinorModel *model = [[GetIsMinorModel alloc] initWithJsonString:payload];
            _getIsMinorModel(model);
        }
        else {
            _getIsMinorModel(nil);
        }
    }
}

- (void) executeWithDateOfBirth:(NSString *)dateOfBirth
                               :(NSString *)bundleId
                               :(GetIsMinorBlock)getIsMinorModel {
    _dateOfBirth = dateOfBirth;
    _bundleId = bundleId;
    _getIsMinorModel = getIsMinorModel ? getIsMinorModel : ^(GetIsMinorModel*user){};
    [super execute];
}

@end
