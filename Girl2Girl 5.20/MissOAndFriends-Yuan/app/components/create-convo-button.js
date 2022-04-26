import React from 'react';
import {Image, StyleSheet, TouchableHighlight} from 'react-native';
import {Actions} from 'react-native-router-flux';
import {Storage} from './../services/storage';
import {Util} from './../services/util';

class CreateConvoButton extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <TouchableHighlight
        activeOpacity={1.0}
        onPress={this.onPress}
        style={[styles.createConvoCont]}
        underlayColor={'transparent'}>
        <Image
          source={require('./../img/nav_icon_convo.png')}
          style={[styles.createConvoButton]}
        />
      </TouchableHighlight>
    );
  }

  onPress = () => {
    Storage.getSessionUser().then(user => {
      if (user) {
        Actions.createConvo({adCheckToken: Util.randomNumber()});
      } else {
        Actions.guest({adCheckToken: Util.randomNumber()});
      }
    });
  };
}

const styles = StyleSheet.create({
  createConvoButton: {
    height: 30,
    resizeMode: 'contain',
    width: 30,
  },
  createConvoCont: {
    position: 'absolute',
    right: 15,
    top: (80 - 15) / 2,
  },
});

export {CreateConvoButton};
