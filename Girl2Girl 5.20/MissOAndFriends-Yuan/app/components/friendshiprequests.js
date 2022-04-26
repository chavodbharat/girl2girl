import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Text, View, Alert, TouchableOpacity, TouchanbleHighlight } from 'react-native';
import { GlobalStyles as GS, ColorPalette as CP } from './../../styles';
import { Actions } from 'react-native-router-flux';
import Swipeout from 'react-native-swipeout';
import get from 'lodash/get';
import { Storage } from './../services/storage';
import { Util } from './../services/util';
import type { FriendshipRequest as Model } from './../decls/friendshiprequest';

class FriendshipRequest extends React.Component {
	props: {
		displayName: string;
		notification: Model;
		onAccept: Function;
		onDecline: Function;
		onDelete: Function;
		setScrolling: Function;
        wasRead: Function;
	};

	state: {};

	constructor(props) {
		super(props);
	}

    _renderUserInfo() {
        return (              
            <Text style={[GS.smallText, GS.username]}> {this.props.notification.user.username}</Text>
        );
    };

    activityView = () => {
        if (!this.props.notification.was_read) {
            this.props.wasRead(this.props.notification, shouldUpdate => {
                if (shouldUpdate) {
                    this._updateWasRead();
                }         
                Actions.activity({ adCheckToken: Util.randomNumber(), userId: this.getUserId() });       
            });
        } else {
            Actions.activity({ adCheckToken: Util.randomNumber(), userId: this.getUserId() });
        }
    };

    getUserId = () => {
        return this.props.notification.user._id;
    };

    _updateWasRead = () => {
        this.props.notification.was_read = true;
    };

	render() {
        const swipeBtns = [{
            backgroundColor: 'red',
            onPress: () => { this.props.onDecline(this.props.notification._id); },
            component: <Text style={[styles.swipeButton]}>Decline</Text>
        }, {
        	backgroundColor: 'green',
        	onPress: () => { this.props.onAccept(this.props.notification._id); },
        	component: <Text style={[styles.swipeButton]}>Accept</Text>
        }];
        const swipeDel = [{
        	backgroundColor: 'red',
            onPress: () => { this.props.onDelete(this.props.notification._id); },
            component: <Text style={[styles.swipeButton]}>Delete</Text>
        }];
        let swipe = [];
        switch (this.props.notification.notification_type) {
        case "0":
            if (this.props.notification.is_friend) {
                swipe = swipeDel;
            } else {
        	    swipe = swipeBtns;
            }
        	break;
        case "1":
        	swipe = swipeDel;
        	break;
        }
        const bgColor = this.props.notification.was_read ? CP.moafWhite : '#ffffff';
        return (
            <Swipeout
                autoClose={true}
                backgroundColor={bgColor}
                right={swipe}
                buttonWidth={80}
                scroll={this.props.setScrolling}
            >
                <TouchableOpacity delayPressIn={300} onPressIn={this.activityView}>
                    <View style={[GS.flex1, GS.flexRow1, styles.cont]}>
                        
                            <View style={[GS.flexCol1]}>
                                {this._renderNotificationType()}
                            </View>

                    </View>
                </TouchableOpacity>
            </Swipeout>
        );
    };

    componentDidMount() {
        
    }

    _renderNotificationType = () => {
    	let component = null;
        switch (this.props.notification.notification_type) {
        case '0':
    		component = (
                // <TouchableOpacity delayPressIn={300} onPressIn={this.activityView}>
                    <View>
                        <Text style={[styles.friendship, styles.text]}>{ this._renderUserInfo() } wants to be your friend</Text>
                    </View>
                // </TouchableOpacity>
            );
    		break;
        case '1': 
    		component = (
                // <TouchableOpacity delayPressIn={300} onPressIn={this.activityView}>
                    <View>
                        <Text style={[styles.friendship, styles.text]}>Now you and { this._renderUserInfo() } are friends</Text>
                    </View>
                // </TouchableOpacity>
            );
    		break;
        };
        return component;
    };
};

FriendshipRequest.propTypes = {
    notification: PropTypes.object.isRequired,
    onDelete: PropTypes.func.isRequired,
    onAccept: PropTypes.func.isRequired,
    setScrolling: PropTypes.func.isRequired
};

const styles = StyleSheet.create({
    cont: {
        borderBottomColor: CP.moafWhite,
        borderBottomWidth: 1,
        padding: 10,
    },
    friendship: {
        paddingTop: 10,
        paddingBottom: 10
    },
    swipeButton: {
        width: 100,
        flex: 1,
        color: '#ffffff',
        fontWeight: "500",
        paddingTop: 20,
        paddingLeft:15,
        height:100,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    since: {
        color: CP.moafLightGray,
    },
    text: {
        color: CP.moafDarkGray,
        fontFamily: 'Raleway-Regular',
        fontSize: 15,
        fontWeight: Util.isAndroid() ? '400' : '500',
    },
});

export { FriendshipRequest };