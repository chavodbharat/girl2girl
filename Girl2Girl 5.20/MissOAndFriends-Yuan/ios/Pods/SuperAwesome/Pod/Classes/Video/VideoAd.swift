//
//  SAVideoAd2.swift
//  SuperAwesome
//
//  Created by Gabriel Coman on 17/12/2018.
//
import UIKit

public enum AdState {
    case none
    case loading
    case hasAd(ad: SAAd)
}

@objc(SAVideoAd) public class VideoAd: NSObject {
    
    static var isTestingEnabled: Bool = Bool(truncating: NSNumber(value: SA_DEFAULT_TESTMODE))
    static var isParentalGateEnabled: Bool = Bool(truncating: NSNumber(value: SA_DEFAULT_PARENTALGATE))
    static var isBumperPageEnabled: Bool = Bool(truncating: NSNumber(value: SA_DEFAULT_BUMPERPAGE))
    static var shouldAutomaticallyCloseAtEnd: Bool = Bool(truncating: NSNumber(value: SA_DEFAULT_CLOSEATEND))
    static var shouldShowCloseButton: Bool = Bool(truncating: NSNumber(value: SA_DEFAULT_CLOSEBUTTON))
    
    static var shouldShowSmallClickButton: Bool = Bool(truncating: NSNumber(value: SA_DEFAULT_SMALLCLICK))
    static var orientation: SAOrientation = SAOrientation(rawValue: Int(SA_DEFAULT_ORIENTATION))!
    static var configuration: SAConfiguration = SAConfiguration(rawValue: Int(SA_DEFAULT_CONFIGURATION))!
    static var isMoatLimitingEnabled: Bool = Bool(truncating: NSNumber(value: SA_DEFAULT_MOAT_LIMITING_STATE))
    static var playback: SARTBStartDelay = SARTBStartDelay(rawValue: Int(SA_DEFAULT_PLAYBACK_MODE))!
    
    private static var callback: sacallback? = nil
    
    private static var ads = Dictionary<Int, AdState>()
    
    private static let events: SAEvents = SAEvents()
    
    ////////////////////////////////////////////////////////////////////////////
    // Internal control methods
    ////////////////////////////////////////////////////////////////////////////
    
    @objc(load:)
    public static func load(withPlacementId placementId: Int) {
        let adState = ads[placementId] ?? .none
        
        switch adState {
        case .none:
            ads[placementId] = .loading
            
            let session = SASession()
            session.setTestMode(isTestingEnabled)
            session.setConfiguration(configuration)
            session.setVersion(SAVersion.getSdkVersion())
            session.setPos(SARTBPosition.POS_FULLSCREEN)
            session.setPlaybackMethod(SARTBPlaybackMethod.PB_WITH_SOUND_ON_SCREEN)
            session.setInstl(SARTBInstl.IN_FULLSCREEN)
            session.setSkip(shouldShowCloseButton ? SARTBSkip.SK_SKIP : SARTBSkip.SK_NO_SKIP)
            session.setStartDelay(playback)
            let size = UIScreen.main.bounds.size
            session.setWidth(Int(size.width))
            session.setHeight(Int(size.height))
            
            let loader = SALoader()
            loader.loadAd(placementId, withSession: session) { (response: SAResponse?) in
                
                guard let response = response, response.status == 200 else {
                    self.ads[placementId] = AdState.none
                    self.callback?(placementId, SAEvent.adFailedToLoad)
                    return
                }
                
                guard let ad = response.ads.firstObject as? SAAd,
                    response.isValid(),
                    ad.creative.details.media.isDownloaded else {
                        self.ads[placementId] = AdState.none
                        self.callback?(placementId, SAEvent.adEmpty)
                        return
                }
                
                // create events object
                events.setAd(ad, andSession: session)
                if (!self.isMoatLimitingEnabled) {
                    events.disableMoatLimiting()
                }
                
                // reset video events
                self.ads[placementId] = .hasAd(ad: ad)
                self.callback?(placementId, SAEvent.adLoaded)
            }
            
        case .loading:
            break
        case .hasAd:
            callback?(placementId, SAEvent.adAlreadyLoaded)
        }
    }
    
    @objc(play:fromVC:)
    public static func play(withPlacementId placementId: Int, fromVc viewController: UIViewController) {
        let adState = ads[placementId] ?? .none
        
        switch adState {
        case .hasAd(let ad):
            let config = VideoViewController.Config(showSmallClick: shouldShowSmallClickButton,
                                                    showSafeAdLogo: ad.isPadlockVisible,
                                                    showCloseButton: shouldShowCloseButton,
                                                    shouldCloseAtEnd: shouldAutomaticallyCloseAtEnd,
                                                    isParentalGateEnabled: isParentalGateEnabled,
                                                    isBumperPageEnabled: isBumperPageEnabled,
                                                    orientation: orientation)
            let adViewController = VideoViewController(withAd: ad,
                                                       andEvents: events,
                                                       andCallback: callback,
                                                       andConfig: config)
            adViewController.modalPresentationStyle = .fullScreen
            adViewController.modalTransitionStyle = .coverVertical
            viewController.present(adViewController, animated: true)
            ads[placementId] = AdState.none
            break
        default:
            callback?(placementId, SAEvent.adFailedToShow)
            break
        }
    }
    
    @objc(hasAdAvailable:)
    public static func hasAdAvailable(placementId: Int) -> Bool {
        let adState = ads[placementId] ?? .none
        switch adState {
        case .hasAd: return true
        default: return false
        }
    }
    
    @objc(getAd:)
    public static func getAd(placementId: Int) -> SAAd? {
        let adState = ads[placementId] ?? .none
        switch adState {
        case .hasAd(let ad): return ad
        default: return nil
        }
    }
    
    ////////////////////////////////////////////////////////////////////////////
    // setters
    ////////////////////////////////////////////////////////////////////////////
    
    @objc(setCallback:)
    public static func setCallback(_ callback: @escaping sacallback) {
        self.callback = callback
    }
    
    @objc(setTestMode:)
    public static func setTestMode(_ testMode: Bool) {
        isTestingEnabled = testMode
    }
    
    @objc(enableTestMode)
    public static func enableTestMode() {
        setTestMode(true)
    }
    
    @objc(disableTestMode)
    public static func disableTestMode() {
        setTestMode(false)
    }
    
    @objc(setParentalGate:)
    public static func setParentalGate(_ parentalGate: Bool) {
        isParentalGateEnabled = parentalGate
    }
    
    @objc(enableParentalGate)
    public static func enableParentalGate() {
        setParentalGate(true)
    }
    
    @objc(disableParentalGate)
    public static func disableParentalGate() {
        setParentalGate(false)
    }
    
    @objc(setBumperPage:)
    public static func setBumperPage(_ bumperPage: Bool) {
        isBumperPageEnabled = bumperPage
    }
    
    @objc(enableBumperPage)
    public static func enableBumperPage() {
        setBumperPage(true)
    }
    
    @objc(disableBumperPage)
    public static func disableBumperPage() {
        setBumperPage(false)
    }
    
    @objc(setConfiguration:)
    public static func setConfiguration(_ config: SAConfiguration) {
        configuration = config
    }
    
    @objc(setConfigurationProduction)
    public static func setConfigurationProduction() {
        setConfiguration(SAConfiguration.PRODUCTION)
    }
    
    @objc(setConfigurationStaging)
    public static func setConfigurationStaging() {
        setConfiguration(SAConfiguration.STAGING)
    }
    
    @objc(setOrientation:)
    public static func setOriantation(_ orientation: SAOrientation) {
        self.orientation = orientation
    }
    
    @objc(setOrientationAny)
    public static func setOrientationAny() {
        setOriantation(SAOrientation.ANY)
    }
    
    @objc(setOrientationPortrait)
    public static func setOrientationPortrait() {
        setOriantation(SAOrientation.PORTRAIT)
    }
    
    @objc(setOrientationLandscape)
    public static func setOrientationLandscape() {
        setOriantation(SAOrientation.LANDSCAPE)
    }
    
    @objc(setCloseButton:)
    public static func setCloseButton(_ close: Bool) {
        shouldShowCloseButton = close
    }
    
    @objc(enableCloseButton)
    public static func enableCloseButton() {
        setCloseButton(true)
    }
    
    @objc(disableCloseButton)
    public static func disableCloseButton() {
        setCloseButton(false)
    }
    
    @objc(setSmallClick:)
    public static func setSmallClick(_ smallClick: Bool) {
        shouldShowSmallClickButton = smallClick
    }
    
    @objc(enableSmallClickButton)
    public static func enableSmallClickButton() {
        setSmallClick(true)
    }
    
    @objc(disableSmallClickButton)
    public static func disableSmallClickButton() {
        setSmallClick(false)
    }
    
    @objc(setCloseAtEnd:)
    public static func setCloseAtEnd(_ close: Bool) {
        shouldAutomaticallyCloseAtEnd = close
    }
    
    @objc(enableCloseAtEnd)
    public static func enableCloseAtEnd() {
        setCloseAtEnd(true)
    }
    
    @objc(disableCloseAtEnd)
    public static func disableCloseAtEnd() {
        setCloseAtEnd(false)
    }
    
    @objc(setPlaybackMode:)
    public static func setPlaybackMode(_ delay: SARTBStartDelay) {
        playback = delay
    }
    
    public static func getCallback() -> sacallback? {
        return callback
    }
    
    public static func getAds() -> Dictionary<Int, AdState> {
        return ads
    }
    
    public static func getEvents() -> SAEvents {
        return events
    }
    
    @objc(disableMoatLimiting)
    public static func disableMoatLimiting() {
        VideoAd.isMoatLimitingEnabled = false
    }
    
    public static func setAd(ad: SAAd, forPlacementId: Int) {
        ads[forPlacementId] = AdState.hasAd(ad: ad)
    }
}
