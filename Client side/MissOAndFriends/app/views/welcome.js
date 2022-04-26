import React from 'react';
import { Actions } from 'react-native-router-flux';
import { Image, ScrollView, Text, View, Alert } from 'react-native';
import { GlobalStyles as GS } from './../../styles';
import { Storage } from './../services/storage';
import { Ajax } from './../services/ajax';
import { ActionButton } from './../components/action-button';
import SInfo from 'react-native-sensitive-info';
import PropTypes from 'prop-types';

class WelcomeView extends React.Component {

    props: {
        refreshToken?: number;
    };

    constructor(props: any) {
        super(props);

        Storage.ifNeedsPolicyAgreement().then((value) => {
            if (value) {
                Actions.policy('policy');
            } else {
                Storage.getSIOAuth()
                .then((value) => {  
                    if (value == undefined) {
                        return Promise.reject({ message: "1" });
                    } else {                
                        return Ajax.self(value);
                    }
                }).then((user) => {            
                    if (user == null) {
                        return Promise.reject({ message: "2" });
                    } else {
                        return Storage.setSessionUser(user);
                    }
                }).then((value) => {
                    Actions.tabs({ tab: 'feed' });
                }).catch((err) => {                 
                    //Try again later and do no remove all data
                    if (!Ajax.isUnderMaintenance(err) && !Ajax.isTimeoutException(err)) {
                        Storage.clearSIOAuth();
                        Storage.removeAll();
                    }
                });
            }
        });  
        
    }

    render() {
        return (
            <View style={[GS.flex1, GS.flexRow1, GS.bgColorLightPurple, {paddingTop: 50}, GS.paddingB10]}>
                <ScrollView
                    keyboardShouldPersistTaps={'handled'}
                    showsHorizontalScrollIndicator={false}
                    style={[GS.flexStretch, GS.paddingH10]}
                >
                    <View style={[GS.flexCol5]}>
                        <Image
                            source={require('./../img/MOF-Round-Logo.png')}
                            style={[GS.welcomeLogo]}
                        />
                        <Image
                            source={require('./../img/girl2girl-logo-6-girls.png')}
                            style={[GS.girl2girlLogo, GS.marginT15]}
                        />
                        <Text style={[GS.colorWhite, GS.h1, {marginTop: 25}]}>Welcome!</Text>
                        <ActionButton
                            accessibility='login'
                            classes={[GS.btn, GS.bgColorLime, GS.marginT15]}
                            onPress={this.login}
                            text='login'
                        />
                        <Text style={[GS.text, GS.colorWhite, {marginTop: 25}]}>Don{"'"}t have an account?</Text>
                        <ActionButton
                            accessibility='join'
                            classes={[GS.btn, GS.bgColorSkyBlue, GS.marginT15]}
                            onPress={this.register}
                            text='join'
                        />
                        <ActionButton
                            accessibility='go to wall'
                            classes={[GS.btn, {marginTop: 20}]}
                            onPress={this.feed}
                            text='Skip to Wall. Browse as Guest.'
                        />
                    </View>
                </ScrollView>
            </View>
        );
    }

    componentDidMount() {
        //Storage.removeAll();
    }

    componentWillReceiveProps(nextProps) {
        //Storage.removeAll();
    }

    feed() {
        Actions.tabs({ tab: 'feed' });
    }

    login() {
        Actions.login();
    }

    register() {
        Actions.register();
    }

}

WelcomeView.propTypes = {
    refreshToken: PropTypes.number,
};

export { WelcomeView };
