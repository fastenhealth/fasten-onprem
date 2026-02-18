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

export function normalizeFormValues(
  obj: any,
  parentKey: string | null = null
): any {
  // Return primitives and null values as is
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // If it's an array, recursively process each item
  if (Array.isArray(obj)) {
    return obj.map((item) => normalizeFormValues(item, parentKey));
  }

  // --- Logic from normalizeDates --- //

  // Skip processing children of 'medications'
  if (parentKey === 'medications') {
    return obj;
  }

  // Handle Angular datepicker object: {year, month, day}
  if ('year' in obj && 'month' in obj && 'day' in obj) {
    // A simple check to avoid matching objects that coincidentally have these keys
    if (Object.keys(obj).length === 3) {
      const date = new Date(obj.year, obj.month - 1, obj.day);
      return date.toISOString();
    }
  }

  // --- Combined Recursive Logic --- //
  const newObj: any = {};
  for (const key of Object.keys(obj)) {
    // Logic from normalizeAddresses: if the key is 'address' and the value
    // is a single object, wrap it in an array after processing its contents.
    if (key === 'address' && obj[key] && !Array.isArray(obj[key])) {
      newObj[key] = [normalizeFormValues(obj[key], key)];
    } else {
      // Recursively process all other key-value pairs
      newObj[key] = normalizeFormValues(obj[key], key);
    }
  }

  return newObj;
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
