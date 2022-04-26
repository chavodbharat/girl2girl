import React from 'react';
import { Image, KeyboardAvoidingView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { GlobalStyles as GS, ColorPalette as CP } from './../../styles';
import { Actions } from 'react-native-router-flux';
import dismissKeyboard from 'react-native-dismiss-keyboard';
import { Schema } from './../services/schema';
import { Ajax } from './../services/ajax';
import { Util } from './../services/util';
import { AlertDialog } from '../components/alert-dialog';
import { ActionButton } from './../components/action-button';
import { Loading } from '../components/loading';
import { ValidationError } from './../components/validation-error';

class ForgotView extends React.Component {

    state: {
        ajaxMsg: string;
        alertType: string;
        async: boolean;
        email: string;
        emailInError: boolean;
        emailMsg: string;
    };

    constructor(props) {
        super(props);
        this.state = {
            ajaxMsg: '',
            alertType: '',
            async: false,
            email: '',
            emailInError: true,
            emailMsg: '',
        };
        this.alertDialog = null;
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
                        <Text style={[styles.forgotHeader, { marginTop: 20 }]}>Forgot your password?</Text>
                        <View style={[{ marginTop: 13 }, GS.paddingH10]}>
                            <Text style={[styles.forgotText, GS.marginT10]}>Enter your email and we will send you password reset instructions</Text>
                        </View>
                        <TextInput
                            autoCapitalize={'none'}
                            autoCorrect={false}
                            keyboardType={'email-address'}
                            onChangeText={text => { this.onChangeEmail(text); }}
                            placeholder={'email address'}
                            placeholderTextColor={'#9a9a9a'}
                            style={[GS.textInput, { marginTop: 35 }]}
                            underlineColorAndroid={'transparent'}
                            value={this.state.email}
                        />
                        <ValidationError
                            text={this.state.emailMsg}
                            show={this.state.emailInError}
                        />
                        <ActionButton
                            accessibility='send'
                            classes={[GS.btn, GS.bgColorMagenta, GS.marginT15]}
                            isDisabled={this.state.emailInError}
                            onPress={this.send}
                            text='send'
                        />
                        <View style={[GS.flexCol5, GS.flexStretch, GS.marginT10, GS.paddingV5]}>
                            <Text style={[GS.text, GS.colorWhite]} onPress={this.login}>
                            <Text
                                style={[GS.bold]}>Go to login</Text></Text>
                        </View>
                    </View>                    
                </ScrollView>
                <Loading isOpen={this.state.async} />
                <AlertDialog
                    ref={alertDialog => { this.alertDialog = alertDialog; }}
                    onClose={this.onSuccess}
                    text={this.state.ajaxMsg}
                    type={this.state.alertType}
                />
            </KeyboardAvoidingView>
        );
    }

    login = () => {
        Actions.login();
    };

    onChangeEmail = (text: string) => {
        const trimmed = text.trim();
        this.setState({ email: trimmed });
        Schema.validate(trimmed, Schema.email, 'email', (err) => {
            if (err) {
                this.setState({
                    emailMsg: err,
                });
            }
            this.setState({
                emailInError: err !== null,
            });
        });
    };

    onSuccess = () => {
        if (this.state.alertType === 'Info') {
            Actions.login();
        }
    };

    send = () => {
        dismissKeyboard();
        this.setState({ async: true });
        Ajax.postPasswordForgot({ email: this.state.email }, () => {
            this.setState({ async: false });
            this.setState({
                ajaxMsg: 'If this is a registered address, check your email for reset instructions.',
                alertType: 'Info',
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

const styles = StyleSheet.create({
    forgotHeader: {
        color: CP.moafWhite,
        fontFamily: 'raleway',
        fontSize: 34,
        fontWeight: '600',
        textAlign: 'center',
    },
    forgotText: {
        color: CP.moafWhite,
        fontFamily: 'raleway',
        fontSize: 14,
        fontWeight: '500',
        lineHeight: 22,
        textAlign: 'center',
    }
});

export { ForgotView };
