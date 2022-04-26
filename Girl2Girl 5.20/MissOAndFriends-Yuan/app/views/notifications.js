import React from 'react';
import {
  Image,
  RefreshControl,
  Text,
  View,
  Alert,
  SafeAreaView,
  FlatList,
} from 'react-native';
import {GlobalStyles as GS, ColorPalette as CP} from './../../styles';
import {Actions} from 'react-native-router-flux';
import {Ajax} from './../services/ajax';
import {Storage} from './../services/storage';
import {Util} from './../services/util';
import {AdMrec} from '../components/ad-mrec';
import {AlertDialog} from '../components/alert-dialog';
import {CreateConvoButton} from '../components/create-convo-button';
import {Loading} from '../components/loading';
import {Notification} from './../components/notification';
import {FriendshipRequest as FriendshipRequestComponent} from './../components/friendshiprequests';
import type {Notification as Model} from './../decls/notification';
import type {SessionUser} from './../decls/session-user';
import type {FriendshipRequest} from './../decls/friendshiprequest';
import type {NotificationIds} from './../decls/notificationids';
const PSMInterstitialAdView = require('./../module/ad-interstitial')
  .PSMInterstitialAdView;
import PropTypes from 'prop-types';

class NotificationsView extends React.Component {
  props: {
    adCheckToken: number,
    decrementUnreadCount: Function,
    getNotifications: Function,
    notifications: Array<Model>,
    friendshipRequests: Array<FriendshipRequest>,
    sessionUser: SessionUser,
    all: Array<any>,
  };

  state: {
    ajaxMsg: string,
    async: boolean,
    isScrollingEnabled: boolean,
    notifications: Array<Model>,
    friendshipRequests: Array<FriendshipRequest>,
    all: Array<any>,
  };

  constructor(props: any) {
    super(props);
    const notis = [].concat(this.props.notifications);
    const freqs = [].concat(this.props.friendshipRequests);
    const all = []
      .concat(this.props.notifications)
      .concat(this.props.friendshipRequests)
      .sort((a, b) => {
        if (a.was_read && !b.was_read) {
          return 1;
        }
        if (b.was_read && !a.was_read) {
          return -1;
        }
        return new Date(b.date) - new Date(a.date);
      });
    Util.insertAd(notis);
    this.state = {
      ajaxMsg: '',
      async: false,
      isScrollingEnabled: true,
      notifications: notis,
      friendshipRequests: freqs,
      all: all,
    };

    this.alertDialog = null;
    this.refreshCalc = Util.newRefreshCalculator();
  }

  render() {
    return (
      <SafeAreaView style={[GS.statusBar]}>
        <View style={[GS.flex1, GS.flexCol1]}>
          <View style={[GS.header, GS.bgColorLightPurple]}>
            <Text style={[GS.headerText]}>My notifications</Text>
            <CreateConvoButton />
          </View>
          {this._renderView()}
          <Loading isOpen={this.state.async} />
          <AlertDialog
            ref={alertDialog => {
              this.alertDialog = alertDialog;
            }}
            text={this.state.ajaxMsg}
            type={'Error'}
          />
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
    //this._setNotifications(nextProps.notifications);
    //this._setFriendshipRequests(nextProps.friendshipRequests);
    this._setAll(nextProps.friendshipRequests, nextProps.notifications);
    this.setState({async: false});
  }

  _renderFRRow = notification => {
    let item = notification.item;
    let component = null;
    if (item) {
      if (item.request_id != undefined) {
        component = (
          <FriendshipRequestComponent
            key={item._id}
            notification={item}
            onDecline={this.onDecline}
            onDelete={this.onDelete}
            onAccept={this.onAccept}
            setScrolling={this._setScrollEnabled}
            wasRead={this.notificationRead}
          />
        );
      } else {
        component = (
          <Notification
            key={item._id}
            notification={item}
            onDelete={this.onDelete}
            setScrolling={this._setScrollEnabled}
            wasRead={this.notificationRead}
          />
        );
      }
    } else {
      component = (
        <AdMrec
          email={
            this.props.sessionUser
              ? this.props.sessionUser.email
              : 'example@example.com'
          }
        />
      );
    }
    return component;
  };

  _renderView = () => {
    if (this.props.sessionUser && this.props.sessionUser._id) {
      return (
        <View style={[GS.flexStretch, GS.flexGrow1, {paddingBottom: 80}]}>
          <FlatList
            data={this.state.all}
            enableEmptySections
            keyboardShouldPersistTaps={'handled'}
            refreshControl={
              <RefreshControl
                refreshing={this.state.async}
                onRefresh={this._dataWithCleanup}
                title={'Refreshing...'}
              />
            }
            renderItem={notification => this._renderFRRow(notification)}
            style={[GS.flexStretch]}
            keyExtractor={(notification, index) => index.toString()}
          />
        </View>
      );
    }
    return (
      <SafeAreaView style={[GS.statusBar]}>
        <View
          style={{
            flexDirection: 'row',
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <View style={{paddingHorizontal: 15}}>
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
  };

  _dataWithCleanup = () => {
    this._data(true);
  };

  _data = (cleanup = false) => {
    let ids = [];
    this.props.notifications
      .filter(n => !n.was_read)
      .forEach(item => ids.push(item._id));
    this.props.friendshipRequests
      .filter(n => !n.was_read)
      .forEach(item => ids.push(item._id));
    let model = {
      notification_ids: ids,
    };
    let handler = () => {
      this.props.getNotifications();
      this.refreshCalc.reset();
    };
    if (cleanup) {
      Ajax.readAllNotifications(model)
        .then(handler)
        .catch(handler);
    } else {
      handler();
    }
  };

  _setFriendshipRequests = friendshipRequests => {
    const notis = [].concat(friendshipRequests);
    Util.insertAd(notis);
    this.setState(
      {
        async: false,
        friendshipRequests: [],
      },
      () => {
        this.setState({
          friendshipRequests: notis,
        });
        this.forceUpdate();
      },
    );
  };

  _setNotifications = notifications => {
    const notis = [].concat(notifications);
    Util.insertAd(notis);
    this.setState(
      {
        async: false,
        notifications: [],
      },
      () => {
        this.setState({
          notifications: notis,
        });
        this.forceUpdate();
      },
    );
  };

  _setAll = (friendshipRequests, notifications) => {
    const notis = [].concat(notifications);
    const freqs = [].concat(friendshipRequests);
    const all = []
      .concat(notis)
      .concat(freqs)
      .sort((a, b) => {
        if (a.was_read && !b.was_read) {
          return 1;
        }
        if (b.was_read && !a.was_read) {
          return -1;
        }
        return new Date(b.date) - new Date(a.date);
      });
    Util.insertAd(all);
    this.setState(
      {
        async: false,
        notifications: [],
        friendshipRequests: [],
        all: [],
      },
      () => {
        this.setState({
          notifications: notis,
          friendshipRequests: freqs,
          all: all,
        });
        this.forceUpdate();
      },
    );
  };

  _setScrollEnabled = isEnabled => {
    this.setState({isScrollingEnabled: isEnabled});
  };

  login = () => {
    Actions.login();
  };

  onAccept = _id => {
    this.setState({async: true});
    Ajax.acceptFriendshipRequest(
      _id,
      () => {
        this.setState({async: false});
        this._data();
      },
      err => {
        this.setState({async: false});
        this.setState(
          {
            ajaxMsg: err.message,
          },
          () => {
            this.alertDialog.open();
          },
        );
      },
    );
  };

  onDecline = _id => {
    this.setState({async: true});
    Ajax.declineFriendshipRequest(
      _id,
      () => {
        this.setState({async: false});
        this._data();
      },
      err => {
        this.setState({async: false});
        this.setState(
          {
            ajaxMsg: err.message,
          },
          () => {
            this.alertDialog.open();
          },
        );
      },
    );
  };

  onDelete = _id => {
    this.setState({async: true});
    Ajax.deleteNotification(
      _id,
      () => {
        this.setState({async: false});
        this._data();
      },
      err => {
        this.setState({async: false});
        this.setState(
          {
            ajaxMsg: err.message,
          },
          () => {
            this.alertDialog.open();
          },
        );
      },
    );
  };

  notificationRead = (notification, cb) => {
    const clone = Object.assign({}, notification);
    clone.was_read = true;
    Ajax.putNotification(
      notification._id,
      clone,
      () => {
        cb(true);
        this.props.decrementUnreadCount();
      },
      () => {
        cb(false);
      },
    );
  };

  onScroll = obj => {
    if (!this.state.async) {
      const y = obj.nativeEvent.contentOffset.y;
      const shouldRefresh = this.refreshCalc.check(y);
      if (shouldRefresh) {
        this.setState({async: true}, () => {
          this._data();
        });
      }
    } else {
      this.refreshCalc.reset();
    }
  };

  register = () => {
    Actions.register();
  };
}

NotificationsView.propTypes = {
  adCheckToken: PropTypes.number.isRequired,
  decrementUnreadCount: PropTypes.func.isRequired,
  getNotifications: PropTypes.func.isRequired,
  getFriendshipRequests: PropTypes.func.isRequired,
  notifications: PropTypes.array.isRequired,
  sessionUser: PropTypes.object,
};

export {NotificationsView};
