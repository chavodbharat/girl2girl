import React from 'react';
import { Image, Text, TouchableHighlight, View, StyleSheet, Button, Alert } from 'react-native';
import { Actions } from 'react-native-router-flux';
import { GlobalStyles as GS, ColorPalette as CP } from './../../styles';
import { Util } from './../services/util';
import type { ShortConvo as Model } from './../decls/short-convo';
import sanitizeHtml from 'sanitize-html';
import PropTypes from 'prop-types';

class ShortConvo extends React.Component {

    props: {
        convo: Model;
        isGuest: boolean;
        onFollow: Function;
        rowID: number | string;
        sectionID: number | string;
        showGroup: boolean;
        showUser: boolean;
        size: number;
        moreButtonPress: Function;
        showMore: Function;
    };

    constructor(props: any) {
        super(props);
        //console.log('shortConvo : convo:',props.convo);
        console.log('convo: title:',props.convo.title,':number_response:', props.convo.num_responses)
    }

    render() {
        if (this.props.convo == null || this.props.convo.user == null) {
            return null;
        }
        return (
            <View>
			{this.props.convo.title ? 
            <View style={[GS.flex1, GS.flexRow1, {backgroundColor: CP.moafWhite}]}>
                <Text style={[styles.title, {backgroundColor: CP.moafWhite}]}>{this.getTitle()}</Text>
            </View> : null }
            <View style={[GS.flex1, GS.flexRow1, styles.cont, {backgroundColor: CP.moafWhite}]}>
                <View style={[GS.flexCol1, GS.flex1]}>
                    <View style={[GS.flexRow7, GS.flexWrap]}>
                        <Text style={[GS.smallText, styles.darkGrayText]}>Added</Text>
                        {this._renderUserInfo()}
                        {this._renderGroupInfo()}
                    </View>
                    <TouchableHighlight
                        activeOpacity={1.0}
                        onPress={this.onConvo}
                        style={[GS.flexRow1, GS.flexWrap, GS.marginT5]}
                        underlayColor={'transparent'}
                    >
                        <Text style={[GS.convoText]}>{this.getText()}</Text>
                    </TouchableHighlight>
                    <TouchableHighlight
                        activeOpacity={1.0}
                        onPress={this.onFollow}
                        underlayColor={'transparent'}
                    >
                        <View
                            style={[GS.flexRow1, GS.flexWrap, GS.marginV5]}
                        >
                            <Image
                                source={this.isFollowing() ? require('./../img/convo_icon_follow_active.png') : require('./../img/convo_icon_follow.png')} />
                            <Text style={[GS.smallText, styles.darkGrayText, GS.marginL5]}>
                                {this.getFollowersText()} this convo
                            </Text>
                        </View>
                    </TouchableHighlight>
                </View>
                <View style={[GS.flexCol1, GS.flexShrink0, GS.flexGrow0, GS.paddingL5, {flexBasis: 85}]}>
                    <View style={[GS.flexRow9, GS.flexGrow0, GS.paddingT3]}>
                        <Text style={[GS.since]}>{this.getElapsedTime()}</Text>
                    </View>
                    <View style={[GS.flexCol7, GS.flexStretch, GS.flexGrow1]}>
                        <TouchableHighlight
                            activeOpacity={1.0}
                            onPress={this.onConvo}
                            style={[GS.flexStretch, GS.marginV5]}
                            underlayColor={'transparent'}
                        >
                            <View style={[GS.flexRow1, GS.flexStretch]}>
                                <Image source={this.getNumberOfResponsesIcon()} />
                                <Text
                                    style={[GS.smallText, styles.darkGrayText, GS.marginL5]}>{this.getResponsesText()}</Text>
                            </View>
                        </TouchableHighlight>
                    </View>
                </View>
            </View>
            <View>
                {this.props.showMore(this.props.rowID) ?
                <Button color={CP.moafLightGray} style={[styles.more, GS.flexCol1]} title="MORE" onPress={this.props.moreButtonPress}/> : null
                }
            </View>
            </View>
        );
    }

    _renderGroupInfo = () => {
        if (this.props.showGroup)  {
            return (
                <View style={[GS.flexRow7]}>
                    <Text style={[GS.smallText, styles.darkGrayText]}> to</Text>
                    <Text style={[GS.smallText, styles.group]} onPress={this.groupView}> {this.getGroupName()}</Text>
                </View>
            );
        }
    };

    _renderUserInfo = () => {
        if (this.props.showUser)  {
            return (
                <View style={[GS.flexRow1]}>
                    <Text style={[GS.smallText, styles.darkGrayText]}> by</Text>
                    <Text style={[GS.smallText, GS.username]} onPress={this.activityView}> {this.getUsername()}</Text>
                </View>
            );
        }
    };

    activityView = () => {
        Actions.activity({ adCheckToken: Util.randomNumber(), userId: this.getUserId() });
    };

    getElapsedTime = () => {
        return Util.getElapsedTime(this.props.convo.lastUpdate);
    };

    getFollowersText = () => {
        const isFollowing = this.isFollowing();
        let text = '';
        if (isFollowing) {
            const numFollowers = this.getNumberOfFollowers() - 1;
            text = 'You';
            if (numFollowers === 0) {
                text = `${text} follow`;
            } else {
                text = `${text} and ${numFollowers} ${numFollowers > 1 ? 'people follow' : 'person follows'}`;
            }
        } else {
            const numFollowers = this.getNumberOfFollowers();
            text = `${numFollowers} ${numFollowers !== 1 ? 'people follow' : 'person follows'}`;
        }
        return text;
    };

    getGroupId = () => {
        return this.props.convo.group._id;
    };

    getGroupName = () => {
        return this.props.convo.group.name.replace(/&amp;/g, '&');
    };

    getId = () => {
        return this.props.convo._id;
    };

    getNumberOfFollowers = () => {
        return this.props.convo.num_followers;
    };

    getNumberOfResponses = () => {
        return this.props.convo.num_responses;
    };

    getNumberOfResponsesIcon = () => {
        if (this.hasResponded()) {
            return require('./../img/convo_icon_comment_added.png');
        }
        if (this.getNumberOfResponses() > 0) {
            return require('./../img/convo_icon_comment.png');
        }
        return require('./../img/convo_icon_no_comments.png');
    };

    getResponsesText = () => {
        const numResponses = this.getNumberOfResponses();
        const cardinality = numResponses === 1 ? 'chat' : 'chats';
        return `${numResponses === 0 ? 'No' : numResponses} ${cardinality}`;
    };

    getTitle = () => {
        const ttl = this.props.convo.title;
        if (ttl > 60) {
            return `${ttl.substr(0, 57)}...`;
        }
        return ttl;
    }

    getText = () => {
        let text = Util.sanitize(this.props.convo.text);
        if (text.length > 140) {
            text = `${text.substr(0, 137)}...`;
        }
        return text;
    };

    getUserId = () => {
        return this.props.convo.user._id;
    };

    getUsername = () => {
        return `${this.props.convo.user.is_sponsor ? 'our sponsor ' : ''}${this.props.convo.user.username}`;
    };

    groupView = () => {
        Actions.group({ adCheckToken: Util.randomNumber(), groupId: this.getGroupId() });
    };

    hasResponded = () => {
        return this.props.convo.has_responded;
    };

    isFollowing = () => {
        return this.props.convo.is_following;
    };

    onConvo = () => {
        console.log('shortConvo- onConvo is clicked.',this.props.convo);
        Actions.convo({ adCheckToken: Util.randomNumber(), convoId: this.props.convo.convo_id, scrollTo: this.props.convo._id });
    };

    onFollow = () => {
        if (this.props.isGuest) {
            Actions.guest({ adCheckToken: Util.randomNumber() });
        } else {
            this.props.onFollow(this.props.sectionID, this.props.rowID);
        }
    };

}

const styles = StyleSheet.create({
    more: {
        fontFamily: 'Raleway-Regular',
        paddingTop:5,
        paddingBottom:5
    },
	title: {
		paddingTop: 10,
		paddingLeft: 10,
		fontWeight: 'bold'
	},
    cont: {
        borderBottomColor: CP.moafBorder,
        borderBottomWidth: 1,
        padding: 10,
    },
    darkGrayText: {
        color: CP.moafDarkGray,
    },
    group: {
        color: CP.moafSkyBlue,
        fontFamily: 'Raleway-Regular',
        fontSize: 14,
        fontWeight: '700',
        marginBottom: -0.5
    },
});

ShortConvo.propTypes = {
    convo: PropTypes.object.isRequired,
    isGuest: PropTypes.bool.isRequired,
    onFollow: PropTypes.func.isRequired,
    rowID: PropTypes.any.isRequired,
    sectionID: PropTypes.any.isRequired,
    showGroup: PropTypes.bool.isRequired,
    showUser: PropTypes.bool.isRequired,
};

export { ShortConvo };
