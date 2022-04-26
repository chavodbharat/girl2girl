import React from 'react';
import { Image, Linking, StyleSheet, Text, Alert, TouchableHighlight, View, Switch, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { GlobalStyles as GS, ColorPalette as CP } from './../../styles';
import { Actions } from 'react-native-router-flux';
import { Storage } from './../services/storage';
import { Ajax }    from './../services/ajax';
import { Util }    from './../services/util';
import { AlertDialog } from '../components/alert-dialog';
import { CreateConvoButton } from '../components/create-convo-button';
import type { SessionUser } from './../decls/session-user';
import type { PushSettingsType } from './../decls/push-settings';
import { Loading } from '../components/loading';
import PropTypes from 'prop-types';
import { BackButton } from '../components/back-button';
import { BiActionDialog } from '../components/biaction-dialog';

import { Platform } from 'react-native';

class PushSettings extends React.Component {

    props: {
        adCheckToken: number;
        sessionUser: SessionUser;
    };

    state: {
        sessionUser: SessionUser;
        async: boolean;
        oldSettings:  PushSettingsType,
        pushSettings: PushSettingsType
    };

    constructor(props: any) {
        super(props);
        this.state = {
            async: true,
            sessionUser: this.props.sessionUser,
            pushSettings: {
                isGroup: false,
                isReply: false,
                isFriendshipRequested: false,
                isFriendshipAccepted: false,
                isMentioned: false
            }
        };
    }

    async componentDidMount() {
        let data = await Ajax.getPushSettings(this.props.sessionUser._id);
        this.setState({
			oldSettings:  JSON.parse(JSON.stringify(data)),
            pushSettings: data,
            async: false
        });
    }

    onValueChange = (name) => {
        return () => {
            let tmp = this.state.pushSettings;
            tmp[name] = !tmp[name];
            this.setState({
                pushSettings: tmp
            });
        }
    }
	
	differs = () => {
		for (let key of Object.keys(this.state.pushSettings)) {
			if (this.state.pushSettings[key] !== this.state.oldSettings[key]) {
				return true;
			}
		}
		return false;
	}
	
	back = () => {
		if (this.differs()) {
			this.biActionDialog.open();
		} else {
			Actions.pop();
		}
	}
	
	update = async () => {
		let tmp = this.state.pushSettings;		
		tmp.isFriendshipRequested = tmp.isFriendshipAccepted;
		this.setState({
			async: true,
			pushSettings: tmp
		});
		let err = await Ajax.setPushSettings(this.props.sessionUser._id, tmp);
		this.setState({async: false});
		Actions.pop();
	}
	
	onConfirmChanges = () => {
        this.update();
    };

    onDiscardChanges = () => {
        Actions.pop();
    };


    render () {
        return (
            <SafeAreaView style={[GS.statusBar]}>
            <View style={[GS.flex1, GS.flexCol1, {backgroundColor: CP.moafWhite}]}>
                <View style={[GS.header, GS.bgColorLightPurple]}>
                    <BackButton overrideOnPress={this.back}/>
                    <Text style={[GS.headerText]}>Push Settings</Text>
                    <CreateConvoButton />
                </View>
                <View style={[GS.flexCol1, GS.flexStretch, {backgroundColor: CP.moafWhite}]}>
                    <View style={[GS.flexRow4, GS.flexStretch, styles.bottomBorder, styles.generalPadding]}>
                        <Switch disabled={false} value={this.state.pushSettings.isGroup} onValueChange={this.onValueChange('isGroup')}/><Text style={[ styles.switchText ]}>Group Notifications</Text>
                    </View>
                    <View style={[GS.flexRow4, GS.flexStretch, styles.bottomBorder, styles.generalPadding]}>
                        <Switch disabled={false} value={this.state.pushSettings.isReply} onValueChange={this.onValueChange('isReply')}/><Text style={[ styles.switchText ]}>Reply Notifications</Text>
                    </View>
                    <View style={[GS.flexRow4, GS.flexStretch, styles.bottomBorder, styles.generalPadding]}>
                        <Switch disabled={false} value={this.state.pushSettings.isFriendshipAccepted} onValueChange={this.onValueChange('isFriendshipAccepted')}/><Text style={[ styles.switchText ]}>Friendship Notifications</Text>
                    </View>
                    <View style={[GS.flexRow4, GS.flexStretch, styles.bottomBorder, styles.generalPadding]}>
                        <Switch disabled={false} value={this.state.pushSettings.isMentioned} onValueChange={this.onValueChange('isMentioned')}/><Text style={[ styles.switchText ]}>Was Mentioned Notifications</Text>
                    </View>
                </View>
				<BiActionDialog ref={biActionDialog => { this.biActionDialog = biActionDialog; }}
                    text='Do you want to save changes?'
                    confirmText='Save changes'
                    declineText='Discard'
                    title='Hold on!'
                    onConfirm={this.onConfirmChanges}
                    onDecline={this.onDiscardChanges}
                />
                <Loading isOpen={this.state.async} />
            </View>
            </SafeAreaView>
        );
    }

}

const styles = StyleSheet.create({
    bottomBorder: {
        display: "flex",
        flexDirection: "row",
        borderBottomColor: CP.moafBorder,
        borderBottomWidth: 1,
    },
    generalPadding: {
        paddingBottom: 18,
        paddingLeft: 15,
        paddingRight: 15,
        paddingTop: 18,
    },
    switchText: {
        paddingLeft: 15
    }
});

export { PushSettings }