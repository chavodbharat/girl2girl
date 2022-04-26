import React from 'react';
import {
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
  SafeAreaView,
  FlatList
} from 'react-native';
import {GlobalStyles as GS, ColorPalette as CP} from './../../styles';
import {Actions} from 'react-native-router-flux';
import {Ajax} from './../services/ajax';
import {Storage} from './../services/storage';
import {Util} from './../services/util';
import {ActionSheetFollow} from '../components/action-sheet-follow';
import {AdMrec} from '../components/ad-mrec';
import {AlertDialog} from '../components/alert-dialog';
import {BackButton} from '../components/back-button';
import {CreateConvoButton} from '../components/create-convo-button';
import {Loading} from '../components/loading';
import {ShortConvo} from './../components/short-convo';
import type {SessionUser} from './../decls/session-user';
import type {ShortConvo as Model} from './../decls/short-convo';
import {FOLLOWING_TYPES} from './../decls/following';
import PropTypes from 'prop-types';
const PSMInterstitialAdView = require('./../module/ad-interstitial')
  .PSMInterstitialAdView;

class ActivityView extends React.Component {
  props: {
    adCheckToken: number,
    userId: string,
  };

  state: {
    ajaxMsg: string,
    alertType: string,
    async: boolean,
    context: any,
    convos: Array,
    followFn: Function,
    rawConvos: Array<Model>,
    titlePhrase: string,
    user: SessionUser,
    willFollow: boolean,
    page: number,
    size: number,
    hasMore: boolean,
  };

  constructor(props: any) {
    super(props);
    this.state = {
      ajaxMsg: '',
      alertType: '',
      async: false,
      context: null,
      convos: [],
      followFn: () => {},
      rawConvos: [],
      titlePhrase: '',
      user: null,
      willFollow: false,
      page: 0,
      size: 0,
      hasMore: true,
    };
    this.actionSheet = null;
    this.alertDialog = null;
    this.refreshCalc = Util.newRefreshCalculator();
    this.sessionUser = null;
    this.sessionUserListener = user => {
      this.sessionUser = user;
      this.forceUpdate();
    };
    Storage.addSessionUserListener(this.sessionUserListener);
  }

  render() {
    return (
      <SafeAreaView style={[GS.statusBar]}>
        <View style={[GS.flex1, GS.flexCol1]}>
          <View style={[GS.header, GS.bgColorLightPurple]}>
            <BackButton />
            <Text style={[GS.headerText]}>Activity</Text>
            <CreateConvoButton />
          </View>
          {this._renderAvatarRow()}
          <View
            style={[
              GS.paddingL10,
              GS.paddingV15,
              styles.latestConvosCont,
              GS.flexStretch,
            ]}>
            <Text style={[GS.text]}>Latest convos</Text>
          </View>
          {/* <ListView
            dataSource={this.state.convos}
            enableEmptySections
            refreshControl={
              <RefreshControl
                refreshing={this.state.async}
                onRefresh={this._data}
                title={'Refreshing...'}
              />
            }
            renderRow={(convo, sectionID, rowID) =>
              convo ? (
                <ShortConvo
                  key={convo._id}
                  convo={convo}
                  isGuest={this.sessionUser === null}
                  onFollow={this.onConvoFollow}
                  rowID={rowID}
                  sectionID={sectionID}
                  showGroup
                  showUser={false}
                  moreButtonPress={this._loadNext}
                  size={this.state.size}
                  showMore={this._showMore}
                />
              ) : (
                <AdMrec
                  email={
                    this.sessionUser
                      ? this.sessionUser.email
                      : 'example@example.com'
                  }
                />
              )
            }
            style={[GS.flexStretch]}
          /> */}
          {(this.state.convos || []).length > 0 && (
            <FlatList
              style={[GS.flexStretch]}
              data={this.state.convos}
              keyExtractor={(item, index) => index.toString()}
              refreshControl={
                <RefreshControl
                  refreshing={this.state.async}
                  onRefresh={this._data}
                  title={'Refreshing...'}
                />
              }
              renderItem={({item, index}) => {
                let convo = item;
                let rowID = index;
                let sectionID = 0;

                return (convo && rowID % 10 !== 0) || rowID == 0 ? (
                  <ShortConvo
                    key={convo._id}
                    convo={convo}
                    isGuest={this.props.sessionUser === null}
                    onFollow={this.onFollow}
                    rowID={rowID}
                    sectionID={sectionID}
                    moreButtonPress={this._loadNext}
                    size={this.state.size}
                    showMore={this._showMore}
                    showGroup
                    showUser
                  />
                ) : (
                  <AdMrec
                    email={
                      this.props.sessionUser
                        ? this.props.sessionUser.email
                        : 'example@example.com'
                    }
                  />
                );
              }}
            />
          )}
          <Loading isOpen={this.state.async} />
          <ActionSheetFollow
            ref={actionSheet => {
              this.actionSheet = actionSheet;
            }}
            onPress={this.state.followFn}
            titlePhrase={this.state.titlePhrase}
            willFollow={this.state.willFollow}
          />
          <AlertDialog
            ref={alertDialog => {
              this.alertDialog = alertDialog;
            }}
            text={this.state.ajaxMsg}
            type={this.state.alertType}
          />
        </View>
      </SafeAreaView>
    );
  }

  _showMore = rowID => {
    return this.state.size - 1 == rowID && this.state.hasMore;
  };

  _loadNext = () => {
    let page = this.state.page + 1;
    this.setState(
      {
        page: page,
      },
      () => {
        this._data(page);
      },
    );
  };

  componentDidMount() {
    this._data();
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
    if (nextProps.userId !== this.props.userId) {
      this._data();
    }
    if (nextProps.userId === this.props.userId) {
      if (!this.state.async) {
        this._data();
      }
    }
  }

  componentWillUnmount() {
    Storage.removeSessionUserListener(this.sessionUserListener);
  }

  _data = (offset = 0) => {
    this.setState({async: true});
    Ajax.getUser(
      this.props.userId,
      res => {
        this.setState({
          user: res,
        });
        Ajax.getUserConvos(
          this.props.userId,
          res => {
            let convos = res.convos;
            this.setState({hasMore: res.has_next});
            let rc = this.state.rawConvos;
            if (offset != 0) {
              rc.push(...convos);
              convos = rc;
            } else {
              this.setState({page: 0});
            }
            this.setState({size: convos.length});
            //Util.insertAd(convos);
            this.setState({async: false});
            this.setState({
              convos: convos,
              rawConvos: convos,
            });
            this.forceUpdate();
          },
          err => {
            this.setState({async: false});
            this.setState(
              {
                ajaxMsg: err.message,
                alertType: 'Error',
              },
              () => {
                this.alertDialog.open();
              },
            );
          },
          offset,
        );
      },
      err => {
        this.setState({async: false});
        this.setState(
          {
            ajaxMsg: err.message,
            alertType: 'Error',
          },
          () => {
            this.alertDialog.open();
          },
        );
      },
    );
  };

  _renderAvatarRow = () => {
    if (this.state.user && this.state.user.username) {
      let image = null;
      if (this.state.user.photo_url) {
        image = (
          <Image
            source={{uri: this.state.user.photo_url}}
            style={[{height: 40, width: 40}, styles.avatar]}
          />
        );
      } else {
        image = (
          <Image
            source={require('./../img/icon_profile_picture.png')}
            style={[{height: 40, width: 40}, styles.avatar]}
          />
        );
      }
      return (
        <TouchableHighlight
          activeOpacity={1.0}
          onPress={this.onUserFollow}
          style={[GS.flexStretch, GS.bgColorLightPurple]}
          underlayColor={'transparent'}>
          <View
            style={[
              GS.flexRow5,
              GS.flexStretch,
              GS.bgColorLightPurple,
              {paddingBottom: 25},
            ]}>
            {image}
            <Text style={[GS.headerText, {paddingTop: 25}]}>
              {this.state.user.username}
            </Text>
          </View>
        </TouchableHighlight>
      );
    }
  };

  convoFollow = () => {
    const following = {
      follower_id: this.sessionUser._id,
      following_id: this.state.context._id,
      following_type: FOLLOWING_TYPES.CONVO,
    };
    this.setState({async: true});
    Ajax.postFollowing(
      following,
      res => {
        const stateConvo = this.state.context;
        const convo = this.state.rawConvos.find(
          c => c != null && c._id === stateConvo._id,
        );
        convo.is_following = true;
        convo.num_followers = convo.num_followers + 1;
        this.setState(
          {
            ajaxMsg: `This convo ${this.state.context.text.substring(
              0,
              20,
            )}... will now show up in your feed.`,
            alertType: 'Info',
            async: false,
            rawConvos: this.state.rawConvos,
          },
          () => {
            this.setState({
              convos: this.state.rawConvos,
            });
            this.alertDialog.open();
          },
        );
      },
      err => {
        this.setState({async: false});
        this.setState(
          {
            ajaxMsg: err.message,
            alertType: 'Error',
          },
          () => {
            this.alertDialog.open();
          },
        );
      },
    );
  };

  convoUnfollow = () => {
    const follower_id = this.sessionUser._id;
    const following_id = this.state.context._id;
    this.setState({async: true});
    Ajax.deleteFollowing(
      follower_id,
      following_id,
      FOLLOWING_TYPES.CONVO,
      res => {
        const stateConvo = this.state.context;
        const convo = this.state.rawConvos.find(
          c => c != null && c._id === stateConvo._id,
        );
        convo.is_following = false;
        convo.num_followers = convo.num_followers - 1;
        this.setState(
          {
            ajaxMsg: `This convo ${this.state.context.text.substring(
              0,
              20,
            )}... will no longer show up in your feed.`,
            alertType: 'Info',
            async: false,
            rawConvos: this.state.rawConvos,
          },
          () => {
            this.setState({
              convos: this.state.rawConvos,
            });
            this.alertDialog.open();
          },
        );
      },
      err => {
        this.setState({async: false});
        this.setState(
          {
            ajaxMsg: err.message,
            alertType: 'Error',
          },
          () => {
            this.alertDialog.open();
          },
        );
      },
    );
  };

  onConvoFollow = (sectionID, rowID) => {
    const convo = this.state.convos[rowID];
    // can not un-follow your own convos
    if (Util.isSessionUserTheConvoPoster(this.sessionUser, convo)) {
      return false;
    }
    this.setState(
      {
        context: convo,
        followFn: convo.is_following ? this.convoUnfollow : this.convoFollow,
        titlePhrase: 'this convo',
        willFollow: !convo.is_following,
      },
      () => {
        this.actionSheet.open();
      },
    );
  };

  onScroll = obj => {
    if (!this.state.async) {
      const y = obj.nativeEvent.contentOffset.y;
      const shouldRefresh = this.refreshCalc.check(y);
      if (shouldRefresh) {
        this._data();
      }
    } else {
      this.refreshCalc.reset();
    }
  };

  onUserFollow = () => {
    if (this.sessionUser === null) {
      Actions.guest({adCheckToken: Util.randomNumber()});
    } else {
      // can not unfollow yourself
      if (this.sessionUser._id === this.state.user._id) {
        return false;
      }
      this.setState(
        {
          context: this.state.user,
          followFn: this.state.user.is_following
            ? this.userUnfollow
            : this.userFollow,
          titlePhrase: `${this.state.user.username}`,
          willFollow: !this.state.user.is_following,
        },
        () => {
          this.actionSheet.open();
        },
      );
    }
  };

  userFollow = () => {
    const following = {
      follower_id: this.sessionUser._id,
      following_id: this.state.context._id,
      following_type: FOLLOWING_TYPES.USER,
    };
    this.setState({async: true});
    Ajax.postFollowing(
      following,
      res => {
        this.setState({async: false});
        this.setState(
          {
            ajaxMsg:
              "Thanks! Your friend request has been sent. You will be notified once it's accepted.",
            alertType: 'Info',
            context: {
              ...this.state.context,
              is_following: true,
            },
          },
          () => {
            this.alertDialog.open();
          },
        );
      },
      err => {
        this.setState({async: false});
        this.setState(
          {
            ajaxMsg: err.message,
            alertType: 'Error',
          },
          () => {
            this.alertDialog.open();
          },
        );
      },
    );
  };

  userUnfollow = () => {
    const follower_id = this.sessionUser._id;
    const following_id = this.state.context._id;
    this.setState({async: true});
    Ajax.deleteFollowing(
      follower_id,
      following_id,
      FOLLOWING_TYPES.USER,
      res => {
        this.setState({async: false});
        this.setState(
          {
            ajaxMsg: `The latest convos by ${
              this.state.context.username
            } will no longer show up in your feed.`,
            alertType: 'Info',
            context: {
              ...this.state.context,
              is_following: false,
            },
          },
          () => {
            this.alertDialog.open();
          },
        );
      },
      err => {
        this.setState({async: false});
        this.setState(
          {
            ajaxMsg: err.message,
            alertType: 'Error',
          },
          () => {
            this.alertDialog.open();
          },
        );
      },
    );
  };
}

ActivityView.propTypes = {
  adCheckToken: PropTypes.number.isRequired,
  userId: PropTypes.string.isRequired,
};

const styles = StyleSheet.create({
  avatar: {
    borderRadius: 20,
    left: Util.getScreenWidth() * 0.15,
    position: 'absolute',
    resizeMode: 'cover',
  },
  latestConvosCont: {
    borderBottomColor: CP.moafBorder,
    backgroundColor: CP.moafWhite,
    borderBottomWidth: 1,
    padding: 10,
  },
});

export {ActivityView};
