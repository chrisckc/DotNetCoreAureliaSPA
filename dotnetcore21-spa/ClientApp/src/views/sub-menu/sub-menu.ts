import { Router, RouterConfiguration } from 'aurelia-router';
import { PLATFORM } from 'aurelia-pal';

export class SubMenu {
  router: Router;
  
  configureRouter(config: RouterConfiguration, router: Router) {
    config.title = 'AureliaTest';
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
    }]);

    this.router = router;
  }
}
