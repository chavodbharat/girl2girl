import React from 'react';
import { Actions } from 'react-native-router-flux';
import { Text, View } from 'react-native';
import { GlobalStyles as GS } from './../../styles';
import { Util } from './../services/util';
import PropTypes from 'prop-types';
const PSMInterstitialAdView = require('./../module/ad-interstitial').PSMInterstitialAdView;

class GuestView extends React.Component {

    props: {
        adCheckToken: number;
    };

    constructor(props: any) {
        super(props);
    }

    render() {
        return (
            <View style={[GS.bgColorWhite, GS.flex1]}>
                <View style={[GS.flex2, GS.flexRow8, GS.padding15, GS.flexWrap]}>
                    <Text style={[GS.guestText, GS.textCenter]}>You are viewing the app as a guest. Please <Text
                        style={[GS.colorDarkPurple]} onPress={this.login}>Login </Text>or <Text
                        style={[GS.colorDarkPurple]} onPress={this.register}>Register</Text></Text>
                </View>
                <View style={[GS.flex3]} />
            </View>
        )
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
    }

    login() {
        Actions.login();
    }

    register() {
        Actions.register();
    }

}

GuestView.propTypes = {
    adCheckToken: PropTypes.number.isRequired,
};

export { GuestView };
