// Copyright (C) 2018 Chris Claxton. Subject to the MIT license
//  You may use, distribute and modify this code under the
//  terms of the MIT license.

import { autoinject, LogManager } from 'aurelia-framework';
import { observable } from 'aurelia-framework';
import { computedFrom } from 'aurelia-framework';
import { QueryParam, TestClient } from '../../api-clients/test-client';
import { ApiResponse } from '../../models/api-response';
import { timingSafeEqual } from 'crypto';
// Setup the logger
const logger = LogManager.getLogger('api-test');

@autoinject
export class ApiTest {
  public heading: string = 'Api Client Test';
  public isLoading: boolean;
  @observable public baseUrl: string;
  public httpMethod: string = 'GET';
  public httpMethodOptions: any[] = [
    { name: 'GET', value: 'GET' },
    { name: 'POST', value: 'POST' },
    { name: 'PUT', value: 'PUT' },
  ];
  public resourcePath: string = '/api/ResponseTest/Get200';
  public queryParamArray: QueryParam[] = [{ name: null, value: null }, { name: null, value: null }];
  public requestBody: string;
  public requestBodyParseError: Error;
  @observable public bearerToken: string;
  public customHeader: string;
  public customHeaderValue: string;
  public apiResponse: ApiResponse;
  public jsonString: string;
  public responseHeaders: string;
  public errorTitle: string;
  public errorType: string;
  public errorDetail: string;
  private previousUrl = this.absoluteUrl;

  constructor(private testClient: TestClient) {
    this.testClient = testClient;
    //console.debug('constructor ApiTest VM:', this);
    logger.debug('constructor');
    // Set the baseUrl to the testClient.baseUrl
    this.baseUrl = this.testClient.baseUrl; // testClient.baseUrl is configured in app.ts
    this.testClient.abortController = new AbortController();
    this.testClient.captureResponseHeaders = true;
    this.testClient.logResponseHeaders = true;
  }

  public activate(params) {
    logger.debug('activate params: ', params);
  }

  // Can't use computed from to observe changes to array elements, can only observe the array length
  // Have to resort to dirty checking here
  //@computedFrom('baseUrl', 'resourcePath', 'queryParamArray')
  get absoluteUrl() {
    const queryParamObject: any = this.testClient.buildQueryParamObject(this.queryParamArray);
    const resource = this.testClient.appendQueryParamObject(this.resourcePath, queryParamObject);
    return this.testClient.getUrl(resource);
    //return `${this.baseUrl}${resource}`;
  }

  public setHttpMethod(method: string) {
    this.httpMethod = method;
  }

  public toggleAlwaysPopulateResponseBody(state: boolean) {
    if (state) {
      this.testClient.alwaysPopulateResponseBody = true;
    } else {
      this.testClient.alwaysPopulateResponseBody = false;
    }
  }

  public baseUrlChanged(newValue, oldValue) {
    this.testClient.baseUrl = this.baseUrl;
  }

  public bearerTokenChanged(newValue, oldValue) {
    this.testClient.setBearerToken(this.bearerToken);
  }

  public submit() {
    this.previousUrl = this.absoluteUrl;
    this.resetProperties();
    const queryParamObject: any = this.testClient.buildQueryParamObject(this.queryParamArray);
    let headers = {};
    if (this.customHeader) {
      headers = {
        [this.customHeader]: [this.customHeaderValue]
      };
    }
    let bodyObject = null;
    if (this.requestBody && this.httpMethod !== 'GET') {
      try {
        bodyObject = JSON.parse(this.requestBody);
      } catch (error) {
        this.requestBodyParseError = error;
        return;
      }
    }
    logger.info('submit: getting data...');
    this.GetData(this.resourcePath, queryParamObject, bodyObject, headers);
  }

  // If this method is called multiple times before the previous request has returned,
  // aborting the signal will abort all of the pending requests
  // If the user navigates away from the app the request is also aborted by the browser
  // If the user navigates to a different view in the app,
  // the request is aborted by calling abort() inside deactivate method
  public GetData(resource: string, queryParams: any, bodyObject: any, headers: any) {
    // If the signal has been aborted we need to create a new AbortController
    if (this.testClient.abortController.signal.aborted) {
      this.testClient.abortController = new AbortController();
    }
    // Perform the Fetch
    this.isLoading = true;
    this.testClient.fetchResource(this.httpMethod, resource, queryParams, bodyObject, headers)
      .then((apiResponse) => {
        logger.info('apiResponse:', apiResponse);
        this.isLoading = false;
        this.apiResponse = apiResponse;
        try {
          if (apiResponse.data) this.jsonString = JSON.stringify(apiResponse.data, null, 2);
          if (apiResponse.headers) this.responseHeaders = JSON.stringify(apiResponse.headers, null, 2);
        } finally {
          // nothing to do here
        }
        if (!apiResponse.success) {
          this.errorTitle = apiResponse.errorTitle;
          this.errorType = apiResponse.errorType;
          this.errorDetail = apiResponse.errorDetail;
        }
      })
      .catch((error) => {
        logger.info('unknown error:', error);
        this.isLoading = false;
        this.errorTitle = 'Unknown Error';
        this.errorType = error.name;
        this.errorDetail = error.message;
      });
  }

  public canDeactivate() {
    if (this.absoluteUrl !== this.previousUrl) {
      return confirm('Are you sure you want to leave?');
    }
  }

  public deactivate() {
    logger.debug('deactivate');
    // abort when leaving this view
    this.testClient.abortController.abort();
  }

  private resetProperties() {
    this.requestBodyParseError = null;
    this.apiResponse = null;
    this.errorTitle = null;
    this.errorType = null;
    this.errorDetail = null;
    this.jsonString = null;
    this.responseHeaders = null;
  }
}
