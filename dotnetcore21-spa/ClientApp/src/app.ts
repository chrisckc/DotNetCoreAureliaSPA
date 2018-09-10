import {Aurelia} from 'aurelia-framework';
import {Router, RouterConfiguration} from 'aurelia-router';
import {PLATFORM} from 'aurelia-pal';

export class App {
  router: Router;

  configureRouter(config: RouterConfiguration, router: Router) {
    config.title = 'Aurelia';
    config.map([
      { route: ['', 'welcome'], name: 'welcome',      moduleId: PLATFORM.moduleName('./views/welcome/welcome'),      nav: true, title: 'Welcome' },
      { route: 'users',         name: 'users',        moduleId: PLATFORM.moduleName('./views/users/users'),        nav: true, title: 'Github Users' },
      { route: 'sub-menu',  name: 'sub-menu', moduleId: PLATFORM.moduleName('./views/sub-menu/sub-menu'), nav: true, title: 'Child Router' },
    ]);

    this.router = router;
  }
}
