import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, View, KeyboardAvoidingView, Dimensions, Alert, TouchableOpacity , SafeAreaView} from 'react-native';
import { GlobalStyles as GS, ColorPalette as CP } from './../../styles';
import dismissKeyboard from 'react-native-dismiss-keyboard';
import Button from 'apsl-react-native-button';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import { Ajax } from './../services/ajax';
import { Storage } from './../services/storage';
import { Util } from './../services/util';
import { AlertDialog } from '../components/alert-dialog';
import { BackButton } from '../components/back-button';
import { GroupButton } from './../components/group-button';
import { Loading } from '../components/loading';
import type { Group as Model } from './../decls/group';
import PropTypes from 'prop-types';
const PSMInterstitialAdView = require('./../module/ad-interstitial').PSMInterstitialAdView;
import { Suggestion } from '../components/suggestion';

class CreateConvoView extends React.Component {

    props: {
        adCheckToken: number;
    };

    state: {
        activeGroups: Array<Model>;
        ajaxMsg: string;
        alertType: string;
        async: boolean;
        filteredGroups: Array<Model>;
        groups: Array<Model>;
        newestGroups: Array<Model>;
        popularGroups: Array<Model>;
        selectedFilter: number;
        selectedGroup: any;
        text: string;
        title: string;
        keyboardType: string;
        isSubmitted: boolean;
    };

    constructor(props) {
        super(props);        
        this.state = {
            activeGroups: [],
            ajaxMsg: '',
            alertType: '',
            async: false,
            filteredGroups: [],
            groups: [],
            newestGroups: [],
            popularGroups: [],
            selectedFilter: 3,
            selectedGroup: null,
            text: '',
            title: '',
            isSubmitted: false,
            keyboardType: Util.isIOS() ? "twitter" : "email-address"
        };
        this.alertDialog = null;
        this.sessionUser = null;
        this.suggestion  = null;
        this.sessionUserListener = user => {
            this.sessionUser = user;
            this.forceUpdate();
        };
        Storage.addSessionUserListener(this.sessionUserListener);
    }

    render() {
        const selectedId = this.state.selectedGroup ? this.state.selectedGroup._id : null;
        const groupButtons = this.state.filteredGroups.map((group, idx) => {
            let bgColor = group._id === selectedId ? [GS.bgColorMagenta] : [];
            return (<GroupButton
                accessibility={group.name}
                classes={bgColor}
                index={idx}
                isGuest={this.sessionUser === null}
                key={idx}
                onPress={this.groupPressed}
                text={group.name.replace(/&amp;/g, '&')}
            />);
        });

        return (
            <SafeAreaView style={[GS.statusBar]}>
            <View style={[GS.flex1, GS.flexCol1, GS.bgColorLightPurple]}>
                <View style={[styles.header]}>
                    <BackButton />
                    <Text style={[GS.headerText]}>Start a Convo</Text>
                    {this._renderSubmit()}
                    <TextInput 
                        placeholder={"Title"}
                        onChangeText={text => {this.onChangeTitle(text);}}
                        placeholderTextColor={'#9a9a9a'}
                        style={[GS.textInput]}
                        value={this.state.title}
                        underlineColorAndroid={'transparent'}
                    />
                    <TextInput
                        ref={"newConvoInput"}
                        multiline
                        onChangeText={text => {this.onChangeText(text);}}
                        placeholder={'Start typing'}
                        placeholderTextColor={'#9a9a9a'}
                        keyboardType={this.state.keyboardType}
                        style={[GS.textInputMultiline]}
                        underlineColorAndroid={'transparent'}
                        value={this.state.text}
                    />
                </View>
                <View style={[GS.flexStretch]}>
                    <Text style={[styles.pickText]}>Pick the group to post to</Text>
                    <View style={[GS.flexRow5, GS.flexStretch, GS.marginT15]}>
                        <Text
                            onPress={() => {this.filterPressed(0);}}
                            style={this.state.selectedFilter === 0 ? GS.headerText : styles.filterUnselected}
                        >Popular</Text>
                        <Text style={[GS.headerText]}> | </Text>
                        <Text
                            onPress={() => {this.filterPressed(3);}}
                            style={this.state.selectedFilter === 3 ? GS.headerText : styles.filterUnselected}
                        >All</Text>
                    </View>
                </View>
                <ScrollView
                    keyboardShouldPersistTaps={'handled'}
                    showsHorizontalScrollIndicator={false}
                    style={[GS.flexStretch]}
                >
                    <View style={[GS.flexRow2, GS.flexWrap, GS.marginT15]}>
                        {groupButtons}
                    </View>
                </ScrollView>
                <Loading isOpen={this.state.async} />
                <AlertDialog
                    ref={alertDialog => { this.alertDialog = alertDialog; }}
                    text={this.state.ajaxMsg}
                    type={this.state.alertType}
                />
                <Suggestion                    
                    ref={suggestion => { this.suggestion = suggestion; }}
                    onSelect={this.inputUsername}
                />
                {
                    Util.isIOS() &&
                    <KeyboardSpacer />
                }                
            </View>
            </SafeAreaView>
        )
    }

    inputUsername = (name) => {
        this.refs.newConvoInput.blur(); 
        this.suggestion.close();
        let newText = this.state.text.replace(/(.*)(@[^\s]*)$/, "$1@" + name);
        this.setState({ text: newText });
    };

    componentDidMount() {
        this.setState({ async: true });
        Ajax.getGroups(res => {            
            this.setState({
                activeGroups: res.groups.filter(g => g.is_active),
                filteredGroups: res.groups,
                groups: res.groups,
                newestGroups: res.groups.filter(g => g.is_newest),
                popularGroups: res.groups.filter(g => g.is_popular),
            });
            this.setState({ async: false });
            this.forceUpdate();
        }, err => {
            this.setState({ async: false });
            this.setState({
                ajaxMsg: err.message,
            }, () => {
                this.alertDialog.open();
            });
        });
        Util.shouldShowInterstitial(shouldDisplay => {
            if (shouldDisplay) {
                PSMInterstitialAdView.show();
            }
        });
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.adCheckToken !== this.props.adCheckToken) {
            Util.shouldShowInterstitial(shouldDisplay => {
                if (shouldDisplay) {
                    PSMInterstitialAdView.show();
                }
            });
        }
    }

    componentWillUnmount() {
        Storage.removeSessionUserListener(this.sessionUserListener);
    }

    filterPressed = (index: number) => {
        switch (index) {
            case 0:
                this.setState({ filteredGroups: this.state.popularGroups });
                break;
            case 1:
                this.setState({ filteredGroups: this.state.newestGroups });
                break;
            case 2:
                this.setState({ filteredGroups: this.state.activeGroups });
                break;
            case 3:
                this.setState({ filteredGroups: this.state.groups });
                break;
        }
        this.setState({ selectedFilter: index });
    };

    _renderSubmit = () => {
        if (this.state.text.trim() && this.state.selectedGroup && this.state.title.trim() && !this.state.isSubmitted) {
            return (
                <Button
                    accessibilityLabel={'submit'}
                    onPress={this.submit}
                    style={[styles.submitButton]}>
                    <Text style={[styles.submitText]}>Submit</Text>
                </Button>
            );
        }
    };

    groupPressed = (idx: number) => {
        this.setState({ selectedGroup: this.state.filteredGroups[idx] });
    };

    onChangeTitle = (text: string) => {
        this.setState({ title: text });
    };

    onChangeText = (text: string) => {
        if (/.*@[^\s]*$/.test( text )) {     
            let tmp = text.match(/.*@([^\s]+)$/);
            tmp = tmp ? tmp[1] : tmp;
            this.suggestion.open( tmp );
        } else {
            this.suggestion.close();
        }
        this.setState({ text: text });
    };

    submit = () => {
        if (this.state.isSubmitted) {
            return false;
        }
        const trimmed = this.state.text;
        const title   = this.state.title;
        if (!trimmed) {
            return false;
        }
        if (!title) {
            return false;
        }
        dismissKeyboard();
        const convo = {
            date: new Date().toISOString(),
            group_id: this.state.selectedGroup._id,
            text: trimmed,
            user_id: this.sessionUser._id,
            title: title
        };
        this.state.isSubmitted = true;
        Ajax.postConvo(convo, () => {
            this.setState({ async: false });
            this.setState({
                ajaxMsg: 'Thanks! Your convo will be reviewed and posted shortly!',
                alertType: 'Info',
                text: '',
                title: ''
            }, () => {
                this.alertDialog.open();
            });
            this.state.isSubmitted = false;
        }, err => {
            this.setState({ async: false });
            this.setState({
                ajaxMsg: err.message,
                alertType: 'Error',
            }, () => {
                this.alertDialog.open();
            });
            this.state.isSubmitted = false;
        });
    };
}

CreateConvoView.propTypes = {
    adCheckToken: PropTypes.number.isRequired,
};

const topOffset = 10;

const styles = StyleSheet.create({
    filterUnselected: {
        color: CP.moafBlack,
        fontFamily: 'raleway',
        fontSize: 18,
        fontWeight: '700',
    },
    avatar: {
        borderRadius: 10,
        resizeMode: 'cover',
    },
    header: {
        alignItems: 'center',
        alignSelf: 'stretch',
        height: 225,
        justifyContent: 'center',
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: topOffset,
    },
    pickText: {
        color: CP.moafWhite,
        fontFamily: 'Raleway-Regular',
        fontSize: Util.isAndroid() ? 22: 22,
        fontWeight: Util.isAndroid() ? '600' : '600',
        lineHeight: 25,
        marginLeft: 30,
        marginRight: 30,
        textAlign: 'center',
    },
    submitButton: {
        borderWidth: 0,
        padding: 0,
        position: 'absolute',
        right: 15,
        top: topOffset * 2.33,
    },
    submitText: {
        color: CP.moafWhite,
        fontFamily: 'raleway',
        fontSize: 18,
        fontWeight: '500',
    },
});

export { CreateConvoView };
