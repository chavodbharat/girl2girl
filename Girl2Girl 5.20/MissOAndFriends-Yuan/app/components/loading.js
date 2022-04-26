import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { GlobalStyles as GS, ColorPalette as CP } from './../../styles';
import { Util } from './../services/util';
import PropTypes from 'prop-types';

class Loading extends React.Component {

    props: {
        isOpen: boolean;
    };

    constructor(props) {
        super(props);
    }

    UNSAFE_componentWillMount() {
        styles.cont.height = Util.getScreenHeight();
        styles.cont.width = Util.getScreenWidth();
    }

    render() {
        return this._render();
    }

    _render() {
        if (this.props.isOpen) {
            return (
                <View
                    style={[styles.cont, GS.flexRow5]}
                >
                    <ActivityIndicator
                        animating={this.props.isOpen}
                        color={'black'}
                        size={'large'}
                    />
                </View>
            );
        }
        return null;
    }

}

const styles = StyleSheet.create({
    cont: {
        backgroundColor: CP.moafLightGray,
        height: Util.getScreenHeight(),
        left: 0,
        position: 'absolute',
        opacity: 0.66,
        top: 0,
        width: Util.getScreenWidth(),
    }
});

Loading.propTypes = {
    isOpen: PropTypes.bool.isRequired,
};

export { Loading };
