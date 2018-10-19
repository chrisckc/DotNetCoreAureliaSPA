// Copyright (C) 2018 Chris Claxton. Subject to the MIT license
//  You may use, distribute and modify this code under the
//  terms of the MIT license.

import { autoinject, LogManager } from 'aurelia-framework';
import { ApiResponse } from '../models/api-response';
export { ApiResponse } from '../models/api-response'; // Export this to make it avialable to consumers fo the service
import { ApiClient, QueryParam } from './api-client';
export {QueryParam};

const logger = LogManager.getLogger('test-client');

// Example of a sub-classed ApiClient
@autoinject
export class TestClient extends ApiClient {

  constructor(baseUrl: string, logRequestHeaders: boolean) {
    super(baseUrl, logRequestHeaders);
  }

  public activate(params, routeConfig) {
    logger.debug('activate');
  }

  // eg. provide some methods for getting different data
  public getDemoData(): Promise<ApiResponse> {
    const resource = '/api/ResponseTest/Get200'; // get this resource string from a config file instead
    return this.getResource(resource);
  }
}
