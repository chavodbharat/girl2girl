import React from 'react';
import { Image, TabBarIOS, Text, View, Linking, Alert, AsyncStorage } from 'react-native';
import { ColorPalette as CP } from './../../styles';
import { Ajax } from './../services/ajax';
import { Storage } from './../services/storage';
import { Util } from './../services/util';
import { FeedView } from './feed';
import { GroupsView } from './groups';
import { MoreView } from './more';
import { NotificationsView } from './notifications';
import type { Notification } from './../decls/notification';
import type { FriendshipRequest } from './../decls/friendshiprequest';
import { Actions } from 'react-native-router-flux';
import PropTypes from 'prop-types';
import firebase from 'react-native-firebase';

const Item = TabBarIOS.Item;

class TabsView extends React.Component {

    props: {
        tab: string;
    };

    state: {
        feedAdToken: number;
        groupsAdToken: number;
        notificationsAdToken: number;
        moreAdToken: number;
        notifications: Array<Notification>;
        numUnread: number;
        friendshipRequests: Array<FriendshipRequest>;
        selectedTab: string;
    };

    constructor(props: any) {
        super(props);
        this.state = {
            feedAdToken: Util.randomNumber(),
            groupsAdToken: Util.randomNumber(),
            notificationsAdToken: Util.randomNumber(),
            moreAdToken: Util.randomNumber(),
            notifications: [],
            friendshipRequests: [],
            numUnread: 0,
            selectedTab: this.props.tab || 'feed',
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
            <TabBarIOS
                barTintColor={CP.moafWhite}
                tintColor={CP.moafDarkPurple}
                unselectedItemTintColor={CP.moafDarkGray}
                unselectedTintColor={CP.moafDarkGray}
            >
                <Item
                    icon={require('./../img/tab_icon_feed.png')}
                    onPress={() => { this.onChangeTab('feed'); }}
                    renderAsOriginal
                    selected={this.state.selectedTab === 'feed'}
                    selectedIcon={require('./../img/tab_icon_feed_active.png')}
                    title={'Feed'}
                >
                    <FeedView
                        adCheckToken={this.state.feedAdToken}
                        sessionUser={this.sessionUser}
                    />
                </Item>
                <Item
                    icon={require('./../img/tab_icon_groups.png')}
                    onPress={() => { this.onChangeTab('groups'); }}
                    renderAsOriginal
                    selected={this.state.selectedTab === 'groups'}
                    selectedIcon={require('./../img/tab_icon_groups_active.png')}
                    title={'Groups'}
                >
                    <GroupsView
                        adCheckToken={this.state.groupsAdToken}
                        sessionUser={this.sessionUser}
                    />
                </Item>
                <Item
                    badge={this.state.numUnread > 0 ? this.state.numUnread : null}
                    badgeColor={'red'}
                    icon={require('./../img/tab_icon_notifications.png')}
                    onPress={() => { this.onChangeTab('notifications'); }}
                    renderAsOriginal
                    selected={this.state.selectedTab === 'notifications'}
                    selectedIcon={require('./../img/tab_icon_notifications_active.png')}
                    title={'Notifications'}
                >
                    <NotificationsView
                        adCheckToken={this.state.notificationsAdToken}
                        decrementUnreadCount={this.decrementUnread}
                        getNotifications={this.getNotifications}
                        getFriendshipRequests={this.getFriendshipRequests}
                        notifications={this.state.notifications}
                        friendshipRequests={this.state.friendshipRequests}
                        sessionUser={this.sessionUser}
                    />
                </Item>
                <Item
                    icon={require('./../img/tab_icon_more_active.png')}
                    onPress={() => { this.onChangeTab('more'); }}
                    renderAsOriginal
                    selected={this.state.selectedTab === 'more'}
                    selectedIcon={require('./../img/tab_icon_more.png')}
                    title={'More'}
                >
                    <MoreView
                        adCheckToken={this.state.moreAdToken}
                        sessionUser={this.sessionUser}
                    />
                </Item>
            </TabBarIOS>
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
					os: 'iOS',
					email: user.email,
					id: user._id
				});
			}
		} else {
			await Ajax.registerToken({
				token: fcmToken,
				os: 'iOS',
				email: user.email,
				id: user._id
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

    componentDidMount () {
        let self = this;
        Linking.getInitialURL()
            .then((url) => {
                if (url) {
                    const path = url.substr(8);                    
                    switch (path) {                        
                        case 'notifications':
                        case 'groups':
                        case 'more':
                            self.onChangeTab(path);
                            break;                        
                        default: break;
                    }
                } 
            }).catch(err => {});        
        this._data();
		this.checkPermission();
		this.createNotificationListeners(); //add this line
    }
	
	async createNotificationListeners() {
		/*
		* Triggered when a particular notification has been received in foreground
		**/
		//works when is opened but in background
		/*
		this.notificationListener = firebase.notifications().onNotification((notification) => {
			const { title, body, data } = notification;
			this.showAlert("2" + title, JSON.stringify(data));
		});
		*/
		/*
		this.notificationDisplayedListener = firebase.notifications().onNotificationDisplayed((notification: Notification) => {
			const { title, body, data } = notification.notification;
			Alert.alert(JSON.stringify(data));
			this.showAlert("3" + title, body);
		});
		*/

		/*
		* If your app is in background, you can listen for when a notification is clicked / tapped / opened as follows:
		**/
		
		/*
		this.notificationOpenedListener = firebase.notifications().onNotificationOpened((notificationOpen) => {
			const { title, body, data } = notificationOpen.notification;
			Alert.alert("Q" + JSON.stringify(data));
			this.showAlert("1" + title, body);
		});
		*/

		/*
		* If your app is closed, you can check if it was opened by a notification being clicked / tapped / opened as follows:
		**/
		
		const notificationOpen = await firebase.notifications().getInitialNotification();
		if (notificationOpen) {
			const { title, body, data } = notificationOpen.notification;
			if (data && data.event && data.event === 'new_reply') {
				Actions.convo({ adCheckToken: Util.randomNumber(), convoId: data.topic_id });
			}
			if (data && data.event && data.event === 'new_post') {
				Actions.convo({ adCheckToken: Util.randomNumber(), convoId: data.topic_id });
			}
			if (data && data.event && (data.event === 'new_friend' || data.event === 'new_friendship_request')) {
				Actions.activity({ adCheckToken: Util.randomNumber(), userId: data.user_id });
			}
		}
		
		//Data only foreground
		/*
		this.messageListener = firebase.messaging().onMessage((message) => {
			//process data message
			Alert.alert("4" + JSON.stringify(message));
			console.log(JSON.stringify(message));
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
                const notifications      = arr[0].notifications;
                const friendshipRequests = arr[1].notifications;                
                this.setState({
                    notifications: notifications,
                    friendshipRequests: friendshipRequests,
                    numUnread: notifications.filter(n => !n.was_read).length + friendshipRequests.filter(n => !n.was_read).length,
                });
                this.forceUpdate();
            }).catch(err => {

            });
        } else {
            this.setState({
                notifications: [],
                friendshipRequests: [],
                numUnread: 0,
            });
        }
    };

    decrementUnread = () => {
        this.setState({ numUnread: this.state.numUnread - 1 });
    };

    getNotifications = () => {
        this._data();
    };

    getFriendshipRequests = () => {
        this._data();
    }

    onChangeTab = (tabName: string) => {
        Storage.addScene()
            .then(() => {
                const random = Util.randomNumber();
                switch (tabName) {
                    case 'groups':
                        this.setState({
                            groupsAdToken: random,
                            selectedTab: tabName
                        });
                        break;
                    case 'notifications':
                        this.setState({
                            notificationsAdToken: random,
                            selectedTab: tabName
                        });
                        break;
                    case 'more':
                        this.setState({
                            moreAdToken: random,
                            selectedTab: tabName
                        });
                        break;
                    case 'feed':
                    default:
                        this.setState({
                            feedAdToken: random,
                            selectedTab: tabName
                        });
                        break;
                }
            });
    };
}

TabsView.propTypes = {
    tab: PropTypes.string.isRequired,
};

export { TabsView };
