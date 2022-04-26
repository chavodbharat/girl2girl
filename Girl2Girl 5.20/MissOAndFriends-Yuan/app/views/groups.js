import React from 'react';
import { Modal, RefreshControl, ScrollView, StyleSheet, Text, View , SafeAreaView} from 'react-native';
import { ColorPalette as CP, GlobalStyles as GS } from './../../styles';
import { Actions } from 'react-native-router-flux';
import Button from 'apsl-react-native-button';
import { Ajax } from './../services/ajax';
import { Storage } from './../services/storage';
import { Util } from './../services/util';
import { AlertDialog } from '../components/alert-dialog';
import { CreateConvoButton } from '../components/create-convo-button';
import { GroupButton } from './../components/group-button';
import { Loading } from '../components/loading';
import { FOLLOWING_TYPES } from './../decls/following';
import type { Group as Model } from './../decls/group';
import type { SessionUser } from './../decls/session-user';
import PropTypes from 'prop-types';
const PSMInterstitialAdView = require('./../module/ad-interstitial').PSMInterstitialAdView;

class GroupsView extends React.Component {

    props: {
        adCheckToken: number;
        sessionUser: SessionUser;
    };

    state: {
        activeGroups: Array<Model>;
        ajaxMsg: string;
        alertType: string;
        async: boolean;
        filteredGroups: Array<Model>;
        groups: Array<Model>;
        modalVisible: boolean;
        newestGroups: Array<Model>;
        popularGroups: Array<Model>;
        selectedFilter: number;
        selectedGroup: Model;
    };

    constructor(props) {
        super(props);
        this.state = {
            activeGroups: [],
            ajaxMsg: '',
            alertType: '',
            async: false,
            filteredGroups: [],
            groups: [],
            modalVisible: false,
            newestGroups: [],
            popularGroups: [],
            selectedFilter: 3,
            selectedGroup: null,
        };
        this.alertDialog = null;
    }

    render() {
        return (
            <SafeAreaView style={[GS.statusBar]}>
            <View style={[GS.flex1, GS.flexCol1, GS.bgColorLightPurple]}>
                <View style={[GS.header]}>
                    <Text style={[GS.headerText]}>Groups</Text>
                    <CreateConvoButton />
                </View>
                {this._renderView()}
                <Loading isOpen={this.state.async} />
                <AlertDialog
                    ref={alertDialog => {
                        this.alertDialog = alertDialog;
                    }}
                    onClose={this._afterGroupsChanged}
                    text={this.state.ajaxMsg}
                    type={this.state.alertType}
                />
            </View>
            </SafeAreaView>
        )
    }

    _afterGroupsChanged = async () => {
        await Storage.setNeedsReload();
    }

    componentDidMount() {
        if (this.props.sessionUser) {
            this._data();
        } else {
            this.setState({ groups: [] });
        }
        Util.shouldShowInterstitial(shouldDisplay => {
            if (shouldDisplay) {
                PSMInterstitialAdView.show();
            }
        });
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.adCheckToken !== this.props.adCheckToken) {
            Util.shouldShowInterstitial(shouldDisplay => {
                if (shouldDisplay) {
                    PSMInterstitialAdView.show();
                }
            });
        }
        if (nextProps.sessionUser !== this.props.sessionUser) {
            if (nextProps.sessionUser) {
                this._data();
            } else {
                this.setState({ groups: [] });
            }
        }
    }

    _renderView = () => {
        if (this.state.groups.length > 0) {
            return (
                <View style={[GS.flex1, GS.flexCol1, GS.flexStretch]}>
                    <View style={[GS.flexCol2, GS.flexStretch, styles.shouldGrow]}>
                        <Text style={[styles.pickText]}>Pick groups to follow and check out.</Text>
                        <View style={[GS.flexRow5, { marginTop: 20 }]}>
                            <Text
                                onPress={() => {
                                    this.filterPressed(0);
                                }}
                                style={this.state.selectedFilter === 0 ? GS.headerText : styles.filterUnselected}
                            >Popular</Text>
                            <Text style={[GS.headerText]}> | </Text>
                            <Text
                                onPress={() => {
                                    this.filterPressed(3);
                                }}
                                style={this.state.selectedFilter === 3 ? GS.headerText : styles.filterUnselected}
                            >All</Text>
                        </View>
                    </View>
                    <View style={[GS.flex1, GS.flexGrow5]}>
                        <ScrollView
                            keyboardShouldPersistTaps={'handled'}
                            refreshControl={
                                <RefreshControl
                                    refreshing={this.state.async}
                                    onRefresh={this._data}
                                    title={'Refreshing...'}
                                />
                            }
                            showsHorizontalScrollIndicator={false}
                            style={[GS.flexStretch, styles.scrollViewOffset]}
                        >
                            <View style={[GS.flexRow2, GS.flexWrap]}>
                                {this._renderFilteredGroupButtons()}
                            </View>
                        </ScrollView>
                    </View>
                    {this._renderModal()}
                </View>
            );
        }
        return (
            <View style={{flex : 1, backgroundColor :'white', flexDirection : 'row', paddingHorizontal : 15, alignItems : 'center', justifyContent : 'center'}}>
                <View style={[GS.flex2, GS.flexRow8, GS.flexWrap], { alignItems : 'center', justifyContent : 'center'}}>
                    <Text style={[GS.guestText, GS.textCenter]}>You are viewing the app as a guest. Please <Text
                        style={[GS.colorDarkPurple]} onPress={this.login}>Login </Text>or <Text
                        style={[GS.colorDarkPurple]} onPress={this.register}>Register</Text></Text>
                </View>
                <View style={[GS.flex3]} />
            </View>
        );
    };

    _renderFilteredGroupButtons = () => {
        const groupButtons = this.state.filteredGroups.map((group, idx) => {
            const bgColors = [GS.bgColorBrick, GS.bgColorAqua, GS.bgColorSoftPink, GS.bgColorDarkPurple, GS.bgColorOrange];
            const bgColor = group.is_following ? bgColors[idx % 5] : {};
            group.name = group.name.replace(/&amp;/g, '&');
            return (<GroupButton
                accessibility={group.name}
                classes={[bgColor]}
                index={idx}
                isGuest={this.props.sessionUser === null}
                key={idx}
                onPress={this.groupPressed}
                text={group.name}
            />);
        });
        return groupButtons;
    };

    _renderModal = () => {
        if (this.state.selectedGroup) {
            return (
                <Modal
                    animationType={'none'}
                    onRequestClose={this.onAndroidModalClose}
                    transparent
                    visible={this.state.modalVisible}
                >
                    <View style={[styles.modal, GS.flex1, GS.flexCol5]}>
                        <View style={[{ backgroundColor: 'rgba(255,255,255,1.0)', width: 250 }]}>
                            <View style={[GS.flexStretch, GS.flexRow5, GS.bgColorSkyBlue, GS.paddingV5]}>
                                <Text style={[styles.modalText, GS.colorWhite]}>Would you like to...</Text>
                            </View>
                            <View style={[GS.flexStretch, GS.flexCol2, GS.padding10]}>
                                <Text style={[styles.modalText]}>Would you like to {this.state.selectedGroup.is_following ? 'unfollow' : 'follow'} {this.state.selectedGroup.name} or go to its page?</Text>
                                <View style={[GS.flexStretch, GS.flexRow5, GS.marginT15]}>
                                    <Button
                                        accessibilityLabel={this.state.selectedGroup.is_following ? 'Unfollow' : 'Follow'}
                                        onPress={() => {
                                            this.setState({ modalVisible: false }, () => {
                                                this.state.selectedGroup.is_following ? this.unfollow() : this.follow();
                                            });
                                        }}
                                        style={[GS.btn, { borderColor: CP.moafSkyBlue, width: 85 }, GS.marginR10]}
                                        textStyle={[styles.modalText, GS.colorSkyBlue]}
                                    >{this.state.selectedGroup.is_following ? 'Unfollow' : 'Follow'}</Button>
                                    <Button
                                        accessibilityLabel={'Go To...'}
                                        onPress={this.goToGroup}
                                        style={[GS.btn, { borderColor: CP.moafSkyBlue, width: 85 }, GS.marginL10]}
                                        textStyle={[styles.modalText, GS.colorSkyBlue]}
                                    >Go To</Button>
                                </View>
                            </View>
                        </View>
                    </View>
                </Modal>
            );
        }
    };

    _data = () => {
        this.setState({ async: true });
        Ajax.getGroups(res => {
            const groups = res.groups;
            this.setState({
                activeGroups: groups.filter(g => g.is_active),
                filteredGroups: groups,
                groups: groups,
                newestGroups: groups.filter(g => g.is_newest),
                popularGroups: groups.filter(g => g.is_popular),
            });
            this.setState({ async: false });
            this.forceUpdate();
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

    filterPressed = (index: number) => {
        switch (index) {
            case 0:
                this.setState({ filteredGroups: this.state.popularGroups });
                break;
            case 1:
                this.setState({ filteredGroups: this.state.newestGroups });
                break;
            case 2:
                this.setState({ filteredGroups: this.state.activeGroups });
                break;
            case 3:
                this.setState({ filteredGroups: this.state.groups });
                break;
        }
        this.setState({ selectedFilter: index });
    };

    follow = () => {
        const following = {
            follower_id: this.props.sessionUser._id,
            following_id: this.state.selectedGroup._id,
            following_type: FOLLOWING_TYPES.GROUP,
        };
        this.setState({ async: true });
        Ajax.postFollowing(following, res => {
            this.setState({ async: false });
            const filteredGroups = this.state.filteredGroups;
            this.state.selectedGroup.is_following = true;
            this.setState({
                ajaxMsg: `The latest convos in ${this.state.selectedGroup.name} will now show up in your feed.`,
                alertType: 'Info',
                filteredGroups: filteredGroups
            }, () => {
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

    goToGroup = () => {
        this.setState({ modalVisible: false }, () => {
            Actions.group({ groupId: this.state.selectedGroup._id, adCheckToken: Util.randomNumber() });
        });
    };

    groupPressed = (idx: number) => {
        const filteredGroups = this.state.filteredGroups;
        const group = filteredGroups[idx];
        this.setState({ selectedGroup: group }, () => {
            this.setState({ modalVisible: true });
        });
    };

    login = () => {
        Actions.login();
    };

    onAndroidModalClose = () => {
        this.setState({
            modalVisible: false,
        });
    };

    register = () => {
        Actions.register();
    };

    unfollow = () => {
        const following = {
            follower_id: this.props.sessionUser._id,
            following_id: this.state.selectedGroup._id,
            following_type: FOLLOWING_TYPES.GROUP,
        };
        this.setState({ async: true });
        Ajax.deleteFollowing(following.follower_id, following.following_id, following.following_type, res => {
            const filteredGroups = this.state.filteredGroups;
            this.setState({ async: false });
            this.state.selectedGroup.is_following = false;
            this.setState({
                ajaxMsg: `The latest convos in ${this.state.selectedGroup.name} will no longer show up in your feed.`,
                alertType: 'Info',
                filteredGroups: filteredGroups
            }, () => {
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

GroupsView.propTypes = {
    adCheckToken: PropTypes.number.isRequired,
    sessionUser: PropTypes.object,
};

const styles = StyleSheet.create({
    filterUnselected: {
        color: CP.moafBlack,
        fontFamily: 'raleway',
        fontSize: 18,
        fontWeight: '700',
    },
    modal: {
        backgroundColor: 'rgba(0,0,0,0.75)',
        height: Util.getScreenHeight(),
        width: Util.getScreenWidth(),
    },
    modalText: {
        fontFamily: 'Raleway-Regular',
        fontSize: 15,
        fontWeight: Util.isAndroid() ? '400': '500',
    },
    pickText: {
        color: CP.moafWhite,
        fontFamily: 'Raleway-Regular',
        fontSize: Util.isAndroid() ? 15: 14,
        fontWeight: Util.isAndroid() ? '400' : '500',
        lineHeight: 25,
        marginLeft: 30,
        marginRight: 30,
        textAlign: 'center',
    },
    scrollViewOffset: Util.isIOS() ? { marginBottom: 45 } : {},
    shouldGrow: Util.isIOS() ? { flexGrow: 1 } : {},
});

export { GroupsView };
