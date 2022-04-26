import React from 'react';
import Button from 'apsl-react-native-button';
import {Util} from './../services/util';
import {Ajax} from './../services/ajax';
import {GlobalStyles as GS, ColorPalette as CP} from './../../styles';
import {
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  Dimensions,
  DeviceEventEmitter,
  TouchableOpacity,
  Keyboard,
  FlatList,
} from 'react-native';
import ListView from 'deprecated-react-native-listview';
class Suggestion extends React.Component {
  props: {
    onSelect?: Function,
    convoId?: string,
    hack: boolean,
  };

  state: {
    height: number,
    width: number,
    friends: Array<any>,
    filtered: Array<any>,
    isAndroid: boolean,
    initialHeight: number,
  };

  constructor(props) {
    super(props);
    let isa = (this.state = {
      friends: [],
      filtered: [],
      height: 0,
      width: Dimensions.get('window').width,
      isAndroid: Util.isAndroid(),
      initialHeight: 0,
    });
  }

  UNSAFE_componentWillMount() {
    if (Util.isAndroid() && !this.props.hack) {
      this.keyboardDidShowListener = Keyboard.addListener(
        'keyboardDidShow',
        this._keyboardDidShow,
      );
      this.keyboardDidHideListener = Keyboard.addListener(
        'keyboardDidHide',
        this._keyboardDidHide,
      );
    }
  }

  componentWillUnmount() {
    if (Util.isAndroid() && !this.props.hack) {
      this.keyboardDidShowListener.remove();
      this.keyboardDidHideListener.remove();
    }
  }

  _keyboardDidHide = () => {
    this.setState({
      initialHeight: 0,
    });
  };

  _keyboardDidShow = e => {
    this.setState({
      initialHeight: e.endCoordinates.height,
    });
  };

  componentDidMount = () => {
    Ajax.getFriends(this.props.convoId)
      .then(res => {
        if (res.friends.length == 0) {
          this.close();
        } else {
          this.setState({
            friends: res.friends,
            filtered: res.friends,
          });
        }
      })
      .catch(() => {});
  };

  render() {
    return Util.isAndroid() ? (
      <View
        behavior={'position'}
        style={[
          {
            position: 'absolute',
            left: 0,
            bottom: this.state.initialHeight,
            height: this.state.height,
            alignSelf: 'stretch',
            backgroundColor: '#ffffff',
            opacity: 0.9,
          },
        ]}>
        {(this.state.filtered || []).length > 0 && (
          <FlatList
            enableEmptySections
            keyboardShouldPersistTaps={'always'}
            style={{
              alignSelf: 'stretch',
              left: 0,
              width: this.state.width,
              height: this.state.height,
              backgroundColor: '#fff',
              paddingTop: 5,
            }}
            data={this.state.filtered}
            renderItem={row => {
              let user = row.item;
              return (
                <View style={[styles.textrow, {width: this.state.width}]}>
                  <TouchableOpacity
                    onPress={() => {
                      this.props.onSelect(user.username);
                    }}>
                    <Text style={[styles.androidLetter]}>
                      {user.username.toUpperCase().substr(0, 1)}
                    </Text>
                    <Text
                      style={[
                        styles.textline,
                        {width: this.state.width - 70, lineHeight: 24},
                      ]}>
                      <Text>{user.preHighlighted}</Text>
                      <Text style={{fontWeight: '900'}}>
                        {user.highlighted}
                      </Text>
                      <Text>{user.postHighlighted}</Text>
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            }}
          />
        )}
      </View>
    ) : (
      <KeyboardAvoidingView
        behavior={'position'}
        style={[styles.avoidingKeyboard, {height: this.state.height}]}>
        {(this.state.filtered || []).length > 0 && (
          <FlatList
            enableEmptySections
            keyboardShouldPersistTaps={'always'}
            style={{
              alignSelf: 'stretch',
              left: 0,
              width: this.state.width,
              height: this.state.height,
              backgroundColor: '#fff',
              paddingTop: 5,
            }}
            data={this.state.filtered}
            renderItem={row => {
              let user = row.item;
              console.log('row data:', user);
              return (
                <View style={[styles.textrow, {width: this.state.width}]}>
                  <TouchableOpacity
                    onPress={() => {
                      this.props.onSelect(user.username);
                    }}>
                    <Text style={[styles.letter]}>
                      {user.username.toUpperCase().substr(0, 1)}
                    </Text>
                    <Text
                      style={[
                        styles.textline,
                        {width: this.state.width - 70, lineHeight: 30},
                      ]}>
                      <Text>{user.preHighlighted}</Text>
                      <Text style={{fontWeight: '900'}}>
                        {user.highlighted}
                      </Text>
                      <Text>{user.postHighlighted}</Text>
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            }}
          />
        )}
      </KeyboardAvoidingView>
    );
  }

  open = (text = '') => {
    if (text && text != '') {
      let cleaned = this.state.friends
        .filter(item => {
          return (
            item && item.username.toLowerCase().indexOf(text.toLowerCase()) > -1
          );
        })
        .map(item => {
          let index = item.username.toLowerCase().indexOf(text.toLowerCase());
          item.preHighlighted = item.username.substr(0, index);
          item.highlighted = item.username.substr(index, text.length);
          item.postHighlighted = item.username.substr(index + text.length);
          return item;
        });

      this.setState({
        filtered: cleaned,
      });

      this.setState({
        height: cleaned.length > 0 ? 100 : 0,
      });
    } else {
      let cleaned = this.state.friends.map(item => {
        item.preHighlighted = '';
        item.highlighted = '';
        item.postHighlighted = item.username;
        return item;
      });
      this.setState({
        height: 100,
        filtered: cleaned,
      });
    }
  };

  close = () => {
    this.setState({
      height: 0,
    });
  };
}

const styles = StyleSheet.create({
  avoidingKeyboard: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    alignSelf: 'stretch',
    backgroundColor: '#ffffff',
    opacity: 0.9,
  },
  textrow: {
    flexDirection: 'row',
    borderBottomColor: CP.moafBlack,
    backgroundColor: '#ffffff',
    alignSelf: 'stretch',
    left: 0,
    height: 40,
  },
  textline: {
    alignItems: 'flex-end',
    left: 50,
    height: 30,
  },
  androidLetter: {
    position: 'absolute',
    alignItems: 'flex-start',
    height: 30,
    width: 30,
    borderColor: CP.moafWhite,
    borderRadius: 15,
    backgroundColor: CP.moafSoftPink,
    color: '#ffffff',
    overflow: 'hidden',
    paddingLeft: 10,
    left: 5,
    fontWeight: '700',
    lineHeight: 24,
  },
  letter: {
    position: 'absolute',
    alignItems: 'flex-start',
    height: 30,
    width: 30,
    borderColor: CP.moafWhite,
    borderRadius: 15,
    backgroundColor: CP.moafSoftPink,
    color: '#ffffff',
    overflow: 'hidden',
    paddingLeft: 10,
    left: 5,
    fontWeight: '700',
    lineHeight: 30,
  },
});

export {Suggestion};
