import {GetEndpointAbsolutePath} from './endpoint_absolute_path';

describe('PouchdbRepository', () => {

  describe('GetEndpointAbsolutePath', () => {

    describe('with absolute http path', () => {
      it('should return absolute path', async () => {
        let currentUrl = new URL("http://www.example.com/")
        const absoluteUrl = GetEndpointAbsolutePath(currentUrl, 'http://www.example2.com/my/test/path')
        expect(absoluteUrl).toEqual('http://www.example2.com/my/test/path');
      });
    })

    describe('with absolute https path', () => {
      it('should return absolute path', async () => {
        let currentUrl = new URL("http://www.example.com/")
        const absoluteUrl = GetEndpointAbsolutePath(currentUrl, 'https://www.example2.com/my/test/path')
        expect(absoluteUrl).toEqual('https://www.example2.com/my/test/path');
      });
    })

    describe('with no subpath and no /web/', () => {
      it('should return absolute path', async () => {
        let currentUrl = new URL("http://www.example.com/")
        const absoluteUrl = GetEndpointAbsolutePath(currentUrl, '/database')
        expect(absoluteUrl).toEqual('http://www.example.com/database');
      });
    })

    describe('with subpath and no /web/', () => {
      it('should return absolute path', async () => {
        let currentUrl = new URL("http://www.example.com/hello/world")
        const absoluteUrl = GetEndpointAbsolutePath(currentUrl, '/database')
        expect(absoluteUrl).toEqual('http://www.example.com/database');
      });
    })

    describe('with no subpath and /web/', () => {
      it('should return absolute path', async () => {
        let currentUrl = new URL("http://www.example.com/web/world")
        const absoluteUrl = GetEndpointAbsolutePath(currentUrl, '/database')
        expect(absoluteUrl).toEqual('http://www.example.com/database');
      });
    })

    describe('with subpath and /web/', () => {
      it('should return absolute path', async () => {
        let currentUrl = new URL("http://www.example.com/fasten/web/hello/world")
        const absoluteUrl = GetEndpointAbsolutePath(currentUrl, '/database')
        expect(absoluteUrl).toEqual('http://www.example.com/fasten/database');
      });
    })

  })

});
