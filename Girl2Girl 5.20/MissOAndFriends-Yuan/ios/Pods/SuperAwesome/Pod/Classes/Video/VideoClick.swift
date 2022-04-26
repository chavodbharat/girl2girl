//
//  VideoEventsWithClick.swift
//  SuperAwesome
//
//  Created by Gabriel Coman on 19/12/2018.
//

import UIKit

@objc(SAVideoClick) public class VideoClick: NSObject {
    
    private static let PADLOCK_URL = "https://ads.superawesome.tv/v2/safead"
    
    private var placementId: Int = 0
    private var events: SAEvents!
    private var isParentalGateEnabled: Bool = false
    private var isBumperPageEnabled: Bool = false
    
    private var currentClickThreshold: TimeInterval = 0
    
    @objc(initWithEvents:andParentalGateEnabled:andBumperPageEnabled:)
    public init (events: SAEvents,
                 isParentalGateEnabled: Bool,
                 isBumperPageEnabled: Bool) {
        self.events = events
        self.isParentalGateEnabled = isParentalGateEnabled
        self.isBumperPageEnabled = isBumperPageEnabled
    }
    
    public func handleSafeAdTap() {
        showParentalGateIfNeeded(withCallback: showSuperAwesomeSiteInSafari)
    }
    
    private func showParentalGateIfNeeded(withCallback callBack: @escaping () -> Void) {
        if isParentalGateEnabled {
            SAParentalGate.setPgOpenCallback {
                self.events.triggerPgOpenEvent()
            }
            SAParentalGate.setPgCanceledCallback {
                self.events.triggerPgCloseEvent()
            }
            SAParentalGate.setPgFailedCallback {
                self.events.triggerPgFailEvent()
            }
            SAParentalGate.setPgSuccessCallback {
                self.events.triggerPgSuccessEvent()
                callBack()
            }
            SAParentalGate.play()
        } else {
            callBack()
        }
    }
    
    private func showSuperAwesomeSiteInSafari() {
        
        let bumperCallback: sabumpercallback = {
            guard let url = URL(string: VideoClick.PADLOCK_URL) else {
                return
            }
            UIApplication.shared.open(url, options: [:])
        }
        
        if isBumperPageEnabled {
            SABumperPage.setCallback(bumperCallback)
            SABumperPage.play()
        } else {
            bumperCallback()
        }
    }
    
    public func handleAdTap() {
        guard let destination = events.getVASTClickThroughEvent() else { return }
        showParentalGateIfNeeded(withCallback: {
            self.click(destination: destination)
        })
    }
    
    private func click(destination: String) {
        if isBumperPageEnabled {
            SABumperPage.setCallback {
                self.handleUrl(destination: destination)
            }
            SABumperPage.play()
        }
        else {
            handleUrl(destination: destination)
        }
    }
    
    private func handleUrl(destination: String) {
        
        let currentTime = NSDate().timeIntervalSince1970
        let diff = abs(currentTime - currentClickThreshold)
        
        if Int32(diff) < SA_DEFAULT_CLICK_THRESHOLD {
            return
        }
        
        currentClickThreshold = currentTime
        
        events.triggerVASTClickTrackingEvent()
        if let url = URL(string: destination) {
            UIApplication.shared.open(url, options: [:])
        }
    }
}
