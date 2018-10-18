import { Router, RouterConfiguration } from 'aurelia-router';
import { PLATFORM } from 'aurelia-pal';

export class SubMenu {
  public heading = 'Sub Menu';
  router: Router;
  
  configureRouter(config: RouterConfiguration, router: Router) {
    config.title = 'Sub Menu';
    config.map([{
        route: [ '', 'home' ],
        name: 'home',
        settings: { icon: 'home' },
        moduleId: PLATFORM.moduleName('../home/home'),
        nav: true,
        title: 'Home'
    }, {
        route: 'counter',
        name: 'counter',
        settings: { icon: 'education' },
        moduleId: PLATFORM.moduleName('../counter/counter'),
        nav: true,
        title: 'Counter'
    }, {
        route: 'fetch-data',
        name: 'fetchdata',
        settings: { icon: 'th-list' },
        moduleId: PLATFORM.moduleName('../fetchdata/fetchdata'),
        nav: true,
        title: 'Fetch data'
    }, {
        route: 'api-test',
        name: 'api-test',
        settings: { icon: 'th-list' },
        moduleId: PLATFORM.moduleName('../api-test/api-test'),
        nav: true,
        title: 'Api Test'
  }]);

    this.router = router;
  }
}
