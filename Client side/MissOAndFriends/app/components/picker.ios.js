import React from 'react';
import { Animated, Modal, PickerIOS, Text, View } from 'react-native';
import { GlobalStyles as GS } from './../../styles';
import { Util } from './../services/util';
import PropTypes from 'prop-types';

const Item = PickerIOS.Item;

const deviceWidth = Util.getScreenWidth();
const deviceHeight = Util.getScreenHeight();
const twoThirdsHeight = deviceHeight * 0.66;

class MoafPicker extends React.Component {

    props: {
        backgroundColor?: string;
        items: Array<any>;
        keyProp: string;
        labelProp: string;
        onChange: Function;
        onClose: Function;
        selectedKey: string;
    };

    state: {
        selection: number;
        yOffset: any;
    };

    constructor(props) {
        super(props);
        this.state = {
            selection: 0,
            yOffset: new Animated.Value(deviceHeight),
        };
        if (this.props.selectedKey) {
            this.state.selection = this.props.items.findIndex(i => (i[this.props.keyProp] === this.props.selectedKey));
        }
        this.duration = 750;
    }

    // BUG modals not showing up when remote-debugging enabled
    // SEE https://github.com/facebook/react-native/issues/12515
    render() {
        const props = this.props;

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
                    <PickerIOS
                        onValueChange={(val, idx) => { this.onSelectedChange(idx); }}
                        selectedValue={this.state.selection}
                        style={[GS.bgColorWhite, {height: twoThirdsHeight, width: deviceWidth }]}
                    >
                        {this.props.items.map((item, idx) => {
                            return (
                                <Item
                                    color={'#000000'}
                                    key={item[props.keyProp]}
                                    label={item[props.labelProp]}
                                    value={idx}
                                />
                            );
                        })}
                    </PickerIOS>
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
            this.props.onChange(this.props.items[this.state.selection]);
            this.props.onClose();
        });
    };

    onSelectedChange = (value: number) => {
        this.setState({ selection: value });
    };
}

MoafPicker.propTypes = {
    backgroundColor: PropTypes.string,
    items: PropTypes.array.isRequired,
    keyProp: PropTypes.string.isRequired,
    labelProp: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    selectedKey: PropTypes.string,
};

export { MoafPicker };
