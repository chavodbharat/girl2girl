import React from 'react';
import { Image, KeyboardAvoidingView, ScrollView, StyleSheet, Dimensions, Text, TextInput, Alert, View, TouchableOpacity } from 'react-native';
import { GlobalStyles as GS, ColorPalette as CP } from './../../styles';
import { Actions } from 'react-native-router-flux';
import dismissKeyboard from 'react-native-dismiss-keyboard';
import { Ajax } from './../services/ajax';
import { Schema } from './../services/schema';
import { Storage } from './../services/storage';
import { Util } from './../services/util';
import { AlertDialog } from '../components/alert-dialog';
import { ActionButton } from './../components/action-button';
import { Loading } from '../components/loading';
import { ValidationError } from './../components/validation-error';

class LoginView extends React.Component {

    state: {
        ajaxMsg: string;
        force: boolean;
        async: boolean;
        passwordInError: boolean;
        passwordMsg: string;
        secureTextEntry: boolean;
        user: {
            password: string;
            username: string;
        };
        usernameInError: boolean;
        usernameMsg: string;
    };

    constructor(props) {
        super(props);

        this.openEye   = require('./../img/open-eye.png');
        this.closedEye = require('./../img/open-eye-closed.png');

        this.state = {
            ajaxMsg: '',
            async: false,
            force: false,
            passwordInError: true,
            passwordMsg: '',
            secureTextEntry: true,
            marginEye: 0,
            user: {
                password: '',
                username: '',
            },
            usernameInError: true,
            usernameMsg: '',
            eyeImage: this.openEye
        };
        this.alertDialog = null;

        
    }

    clickOnEye = () => {
        if (this.state.secureTextEntry) {
            this.setState({
                secureTextEntry: false,
                eyeImage: this.closedEye
            });
        } else {
            this.setState({
                secureTextEntry: true,
                eyeImage: this.openEye
            });
        }
    }

    render() {
        const offset = Util.isAndroid() ? -200 : 0;
        return (
            <KeyboardAvoidingView
                behavior={'position'}
                contentContainerStyle={[GS.flex1, GS.flexStretch]}
                keyboardVerticalOffset={offset}
                style={[GS.flex1, GS.flexRow1, GS.bgColorLightPurple, {paddingTop: 50}, GS.paddingB10]}
            >
                <ScrollView
                    keyboardShouldPersistTaps={'handled'}
                    showsHorizontalScrollIndicator={false}
                    style={[GS.flexStretch, GS.paddingH10]}>
                    <View style={[GS.flexCol5]}>
                        <Image
                            source={require('./../img/MOF-Round-Logo.png')}
                            style={[GS.welcomeLogo]}
                        />
                        <Image
                            source={require('./../img/girl2girl-logo-6-girls.png')}
                            style={[GS.girl2girlLogo, GS.marginT15]}
                        />
                        <Text style={[styles.loginText, GS.marginT10]}>Login</Text>
                        <TextInput
                            autoCapitalize={'none'}
                            autoCorrect={false}
                            onChangeText={text => {this.onChangeUsername(text);}}
                            placeholder={'username'}
                            placeholderTextColor={'#9a9a9a'}
                            style={[GS.textInput]}
                            underlineColorAndroid={'transparent'}
                            value={this.state.user.username}
                        />
                        <ValidationError
                            text={this.state.usernameMsg}
                            show={this.state.usernameInError}
                        />
                        <TextInput
                            autoCapitalize={'none'}
                            autoCorrect={false}
                            onChangeText={text => {this.onChangePassword(text);}}
                            placeholder={'password'}
                            placeholderTextColor={'#9a9a9a'}
                            secureTextEntry={this.state.secureTextEntry}
                            style={[GS.textInput]}
                            underlineColorAndroid={'transparent'}
                            value={this.state.user.password}
                        />
                        
                        <TouchableOpacity style={{marginTop: -44, alignSelf: 'flex-end', right: 5, width: 32, height: 44, paddingTop: 6}} onPress={this.clickOnEye}>
                            <Image
                                source={this.state.eyeImage}
                                style={{alignSelf: 'flex-end'}}
                            />
                        </TouchableOpacity>
                        
                        <ValidationError
                            text={this.state.passwordMsg}
                            show={this.state.passwordInError}
                        />
                        <ActionButton
                            accessibility='login'
                            classes={[GS.btn, GS.bgColorLime, GS.marginT15]}
                            isDisabled={this.state.passwordInError || this.state.usernameInError}
                            onPress={this.login}
                            text='login'
                        />
                        <Text style={[GS.text, GS.colorWhite, GS.marginT15]}
                              onPress={this.forgot}>Forgot your password?</Text>
                        <Text style={[GS.text, GS.colorWhite, GS.marginT15]} onPress={this.register}>Don{"'"}t have an account?
                            <Text style={[GS.bold]}> Create one here</Text></Text>
                        <ActionButton
                            accessibility='go to wall'
                            classes={[GS.btn, GS.marginT15]}
                            onPress={this.feed}
                            text='Skip to Wall. Browse as Guest.'
                        />
                    </View>
                </ScrollView>
                <Loading isOpen={this.state.async} />
                <AlertDialog
                    ref={alertDialog => { this.alertDialog = alertDialog; }}
                    force={this.state.force}
                    text={this.state.ajaxMsg}
                    type={'Error'}
                />
            </KeyboardAvoidingView>
        );
    }

    feed() {
        Actions.tabs({ tab: 'feed' });
    }

    forgot = () => {
        Actions.forgot();
    };

    login = () => {
        dismissKeyboard();
        this.setState({ async: true });
        const handlers = {
            error: (err) => {
                this.setState({ async: false });
                //this.resetState();
                this.setState({
                    ajaxMsg: "The username or password you entered is incorrect",
                    force: Ajax.isNotAuthorizedException(err)
                }, () => {
                    this.alertDialog.open();
                });
            },
            success: (user, token) => {
                this.resetState();      
                 
                Storage.setSIOAuth(token).then((value) => {
                    return Storage.setSessionUser(user);
                }).then((value) => {
                    this.setState({ async: false });
                    Actions.tabs({ tab: 'feed' });
                }).catch((err) => {
                    Actions.tabs({ tab: 'feed' });
                });
            }
        };
        const payload = this.state.user;
        Ajax.login(payload, handlers.success, handlers.error);
    };

    onChangePassword = (text: string) => {
        this.setState({
            user: {
                ...this.state.user,
                password: text,
            }
        });
        Schema.validate(text, Schema.password, 'password', (err) => {
            if (err) {
                this.setState({
                    passwordMsg: err,
                });
            }
            this.setState({
                passwordInError: err !== null,
            });
        });
    };

    onChangeUsername = (text: string) => {
        const trimmed = text.trim();
        this.setState({
            user: {
                ...this.state.user,
                username: trimmed,
            }
        });
        Schema.validate(trimmed, Schema.username, 'username', (err) => {
            if (err) {
                this.setState({
                    usernameMsg: err,
                });
            }
            this.setState({
                usernameInError: err !== null,
            });
        });
    };

    register = () => {
        Actions.register();
    };

    resetState = () => {
        this.setState({
            ajaxMsg: '',
            force: false,
            async: false,
            passwordInError: true,
            passwordMsg: '',
            user: {
                password: '',
                username: '',
            },
            usernameInError: true,
            usernameMsg: '',
        });
    };

}

const styles = StyleSheet.create({
    passwordEye: {
        position: 'absolute',
        right: 10,
        alignItems: 'flex-end',
    },
    loginText: {
        color: CP.moafWhite,
        fontFamily: 'raleway',
        fontSize: 34,
        fontWeight: '600',
    }
});

export { LoginView };

