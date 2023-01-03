import {CodableConceptModel, hasValue} from './codable-concept-model';

describe('CodableConceptModel', () => {
  it('should create an instance', () => {
    expect(new CodableConceptModel({})).toBeTruthy();
  });


  it('should return true for hasValue', () => {
    expect(hasValue({})).toBeFalse();
    expect(hasValue({"coding": [], "text": "hello"})).toBeTrue();
    expect(hasValue({
      "coding": [
        {
          "system": "http://snomed.info/sct",
          "code": "304386008",
          "display": "O/E - itchy rash"
        }
      ],
      "text": "This was a mild rash on the left forearm"
    })).toBeTrue();
  });
});
