import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, TouchableHighlight, View, Text } from 'react-native';
import { GlobalStyles as GS, ColorPalette as CP } from './../../styles';
import { requireNativeComponent, findNodeHandle } from 'react-native';
import { Util } from '../services/util';
const NativeModules = require('NativeModules');
const AdViewFunctions = NativeModules.AdView;

class AdMrec extends React.Component {

    props: {
        email: string;
    };

    state: {
        bg: boolean;
        anyVar: any;
        sh: number;
        started: boolean;
        startedBefore: boolean;

        nodeHandle: number;
    };
	
	async xsetState (state) {
		let self = this;
		return new Promise((resolve) => {
			self.setState(state, resolve);
		})
	}

    constructor(props: any) {
        super(props);
        this.state = {
            bg: true,
            sh: Util.getScreenHeight(),
            started: false,
            startedBefore: false,
            anyVar: setInterval(async () => {
                await this.xsetState({bg: !this.state.bg});
                this.viewCmp.measure(async (fx, fy, width, height, px, py) => {
                    if (py == undefined || py == 0 || py > this.state.sh || py + height < 0) {
                        if (this.state.started) {
                            this.pauseAdView();
                            await this.xsetState({started: false});
                        }
                    } else {
                        if (!this.state.started) {

                            if (this.state.startedBefore) {
                                this.resumeAdView();
                            }
                            else {
                                this.startAdView();
                            }
                            await this.xsetState({started: true, startedBefore: true});
                        }
                    }
                });
            }, 200)
        };
        
    }

    componentDidMount() {
        this.setState({nodeHandle: findNodeHandle(this.nativeCmp)});
    }

    componentWillUnmount() {
        if (this.state.anyVar) {
            clearInterval(this.state.anyVar);
        }        
    }

    startAdView() {
        AdViewFunctions.startAdView(this.state.nodeHandle);
    }

    resumeAdView() {
        AdViewFunctions.resumeAdView(this.state.nodeHandle);
    }

    pauseAdView() {
        AdViewFunctions.pauseAdView(this.state.nodeHandle);
    }

    render() {
        const identifier = this.state.nodeHandle;

        return (
            <View style={[GS.flexStretch, GS.flexCol2, styles.cont]} ref={cmp => this.viewCmp = cmp}>
                <PSMMrecAdView 
                ref={cmp => this.nativeCmp = cmp}
                {...this.props} style={{width: 300, height: 250, backgroundColor: "#ffffff"}} />
                {this.state.bg ? <Text style={{color:"#ffffff", fontSize:1}}>&nbsp;</Text> : <Text style={{color:"#ffffff", fontSize:1}}>&nbsp;&nbsp;</Text>}
            </View>
        );
    }
}

AdMrec.propTypes = {
    email: PropTypes.string.isRequired,
    ...View.propTypes,
};

const styles = StyleSheet.create({
    cont: {
        borderBottomColor: CP.moafWhite,
        borderBottomWidth: 1,
        paddingBottom: 10,
        paddingTop: 10,
    },
});

const PSMMrecAdView = requireNativeComponent('PSMMrecAdView', AdMrec);

export { AdMrec };
