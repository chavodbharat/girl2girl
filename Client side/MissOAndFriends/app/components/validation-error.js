import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { ColorPalette as CP } from './../../styles';

class ValidationError extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        const classes = [styles.error].concat(this.props.show ? [styles.show] : [styles.hide]);
        return (
            <Text style={classes}>{this.props.text}</Text>
        );
    }
}

const styles = StyleSheet.create({
    error: {
        alignSelf: 'stretch',
        color: CP.moafBrick,
        fontFamily: 'raleway',
        fontSize: 16,
        fontWeight: '500',
        height: 20,
        lineHeight: 20,
        paddingLeft: 10,
        paddingRight: 10,
    },
    hide: {
        opacity: 0,
    },
    show: {
        opacity: 1,
    }
});

export { ValidationError };


