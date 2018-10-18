import { Container, LogManager, autoinject } from 'aurelia-framework';
import { ConsoleAppender } from "aurelia-logging-console";
import { Router, RouterConfiguration } from 'aurelia-router';
import { PLATFORM } from 'aurelia-pal';
import { TestClient } from 'api-clients/test-client';

// If we are not running locally then we need to add the console appender
let hostname = window.location.hostname;
if (!(hostname === 'localhost' || hostname === '127.0.0.1')) {
  //LogManager.addAppender(new ConsoleAppender());
}
//LogManager.setLevel(LogManager.logLevel.debug);
// LogManager.setLevel(window.location.search.match(/https?:\/\/localhost/g) 
//           ? LogManager.logLevel.debug 
//           : LogManager.logLevel.error);
// Log Levels: none: 0,    error: 1,    warn: 2,    info: 3,    debug: 4

let logger = LogManager.getLogger('app');
logger.debug('loaded');

@autoinject
export class App {
  router: Router;

  constructor(router: Router, container: Container) {
    logger.debug('constructor');
    this.router = router;

    // Configure the DI container
    container.registerInstance(TestClient, new TestClient('https://localhost:5001',true));
  }

  configureRouter(config: RouterConfiguration, router: Router) {
    config.title = 'Aurelia';
    config.map([
      { route: ['', 'welcome'], name: 'welcome', moduleId: PLATFORM.moduleName('./views/welcome/welcome'), nav: true, title: 'Welcome' },
      { route: 'users', name: 'users', moduleId: PLATFORM.moduleName('./views/users/users'), nav: true, title: 'Github Users' },
      { route: 'sub-menu', name: 'sub-menu', moduleId: PLATFORM.moduleName('./views/sub-menu/sub-menu'), nav: true, title: 'Sub Menu' },
    ]);

    this.router = router;
  }
}
