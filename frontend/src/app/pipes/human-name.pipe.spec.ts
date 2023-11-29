import { HumanNamePipe } from './human-name.pipe';

describe('HumanNamePipe', () => {
  it('create an instance', () => {
    const pipe = new HumanNamePipe();
    expect(pipe).toBeTruthy();
  });
});
