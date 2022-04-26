import React from 'react';
import {Actions} from 'react-native-router-flux';
import {Text, View, SafeAreaView} from 'react-native';
import {GlobalStyles as GS} from './../../styles';
import {Util} from './../services/util';
import PropTypes from 'prop-types';
const PSMInterstitialAdView = require('./../module/ad-interstitial')
  .PSMInterstitialAdView;

class GuestView extends React.Component {
  props: {
    adCheckToken: number,
  };

  constructor(props: any) {
    super(props);
  }

  render() {
    return (
      <SafeAreaView style={[GS.statusBar]}>
            <View style={{flexDirection : 'row', flex : 1, justifyContent : 'center', alignItems : 'center'}}>
                <View
                style={
                    {paddingHorizontal : 15}
                }>
                <Text style={[GS.guestText, GS.textCenter]}>
                    You are viewing the app as a guest. Please{' '}
                    <Text style={[GS.colorDarkPurple]} onPress={this.login}>
                    Login{' '}
                    </Text>
                    or{' '}
                    <Text style={[GS.colorDarkPurple]} onPress={this.register}>
                    Register
                    </Text>
                </Text>
                </View>
            </View>
      </SafeAreaView>  
    );
  }

  componentDidMount() {
    Util.shouldShowInterstitial(shouldDisplay => {
      if (shouldDisplay) {
        PSMInterstitialAdView.show();
      }
    });
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.adCheckToken !== this.props.adCheckToken) {
      Util.shouldShowInterstitial(shouldDisplay => {
        if (shouldDisplay) {
          PSMInterstitialAdView.show();
        }
      });
    }
  }

  login() {
    Actions.login();
  }

  register() {
    Actions.register();
  }
}

GuestView.propTypes = {
  adCheckToken: PropTypes.number.isRequired,
};

export {GuestView};
