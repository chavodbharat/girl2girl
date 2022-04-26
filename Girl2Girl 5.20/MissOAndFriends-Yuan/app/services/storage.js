import { Alert } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import EventEmitter from 'wolfy87-eventemitter';
import type { SessionUser } from './../decls/session-user';
import SInfo from 'react-native-sensitive-info';
import { Util } from './util';

const serialize = (obj) => {
    return JSON.stringify(obj);
};

const parse = (str) => {
    return JSON.parse(str);
};

const APP_KEY= '@MOAF';

const KEYS = {
    AUTHORIZATION:  `${APP_KEY}:AUTHORIZATION`,
    SCENE_COUNT:    `${APP_KEY}:SCENE_COUNT`,
    SESSION_USER:   `${APP_KEY}:SESSION_USER`,
    NEEDS_RELOAD:   `${APP_KEY}:NEEDS_RELOAD`,
    QT_WAS_VISITED: `${APP_KEY}:QT_WAS_VISITED`,
    PN_WAS_VISITED: `${APP_KEY}:PN_WAS_VISITED`,
    REQ_PLC_AGRMNT: `${APP_KEY}:REQ_PLC_AGRMNT`
};

let sceneCnt = 0;

const MOAF_EVENTS = {
    SESSION_USER_SET: 'SESSION_USER_SET',
};

let eventEmitter = new EventEmitter();

const SIOptions = {
    sharedPreferencesName: 'Missoandfriends',
    keychainService:       'Missoandfriends'
};

const SIKey = "oauth";

const Storage = {

    ifNeedsPolicyAgreement (): Promise {
        if (Util.isAndroid()) {
            return Promise.resolve(false);
        }
        return AsyncStorage.getItem(KEYS.REQ_PLC_AGRMNT)
            .then((value) => {
                return Promise.resolve(value == null);
            });
    },

    async setPolicyWasAgreed (): Promise {
        await this.setString(KEYS.REQ_PLC_AGRMNT, "true");  
    },

    setSIOAuth (data: any): Promise {
        return SInfo.setItem(SIKey, data, SIOptions);
    },

    getSIOAuth (): Promise {
        return SInfo.getItem(SIKey, SIOptions).then((value) => {            
            return Promise.resolve(value);
        }).catch((err) => {            
            return Promise.resolve(null);
        });
    },

    clearSIOAuth () {
        SInfo.deleteItem(SIKey, SIOptions);
    },

    async setNeedsReload (): void {
        try {
            await this.setString(KEYS.NEEDS_RELOAD, "true");            
        } catch (e) {
            throw e;
        }
    },

    qtWasVisited(): Promise {
        try {
            return AsyncStorage.getItem(KEYS.QT_WAS_VISITED);            
        } catch (e) {
            throw e;
        }
    },

    visitQT(): Promise {
        return AsyncStorage.setItem(KEYS.QT_WAS_VISITED, 'true');
    },
	
	pnWasVisited(): Promise {
        try {
            return AsyncStorage.getItem(KEYS.PN_WAS_VISITED);            
        } catch (e) {
            throw e;
        }
    },

    visitPN(): Promise {
        return AsyncStorage.setItem(KEYS.PN_WAS_VISITED, 'true');
    },

    needsReload(): Promise {
        try {
            return AsyncStorage.getItem(KEYS.NEEDS_RELOAD);            
        } catch (e) {
            throw e;
        }
    },

    async removeNeedsRealod(): void {
        try {
            await this.removeItem(KEYS.NEEDS_RELOAD);
        } catch (e) {
            throw e;
        }
    },

    async getItem(key: string): string {
        try {
            const str = await AsyncStorage.getItem(key);
            return str;
        } catch (e) {
            throw e;
        }
    },

    async removeItem(key: string): string {
        try {
            await AsyncStorage.removeItem(key);
        } catch (e) {
            throw e;
        }
    },

    async setString(key: string, value: string): void {
        try {
            await AsyncStorage.setItem(key, value);
        } catch (e) {
            throw e;
        }
    },

    async setObject(key: string, value: any): void {
        try {
            await this.setString(key, serialize(value));
        } catch (e) {
            throw e;
        }
    },

    async addScene(): void {
        try {
            sceneCnt += 1;
            await AsyncStorage.setItem(KEYS.SCENE_COUNT, serialize(sceneCnt));
        } catch (e) {
            throw e;
        }
    },

    async getAuthorizationHeader(): string {
        try {
            return await this.getItem(KEYS.AUTHORIZATION);
        } catch (e) {
            throw e;
        }
    },

    async getSceneCount(): number {
        try {
            const str = await this.getItem(KEYS.SCENE_COUNT);
            return parseInt(str, 10);
        } catch (e) {
            throw e;
        }
    },

    async getSessionUser(): SessionUser {
        try {
            const str = await this.getItem(KEYS.SESSION_USER);
            return parse(str);
        } catch (e) {
            throw e;
        }
    },

    async removeAll(): void {
        try {
            await this.removeAuthorizationHeader();
            await this.removeSessionUser();
            await this.resetSceneCount();
            await this.removeNeedsRealod();
        } catch (e) {
            throw e;
        }
    },

    async removeAuthorizationHeader(): void {
        try {
            await this.removeItem(KEYS.AUTHORIZATION);
        } catch (e) {
            throw e;
        }
    },

    async removeSessionUser(): void {
        try {
            await this.removeItem(KEYS.SESSION_USER);
            eventEmitter.emitEvent(MOAF_EVENTS.SESSION_USER_SET, [null]);
        } catch (e) {
            throw e;
        }
    },

    async resetSceneCount(): void {
        try {
            sceneCnt = 0;
            await this.removeItem(KEYS.SCENE_COUNT);
        } catch (e) {
            throw e;
        }
    },

    async setAuthorizationHeader(value: string): void {
        try {
            return await this.setString(KEYS.AUTHORIZATION, value);
        } catch (e) {
            throw e;
        }
    },

    async setSessionUser(user: SessionUser): void {
        try {
            await this.setObject(KEYS.SESSION_USER, user);
            eventEmitter.emitEvent(MOAF_EVENTS.SESSION_USER_SET, [user]);
        } catch (e) {
            throw e;
        }
    },

    addSessionUserListener(listener): void {
        eventEmitter.addListener(MOAF_EVENTS.SESSION_USER_SET, listener);
        this.getSessionUser()
            .then(user => {
                listener(user);
            });
    },

    removeSessionUserListener(listener): void {
        eventEmitter.removeListener(MOAF_EVENTS.SESSION_USER_SET, listener);
    },

};

export { Storage };
