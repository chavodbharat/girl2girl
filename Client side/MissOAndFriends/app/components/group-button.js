import React from 'react';
import Button from 'apsl-react-native-button';
import { StyleSheet, Text } from 'react-native';
import { ColorPalette as CP } from './../../styles';
import { Actions } from 'react-native-router-flux';
import { Util } from './../services/util';
import PropTypes from 'prop-types';

class GroupButton extends React.Component {

    props: {
        accessibility: string;
        classes: Array<any>;
        index: number;
        isGuest: boolean;
        onPress: Function;
        text: string;
    };

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Button
                accessibilityLabel={this.props.accessibility}
                onPress={this.onPress}
                style={[styles.btn].concat(this.props.classes)}>
                <Text style={[styles.btnText]}>{this.props.text}</Text>
            </Button>
        );
    }

    onPress = () => {
        if (this.props.isGuest) {
            Actions.guest({ adCheckToken: Util.randomNumber() });
        } else {
            this.props.onPress(this.props.index);
        }
    };
}

const styles = StyleSheet.create({
    btn: {
        alignItems: 'center',
        borderColor: CP.moafWhite,
        borderRadius: 20,
        borderWidth: 2,
        height: 42,
        justifyContent: 'center',
        margin: 5,
        overflow: 'hidden',
        paddingLeft: 15,
        paddingRight: 15,
    },
    btnText: {
        color: CP.moafWhite,
        fontFamily: 'raleway',
        fontSize: 16,
        fontWeight: '500',
    }
});

GroupButton.propTypes = {
    accessibility: PropTypes.string.isRequired,
    classes: PropTypes.array.isRequired,
    index: PropTypes.number.isRequired,
    isGuest: PropTypes.bool.isRequired,
    onPress: PropTypes.func.isRequired,
    text: PropTypes.string.isRequired,
};

export { GroupButton };
