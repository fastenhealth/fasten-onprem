import { ShortDomainPipe } from './short-domain.pipe';

describe('ShortDomainPipe', () => {
  it('create an instance', () => {
    const pipe = new ShortDomainPipe();
    expect(pipe).toBeTruthy();
  });

  it('should successfully extract domains', () => {
    //setup
    const pipe = new ShortDomainPipe();
    const urls = [
      {test: "http://www.blog.classroom.me.uk/index.php", result: "www.blog.classroom.me.uk"},
      {test: "http://www.youtube.com/watch?v=ClkQA2Lb_iE", result: "www.youtube.com"},
      {test: "https://www.youtube.com/watch?v=ClkQA2Lb_iE", result: "www.youtube.com"},
      {test: "www.youtube.com/watch?v=ClkQA2Lb_iE", result: "www.youtube.com"},
      {test: "websitename.com:1234/dir/file.txt", result: "websitename.com:1234"},
      {test: "example.com?param=value", result: "example.com"},
      {test: "https://facebook.github.io/jest/", result: "facebook.github.io"},
      {test: "youtube.com/watch?v=ClkQA2Lb_iE", result: "youtube.com"},
      {test: "www.食狮.公司.cn", result: "www.食狮.公司.cn"},
      {test: "b.c.kobe.jp", result: "b.c.kobe.jp"},
      {test: "a.d.kyoto.or.jp", result: "a.d.kyoto.or.jp"},
      {test: "http://localhost:4200/watch?v=ClkQA2Lb_iE", result: "localhost"},
    ];

    //test
    for(let urltest of urls) {
      expect(pipe.transform(urltest.test)).toBe(urltest.result, `testing "${urltest.test}". Expecting ${pipe.transform(urltest.test)} to be ${urltest.result}`);
    }

    //assert
  });
});
