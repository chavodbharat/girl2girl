import React from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableHighlight, View, Alert, SafeAreaView } from 'react-native';
import { GlobalStyles as GS, ColorPalette as CP } from './../../styles';
import { Actions } from 'react-native-router-flux';
import dismissKeyboard from 'react-native-dismiss-keyboard';
import { Ajax } from './../services/ajax';
import { Photos } from './../services/photos';
import { Schema } from './../services/schema';
import { Storage } from './../services/storage';
import { Util } from './../services/util';
import { AlertDialog } from '../components/alert-dialog';
import { BiActionDialog } from '../components/biaction-dialog';
import { ActionButton } from './../components/action-button';
import { BackButton } from '../components/back-button';
import { Loading } from '../components/loading';
import { MoafPicker } from './../components/picker';
import { ValidationError } from './../components/validation-error';
import type { Country } from './../decls/country';
import type { SessionUser } from './../decls/session-user';
import type { UsaState } from './../decls/usa-state';
const PSMInterstitialAdView = require('./../module/ad-interstitial').PSMInterstitialAdView;
import PropTypes from 'prop-types';

class ProfileView extends React.Component {

    props: {
        adCheckToken: number;
    };

    state: {
        ajaxMsg: string;
        alertType: string;
        async: boolean;
        avatarUri: any;
        changePasswordInError: boolean;
        confirmPassword: string;
        confirmPasswordInError: boolean;
        confirmPasswordMsg: string;
        countryInError: boolean;
        countryMsg: string;
        email: string;
        emailInError: boolean;
        emailMsg: string;
        nameFirst: string;
        nameFirstInError: boolean;
        nameFirstMsg: string;
        newPassword: string;
        newPasswordInError: boolean;
        newPasswordMsg: string;
        oldPassword: string;
        oldPasswordInError: boolean;
        oldPasswordMsg: string;
        openCountry: boolean;
        openUsaState: boolean;
        selectedCountry: Country;
        selectedUsaState: UsaState;
        sessionUser: SessionUser;
        updateInError: boolean;
        usaStateInError: boolean;
        usaStateMsg: string;
    };

    constructor(props: any) {
        super(props);
        this.state = {
            ajaxMsg: '',
            alertType: '',
            async: false,
            avatarUri: null,
            changePasswordInError: true,
            confirmPassword: '',
            confirmPasswordInError: true,
            confirmPasswordMsg: '',
            countryInError: false,
            countryMsg: '',
            email: '',
            emailInError: false,
            emailMsg: '',
            nameFirst: '',
            nameFirstInError: false,
            nameFirstMsg: '',
            newPassword: '',
            newPasswordInError: true,
            newPasswordMsg: '',
            oldPassword: '',
            oldPasswordInError: true,
            oldPasswordMsg: '',
            openCountry: false,
            openUsaState: false,
            selectedCountry: null,
            selectedUsaState: null,
            sessionUser: null,
            updateInError: true,
            usaStateInError: false,
            usaStateMsg: '',
        };
        this.alertDialog = null;
        this.biActionDialog = null;
        this.countries = Util.countries;
        this.usaStates = Util.getStates();
        this.platform = Platform.OS;
        if (Util.isAndroid()) {
            this.countries.unshift({
                alpha_3: null,
                name: 'country',
            });
            this.usaStates.unshift({
                abbreviation: null,
                name: 'usa state',
            });
        }
        this.sessionUserListener = user => {
            this.setState({
                email: user.email,
                nameFirst: user.name_first,
                selectedCountry: user.country,
                selectedUsaState: user.state || null,
                sessionUser: user,
            });
            this.forceUpdate();
        };
        Storage.addSessionUserListener(this.sessionUserListener);
    }

    render() {
        if (this.state.sessionUser) {
            return this._render();
        }
        return null;
    }

    componentDidMount() {
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
    }

    componentWillUnmount() {
        Storage.removeSessionUserListener(this.sessionUserListener);
    }

    onConfirmChanges = () => {
        this.update();
    };

    onDiscardChanges = () => {
        Actions.pop();
    };

    checkWhenLeave = () => {
        if (!this.state.updateInError) {
            this.biActionDialog.open();
        } else {
            Actions.pop();
        }
    }

    _render = () => {
        const offset = Util.isAndroid() ? -200 : 0;
        return (
            <SafeAreaView style={[GS.statusBar]}>
            <KeyboardAvoidingView
                behavior={'position'}
                contentContainerStyle={[GS.flex1, GS.flexStretch]}
                keyboardVerticalOffset={offset}
                style={[GS.flex1, GS.flexCol1]}
            >
                <View style={[GS.header, GS.bgColorLightPurple]}>
                    <BackButton overrideOnPress={this.checkWhenLeave}/>
                    <Text style={[GS.headerText]}>Profile</Text>
                </View>
                <View style={[GS.flexRow8, GS.flexStretch, GS.bgColorLightPurple, GS.avatarOffsetCont]}>
                    <TouchableHighlight
                        activeOpacity={1.0}
                        onPress={this.avatar}
                        underlayColor={'transparent'}
                    >
                        {this._renderAvatar()}
                    </TouchableHighlight>
                </View>
                <View style={[GS.flex1, GS.flexCol1, GS.flexStretch, GS.paddingB15]}>
                    <View style={[GS.flexRow1, GS.flexStretch, styles.profileSectionHeader]}>
                        <Text style={[GS.text]}>Personal Details</Text>
                    </View>
                    <ScrollView
                        keyboardShouldPersistTaps={'handled'}
                        overScrollMode={'always'}
                        showsHorizontalScrollIndicator={false}
                        style={[GS.flexStretch, GS.paddingT15]}
                    >
                        <View style={[GS.paddingH15]}>
                            <Text style={[GS.text, styles.profileText, styles.profileTextKey]}>username:</Text>
                            <Text style={[GS.text, styles.profileText, GS.marginL15]}>{this.getUsername()}</Text>
                            <Text style={[GS.text, styles.profileText, styles.profileTextKey]}>email address:</Text>
                            <Text style={[GS.text, styles.profileText, GS.marginL15]}>{this.getEmail()}</Text>
                            <Text style={[GS.text, styles.profileText, styles.profileTextKey]}>name:</Text>
                            <Text style={[GS.text, styles.profileText, GS.marginL15]}>{this.getName()}</Text>
                            <Text style={[GS.text, styles.profileText, styles.profileTextKey]}>country:</Text>
                            <Text style={[GS.text, styles.profileText, GS.marginL15]}>{this.getCountry()}</Text>
                            {this._renderUsaStateData()}
                            <Text style={[GS.text, styles.profileText, styles.profileTextKey]}>age:</Text>
                            <Text style={[GS.text, styles.profileText, GS.marginL15]}>{this.getAge()}</Text>
                        </View>
                        <View style={[GS.flexRow1, GS.flexStretch, styles.profileSectionHeader]}>
                            <Text style={[GS.text]}>Update Information</Text>
                        </View>
                        <View style={[GS.flexCol1, GS.flexStretch, GS.paddingH15, GS.marginT10]}>
                            <TextInput
                                autoCapitalize={'none'}
                                autoCorrect={false}
                                keyboardType={'email-address'}
                                onChangeText={text => {this.onChangeEmail(text);}}
                                placeholder={'email address'}
                                placeholderTextColor={'#9a9a9a'}
                                style={[GS.textInput, styles.input]}
                                underlineColorAndroid={'transparent'}
                                value={this.state.email}
                            />
                            <ValidationError
                                show={this.state.emailInError}
                                text={this.state.emailMsg}
                            />
                            <TextInput
                                autoCapitalize={'words'}
                                autoCorrect={false}
                                onChangeText={text => {this.onChangeNameFirst(text);}}
                                placeholder={'first name'}
                                placeholderTextColor={'#9a9a9a'}
                                style={[GS.textInput, styles.input]}
                                underlineColorAndroid={'transparent'}
                                value={this.state.nameFirst}
                            />
                            <ValidationError
                                show={this.state.nameFirstInError}
                                text={this.state.nameFirstMsg}
                            />
                            {this._renderCountryInput()}
                            <ValidationError
                                show={this.state.countryInError}
                                text={this.state.countryMsg}
                            />
                            {this._renderUsaStateInput()}
                            <ActionButton
                                accessibility='update'
                                classes={[GS.btn, GS.bgColorSkyBlue, GS.marginT10]}
                                isDisabled={this.state.updateInError}
                                onPress={this.update}
                                text='update'
                            />
                        </View>
                        <View style={[GS.flexRow1, GS.flexStretch, styles.profileSectionHeader]}>
                            <Text style={[GS.text]}>Change password</Text>
                        </View>
                        <View style={[GS.flexCol1, GS.flexStretch, GS.paddingH15, GS.marginT10]}>
                            <TextInput
                                autoCapitalize={'none'}
                                autoCorrect={false}
                                onChangeText={text => { this.onChangeOldPassword(text); }}
                                placeholder={'old password'}
                                placeholderTextColor={'#9a9a9a'}
                                secureTextEntry
                                style={[GS.textInput, styles.input]}
                                underlineColorAndroid={'transparent'}
                                value={this.state.oldPassword}
                            />
                            <ValidationError
                                show={this.state.oldPasswordInError}
                                text={this.state.oldPasswordMsg}
                            />
                            <TextInput
                                autoCapitalize={'none'}
                                autoCorrect={false}
                                onChangeText={text => { this.onChangeNewPassword(text); }}
                                placeholder={'new password'}
                                placeholderTextColor={'#9a9a9a'}
                                secureTextEntry
                                style={[GS.textInput, styles.input]}
                                underlineColorAndroid={'transparent'}
                                value={this.state.newPassword}
                            />
                            <ValidationError
                                show={this.state.newPasswordInError}
                                text={this.state.newPasswordMsg}
                            />
                            <TextInput
                                autoCapitalize={'none'}
                                autoCorrect={false}
                                onChangeText={text => { this.onChangeConfirmPassword(text); }}
                                placeholder={'confirm new password'}
                                placeholderTextColor={'#9a9a9a'}
                                secureTextEntry
                                style={[GS.textInput, styles.input]}
                                underlineColorAndroid={'transparent'}
                                value={this.state.confirmPassword}
                            />
                            <ValidationError
                                show={this.state.confirmPasswordInError}
                                text={this.state.confirmPasswordMsg}
                            />
                            <ActionButton
                                accessibility='change'
                                classes={[GS.btn, GS.bgColorPlum, GS.marginV10]}
                                isDisabled={this.state.changePasswordInError}
                                onPress={this.changePassword}
                                text='change'
                            />
                        </View>
                    </ScrollView>
                </View>
                {this._renderCountry()}
                {this._renderUsaState()}
                <Loading isOpen={this.state.async} />
                <AlertDialog
                    ref={alertDialog => { this.alertDialog = alertDialog; }}
                    text={this.state.ajaxMsg}
                    type={this.state.alertType}
                />
                <BiActionDialog ref={biActionDialog => { this.biActionDialog = biActionDialog; }}
                    text='Do you want to save changes?'
                    confirmText='Save changes'
                    declineText='Discard'
                    title='Hold on!'
                    onConfirm={this.onConfirmChanges}
                    onDecline={this.onDiscardChanges}
                />
            </KeyboardAvoidingView>
            </SafeAreaView>
        );
    };

    _renderAvatar = () => {
        if (this.state.avatarUri) {
            return (
                <Image
                    source={{ uri: this.state.avatarUri }}
                    style={[{ height: 100, width: 100 }, GS.avatarPhoto, GS.marginB15]}
                />
            );
        } else if (this.state.sessionUser.photo_url) {
            return (
                <Image
                    source={{ uri: this.state.sessionUser.photo_url }}
                    style={[{ height: 100, width: 100 }, GS.avatarPhoto, GS.marginB15]}
                />
            );
        } else {
            return (
                <Image
                    source={require('./../img/icon_profile_picture.png')}
                    style={[GS.avatar, GS.marginB15]}
                />
            );
        }
    };

    _renderCountry = () => {
        if (this.state.openCountry) {
            if (this.platform === 'ios') {
                return (
                    <MoafPicker
                        items={this.countries}
                        keyProp={'alpha_3'}
                        labelProp={'name'}
                        onChange={this.onSelectedCountry}
                        onClose={this.onClosedCountry}
                        selectedKey={this.state.selectedCountry ? this.state.selectedCountry.alpha_3 : null}
                    />
                );
            }
        }
    };

    _renderCountryInput = () => {
        if (this.platform === 'ios') {
            return (
                <TouchableHighlight
                    activeOpacity={1.0}
                    onPress={() => { this.setState({ openCountry: true }); }}
                    style={[GS.flexStretch]}
                    underlayColor={'transparent'}
                >
                    <Text style={[GS.select, styles.input]}>
                        {!this.state.selectedCountry ?
                            <Text style={[GS.selectPh]}>country</Text> : this.getCountry()}
                    </Text>
                </TouchableHighlight>
            );
        } else {
            return (
                <MoafPicker
                    backgroundColor={'#ffffff'}
                    items={this.countries}
                    keyProp={'alpha_3'}
                    labelProp={'name'}
                    onChange={this.onSelectedCountry}
                    onClose={this.onClosedCountry}
                    selectedKey={this.state.selectedCountry ? this.state.selectedCountry.alpha_3 : null}
                />
            );
        }
    };

    _renderUsaState = () => {
        if (this.state.openUsaState) {
            if (this.platform === 'ios') {
                return (
                    <MoafPicker
                        items={this.usaStates}
                        keyProp={'abbreviation'}
                        labelProp={'name'}
                        onChange={this.onSelectedUsaState}
                        onClose={this.onClosedUsaState}
                        selectedKey={this.state.selectedUsaState ? this.state.selectedUsaState.abbreviation : null}
                    />
                );
            }
        }
    };

    _renderUsaStateData = () => {
        if (this.state.sessionUser.state) {
            return (
                <View>
                    <Text style={[GS.text, styles.profileText, styles.profileTextKey]}>state:</Text>
                    <Text style={[GS.text, styles.profileText, GS.marginL15]}>{this.getUsaState()}</Text>
                </View>
            );
        }
        return null;
    };

    _renderUsaStateInput = () => {
        if (this.state.selectedCountry && this.state.selectedCountry.alpha_3 === 'USA') {
            if (this.platform === 'ios') {
                return (
                    <View style={[GS.flexStretch]}>
                        <TouchableHighlight
                            activeOpacity={1.0}
                            onPress={() => { this.setState({ openUsaState: true }); }}
                            style={[GS.flexStretch]}
                            underlayColor={'transparent'}
                        >
                            <Text style={[GS.select, styles.input]}>
                                {
                                    !this.state.selectedUsaState ?
                                        <Text style={[GS.selectPh]}>state</Text> : this.getUsaState()
                                }
                            </Text>
                        </TouchableHighlight>
                        <ValidationError
                            show={this.state.usaStateInError}
                            text={this.state.usaStateMsg}
                        />
                    </View>
                );
            } else {
                return (
                    <View style={[GS.flexStretch]}>
                        <MoafPicker
                            backgroundColor={'#ffffff'}
                            items={this.usaStates}
                            keyProp={'abbreviation'}
                            labelProp={'name'}
                            onChange={this.onSelectedUsaState}
                            onClose={this.onClosedUsaState}
                            selectedKey={this.state.selectedUsaState ? this.state.selectedUsaState.abbreviation : null}
                        />
                        <ValidationError
                            show={this.state.usaStateInError}
                            text={this.state.usaStateMsg}
                        />
                    </View>
                );
            }
        }
    };

    avatar = () => {
        Photos.getPhoto(res => {
            if (res.error) {
                this.setState({
                    ajaxMsg: res.error,
                    alertType: 'Error',
                }, () => {
                    this.alertDialog.open();
                });
            } else if (res.uri) {
                this.setState({ avatarUri: res.uri }, () => {
                    this.isUpdateDisabled();
                });
            }
        });
    };

    changePassword = () => {
        dismissKeyboard();
        const payload = {
            _id: this.state.sessionUser._id,
            new_password: this.state.newPassword,
            old_password: this.state.oldPassword,
        };
        this.setState({ async: true });
        Ajax.putPassword(payload._id, payload, () => {
            this.setState({ async: false });
            this.setState({
                ajaxMsg: 'Your password has been successfully changed.',
                alertType: 'Info',
                confirmPassword: '',
                newPassword: '',
                oldPassword: '',
            }, () => {
                this.alertDialog.open();
            });
        }, err => {
            this.setState({ async: false });
            this.setState({
                ajaxMsg: err.message,
                alertType: 'Error',
                confirmPassword: '',
                newPassword: '',
                oldPassword: '',
            }, () => {
                this.alertDialog.open();
            });
        });
    };

    getAge = () => {
        return Util.getDifferenceInYears(this.state.sessionUser.birth_date);
    };

    getCountry = () => {
        return this.state.selectedCountry.name;
    };

    getEmail = () => {
        return this.state.sessionUser.email;
    };

    getName = () => {
        return `${this.state.sessionUser.name_first}`;
    };

    getUsaState = () => {
        return this.state.selectedUsaState ? this.state.selectedUsaState.name : null;
    };

    getUsername = () => {
        return this.state.sessionUser.username;
    };

    isChangePasswordDisabled = () => {
        const { confirmPasswordInError, newPasswordInError, oldPasswordInError } = this.state;
        if (confirmPasswordInError || newPasswordInError || oldPasswordInError) {
            this.setState({ changePasswordInError: true });
        } else if (this.state.confirmPassword !== this.state.newPassword) {
            this.setState({ changePasswordInError: true });
        } else {
            this.setState({ changePasswordInError: false });
        }
    };

    isUpdateDisabled = () => {
        const { countryInError, emailInError, nameFirstInError, selectedCountry, selectedUsaState,  usaStateInError } = this.state;
        if (countryInError || emailInError || nameFirstInError || usaStateInError) {
            this.setState({ updateInError: true });
        } else if (selectedCountry && selectedCountry.alpha_3 === 'USA') {
            if (!selectedUsaState) {
                this.setState({
                    updateInError: true,
                    usaStateInError: true,
                    usaStateMsg: 'USA state required',
                });
            } else {
                this.setState({
                    updateInError: false,
                    usaStateInError: false,
                    usaStateMsg: '',
                });
            }
        } else {
            this.setState({ updateInError: false });
        }
    };

    onChangeConfirmPassword = (text: string) => {
        this.setState({ confirmPassword: text });
        if (text !== this.state.newPassword) {
            this.setState({
                confirmPasswordInError: true,
                confirmPasswordMsg: 'confirmation must match new password',
            }, () => {
                this.isChangePasswordDisabled();
            });
        } else {
            this.setState({
                confirmPasswordInError: false,
                confirmPasswordMsg: '',
            }, () => {
                this.isChangePasswordDisabled();
            });
        }
    };

    onChangeEmail = (text: string) => {
        const trimmed = text.trim();
        this.setState({
            email: trimmed,
        });
        Schema.validate(trimmed, Schema.email, 'email', (err) => {
            if (err) {
                this.setState({
                    emailMsg: err,
                });
            }
            this.setState({
                emailInError: err !== null,
            }, () => {
                this.isUpdateDisabled();
            });
        });
    };

    onChangeNameFirst = (text: string) => {
        this.setState({
            nameFirst: text,
        });
        const trimmed = text.trim();
        Schema.validate(trimmed, Schema.name_first, 'first name', (err) => {
            if (err) {
                this.setState({
                    nameFirstMsg: err,
                });
            }
            this.setState({
                nameFirstInError: err !== null,
            }, () => {
                this.isUpdateDisabled();
            });
        });
    };

    onChangeNewPassword = (text: string) => {
        this.setState({ newPassword: text });
        Schema.validate(text, Schema.password, 'new password', (err) => {
            if (err) {
                this.setState({
                    newPasswordMsg: err,
                });
            }
            this.setState({
                newPasswordInError: err !== null,
            }, () => {
                this.isChangePasswordDisabled();
            });
        });
    };

    onChangeOldPassword = (text: string) => {
        this.setState({ oldPassword: text });
        Schema.validate(text, Schema.password, 'old password', (err) => {
            if (err) {
                this.setState({
                    oldPasswordMsg: err,
                });
            }
            this.setState({
                oldPasswordInError: err !== null,
            }, () => {
                this.isChangePasswordDisabled();
            });
        });
    };

    onClosedCountry = () => {
        this.setState({ openCountry: false });
    };

    onClosedUsaState = () => {
        this.setState({ openUsaState: false });
    };

    onSelectedCountry = (obj: Country) => {
        this.setState({ selectedCountry: obj });
        if (obj.alpha_3 !== 'USA') {
            this.setState({ selectedUsaState: null });
        }
        Schema.validate(obj, Schema.country, 'country', (err) => {
            if (err) {
                if (Util.isAndroid()) {
                    this.setState({
                        countryMsg: 'country is required'
                    });
                } else {
                    this.setState({
                        countryMsg: err,
                    });
                }
            }
            this.setState({
                countryInError: err !== null,
            }, () => {
                this.isUpdateDisabled();
            });
        });
    };

    onSelectedUsaState = (obj: UsaState) => {
        this.setState({ selectedUsaState: obj });
        Schema.validate(obj, Schema.state, 'state', (err) => {
            if (err) {
                if (Util.isAndroid()) {
                    this.setState({
                        usaStateMsg: 'us state is required'
                    });
                } else {
                    this.setState({
                        usaStateMsg: err,
                    });
                }
            }
            this.setState({
                usaStateInError: err !== null,
            }, () => {
                this.isUpdateDisabled();
            });
        });
    };

    update = () => {
        dismissKeyboard();
        const { email, nameFirst, selectedCountry, selectedUsaState } = this.state;
        const payload = {
            _id: this.state.sessionUser._id,
            birth_date: this.state.sessionUser.birth_date,
            country: JSON.stringify(selectedCountry),
            email: email,
            is_following: true,
            name_first: nameFirst.trim(),
            state: selectedCountry.alpha_3 === 'USA' ? JSON.stringify(selectedUsaState) : null,
            username: this.state.sessionUser.username,
        };
        if (this.state.avatarUri) {
            const extension = this.state.avatarUri.replace(/^.+\.([a-zA-Z]+)$/, '$1');
            payload.photo = {
                name: `avatar.${extension}`,
                type: `image/jpg`,
                uri: this.state.avatarUri,
            };
        }
        this.setState({ async: true });
        Ajax.putUser(payload._id, payload, updatedUser => {
            Storage.setSessionUser(updatedUser)
                .then(() => {
                    this.setState({
                        ajaxMsg: 'Your profile was updated.',
                        alertType: 'Info',
                        async: false,
                        updateInError: true
                    }, () => {
                        this.alertDialog.open();
                    });
                });
        }, err => {
            this.setState({
                ajaxMsg: err.message,
                alertType: 'Error',
                async: false,
            }, () => {
                this.alertDialog.open();
            });
        });
    };

}

ProfileView.propTypes = {
    adCheckToken: PropTypes.number.isRequired,
};

const styles = StyleSheet.create({
    input: {
        alignSelf: 'stretch',
        backgroundColor: 'white',
        borderColor: CP.moafLightGray,
        borderWidth: 1
    },
    profileSectionHeader: {
        borderBottomColor: CP.moafWhite,
        borderBottomWidth: 1,
        padding: 15,
    },
    profileText: {
        lineHeight: 26,
    },
    profileTextKey: {
        color: CP.moafLightGray,
    },
});

export { ProfileView };
