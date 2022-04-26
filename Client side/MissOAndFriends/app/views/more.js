import React from 'react';
import { Image, Linking, StyleSheet, Text, Alert, TouchableHighlight, View, AsyncStorage } from 'react-native';
import { GlobalStyles as GS, ColorPalette as CP } from './../../styles';
import { Actions } from 'react-native-router-flux';
import { Storage } from './../services/storage';
import { Ajax }    from './../services/ajax';
import { Util }    from './../services/util';
import { AlertDialog } from '../components/alert-dialog';
import { CreateConvoButton } from '../components/create-convo-button';
import type { SessionUser } from './../decls/session-user';
import { Loading } from '../components/loading';
import PropTypes from 'prop-types';
const PSMInterstitialAdView = require('./../module/ad-interstitial').PSMInterstitialAdView;

import { Platform } from 'react-native';

class MoreView extends React.Component {

    props: {
        adCheckToken: number;
        sessionUser: SessionUser;
    };

    state: {
        sessionUser: SessionUser;
        async: boolean;
        paddingForTutorial: number;
        qtWasVisited: boolean;
    };

    constructor(props: any) {
        super(props);        
        this.state = {
            sessionUser: this.props.sessionUser,
            async: false,
            paddingForTutorial: 18,
            qtWasVisited: true,
			pnWasVisited: true
        };
        this.alertDialog = null;
        Storage.qtWasVisited().then((res) => {
            if (res == null) {
                this.setState({
                    paddingForTutorial: 13,
                    qtWasVisited: false
                })
            }
        });
		Storage.pnWasVisited().then((res) => {
            if (res == null) {
                this.setState({
                    paddingForTutorial: 13,
                    pnWasVisited: false
                })
            }
        });
    }

    render() {
        return (
            <View style={[GS.flex1, GS.flexCol1, {backgroundColor: CP.moafWhite}]}>
                <View style={[GS.header, GS.bgColorLightPurple]}>
                    <Text style={[GS.headerText]}>More</Text>
                    <CreateConvoButton />
                </View>
                <View style={[GS.flexCol1, GS.flexStretch, {backgroundColor: CP.moafWhite}]}>
                    <View style={[GS.flexRow4, GS.flexStretch, styles.bottomBorder, styles.generalPadding]}>
                        {this._renderAvatarRow()}
                    </View>
                    {/*<TouchableHighlight*/}
                        {/*activeOpacity={1.0}*/}
                        {/*onPress={this.settings}*/}
                        {/*style={[GS.flexRow4, GS.flexStretch, styles.bottomBorder, styles.generalPadding]}*/}
                        {/*underlayColor={'transparent'}*/}
                    {/*>*/}
                        {/*<Text style={[styles.pageText]}>Settings</Text>*/}
                    {/*</TouchableHighlight>*/}					
                    <TouchableHighlight
                        activeOpacity={1.0}
                        onPress={this.help}
                        style={[GS.flexRow4, GS.flexStretch, styles.bottomBorder, styles.generalPadding]}
                        underlayColor={'transparent'}
                    >
                        <Text style={[styles.pageText]}>Help</Text>
                    </TouchableHighlight>
					{ this.state.sessionUser &&
						<TouchableHighlight
							activeOpacity={1.0}
							onPress={this.pushSettings}
							style={[GS.flexRow4, GS.flexStretch, styles.bottomBorder, styles.generalPadding]}
							underlayColor={'transparent'}
						>
							<View style={[{flexDirection: 'row'}]}>
								<Text style={[styles.pageText]}>Push Notifications</Text>
								{this.state.pnWasVisited ? null : 
								<Image
									source={require('./../img/newbang.png')}
									style={[{ height: 30, width: 30, marginLeft: 10, marginTop: -5, padding: 0}]}
								/>
								}
							</View>
						</TouchableHighlight>
					}
                    <TouchableHighlight
                        activeOpacity={1.0}
                        onPress={this.tutorial}
                        style={[GS.flexRow4, GS.flexStretch, styles.bottomBorder, {
                                paddingBottom: this.state.paddingForTutorial,
                                paddingLeft: 15,
                                paddingRight: 15,
                                paddingTop: 18}]}
                        underlayColor={'transparent'}
                    >
                        <View style={[{flexDirection: 'row'}]}>
                            <Text style={[styles.pageText]}>Quick tour</Text>
                            {this.state.qtWasVisited ? null : 
                            <Image
                                source={require('./../img/newbang.png')}
                                style={[{ height: 30, width: 30, marginLeft: 10, marginTop: -5, padding: 0}]}
                            />
                            }
                        </View>
                    </TouchableHighlight>
                    <TouchableHighlight
                        activeOpacity={1.0}
                        onPress={this.privacy}
                        style={[GS.flexRow4, GS.flexStretch, styles.bottomBorder, styles.generalPadding]}
                        underlayColor={'transparent'}
                    >
                        <Text style={[styles.pageText]}>Privacy Policy</Text>
                    </TouchableHighlight>
                    <TouchableHighlight
                        activeOpacity={1.0}
                        onPress={this.terms}
                        style={[GS.flexRow4, GS.flexStretch, styles.bottomBorder, styles.generalPadding]}
                        underlayColor={'transparent'}
                    >
                        <Text style={[styles.pageText]}>Terms and Conditions</Text>
                    </TouchableHighlight>
                    {this._renderLogRow()}
                </View>
                <AlertDialog
                    ref={alertDialog => { this.alertDialog = alertDialog; }}
                    text={''}
                    type={'Error'}
                />
                <Loading isOpen={this.state.async} />
            </View>
        );
    }

    componentDidMount() {
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
        if (nextProps.sessionUser !== this.props.sessionUser) {
            this.setState({ sessionUser: nextProps.sessionUser });
        }
    }
	
	gotoPushSettings = () => {
		Actions.pushSettings({ adCheckToken: Util.randomNumber(), sessionUser: this.props.sessionUser });
	}
	
	pushSettings = () => {
		if (this.state.pnWasVisited) {
            this.gotoPushSettings();
        } else {
			this.setState({
				pnWasVisited: true
			});
            Storage.visitPN().then(this.gotoPushSettings);
        }
	}

    _renderAvatar = () => {
        if (this.state.sessionUser.photo_url) {
            return (
                <Image
                    source={{ uri: this.state.sessionUser.photo_url }}
                    style={[{ height: 60, width: 60 }, styles.avatar]}
                />
            );
        } else {
            return (
                <Image
                    source={require('./../img/icon_profile_picture.png')}
                    style={[{ height: 60, width: 60 }, styles.avatar]}
                />
            );
        }
    }

    _renderAvatarRow = () => {
        if (this.state.sessionUser) {
            return (
                <TouchableHighlight
                    activeOpacity={1.0}
                    onPress={this.profile}
                    style={[GS.flexRow4, GS.flexStretch]}
                    underlayColor={'transparent'}
                >
                    <View style={[GS.flexRow4, GS.flexStretch]}>
                        {this._renderAvatar()}
                        <View style={[GS.flexCol1, GS.marginL10]}>
                            <Text style={[styles.pageText]}>
                                <Text style={[GS.colorLightPurple, GS.bold]}>{this.getUsername()}</Text>                                
                            </Text>
                            {this._renderLocation()}
                        </View>
                    </View>
                </TouchableHighlight>
            );
        }
        return (
            <TouchableHighlight
                activeOpacity={1.0}
                onPress={this.guest}
                style={[GS.flexRow4, GS.flexStretch]}
                underlayColor={'transparent'}
            >
                <View style={[GS.flexRow4, GS.flexStretch]}>
                    <Image
                        source={{uri: 'https://placehold.it/60.png'}}
                        style={[{ height: 60, width: 60 }, styles.avatar]}
                    />
                    <View style={[GS.flexCol1, GS.marginL10]}>
                        <Text style={[styles.pageText]}>{this.getUsername()}</Text>
                    </View>
                </View>
            </TouchableHighlight>
        );
    };

    _renderLocation = () => {
        if (this.state.sessionUser && this.state.sessionUser.country.alpha_3 === 'USA') {
            return (
                <Text style={[styles.pageText]}>
                    {this.state.sessionUser.state.name}, {this.state.sessionUser.country.name}
                </Text>
            );
        }
        return (
            <Text style={[styles.pageText]}>
                {this.state.sessionUser.country.name}
            </Text>
        );
    };

    _renderLogRow = () => {
        if (this.state.sessionUser) {
            return (
                <TouchableHighlight
                    activeOpacity={1.0}
                    onPress={this.logout}
                    style={[GS.flexRow4, GS.flexStretch, styles.bottomBorder, styles.generalPadding]}
                    underlayColor={'transparent'}
                >
                    <Text style={[styles.pageText]}>Logout</Text>
                </TouchableHighlight>
            );
        }
        return (
            <TouchableHighlight
                activeOpacity={1.0}
                onPress={this.login}
                style={[GS.flexRow4, GS.flexStretch, styles.bottomBorder, styles.generalPadding]}
                underlayColor={'transparent'}
            >
                <Text style={[styles.pageText]}>Login</Text>
            </TouchableHighlight>
        );
    };

    getAge = () => {
        return Util.getDifferenceInYears(this.state.sessionUser.birth_date);
    };

    getUsername = () => {
        if (this.state.sessionUser) {
            return this.state.sessionUser.username;
        }
        return 'Guest';
    };

    guest = () => {
        Actions.guest({ adCheckToken: Util.randomNumber() });
    };

    help = () => {
        Linking.openURL('https://missoandfriends.com/girl-2-girl-wall-app/');
    };

    gotoTutorial = () => {
        Linking.openURL('https://missoandfriends.com/girl2girl-wall-tutorial/');
    };

    tutorial = () => {
        if (this.state.qtWasVisited) {
            this.gotoTutorial();
        } else {
			this.setState({
				qtWasVisited: true
			});
            Storage.visitQT().then(this.gotoTutorial);
        }
    };

    login = () => {
        Actions.login();
    };

    logout = async () => {
        this.setState({
            async: true
        });
		let fcmToken = await AsyncStorage.getItem('fcmToken');
		if (fcmToken) {
			await Ajax.removeToken({
				token: fcmToken, os: (Platform.OS === 'ios' ? 'iOS': 'Android')
			});
		}
        Ajax.logout().then(() => {   
            this.setState({
                async: false
            }, () => {
                Actions.welcome({ refreshToken: Util.randomNumber() });
            });         
        }).catch((err) => {
            this.setState({
                async: false
            });
        });
    };

    privacy = () => {
        Linking.openURL('https://missoandfriends.com/privacy-policy/');
    };

    profile = () => {
        Actions.profile({ adCheckToken: Util.randomNumber() });
    };

    settings = () => {
        // TODO: tabled to post 1.0 release
    };

    terms = () => {
        Linking.openURL('https://missoandfriends.com/terms-condition-girl2girl-wall-app');
    };
}

MoreView.propTypes = {
    adCheckToken: PropTypes.number.isRequired,
    sessionUser: PropTypes.object,
};

const styles = StyleSheet.create({
    avatar: {
        borderRadius: 30,
        resizeMode: 'cover',
    },
    bottomBorder: {
        borderBottomColor: CP.moafBorder,
        borderBottomWidth: 1,
    },
    generalPadding: {
        paddingBottom: 18,
        paddingLeft: 15,
        paddingRight: 15,
        paddingTop: 18,
    },
    pageText: {
        color: CP.moafBlack,
        fontFamily: 'Raleway-Regular',
        fontSize: 16,
        fontWeight: Util.isAndroid() ? '400' : '500',
    }
});

export { MoreView };
