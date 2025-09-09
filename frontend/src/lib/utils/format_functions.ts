export function flattenTextFields(obj: any): any {
  if (!obj) return obj;

  const newObj: any = {};
  for (const key of Object.keys(obj)) {
    const value = obj[key];

    // Handle { text: "something" }
    if (value && typeof value === 'object' && 'text' in value) {
      if (key === 'type') {
        // Organization.type → CodeableConcept[]
        newObj[key] = [
          {
            coding: [
              {
                system:
                  'http://terminology.hl7.org/CodeSystem/organization-type',
                code: value.text.toLowerCase().replace(/\s+/g, '-'), // simplistic mapping
                display: value.text,
              },
            ],
            text: value.text,
          },
        ];
      } else {
        newObj[key] = value.text;
      }
    } else if (Array.isArray(value)) {
      newObj[key] = value.map(flattenTextFields);
    } else if (value && typeof value === 'object') {
      newObj[key] = flattenTextFields(value);
    } else {
      newObj[key] = value;
    }
  }
  return newObj;
}

export function normalizeDates(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(normalizeDates);
  } else if (obj !== null && typeof obj === 'object') {
    // Handle Angular datepicker object {year, month, day}
    if ('year' in obj && 'month' in obj && 'day' in obj) {
      const date = new Date(obj.year, obj.month - 1, obj.day);
      return date.toISOString();
    }

    const newObj: any = {};
    for (const key of Object.keys(obj)) {
      newObj[key] = normalizeDates(obj[key]);
    }
    return newObj;
  }
  return obj;
}

export function parsePractitionerName(fullName: string) {
  if (!fullName) {
    return {
      familyName: '',
      givenName: '',
      suffix: '',
      displayName: '',
    };
  }

  // Keep the original
  const displayName = fullName.trim();

  // Split into parts by space
  const parts = fullName
    .replace(/^Dr\.?\s*/i, '')
    .split(',')
    .map((p) => p.trim());

  let baseName = parts[0] || ''; // e.g. "Sarah Chen"
  let suffix = parts[1] || ''; // e.g. "MD"

  // Assume last word = familyName, rest = givenName
  const nameParts = baseName.split(/\s+/);
  const familyName = nameParts.pop() || '';
  const givenName = nameParts.join(' ');

  return {
    familyName,
    givenName,
    suffix,
    displayName,
  };
}
