import React from 'react';
import { Image, ListView, RefreshControl, StyleSheet, Text, View, Dimensions } from 'react-native';
import { GlobalStyles as GS, ColorPalette as CP } from './../../styles';
import { Ajax } from './../services/ajax';
import { Storage } from './../services/storage';
import { Util } from './../services/util';
import { ActionSheetFollow } from '../components/action-sheet-follow';
import { AdMrec } from '../components/ad-mrec';
import { AlertDialog } from '../components/alert-dialog';
import { BackButton } from '../components/back-button';
import { CreateConvoButton } from '../components/create-convo-button';
import { Loading } from '../components/loading';
import { ShortConvo } from './../components/short-convo';
import type { ShortGroup } from './../decls/short-group';
import type { ShortConvo as Model } from './../decls/short-convo';
import { FOLLOWING_TYPES } from './../decls/following';
import PropTypes from 'prop-types';
const PSMInterstitialAdView = require('./../module/ad-interstitial').PSMInterstitialAdView;

const ASPECT_RATIO = 3.312;

class GroupView extends React.Component {

    props: {
        adCheckToken: number;
        groupId: string;
    };

    state: {
        ajaxMsg: string;
        alertType: string;
        async: boolean;
        convo: Model;
        convos: Array;
        followFn: Function;
        group: ShortGroup;
        rawConvos: Array<Model>;
        willFollow: boolean;
        page: number;
        size: number;
        hasMore: boolean;
        height: number;
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
            group: {},
            rawConvos: [],
            willFollow: false,
            page: 0,
            size: 0,
            hasMore: true,
            height: Dimensions.get('window').width / ASPECT_RATIO
        };
        this.actionSheet = null;
        this.alertDialog = null;
        this.refreshCalc = Util.newRefreshCalculator();
        this.sessionUser = null;
        this.sessionUserListener = user => {
            this.sessionUser = user;
            this.forceUpdate();
        };
        Storage.addSessionUserListener(this.sessionUserListener);
    }

    render() {
        return (
            <View style={[GS.flex1, GS.flexCol1]}>
                <View style={[GS.header, GS.bgColorLightPurple]}>
                    <BackButton />
                    <Text style={[GS.headerText]}>{this.state.group.name ? this.state.group.name.replace(/&amp;/g, '&') : ""}</Text>
                    <CreateConvoButton />
                </View>
                {
                    this.state.group.name && <View>
                        <Image
                            source={{ uri: this.state.group.img_url + '?' + Math.random().toString() }}
                            style={[{ height: this.state.height, resizeMode: 'stretch', width: Util.getScreenWidth() }]}
                        />
                    </View>
                }
                <View style={[GS.paddingL10, GS.paddingV15, styles.latestConvosCont, GS.flexStretch]}>
                    <Text style={[GS.text]}>Latest convos</Text>
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
                        convo ?
                        <ShortConvo
                            key={convo._id}
                            convo={convo}
                            isGuest={this.sessionUser === null}
                            onFollow={this.onFollow}
                            rowID={rowID}
                            sectionID={sectionID}
                            showGroup={false}
                            showMore={this._showMore}
                            moreButtonPress={this._loadNext}
                            showUser
                        /> :
                        <AdMrec email={this.sessionUser ? this.sessionUser.email : 'example@example.com'} />
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
                />
            </View>
        );
    }

    componentDidMount() {
        this._data();
        Util.shouldShowInterstitial(shouldDisplay => {
            if (shouldDisplay) {
                PSMInterstitialAdView.show();
            }
        });
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.adCheckToken !== this.props.adCheckToken) {
            Util.shouldShowInterstitial(shouldDisplay => {
                if (shouldDisplay) {
                    PSMInterstitialAdView.show();
                }
            });
        }
        if (nextProps.groupId !== this.props.groupId) {
            this._data();
        }
        if (nextProps.groupId === this.props.groupId) {
            if (!this.state.async) {
                this._data();
            }
        }
    }

    componentWillUnmount() {
        Storage.removeSessionUserListener(this.sessionUserListener);
    }

    _data = (offset = 0) => {
        this.setState({ async: true });
        Ajax.getGroup(this.props.groupId, res => {
            this.setState({
                group: res,
            });
            Ajax.getGroupConvos(this.props.groupId, res => {
                let convos = res.convos;
                Util.insertAd(convos);
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
                this.setState({
                    convos: Util.newListViewDataSource().cloneWithRows(convos),
                    rawConvos: convos,
                });
                this.forceUpdate();
            }, err => {
                this.setState({ async: false });
                this.setState({
                    ajaxMsg: err.message,
                    alertType: 'Error',
                }, () => {
                    this.alertDialog.open();
                });
            }, offset);
        }, err => {
            this.setState({ async: false });
            this.setState({
                ajaxMsg: err.message,
            }, () => {
                this.alertDialog.open();
            });
        });
    };

    follow = () => {
        const following = {
            follower_id: this.sessionUser._id,
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
                ajaxMsg: `This convo ${this.state.convo.text.substring(0, 20)}... will now show up in your feed.`,
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

    onFollow = (sectionID, rowID) => {
        const convo = this.state.convos.findData(sectionID, rowID);
        // can not un-follow your own convos
        if (Util.isSessionUserTheConvoPoster(this.sessionUser, convo)) {
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
        const follower_id = this.sessionUser._id;
        const following_id = this.state.convo._id;
        this.setState({ async: true });
        Ajax.deleteFollowing(follower_id, following_id, FOLLOWING_TYPES.CONVO, res => {
            const stateConvo = this.state.convo;
            const convo = this.state.rawConvos.find(c => c != null && c._id === stateConvo._id);
            convo.is_following = false;
            convo.num_followers = convo.num_followers - 1;
            this.setState({
                ajaxMsg: `This convo ${this.state.convo.text.substring(0, 20)}... will no longer show up in your feed.`,
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

GroupView.propTypes = {
    adCheckToken: PropTypes.number.isRequired,
    groupId: PropTypes.string.isRequired,
};

const styles = StyleSheet.create({
    groupImg: {
        resizeMode: 'stretch',
        width: Util.getScreenWidth(),
    },
    latestConvosCont: {
        borderBottomColor: CP.moafWhite,
        borderBottomWidth: 1,
        padding: 10,
    },
});

export { GroupView };
