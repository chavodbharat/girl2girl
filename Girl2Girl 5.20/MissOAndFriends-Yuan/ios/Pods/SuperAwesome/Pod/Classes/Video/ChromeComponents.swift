//
//  ChromeComponents.swift
//  SuperAwesome
//
//  Created by Gabriel Coman on 17/12/2018.
//

import UIKit

extension CAGradientLayer {
    static func darkGradient() -> CAGradientLayer {
        let layer = CAGradientLayer()
        layer.colors = [UIColor.black.cgColor, UIColor.clear.cgColor]
        layer.startPoint = CGPoint(x: 1, y: 0.7)
        layer.endPoint = CGPoint(x: 1, y: 0)
        return layer
    }
}

@objc(SABlackMask2) class BlackMask: UIView {
    
    private let gradient: CAGradientLayer = CAGradientLayer.darkGradient()
    
    init() {
        super.init(frame: CGRect.zero)
        setup()
    }
    
    override init(frame: CGRect) {
        super.init(frame: frame)
        setup()
    }
    
    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    override func layoutSubviews() {
        super.layoutSubviews()
        gradient.frame = bounds
    }
    
    private func setup() {
        backgroundColor = UIColor.clear
        alpha = 0.75
        layer.addSublayer(gradient)
    }
}

extension UILabel {
    static func createChrono() -> UILabel {
        let label = UILabel()
        label.backgroundColor = UIColor.clear
        label.textColor = UIColor.init(red: 0.9, green: 0.9, blue: 0.9, alpha: 1)
        label.font = UIFont.systemFont(ofSize: 10)
        label.textAlignment = NSTextAlignment.center
        return label
    }
}

@objc(SAChronograph2) class Chronograph: UIView {
    
    private let adLabel = UILabel.createChrono()
    
    init() {
        super.init(frame: CGRect.zero)
        setup()
    }
    
    override init(frame: CGRect) {
        super.init(frame: frame)
        setup()
    }
    
    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    private func setup() {
        backgroundColor = UIColor(red: 0.9, green: 0.9, blue: 0.9, alpha: 0.25)
        layer.cornerRadius = 5.0
        addSubview(adLabel)
    }
    
    override func layoutSubviews() {
        super.layoutSubviews()
        adLabel.frame = bounds
    }
    
    @objc(setRemainingTime:)
    public func setTime(remaining: Int) {
        adLabel.text = "Ad: \(remaining)"
    }
}

@objc(SAURLClicker2) class URLClicker: UIButton {
    
    init(smallClick: Bool) {
        super.init(frame: .zero)
        if smallClick {
            self.setTitle("Find out more »", for: .normal)
            self.titleLabel?.font = UIFont.systemFont(ofSize: 12)
        }
    }
    
    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
}

@objc(SAPadlock) class Padlock: UIButton {
    
    init() {
        super.init(frame: CGRect.zero)
        setImage(SAImageUtils.padlockImage(), for: .normal)
    }
    
    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
}

@objc(CloseButton) class CloseButton: UIButton {
    
    init() {
        super.init(frame: CGRect.zero)
        setImage(SAImageUtils.closeImage(), for: .normal)
    }
    
    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
}
