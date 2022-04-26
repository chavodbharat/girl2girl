/**
 * @Copyright:   SuperAwesome Trading Limited 2017
 * @Author:      Gabriel Coman (gabriel.coman@superawesome.tv)
 */

#import "SAWebPlayer.h"
#import "SANetwork.h"
#import <JavaScriptCore/JavaScriptCore.h>
#import <QuartzCore/QuartzCore.h>
#import <MediaPlayer/MediaPlayer.h>
#import <WebKit/WebKit.h>

@interface SAWebPlayer () <WKUIDelegate, WKNavigationDelegate, SAWebPlayerAuxProtocol>

@property (nonatomic, strong) NSString                      *html;

// param that says the web view was once loaded
@property (nonatomic, assign) BOOL                          finishedLoading;

// strong references to the click and event handlers
@property (nonatomic, strong) saWebPlayerDidReceiveEvent    eventHandler;
@property (nonatomic, strong) saWebPlayerDidReceiveClick    clickHandler;

@end

@implementation SAWebPlayer

- (id) initWithContentSize:(CGSize) contentSize
            andParentFrame:(CGRect) parentRect {
    
    // get a weak self reference
    __weak typeof (self) weakSelf = self;
    
    // init all defaults before init
    _eventHandler = ^(SAWebPlayerEvent event) {};
    _clickHandler = ^(NSURL *url) {};
    _finishedLoading = false;
    _contentSize = contentSize;
    _delegate = self;
    
    if (self = [super init]) {
        
        // clear color
        self.backgroundColor = [UIColor clearColor];
        
        // create the webview and add it as a subview
        CGRect contentRect = CGRectMake(0, 0, _contentSize.width, _contentSize.height);
        CGRect size = [self map:contentRect into:parentRect];
        
        WKWebViewConfiguration *configuration = [SAWebView defaultConfiguration];
        
        _webView = [[SAWebView alloc] initWithFrame:size configuration:configuration];
        
        // add notfication rotation
        [[NSNotificationCenter defaultCenter] addObserverForName:@"UIDeviceOrientationDidChangeNotification"
                                                          object:nil
                                                           queue:nil
                                                      usingBlock:^(NSNotification * note) {
                                                          [weakSelf.delegate didRotateScreen];
                                                      }];
        
        // set delegates
        _webView.UIDelegate = self;
        _webView.navigationDelegate = self;
        
        // add subview
        [self addSubview:_webView];
        
        // update parent frame
        [self updateParentFrame:parentRect];
        
    }
    
    return self;
}

- (void) removeFromSuperview {
    // remove notification
    [[NSNotificationCenter defaultCenter] removeObserver:self
                                                    name:@"UIDeviceOrientationDidChangeNotification"
                                                  object:nil];
    
    // finally remove self
    [super removeFromSuperview];
}

- (void) didMoveToSuperview {
    [self updateParentFrame:self.superview.frame];
    [super didMoveToSuperview];
}

- (void) didRotateScreen {
    [self updateParentFrame:self.superview.frame];
}

- (void) updateParentFrame:(CGRect) parentRect {
    
    CGRect contentRect = CGRectMake(0, 0, _contentSize.width, _contentSize.height);
    CGRect result = [self map:contentRect into:parentRect];
    [self setFrame:CGRectMake(0, 0, parentRect.size.width, parentRect.size.height)];
    [self.webView setFrame:result];
}

- (void) loadHTML:(NSString*)html witBase:(NSString*)base {
    // the base HTML that wraps the content html
    NSString *baseHtml = @"<html><head><meta name=\"viewport\" content=\"width=device-width initial-scale=1\" /><style>html, body, div { margin: 0px; padding: 0px; } html, body { width:100%; height:100%; } </style></head><body>_CONTENT_</body></html>";
    
    // replace content keyword with actual content
    baseHtml = [baseHtml stringByReplacingOccurrencesOfString:@"_CONTENT_" withString:html];
    
    // copy base Html
    _html = baseHtml;
    
    NSLog(@"Full HTML is %@", _html);
    
    // lock-and-load
    if (@available(iOS 9.0, *)) {
        [_webView loadData:[baseHtml dataUsingEncoding:NSUTF8StringEncoding]
                  MIMEType:@"text/html"
     characterEncodingName:@"UTF-8"
                   baseURL:[NSURL URLWithString:base]];
    } else {
        [_webView loadHTMLString:baseHtml baseURL:[NSURL URLWithString:base]];
    }
}

- (CGRect) map:(CGRect)sourceFrame into:(CGRect)boundingFrame {
    
    CGFloat sourceW = sourceFrame.size.width;
    CGFloat sourceH = sourceFrame.size.height;
    CGFloat boundingW = boundingFrame.size.width;
    CGFloat boundingH = boundingFrame.size.height;
    
    if (sourceW == 1 || sourceW == 0) { sourceW = boundingW; }
    if (sourceH == 1 || sourceH == 0) { sourceH = boundingH; }
    
    CGFloat sourceRatio = sourceW / sourceH;
    CGFloat boundingRatio = boundingW / boundingH;
    
    CGFloat X = 0, Y = 0, W = 0, H = 0;
    
    if (sourceRatio > boundingRatio) {
        W = boundingW;
        H = W / sourceRatio;
        X = 0;
        Y = (boundingH - H) / 2.0f;
    } else {
        H = boundingH;
        W = H * sourceRatio;
        Y = 0;
        X = (boundingW - W) / 2.0f;
    }
    
    return CGRectMake((NSInteger)X, (NSInteger)Y, (NSInteger)W, (NSInteger)H);
}

////////////////////////////////////////////////////////////////////////////////
// WebViewDelegate implementation
////////////////////////////////////////////////////////////////////////////////

- (WKWebView *)webView:(WKWebView *)webView createWebViewWithConfiguration:(WKWebViewConfiguration *)configuration forNavigationAction:(WKNavigationAction *)navigationAction windowFeatures:(WKWindowFeatures *)windowFeatures {
    if (_finishedLoading) {
        NSURL *url = [navigationAction.request URL];
        NSString *urlStr = [url absoluteString];
        
        // protect against about blanks
        if ([urlStr rangeOfString:@"about:blank"].location != NSNotFound) {
            return nil;
        }
        
        // guard against iframes
        if ([urlStr rangeOfString:@"sa-beta-ads-uploads-superawesome.netdna-ssl.com"].location != NSNotFound &&
            [urlStr rangeOfString:@"/iframes"].location != NSNotFound) {
            return nil;
        }
        
        // check to see if the URL has a redirect, and take only the redirect
        NSRange redirLoc = [urlStr rangeOfString:@"&redir="];
        if (redirLoc.location != NSNotFound) {
            NSInteger strStart = redirLoc.location + redirLoc.length;
            NSString *redir = [urlStr substringFromIndex:strStart];
            
            // update the new url
            url = [NSURL URLWithString:redir];
        }
        
        _clickHandler(url);
    }
    
    return nil;
}

- (void)webView:(WKWebView *)webView decidePolicyForNavigationAction:(WKNavigationAction *)navigationAction decisionHandler:(void (^)(WKNavigationActionPolicy))decisionHandler {
    
    if (_finishedLoading) {
        
        // get the request url
        NSURL *url = [navigationAction.request URL];
        
        // get the url as a string
        NSString *urlStr = [url absoluteString];
        
        // protect against about blanks
        if ([urlStr rangeOfString:@"about:blank"].location != NSNotFound) {
            decisionHandler(WKNavigationActionPolicyAllow);
            return;
        }
        
        // guard against iframes
        if ([urlStr rangeOfString:@"sa-beta-ads-uploads-superawesome.netdna-ssl.com"].location != NSNotFound &&
            [urlStr rangeOfString:@"/iframes"].location != NSNotFound) {
            
            NSLog(@"__WEBVIEW__: SA IFRAME");
            
            decisionHandler(WKNavigationActionPolicyAllow);
            return;
        }
        
        // check to see if the URL has a redirect, and take only the redirect
        NSRange redirLoc = [urlStr rangeOfString:@"&redir="];
        if (redirLoc.location != NSNotFound) {
            NSInteger strStart = redirLoc.location + redirLoc.length;
            NSString *redir = [urlStr substringFromIndex:strStart];
            
            // update the new url
            url = [NSURL URLWithString:redir];
        }
        
        // send a callback with the url
        _clickHandler(url);
        
        // don't propagate this
        decisionHandler(WKNavigationActionPolicyCancel);
        return;
    }

    // else just return true
    decisionHandler(WKNavigationActionPolicyAllow);
    return;
}

- (void)webView:(WKWebView *)webView didFinishNavigation:(WKNavigation *)navigation {
    if (!_finishedLoading) {
        _finishedLoading = true;
        _eventHandler(saWeb_Start);
    }
}

- (void)webView:(WKWebView *)webView didFailNavigation:(WKNavigation *)navigation withError:(NSError *)error {
    if (!_finishedLoading) {
        _finishedLoading = true;
        _eventHandler(saWeb_Error);
    }
}

////////////////////////////////////////////////////////////////////////////////
// Setters & Getters
////////////////////////////////////////////////////////////////////////////////

- (void) setEventHandler:(saWebPlayerDidReceiveEvent) handler {
    _eventHandler = handler != nil ? handler : _eventHandler;
}

- (void) setClickHandler:(saWebPlayerDidReceiveClick) handler {
    _clickHandler = handler != nil ? handler : _clickHandler;
}

- (WKWebView*) getWebView {
    return _webView;
}

@end
