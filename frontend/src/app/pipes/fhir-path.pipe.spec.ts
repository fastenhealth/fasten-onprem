import { FhirPathPipe } from './fhir-path.pipe';

describe('FhirPathPipe', () => {
  it('create an instance', () => {
    const pipe = new FhirPathPipe();
    expect(pipe).toBeTruthy();
  });
});
