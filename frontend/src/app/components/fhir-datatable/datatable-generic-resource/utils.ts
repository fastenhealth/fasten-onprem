import moment from "moment";

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
  time: (str) => str ? moment(str).format('HH:mm') : '',
  dateTime: (str) => str ? moment(str).format('YYYY-MM-DD - h:mm a') : '',
  numberWithCommas: (str) => str ? str.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : '',
  code: (code) => code ? `${code.code}: ${code.display ? code.display : ''}` : '',
  codeableConcept: (codeableConcept) => {
    if(!codeableConcept) return ''
    if(codeableConcept.text) return codeableConcept.text
    return codeableConcept.coding && codeableConcept.coding[0] ? `${codeableConcept.coding[0].code}: ${codeableConcept.coding[0].display ? codeableConcept.coding[0].display : ''}` : ''
  },
  address: (address) => {
    if(!address) return ''
    var addressParts = []
    if(address.line) addressParts.push(address.line.join(', '))
    if(address.city) addressParts.push(address.city)
    if(address.state) addressParts.push(address.state)
    if(address.postalCode) addressParts.push(address.postalCode)
    if(address.country) addressParts.push(address.country)
    return addressParts.join(', ')
  },
  humanName: (humanName) => {
    if(!humanName) return ''
    var nameParts = []
    if(humanName.prefix) nameParts.push(humanName.prefix.join(', '))
    if(humanName.given) nameParts.push(humanName.given.join(' '))
    if(humanName.family) nameParts.push(humanName.family)
    if(humanName.suffix) nameParts.push(humanName.suffix.join(', '))
    return nameParts.join(' ')
  },
  contact: (contact) => {
    if (!contact) return ''
    var contactParts = []
    if (contact.system) contactParts.push(contact.system)
    if (contact.value) contactParts.push(contact.value)
    if (contact.use) contactParts.push(`(${contact.use})`)
    return contactParts.join(' ')
  },
  period: (period) => period ? `${moment(period.start).format('YYYY-MM-DD - h:mm a')} -> ${moment(period.end).format('YYYY-MM-DD - h:mm a')}` : ''
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
