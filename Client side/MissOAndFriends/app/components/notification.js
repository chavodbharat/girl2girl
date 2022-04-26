import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { GlobalStyles as GS, ColorPalette as CP } from './../../styles';
import { Actions } from 'react-native-router-flux';
import Swipeout from 'react-native-swipeout';
import get from 'lodash/get';
import { Storage } from './../services/storage';
import { Util } from './../services/util';
import type { Notification as Model } from './../decls/notification';
import PropTypes from 'prop-types';

class Notification extends React.Component {

    props: {
        notification: Model;
        onDelete: Function;
        setScrolling: Function;
        wasRead: Function;
    };

    state: {
        notificationType: number;
    };

    constructor(props) {
        super(props);
        this.state = {
            notificationType: -1,
        };
    }

    render() {
        const swipeBtns = [{
            backgroundColor: 'red',
            onPress: () => { this.props.onDelete(this.props.notification._id); },
            text: 'Delete',
        }];
        const bgColor = this.props.notification.was_read ? CP.moafWhite : '#ffffff';
        return (
            <Swipeout
                autoClose={true}
                backgroundColor={bgColor}
                right={swipeBtns}
                scroll={this.props.setScrolling}
            >
                
                {this._renderNotificationType()}
                    
            </Swipeout>
        );
    }

    componentDidMount() {
        this.setNotificationType();
    }

    _renderNotificationType = () => {
        let component = null;
        if (this.props.notification.type == 0) {
            component = (
                    <TouchableOpacity delayPressIn={300} onPressIn={this.toConvo}>
                        <View style={[GS.flex1, GS.flexRow1, styles.cont]}>
                            <View style={[GS.flexCol1]}>
                                <Text style={[styles.text]}>There's a response by {this._renderResponder()} in your convo <Text style={[styles.linkable]}>
                                    {this.getConvoText()}</Text> <Text style={[styles.since]}>{this.getElapsedTime()}</Text>
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                );
            /*        
            switch (this.state.notificationType) {
                // you posted a convo
                case 0:
                    component = (
                        <TouchableOpacity delayPressIn={300} onPressIn={this.toConvo}>
                            <View style={[GS.flex1, GS.flexRow1, styles.cont]}>
                                <View style={[GS.flexCol1]}>
                                    <Text style={[styles.text]}>Your convo <Text style={[GS.bold]}>
                                        {this.getConvoText()}</Text> has been approved. <Text style={[styles.since]}>{this.getElapsedTime()}</Text>
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    );
                    break;
                // you responded to a convo
                case 1:
                    component = (
                        <TouchableOpacity delayPressIn={300} onPressIn={this.toConvo}>
                            <View style={[GS.flex1, GS.flexRow1, styles.cont]}>
                                <View style={[GS.flexCol1]}>
                                    <Text style={[styles.text]}>Your response in {this.isNotificationOwnerTheConvoPoster() ? 'your' : 'the'} convo <Text style={[GS.bold]}>
                                        {this.getConvoText()}</Text> has been approved. <Text style={[styles.since]}>{this.getElapsedTime()}</Text>
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    );
                    break;
                // someone responded to your convo
                case 2:
                    component = (
                        <TouchableOpacity delayPressIn={300} onPressIn={this.toConvo}>
                            <View style={[GS.flex1, GS.flexRow1, styles.cont]}>
                                <View style={[GS.flexCol1]}>
                                    <Text style={[styles.text]}>There's a response by {this._renderResponder()} in your convo <Text style={[GS.bold]}>
                                        {this.getConvoText()}</Text> <Text style={[styles.since]}>{this.getElapsedTime()}</Text>
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    );
                    break;
                // you responded to a chat in a convo
                case 3:
                    component = (
                        <TouchableOpacity delayPressIn={300} onPressIn={this.toConvo}>
                            <View style={[GS.flex1, GS.flexRow1, styles.cont]}>
                                <View style={[GS.flexCol1]}>
                                    <Text style={[styles.text]}>Your response in {this.isNotificationOwnerTheConvoPoster() ? 'your' : 'the'} convo <Text onPress={this.toConvo} style={[GS.bold]}>
                                        {this.getConvoText()}</Text> has been approved. <Text style={[styles.since]}>{this.getElapsedTime()}</Text>
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    );
                    break;
                // someone responded to your chat in a convo
                case 4:
                    // it was you. you responded to yourself.
                    if (this.isResponderTheInResponseToResponder()) {
                       component = (
                            <TouchableOpacity delayPressIn={300} onPressIn={ this.toConvo }>
                                <View style={[GS.flex1, GS.flexRow1, styles.cont]}>
                                    <View style={[GS.flexCol1]}>
                                        <Text style={[styles.text]}>Your response in {this.isNotificationOwnerTheConvoPoster() ? 'your' : 'the'} convo <Text style={[GS.bold]}>
                                            {this.getConvoText()}</Text> has been approved. <Text style={[styles.since]}>{this.getElapsedTime()}</Text>
                                        </Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                       );
                    } else {
                        component = (
                            <TouchableOpacity delayPressIn={300} onPressIn={ () => { this.toActivity(this.getResponderId()) }}>
                                <View style={[GS.flex1, GS.flexRow1, styles.cont]}>
                                    <View style={[GS.flexCol1]}>
                                        <Text style={[styles.text]}>{this._renderResponder()} has responded to you in {this.isNotificationOwnerTheConvoPoster() ? 'your' : 'the'} convo <Text style={[GS.bold]}>
                                            {this.getConvoText()}</Text> <Text style={[styles.since]}>{this.getElapsedTime()}</Text>
                                        </Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        );
                    }
                    break;
            } */
        } else if (this.props.notification.type == 1) {
            component = (
                <TouchableOpacity delayPressIn={300} onPressIn={ this.toConvo }>
                    <View style={[GS.flex1, GS.flexRow1, styles.cont]}>
                        <View style={[GS.flexCol1]}>
                            <Text style={[styles.text]}>{this._renderResponder()} mentioned you in {this.isNotificationOwnerTheConvoPoster() ? 'your' : 'the'} convo <Text onPress={this.toConvo} style={[styles.linkable]}>
                                {this.getConvoText()}</Text> <Text style={[styles.since]}>{this.getElapsedTime()}</Text>
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>
            );
        }
        return component;
    };

    _renderResponder = () => {
        return (
            <Text style={[styles.text, GS.bold, GS.colorMagenta]}
            >{this.getResponderUsername()}</Text>
        );
    };

    _updateWasRead = () => {
        this.props.notification.was_read = true;
    };

    // notification owner-level data...

    getNotificationOwner = () => {
        return this.props.notification.user;
    };

    getNotificationOwnerId = () => {
        const owner = this.getNotificationOwner();
        return owner._id;
    };

    getNotificationOwnerUsername = () => {
        const owner = this.getNotificationOwner();
        return owner.username;
    };

    isNotificationOwnerASponsor = () => {
        const owner = this.getNotificationOwner();
        return owner.is_sponsor;
    };

    isNotificationOwnerTheConvoPoster = () => {
        return this.getNotificationOwnerId() === this.getConvoPosterId();
    };

    isNotificationOwnerTheResponder = () => {
        return this.getNotificationOwnerId() === this.getResponderId();
    };

    isNotificationOwnerTheInResponseToResponder = () => {
        return this.getNotificationOwnerId() === this.getInResponseToResponderId();
    };

    // convo-level data...

    getConvo = () => {
        return this.props.notification.convo;
    };

    getConvoId = () => {
        const convo = this.getConvo();
        return convo._id;
    };

    getConvoText = () => {
        let text = Util.sanitize(this.getConvo().text);
        if (text.length > 140) {
            text = `${text.substr(0, 137)}...`;
        }
        return text;
    };

    getConvoPoster = () => {
        const convo = this.getConvo();
        return convo.user;
    };

    getConvoPosterId = () => {
        const convoPoster = this.getConvoPoster();
        return convoPoster._id;
    };

    getConvoPosterUsername = () => {
        const convoPoster = this.getConvoPoster();
        return convoPoster.username;
    };

    isConvoPosterASponsor = () => {
        const convoPoster = this.getConvoPoster();
        return convoPoster.is_sponsor;
    };

    isConvoPosterTheResponder = () => {
        return this.getConvoPosterId() === this.getResponderId();
    };

    isConvoPosterTheInResponseToResponder = () => {
        return this.getConvoPosterId() === this.getInResponseToResponderId();
    };

    isThisAConvoNotification = () => {
        if (this.isNotificationOwnerTheInResponseToResponder()) {
            return false;
        }
        if (this.isNotificationOwnerTheResponder()) {
            return false;
        }
        return this.isNotificationOwnerTheConvoPoster();
    };

    // response-level data...

    getResponse = () => {
        return this.props.notification.response;
    };

    getResponseId = () => {
        const response = this.getResponse();
        return get(response, '_id');
    };

    getResponder = () => {
        const response = this.getResponse();
        return get(response, 'user');
    };

    getResponderId = () => {
        const responder = this.getResponder();
        return get(responder, '_id');
    };

    getResponderUsername = () => {
        const responder = this.getResponder();
        return get(responder, 'username');
    };

    isResponderASponsor = () => {
        const responder = this.getResponder();
        return get(responder, 'is_sponsor', false);
    };

    isResponderTheInResponseToResponder = () => {
        return this.getResponderId() === this.getInResponseToResponderId();
    };

    isThisAResponseNotification = () => {
        if (this.isThisAConvoNotification()) {
            return false;
        }
        if (this.isResponderTheInResponseToResponder()) {
            return false;
        }
        return this.isNotificationOwnerTheResponder();
    };

    // in_response_to-level data...

    getInResponseTo = () => {
        const response = this.getResponse();
        return get(response, 'in_response_to');
    };

    getInResponseToResponseId = () => {
        const inResponseTo = this.getInResponseTo();
        return get(inResponseTo, '_id');
    };

    getInResponseToResponder = () => {
        const inResponseTo = this.getInResponseTo();
        return get(inResponseTo, 'user');
    };

    getInResponseToResponderId = () => {
        const inResponseToResponder = this.getInResponseToResponder();
        return get(inResponseToResponder, '_id');
    };

    getInResponseToResponderUsername = () => {
        const inResponseToResponder = this.getInResponseToResponder();
        return get(inResponseToResponder, 'username');
    };

    isInResponseToResponderASponsor = () => {
        const inResponseToResponder = this.getInResponseToResponder();
        return get(inResponseToResponder, 'is_sponsor', false);
    };

    isThisAnInResponseToNotification = () => {
        if (this.isThisAConvoNotification()) {
            return false;
        }
        if (this.isThisAResponseNotification()) {
            return false;
        }
        return this.isNotificationOwnerTheInResponseToResponder();
    };

    // utility-level...

    getElapsedTime = () => {
        return Util.getElapsedTime(this.props.notification.date);
    };

    setNotificationType = () => {
        if (this.isThisAConvoNotification()) {
            this.setState({ notificationType: 0 });
        }
        if (this.state.notificationType < 0) {
            if (this.isThisAResponseNotification()) {
                if (this.isNotificationOwnerTheResponder()) {
                    this.setState({ notificationType: 1 });
                } else {
                    this.setState({ notificationType: 2 });
                }
            }
        }
        if (this.state.notificationType < 0) {
            if (this.isThisAnInResponseToNotification()) {
                if (this.isNotificationOwnerTheInResponseToResponder()) {
                    this.setState({ notificationType: 4 });
                } else {
                    this.setState({ notificationType: 3 });
                }
            }
        }
    };

    toConvo = () => {        
        if (!this.props.notification.was_read) {
            this.props.wasRead(this.props.notification, shouldUpdate => {
                if (shouldUpdate) {
                    this._updateWasRead();
                }
                Actions.convo({ adCheckToken: Util.randomNumber(), convoId: this.getConvoId() });
            });
        } else {
            Actions.convo({ adCheckToken: Util.randomNumber(), convoId: this.getConvoId() });
        }
    };

    toActivity = _id => {
        if (!this.props.notification.was_read) {
            this.props.wasRead(this.props.notification, shouldUpdate => {
                if (shouldUpdate) {
                    this._updateWasRead();
                }
                Actions.activity({ adCheckToken: Util.randomNumber(), userId: _id });
            });
        } else {
            Actions.activity({ adCheckToken: Util.randomNumber(), userId: _id });
        }
    };
}

Notification.propTypes = {
    notification: PropTypes.object.isRequired,
    onDelete: PropTypes.func.isRequired,
    setScrolling: PropTypes.func.isRequired,
    wasRead: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
    cont: {
        borderBottomColor: CP.moafWhite,
        borderBottomWidth: 1,
        padding: 10,
    },
    since: {
        color: CP.moafLightGray,
    },
    linkable: {
        color: CP.moafSkyBlue,
        fontFamily: 'Raleway-Regular',
        fontSize: 15,
        fontWeight: Util.isAndroid() ? '400' : '500',
    },
    text: {
        color: CP.moafDarkGray,
        fontFamily: 'Raleway-Regular',
        fontSize: 15,
        fontWeight: Util.isAndroid() ? '400' : '500',
    },
});

export { Notification };
