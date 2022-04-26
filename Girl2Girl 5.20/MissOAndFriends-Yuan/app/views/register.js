import React from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  Alert,
  TextInput,
  TouchableHighlight,
  View, 
  SafeAreaView
} from 'react-native';
import dismissKeyboard from 'react-native-dismiss-keyboard';
import {GlobalStyles as GS} from './../../styles';
import {Actions} from 'react-native-router-flux';
import {Ajax} from './../services/ajax';
import {Photos} from './../services/photos';
import {Schema} from './../services/schema';
import {Util} from './../services/util';
import {AlertDialog} from '../components/alert-dialog';
import {ActionButton} from './../components/action-button';
import {Loading} from '../components/loading';
import {MoafDatePicker} from './../components/datepicker';
import {MoafPicker} from './../components/picker';
import {ValidationError} from './../components/validation-error';
import type {RegisterUser} from './../decls/register-user';
import type {Country} from './../decls/country';
import type {UsaState} from './../decls/usa-state';
import mailcheck from 'mailcheck';

class RegisterView extends React.Component {
  state: {
    ajaxMsg: string,
    alertTitle: string,
    alertType: string,
    async: boolean,
    avatarUri: any,
    confirmInError: boolean,
    confirmMsg: string,
    confirmPassword: string,
    countryInError: boolean,
    countryMsg: string,
    dobInError: boolean,
    dobMsg: string,
    emailInError: boolean,
    emailMsg: string,
    genderInError: boolean,
    genderMsg: string,
    nameFirstInError: boolean,
    nameFirstMsg: string,
    openCountry: boolean,
    openDob: boolean,

    openParentEmail: boolean,
    parentEmailInError: boolean,
    parentEmailMsg: string,

    openGender: boolean,
    openUsaState: boolean,
    passwordInError: boolean,
    passwordMsg: string,
    registrationInError: boolean,
    selectedCountry: Country,
    selectedDob: Date,
    selectedGender: any,
    selectedUsaState: UsaState,
    user: RegisterUser,
    usernameInError: boolean,
    usernameMsg: string,
    force: boolean,
  };

  constructor(props: any) {
    super(props);
    this.state = {
      force: false,
      ajaxMsg: '',
      alertTitle: '',
      alertType: '',
      async: false,
      avatarUri: null,
      confirmInError: false,
      confirmMsg: '',
      confirmPassword: '',
      countryInError: false,
      countryMsg: '',
      dobInError: false,
      dobMsg: '',
      emailInError: false,
      emailMsg: '',
      genderInError: false,
      genderMsg: '',
      nameFirstInError: false,
      nameFirstMsg: '',
      openCountry: false,
      openDob: false,
      openGender: false,
      openUsaState: false,
      passwordInError: false,
      passwordMsg: '',
      registrationInError: true,
      selectedCountry: null,
      selectedDob: null,
      selectedGender: null,

      showParentEmail: false,
      parentEmailMsg: null,
      openParentEmail: false,
      // BUG this commented-out data is so that we have valid
      // values for pickers that do not show up in debug mode
      // for react-native iOS
      // SEE https://github.com/facebook/react-native/issues/12515
      // selectedCountry: {
      //     alpha_3: 'AFG',
      //     name: 'Afghanistan',
      // },
      // selectedDob: new Date(),
      // selectedGender: {
      //     id: 'girl',
      //     name: 'Girl',
      // },
      selectedUsaState: null,
      user: {
        birth_date: null,
        country: {
          alpha_3: '',
          name: '',
        },
        email: '',
        parentEmail: '',
        is_sponsor: false,
        name_first: '',
        password: '',
        photo: null,
        state: null,
        username: '',
      },
      usernameInError: false,
      usernameMsg: '',
    };
    this.countries = Util.countries;
    this.usaStates = Util.getStates();
    this.genders = [
      {
        id: 'girl',
        name: 'Girl',
      },
      {
        id: 'boy',
        name: 'Boy',
      },
    ];
    // NOTE artificially create placeholders for Android pickers
    if (Util.isAndroid()) {
      this.countries.unshift({
        alpha_3: null,
        name: 'country',
      });
      this.usaStates.unshift({
        abbreviation: null,
        name: 'usa state',
      });
      this.genders.unshift({
        id: null,
        name: 'gender',
      });
    }
    this.alertDialog = null;
    this.genderAgeAlertTitle = 'Sorry!';
    this.genderAgeAlertText =
      'Only girls 18 and under can join Miss O Girl2Girl Wall';
    this.under13AlertText =
      "Because you are under 13, we need to get permission from your parent. Please Enter your parent or guardian's email address.";
    this.platform = Platform.OS;
    this.registrationAlertText = 'Check your email to complete registration.';
    this.registrationUnder13AlertText =
      'Ask you parent or guardian to check their email to complete registration.';
    this.emailExistsMessage =
      'This email has already been used. Please try another one.';
    this.usernameExistsMessage =
      'This username already exists. Please use another one.';
  }

  render() {
    const offset = Util.isAndroid() ? -175 : 0;
    return (
      <SafeAreaView style={[GS.statusBar]}>
      <KeyboardAvoidingView
        behavior={'position'}
        contentContainerStyle={[GS.flex1, GS.flexStretch]}
        keyboardVerticalOffset={offset}
        style={[GS.flex1, GS.flexCol1, GS.bgColorLightPurple, GS.paddingB10]}>
        <View style={[GS.header]}>
          <Text style={[GS.headerText]}>Create an account</Text>
        </View>
        <TouchableHighlight
          activeOpacity={1.0}
          onPress={this.avatar}
          style={[GS.flexRow5, GS.flexStretch, GS.marginT5]}
          underlayColor={'transparent'}>
          {this.state.avatarUri ? (
            <Image
              source={{uri: this.state.avatarUri}}
              style={[{height: 100, width: 100}, GS.avatarPhoto]}
            />
          ) : (
            <Image
              source={require('./../img/welcome_misso_logo.png')}
              style={[GS.avatar]}
            />
          )}
        </TouchableHighlight>
        <ScrollView
          keyboardShouldPersistTaps={'handled'}
          showsHorizontalScrollIndicator={false}
          style={[GS.flexStretch, GS.paddingH10, {marginTop: 25}]}>
          <TextInput
            autoCapitalize={'none'}
            autoCorrect={false}
            onChangeText={text => {
              this.onChangeUsername(text);
            }}
            placeholder={'username'}
            placeholderTextColor={'#9a9a9a'}
            style={[GS.textInput]}
            underlineColorAndroid={'transparent'}
            value={this.state.user.username}
          />
          <ValidationError
            show={this.state.usernameInError}
            text={this.state.usernameMsg}
          />
          <TextInput
            autoCapitalize={'none'}
            autoCorrect={false}
            keyboardType={'email-address'}
            onChangeText={text => {
              this.onChangeEmail(text);
            }}
            placeholder={'email address'}
            placeholderTextColor={'#9a9a9a'}
            style={[GS.textInput]}
            underlineColorAndroid={'transparent'}
            value={this.state.user.email}
          />
          <ValidationError
            show={this.state.emailInError}
            text={this.state.emailMsg}
          />
          <TextInput
            autoCapitalize={'words'}
            autoCorrect={false}
            onChangeText={text => {
              this.onChangeNameFirst(text);
            }}
            placeholder={'first name'}
            placeholderTextColor={'#9a9a9a'}
            style={[GS.textInput]}
            underlineColorAndroid={'transparent'}
            value={this.state.user.name_first}
          />
          <ValidationError
            show={this.state.nameFirstInError}
            text={this.state.nameFirstMsg}
          />
          {this._renderCountryInput()}
          <ValidationError
            show={this.state.countryInError}
            text={this.state.countryMsg}
          />
          {this._renderUsaStateInput()}
          {this._renderGenderInput()}
          <ValidationError
            show={this.state.genderInError}
            text={this.state.genderMsg}
          />
          <TouchableHighlight
            activeOpacity={1.0}
            onPress={() => {
              this.setState({openDob: true});
            }}
            style={[GS.flexStretch]}
            underlayColor={'transparent'}>
            <Text style={[GS.select]}>
              {!this.state.selectedDob ? (
                <Text style={[GS.selectPh]}>date of birth</Text>
              ) : (
                Util.formatDate(this.state.selectedDob)
              )}
            </Text>
          </TouchableHighlight>
          <ValidationError
            show={this.state.dobInError}
            text={this.state.dobMsg}
          />

          {this.state.showParentEmail === true ? (
            <View>
              <View
                style={[
                  GS.flexCol5,
                  GS.flexStretch,
                  GS.marginT10,
                  GS.paddingV5,
                ]}>
                <Text style={[GS.text, GS.colorWhite]}>
                  Because you are under 13, we need to get permission from your
                  parent or guardian so that you can participate in certain
                  activities on the site as a regular Club Member. Please Enter
                  your parent or guardian's email address.
                </Text>
              </View>
              <TextInput
                autoCapitalize={'none'}
                autoCorrect={false}
                keyboardType={'email-address'}
                onChangeText={text => {
                  this.onChangeParentEmail(text);
                }}
                placeholder={"parent or guardian's email"}
                placeholderTextColor={'#9a9a9a'}
                style={[GS.textInput]}
                underlineColorAndroid={'transparent'}
                value={this.state.user.parentEmail}
              />
              <ValidationError
                show={this.state.parentEmailInError}
                text={this.state.parentEmailMsg}
              />
            </View>
          ) : null}

          <TextInput
            autoCapitalize={'none'}
            autoCorrect={false}
            onChangeText={text => {
              this.onChangePassword(text);
            }}
            placeholder={'password'}
            placeholderTextColor={'#9a9a9a'}
            secureTextEntry
            style={[GS.textInput]}
            underlineColorAndroid={'transparent'}
            value={this.state.user.password}
          />
          <ValidationError
            show={this.state.passwordInError}
            text={this.state.passwordMsg}
          />
          <TextInput
            autoCapitalize={'none'}
            autoCorrect={false}
            onChangeText={text => {
              this.onChangeConfirmPassword(text);
            }}
            placeholder={'confirm password'}
            placeholderTextColor={'#9a9a9a'}
            secureTextEntry
            style={[GS.textInput]}
            underlineColorAndroid={'transparent'}
            value={this.state.confirmPassword}
          />
          <ValidationError
            show={this.state.confirmInError}
            text={this.state.confirmMsg}
          />
          <ActionButton
            accessibility="join"
            classes={[GS.btn, GS.bgColorSkyBlue, GS.marginT10]}
            isDisabled={this.state.registrationInError}
            onPress={this.register}
            text="join"
          />
          <View
            style={[GS.flexCol5, GS.flexStretch, GS.marginT10, GS.paddingV5]}>
            <Text style={[GS.text, GS.colorWhite]} onPress={this.login}>
              Already have an account? <Text style={[GS.bold]}>Log in</Text>
            </Text>
          </View>
        </ScrollView>
        <Loading isOpen={this.state.async} />
        <AlertDialog
          ref={alertDialog => {
            this.alertDialog = alertDialog;
          }}
          onClose={this.onClosedAlertDialog}
          text={this.state.ajaxMsg}
          title={this.state.alertTitle}
          type={this.state.alertType}
          force={this.state.force}
        />
        {this._renderCountry()}
        {this._renderUsaState()}
        {this._renderGender()}
        {this._renderDob()}
      </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  _renderCountry = () => {
    if (this.state.openCountry) {
      if (this.platform === 'ios') {
        return (
          <MoafPicker
            items={this.countries}
            keyProp={'alpha_3'}
            labelProp={'name'}
            onChange={this.onSelectedCountry}
            onClose={this.onClosedCountry}
            selectedKey={
              this.state.selectedCountry
                ? this.state.selectedCountry.alpha_3
                : null
            }
          />
        );
      }
    }
  };

  _renderCountryInput = () => {
    if (this.platform === 'ios') {
      return (
        <TouchableHighlight
          activeOpacity={1.0}
          onPress={() => {
            this.setState({openCountry: true});
          }}
          style={[GS.flexStretch]}
          underlayColor={'transparent'}>
          <Text style={[GS.select]}>
            {!this.state.selectedCountry ? (
              <Text style={[GS.selectPh]}>country</Text>
            ) : (
              this.state.selectedCountry.name
            )}
          </Text>
        </TouchableHighlight>
      );
    } else {
      return (
        <MoafPicker
          items={this.countries}
          keyProp={'alpha_3'}
          labelProp={'name'}
          onChange={this.onSelectedCountry}
          onClose={this.onClosedCountry}
          selectedKey={
            this.state.selectedCountry
              ? this.state.selectedCountry.alpha_3
              : null
          }
        />
      );
    }
  };

  _renderDob = () => {
    if (this.state.openDob) {
      return (
        <MoafDatePicker
          onChange={this.onSelectedDob}
          onClose={this.onClosedDob}
          selectedDate={this.state.selectedDob}
        />
      );
    }
  };

  _renderGender = () => {
    if (this.state.openGender) {
      if (this.platform === 'ios') {
        return (
          <MoafPicker
            items={this.genders}
            keyProp={'id'}
            labelProp={'name'}
            onChange={this.onSelectedGender}
            onClose={this.onClosedGender}
            selectedKey={
              this.state.selectedGender ? this.state.selectedGender.id : null
            }
          />
        );
      }
    }
  };

  _renderGenderInput = () => {
    if (this.platform === 'ios') {
      return (
        <TouchableHighlight
          activeOpacity={1.0}
          onPress={() => {
            this.setState({openGender: true});
          }}
          style={[GS.flexStretch]}
          underlayColor={'transparent'}>
          <Text style={[GS.select]}>
            {!this.state.selectedGender ? (
              <Text style={[GS.selectPh]}>gender</Text>
            ) : (
              this.state.selectedGender.name
            )}
          </Text>
        </TouchableHighlight>
      );
    } else {
      return (
        <MoafPicker
          items={this.genders}
          keyProp={'id'}
          labelProp={'name'}
          onChange={this.onSelectedGender}
          onClose={this.onClosedGender}
          selectedKey={
            this.state.selectedGender ? this.state.selectedGender.id : null
          }
        />
      );
    }
  };

  _renderUsaState = () => {
    if (this.state.openUsaState) {
      if (this.platform === 'ios') {
        return (
          <MoafPicker
            items={this.usaStates}
            keyProp={'abbreviation'}
            labelProp={'name'}
            onChange={this.onSelectedUsaState}
            onClose={this.onClosedUsaState}
            selectedKey={
              this.state.selectedUsaState
                ? this.state.selectedUsaState.abbreviation
                : null
            }
          />
        );
      }
    }
  };

  _renderUsaStateInput = () => {
    if (
      this.state.selectedCountry &&
      this.state.selectedCountry.alpha_3 === 'USA'
    ) {
      if (this.platform === 'ios') {
        return (
          <View>
            <TouchableHighlight
              activeOpacity={1.0}
              onPress={() => {
                this.setState({openUsaState: true});
              }}
              style={[GS.flexStretch]}
              underlayColor={'transparent'}>
              <Text style={[GS.select]}>
                {!this.state.selectedUsaState ? (
                  <Text style={[GS.selectPh]}>state</Text>
                ) : (
                  this.state.selectedUsaState.name
                )}
              </Text>
            </TouchableHighlight>
            <ValidationError show={false} text={''} />
          </View>
        );
      } else {
        return (
          <View>
            <MoafPicker
              items={this.usaStates}
              keyProp={'abbreviation'}
              labelProp={'name'}
              onChange={this.onSelectedUsaState}
              onClose={this.onClosedUsaState}
              selectedKey={
                this.state.selectedUsaState
                  ? this.state.selectedUsaState.abbreviation
                  : null
              }
            />
            <ValidationError show={false} text={''} />
          </View>
        );
      }
    }
  };

  avatar = () => {
    return false;
    /*
        Photos.getPhoto(res => {
            if (res.error) {
                this.setState({
                    ajaxMsg: res.error,
                    alertType: 'Error',
                }, () => {
                    this.alertDialog.open();
                });
            } else if (res.uri) {
                this.setState({ avatarUri: res.uri });
            }
        });
        */
  };

  isRegistrationDisabled = () => {
    const {
      confirmInError,
      countryInError,
      dobInError,
      emailInError,
      genderInError,
      nameFirstInError,
      passwordInError,
      usernameInError,
    } = this.state;
    if (
      confirmInError ||
      countryInError ||
      dobInError ||
      emailInError ||
      genderInError ||
      nameFirstInError ||
      passwordInError ||
      usernameInError
    ) {
      this.setState({registrationInError: true});
      return;
    }
    const {
      confirmPassword,
      selectedCountry,
      selectedDob,
      selectedGender,
      selectedUsaState,
      user,
    } = this.state;
    if (
      !confirmPassword ||
      !selectedCountry ||
      !selectedDob ||
      !selectedGender
    ) {
      this.setState({registrationInError: true});
      return;
    }
    const {email, name_first, password, username} = user;
    if (!email || !name_first || !password || !username) {
      this.setState({registrationInError: true});
      return;
    }
    this.setState({registrationInError: false});
  };

  login = () => {
    Actions.login();
  };

  onChangeEmail = (text: string) => {
    const trimmed = text.trim();
    this.setState({
      user: {
        ...this.state.user,
        email: trimmed,
      },
    });
    Schema.validate(trimmed, Schema.email, 'email', err => {
      console.log('err:', err);
      if (err) {
        this.setState({
          emailMsg: err,
        });
        this.setState(
          {
            emailInError: err !== null,
          },
          () => {
            this.isRegistrationDisabled();
          },
        );
      }
      else{
        let email = trimmed;
        console.log('Email is not null. email:',email);
        mailcheck.run({
          email,
          suggested : (Suggestion) => {
            console.log('suggestion :', Suggestion);
            this.setState({
              emailMsg : `Did you mean ${Suggestion.full}?`
            })
          },
          empty : () => {
            console.log('nothing to suggest');  
            
            let common_domains = 
            ['@msn','@bellsouth','@telus','@comcast','@optusnet','@earthlink','@qq',
             '@sky','@icloud','@mac','@sympatico','@googlemail','@att','@xtra','@web',
             '@cox','@gmail','@ymail','@aim','@rogers','@verizon','@rocketmail','@google',
             '@optonline','@sbcglobal','@aol','@me','@binternet','@charter','@shaw'];
            
            let isCommon = false;
            common_domains.forEach(common => {
              if(email.indexOf(common) !== -1) isCommon = true;
            }); 
            if(!isCommon) {
              console.log('its not common email.');  
              this.setState({
                emailMsg : `If school email use different one`
              })
            }
            else{
              console.log('common email');
              this.setState({emailInError: err !== null});
            }
            
          }
        })
      }
      
    });
  };


  onChangeParentEmail = (text: string) => {
    const trimmed = text.trim();
    this.setState({
      user: {
        ...this.state.user,
        parentEmail: trimmed,
      },
    });
    Schema.validate(trimmed, Schema.email, 'email', err => {
      if (err) {
        this.setState({
          parentEmailMsg: err,
        });
      }
      this.setState(
        {
          parentEmailInError: err !== null,
        },
        () => {
          this.isRegistrationDisabled();
        },
      );
    });
  };

  onChangePassword = (text: string) => {
    this.setState({
      user: {
        ...this.state.user,
        password: text,
      },
    });
    Schema.validate(text, Schema.password, 'password', err => {
      if (err) {
        this.setState({
          passwordMsg: err,
        });
      }
      this.setState(
        {
          passwordInError: err !== null,
        },
        () => {
          this.isRegistrationDisabled();
        },
      );
    });
  };

  onChangeConfirmPassword = (text: string) => {
    this.setState({confirmPassword: text});
    // BUG this does not work. must do local validation
    // SEE https://github.com/hapijs/joi/issues/652
    /*
         Schema.validate(text, Schema.confirm_password, 'confirm password', (err) => {
         if (err) {
         this.setState({
         confirmMsg: err
         });
         }
         this.setState({
         confirmInError: err !== null
         });
         });
         */
    const inError = text.trim() === '' || text !== this.state.user.password;
    this.setState(
      {
        confirmInError: inError,
      },
      () => {
        this.isRegistrationDisabled();
      },
    );
    if (inError) {
      this.setState({
        confirmMsg:
          text.trim() === ''
            ? 'password confirmation required'
            : 'must match password',
      });
    }
  };

  onChangeNameFirst = (text: string) => {
    this.setState({
      user: {
        ...this.state.user,
        name_first: text,
      },
    });
    const trimmed = text.trim();
    Schema.validate(trimmed, Schema.name_first, 'first name', err => {
      if (err) {
        this.setState({
          nameFirstMsg: err,
        });
      }
      this.setState(
        {
          nameFirstInError: err !== null,
        },
        () => {
          this.isRegistrationDisabled();
        },
      );
    });
  };

  onChangeUsername = (text: string) => {
    const trimmed = text.trim();
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(re.test(trimmed)){
      this.setState({
        usernameInError : true,
        usernameMsg : 'Pick a user name, not email address'
      });
      return;
    }

    this.setState({
      user: {
        ...this.state.user,
        username: trimmed,
      },
    });
    Schema.validate(trimmed, Schema.username, 'username', err => {
      if (err) {
        this.setState({
          usernameMsg: err,
        });
      }
      this.setState(
        {
          usernameInError: err !== null,
        },
        () => {
          this.isRegistrationDisabled();
        },
      );
    });
  };

  onClosedAlertDialog = () => {
    if (
      this.state.ajaxMsg === this.registrationAlertText ||
      this.state.ajaxMsg === this.registrationUnder13AlertText
    ) {
      Actions.welcome({refreshToken: Util.randomNumber()});
    }
  };

  onClosedCountry = () => {
    this.setState({openCountry: false});
  };

  onClosedDob = () => {
    this.setState({openDob: false});
  };

  onClosedGender = () => {
    this.setState({openGender: false});
  };

  onClosedUsaState = () => {
    this.setState({openUsaState: false});
  };

  onSelectedCountry = (obj: Country) => {
    this.setState({selectedCountry: obj});
    Schema.validate(obj, Schema.country, 'country', err => {
      if (err) {
        if (Util.isAndroid()) {
          this.setState({
            countryMsg: 'country is required',
          });
        } else {
          this.setState({
            countryMsg: err,
          });
        }
      }
      this.setState(
        {
          countryInError: err !== null,
        },
        () => {
          this.isRegistrationDisabled();
        },
      );
    });
  };

  onSelectedDob = (obj: Date) => {
    this.setState({selectedDob: obj});
    Schema.validate(obj, Schema.dob13, 'date of birth', err => {
      const tooSmallRegex = /must be/;
      if (tooSmallRegex.test(err)) {
        this.setState(
          {
            ajaxMsg: this.under13AlertText,
            alertTitle: this.genderAgeAlertTitle,
            alertType: 'Info',
            showParentEmail: true,
          },
          () => {
            this.alertDialog.open();
          },
        );
      } else {
        this.setState({
          showParentEmail: false,
        });
      }
      this.setState(
        {
          dobInError: err !== null,
        },
        () => {
          this.isRegistrationDisabled();
        },
      );
    });
    Schema.validate(obj, Schema.dob, 'date of birth', err => {
      const tooOldRegex = /must be larger/;
      if (err) {
        this.setState({
          dobMsg: tooOldRegex.test(err)
            ? 'you must be 18 years or younger'
            : err,
        });
        if (tooOldRegex.test(err)) {
          this.setState(
            {
              ajaxMsg: this.genderAgeAlertText,
              alertTitle: this.genderAgeAlertTitle,
              alertType: 'Info',
            },
            () => {
              this.alertDialog.open();
            },
          );
        }
      }
      this.setState(
        {
          dobInError: err !== null,
        },
        () => {
          this.isRegistrationDisabled();
        },
      );
    });
  };

  onSelectedGender = (obj: any) => {
    this.setState({selectedGender: obj});
    Schema.validate(obj.name, Schema.gender, 'gender', err => {
      if (err) {
        this.setState(
          {
            ajaxMsg: this.genderAgeAlertText,
            alertTitle: this.genderAgeAlertTitle,
            alertType: 'Info',
            genderMsg: 'you must be a girl to join',
          },
          () => {
            this.alertDialog.open();
          },
        );
      }
      this.setState(
        {
          genderInError: err !== null,
        },
        () => {
          this.isRegistrationDisabled();
        },
      );
    });
  };

  onSelectedUsaState = (obj: UsaState) => {
    this.setState({selectedUsaState: obj});
  };

  register = () => {
    dismissKeyboard();
    const payload = Object.assign({}, this.state.user);
    payload.birth_date = this.state.selectedDob.toISOString();
    payload.country = JSON.stringify(this.state.selectedCountry);
    payload.name_first = payload.name_first.trim();
    if (
      this.state.selectedCountry.alpha_3 === 'USA' &&
      this.state.selectedUsaState
    ) {
      payload.state = JSON.stringify(this.state.selectedUsaState);
    }
    if (this.state.avatarUri) {
      payload.photo_url = this.state.avatarUri;
      const extension = this.state.avatarUri.replace(/^.+\.([a-zA-Z]+)$/, '$1');
      payload.photo = {
        name: `avatar.${extension}`,
        type: `image/${extension}`,
        uri: this.state.avatarUri,
      };
    } else {
      payload.photo_url = 'https://placehold.it/100/854edd/ffffff?text=AVATAR';
    }

    this.setState({async: true});

    var self = this;

    Ajax.usernameExists(payload.username).then(exists => {
      if (exists) {
        self.setState(
          {
            ajaxMsg: self.usernameExistsMessage,
            alertTitle: '',
            alertType: 'Error',
            force: true,
            async: false,
          },
          () => {
            self.alertDialog.open();
          },
        );
      } else {
        self.checkEmail(payload);
      }
    });
  };

  checkEmail = payload => {
    var self = this;
    Ajax.emailExists(payload.email)
      .then(exists => {
        if (exists) {
          self.setState(
            {
              ajaxMsg: self.emailExistsMessage,
              alertTitle: '',
              alertType: 'Error',
              force: true,
              async: false,
            },
            () => {
              self.alertDialog.open();
            },
          );
        } else {
          if (this.state.showParentEmail) {
            self.checkParentEmail(payload);
          } else {
            self.postUser(payload);
          }
        }
      })
      .catch(err => {
        self.setState(
          {
            ajaxMsg: err.message,
            alertTitle: '',
            alertType: 'Error',
            async: false,
            force: false,
          },
          () => {
            self.alertDialog.open();
          },
        );
      });
  };

  checkParentEmail = payload => {
    // this.state.showParentEmail
    var self = this;
    Ajax.emailExists(payload.parentEmail)
      .then(exists => {
        if (exists) {
          self.setState(
            {
              ajaxMsg: self.emailExistsMessage,
              alertTitle: '',
              alertType: 'Error',
              force: true,
              async: false,
            },
            () => {
              self.alertDialog.open();
            },
          );
        } else {
          self.postUser(payload);
        }
      })
      .catch(err => {
        self.setState(
          {
            ajaxMsg: err.message,
            alertTitle: '',
            alertType: 'Error',
            async: false,
            force: false,
          },
          () => {
            self.alertDialog.open();
          },
        );
      });
  };

  postUser = payload => {
    Ajax.postUser(
      payload,
      () => {
        let msgText = this.state.showParentEmail
          ? this.registrationUnder13AlertText
          : this.registrationAlertText;
        this.setState(
          {
            ajaxMsg: msgText,
            alertTitle: '',
            alertType: 'Info',
            async: false,
          },
          () => {
            this.alertDialog.open();
          },
        );
      },
      err => {
        this.setState(
          {
            ajaxMsg: err.message,
            alertTitle: '',
            alertType: 'Error',
            async: false,
            force: false,
          },
          () => {
            this.alertDialog.open();
          },
        );
      },
    );
  };
}

export {RegisterView};
