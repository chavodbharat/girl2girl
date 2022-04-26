import { Platform, StyleSheet } from 'react-native';

const isAndroid = Platform.OS === 'android';
const isIOS = Platform.OS === 'ios';

const ColorPalette = {
    moafBlack: '#2a162e',
    moafDarkGray: '#494848',
    moafLightGray: '#9a9a9a',
	moafBorder: '#eeeeee',
    moafWhite: '#ffffff',
    moafDarkPurple: '#541fbf',
    moafPlum: '#cc33ff',
    moafMagenta: '#e85be8',
    moafLightPurple: '#d08aff',
    moafSoftPink: '#f4b3e2',
    moafRed: '#ff0000',
    moafBrick: '#e3007b',
    moafOrange: '#f77e41',
    moafLime: '#9ee542',
    moafSkyBlue: '#33ccff',
    moafTurquoise: '#00c3d8',
    moafAqua: '#33cccc',
};

export { ColorPalette };

const flex = (unit: number): any => {
    return {
        flex: unit,
    };
};

const flexLayout = (dir: string, gridNumber: number): any => {
    const style = {
        flexDirection: dir,
    };
    const layout = {
        alignItems: '',
        justifyContent: '',
    };
    if (dir === 'row') {
        if (gridNumber === 1 || gridNumber === 2 || gridNumber === 3) {
            layout.alignItems = 'flex-start';
        }
        if (gridNumber === 4 || gridNumber === 5 || gridNumber === 6) {
            layout.alignItems = 'center';
        }
        if (gridNumber === 7 || gridNumber === 8 || gridNumber === 9) {
            layout.alignItems = 'flex-end';
        }
        if (gridNumber === 1 || gridNumber === 4 || gridNumber === 7) {
            layout.justifyContent = 'flex-start';
        }
        if (gridNumber === 2 || gridNumber === 5 || gridNumber === 8) {
            layout.justifyContent = 'center';
        }
        if (gridNumber === 3 || gridNumber === 6 || gridNumber === 9) {
            layout.justifyContent = 'flex-end';
        }
    } else if (dir === 'column') {
        if (gridNumber === 1 || gridNumber === 2 || gridNumber === 3) {
            layout.justifyContent = 'flex-start';
        }
        if (gridNumber === 4 || gridNumber === 5 || gridNumber === 6) {
            layout.justifyContent = 'center';
        }
        if (gridNumber === 7 || gridNumber === 8 || gridNumber === 9) {
            layout.justifyContent = 'flex-end';
        }
        if (gridNumber === 1 || gridNumber === 4 || gridNumber === 7) {
            layout.alignItems = 'flex-start';
        }
        if (gridNumber === 2 || gridNumber === 5 || gridNumber === 8) {
            layout.alignItems = 'center';
        }
        if (gridNumber === 3 || gridNumber === 6 || gridNumber === 9) {
            layout.alignItems = 'flex-end';
        }
    }
    return Object.assign({}, style, layout);
};

const flexGrow = (size: number): any => {
    return {
        flexGrow: size,
    }
};

const flexShrink = (size: number): any => {
    return {
        flexShrink: size,
    }
};

const paddingLeft = (dip: number): any => {
    return {
        paddingLeft: dip,
    };
};

const paddingRight = (dip: number): any => {
    return {
        paddingRight: dip,
    };
};

const paddingHoriz = (dip: number): any => {
    return Object.assign({}, paddingLeft(dip), paddingRight(dip));
};

const paddingBottom = (dip: number): any => {
    return {
        paddingBottom: dip,
    };
};

const paddingTop = (dip: number): any => {
    return {
        paddingTop: dip,
    };
};

const paddingVert = (dip: number): any => {
    return Object.assign({}, paddingBottom(dip), paddingTop(dip));
};

const padding = (dip: number): any => {
    return Object.assign({}, paddingHoriz(dip), paddingVert(dip));
};

const marginLeft = (dip: number): any => {
    return {
        marginLeft: dip,
    };
};

const marginRight = (dip: number): any => {
    return {
        marginRight: dip,
    };
};

const marginHoriz = (dip: number): any => {
    return Object.assign({}, marginLeft(dip), marginRight(dip));
};

const marginBottom = (dip: number): any => {
    return {
        marginBottom: dip,
    };
};

const marginTop = (dip: number): any => {
    return {
        marginTop: dip,
    };
};

const marginVert = (dip: number): any => {
    return Object.assign({}, marginBottom(dip), marginTop(dip));
};

const margin = (dip: number): any => {
    return Object.assign({}, marginHoriz(dip), marginVert(dip));
};

const GlobalStyles = StyleSheet.create({
    colorBlack: {
        color: ColorPalette.moafBlack,
    },
    bgColorBlack: {
        backgroundColor: ColorPalette.moafBlack,
    },
    colorDarkGray: {
        color: ColorPalette.moafDarkGray,
    },
    bgColorDarkGray: {
        backgroundColor: ColorPalette.moafDarkGray,
    },
    colorLightGray: {
        color: ColorPalette.moafLightGray,
    },
    bgColorLightGray: {
        backgroundColor: ColorPalette.moafLightGray,
    },
    colorWhite: {
        color: ColorPalette.moafWhite,
    },
    bgColorWhite: {
        backgroundColor: ColorPalette.moafWhite,
    },
    colorDarkPurple: {
        color: ColorPalette.moafDarkPurple,
    },
    bgColorDarkPurple: {
        backgroundColor: ColorPalette.moafDarkPurple,
    },
    colorPlum: {
        color: ColorPalette.moafPlum,
    },
    bgColorPlum: {
        backgroundColor: ColorPalette.moafPlum,
    },
    colorMagenta: {
        color: ColorPalette.moafMagenta,
    },
    bgColorMagenta: {
        backgroundColor: ColorPalette.moafMagenta,
    },
    colorLightPurple: {
        color: ColorPalette.moafLightPurple,
    },
    bgColorLightPurple: {
        backgroundColor: ColorPalette.moafLightPurple,
    },
    colorSoftPink: {
        color: ColorPalette.moafSoftPink,
    },
    bgColorSoftPink: {
        backgroundColor: ColorPalette.moafSoftPink,
    },
    colorRed: {
        color: ColorPalette.moafRed,
    },
    bgColorRed: {
        backgroundColor: ColorPalette.moafRed,
    },
    colorBrick: {
        color: ColorPalette.moafBrick,
    },
    bgColorBrick: {
        backgroundColor: ColorPalette.moafBrick,
    },
    colorOrange: {
        color: ColorPalette.moafOrange,
    },
    bgColorOrange: {
        backgroundColor: ColorPalette.moafOrange,
    },
    colorLime: {
        color: ColorPalette.moafLime,
    },
    bgColorLime: {
        backgroundColor: ColorPalette.moafLime,
    },
    colorTurquoise: {
        color: ColorPalette.moafTurquoise,
    },
    bgColorTurquoise: {
        backgroundColor: ColorPalette.moafTurquoise,
    },
    colorAqua: {
        color: ColorPalette.moafAqua,
    },
    bgColorAqua: {
        backgroundColor: ColorPalette.moafAqua,
    },
    colorSkyBlue: {
        color: ColorPalette.moafSkyBlue,
    },
    bgColorSkyBlue: {
        backgroundColor: ColorPalette.moafSkyBlue,
    },
    flex1: flex(1),
    flex2: flex(2),
    flex3: flex(3),
    flex4: flex(4),
    flex5: flex(5),
    flex6: flex(6),
    flex7: flex(7),
    flex8: flex(8),
    flex9: flex(9),
    flexRow1: flexLayout('row', 1),
    flexRow2: flexLayout('row', 2),
    flexRow3: flexLayout('row', 3),
    flexRow4: flexLayout('row', 4),
    flexRow5: flexLayout('row', 5),
    flexRow6: flexLayout('row', 6),
    flexRow7: flexLayout('row', 7),
    flexRow8: flexLayout('row', 8),
    flexRow9: flexLayout('row', 9),
    flexCol1: flexLayout('column', 1),
    flexCol2: flexLayout('column', 2),
    flexCol3: flexLayout('column', 3),
    flexCol4: flexLayout('column', 4),
    flexCol5: flexLayout('column', 5),
    flexCol6: flexLayout('column', 6),
    flexCol7: flexLayout('column', 7),
    flexCol8: flexLayout('column', 8),
    flexCol9: flexLayout('column', 9),
    flexGrow0: flexGrow(0),
    flexGrow1: flexGrow(1),
    flexGrow2: flexGrow(2),
    flexGrow3: flexGrow(3),
    flexGrow4: flexGrow(4),
    flexGrow5: flexGrow(5),
    flexGrow6: flexGrow(6),
    flexGrow7: flexGrow(7),
    flexGrow8: flexGrow(8),
    flexGrow9: flexGrow(9),
    flexShrink0: flexShrink(0),
    flexShrink1: flexShrink(1),
    flexShrink2: flexShrink(2),
    flexShrink3: flexShrink(3),
    flexShrink4: flexShrink(4),
    flexShrink5: flexShrink(5),
    flexShrink6: flexShrink(6),
    flexShrink7: flexShrink(7),
    flexShrink8: flexShrink(8),
    flexShrink9: flexShrink(9),
    flexWrap: {
        flexWrap: 'wrap',
    },
    flexSpaceAround: {
        justifyContent: 'space-around',
    },
    flexSpaceBetween: {
        justifyContent: 'space-between',
    },
    flexStretch: {
        alignSelf: 'stretch',
    },
    marginB1: marginBottom(1),
    marginB2: marginBottom(2),
    marginB3: marginBottom(3),
    marginB4: marginBottom(4),
    marginB5: marginBottom(5),
    marginB6: marginBottom(6),
    marginB7: marginBottom(7),
    marginB8: marginBottom(8),
    marginB9: marginBottom(9),
    marginB10: marginBottom(10),
    marginB11: marginBottom(11),
    marginB12: marginBottom(12),
    marginB13: marginBottom(13),
    marginB14: marginBottom(14),
    marginB15: marginBottom(15),
    marginL1: marginLeft(1),
    marginL2: marginLeft(2),
    marginL3: marginLeft(3),
    marginL4: marginLeft(4),
    marginL5: marginLeft(5),
    marginL6: marginLeft(6),
    marginL7: marginLeft(7),
    marginL8: marginLeft(8),
    marginL9: marginLeft(9),
    marginL10: marginLeft(10),
    marginL11: marginLeft(11),
    marginL12: marginLeft(12),
    marginL13: marginLeft(13),
    marginL14: marginLeft(14),
    marginL15: marginLeft(15),
    marginR1: marginRight(1),
    marginR2: marginRight(2),
    marginR3: marginRight(3),
    marginR4: marginRight(4),
    marginR5: marginRight(5),
    marginR6: marginRight(6),
    marginR7: marginRight(7),
    marginR8: marginRight(8),
    marginR9: marginRight(9),
    marginR10: marginRight(10),
    marginR11: marginRight(11),
    marginR12: marginRight(12),
    marginR13: marginRight(13),
    marginR14: marginRight(14),
    marginR15: marginRight(15),
    marginT1: marginTop(1),
    marginT2: marginTop(2),
    marginT3: marginTop(3),
    marginT4: marginTop(4),
    marginT5: marginTop(5),
    marginT6: marginTop(6),
    marginT7: marginTop(7),
    marginT8: marginTop(8),
    marginT9: marginTop(9),
    marginT10: marginTop(10),
    marginT11: marginTop(11),
    marginT12: marginTop(12),
    marginT13: marginTop(13),
    marginT14: marginTop(14),
    marginT15: marginTop(15),
    marginH1: marginHoriz(1),
    marginH2: marginHoriz(2),
    marginH3: marginHoriz(3),
    marginH4: marginHoriz(4),
    marginH5: marginHoriz(5),
    marginH6: marginHoriz(6),
    marginH7: marginHoriz(7),
    marginH8: marginHoriz(8),
    marginH9: marginHoriz(9),
    marginH10: marginHoriz(10),
    marginH11: marginHoriz(11),
    marginH12: marginHoriz(12),
    marginH13: marginHoriz(13),
    marginH14: marginHoriz(14),
    marginH15: marginHoriz(15),
    marginV1: marginVert(1),
    marginV2: marginVert(2),
    marginV3: marginVert(3),
    marginV4: marginVert(4),
    marginV5: marginVert(5),
    marginV6: marginVert(6),
    marginV7: marginVert(7),
    marginV8: marginVert(8),
    marginV9: marginVert(9),
    marginV10: marginVert(10),
    marginV11: marginVert(11),
    marginV12: marginVert(12),
    marginV13: marginVert(13),
    marginV14: marginVert(14),
    marginV15: marginVert(15),
    margin1: margin(1),
    margin2: margin(2),
    margin3: margin(3),
    margin4: margin(4),
    margin5: margin(5),
    margin6: margin(6),
    margin7: margin(7),
    margin8: margin(8),
    margin9: margin(9),
    margin10: margin(10),
    margin11: margin(11),
    margin12: margin(12),
    margin13: margin(13),
    margin14: margin(14),
    margin15: margin(15),
    paddingB1: paddingBottom(1),
    paddingB2: paddingBottom(2),
    paddingB3: paddingBottom(3),
    paddingB4: paddingBottom(4),
    paddingB5: paddingBottom(5),
    paddingB6: paddingBottom(6),
    paddingB7: paddingBottom(7),
    paddingB8: paddingBottom(8),
    paddingB9: paddingBottom(9),
    paddingB10: paddingBottom(10),
    paddingB11: paddingBottom(11),
    paddingB12: paddingBottom(12),
    paddingB13: paddingBottom(13),
    paddingB14: paddingBottom(14),
    paddingB15: paddingBottom(15),
    paddingL1: paddingLeft(1),
    paddingL2: paddingLeft(2),
    paddingL3: paddingLeft(3),
    paddingL4: paddingLeft(4),
    paddingL5: paddingLeft(5),
    paddingL6: paddingLeft(6),
    paddingL7: paddingLeft(7),
    paddingL8: paddingLeft(8),
    paddingL9: paddingLeft(9),
    paddingL10: paddingLeft(10),
    paddingL11: paddingLeft(11),
    paddingL12: paddingLeft(12),
    paddingL13: paddingLeft(13),
    paddingL14: paddingLeft(14),
    paddingL15: paddingLeft(15),
    paddingR1: paddingRight(1),
    paddingR2: paddingRight(2),
    paddingR3: paddingRight(3),
    paddingR4: paddingRight(4),
    paddingR5: paddingRight(5),
    paddingR6: paddingRight(6),
    paddingR7: paddingRight(7),
    paddingR8: paddingRight(8),
    paddingR9: paddingRight(9),
    paddingR10: paddingRight(10),
    paddingR11: paddingRight(11),
    paddingR12: paddingRight(12),
    paddingR13: paddingRight(13),
    paddingR14: paddingRight(14),
    paddingR15: paddingRight(15),
    paddingT1: paddingTop(1),
    paddingT2: paddingTop(2),
    paddingT3: paddingTop(3),
    paddingT4: paddingTop(4),
    paddingT5: paddingTop(5),
    paddingT6: paddingTop(6),
    paddingT7: paddingTop(7),
    paddingT8: paddingTop(8),
    paddingT9: paddingTop(9),
    paddingT10: paddingTop(10),
    paddingT11: paddingTop(11),
    paddingT12: paddingTop(12),
    paddingT13: paddingTop(13),
    paddingT14: paddingTop(14),
    paddingT15: paddingTop(15),
    paddingH1: paddingHoriz(1),
    paddingH2: paddingHoriz(2),
    paddingH3: paddingHoriz(3),
    paddingH4: paddingHoriz(4),
    paddingH5: paddingHoriz(5),
    paddingH6: paddingHoriz(6),
    paddingH7: paddingHoriz(7),
    paddingH8: paddingHoriz(8),
    paddingH9: paddingHoriz(9),
    paddingH10: paddingHoriz(10),
    paddingH11: paddingHoriz(11),
    paddingH12: paddingHoriz(12),
    paddingH13: paddingHoriz(13),
    paddingH14: paddingHoriz(14),
    paddingH15: paddingHoriz(15),
    paddingV1: paddingVert(1),
    paddingV2: paddingVert(2),
    paddingV3: paddingVert(3),
    paddingV4: paddingVert(4),
    paddingV5: paddingVert(5),
    paddingV6: paddingVert(6),
    paddingV7: paddingVert(7),
    paddingV8: paddingVert(8),
    paddingV9: paddingVert(9),
    paddingV10: paddingVert(10),
    paddingV11: paddingVert(11),
    paddingV12: paddingVert(12),
    paddingV13: paddingVert(13),
    paddingV14: paddingVert(14),
    paddingV15: paddingVert(15),
    padding1: padding(1),
    padding2: padding(2),
    padding3: padding(3),
    padding4: padding(4),
    padding5: padding(5),
    padding6: padding(6),
    padding7: padding(7),
    padding8: padding(8),
    padding9: padding(9),
    padding10: padding(10),
    padding11: padding(11),
    padding12: padding(12),
    padding13: padding(13),
    padding14: padding(14),
    padding15: padding(15),
    bold: {
        fontWeight: '800',
    },
    textCenter: {
        textAlign: 'center',
    },
    textJustify: {
        textAlign: 'justify',
    },
    textLeft: {
        textAlign: 'left',
    },
    textRight: {
        textAlign: 'right',
    },
    welcomeLogo: {
        height: 100,
        resizeMode: 'cover',
        width: 100,
    },
    girl2girlLogo: {
        height: 145,
        overflow: 'visible',
        resizeMode: 'contain',
    },
    h1: {
        fontFamily: 'raleway',
        fontSize: 48,
        fontWeight: '600',
    },
    btn: StyleSheet.flatten([flexLayout('row', 5), {
        alignSelf: 'stretch',
        borderColor: ColorPalette.moafWhite,
        borderRadius: 6,
        borderWidth: 2,
        height: 45,
        overflow: 'hidden',
    }]),
    btnText: {
        color: ColorPalette.moafWhite,
        fontFamily: 'raleway',
        fontSize: 19,
        fontWeight: '500',
    },
    header: {
        alignItems: 'center',
        alignSelf: 'stretch',
        height: 80,
        justifyContent: 'center',
        paddingTop: 10,
    },
    footer: {
        alignItems: 'center',
        alignSelf: 'stretch',
        height: 80,
        justifyContent: 'center',
        bottom: 0,
    },
    headerText: {
        color: ColorPalette.moafWhite,
        fontFamily: 'raleway',
        fontSize: isAndroid ? 20 : 18,
        fontWeight: '700',
    },
    text: {
        color: ColorPalette.moafBlack,
        fontFamily: 'Raleway-Regular',
        fontSize: 16,
        fontWeight: isAndroid ? '400' : '500',
    },
    textBiAction: {
        color: ColorPalette.moafWhite,
        fontFamily: 'Raleway-Regular',
        fontSize: 16,
        fontWeight: isAndroid ? '400' : '500',
    },
    textNoGroups: {
        color: ColorPalette.moafBlack,
        fontFamily: 'Raleway-Regular',
        fontSize: 16,
        fontWeight: isAndroid ? '400' : '500',
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 10
    },
    textInput: {
        alignSelf: 'stretch',
        backgroundColor: ColorPalette.moafWhite,
        borderRadius: 6,
        fontFamily: 'Raleway-Regular',
        fontSize: 16,
        fontWeight: '400',
        height: 45,
        marginTop: 10,
        paddingLeft: 10,
        paddingRight: 10,
    },
    textInputMultiline: {
        alignSelf: 'stretch',
        backgroundColor: ColorPalette.moafWhite,
        borderRadius: 6,
        fontFamily: 'Raleway-Regular',
        fontSize: 16,
        fontWeight: '400',
        height: 90,
        marginTop: 10,
        paddingLeft: 10,
        paddingRight: 10,
        textAlignVertical: isIOS ? 'auto': 'top',
    },
    select: Object.assign({}, {
        alignSelf: 'stretch',
        borderColor: ColorPalette.moafWhite,
        backgroundColor: ColorPalette.moafWhite,
        borderRadius: 6,
        fontFamily: 'raleway',
        fontSize: 16,
        fontWeight: '400',
        height: 45,
        marginTop: 10,
        overflow: 'hidden',
        paddingLeft: 10,
        paddingRight: 10,
        textAlignVertical: 'center',
    }, isIOS ? { lineHeight: 45 } : {}),
    selectPh: {
        color: ColorPalette.moafLightGray,
        fontFamily: 'raleway',
        fontSize: 16,
        fontWeight: isIOS ? '400' : '300',
    },
    convoText: {
        color: ColorPalette.moafBlack,
        fontFamily: 'Raleway-Regular',
        fontSize: isAndroid ? 16 : 15,
        fontWeight: isAndroid ? '400' : '500',
    },
    since: {
        color: ColorPalette.moafLightGray,
        fontFamily: 'Raleway-Regular',
        fontSize: isAndroid ? 12 : 11,
    },
    smallText: {
        fontFamily: 'Raleway-Regular',
        fontSize: isAndroid ? 12 : 11,
        textAlignVertical: isAndroid ? 'bottom': 'auto',
    },
    username: {
        color: ColorPalette.moafMagenta,
        fontFamily: 'Raleway-Regular',
        fontWeight: '800',
        marginTop: isAndroid ? -1 : 0,
        textAlignVertical: isAndroid ? 'bottom': 'auto',
    },
    guestText: {
        fontFamily: 'Raleway-Regular',
        fontSize: 24,
        fontWeight: isAndroid ? '400' : '500',
        lineHeight: 32,
    },
    avatarOffsetCont: {
        alignSelf: 'stretch',
        height: 115,
        overflow: 'visible',
    },
    avatar: {
        height: 100,
        overflow: 'visible',
        resizeMode: 'cover',
        width: 100,
    },
    avatarPhoto: {
        borderColor: 'white',
        borderRadius: 50,
        borderWidth: 3,
        overflow: 'hidden',
        resizeMode: 'cover',
    },
    debug: {
        borderColor: 'black',
        borderWidth: 1,
    }
});

export { GlobalStyles };
