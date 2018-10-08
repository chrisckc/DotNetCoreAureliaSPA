import {SubMenu} from 'views/sub-menu/sub-menu';

class RouterStub {
  routes;
  
  configure(handler) {
    handler(this);
  }

  map(routes) {
    this.routes = routes;
  }
}

describe('the Sub Menu module', () => {
  let sut;
  let mockedRouter;

  beforeEach(() => {
    mockedRouter = new RouterStub();
    sut = new SubMenu();
    sut.configureRouter(mockedRouter, mockedRouter);
  });

  it('contains a router property', () => {
    expect(sut.router).toBeDefined();
  });

  it('configures the heading', () => {
    expect(sut.heading).toEqual('Child Router');
  });

  it('should have a home route', () => {
    expect(sut.router.routes).toContainEqual({ route: ['', 'home'], name: 'home', settings: { icon: 'home' },  moduleId: '../home/home', nav: true, title: 'Home' });
  });

  it('should have a counter route', () => {
    expect(sut.router.routes).toContainEqual({ route: 'counter', name: 'counter', settings: { icon: 'education' }, moduleId: '../counter/counter', nav: true, title: 'Counter' });
  });

  it('should have a fetch-data route', () => {
    expect(sut.router.routes).toContainEqual({ route: 'fetch-data', name: 'fetchdata', settings: { icon: 'th-list' }, moduleId: '../fetchdata/fetchdata', nav: true, title: 'Fetch data' });
  });
});
