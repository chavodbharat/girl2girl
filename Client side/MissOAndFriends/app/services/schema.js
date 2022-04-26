import * as Joi from 'react-native-joi';

const eighteenYearOld = new Date();
const thirteenYearOld = new Date();
eighteenYearOld.setFullYear(eighteenYearOld.getFullYear() - 19);
thirteenYearOld.setFullYear(thirteenYearOld.getFullYear() - 13);

const Schema = {
    birth_date: Joi.string().required(),
    // BUG this does not work. must do local validation
    // SEE https://github.com/hapijs/joi/issues/652
    confirm_password: Joi.string().valid(Joi.ref('password')).required().options({ language: { any: { allowOnly: '!!must match password' } } }),
    country: Joi.object().keys({
        alpha_3: Joi.string().length(3),
        name: Joi.string(),
    }).with('alpha_3', 'name'),
    dob:   Joi.date().max('now').min(eighteenYearOld).required(),
    dob13: Joi.date().max(thirteenYearOld).required(),
    email: Joi.string().email().required(),
    gender: Joi.string().regex(/^Girl$/).required(),
    name_first: Joi.string().required(),
    password: Joi.string().min(5).required(),
    state: Joi.object().keys({
        abbreviation: Joi.string().length(2),
        name: Joi.string(),
    }).with('abbreviation', 'name'),
    username: Joi.string().min(5).required(),
    validate: (value: any, schema: any, replacement: string, cb: (err: string) => void): void => {
        Joi.validate(value, schema, (err) => {
            if (err) {
                cb(err.details[0].message.replace('"value"', replacement));
            } else {
                cb(null);
            }
        });
    }
};

export { Schema };
