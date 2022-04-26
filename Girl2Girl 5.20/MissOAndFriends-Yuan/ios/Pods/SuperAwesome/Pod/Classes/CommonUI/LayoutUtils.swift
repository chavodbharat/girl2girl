//
//  LayoutUtils.swift
//  SuperAwesome
//
//  Created by Gabriel Coman on 19/12/2018.
//

import UIKit

class LayoutUtils: NSObject {

    static func bind(view: UIView, toTheEdgesOf otherView: UIView) {
        view.translatesAutoresizingMaskIntoConstraints = false
        let margins = otherView.layoutMarginsGuide
        
        view.topAnchor.constraint(equalTo: margins.topAnchor, constant: 0.0).isActive = true
        view.leadingAnchor.constraint(equalTo: margins.leadingAnchor, constant: 0.0).isActive = true
        view.trailingAnchor.constraint(equalTo: margins.trailingAnchor, constant: 0.0).isActive = true
        view.bottomAnchor.constraint(equalTo: margins.bottomAnchor, constant: -8.0).isActive = true
    }
    
    static func bind(view: UIView, toTopRightOf otherView: UIView) {
        view.translatesAutoresizingMaskIntoConstraints = false
        let margins = otherView.layoutMarginsGuide
        
        view.topAnchor.constraint(equalTo: margins.topAnchor, constant: 0.0).isActive = true
        view.trailingAnchor.constraint(equalTo: margins.trailingAnchor, constant: 0.0).isActive = true
        view.widthAnchor.constraint(equalToConstant: 40.0).isActive = true
        view.heightAnchor.constraint(equalToConstant: 40.0).isActive = true
    }
}
