import React from 'react';
import PropTypes from 'prop-types';
import { Text, View } from 'react-native';
import { GlobalStyles as GS, ColorPalette as CP } from './../../styles';
import PopupDialog from 'react-native-popup-dialog';
import Button from 'apsl-react-native-button';

class AlertDialog extends React.Component {

    props: {
        onClose?: Function;
        text: string;
        title?: string;
        type: string;
        force?: boolean;
    };

    state: {
        bannerClass: any;
        buttonBorderColor: any;
        buttonClass: any;
        title: string;
        defaultText: string;
    };

    constructor(props) {
        super(props);
        this.state = {
            bannerClass: null,
            buttonBorderColor: null,
            buttonClass: null,
            title: '',
            defaultText: 'Something went wrong 🙀'
        };
        this.popupDialog = null;
    }

    render() {
        return (
            <PopupDialog
                ref={popupDialog => {this.popupDialog = popupDialog;}}
                height={200}
                width={250}
            >
                <View style={[GS.flex1]}>
                    <View style={[this.state.bannerClass, GS.flexCol5, GS.paddingV10]}>
                        <Text style={[GS.btnText]}>{this.state.title}</Text>
                    </View>
                    <View style={[GS.flexCol5, GS.padding10]}>
                        <Text>{ (this.props.force || this.props.type !== 'Error') ? this.props.text : this.state.defaultText}</Text>
                    </View>
                    <View style={[GS.flex1, GS.flexCol8, GS.paddingT10, GS.paddingH10]}>
                        <Button
                            accessibilityLabel={'OK'}
                            onPress={this.closed}
                            style={[GS.marginT15, GS.btn, { borderColor: this.state.buttonBorderColor }]}
                            textStyle={[GS.text, this.state.buttonClass]}
                        >OK</Button>
                    </View>
                </View>
            </PopupDialog>
        );
    }

    closed = () => {
        this.popupDialog.dismiss(() => {
            if (this.props.onClose) {
                this.props.onClose();
            }
        });
    };

    open = () => {
        switch (this.props.type) {
            case 'Info':
                this.setState({
                    bannerClass: GS.bgColorSkyBlue,
                    buttonBorderColor: CP.moafSkyBlue,
                    buttonClass: GS.colorSkyBlue,
                    title: this.props.title || 'Thanks!',
                });
                break;
            case 'Bubblegum':
                this.setState({
                    bannerClass: GS.bgColorSoftPink,
                    buttonBorderColor: CP.colorLightPurple,
                    buttonClass: GS.colorRed,
                    title: this.props.title || 'Oops!',
                });
                break;
            case 'Error':
            default:
                this.setState({
                    bannerClass: GS.bgColorSoftPink,
                    buttonBorderColor: CP.colorLightPurple,
                    buttonClass: GS.colorRed,
                    title: this.props.title || 'Oops!',
                });
                break;
        }
        this.popupDialog.show();
    };
}

AlertDialog.propTypes = {
    onClose: PropTypes.func,
    text: PropTypes.string.isRequired,
    title: PropTypes.string,
    type: PropTypes.string.isRequired,
};

export { AlertDialog };
