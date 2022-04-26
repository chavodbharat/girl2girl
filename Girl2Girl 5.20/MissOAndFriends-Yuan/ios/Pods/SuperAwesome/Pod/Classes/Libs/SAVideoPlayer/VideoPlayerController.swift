//
//  AwesomeMediaControl.swift
//  Pods
//
//  Created by Gabriel Coman on 10/12/2018.
//

import AVFoundation
import AVKit
import Foundation

@objc(SAVideoPlayerController)
public class VideoPlayerController: AVPlayer, VideoPlayerControls {
    
    private let videoEndEvent = NSNotification.Name.AVPlayerItemDidPlayToEndTime
    private let videoEndSelector = #selector(didFinishPlaying(_:))
    private let periodicTimeInterval = CMTime(seconds: 1, preferredTimescale: 2)
    
    private var timeObserver: Any?
    
    public weak var delegate: VideoPlayerControlsDelegate?
    private let notif = NotificationCenter.default
    private let mainQueue = DispatchQueue.main
    private var didEndObserver: NSObjectProtocol?
    private var item: AVPlayerItem?
    
    ////////////////////////////////////////////////////////////////////////////
    // Init
    ////////////////////////////////////////////////////////////////////////////
    
    public override init() {
        super.init()
        
        didEndObserver = notif.addObserver(forName: videoEndEvent, object: nil, queue: OperationQueue.main, using: { (notif) in
            self.didFinishPlaying(notif)
        })
    }
    
    deinit {
        removeObservers()
    }
    
    public func removeObservers() {
        if let uDidEndObserver = didEndObserver {
            notif.removeObserver(uDidEndObserver)
        }
        if let timeObserver = timeObserver {
            removeTimeObserver(timeObserver)
        }
    }
    
    ////////////////////////////////////////////////////////////////////////////
    // MediaControl
    ////////////////////////////////////////////////////////////////////////////
    
    public func play(url: URL) {
        let asset = AVAsset(url: url)
        item = AVPlayerItem(asset: asset)
        if let item = item {
            replaceCurrentItem(with: item)
            timeObserver = addPeriodicTimeObserver(forInterval: periodicTimeInterval, queue: mainQueue, using: timeFunction)
            delegate?.didPrepare(control: self)
        }
    }
    
    public func start() {
        play()
    }
    
    public func reset() {
        pause()
        removeObservers()
    }
    
    public func destroy() {
        reset()
    }
    
    public func seekTo(position: CMTime) {
        seek(to: position)
    }
    
    public func getDuration() -> Int {
        guard let duration = item?.duration, duration != CMTime.indefinite else {
            return 0
        }
        let seconds = CMTimeGetSeconds(duration)
        return Int(seconds)
    }
    
    public func getCurrentPosition() -> Int {
        guard let time = item?.currentTime(), time != CMTime.indefinite else {
            return 0
        }
        let seconds = CMTimeGetSeconds(time)
        return Int(seconds)
    }
    
    ////////////////////////////////////////////////////////////////////////////
    // Set delegate
    ////////////////////////////////////////////////////////////////////////////
    
    public func set(delegate: VideoPlayerControlsDelegate) {
        self.delegate = delegate
    }
    
    ////////////////////////////////////////////////////////////////////////////
    // Different observers
    ////////////////////////////////////////////////////////////////////////////
    
    @objc
    private func didFinishPlaying(_ notification: Notification) {
        mainQueue.async {
            self.delegate?.didCompleteMedia(control: self,
                                            time: self.getCurrentPosition(),
                                            duration: self.getDuration())
        }
    }
    
    private func timeFunction(_ time: CMTime) {
        let time = CMTimeGetSeconds(time)
        delegate?.didUpdateTime(control: self, time: Int(time), duration: getDuration())
    }
}
