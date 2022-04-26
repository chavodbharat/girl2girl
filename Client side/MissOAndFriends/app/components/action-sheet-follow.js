import React from 'react'; 
import { Text, View } from 'react-native';
import { GlobalStyles as GS, ColorPalette as CP } from './../../styles';
import ActionSheet from 'react-native-actionsheet';
import PropTypes from 'prop-types';

class ActionSheetFollow extends React.Component {

    props: {
        onPress: Function;
        titlePhrase: string;
        willFollow: boolean;
    };

    state: {
        items: Array<String>;
        title: string;
    };

    constructor(props) {
        super(props);

        this.unfollowArray = ['Unfollow', 'Cancel'];
        this.followArray   = ['Follow', 'Cancel'];
        
        this.actionSheet = null;
        this.CANCEL_IDX = 1;
        this.state = {
            items: this.props.willFollow ? this.followArray : this.unfollowArray,
            title: '',
        };
    }

    render() {
        return (
            <ActionSheet
                ref={actionSheet => { this.actionSheet = actionSheet; }}
                cancelButtonIndex={this.CANCEL_IDX}
                onPress={this.onPress}
                options={this.state.items}
                title={this.state.title}
            />
        );
    }

    onPress = idx => {
        if (idx !== this.CANCEL_IDX) {
            this.props.onPress();
        }
    };

    open = () => {
        let text;
        if (this.props.titlePhrase === 'this convo') {
            this.unfollowArray = ['Unfollow', 'Cancel'];
            this.followArray   = ['Follow', 'Cancel'];
        } else {
            this.unfollowArray = ['Cancel Friendship', 'Cancel'];
            this.followArray   = ['Friend', 'Cancel'];
        }
        if (this.props.titlePhrase === 'this convo') {
            text = this.props.willFollow ? `Would you like to follow ${this.props.titlePhrase}?`:
                                           `Would you like to unfollow ${this.props.titlePhrase}?`;
        } else {
            text = this.props.willFollow ? `Would you like to make ${this.props.titlePhrase} your friend?`:
                                           `Would you like to cancel friendship with ${this.props.titlePhrase}?`;
        }
        this.setState({
            items: this.props.willFollow ? this.followArray : this.unfollowArray,
            title: text
        }, () => {
            this.actionSheet.show();
        });
    };
}

ActionSheetFollow.propTypes = {
    onPress:     PropTypes.func.isRequired,
    titlePhrase: PropTypes.string.isRequired,
    willFollow:  PropTypes.bool.isRequired,
};

export { ActionSheetFollow };
