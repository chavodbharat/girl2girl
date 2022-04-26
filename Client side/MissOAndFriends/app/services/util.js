import { Dimensions, ListView, Platform } from 'react-native';
import moment from 'moment';
import * as isoCountries from 'i18n-iso-countries';
import forOwn from 'lodash/forOwn';
import { Storage } from './storage';
import sanitizeHtml from 'sanitize-html';
import { BackHandler } from 'react-native';

// HACK no good way to lookup data in ListView.DataSource.
// renderRow (on ListView) passes "sectionID" and "rowID".
// the only way to "look up" data in the DataSource is via
// getRowData, but it expects section*Index* and row*Index*.
// getRowData throws up, since the indexes are NOT passed in.
// further, attempting to override the default getRowData (you can)
// is thwarted by the internals of DataSource: it first looks up
// through the default (i.e. by indexes, which we don't have) and
// THEN passes the resultants to the overrider -- too late. errors.
// so, we extend DataSource and provide a function that makes sense.
// this is not good.
// there isn't a prototype function to retrieve the internal
// data source, no other functions to look up section and row indexes
// by ids.
ListView.DataSource.prototype.findData  = function (sectionID, rowID) {
    return this._dataBlob[sectionID][rowID];
};

// HACK RefreshControl leaves residual spinner despite refreshing=false flag set on ios
// SEE https://github.com/facebook/react-native/issues/7976
// setting backgroundColor='transparent' does NOT work on ios
// for now, we fall back to low-level event handling in the form of this class.
class RefreshCalculator {

    constructor() {
        this.isAscending = false;
        this.issued = false;
        this.prevY = 0;
        this.threshold = -100; // arbitrary
        this.valleyY = 0;
    }

    check(newY) {
        if (newY < this.valleyY) {
            this.valleyY = newY;
        }
        if (newY > this.prevY) {
            this.isAscending = true;
        }
        this.prevY = newY;
        if (this.isAscending) {
            if (this.valleyY <= this.threshold) {
                if (!this.issued) {
                    this.issued = true;
                    return true;
                }
            }
        }
        return false;
    }

    reset() {
        this.isAscending = false;
        this.issued = false;
        this.prevY = 0;
        this.valleyY = 0;
    }

}

const countries = [];
const months = [];
const years = [];

const SCENE_THRESHOLD = 15;
let interstitialAlreadyDisplayed = false;

const Util = {

    get countries() {
        if (countries.length === 0) {
            forOwn(isoCountries.getNames('en'), (v, k) => {
                countries.push({
                    alpha_3: isoCountries.toAlpha3(k),
                    name: v,
                });
            });
            countries.sort((a, b) => {
                if (a.name === 'United States of America') {
                    return -1;
                }
                if (b.name === 'United States of America') {
                    return 1;
                }
                if (a.name < b.name) {
                    return -1;
                }
                if (a.name > b.name) {
                    return 1;
                }
                return 0;
            });
        }
        return countries;
    },

    allowBack () {
        BackHandler.removeEventListener("hardwareBackPress", this.handleDenyBack);
        BackHandler.addEventListener("hardwareBackPress", this.handleAllowBack);
    },

    denyBack () {
        BackHandler.removeEventListener("hardwareBackPress", this.handleAllowBack);
        BackHandler.addEventListener("hardwareBackPress", this.handleDenyBack);
    },

    setBack (cb) {
        this.denyBack();
        BackHandler.addEventListener("hardwareBackPress", cb);
    },

    unsetBack (cb) {
        BackHandler.removeEventListener("hardwareBackPress", cb);
        BackHandler.addEventListener("hardwareBackPress", this.handleDenyBack);
    },

    handleAllowBack () {
        return false;
    },

    handleDenyBack () {
        return true;
    },

    sanitize (html) {
        return sanitizeHtml(html, { allowedTags: [], allowedAttributes: [], textFilter: function(text) {
            return text.replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&').replace(/&quot;/g, '"');
        }});
    },

    formatDate(date) {
        return moment(date).format('MMMM D, YYYY');
    },

    getDifferenceInYears(date) {
        const now = moment();
        return now.diff(date, 'years');
    },

    getElapsedTime(date) {
        const now = moment();
        const someDate = moment(date);
        const diffSec = now.diff(someDate, 'seconds');
        const diffMin = now.diff(someDate, 'minutes');
        const diffHour = now.diff(someDate, 'hours');
        const diffDay = now.diff(someDate, 'days');
        const diffWeek = now.diff(someDate, 'weeks');
        const diffMonth = now.diff(someDate, 'months');
        const diffYear = this.getDifferenceInYears(someDate);
        let diff = null;
        let unit = null;
        if (diffSec < 60) {
            diff = diffSec;
            unit = 'second';
        } else if (diffMin < 60) {
            diff = diffMin;
            unit = 'minute';
        } else if (diffHour < 24) {
            diff = diffHour;
            unit = 'hour';
        } else if (diffDay < 7) {
            diff = diffDay;
            unit = 'day';
        } else if (diffMonth < 1) {
            diff = diffWeek;
            unit = 'week';
        } else if (diffMonth >= 1 && diffMonth < 12) {
            diff = diffMonth;
            unit = 'month';
        } else {
            diff = diffYear;
            unit = 'year';
        }
        return `${diff} ${unit}${diff > 1 ? 's' : ''} ago`;
    },

    getNowMoment() {
        return moment();
    },

    getScreenHeight() {
        const screenDims = Dimensions.get('window');
        return screenDims.height;
    },

    getScreenWidth() {
        const screenDims = Dimensions.get('window');
        return screenDims.width;
    },

    getStates() {
        return [{
            name: 'Alabama',
            abbreviation: 'AL',
        }, {
            name: 'Alaska',
            abbreviation: 'AK',
        }, {
            name: 'American Samoa',
            abbreviation: 'AS',
        }, {
            name: 'Arizona',
            abbreviation: 'AZ',
        }, {
            name: 'Arkansas',
            abbreviation: 'AR',
        }, {
            name: 'California',
            abbreviation: 'CA',
        }, {
            name: 'Colorado',
            abbreviation: 'CO',
        }, {
            name: 'Connecticut',
            abbreviation: 'CT',
        }, {
            name: 'Delaware',
            abbreviation: 'DE',
        }, {
            name: 'District Of Columbia',
            abbreviation: 'DC',
        }, {
            name: 'Federated States Of Micronesia',
            abbreviation: 'FM',
        }, {
            name: 'Florida',
            abbreviation: 'FL',
        }, {
            name: 'Georgia',
            abbreviation: 'GA',
        }, {
            name: 'Guam',
            abbreviation: 'GU',
        }, {
            name: 'Hawaii',
            abbreviation: 'HI',
        }, {
            name: 'Idaho',
            abbreviation: 'ID',
        }, {
            name: 'Illinois',
            abbreviation: 'IL',
        }, {
            name: 'Indiana',
            abbreviation: 'IN',
        }, {
            name: 'Iowa',
            abbreviation: 'IA',
        }, {
            name: 'Kansas',
            abbreviation: 'KS',
        }, {
            name: 'Kentucky',
            abbreviation: 'KY',
        }, {
            name: 'Louisiana',
            abbreviation: 'LA',
        }, {
            name: 'Maine',
            abbreviation: 'ME',
        }, {
            name: 'Marshall Islands',
            abbreviation: 'MH',
        }, {
            name: 'Maryland',
            abbreviation: 'MD',
        }, {
            name: 'Massachusetts',
            abbreviation: 'MA',
        }, {
            name: 'Michigan',
            abbreviation: 'MI',
        }, {
            name: 'Minnesota',
            abbreviation: 'MN',
        }, {
            name: 'Mississippi',
            abbreviation: 'MS',
        }, {
            name: 'Missouri',
            abbreviation: 'MO',
        }, {
            name: 'Montana',
            abbreviation: 'MT',
        }, {
            name: 'Nebraska',
            abbreviation: 'NE',
        }, {
            name: 'Nevada',
            abbreviation: 'NV',
        }, {
            name: 'New Hampshire',
            abbreviation: 'NH',
        }, {
            name: 'New Jersey',
            abbreviation: 'NJ',
        }, {
            name: 'New Mexico',
            abbreviation: 'NM',
        }, {
            name: 'New York',
            abbreviation: 'NY',
        }, {
            name: 'North Carolina',
            abbreviation: 'NC',
        }, {
            name: 'North Dakota',
            abbreviation: 'ND',
        }, {
            name: 'Northern Mariana Islands',
            abbreviation: 'MP',
        }, {
            name: 'Ohio',
            abbreviation: 'OH',
        }, {
            name: 'Oklahoma',
            abbreviation: 'OK',
        }, {
            name: 'Oregon',
            abbreviation: 'OR',
        }, {
            name: 'Palau',
            abbreviation: 'PW',
        }, {
            name: 'Pennsylvania',
            abbreviation: 'PA',
        }, {
            name: 'Puerto Rico',
            abbreviation: 'PR',
        }, {
            name: 'Rhode Island',
            abbreviation: 'RI',
        }, {
            name: 'South Carolina',
            abbreviation: 'SC',
        }, {
            name: 'South Dakota',
            abbreviation: 'SD',
        }, {
            name: 'Tennessee',
            abbreviation: 'TN',
        }, {
            name: 'Texas',
            abbreviation: 'TX',
        }, {
            name: 'Utah',
            abbreviation: 'UT',
        }, {
            name: 'Vermont',
            abbreviation: 'VT',
        }, {
            name: 'Virgin Islands',
            abbreviation: 'VI',
        }, {
            name: 'Virginia',
            abbreviation: 'VA',
        }, {
            name: 'Washington',
            abbreviation: 'WA',
        }, {
            name: 'West Virginia',
            abbreviation: 'WV',
        }, {
            name: 'Wisconsin',
            abbreviation: 'WI',
        }, {
            name: 'Wyoming',
            abbreviation: 'WY',
        }];
    },

    insertAd(array) {
        // we use 'null' as a flag to insert an mrec ad into the array
        const length = array.length;
        // 10 or fewer elements? mrec is middle-ish.
        if (length < 11) {
            const median = Math.floor(length / 2);
            array.splice(median, 0, null);
        } else {
            array.splice(10, 0, null); // else, 11th
        }
    },

    isAndroid() {
        return Platform.OS === 'android';
    },

    isIOS() {
        return Platform.OS === 'ios';
    },

    isSessionUserTheConvoPoster(sessionUser, convo) {
        return sessionUser._id === convo.user._id;
    },

    newListViewDataSource() {
        const ds = new ListView.DataSource({
            rowHasChanged: (r1, r2) => r1 !== r2,
        });
        return ds;
    },

    newRefreshCalculator() {
        return new RefreshCalculator();
    },

    randomNumber() {
        return Math.random();
    },

    shouldShowInterstitial(cb) {
        Storage.getSceneCount()
            .then(cnt => {
                // HACK without introducing custom event handling,
                // there is no good way to predict react-native's
                // componentWillReceiveProps call logic (what the
                // interstitial logic is predicated on) in tabbed
                // views and perhaps elsewhere -- especially considering
                // the ad platform is "bridged." this is an ugly
                // hack to prevent multiple interstitial pops.
                const shouldDisplay = cnt % SCENE_THRESHOLD === 0;
                if (shouldDisplay) {
                    if (!interstitialAlreadyDisplayed) {
                        interstitialAlreadyDisplayed = true;
                        cb(true);
                    }
                } else {
                    interstitialAlreadyDisplayed = false;
                    cb(false);
                }
            });
    },
};

export { Util };
