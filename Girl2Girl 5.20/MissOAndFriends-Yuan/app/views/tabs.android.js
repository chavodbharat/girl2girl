import React from 'react';
import { Image, Text, View, ViewPagerAndroid, SafeAreaView } from 'react-native';
import { ColorPalette as CP } from '../../styles';
import { Ajax } from '../services/ajax';
import { Storage } from '../services/storage';
import { FeedView } from './feed';
import { GroupsView } from './groups';
import { MoreView } from './more';
import { NotificationsView } from './notifications';
import type { Notification } from '../decls/notification';
import PropTypes from 'prop-types';

const views = {
    feed: 0,
    groups: 1,
    notifications: 2,
    more: 3,
};

class TabsView extends React.Component {

    props: {
        tab: string;
    };

    state: {
        notifications: Array<Notification>;
        numUnread: number;
        selectedTab: number;
    };

    constructor(props: any) {
        super(props);
        this.state = {
            notifications: [],
            numUnread: 0,
            selectedTab: views[this.props.tab] || 0,
        };
        this.sessionUser = {};
    }

    render() {
        return (
            <ViewPagerAndroid
                initialPage={this.state.selectedTab}
                keyboardDismissMode={'on-drag'}
                onPageSelected={this.onChangeTab}
            >
                <View>
                    <FeedView />
                </View>
                <View>
                    <GroupsView />
                </View>
                <View>
                    <NotificationsView
                        getNotifications={this.getNotifications}
                        sessionUser={this.sessionUser}
                    />
                </View>
                <View>
                    <MoreView />
                </View>
            </ViewPagerAndroid>
        );
    }

    _data = (cb) => {
        Storage.getSessionUser()
            .then(user => {
                this.sessionUser = user;
                if (user) {
                    this.setState({ async: true });
                    Ajax.getNotifications(res => {
                        const notifications = res.notifications;
                        if (cb) {
                            cb(notifications);
                        }
                        this.setState({
                            notifications: notifications,
                            numUnread: notifications.filter(n => !n.was_read).length,
                        });
                    }, err => {
                        // NOTE nothing. swallow. this is a background process on a timer.
                    });
                }
            });
    };

    componentDidMount() {
        this._data();
    }

    getNotifications = (cb) => {
        this._data(cb);
    };

    onChangeTab = (event: any) => {
        this.setState({ selectedTab: event.nativeEvent.position });
    };
}

TabsView.propTypes = {
    tab: PropTypes.string.isRequired,
};

export default { TabsView };
