import React from 'react';
import { Image, ListView, RefreshControl, StyleSheet, View, Text, TouchableHighlight, WebView, Dimensions } from 'react-native';
import { GlobalStyles as GS, ColorPalette as CP } from './../../styles';
import { Storage } from './../services/storage';
import { Util } from './../services/util';
import { AlertDialog } from '../components/alert-dialog';
import { Actions } from 'react-native-router-flux';

class PolicyView extends React.Component {

	state: {
        height: number;
        alertType: string;
        alertTitle: string;
    }

	constructor(props: any) {
        super(props);
        this.state = {
        	height: Util.getScreenHeight(),
        	alertType: '',
        };
		this.deviceHeight = Dimensions.get('window').height;
		this.deviceWidth  = Dimensions.get('window').width;
        this.alertDialog = null;
    }

    render() {
        return (
        	<View style={[GS.flex1, GS.flexCol1, {flexDirection: 'column'}]}>
                <View style={[GS.bgColorLightPurple, {height:80}, GS.header]}>
                	<Text style={{color: '#ffffff'}}>User Agreement - Legal Terms and Conditions</Text>
                </View>
                <View style={{height:(this.state.height - 140), width: this.deviceWidth, flex: 1}}>
                	<WebView originWhitelist={['*']} styles={{
						flex: 1, 
						backgroundColor: 'yellow',
						width: this.deviceWidth,
						height: this.deviceHeight
					}} startInLoadingState={true} scalesPageToFit={true} source={{uri: 'https://staging.missoandfriends.com/policy.html', baseUrl: ''}} style={{width: '100%'}}/>
                </View>
                <View style={{flexDirection: 'row', height:60}}>
                	<TouchableHighlight
		                activeOpacity={1.0}
		                onPress={this.agree}
		                style={[styles.policyButton, styles.agree]}
		                underlayColor={'transparent'}>
		                <Text style={[styles.text]}>I Agree</Text>
		            </TouchableHighlight>
		            <TouchableHighlight
		                activeOpacity={1.0}
		                onPress={this.disagree}
		                style={[styles.policyButton, styles.disagree]}
		                underlayColor={'transparent'}>
		                <Text style={[styles.text]}>I Disagree</Text>
		            </TouchableHighlight>
                </View>
                <AlertDialog
                    ref={alertDialog => { this.alertDialog = alertDialog; }}
                    text={'Please agree to our Terms of Use to continue using Girl2Girl Wall'}
                    type={this.state.alertType}
                    title={this.state.alertTitle}
                />
            </View>
        );
    }

    agree = () => {
    	Storage.setPolicyWasAgreed();
    	Actions.welcome();
    }

    disagree = () => {
    	this.alertDialog.open();
    }
}

const styles = StyleSheet.create({
    policyButton: {
    	width: '50%',
    	borderRadius:0,
        borderColor: '#000000',
        flex: 1,
        justifyContent: 'center',
    	alignItems: 'center'
    },
    agree: {
    	backgroundColor: CP.moafLime
    },
    disagree: {
    	backgroundColor: CP.moafMagenta
    },
    text: {
    	width: '100%',
    	color: '#ffffff',
    	textAlign: 'center',
    	lineHeight:22,
    	fontSize: 22,
    	fontWeight: 'bold'
    }
});


export { PolicyView };