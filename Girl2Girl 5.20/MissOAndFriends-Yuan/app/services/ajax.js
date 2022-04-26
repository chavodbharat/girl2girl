import Config from 'react-native-config';
import { Alert } from 'react-native';
import { Storage } from './storage';
import { Util } from './util';
import { Actions } from 'react-native-router-flux';

const SERVER_URL = Config.API_SERVER_URL;
const PORT = Config.PORT || 443;
const API_VERSION = Config.API_VERSION;

const url = parts => `https://missoandfriends.com/api/v1/${parts.join('/')}`;
//const url = parts => `http://192.168.2.52:7777/api/v1/${parts.join('/')}`;
//const url = parts => `https://staging.missoandfriends.com/api/v1/${parts.join('/')}`;

const pnUrl = parts => `https://missoandfriends.com/${parts.join('/')}`;
//const pnUrl = parts => `https://staging.missoandfriends.com/${parts.join('/')}`;

const SERVER_UNDER_MAINTENANCE_ERROR = {
    message: "Server is under maintenance. Please try again later"
};

const TIMEOUT_EXCEPTION_ERROR = {
    message: "Timeout Exception"
};

const isUnderMaintenance = (err) => {
    return err != undefined && err != null && (err.message.startsWith('JSON Parse error') || err.message === SERVER_UNDER_MAINTENANCE_ERROR.message);
};

const isTimeoutException = (err) => {
    return err != undefined && err != null && err.message === TIMEOUT_EXCEPTION_ERROR.message;
};

const isNotAuthorizedException = (err) => {
    return err != undefined && err != null && err.code === 401;
};

const promiseJson = res => res.json()
    .then(json => {
        if (res.ok) {
            return json;
        }
        let code = json.code;
        if (code === 401) {
            Storage.setSIOAuth(null).then((value) => {
                Actions.welcome({ refreshToken: Util.randomNumber() });
            })
        } else {
            throw json;
        }
    }).catch((err) => {
        if (isUnderMaintenance(err)) {
            throw SERVER_UNDER_MAINTENANCE_ERROR;
        }
    });

const errorCheck = res => {
    if (!res.ok) {
        return promiseJson(res);
    }
    return res;
};

const createXAuthHeader = sessionUser => {
    if (sessionUser) {
        return {
            headers: {
                'authorization': sessionUser,
            }
        };
    }
    return {};
};

const setPayload = (options, payload, isPost) => {
    options.headers = options.headers || {};
    options.headers['content-type'] = 'application/json';
    options.body = JSON.stringify(payload);
    options.method = isPost ? 'POST' : 'PUT';
};

const setFormData = (options, formData, isPost) => {
    options.body = formData;
    options.method = isPost ? 'POST' : 'PUT';
};

const esc = encodeURIComponent;

const query = params => '?' + Object.keys(params)
    .map(k => `${esc(k)}=${esc(params[k])}`)
    .join('&');

const xfetch = (...args) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => { reject(TIMEOUT_EXCEPTION_ERROR); }, 30000);
        fetch(...args).then(resolve, reject).catch((err) => {
            if (isTimeoutException(err)) {
                reject(err);
            }
            else throw err;
        })
    });
}

const xfetchTimed = (time, ...args) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => { reject(TIMEOUT_EXCEPTION_ERROR); }, time);
        fetch(...args).then(resolve, reject).catch((err) => {
            if (isTimeoutException(err)) {
                reject(err);
            }
            else throw err;
        })
    });
}

// NOTE for dev, for local self-signed cert on ios...
// SEE http://stackoverflow.com/a/36603479
const Ajax = {

    isUnderMaintenance: isUnderMaintenance,

    isTimeoutException: isTimeoutException,

    isNotAuthorizedException: isNotAuthorizedException,

    SERVER_UNDER_MAINTENANCE_ERROR: SERVER_UNDER_MAINTENANCE_ERROR,

    registerToken: async ({token, os, email, id}) => {
        let auth = await Storage.getAuthorizationHeader();
        const options = {};
        setPayload(options, { push_token: token, os, email, id }, true);
        try {
            res = await xfetch(pnUrl(['pushtokenregistration.php']), options);
            return null;
        } catch (err) {
            //Alert.alert(JSON.stringify(err));
            return err;
        }
    },

    removeToken: async ({token, os}) => {
        let auth = await Storage.getAuthorizationHeader();
        const options = {};
        setPayload(options, { push_token: token, os }, true);
        try {
            res = await xfetch(pnUrl(['pushtokenremove.php']), options);
            return null;
        } catch (err) {
            //Alert.alert(JSON.stringify(err));
            return err;
        }
    },

    emailExists: (email) => {
        return xfetch(url(['email']) + query({ email: email }))
            .then(promiseJson)
            .then(json => {
                return Promise.resolve(json.exists);
            });
    },

    usernameExists: (username) => {
        return xfetch(url(['username']) + query({ username: username }))
            .then(promiseJson)
            .then(json => {
                return Promise.resolve(json.exists);
            });
    },

    getFriends: (convoId = 0) => {
        return Storage.getAuthorizationHeader()
            .then(auth => {
                return xfetch(url(['friends']) + query({ convo: convoId }), createXAuthHeader(auth))
                    .then(promiseJson)
                    .then(json => {
                        return Promise.resolve(json);
                    });
            });
    },

    self: (oauth) => {
        return xfetch(url(['self']), createXAuthHeader(oauth))
            .then(promiseJson)
            .then(res => {
                return Promise.resolve(res);
            });
    },

    logout: (success, error) => {
        return Storage.getAuthorizationHeader()
            .then(auth => {
                const options = createXAuthHeader(auth);
                setPayload(options, {}, true);
                return xfetch(url(['logout']), options)
                    .then(errorCheck)
                    .then(res => {
                        return Promise.resolve();
                    });
            });
    },

    getTexts: (success, error) => {
        xfetch(url(['texts']))
            .then(promiseJson)
            .then(json => {
                success(json);
            })
            .catch(err => {
                error(err);
            });
    },

    deleteFollowing: (followerId, followingId, followingType, success, error) => {
        Storage.getAuthorizationHeader()
            .then(auth => {
                const options = createXAuthHeader(auth);
                options.method = 'DELETE';
                xfetch(url(['followings']) + query({
                        follower_id: followerId,
                        following_id: followingId,
                        following_type: followingType,
                    }), options)
                    .then(errorCheck)
                    .then(res => {
                        success();
                    })
                    .catch(err => {
                        error(err);
                    });
            });
    },
	
	getPushSettings: async (id) => {
        let auth = await Storage.getAuthorizationHeader();
        try {
            const data = await xfetch(url(['push-notifications', id]), createXAuthHeader(auth)).then(promiseJson);
            return data;
        } catch (err) {
            return err;
        }
	},
	
	setPushSettings: async (id, settings) => {
		try {
			let auth = await Storage.getAuthorizationHeader();
			const options = createXAuthHeader(auth);
			setPayload(options, settings, true);
			await xfetch(url(['push-notifications', id]), options).then(errorCheck);
			return null;
		} catch (err) {
			Alert.alert(JSON.stringify(err));
			return err;
		}
	},

    readAllNotifications(payload) {
        return Storage.getAuthorizationHeader()
            .then(auth => {
                const options = createXAuthHeader(auth);
                setPayload(options, payload, false);
                return xfetch(url(['notifications']), options)
                    .then(errorCheck)
                    .then(res => {
                        return Promise.resolve();
                    });
            });
    },

    deleteNotification(id, success, error) {
        Storage.getAuthorizationHeader()
            .then(auth => {
                const options = createXAuthHeader(auth);
                options.method = 'DELETE';
                xfetch(url(['notifications', id]), options)
                    .then(errorCheck)
                    .then(res => {
                        success();
                    })
                    .catch(err => {
                        error(err);
                    });
            });
    },

    getUserIdByNickname (nickname) {
        return xfetch(url(['users', 'nickname']) + query({nickname}))
        .then(promiseJson)
        .then(json => {
           return Promise.resolve(json);
        }).catch(err => {
            return Promise.resolve(null);
        });
    },

	getConvo: (id, success, error) => {
        Storage.getAuthorizationHeader()
            .then(auth => {
                xfetch(url(['convos', id]), createXAuthHeader(auth))
                    .then(promiseJson)
                    .then(data => {
                        let out = {};
						data.responses.forEach(item => {
							out[item._id] = { ...item, replies: [] };
						});
						let mainId = data._id;
						let xtop = [];
						xtop.push({
							_id: mainId,
							date: data.date,
							in_reply_to: "",
							replies: []
						});
						let foo = function (arr, depth) {
							for (let item of arr) {
								const keys = Object.keys(out);
								item.depth = depth;
								for (let key of keys) {
									if (item._id === out[key].in_reply_to || out[key].in_reply_to === "") {
										item.replies.push(JSON.parse(JSON.stringify(out[key])));
										delete out[key];
									}
								}
								item.replies.sort((a, b) => {
									return new Date(b.date) - new Date(a.date);
								});
								foo(item.replies, depth + 1);
							}
						}
						foo(xtop, 0);
						let replies = xtop[0].replies;
						let xout = [];
						let bar = (arr) => {
							for (let item of arr) {
								xout.push(item);
								bar(item.replies);
								item.replies = [];
							}
						}
						bar(replies);
						data.responses = xout;
						success(data);
                    }).catch(err => {
                        error(err);
                    });
            });
    },

    getConvoUrl: (id, success, error) => {
        xfetch(url(['convos', id, 'url']))
            .then(promiseJson)
            .then(json => {
                success(json);
            })
            .catch(err => {
                error(err);
            });
    },

    getFeed: (success, error, offset = 0) => {
        Storage.getAuthorizationHeader()
            .then(auth => {
                xfetch(url(['feed']) + query({offset: offset}), createXAuthHeader(auth))
                    .then(promiseJson)
                    .then(json => {
                        success(json);
                    })
                    .catch(err => {
                        error(err);
                    });
            });
    },

    getFollowings(followerId, followingId, followingType, success, error) {
        Storage.getAuthorizationHeader()
            .then(auth => {
                xfetch(url(['followings']) + query({
                        follower_id: followerId,
                        following_id: followingId,
                        following_type: followingType,
                    }), createXAuthHeader(auth))
                    .then(promiseJson)
                    .then(json => {
                        success(json);
                    })
                    .catch(err => {
                        error(err);
                    });
            });
    },

    getGroup: (id, success, error) => {
        Storage.getAuthorizationHeader()
            .then(auth => {
                xfetch(url(['groups', id]), createXAuthHeader(auth))
                    .then(promiseJson)
                    .then(json => {
                        success(json);
                    })
                    .catch(err => {
                        error(err);
                    });
            });
    },

    getGroupConvos: (id, success, error, offset = 0) => {
        Storage.getAuthorizationHeader()
            .then(auth => {
                xfetch(url(['convos', 'groups', id]) + query({offset: offset}), createXAuthHeader(auth))
                    .then(promiseJson)
                    .then(json => {
                        success(json);
                    })
                    .catch(err => {
                        error(err);
                    });
            });
    },

    getGroups: (success, error) => {
        Storage.getAuthorizationHeader()
            .then(auth => {
                xfetch(url(['groups']), createXAuthHeader(auth))
                    .then(promiseJson)
                    .then(json => {
                        success(json);
                    })
                    .catch(err => {
                        error(err);
                    });
            });
    },

    getFriendshipRequests() {
        return Storage.getAuthorizationHeader()
            .then(auth => {
                return xfetch(url(['notitifications', 'friendship']), createXAuthHeader(auth))
                    .then(promiseJson)
                    .then(json => {
                        return Promise.resolve(json);
                    });
            });
    },

    acceptFriendshipRequest(id, success, error) {
        Storage.getAuthorizationHeader()
            .then(auth => {
                const options = createXAuthHeader(auth);
                setPayload(options, {}, false);
                xfetch(url(['notitifications', 'friendship', id]), options)
                    .then(errorCheck)
                    .then(res => {
                        success();
                    })
                    .catch(err => {
                        error(err);
                    });
            });
    },

    declineFriendshipRequest(id, success, error) {
        Storage.getAuthorizationHeader()
            .then(auth => {
                const options = createXAuthHeader(auth);
                options.method = 'DELETE';
                setPayload(options, {}, false);
                xfetch(url(['notitifications', 'friendship', id]), options)
                    .then(errorCheck)
                    .then(res => {
                        success();
                    })
                    .catch(err => {
                        error(err);
                    });
            });
    },

    getNotifications() {
        return Storage.getAuthorizationHeader()
            .then(auth => {
                return xfetch(url(['notifications']), createXAuthHeader(auth))
                    .then(promiseJson)
                    .then(json => {
                        return Promise.resolve(json);
                    });
            });
    },

    getUser: (id, success, error) => {
        Storage.getAuthorizationHeader()
            .then(auth => {
                xfetch(url(['users', id]), createXAuthHeader(auth))
                    .then(promiseJson)
                    .then(json => {
                        success(json);
                    })
                    .catch(err => {
                        error(err);
                    });
            });
    },

    getUserConvos: (id, success, error, offset = 0) => {
        Storage.getAuthorizationHeader()
            .then(auth => {
                xfetch(url(['convos', 'users', id])+ query({offset: offset}), createXAuthHeader(auth))
                    .then(promiseJson)
                    .then(json => {
                        success(json);
                    })
                    .catch(err => {
                        error(err);
                    });
            });
    },

    login: (payload, success, error) => {
        const options = {};
        var xresponse;
        setPayload(options, payload, true);
        xfetch(url(['login']), options)
            .then((response) => {
                xresponse = response;
                return response.json();
            })
            .then(json => {
                if (xresponse.ok) {
                    Storage.setAuthorizationHeader(xresponse.headers.get('Authorization'))
                        .then(() => {
                            success(json, xresponse.headers.get('Authorization'));
                        });
                } else {
                    throw json;
                }
            })
            .catch(err => {
                if (err.message.startsWith('JSON Parse error')) {
                    error(SERVER_UNDER_MAINTENANCE_ERROR);
                } else {
                    error(err);
                }
            });
    },

    postConvo(payload, success, error) {
        Storage.getAuthorizationHeader()
            .then(auth => {
                const options = createXAuthHeader(auth);
                setPayload(options, payload, true);
                xfetch(url(['convos']), options)
                    .then(errorCheck)
                    .then(res => {
                        success();
                    })
                    .catch(err => {
                        error(err);
                    });
            });
    },

    postFollowing(payload, success, error) {
        Storage.getAuthorizationHeader()
            .then(auth => {
                const options = createXAuthHeader(auth);
                setPayload(options, payload, true);
                xfetch(url(['followings']), options)
                    .then(errorCheck)
                    .then(res => {
                        success();
                    })
                    .catch(err => {
                        error(err);
                    });
            });
    },

    postPasswordForgot(payload, success, error) {
        const options = {};
        setPayload(options, payload, true);
        xfetch(url(['password', 'forgot']), options)
            .then(errorCheck)
            .then(res => {
                success();
            })
            .catch(err => {
                error(err);
            });
    },

    postResponse(id, payload, success, error) {
        Storage.getAuthorizationHeader()
            .then(auth => {
                const options = createXAuthHeader(auth);
                setPayload(options, payload, true);
                xfetch(url(['convos', id, 'responses']), options)
                    .then(errorCheck)
                    .then(res => {
                        success();
                    })
                    .catch(err => {
                        error(err);
                    });
            });
    },

    postUser(payload, success, error) {
        const formData = new FormData();
        // BUG react-native multipart/form-data getParts() typeof null === object.
        // their code then tries to evaluate members from the "object",
        // which is null. right now, we mask out null values from being sent in the
        // form-data.
        // SEE https://github.com/facebook/react-native/issues/12251
        Object.keys(payload).forEach(k => {
            if (payload[k] !== null) {
                formData.append(k, payload[k]);
            }
        });
        const options = {};
        setFormData(options, formData, true);
        xfetch(url(['users']), options)
            .then(errorCheck)
            .then(res => {
                success();
            })
            .catch(err => {
                error(err);
            });
    },

    putNotification(id, payload, success, error) {
        Storage.getAuthorizationHeader()
            .then(auth => {
                const options = createXAuthHeader(auth);
                setPayload(options, payload, false);
                xfetch(url(['notifications', id]), options)
                    .then(errorCheck)
                    .then(res => {
                        success();
                    })
                    .catch(err => {
                        error(err);
                    });
            });
    },

    putPassword(id, payload, success, error) {
        Storage.getAuthorizationHeader()
            .then(auth => {
                const options = createXAuthHeader(auth);
                setPayload(options, payload, false);
                xfetch(url(['users', id, 'password']), options)
                    .then(errorCheck)
                    .then(res => {
                        success();
                    })
                    .catch(err => {
                        error(err);
                    });
            });
    },

    putUser(_id, payload, success, error) {
        Storage.getAuthorizationHeader()
            .then(auth => {
                const options = createXAuthHeader(auth);
                const formData = new FormData();
                // BUG react-native multipart/form-data getParts() typeof null === object.
                // their code then tries to evaluate members from the "object",
                // which is null. right now, we mask out null values from being sent in the
                // form-data.
                // SEE https://github.com/facebook/react-native/issues/12251
                Object.keys(payload).forEach(k => {
                    if (payload[k] !== null && payload[k] != undefined && !(typeof(payload) === 'string' && payload[k].trim() === "")) {
                        formData.append(k, payload[k]);
                    }
                });
                setFormData(options, formData, false);
                xfetchTimed(50000, url(['users', _id]), options)
                    .then(errorCheck)
                    .then(promiseJson)
                    .then(json => {
                        success(json);
                    })
                    .catch(err => {
                        error(err);
                    });
            });
    },

};

export { Ajax };
