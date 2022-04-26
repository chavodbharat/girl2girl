import React, { PureComponent } from 'react';
import RN, { Alert, Image, Text, TouchableHighlight, View, StyleSheet, Linking } from 'react-native';
import { GlobalStyles as GS, ColorPalette as CP } from './../../styles';
import HTML from 'react-native-render-html';
import { Actions } from 'react-native-router-flux';
import get from 'lodash/get';
import { Ajax } from '../services/ajax';
import { Util } from './../services/util';
import type { Response as Model } from './../decls/response';
import PropTypes from 'prop-types';
import { Storage } from './../services/storage';

class Response extends React.Component {

    props: {
        getRespondedTo: Function;
        isGuest: boolean;
        onShare: Function;
        response: Model;
		xref: Function;
    };

    state: {
        inResponseTo: Model;
		padding: 0,
		user: null
    };

    constructor(props: any) {
        super(props);
        this.state = {
            inResponseTo: null,
			user: {}
        };
        if (this.props.response.in_response_to) {
            this.state.inResponseTo = this.props.getRespondedTo(this.props.response.in_response_to);
        }
    }

    getStyles = () => {
        return this.getResponse().status == 'publish' ? [] : styles.responseAwaiting;
		//return [];
    }
	
	async componentWillMount () {
		const user = await Storage.getSessionUser();
		this.setState({
			user: user
		});
	}

    render() {
        return (
            <View style={[GS.flex1, GS.flexCol1, styles.cont, this.getStyles()]} collapsable={false} ref={ (x) => { if (this.props.xref) { this.props.xref(this.props.response._id, x); } } }>				
                <View style={[GS.flexRow1, GS.flexStretch]}>
                    <View style={[GS.flexRow7, GS.flexGrow1, GS.flexShrink0, GS.flexWrap]}>
                        <Text
                            onPress={() => { this.activityView(this.getResponderId()); }}
                            style={[styles.smallText, styles.username]}
                        >{this.getResponderUsername()}</Text>
                    </View>
                    <View style={[{ width: 95 }, GS.flexGrow0, GS.flexShrink1]}>
                        <View style={[GS.flexRow3, GS.flexGrow1]}>
                            <Text style={[styles.since]}>{this.getResponse().status == 'publish' ? this.getElapsedTime(): ""}</Text>
                        </View>
                    </View>
                </View>
                <View style={[GS.flexRow1, GS.flexWrap, GS.marginT5]}>
                    {this.getResponse().status == 'publish' || this.state.user._id == this.getResponse().user._id ? 
					<View style={{
							flexDirection:'row', 
							flexWrap:'wrap', 
							marginLeft:      (this.props.response.depth - 1) * 15, 
							paddingLeft:     (this.props.response.depth != 1 ? 10: 0), 
							borderLeftWidth: (this.props.response.depth != 1 ? 1: 0), 
							borderLeftColor: CP.moafPlum
						}}>{ this._renderResponseHandle()}{this.mapStringToComponent(this.getText())}</View>:
                    <Text style={[styles.responseText]}>(Awaiting moderation)</Text>}
                </View>
                {this.getResponse().status == 'publish' ? 
                <View style={[GS.flexRow1]}>                    
                    <TouchableHighlight
                        activeOpacity={1.0}
                        onPress={this.onRespond}
                        style={[{ marginRight: 25 }]}
                        underlayColor={'transparent'}
                    >
                        <View
                            style={[GS.flexRow1, GS.marginV5]}
                        >
                            <Image source={require('./../img/convo_icon_comment.png')} />
                            <Text style={[styles.smallText, GS.marginL5]}>Chat</Text>
                        </View>
                    </TouchableHighlight>
                    <TouchableHighlight
                        activeOpacity={1.0}
                        onPress={this.onShare}
                        underlayColor={'transparent'}
                    >
                        <View
                            style={[GS.flexRow1, GS.flexWrap, GS.marginV5]}
                        >
                            <Image source={require('./../img/convo_icon_share.png')} />
                            <Text style={[styles.smallText, GS.marginL5]}>Share</Text>
                        </View>
                    </TouchableHighlight>
                </View>:
                <View style={[GS.flexRow1]}></View>
                }
            </View>
        );
    }

    _renderResponseHandle = () => {
        if (this.getInResponseTo()) {
            // same user responding to her response. ellipsize name
            if (this.isResponderTheInResponseToResponder()) {
                return (
                    <Text style={[GS.bold]}>... </Text>
                );
            }
            // otherwise @username link
            return (
                <Text
                    onPress={() => { this.activityView(this.getInResponseToResponderId()); }}
                    style={[GS.bold]}
                >@{this.getInResponseToResponderUsername()}: </Text>
            );
        }
        return null;
    };

    activityView = (_id) => {
        Actions.activity({ adCheckToken: Util.randomNumber(), userId: _id });
    };

    getElapsedTime = () => {
        return Util.getElapsedTime(this.getResponse().date);
    };

    getId = () => {
        return this.getResponse()._id;
    };

    getInResponseTo = () => {
        return this.state.inResponseTo;
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
        const respondedToUser = this.getInResponseToResponder();
        return `${respondedToUser.is_sponsor ? 'our sponsor ' : ''}${respondedToUser.username}`;
    };

    getResponder = () => {
        return this.getResponse().user;
    };

    getResponderId = () => {
        return this.getResponder()._id;
    };

    getResponderUsername = () => {
        const user = this.getResponder();
        return `${user.is_sponsor ? 'our sponsor ' : ''}${user.username}`;
    };

    getResponse = () => {
        return this.props.response;
    };

    getResponseId = () => {
        const response = this.getResponse();
        return response._id;
    };

    getText = () => {
        let text = Util.sanitize(this.getResponse().text);
		return text;
    };
	
	gotoUserByName = (name) => {
		let self = this;
		return () => {
			Ajax.getUserIdByNickname(name.substr(1))
			.then((id) => {
				if (id) {
					self.activityView(id);
				}
			});
		}
	};
	
	gotoExtWeb = (url) => {
		let self = this;
		return () => {
			Linking.openURL(url);
		}
	};
	
	searchByTag = (qs) => {
		return () => {
			return false; //TODO goto search by tag
		}
	};
	
	mapStringToComponent = (text) => {
		let self = this;
		let str = text.replace(/@[a-zA-Z_0-9]+/g, '<user name="$&">$&</user>');
		str = str.replace(/http[s]?:\/\/[^ ]+/g, '<xlink href="$&">$&</xlink>');
		str = str.replace(/#[a-zA-Z_0-9]+/g, '<hashtag qs="$&">$&</hashtag>');
		return ( 
		<HTML 
			html={str} 
			containerStyle={{flexDirection:'row', flexWrap:'wrap'}} 
			onLinkPress={() => {Alert.alert()}}
			renderers={{
				user: (att, a) => {
					return (<Text onPress={self.gotoUserByName(att.name)} style={{ color: CP.moafDarkPurple }}>{a}</Text>);
				},
				xlink: (att, a) => {
					return (<Text onPress={self.gotoExtWeb(att.href)} style={{ color: CP.moafLightPurple }}>{a}</Text>);
				},
				hashtag: (att, a) => {
					return (<Text onPress={self.searchByTag(att.qs)} style={{ color: CP.moafSoftPink }}>{a}</Text>);
				}
			}} />
		)
	}

    isResponderTheInResponseToResponder = () => {
        return this.getResponderId() === this.getInResponseToResponderId();
    };

    onRespond = () => {
        if (this.props.isGuest) {
            Actions.guest({ adCheckToken: Util.randomNumber() });
        } else {
            this.props.onResponse(this.getResponseId());
        }
    };

    onShare = () => {
        this.props.onShare({
            text: `${this.getText().substring(0, 40)}...`
        });
    };

}

const styles = StyleSheet.create({
    cont: {
        borderBottomColor: CP.moafBorder,
        borderBottomWidth: 1,
		backgroundColor: CP.moafWhite,
        padding: 10,
    },
    darkGrayText: {
        color: CP.moafDarkGray,
    },
    group: {
        color: CP.moafSkyBlue,
        fontSize: 14,
        fontWeight: '700',
    },
    responseText: {
        fontFamily: 'Raleway-Regular',
        fontSize: 15,
        fontWeight: '400',
        lineHeight: 20,
        marginBottom: 10,
        marginTop: 10,
    },
    responseAwaiting: {
        backgroundColor: '#FFFFE0'
    },
    since: {
        color: CP.moafLightGray,
        fontFamily: 'Raleway-Regular',
        fontSize: 11,
    },
    smallText: {
        fontFamily: 'Raleway-Regular',
        fontSize: 11,
    },
    username: {
        color: CP.moafMagenta,
        fontWeight: '800',
    }
});

Response.propTypes = {
    getRespondedTo: PropTypes.func.isRequired,
    xref: PropTypes.func.isOptional,
    isGuest: PropTypes.bool.isRequired,
    onResponse: PropTypes.func.isRequired,
    onShare: PropTypes.func.isRequired,
    response: PropTypes.object.isRequired,
};

export { Response };
