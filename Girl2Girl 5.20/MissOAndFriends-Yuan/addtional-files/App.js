import React, {Component} from 'react';
import {AppRegistry} from 'react-native';
import {ActionConst, Reducer, Router, Scene} from 'react-native-router-flux';
import {Storage} from './app/services/storage';
import {ActivityView} from './app/views/activity';
import {ConvoView} from './app/views/convo';
import {CreateConvoView} from './app/views/create-convo';
import {FeedView} from './app/views/feed';
import {ForgotView} from './app/views/forgot';
import {GuestView} from './app/views/guest';
import {GroupView} from './app/views/group';
import {GroupsView} from './app/views/groups';
import {LoginView} from './app/views/login';
import {MoreView} from './app/views/more';
import {NotificationsView} from './app/views/notifications';
import {ProfileView} from './app/views/profile';
import {PolicyView} from './app/views/policy';
import {RegisterView} from './app/views/register';
import {PushSettings} from './app/views/pushSettings';
import {TabsView} from './app/views/tabs_';
import {WelcomeView} from './app/views/welcome';

export default class MissOAndFriends extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Router createReducer={this.reducer}>
        {/*<Router>*/}
        <Scene key={'root'} hideNavBar>
          <Scene key={'activity'} component={ActivityView} />
          <Scene key={'convo'} component={ConvoView} />
          <Scene key={'createConvo'} component={CreateConvoView} />
          <Scene key={'forgot'} component={ForgotView} />
          <Scene key={'group'} component={GroupView} />
          <Scene key={'guest'} component={GuestView} />
          <Scene key={'login'} component={LoginView} />
          <Scene key={'profile'} component={ProfileView} />
          <Scene key={'register'} component={RegisterView} />
          <Scene key={'pushSettings'} component={PushSettings} />
          <Scene key={'policy'} component={PolicyView} />
          <Scene key={'tabs'} component={TabsView} >
            <Scene key={'feed'} component={FeedView} />
            <Scene key={'groups'} component={GroupsView}/>
            <Scene key={'notifications'} component={NotificationsView}/>
            <Scene key={'more'} component={MoreView}/>
          </Scene>
          <Scene
            key={'welcome'}
            component={WelcomeView}
            initial
            type={ActionConst.RESET}
          />
        </Scene>
      </Router>
    );
  }

  reducer = params => {
    const defaultReducer = Reducer(params);
    return (state, action) => {
      if (action.scene) {
        Storage.addScene();
      }
      return defaultReducer(state, action);
    };
  };
}

export {MissOAndFriends};
