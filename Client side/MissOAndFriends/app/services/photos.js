import ImagePicker from 'react-native-image-picker';

const options = {
    allowsEditing: true,
    cancelButtonTitle: 'Cancel',
    chooseFromLibraryButtonTitle: 'From Library',
    mediaType: 'photo',
    noData: true,
    permissionDenied: {
        okTitle: 'OK',
        reTryTitle: 'Retry',
        text: 'We need your camera and photo permissions.',
        title: 'Oops!'
    },
    storageOptions: {
        cameraRoll: true,
        skipBackup: true,
        waitUntilSaved: true,
    },
    takePhotoButtonTitle: 'Take Photo',
    title: 'Choose Your Avatar',
};

const Photos = {

    getPhoto(cb) {
        const payload = {
            error: null,
            uri: null,
        };
        ImagePicker.showImagePicker(options, res => {
            if (res.didCancel) {
                // nothing
            } else if (res.error) {
                payload.error = res.error;
            } else {
                payload.uri = res.uri;
            }
            cb(payload);
        });
    },

};

export { Photos };
