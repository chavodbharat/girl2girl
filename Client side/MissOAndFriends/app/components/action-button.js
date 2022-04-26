import React from 'react';
import Button from 'apsl-react-native-button';
import { GlobalStyles as GS } from './../../styles';

class ActionButton extends React.Component {

    props: {
        accessibility: string;
        classes: Array<any>;
        isDisabled?: boolean;
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
                disabledStyle={GS.bgColorLightGray}
                isDisabled={this.props.isDisabled || false}
                onPress={this.props.onPress}
                style={[GS.btn].concat(this.props.classes)}
                textStyle={[GS.btnText]}
            >
                {this.props.text}
            </Button>
        );
    }

}

export { ActionButton };
