import * as moment from 'moment'

/**
 * Walks thru an object (ar array) and returns the value found at the provided
 * path. This function is very simple so it intentionally does not support any
 * argument polymorphism, meaning that the path can only be a dot-separated
 * string. If the path is invalid returns undefined.
 * @param {Object} obj The object (or Array) to walk through
 * @param {String} path The path (eg. "a.b.4.c")
 * @returns {*} Whatever is found in the path or undefined
 */
export function getPath(obj, path = ""): string {
  return path.split(".").reduce((out, key) => out ? out[key] : undefined, obj)
}

export const FORMATTERS = {
  date: (str) => str ? moment(str).format('YYYY-MM-DD') : '',
  time: (str) => str ? moment(str).format('HH:mm:ss') : '',
  dateTime: (str) => str ? moment(str).format('YYYY-MM-DD - h:mm:ss a') : '',
  numberWithCommas: (str) => str ? str.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : '',
  code: (code) => code ? `${code.code}: ${code.display ? code.display : ''}` : '',
  period: (period) => period ? `${moment(period.start).format('YYYY-MM-DD - h:mm:ss a')} -> ${moment(period.end).format('YYYY-MM-DD - h:mm:ss a')}` : ''
};

export function round(num, digits) {
  return Number.parseFloat(num).toFixed(digits);
}

export function obsValue(entry){
  if (entry == null) {
    return '';
  } else if (entry.valueQuantity) {
    return round(entry.valueQuantity.value, 2) + ' ' + entry.valueQuantity.code;
  } else if (entry.valueCodeableConcept) {
    return entry.valueCodeableConcept.coding[0].display;
  } else if (entry.valueString) {
    return entry.valueString;
  }

  if (entry.code.coding[0].display === "Blood Pressure") {

    if (!entry.component[0].valueQuantity) {
      return ''; // WTF!!
    }

    const v1 = Number.parseFloat(entry.component[0].valueQuantity.value);
    const v2 = Number.parseFloat(entry.component[1].valueQuantity.value);

    const s1 = v1.toFixed(0);
    const s2 = v2.toFixed(0);

    if (v1 > v2) {
      return s1 + ' / ' + s2 + ' mmHg';
    } else {
      return s2 + ' / ' + s1 + ' mmHg';
    }
  }

  return '';
}

export function attributeXTime(entry, type) {
  if (entry == null) {
    return '';
  } else if (entry[`${type}DateTime`]) {
    return FORMATTERS['dateTime'](entry[`${type}DateTime`])
  } else if (entry[`${type}Period`]) {
    return FORMATTERS['period'](entry[`${type}Period`])
  }
  return '';
}

export function duration(period) {
  if (!period.end) {
    return '';
  }
  let start = moment(period.start);
  let end = moment(period.end);
  return moment.duration( start.diff(end) ).humanize();
};
