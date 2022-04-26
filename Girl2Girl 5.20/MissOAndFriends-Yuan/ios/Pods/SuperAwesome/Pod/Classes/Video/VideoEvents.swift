//
//  SAVideoEvents.swift
//  SuperAwesome
//
//  Created by Gabriel Coman on 18/01/2019.
//

import Foundation

@objc (SAVideoEventsDelegate) public protocol VideoEventsDelegate: class {
    func hasBeenVisible()
}

@objc (SAVideoEvents) public class VideoEvents: NSObject {

    private var isStartHandled: Bool = false
    private var is2SHandled: Bool = false
    private var isFirstQuartileHandled: Bool = false
    private var isMidpointHandled: Bool = false
    private var isThirdQuartileHandled: Bool = false
    
    private var events: SAEvents
    
    public weak var delegate: VideoEventsDelegate?
    
    //////////////////////////////////////////////////////////////////////////////
    // constructor
    //////////////////////////////////////////////////////////////////////////////
    
    @objc(initWithEvents:)
    public init(events: SAEvents) {
        self.events = events
        super.init()
    }
    
    //////////////////////////////////////////////////////////////////////////////
    // public class interface
    //////////////////////////////////////////////////////////////////////////////
    
    public func prepare(player: VideoPlayer, time: Int, duration: Int) {
        if let videoPlayer = player as? UIView,
           let avPlayer = player.getAVPlayer(),
           let avLayer = player.getAVPlayerLayer() {
            events.startMoatTracking(forVideoPlayer: avPlayer,
                                     with: avLayer,
                                    andView: videoPlayer)
        }
    }
    
    public func complete(player: VideoPlayer, time: Int, duration: Int) {
        events.stopMoatTrackingForVideoPlayer()
        guard time >= duration else { return }
        events.triggerVASTCompleteEvent()
    }
    
    public func error(player: VideoPlayer, time: Int, duration: Int) {
        events.stopMoatTrackingForVideoPlayer()
        events.triggerVASTErrorEvent()
    }
    
    public func time(player: VideoPlayer, time: Int, duration: Int) {
        if (time >= 1 && !isStartHandled) {
            isStartHandled = true
            events.triggerVASTImpressionEvent()
            events.triggerVASTCreativeViewEvent()
            events.triggerVASTStartEvent()
        }
        if (time >= 2 && !is2SHandled) {
            is2SHandled = true
            if let videoPlayer = player as? UIView, events.isChild(inViewableRect: videoPlayer) == true {
                events.triggerViewableImpressionEvent()
                delegate?.hasBeenVisible()
            }
        }
        if (time >= duration / 4 && !isFirstQuartileHandled) {
            isFirstQuartileHandled = true
            events.triggerVASTFirstQuartileEvent()
        }
        if (time >= duration / 2 && !isMidpointHandled) {
            isMidpointHandled = true
            events.triggerVASTMidpointEvent()
        }
        if (time >= (3 * duration) / 4 && !isThirdQuartileHandled) {
            isThirdQuartileHandled = true
            events.triggerVASTThirdQuartileEvent()
        }
    }
}
