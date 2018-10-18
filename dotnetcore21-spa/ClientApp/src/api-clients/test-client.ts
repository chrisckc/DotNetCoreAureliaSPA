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

  public getData(resource: string, queryParamObject?: any, headers?: any): Promise<ApiResponse> {
    return this.getResource(resource, queryParamObject, headers);
  }
}
