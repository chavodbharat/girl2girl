import React from 'react';
import { Picker, StyleSheet, View } from 'react-native';
import { ColorPalette as CP } from './../../styles';
import PropTypes from 'prop-types';

const Item = Picker.Item;

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
    };

    constructor(props) {
        super(props);
        this.state = {
            selection: 0,
        };
        if (this.props.selectedKey) {
            this.state.selection = this.props.items.findIndex(i => i[this.props.keyProp] === this.props.selectedKey);
        }
    }

    render() {
        const props = this.props;
        const bgColor = this.props.backgroundColor ? this.props.backgroundColor : CP.moafWhite;
        return (
            <View style={[styles.pickerCont]} removeClippedSubviews>
                <Picker
                    onValueChange={this.onSelectedChange}
                    selectedValue={this.state.selection}
                    style={[styles.picker, { backgroundColor: bgColor }]}
                >
                    {
                        this.props.items.map((item, idx) => {
                            return (
                                <Item
                                    key={item[props.keyProp]}
                                    label={item[props.labelProp]}
                                    value={idx}
                                />
                            );
                        })
                    }
                </Picker>
            </View>
        );
    }

    componentWillReceiveProps(nextProps) {
        this.setState({ selection: nextProps.items.findIndex(i => (i[nextProps.keyProp] === nextProps.selectedKey)) });
        this.forceUpdate();
    }

    close = () => {
        this.props.onChange(this.props.items[this.state.selection]);
        this.props.onClose();
    };

    onSelectedChange = (_: any, idx: number) => {
        this.setState({ selection: idx }, () => {
            this.close();
        });
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

const styles = StyleSheet.create({
    picker: {
        alignSelf: 'stretch',
        backgroundColor: CP.moafWhite,
        height: 45,
        overflow: 'hidden',
        paddingLeft: 10,
        paddingRight: 10,
    },
    pickerCont: {
        alignSelf: 'stretch',
        borderColor: CP.moafLightGray,
        borderRadius: 3,
        borderWidth: 1,
        marginTop: 10,
        overflow: 'hidden',
    }
});

export { MoafPicker };
