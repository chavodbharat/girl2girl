import React from 'react';
import { StyleSheet, Text, TouchableHighlight, View, BackHandler } from 'react-native';
import { GlobalStyles as GS } from './../../styles';
import { Actions } from 'react-native-router-flux';
import { Util } from './../services/util';

class BackButton extends React.Component {

    props: {
        overrideOnPress?: Function;
    }

    constructor(props) {
        super(props);
    }

    componentDidMount = () => {
        if (this.props.overrideOnPress) {
            Util.setBack(this.props.overrideOnPress);
        } else {
            Util.allowBack();
        }
    }

    componentWillUnmount = () => {
        if (this.props.overrideOnPress) {
            Util.unsetBack(this.props.overrideOnPress);
        } else {
            Util.denyBack();
        }
    }

    render() {
        return (
            <TouchableHighlight
                activeOpacity={1.0}
                onPress={this.onPress}
                style={[styles.textCont]}
                underlayColor={'transparent'}
            >
                <View style={[GS.flexRow1]}>
                    <View>
                        <Text style={[GS.text, GS.colorWhite, { lineHeight: 18 }]}>&lt;</Text>
                    </View>
                    <Text style={[GS.text, GS.colorWhite]}> Back</Text>
                </View>
            </TouchableHighlight>
        );
    }

    onPress = () => {
        if (this.props.overrideOnPress) {
            this.props.overrideOnPress();
        } else {                        
            Actions.pop();
        }
    };
}

const styles = StyleSheet.create({
    textCont: {
        position: 'absolute',
        left: 15,
        top: (85 - 15) / 2,
    }
});

export { BackButton };
