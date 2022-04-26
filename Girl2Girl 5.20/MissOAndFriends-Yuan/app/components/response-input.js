import React from 'react';
import { Animated, StyleSheet, Text, TextInput, View, TouchableOpacity, Dimensions } from 'react-native';
import { GlobalStyles as GS, ColorPalette as CP } from './../../styles';
import { Util } from './../services/util';
import PropTypes from 'prop-types';

class ResponseInput extends React.Component {

    props: {
        onClose: Function;
        onSend: Function;
        suggestion: any;
        shouldClose: boolean;
        onTextChange?: Function;
    };

    state: {
        height: any;
        text: string;
        callbackOnPress: Function;
        keyboardType: string;
    };

    constructor(props: any) {
        super(props);
        this.state = {
            height: new Animated.Value(0),
            text: '',
            keyboardType: Util.isIOS() ? "twitter" : "email-address"
        };
        this.duration = 750;
		this.deviceWidth  = Dimensions.get('window').width; 
    }

    render() {
        return (
            <Animated.View style={[GS.flexRow4, GS.flexStretch, styles.responseCont, { height: this.state.height }]}>
                <View style={[GS.flexGrow1]}>
                    <TextInput
                        keyboardType={this.state.keyboardType}
                        multiline
                        onChangeText={text => { this.onChangeText(text); }}
                        placeholder={'Start typing'}
                        placeholderTextColor={'#9a9a9a'}
                        style={[styles.textInputMultiline, {width: (this.deviceWidth - 110)}]}
                        underlineColorAndroid={'transparent'}
                        value={this.state.text}
                    />
                </View>
                <View style={[GS.flexCol5, GS.flexGrow0, GS.marginL10]}>
                    <TouchableOpacity onPress={this.selfClose} style={{height: 20, width: 20, marginBottom: 25}}>
                        <Text
                        
                        style={[GS.text, GS.colorBrick]}
                        >X</Text>
                    </TouchableOpacity>
                    <Text
                        onPress={this.respond}
                        style={[GS.text, GS.colorDarkPurple]}
                    >Send</Text>
                </View>                
            </Animated.View>
        );
    }

    componentDidMount() {
        Animated.timing(this.state.height, {
            duration: this.duration,
            toValue: 110,
        }).start();
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.shouldClose && !this.props.shouldClose) {
            this.selfClose();
        }
    }

    onChangeText = text => {
        let xtext = text;
        if (this.props.onTextChange) {
            xtext = this.props.onTextChange(text);
        }
        this.setState({ text: text });
    };

    respond = () => {
        this.props.onSend(this.state.text);
    };

    selfClose = () => {
        this.setState({ text: '' });
        Animated.timing(this.state.height, {
            duration: this.duration,
            toValue: 0,
        }).start(() => {
            this.props.onClose();
        });
    };

    getText = () => {
        return this.state.text;
    };

    setText = (text) => {
        this.setState({
            text: text
        });
    }
}

ResponseInput.propTypes = {
    onClose: PropTypes.func.isRequired,
    onSend: PropTypes.func.isRequired,
    shouldClose: PropTypes.bool.isRequired,
};

const styles = StyleSheet.create({
    responseCont: {
        overflow: 'hidden',
        paddingBottom: 9,
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 9,
    },
    textInputMultiline: {
		flexWrap: 'wrap',
        alignSelf: 'stretch',
        borderColor: CP.moafLightGray,
        borderRadius: 6,
        borderWidth: 1,
        fontFamily: 'Raleway-Regular',
        fontSize: 16,
        fontWeight: '400',
        height: 90,
        paddingBottom: 5,
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 5,
        textAlignVertical: Util.isAndroid() ? 'top': 'auto',
    },
});

export { ResponseInput };
