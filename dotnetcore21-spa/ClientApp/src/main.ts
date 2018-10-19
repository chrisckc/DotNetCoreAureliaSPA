/// <reference types="aurelia-loader-webpack/src/webpack-hot-interface"/>
// we want font-awesome to load as soon as possible to show the fa-spinner
// tslint:disable
import 'font-awesome/css/font-awesome.css';
import 'bootstrap/dist/css/bootstrap.css';
import '../static/bootstrap-custom.css'; // add after the bootstrap import
import '../static/styles.css'; // we want our styles added last
import 'jquery';
//import $ from 'jquery'
import 'bootstrap'
import { Aurelia } from 'aurelia-framework';
import { PLATFORM } from 'aurelia-pal';
import * as Bluebird from 'bluebird';
import environment from './environment';
import { TestClient } from 'api-clients/test-client';

// remove out if you don't want a Promise polyfill (remove also from webpack.config.js)
Bluebird.config({ warnings: { wForgottenReturn: false } });

export async function configure(aurelia: Aurelia) {
  console.log('main configure: hostname: ' + window.location.hostname);
  console.log('main configure: origin: ' + window.location.origin);
  
  // tslint:enable
  aurelia.use
    .standardConfiguration()
    .feature(PLATFORM.moduleName('resources/index'));

  // Uncomment the line below to enable animation.
  // aurelia.use.plugin(PLATFORM.moduleName('aurelia-animator-css'));
  // if the css animator is enabled, add swap-order="after" to all router-view elements

  // Anyone wanting to use HTMLImports to load views, will need to install the following plugin.
  // aurelia.use.plugin(PLATFORM.moduleName('aurelia-html-import-template-loader'));

  if (environment.debug) {
    aurelia.use.developmentLogging();
  }

  if (environment.testing) {
    aurelia.use.plugin(PLATFORM.moduleName('aurelia-testing'));
  }

  // Configure the DI container (can do this in app.ts instead)
  //let container = aurelia.container;
  //container.registerInstance(TestClient, new TestClient('https://localhost:5001'));

  return aurelia.start().then(() => aurelia.setRoot(PLATFORM.moduleName('app')));

  //await aurelia.start();
  //await aurelia.setRoot(PLATFORM.moduleName('app'));
}
