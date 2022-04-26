//
//  Injectable.swift
//  SuperAwesome
//
//  Created by Gunhan Sancar on 06/04/2020.
//

@objc(SADependencyContainer)
public class DependencyContainer: NSObject {
    @objc(shared)
    public private(set) static var shared: DependencyContainer!
    
    @objc(initModules:)
    public static func initModules(_ modules: ModuleContainerType) {
        shared = DependencyContainer(modules)
    }
    
    @objc(modules)
    public let moduleContainer: ModuleContainerType
    
    @objc(initWith:)
    public init(_ moduleContainer: ModuleContainerType) {
        self.moduleContainer = moduleContainer
    }
}

@objc(SAInjectable)
public protocol Injectable {
    @objc(dependencies)
    var dependencies: ModuleContainerType { get }
}

extension Injectable {
    var dependencies: ModuleContainerType { DependencyContainer.shared.moduleContainer }
}
