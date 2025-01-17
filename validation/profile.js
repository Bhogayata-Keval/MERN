const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validateProfileInput(data) {
    let errors = {};

    data.handle = !isEmpty(data.handle) ? data.handle : '';
    data.status = !isEmpty(data.status) ? data.status : '';
    data.skills = !isEmpty(data.skills) ? data.skills : '';
    data.password = !isEmpty(data.password) ? data.password : '';


    if(Validator.isLength(data.handle, {min: 2, max: 40})){
        errors.handle = 'Handle must be between 2 to 40 characters';
    }

    if(Validator.isEmpty(data.handle)){
        errors.handle = 'Handle field is required';
    }

    if(Validator.isEmpty(data.status)){
        errors.status = 'Status field is required';
    }

    if(Validator.isEmpty(data.skills)){
        errors.skills = 'Skills field is required';
    }

    if(!isEmpty(data.website)) {
        if(!Validator.isURL(data.website)) {
            errors.website = 'Not a Valid URL';
        }
    }

    if(!isEmpty(data.youtube)) {
        if(!Validator.isURL(data.youtube)) {
            errors.youtube = 'Not a Valid URL';
        }
    }

    if(!isEmpty(data.twitter)) {
        if(!Validator.isURL(data.twitter)) {
            errors.twitter = 'Not a Valid URL';
        }
    }

    if(!isEmpty(data.facebook)) {
        if(!Validator.isURL(data.facebook)) {
            errors.facebook = 'Not a Valid URL';
        }
    }

    if(!isEmpty(data.linkedin)) {
        if(!Validator.isURL(data.linkedin)) {
            errors.linkedin = 'Not a Valid URL';
        }
    }

    if(!isEmpty(data.instagram)) {
        if(!Validator.isURL(data.instagram)) {
            errors.instagram = 'Not a Valid URL';
        }
    }

    return {
        errors,
        isValid: isEmpty(errors)
    }
}