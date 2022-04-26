//
//  RepositoryModule.swift
//  SuperAwesome
//
//  Created by Gunhan Sancar on 04/04/2020.
//

@objc(SARepositoryModuleType)
public protocol RepositoryModuleType {
    var dataRepository: DataRepositoryType { get }
}

class RepositoryModule: RepositoryModuleType {
    lazy var dataRepository: DataRepositoryType = DataRepository(UserDefaults.standard)
}
