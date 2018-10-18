import {App} from 'app';
import {Router} from 'aurelia-router';
import { HttpClient } from 'aurelia-fetch-client';

class RouterStub {
  routes;
  
  configure(handler) {
    handler(this);
  }

  map(routes) {
    this.routes = routes;
  }
}

describe('the App module', () => {
  let sut: any;
  let mockedRouter: any;
  let mockedHttpClient: any;

  beforeEach(() => {
    mockedRouter = new RouterStub();
    sut = new App(mockedRouter, mockedHttpClient);
    sut.configureRouter(mockedRouter, mockedRouter);
  });

  it('contains a router property', () => {
    expect(sut.router).toBeDefined();
  });

  it('configures the router title', () => {
    expect(sut.router.title).toEqual('Aurelia');
  });

  it('should have a welcome route', () => {
    expect(sut.router.routes).toContainEqual({ route: ['', 'welcome'], name: 'welcome',  moduleId: './views/welcome/welcome', nav: true, title: 'Welcome' });
  });

  it('should have a users route', () => {
    expect(sut.router.routes).toContainEqual({ route: 'users', name: 'users', moduleId: './views/users/users', nav: true, title: 'Github Users' });
  });

  it('should have a child router route', () => {
    expect(sut.router.routes).toContainEqual({ route: 'sub-menu', name: 'sub-menu', moduleId: './views/sub-menu/sub-menu', nav: true, title: 'Sub Menu' });
  });
});
