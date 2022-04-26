// require('dotenv').config();
// const fs = require('fs');
// const mkdirp = require('mkdirp');
// const request = require('request');
// const AdmZip = require('adm-zip');

// const zipFile = `${__dirname}/../temp/pinsight.zip`;
// const unzipDest = `${__dirname}/../pinsight/ios`;

// // NOTE list all react-native 3rd-party linked projects' build.gradle paths
// // that require their buildToolsVersion updated to the major rev declared in
// // in the env var ANDROID_BUILD_TOOLS_VERSION.
// const reactNativeConfigBuildGradle = `${__dirname}/../node_modules/react-native-config/android/build.gradle`;
// const reactNativeImagePickerBuildGradle = `${__dirname}/../node_modules/react-native-image-picker/android/build.gradle`;

// mkdirp.sync(`${__dirname}/../temp`);

// request({ uri: process.env.PINSIGHT_IOS_ZIP, encoding: null, }, (err, res, body) => {
//     if (err) throw err;
//     fs.writeFile(zipFile, body, err => {
//         if (err) throw err;
//         const zip = new AdmZip(zipFile);
//         zip.extractEntryTo('PSMAdKitSDK/PSMAdKit/', unzipDest, false, true);
//     });
// });

// const buildToolsVersionUpdate = buildGradleFilePath => {
//     const buildToolsVersionRegex = /buildToolsVersion ('|")(.+)('|")/;
//     fs.readFile(buildGradleFilePath, { encoding: 'utf8' }, (err, data) => {
//         if (err) throw err;
//         const buildGradle = data.replace(buildToolsVersionRegex, `buildToolsVersion '${process.env.ANDROID_BUILD_TOOLS_VERSION}'`);
//         fs.writeFile(buildGradleFilePath, buildGradle, { encoding: 'utf8' }, err => {
//             if (err) throw err;
//         })
//     });
// };

// buildToolsVersionUpdate(reactNativeConfigBuildGradle);
// buildToolsVersionUpdate(reactNativeImagePickerBuildGradle);
