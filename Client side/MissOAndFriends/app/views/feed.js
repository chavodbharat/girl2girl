import React from 'react';
import { Image, ListView, RefreshControl, StyleSheet, View, Text, Alert, Button } from 'react-native';
import { GlobalStyles as GS } from './../../styles';
import { Ajax } from './../services/ajax';
import { Util } from './../services/util';
import { ActionSheetFollow } from '../components/action-sheet-follow';
import { AdMrec } from '../components/ad-mrec';
import { AlertDialog } from '../components/alert-dialog';
import { CreateConvoButton } from '../components/create-convo-button';
import { Loading } from '../components/loading';
import { ShortConvo } from './../components/short-convo';
import type { SessionUser } from './../decls/session-user';
import { Storage } from './../services/storage'
import type { ShortConvo as Model } from './../decls/short-convo';
import { FOLLOWING_TYPES } from './../decls/following';
import PropTypes from 'prop-types';
const PSMInterstitialAdView = require('./../module/ad-interstitial').PSMInterstitialAdView;

class FeedView extends React.Component {

    props: {
        adCheckToken: number;
        sessionUser: SessionUser;
    };

    state: {
        ajaxMsg: string;
        alertType: string;
        alertTitle: string;
        async: boolean;
        convo: Model;
        convos: Array;
        followFn: Function;
        rawConvos: Array<Model>;
        willFollow: boolean;
        noGroupsText: string;
        noConvos: boolean;
        page: number;
        size: number;
        hasMore: boolean;
    };

    constructor(props: any) {
        super(props);
        this.state = {
            ajaxMsg: '',
            alertType: '',
            async: false,
            convo: null,
            convos: Util.newListViewDataSource(),
            followFn: () => {},
            rawConvos: [],
            willFollow: false,
            noGroupsText: "",
            noConvos: false,
            page: 0,
            size: 0,
            hasMore: true
        };
        this.actionSheet = null;
        this.alertDialog = null;
        this.refreshCalc = Util.newRefreshCalculator();    
    }

    render() {
        return (
            <View style={[GS.flex1, GS.flexCol1]}>
                <View style={[GS.bgColorLightPurple, GS.header]}>
                    <Image
                        source={require('./../img/welcome_logo.png')}
                        style={[styles.logo]}
                    />
                    <CreateConvoButton />
                </View>
                <View>
                    {this.state.noConvos ? <Text style={GS.textNoGroups}>{this.state.noGroupsText}</Text> : null }
                </View>
                <ListView
                    dataSource={this.state.convos}
                    enableEmptySections
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.async}
                            onRefresh={this._data}
                            title={'Refreshing...'}
                        />
                    }
                    renderRow={(convo, sectionID, rowID) => (
                        (convo && (rowID % 10 !== 0) || (rowID == 0)) ? 
                        <ShortConvo
                            key={convo._id}
                            convo={convo}
                            isGuest={this.props.sessionUser === null}
                            onFollow={this.onFollow}
                            rowID={rowID}
                            sectionID={sectionID}
                            moreButtonPress={this._loadNext}
                            size={this.state.size}
                            showMore={this._showMore}
                            showGroup
                            showUser
                        /> :
                        <AdMrec email={this.props.sessionUser ? this.props.sessionUser.email : 'example@example.com'} />
                    )}
                    style={[GS.flexStretch]}
                />                
                <Loading isOpen={this.state.async} />
                <ActionSheetFollow
                    ref={actionSheet => { this.actionSheet = actionSheet; }}
                    onPress={this.state.followFn}
                    titlePhrase={'this convo'}
                    willFollow={this.state.willFollow}
                />
                <AlertDialog
                    ref={alertDialog => { this.alertDialog = alertDialog; }}
                    text={this.state.ajaxMsg}
                    type={this.state.alertType}
                    title={this.state.alertTitle}
                />
            </View>
        );
    }

    _showMore = (rowID) => {        
        return this.state.size - 1 == rowID && this.state.hasMore;
    }

    _loadNext = () => {
        let page = this.state.page + 1;
        this.setState({
            page: page
        }, () => {            
            this._data(page);
        });
    };

    componentDidMount() {
        Util.shouldShowInterstitial(shouldDisplay => {
            if (shouldDisplay) {
                PSMInterstitialAdView.show();
            }
        });
    }

    _handleReload = (nextProps) => {
        const nextUser = nextProps.sessionUser;
        const thisUser = this.props.sessionUser;
        if (nextUser === null & thisUser === null) {
            if (!this.state.async) {
                this._data();
            }
        } else if (nextUser === null && thisUser !== null) {
            this._data();
        } else if (nextUser !== null && thisUser === null) {
            this._data();
        } else if (nextUser !== null && thisUser !== null) {
            if (nextUser._id !== thisUser._id) {
                if (!this.state.async) {
                    this._data();
                }
            }
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.adCheckToken !== this.props.adCheckToken) {
            Util.shouldShowInterstitial(shouldDisplay => {
                if (shouldDisplay) {
                    PSMInterstitialAdView.show();
                }
            });
        }
        Storage.needsReload().then((val) => { if (!!val) { this._data(); } else {
            this._handleReload(nextProps);
        } }).catch( () => {
            this._handleReload(nextProps);
        })
    }

    _data = (offset = 0) => {
        this.setState({ async: true });
        var self = this;
        Ajax.getFeed(res => {
            let convos = res.convos;    
            this.state.noConvos = ( convos.length === 0 );
            this.setState({ hasMore: res.has_next });
            let rc = this.state.rawConvos;
            if (offset != 0) {
                rc.push(...convos);
                convos = rc;                
            } else {
                this.setState({ page: 0 });
            }
            this.setState({size: convos.length});    
            this.setState({ async: false });
            if (this.state.noConvos) {
                Ajax.getTexts(texts => {
                    self.state.noGroupsText = texts['noGroupsSelectedText'];
                    self.forceUpdate();
                }, err => {});                
            }
            this.setState({
                convos: Util.newListViewDataSource().cloneWithRows(convos),
                rawConvos: convos,
            });
            Storage.removeNeedsRealod();
            //this.forceUpdate();
        }, err => {
            this.setState({ async: false });
            this.setState({
                ajaxMsg: err.message,
                alertType: 'Error',
            }, () => {
                this.alertDialog.open();
            });
        }, offset);
    };

    follow = () => {
        const following = {
            follower_id: this.props.sessionUser._id,
            following_id: this.state.convo._id,
            following_type: FOLLOWING_TYPES.CONVO,
        };
        this.setState({ async: true });
        Ajax.postFollowing(following, res => {
            const stateConvo = this.state.convo;
            const convo = this.state.rawConvos.find(c => c != null && c._id === stateConvo._id);
            convo.is_following = true;
            convo.num_followers = convo.num_followers + 1;
            this.setState({
                ajaxMsg: `This convo ${Util.sanitize(this.state.convo.text).substring(0, 20)}... will now show up in your feed.`,
                alertType: 'Info',
                async: false,
                rawConvos: this.state.rawConvos,
            }, () => {
                this.setState({
                    convos: Util.newListViewDataSource().cloneWithRows(this.state.rawConvos),
                });
                this.alertDialog.open();
            });
        }, err => {
            this.setState({ async: false });
            this.setState({
                ajaxMsg: err.message,
                alertType: 'Error',
            }, () => {
                this.alertDialog.open();
            });
        });
    };

    onFollow = (sectionID, rowID) => {
        const convo = this.state.convos.findData(sectionID, rowID);
        // can not un-follow your own convos
        if (Util.isSessionUserTheConvoPoster(this.props.sessionUser, convo)) {
            this.setState({
                ajaxMsg: "You can not follow your convo",
                alertType: 'Bubblegum'
            }, () => {
                this.alertDialog.open();
            });
            return false;
        }
        this.setState({
            convo: convo,
            followFn: convo.is_following ? this.unfollow : this.follow,
            willFollow: !convo.is_following
        }, () => {
            this.actionSheet.open();
        });
    };

    onScroll = obj => {
        if (!this.state.async) {
            const y = obj.nativeEvent.contentOffset.y;
            const shouldRefresh = this.refreshCalc.check(y);
            if (shouldRefresh) {
                this._data();
            }
        } else {
            this.refreshCalc.reset();
        }
    };

    unfollow = () => {
        const follower_id = this.props.sessionUser._id;
        const following_id = this.state.convo._id;
        this.setState({ async: true });
        Ajax.deleteFollowing(follower_id, following_id, FOLLOWING_TYPES.CONVO, res => {
            const stateConvo = this.state.convo;
            const convo = this.state.rawConvos.find(c => c != null && c._id === stateConvo._id);
            convo.is_following = false;
            convo.num_followers = convo.num_followers - 1;
            this.setState({
                ajaxMsg: `This convo ${Util.sanitize(this.state.convo.text.substring(0, 20))}... will no longer show up in your feed.`,
                alertType: 'Info',
                async: false,
                rawConvos: this.state.rawConvos,
            }, () => {
                this.setState({
                    convos: Util.newListViewDataSource().cloneWithRows(this.state.rawConvos),
                });
                this.alertDialog.open();
            });
        }, err => {
            this.setState({ async: false });
            this.setState({
                ajaxMsg: err.message,
                alertType: 'Error',
            }, () => {
                this.alertDialog.open();
            });
        });
    };

}

FeedView.propTypes = {
    adCheckToken: PropTypes.number.isRequired,
    sessionUser: PropTypes.object,
};

const styles = StyleSheet.create({
    logo: {
        height: 43,
        resizeMode: 'contain',
    }
});

export { FeedView };
