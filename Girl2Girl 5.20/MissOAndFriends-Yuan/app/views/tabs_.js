import React from 'react';
import {Image, StyleSheet, Text, View, Linking, Alert} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import {GlobalStyles as GS, ColorPalette as CP} from '../../styles';
import {TabView, TabBar, TabViewPagerAndroid} from 'react-native-tab-view';
import {Ajax} from '../services/ajax';
import {Storage} from '../services/storage';
import {Util} from '../services/util';
import {FeedView} from './feed';
import {GroupsView} from './groups';
import {MoreView} from './more';
import {NotificationsView} from './notifications';
import type {Notification} from '../decls/notification';
import type {FriendshipRequest} from '../decls/friendshiprequest';
import {Actions} from 'react-native-router-flux';
import PropTypes from 'prop-types';
import firebase from 'react-native-firebase';
import {Platform} from 'react-native';

const views = {
  feed: 0,
  groups: 1,
  notifications: 2,
  more: 3,
};

class TabsView extends React.Component {
  props: {
    tab: string,
  };

  state: {
    feedAdToken: number,
    groupsAdToken: number,
    notificationsAdToken: number,
    moreAdToken: number,
    notifications: Array<Notification>,
    numUnread: number,
    friendshipRequests: Array<FriendshipRequest>,
    router: any,
  };

  constructor(props: any) {
    super(props);
    this.prevTime = new Date();
    this.state = {
      feedAdToken: Util.randomNumber(),
      groupsAdToken: Util.randomNumber(),
      notificationsAdToken: Util.randomNumber(),
      moreAdToken: Util.randomNumber(),
      notifications: [],
      friendshipRequests: [],
      numUnread: 0,
      router: {
        index: views[this.props.tab],
        routes: [
          {
            icon: () => {
              return (
                <Image
                  source={require('./../img/tab_icon_feed.png')}
                  style={[{height: 30, width: 30}, styles.tabIcon]}
                />
              );
            },
            key: '1',
            selectedIcon: () => {
              return (
                <Image
                  source={require('./../img/tab_icon_feed_active.png')}
                  style={[{height: 30, width: 30}, styles.tabIcon]}
                />
              );
            },
            title: 'Feed',
          },
          {
            icon: () => {
              return (
                <Image
                  source={require('./../img/tab_icon_groups.png')}
                  style={[{height: 30, width: 30}, styles.tabIcon]}
                />
              );
            },
            key: '2',
            selectedIcon: () => {
              return (
                <Image
                  source={require('./../img/tab_icon_groups_active.png')}
                  style={[{height: 30, width: 30}, styles.tabIcon]}
                />
              );
            },
            title: 'Groups',
          },
          {
            icon: () => {
              return (
                <Image
                  source={require('./../img/tab_icon_notifications.png')}
                  style={[{height: 30, width: 30}, styles.tabIcon]}
                />
              );
            },
            key: '3',
            selectedIcon: () => {
              return (
                <Image
                  source={require('./../img/tab_icon_notifications_active.png')}
                  style={[{height: 30, width: 30}, styles.tabIcon]}
                />
              );
            },
            title: 'Notifications',
          },
          {
            icon: () => {
              return (
                <Image
                  source={require('./../img/tab_icon_more_active.png')}
                  style={[{height: 30, width: 30}, styles.tabIcon]}
                />
              );
            },
            key: '4',
            selectedIcon: () => {
              return (
                <Image
                  source={require('./../img/tab_icon_more.png')}
                  style={[{height: 30, width: 30}, styles.tabIcon]}
                />
              );
            },
            title: 'More',
          },
        ],
      },
    };

    this.sessionUser = null;
    this.intervalObject = null;

    this.sessionUserListener = user => {
      this.sessionUser = user;
      if (this.sessionUser) {
        this._data();
        this.intervalObject = setInterval(() => {
          this._data();
        }, 60 * 1000);
      } else {
        clearInterval(this.intervalObject);
        this.setState({
          notifications: [],
          friendshipRequests: [],
          numUnread: 0,
        });
      }
      this.forceUpdate();
    };
    Storage.addSessionUserListener(this.sessionUserListener);
  }

  render() {
    return (
      <TabView
        navigationState={this.state.router}
        onIndexChange={this.onChangeTab}
        tabBarPosition={'bottom'}
        renderTabBar={this._renderTabs}
        renderScene={this._renderScene}
        swipeEnabled={false}
        style={[GS.flex1]}
      />
    );
  }

  async checkPermission() {
    const enabled = await firebase.messaging().hasPermission();
    if (enabled) {
      this.getToken();
    } else {
      this.requestPermission();
    }
  }

  //3
  async getToken() {
    let fcmToken = await AsyncStorage.getItem('fcmToken');
    const user = await Storage.getSessionUser();
    if (!fcmToken) {
      fcmToken = await firebase.messaging().getToken();
      if (fcmToken) {
        // user has a device token
        await AsyncStorage.setItem('fcmToken', fcmToken);
        await Ajax.registerToken({
          token: fcmToken,
          os: Platform.OS === 'ios' ? 'iOS' : 'Android',
          email: user ? user.email : null,
          id: user ? user._id : null,
          // id: user ? user._id : null,
        });
      }
    } else {
      await Ajax.registerToken({
        token: fcmToken,
        os: Platform.OS === 'ios' ? 'iOS' : 'Android',
        email: user ? user.email : null,
        id: user ? user._id : null,
      });
    }
  }

  //2
  async requestPermission() {
    try {
      await firebase.messaging().requestPermission();
      // User has authorised
      this.getToken();
    } catch (error) {
      // User has rejected permissions
      console.log('permission rejected');
    }
  }

  async componentDidMount() {
    Util.denyBack();
    let self = this;
    Linking.getInitialURL()
      .then(url => {
        if (url) {
          const path = url.substr(8);
          switch (path) {
            case 'groups':
              self.onChangeTab(1);
              break;
            case 'notifications':
              self.onChangeTab(2);
              break;
            case 'more':
              self.onChangeTab(4);
              break;
            default:
              break;
          }
          this.forceUpdate();
        }
      })
      .catch(err => {});
    this._data();
    this.checkPermission();
    this.createNotificationListeners(); //add this line
    firebase
      .notifications()
      .getInitialNotification()
      .then(notificationOpen => {
        if (notificationOpen) {
          /*
				{
					"topicstarter": 653605,
					"reply_to": 652821,
					"author": null,
					"event": "new_reply",
					"topic_id": ""
				}
				*/
          const {title, body, data} = notificationOpen.notification;
          if (data && data.event && data.event === 'new_reply') {
            Actions.convo({
              adCheckToken: Util.randomNumber(),
              convoId: data.topic_id,
            });
          }
          if (data && data.event && data.event === 'new_post') {
            Actions.convo({
              adCheckToken: Util.randomNumber(),
              convoId: data.topic_id,
            });
          }
          if (
            data &&
            data.event &&
            (data.event === 'new_friend' ||
              data.event === 'new_friendship_request')
          ) {
            Actions.activity({
              adCheckToken: Util.randomNumber(),
              userId: data.user_id,
            });
          }
        }
      });
  }

  async createNotificationListeners() {
    /*
     * Triggered when a particular notification has been received in foreground
     **/
    /*
		this.notificationListener = firebase.notifications().onNotification((notification) => {
			const { title, body, data } = notification;
			this.showAlert("2" + title, body + JSON.stringify(data));
		});
		*/
  }

  /*
	showAlert(title, body) {
		Alert.alert(
			title, body,
			[
				{ text: 'OK', onPress: () => console.log('OK Pressed') },
			],
			{ cancelable: false },
		);
	}
	*/

  componentWillUnmount() {
    Storage.removeSessionUserListener(this.sessionUserListener);
    clearInterval(this.intervalObject);
    //this.notificationListener();
    //this.notificationOpenedListener();
    //this.notificationDisplayedListener();
  }

  _data = () => {
    if (this.sessionUser) {
      Promise.all([Ajax.getNotifications(), Ajax.getFriendshipRequests()])
        .then(arr => {
          const notifications = arr[0].notifications;
          const friendshipRequests = arr[1].notifications;

          this.setState({
            notifications: notifications,
            friendshipRequests: friendshipRequests,
            numUnread:
              notifications.filter(n => !n.was_read).length +
              friendshipRequests.filter(n => !n.was_read).length,
          });
        })
        .catch(err => {});
    } else {
      this.setState({
        notifications: [],
        friendshipRequests: [],
        numUnread: 0,
      });
    }
  };

  _renderBadge = scene => {
    if (scene.route.key === '3' && this.state.numUnread > 0) {
      return (
        <View style={styles.badge}>
          <Text style={styles.count}>{this.state.numUnread}</Text>
        </View>
      );
    }
    return null;
  };

  _renderIcon = scene => {
    return scene.focused ? scene.route.selectedIcon() : scene.route.icon();
  };


  _renderLabel = scene => {
    const css = [styles.tabText];
    if (scene.focused) {
      css.push(GS.colorDarkPurple);
    }
    return <Text style={css}>{scene.route.title}</Text>;
  };

  _renderPager = props => {
    return (
      <TabViewPagerAndroid
        {...props}
        animationEnabled={true}
        swipeEnabled={false}
      />
    );
  };

  _renderTabs = props => {
    return (
      <TabBar
        {...props}
        renderBadge={this._renderBadge}
        renderIcon={this._renderIcon}
        renderLabel={this._renderLabel}
        style={[styles.tabBar]}
        activeColor={'#d08aff'}
      />
    );
  };

  _renderScene = scene => {
    const key = scene.route.key;
    switch (key) {
      case '1':
        return (
          <FeedView
            adCheckToken={this.state.feedAdToken}
            sessionUser={this.sessionUser}
          />
        );
        break;
      case '2':
        return (
          <GroupsView
            adCheckToken={this.state.groupsAdToken}
            sessionUser={this.sessionUser}
          />
        );
        break;
      case '3':
        return (
          <NotificationsView
            adCheckToken={this.state.notificationsAdToken}
            decrementUnreadCount={this.decrementUnread}
            getNotifications={this.getNotifications}
            getFriendshipRequests={this.getFriendshipRequests}
            notifications={this.state.notifications}
            friendshipRequests={this.state.friendshipRequests}
            sessionUser={this.sessionUser}
          />
        );
        break;
      case '4':
        return (
          <MoreView
            adCheckToken={this.state.moreAdToken}
            sessionUser={this.sessionUser}
          />
        );
        break;
      default:
        return null;
        break;
    }
  };

  decrementUnread = () => {
    this.setState({numUnread: this.state.numUnread - 1});
  };

  getNotifications = () => {
    this._data();
  };

  getFriendshipRequests = () => {
    this._data();
  };

  onChangeTab = idx => {
    // console.log('onChangeTab, idx:', idx);
    // console.log('prevTime:', this.prevTime.getTime());
    // console.log('nowTime', new Date().getTime());
    let diff = new Date().getTime() - this.prevTime.getTime();
    console.log('diff:',diff);
    this.prevTime = new Date();
    if(diff < 200) return;


    Storage.addScene().then(() => {
      const random = Util.randomNumber();
      switch (idx) {
        case 1:
          this.setState({
            groupsAdToken: random,
            router: {
              ...this.state.router,
              index: idx,
            },
          });
          break;
        case 2:
          this.setState({
            notificationsAdToken: random,
            router: {
              ...this.state.router,
              index: idx,
            },
          });
          break;
        case 3:
          this.setState({
            moreAdToken: random,
            router: {
              ...this.state.router,
              index: idx,
            },
          });
          break;
        case 0:
        default:
          this.setState({
            feedAdToken: random,
            router: {
              ...this.state.router,
              index: idx,
            },
          });
          break;
      }
    });
  };
}

TabsView.propTypes = {
  tab: PropTypes.string.isRequired,
};

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    backgroundColor: '#f44336',
    borderRadius: 10,
    elevation: 4,
    height: 20,
    justifyContent: 'center',
    marginRight: 30,
    marginTop: 4,
    width: 20,
  },
  count: {
    color: '#fff',
    fontFamily: 'Raleway-Regular',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: -2,
  },
  tabBar: {
    backgroundColor: CP.moafWhite,
    borderTopColor: CP.moafLightGray,
    borderTopWidth: 1,
  },
  tabIcon: {
    resizeMode: 'contain',
  },
  tabText: {
    color: CP.moafLightGray,
    fontFamily: 'Raleway-Regular',
    fontSize: 10,
    fontWeight: '400',
  },
});

export {TabsView};
