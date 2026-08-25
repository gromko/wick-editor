import React, { useState, useEffect } from 'react';
let classNames = require('classnames');

/**
 * Helper function to safely convert a value to a string for the input field.
 * Prevents React warnings when receiving NaN, null, or undefined.
 */
function safeString(val) {
    if (val === undefined || val === null) return '';
    if (typeof val === 'number' && isNaN(val)) return '';
    return String(val);
}

/**
A delayed text input object that will not the provided on change unless the value is valid, and
passes a provided isValid function.
@param {Object} props
@param {function} isValid - returns true if the value provided is acceptable, false otherwise. If no isValid function is provided,
@param {RegExp} isValidRegex - a regular expression to check against for validity.
@param {function} cleanUp - Valid values will be passed to this function prior to being displayed, and sent to the onChange function.
*/
export default function WickTextInput (props) {
    const [displayValue, setDisplayValue] = useState(safeString(props.value));
    const [valueIsValid, setValueIsValid] = useState(true);
    let { isValid, cleanUp, isValidRegex, ...rest } = props;

    // Update the display value if it's updated elsewhere.
    useEffect(() => {
        let val = props.value;
        if (fullIsValid(val)) { 
            val = internalCleanup(val);
        }
        // Use safeString to prevent NaN from reaching the <input> value attribute
        setDisplayValue(safeString(val));
        
        // Sync validity state if the external prop changes to an invalid state
        if (!fullIsValid(props.value)) {
            setValueIsValid(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.value])

    function wrappedOnChange (val) {
        props.onChange && props.onChange(val);
    }

    function internalCleanup (val) {
        if (cleanUp) {
            return cleanUp(val);
        } 
        return val;
    }

    /**
     * Returns true if all conditions for validity of this input are met.
     * If no validity methods have been passed to this object, returns true;
     */
    function fullIsValid (val) {
        // Default to true;
        let valid = true;
        if (isValid) {
            valid = valid && isValid(val);
        } 
        if (isValidRegex) {
            valid = valid && isValidRegex.test(val);
        }
        return valid;
    }

    /**
     * Updates the displayed and internal value of the input. Will fire on change if all 
     * requirements for validity are satisfied, otherwise, does not.
     * @param {*} e 
     */
    function internalOnChange (e) {
        const val = e.target.value;
        let cleanVal = internalCleanup(val);
        if (fullIsValid(val)) {
            setValueIsValid(true);
            wrappedOnChange(cleanVal);
            setDisplayValue(safeString(cleanVal));
        } else {
            setDisplayValue(safeString(cleanVal));
            setValueIsValid(false);
        }
    }

    return (
        <input
            {...rest}
            className={classNames(props.className, {"invalid": !valueIsValid, "valid": valueIsValid})}
            value={displayValue}
            type="text"
            onChange={internalOnChange}
            onBlur={internalOnChange}/>
    )
}
