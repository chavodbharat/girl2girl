import React from 'react';
import PropTypes from 'prop-types';
import { Text, View } from 'react-native';
import { GlobalStyles as GS, ColorPalette as CP } from './../../styles';
import PopupDialog from 'react-native-popup-dialog';
import Button from 'apsl-react-native-button';

class BiActionDialog extends React.Component {
	props: {
		onConfirm: Function;
		onDecline: Function;
		confirmText: string;
		declineText: string;
		title: string;
		text: string;
	};

	constructor(props) {
        super(props);
        this.popupDialog = null;
    };

    render() {
        return (
            <PopupDialog
                ref={popupDialog => {this.popupDialog = popupDialog;}}
                height={230}
                width={250}
            >
                <View style={[GS.flex1]}>
                    <View style={[GS.flexCol5, GS.paddingV10, GS.bgColorSkyBlue]}>
                        <Text style={[GS.btnText]}>{this.props.title}</Text>
                    </View>
                    <View style={[GS.flexCol5, GS.padding10]}>
                        <Text>{this.props.text}</Text>
                    </View>
                    <View style={[GS.flex1, GS.flexCol8, GS.paddingT10, GS.paddingH10]}>
                        <Button
                            accessibilityLabel={this.props.confirmText}
                            onPress={this.confirm}
                            style={[GS.marginT15, GS.btn, GS.bgColorSkyBlue]}
                            textStyle={[GS.textBiAction]}
                        >{this.props.confirmText}</Button>
                        <Button
                            accessibilityLabel={this.props.declineText}
                            onPress={this.decline}
                            style={[GS.marginT15, GS.btn, GS.bgColorRed]}
                            textStyle={[GS.textBiAction]}
                        >{this.props.declineText}</Button>
                    </View>
                </View>
            </PopupDialog>
        );
    };

    confirm = () => {
        this.popupDialog.dismiss(() => {            
            this.props.onConfirm();
        });
    };

    decline = () => {
        this.popupDialog.dismiss(() => {            
            this.props.onDecline();
        });
    };

    open = () => {
    	this.popupDialog.show();
    }

}

BiActionDialog.propTypes = {
    onConfirm: PropTypes.func.isRequired,
	onDecline: PropTypes.func.isRequired,
	confirmText: PropTypes.string.isRequired,
	declineText: PropTypes.string.isRequired,
	title: PropTypes.string.isRequired,
	text: PropTypes.string.isRequired,
};

export { BiActionDialog };