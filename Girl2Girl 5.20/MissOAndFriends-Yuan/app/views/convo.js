import React from 'react';
import {
  Alert,
  Image,
  InteractionManager,
  Modal,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
  View,
  SafeAreaView,
  FlatList,
} from 'react-native';
import {WebView} from 'react-native-webview';
import {GlobalStyles as GS, ColorPalette as CP} from './../../styles';
import {Actions} from 'react-native-router-flux';
import Button from 'apsl-react-native-button';
import {Ajax} from './../services/ajax';
import {Storage} from './../services/storage';
import {Util} from './../services/util';
import {ActionSheetFollow} from '../components/action-sheet-follow';
import {AdMrec} from '../components/ad-mrec';
import {AlertDialog} from '../components/alert-dialog';
import {BackButton} from '../components/back-button';
import {CreateConvoButton} from '../components/create-convo-button';
import {Loading} from '../components/loading';
import {Response} from '../components/response';
import {ResponseInput} from '../components/response-input';
import type {Convo as Model} from './../decls/convo';
import type {Following} from './../decls/following';
import {FOLLOWING_TYPES} from './../decls/following';
import {Suggestion} from '../components/suggestion';
import PropTypes from 'prop-types';

import {Platform} from 'react-native';
const isAndroid = Platform.OS === 'android';

const PSMInterstitialAdView = require('./../module/ad-interstitial')
  .PSMInterstitialAdView;

class ConvoView extends React.Component {
  props: {
    adCheckToken: number,
    convoId: string,
    scrollTo: string,
  };

  state: {
    ajaxMsg: string,
    alertType: string,
    async: boolean,
    convo: Model,
    followFn: Function,
    respondToModalVisible: boolean,
    respondedToResponseId: string,
    respondedToText: string,
    respondedToUsername: string,
    responses: Array<any>,
    willFollow: boolean,
    isSubmitted: boolean,
  };

  constructor(props: any) {
    super(props);
    this.state = {
      ajaxMsg: '',
      alertType: '',
      async: false,
      convo: null,
      followFn: () => {},
      respondToModalVisible: false,
      respondedToResponseId: '',
      respondedToText: '',
      respondedToUsername: '',
      responseModalVisible: false,
      responses: [],
      isSubmitted: false,
      willFollow: false,
    };
    this.actionSheet = null;
    this.slv = null;
    this.vrefs = {};
    this.alertDialog = null;
    this.refreshCalc = Util.newRefreshCalculator();
    this.sessionUser = null;
    this.suggestion = null;
    this.responseInput = null;
    this.respondeInput = null;
    this.sessionUserListener = user => {
      this.sessionUser = user;
      this.forceUpdate();
    };
    Storage.addSessionUserListener(this.sessionUserListener);
  }

  render() {
    console.log('conversation screen');
    return (
      <SafeAreaView style={[GS.statusBar]}>
        <View style={[GS.flex1, GS.flexCol1, {backgroundColor: CP.moafWhite}]}>
          <View style={[GS.header, GS.bgColorLightPurple]}>
            <BackButton />
            <Text style={[GS.headerText]}>Convo</Text>
            <CreateConvoButton />
          </View>
          {this._renderConvo()}
          <Loading isOpen={this.state.async} />
          <ActionSheetFollow
            ref={actionSheet => {
              this.actionSheet = actionSheet;
            }}
            onPress={this.state.followFn}
            titlePhrase={'this convo'}
            willFollow={this.state.willFollow}
          />
          <AlertDialog
            ref={alertDialog => {
              this.alertDialog = alertDialog;
            }}
            text={this.state.ajaxMsg}
            type={this.state.alertType}
          />
          {this._renderRespondToModal()}
        </View>
      </SafeAreaView>
    );
  }

  componentDidMount() {
    this._data();
    Util.shouldShowInterstitial(shouldDisplay => {
      if (shouldDisplay) {
        PSMInterstitialAdView.show();
      }
    });
    let self = this;
    setTimeout(() => {
      if (self.props.scrollTo) {
        let tmp = self.props.scrollTo;
        if (self.vrefs.hasOwnProperty(tmp)) {
          let i = 0;
          self.vrefs[tmp].measure((fx, fy, width, height, px, py) => {
            if (py != undefined) {
              self.slv.scrollToOffset({offset: py, animated: true});
            } else {
              let irv = setInterval(() => {
                self.slv.scrollToOffset({offset: (i += 20), animated: true});
                self.vrefs[tmp].measure((fx, fy, width, height, px, py) => {
                  if (py) {
                    self.slv.scrollToOffset({
                      offset: py + height + 100,
                      animated: true,
                    });
                    clearInterval(irv);
                  }
                });
              }, 1);
            }
          });
        }
      }
    }, 3000);
  }

  setVref = (name, ref) => {
    this.vrefs[name] = ref;
  };

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.adCheckToken !== this.props.adCheckToken) {
      Util.shouldShowInterstitial(shouldDisplay => {
        if (shouldDisplay) {
          PSMInterstitialAdView.show();
        }
      });
    }
    if (nextProps.convoId !== this.props.convoId) {
      this._data();
    }
    if (nextProps.convoId === this.props.convoId) {
      if (!this.state.async) {
        this._data();
      }
    }
  }

  componentWillUnmount() {
    Storage.removeSessionUserListener(this.sessionUserListener);
  }

  _renderConvo = () => {
    if (this.state.convo) {
      return (
        <View style={[GS.flex1, GS.flexStretch, GS.marginT6]}>
          <View style={[GS.flexCol1]}>
            <Text style={[styles.title]}>{this.state.convo.title}</Text>
          </View>
          <View style={[GS.flexCol1]}>
            <View style={[GS.flexRow1]}>
              <Button
                accessibilityLabel={this.getGroupName()}
                onPress={this.onGroup}
                style={[styles.btn]}>
                <Text style={[styles.btnText]}>{this.getGroupName()}</Text>
              </Button>
            </View>
            <View style={[GS.flexRow1, GS.paddingH10]}>
              <View
                style={[
                  GS.flexRow7,
                  GS.flexGrow1,
                  GS.flexShrink0,
                  GS.flexWrap,
                ]}>
                <Text style={[GS.smallText, styles.darkGrayText]}>
                  Added by
                </Text>
                <Text
                  style={[GS.smallText, GS.username]}
                  onPress={this.activityView}>
                  {' '}
                  {this.getUsername()}
                </Text>
              </View>
              <View style={[{width: 95}, GS.flexGrow0, GS.flexShrink1]}>
                <View style={[GS.flexRow3, GS.flexGrow1]}>
                  <Text style={[GS.since]}>{this.getElapsedTime()}</Text>
                </View>
              </View>
            </View>
          </View>
          <View
            style={[
              GS.flexRow1,
              GS.flex1,
              GS.marginV10,
              GS.paddingH10,
              {maxHeight: 100},
            ]}>
            <ScrollView
              contentContainerStyle={[{marginBottom: 0}]}
              keyboardShouldPersistTaps={'handled'}
              showsHorizontalScrollIndicator={false}
              style={[GS.flexStretch, {height: 90}]}>
              <WebView
                useWebKit={true}
                source={{
                  html: articleHtml({body: this.state.convo.text}),
                  baseUrl: '',
                }}
                originWhitelist={['*']}
                style={[{height: 90}]}
                scalesPageToFit={Platform.OS === 'ios' ? false : true}
              />
            </ScrollView>
          </View>
          {this.state.convo.group._id > 0 ? (
            <View style={[GS.flexRow1, GS.paddingL10, GS.paddingB10]}>
              <TouchableHighlight
                activeOpacity={1.0}
                onPress={this.onFollow}
                style={[{marginRight: 25}]}
                underlayColor={'transparent'}>
                <View style={[GS.flexRow1, GS.flexWrap, GS.marginV5]}>
                  <Image source={this.getFollowingIcon()} />
                  <Text style={[GS.smallText, GS.marginL5]}>Follow</Text>
                </View>
              </TouchableHighlight>
              <TouchableHighlight
                activeOpacity={1.0}
                onPress={this.onRespond}
                style={[{marginRight: 25}]}
                underlayColor={'transparent'}>
                <View style={[GS.flexRow1, GS.marginV5]}>
                  <Image source={this.getChatIcon()} />
                  <Text style={[GS.smallText, GS.marginL5]}>Chat</Text>
                </View>
              </TouchableHighlight>
              <TouchableHighlight
                activeOpacity={1.0}
                onPress={this.onShare}
                style={[{marginRight: 25}]}
                underlayColor={'transparent'}>
                <View style={[GS.flexRow1, GS.flexWrap, GS.marginV5]}>
                  <Image source={require('./../img/convo_icon_share.png')} />
                  <Text style={[GS.smallText, GS.marginL5]}>Share</Text>
                </View>
              </TouchableHighlight>
            </View>
          ) : null}
          <View style={[styles.convoMetricsCont, GS.flexStretch]}>
            <Text style={[styles.convoMetricsText]}>
              {this.getNumberOfResponsesText()}{' '}
              <Text style={[styles.lightGrayText]}>
                • {this.getFollowersText()}
              </Text>
            </Text>
          </View>
          {this._renderResponses()}
          {this._renderResponseModal()}
        </View>
      );
    }
  };

  inputUsername = name => {
    console.log('inputUsername :', name);
    let i;
    if (this.respondeInput) {
      i = this.respondeInput;
    } else {
      i = this.responseInput;
    }
    let text = i.getText();
    this.suggestion.close();
    let newText = text.replace(/(.*)(@[^\s]*)$/, '$1@' + name);
    i.setText(newText);
  };

  onResponseTextChange = (text: string) => {
    console.log('onResponseTextChange :', text);
    if (/.*@[^\s]*$/.test(text)) {
      let tmp = text.match(/.*@([^\s]+)$/);
      tmp = tmp ? tmp[1] : tmp;
      this.suggestion.open(tmp);
    } else {
      this.suggestion.close();
    }
    return text;
  };

  getSuggestion = () => {
    return this.suggestion;
  };

  _renderResponseModal = () => {
    return (
      <Modal
        onRequestClose={this.onAndroidModalClose}
        animationType={'none'}
        transparent
        visible={this.state.responseModalVisible}>
        <View style={[styles.modal]}>
          <View
            style={[
              {
                backgroundColor: 'rgba(255,255,255,1.0)',
                flex: 1,
                maxHeight: 225,
              },
            ]}>
            <View
              style={[
                GS.flexStretch,
                GS.flexRow5,
                GS.bgColorSkyBlue,
                GS.paddingV5,
              ]}>
              <Text style={[styles.btnText]}>{this.getUsername()}</Text>
            </View>
            <View
              style={[GS.flexStretch, GS.flexRow1, GS.flex1, {maxHeight: 100}]}>
              <ScrollView
                keyboardShouldPersistTaps={'handled'}
                showsHorizontalScrollIndicator={false}
                style={[GS.flexStretch, GS.paddingH10, {height: 90}]}>
                <Text style={[styles.btnText, GS.colorBlack]}>
                  {this.getText()}
                </Text>
              </ScrollView>
            </View>
            <View>
              <ResponseInput
                ref={responseInput => {
                  this.responseInput = responseInput;
                }}
                suggestion={this.getSuggestion}
                onTextChange={this.onResponseTextChange}
                onClose={() => {
                  this.setState({
                    responseModalVisible: false,
                  });
                }}
                onSend={this.respond}
                shouldClose={!this.state.responseModalVisible}
              />
            </View>
          </View>
        </View>
        <Suggestion
          hack={true}
          convoId={this.props.convoId}
          ref={suggestion => {
            this.suggestion = suggestion;
          }}
          onSelect={this.inputUsername}
        />
      </Modal>
    );
  };

  _renderRespondToModal = () => {
    return (
      <Modal
        onRequestClose={this.onAndroidModalClose}
        animationType={'none'}
        transparent
        visible={this.state.respondToModalVisible}>
        <View style={[styles.modal]}>
          <View
            style={[
              {
                backgroundColor: 'rgba(255,255,255,1.0)',
                flex: 1,
                maxHeight: 225,
              },
            ]}>
            <View
              style={[
                GS.flexStretch,
                GS.flexRow5,
                GS.bgColorSkyBlue,
                GS.paddingV5,
              ]}>
              <Text style={[styles.btnText]}>
                {this.state.respondedToUsername}
              </Text>
            </View>
            <View
              style={[GS.flexStretch, GS.flexRow1, GS.flex1, {maxHeight: 100}]}>
              <ScrollView
                keyboardShouldPersistTaps={'handled'}
                showsHorizontalScrollIndicator={false}
                style={[GS.flexStretch, GS.paddingH10, {height: 90}]}>
                <Text style={[styles.btnText, GS.colorBlack]}>
                  {this.state.respondedToText}
                </Text>
              </ScrollView>
            </View>
            <View>
              <ResponseInput
                onClose={() => {
                  this.setState({
                    respondToModalVisible: false,
                    respondedToResponseId: '',
                    respondedToText: '',
                    respondedToUsername: '',
                  });
                }}
                ref={respondeInput => {
                  this.respondeInput = respondeInput;
                }}
                onTextChange={this.onResponseTextChange}
                onSend={this.inResponseTo}
                shouldClose={!this.state.respondToModalVisible}
              />
            </View>
          </View>
        </View>
        <Suggestion
          hack={true}
          convoId={this.props.convoId}
          ref={suggestion => {
            this.suggestion = suggestion;
          }}
          onSelect={this.inputUsername}
        />
      </Modal>
    );
  };

  _renderResponses = () => {
    if (this.state.convo.group._id < 0) {
      return null;
    }
    if (this.getNumberOfResponses() > 0) {
      return (
        <View style={[GS.flex1, GS.paddingB10]}>
          <FlatList
            ref={slv => {
              this.slv = slv;
            }}
            initialPageSize={10}
            data={this.state.responses}
            enableEmptySections
            keyboardShouldPersistTaps={'handled'}
            refreshControl={
              <RefreshControl
                refreshing={this.state.async}
                onRefresh={this._data}
              />
            }
            renderItem={response =>
              response ? (
                <Response
                  xref={this.setVref}
                  initialListSize={this.getNumberOfResponses()}
                  key={response._id}
                  getRespondedTo={this.getRespondedTo}
                  isGuest={this.sessionUser === null}
                  onResponse={this.openResponseTo}
                  onShare={this.onResponseShare}
                  response={response.item}
                  responseId={response._id}
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
            keyExtractor={(item, index) => index.toString()}
          />
        </View>
      );
    }
    return (
      <View
        style={[
          GS.bgColorWhite,
          GS.flex1,
          GS.flexCol1,
          {overflow: 'visible', alignItems: 'center', justifyContent: 'center'},
        ]}>
        <View
          style={
            ([GS.flexCol5, GS.flexStretch, GS.padding15, GS.flexWrap],
            {overflow: 'visible'})
          }>
          <Text style={[styles.noneText, GS.bold]}>No Chats Yet</Text>
        </View>
        {this._renderFollowText()}
        <View
          style={
            ([GS.flexCol2, GS.flexStretch, GS.paddingH15, GS.flexWrap],
            {paddingHorizontal: 15})
          }>
          <Text
            onPress={this.onRespond}
            style={[styles.noneText, GS.colorDarkPurple]}>
            Respond
          </Text>
          <Text style={[styles.noneText]}>to start the conversation!</Text>
        </View>
      </View>
    );
  };

  _renderFollowText = () => {
    if (!this.isFollowing()) {
      return (
        <View
          style={
            ([GS.flexCol2, GS.flexStretch, GS.paddingH15, GS.flexWrap],
            {paddingHorizontal: 15})
          }>
          <Text
            onPress={this.onFollow}
            style={[styles.noneText, GS.colorDarkPurple]}>
            Follow
          </Text>
          <Text style={[styles.noneText]}>this convo to get updates or</Text>
        </View>
      );
    }
    return null;
  };

  _data = () => {
    this.setState({async: true});
    Ajax.getConvo(
      this.props.convoId,
      res => {
        const responses = [].concat(
          res.responses.sort((a, b) => {
            if (a.status == 'pending') {
              if (b.status != 'pending') {
                return -1;
              }
              return 0;
            }
            return 0;
          }),
        );
        Util.insertAd(responses);
        this.setState({
          convo: res,
          responses: responses,
        });
        this.setState({async: false});
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
    );
  };

  activityView = () => {
    Actions.activity({
      adCheckToken: Util.randomNumber(),
      userId: this.getConvoUserId(),
    });
  };

  follow = () => {
    const following = {
      follower_id: this.sessionUser._id,
      following_id: this.state.convo._id,
      following_type: FOLLOWING_TYPES.CONVO,
    };
    this.setState({async: true});
    Ajax.postFollowing(
      following,
      res => {
        this.setState({async: false});
        this.setState(
          {
            ajaxMsg: 'This convo will now show up in your feed.',
            alertType: 'Info',
            convo: {
              ...this.state.convo,
              is_following: true,
              num_followers: this.state.convo.num_followers + 1,
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

  getChatIcon = () => {
    if (this.hasResponded()) {
      return require('./../img/convo_icon_comment_added.png');
    }
    return require('./../img/convo_icon_comment.png');
  };

  getConvoUserId = () => {
    return this.state.convo.user._id;
  };

  getElapsedTime = () => {
    return Util.getElapsedTime(this.state.convo.date);
  };

  getFollowersText = () => {
    const isFollowing = this.isFollowing();
    let text = '';
    if (isFollowing) {
      const numFollowers = this.getNumberOfFollowers() - 1;
      text = 'You';
      if (numFollowers === 0) {
        text = `${text} follow`;
      } else {
        text = `${text} and ${numFollowers} ${
          numFollowers > 1 ? 'people follow' : 'person follows'
        }`;
      }
    } else {
      const numFollowers = this.getNumberOfFollowers();
      text = `${numFollowers} ${
        numFollowers !== 1 ? 'people follow' : 'person follows'
      }`;
    }
    return text;
  };

  getFollowingIcon = () => {
    if (this.isFollowing()) {
      return require('./../img/convo_icon_follow_active.png');
    }
    return require('./../img/convo_icon_follow.png');
  };

  getGroupId = () => {
    return this.state.convo.group._id;
  };

  getGroupName = () => {
    return this.state.convo.group.name.replace(/&amp;/g, '&');
  };

  getNumberOfFollowers = () => {
    return this.state.convo.num_followers;
  };

  getNumberOfResponses = () => {
    return this.state.convo.responses.length;
  };

  getNumberOfResponsesText = () => {
    const numResponses = this.getNumberOfResponses();
    const cardinality = numResponses === 1 ? 'chat' : 'chats';
    return `${numResponses === 0 ? 'No' : numResponses} ${cardinality}`;
  };

  getRespondedTo = _id => {
    return this.state.convo.responses.find(r => r._id === _id);
  };

  getText = () => {
    return Util.sanitize(this.state.convo.text);
  };

  // getStyledText = () => {
  //   return '<style>html {font-family: "Raleway-Regular"; font-weight: 400; font-size: 35}</style><html>' + this.state.convo.text + '</html>';
  // };
  getStyledText = () => {
    return (
      '<style media="screen" type="text/css"> @font-face{font-family: "Raleway-Regular"; font-weight: 400; font-size: 35, src:local("Raleway-Regular"), url("Raleway-Regular.ttf") format("truetype"))} ' +
      'html {font-family: "Raleway-Regular"; font-weight: 400; font-size: 45px}</style><html>' +
      this.state.convo.text +
      '</html>'
    );
  };
  // getStyledText = () => {
  //   return
  // }

  getUsername = () => {
    return `${this.state.convo.user.is_sponsor ? 'our sponsor ' : ''}${
      this.state.convo.user.username
    }`;
  };

  hasResponded = () => {
    return this.state.convo.has_responded;
  };

  inResponseTo = text => {
    const trimmed = text.trim();
    if (!trimmed) {
      return false;
    }
    const response = {
      convo_id: this.state.convo._id,
      date: new Date().toISOString(),
      in_response_to: this.state.respondedToResponseId,
      text: trimmed,
      user_id: this.sessionUser._id,
    };
    if (this.state.isSubmitted) {
      return false;
    }
    this.setState(
      {
        isSubmitted: true,
        async: true,
        respondToModalVisible: false,
      },
      () => {
        Ajax.postResponse(
          this.state.convo._id,
          response,
          res => {
            this.setState(
              {
                ajaxMsg:
                  'Thanks! Your chat was received and will be posted v v soon!!',
                alertType: 'Info',
                isSubmitted: false,
                async: false,
              },
              () => {
                InteractionManager.runAfterInteractions(() => {
                  this.alertDialog.open();
                });
              },
            );
          },
          err => {
            this.setState(
              {
                ajaxMsg: err.message,
                alertType: 'Error',
                isSubmitted: false,
                async: false,
              },
              () => {
                InteractionManager.runAfterInteractions(() => {
                  this.alertDialog.open();
                });
              },
            );
          },
        );
      },
    );
  };

  isFollowing = () => {
    return this.state.convo.is_following;
  };

  onAndroidModalClose = () => {
    this.setState({
      responseModalVisible: false,
      respondToModalVisible: false,
      respondedToResponseId: '',
      respondedToText: '',
      respondedToUsername: '',
    });
  };

  onFollow = () => {
    if (this.sessionUser) {
      const convo = this.state.convo;
      // can not un-follow your own convos
      if (Util.isSessionUserTheConvoPoster(this.sessionUser, convo)) {
        return false;
      }
      this.setState(
        {
          followFn: this.isFollowing() ? this.unfollow : this.follow,
          willFollow: !this.isFollowing(),
        },
        () => {
          this.actionSheet.open();
        },
      );
    } else {
      Actions.guest({adCheckToken: Util.randomNumber()});
    }
  };

  onGroup = () => {
    if (this.state.convo.group._id > 0) {
      Actions.group({
        adCheckToken: Util.randomNumber(),
        groupId: this.getGroupId(),
      });
    }
  };

  onRespond = () => {
    if (this.sessionUser) {
      this.setState({responseModalVisible: true});
    } else {
      Actions.guest({adCheckToken: Util.randomNumber()});
    }
  };

  onResponseShare = obj => {
    this.share(Util.sanitize(obj.text));
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

  onShare = () => {
    this.share();
  };

  openResponseTo = _id => {
    const inResponseTo = this.getRespondedTo(_id);
    const inResponseToUsername = `${
      inResponseTo.user.is_sponsor ? 'our sponsor ' : ''
    }${inResponseTo.user.username}`;
    // const inResponseToUsername = 'test';
    this.setState({
      respondToModalVisible: true,
      respondedToResponseId: _id,
      respondedToText: Util.sanitize(inResponseTo.text),
      respondedToUsername: inResponseToUsername,
    });
  };

  respond = text => {
    const trimmed = text.trim();
    if (!trimmed) {
      return false;
    }
    const response = {
      convo_id: this.state.convo._id,
      date: new Date().toISOString(),
      text: trimmed,
      user_id: this.sessionUser._id,
    };
    if (this.state.isSubmitted) {
      return false;
    }
    this.setState(
      {
        isSubmitted: true,
        async: true,
        responseModalVisible: false,
      },
      () => {
        Ajax.postResponse(
          this.state.convo._id,
          response,
          res => {
            this.setState(
              {
                ajaxMsg:
                  'Thanks! Your chat was received and will be posted v v soon!!',
                alertType: 'Info',
                isSubmitted: false,
                async: false,
              },
              () => {
                InteractionManager.runAfterInteractions(() => {
                  this.alertDialog.open();
                });
              },
            );
          },
          err => {
            this.setState(
              {
                ajaxMsg: err.message,
                alertType: 'Error',
                isSubmitted: false,
                async: false,
              },
              () => {
                InteractionManager.runAfterInteractions(() => {
                  this.alertDialog.open();
                });
              },
            );
          },
        );
      },
    );
  };

  share = responseText => {
    this.setState({async: true});
    Ajax.getConvoUrl(
      this.state.convo._id,
      json => {
        this.setState({async: false});
        const convoText = `${this.getText().substring(0, 40)}...`;
        let text = null;
        if (responseText) {
          text = `Check out this response ${responseText} in the convo ${convoText} on MissOAndFriends!`;
        } else {
          text = `Check out this convo ${Util.sanitize(
            convoText,
          )} on MissOAndFriends!`;
        }
        Share.share({
          dialogTitle: `Share this ${responseText ? 'response' : 'convo'}!`,
          message: text,
          title: `Share this ${responseText ? 'response' : 'convo'}!`,
          url: json.url,
        }).catch(err => {
          this.setState(
            {
              ajaxMsg: err.message,
              alertType: 'Error',
            },
            () => {
              this.alertDialog.open();
            },
          );
        });
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

  unfollow = () => {
    const follower_id = this.sessionUser._id;
    const following_id = this.state.convo._id;
    this.setState({async: true});
    Ajax.deleteFollowing(
      follower_id,
      following_id,
      FOLLOWING_TYPES.CONVO,
      res => {
        this.setState({async: false});
        this.setState(
          {
            ajaxMsg: 'This convo will no longer show up in your feed.',
            alertType: 'Info',
            convo: {
              ...this.state.convo,
              is_following: false,
              num_followers: this.state.convo.num_followers - 1,
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
export const generateAssetFontCss = ({
  fontFileName,
  extension = 'ttf',
}: {
  fontFileName: string,
  extension?: string,
}) => {
  const fileUri = Platform.select({
    ios: `${fontFileName}.${extension}`,
    android: `file:///android_asset/fonts/${fontFileName}.${extension}`,
  });

  return `@font-face {
      font-family: '${fontFileName}';
      src: local('${fontFileName}'), url('${fileUri}') ;
  }`;
};
export const articleHtml = ({body}: {body: string}) => `
<html>
<head>
    <style>
        ${generateAssetFontCss({
          fontFileName: 'Raleway-Regular',
          extension: 'ttf',
        })}
        body {
            font-family: Raleway-Regular;
            font-size: 16
        }
    </style>
    <meta
        name="viewport"
        content="width=device-width, initial-scale=1"
    />
</head>
<body>
    ${body}
</body>
</html>
`;

const styles = StyleSheet.create({
  title: {
    paddingTop: 10,
    paddingLeft: 10,
    fontFamily: 'Raleway-Regular',
    fontSize: 22,
    fontWeight: '700',
  },
  btn: {
    alignItems: 'center',
    backgroundColor: CP.moafMagenta,
    borderColor: CP.moafWhite,
    borderRadius: 20,
    borderWidth: 2,
    height: 38,
    justifyContent: 'center',
    margin: 5,
    overflow: 'hidden',
    paddingLeft: 15,
    paddingRight: 15,
  },
  btnText: {
    color: CP.moafWhite,
    fontFamily: 'Raleway-Regular',
    fontSize: 15,
    fontWeight: Util.isAndroid() ? '400' : '500',
  },
  convoMetricsCont: {
    borderBottomColor: CP.moafWhite,
    borderBottomWidth: 1,
    borderTopColor: CP.moafWhite,
    borderTopWidth: 1,
    paddingBottom: 9,
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 9,
  },
  convoMetricsText: {
    color: CP.moafBlack,
    fontFamily: 'Raleway-Regular',
    fontSize: 13,
    fontWeight: Util.isAndroid() ? '400' : '500',
  },
  lightGrayText: {
    color: CP.moafLightGray,
  },
  modal: {
    backgroundColor: 'rgba(0,0,0,0.75)',
    flex: 1,
    height: Util.getScreenHeight(),
    paddingLeft: 15,
    paddingRight: 15,
    paddingTop: 20,
    width: Util.getScreenWidth(),
  },
  noneText: {
    color: CP.moafBlack,
    fontFamily: 'raleway',
    fontSize: 20,
    fontWeight: '500',
    lineHeight: 30,
    textAlign: 'center',
  },
});

ConvoView.propTypes = {
  adCheckToken: PropTypes.number.isRequired,
  convoId: PropTypes.string.isRequired,
  scrollId: PropTypes.string.isOptional,
};

export {ConvoView};
