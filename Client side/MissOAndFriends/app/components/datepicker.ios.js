import React from 'react';
import PropTypes from 'prop-types';
import { Animated, DatePickerIOS, Modal, Text, View } from 'react-native';
import { GlobalStyles as GS } from './../../styles';
import { Util } from './../services/util';

const deviceWidth = Util.getScreenWidth();
const deviceHeight = Util.getScreenHeight();
const twoThirdsHeight = deviceHeight * 0.66;

class MoafDatePicker extends React.Component {

    props: {
        onChange: Function;
        onClose: Function;
        selectedDate: Date;
    };

    state: {
        selection: Date;
        yOffset: any;
    };

    constructor(props) {
        super(props);
        const now = new Date();
        now.setFullYear(now.getFullYear() - 8);
        this.state = {
            selection: this.props.selectedDate || now,
            yOffset: new Animated.Value(deviceHeight),
        };
        this.maxDate = new Date();
        this.duration = 750;
    }

    // BUG modals not showing up when remote-debugging enabled
    // SEE https://github.com/facebook/react-native/issues/12515
    render() {
        return (
            <Modal
                animationType={'none'}
                transparent
                visible
            >
                <Animated.View style={[{ transform: [{translateY: this.state.yOffset}], width: deviceWidth }]}>
                    <View style={[GS.bgColorWhite, GS.flexRow6, GS.paddingV10, GS.paddingR10]}>
                        <Text
                            onPress={this.close}
                            style={[GS.text, GS.colorDarkPurple]}
                        >Select</Text>
                    </View>
                    <View style={[GS.bgColorWhite, {height: twoThirdsHeight}]}>
                        <DatePickerIOS
                            date={this.state.selection}
                            maximumDate={this.maxDate}
                            mode={'date'}
                            onDateChange={this.onDateChange}
                        />
                    </View>
                </Animated.View>
            </Modal>
        );
    }

    componentDidMount() {
        Animated.timing(this.state.yOffset, {
            duration: this.duration,
            toValue: twoThirdsHeight,
        }).start();
    }

    close = () => {
        Animated.timing(this.state.yOffset, {
            duration: this.duration,
            toValue: deviceHeight,
        }).start(() => {
            this.props.onChange(this.state.selection);
            this.props.onClose();
        });
    };

    onDateChange = (value: Date) => {
        this.setState({ selection: value });
    };
}

MoafDatePicker.propTypes = {
    onChange: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    selectedDate: PropTypes.instanceOf(Date),
};

export { MoafDatePicker };
