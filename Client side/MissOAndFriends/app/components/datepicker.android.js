import React from 'react';
import PropTypes from 'prop-types';
import { DatePickerAndroid } from 'react-native';

class MoafDatePicker extends React.Component {

    props: {
        onChange: Function;
        onClose: Function;
        selectedDate: Date;
    };

    state: {
        selection: Date;
    };

    constructor(props) {
        super(props);
        const now = new Date();
        now.setFullYear(now.getFullYear() - 8);
        this.state = {
            selection: this.props.selectedDate || now,
        };
        this.maxDate = new Date();
        this.pickerOptions = {
            date: this.state.selection,
            maxDate: this.maxDate,
            mode: 'spinner',
        };
        this.open();
    }

    render() {
        return null;
    }

    close = () => {
        this.props.onChange(this.state.selection);
        this.props.onClose();
    };

    open = async () => {
        const {action, day, month, year} = await DatePickerAndroid.open(this.pickerOptions);
        if (action === DatePickerAndroid.dismissedAction) {
            if (year) {
                const date = new Date(year, month, day);
                this.setState({ selection: date }, () => {
                    this.close();
                });
            } else {
                this.close();
            }
        } else {
            const date = new Date(year, month, day);
            this.setState({ selection: date }, () => {
                this.close();
            });
        }
    };
}

MoafDatePicker.propTypes = {
    onChange: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    selectedDate: PropTypes.instanceOf(Date),
};

export { MoafDatePicker };
