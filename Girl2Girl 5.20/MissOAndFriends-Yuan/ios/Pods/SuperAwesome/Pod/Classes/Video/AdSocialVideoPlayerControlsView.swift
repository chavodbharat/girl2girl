//
//  SAChromeControl.swift
//  SuperAwesome
//
//  Created by Gabriel Coman on 17/12/2018.
//

import UIKit

@objc(SAAdSocialVideoPlayerControlsView) public class AdSocialVideoPlayerControlsView: UIView, VideoPlayerControlsView {
    
    private var blackMask: BlackMask!
    private var chrono: Chronograph!
    private var clicker: URLClicker!
    private var padlock: Padlock!
    private var closeButton: CloseButton!
    private var smallClicker: Bool = false
    private var safeLogoVisible: Bool = true
    private var didSetupConstraints: Bool = false
    
    private var padlockAction: (() -> Void)?
    private var closeAction: (() -> Void)?
    private var clickAction: (() -> Void)?
    
    @objc(initWithSmallClick:andShowSafeAdLogo:)
    init(smallClick: Bool, showSafeAdLogo: Bool) {
        self.smallClicker = smallClick
        self.safeLogoVisible = showSafeAdLogo
        super.init(frame: .zero)
        initSubViews(smallClick, showSafeAdLogo)
    }
    
    override init(frame: CGRect) {
        super.init(frame: frame)
        initSubViews(false, true)
    }
    
    required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
        initSubViews(false, true)
    }
    
    public override func updateConstraints() {
        
        if !didSetupConstraints {
            
            blackMask.translatesAutoresizingMaskIntoConstraints = false
            blackMask.leadingAnchor.constraint(equalTo: self.leadingAnchor).isActive = true
            blackMask.trailingAnchor.constraint(equalTo: self.trailingAnchor).isActive = true
            blackMask.bottomAnchor.constraint(equalTo: self.bottomAnchor).isActive = true
            blackMask.heightAnchor.constraint(equalTo: self.heightAnchor, multiplier: 1/5).isActive = true
            
            chrono.translatesAutoresizingMaskIntoConstraints = false
            chrono.leadingAnchor.constraint(equalTo: self.leadingAnchor, constant: 5.0).isActive = true
            chrono.bottomAnchor.constraint(equalTo: self.bottomAnchor, constant: -5.0).isActive = true
            chrono.widthAnchor.constraint(equalToConstant: 50).isActive = true
            chrono.heightAnchor.constraint(equalToConstant: 20).isActive = true
            
            if !smallClicker {
                clicker.topAnchor.constraint(equalTo: self.topAnchor, constant: 8.0).isActive = true
                clicker.leadingAnchor.constraint(equalTo: self.leadingAnchor).isActive = true
                clicker.trailingAnchor.constraint(equalTo: self.trailingAnchor).isActive = true
                clicker.bottomAnchor.constraint(equalTo: self.bottomAnchor, constant: -8.0).isActive = true
            } else {
                clicker.leadingAnchor.constraint(equalTo: chrono.trailingAnchor, constant: 8.0).isActive = true
                clicker.bottomAnchor.constraint(equalTo: self.bottomAnchor).isActive = true
                clicker.widthAnchor.constraint(equalToConstant: 100).isActive = true
                clicker.heightAnchor.constraint(equalToConstant: 20).isActive = true
            }
            
            if safeLogoVisible {
                padlock = Padlock()
                padlock.addTarget(self, action: #selector(didTapOnPadlock), for: .touchUpInside)
                addSubview(padlock)
                
                padlock.translatesAutoresizingMaskIntoConstraints = false
                padlock.topAnchor.constraint(equalTo: self.topAnchor, constant: 0.0).isActive = true
                padlock.leadingAnchor.constraint(equalTo: self.leadingAnchor, constant: 0.0).isActive = true
                padlock.widthAnchor.constraint(equalToConstant: 77.0).isActive = true
                padlock.heightAnchor.constraint(equalToConstant: 31.0).isActive = true
            }
            
            LayoutUtils.bind(view: closeButton, toTopRightOf: self)
            
            didSetupConstraints = true
        }
        
        super.updateConstraints()
    }
    
    private func initSubViews(_ smallClick: Bool, _ showSafeAdLogo: Bool) {
        
        blackMask = BlackMask()
        addSubview(blackMask)
        
        chrono = Chronograph()
        addSubview(chrono)
        
        clicker = URLClicker(smallClick: smallClick)
        addSubview(clicker)
        
        clicker.translatesAutoresizingMaskIntoConstraints = false
        clicker.addTarget(self, action: #selector(didTapOnUrl), for: .touchUpInside)
        
        closeButton = CloseButton()
        closeButton.isHidden = true
        closeButton.addTarget(self, action: #selector(close), for: .touchUpInside)
        addSubview(closeButton)
    }
    
    ////////////////////////////////////////////////////////////////////////////
    // custom methods
    ////////////////////////////////////////////////////////////////////////////
    
    @objc(makeCloseButtonVisible)
    public func makeCloseButtonVisible() {
        self.closeButton.isHidden = false
    }
    
    public func setPadlockAction(action: @escaping () -> Void) {
        padlockAction = action
    }
    
    public func setClickAction(action: @escaping () -> Void) {
        clickAction = action
    }
    
    public func setCloseAction(action: @escaping () -> Void) {
        closeAction = action
    }
    
    ////////////////////////////////////////////////////////////////////////////
    // Private tap functions
    ////////////////////////////////////////////////////////////////////////////
    
    @objc
    private func didTapOnPadlock() {
        padlockAction?()
    }
    
    @objc
    private func didTapOnUrl() {
        clickAction?()
    }
    
    @objc
    func close() {
        closeAction?()
    }
    
    ////////////////////////////////////////////////////////////////////////////
    // ChromeControl
    ////////////////////////////////////////////////////////////////////////////
    
    public func setPlaying() { /* N/A */ }
    
    public func setPaused() { /* N/A */ }
    
    public func setCompleted() { /* N/A */ }
    
    public func setError(error: Error) { /* N/A */ }
    
    public func setTime(time: Int, duration: Int) {
        let ramaining = duration - time
        chrono.setTime(remaining: ramaining)
    }
    
    public func isPlaying() -> Bool {
        return true
    }
    
    public func show() { /* N/A */ }
    
    public func hide() { /* N/A */ }
    
    public func setMinimised() { /* N/A */ }
    
    public func setMaximised() { /* N/A */ }
    
    public func isMaximised() -> Bool {
        return false
    }
    
    @objc(setDelegate:)
    public func set(delegate: VideoPlayerControlsViewDelegate) { /* N/A */ }
    
    @objc(setListener:)
    public func set(controlsViewListener: VideoPlayerControlsViewDelegate) { /* N/A */ }
}
