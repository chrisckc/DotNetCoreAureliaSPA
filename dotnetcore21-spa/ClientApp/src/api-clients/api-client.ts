// Copyright (C) 2018 Chris Claxton. Subject to the MIT license
//  You may use, distribute and modify this code under the
//  terms of the MIT license.

import { HttpClient, json } from 'aurelia-fetch-client';
import { autoinject, LogManager } from 'aurelia-framework';
import 'isomorphic-fetch'; // a polyfill to support browsers that haven't implemented Fetch
export { json } from 'aurelia-fetch-client';
import { buildQueryString } from 'aurelia-path';
import { ApiResponse } from '../models/api-response';
export {QueryParam};

const logger = LogManager.getLogger('api-client');

// A Wrapper around aurelia-fetch-client
// Adds timeout and request abort capability.
// Returns an ApiResponse object containing the response data and metadata
@autoinject
export abstract class ApiClient {
  public alwaysPopulateResponseBody: boolean;
  public allowEmptyJsonResponses: boolean;
  public allowOnlyObjectsAndArraysInJsonRoot: boolean;
  public requestTimeout?: number;
  public lastRequestTimestamp: number; // milliseconds since January 01, 1970, 00:00:00 UTC (Universal Time Coordinated).
  public pendingRequestCount: number;
  public captureResponseHeaders: boolean;
  public logResponseHeaders: boolean;
  public abortController: AbortController;
  protected http: HttpClient;
  protected bearerToken: string;

  constructor(public baseUrl: string, logRequestHeaders?: boolean) {
    logger.debug('constructed baseUrl: ', baseUrl);
    this.baseUrl = baseUrl;

    this.alwaysPopulateResponseBody = false;
    this.allowEmptyJsonResponses = false;
    this.allowOnlyObjectsAndArraysInJsonRoot = false;
    this.lastRequestTimestamp = 0;
    this.pendingRequestCount = 0;
    this.requestTimeout = 60; // Default to 60 seconds
    // New up HttpClient rather than use DI as we need a unique client for each instance of this sub-classed class
    this.http = new HttpClient();
    this.http.configure((config) => {
      config
        .withDefaults({
          // Ref: https://developers.google.com/web/updates/2015/03/introduction-to-fetch
          // Note: we don't actually need to specify mode: 'cors' as the browser uses it by default.
          //mode: 'no-cors', // Valid values; no-cors, cors, same-origin, cors-with-forced-preflight (In Chrome the default is 'cors') if 'no-cors' is used, a cross-origin request would succeed even if the server did not provide the correct CORS response headers, however the browser would not make the response data available to the code
          //credentials: 'include', // Valid values; omit, same-origin , 'include' (default is include for Chrome > 47)
          //credentials: 'same-origin', // Only sends credentials when making requests to the same origin as the app
          //cache: 'no-cache', // Valid values; default, no-cache, reload, force-cache, only-if-cached
          //redirect: 'manual', // Valid values;  manual, follow, error (In Chrome the default is 'follow')
          //referrer: '', // Valid values; either a url or '' to remove the header (default is the origin url)
          headers: {
            Accept: 'application/json', // is a CORS-safe-listed request-header
            //'X-Requested-With': 'Fetch' // not a CORS-safe-listed request-header
            //'Prefer': 'return=representation' // not a CORS-safe-listed request-header
            // If any non-CORS-safe-listed headers are used,
            // the browser will pre-flight the request using an OPTIONS request
          }
        })
        .withInterceptor({
          request(request) {
            logger.debug(`Intercepted request with method: ${request.method} and Url: ${request.url}`);
            // We are able to look at the request headers here
            // can't access class properties and methods in here (this)
            if (logRequestHeaders) {
              const headersObject: any = {}; // can't access our class method for building this
              request.headers.forEach((value, name) => {
                headersObject[name] = value;
              });
              const headers: string = JSON.stringify(headersObject, null, 2);
              logger.debug(`${new Date().toJSON()} : Request Headers:\n${headers}`);
            }
            return request;
          },
          response(response) {
            logger.debug(`Intercepted response with status ${response.status} and Url: ${response.url}`);
            return response;
          }
        });
    });
  }

  public activate(params, routeConfig) {
    logger.debug('activate');
  }

  public setBearerToken(bearerToken: string) {
    this.bearerToken = bearerToken;
  }

  public clearBearerToken() {
    this.bearerToken = null;
  }

  // Builds a queryParamObject from an array of QueryParam objects
  // QueryParam object interface properties: name, value
  public buildQueryParamObject(queryParamArray: QueryParam[]): any {
    const queryParamObject: any = {};
    queryParamArray.forEach((item) => {
      if (item && item.name != null) {
        queryParamObject[item.name] = item.value;
      }
    });
    return queryParamObject;
  }

  public getResource(resource: string, queryParamObject?: any, headers?: any): Promise<ApiResponse> {
    logger.info('getResource: ', resource);
    return this.fetchResource('GET', resource, queryParamObject, null, headers);
  }

  public postResource(resource: string, queryParamObject?: any, bodyObject?: any, headers?: any): Promise<ApiResponse> {
    logger.info('postResource: ', resource);
    return this.fetchResource('POST', resource, queryParamObject, bodyObject, headers);
  }

  public putResource(resource: string, queryParamObject?: any, bodyObject?: any, headers?: any): Promise<ApiResponse> {
    logger.info('postResource: ', resource);
    return this.fetchResource('PUT', resource, queryParamObject, bodyObject, headers);
  }

  public fetchResource(method: string, resource: string, queryParamObject?: any, bodyObject?: any, headers?: any): Promise<ApiResponse> {
    // queryParams is an object with properties for each query parameter
    resource = this.appendQueryParamObject(resource, queryParamObject);
    const url = this.getUrl(resource);
    logger.info('fetchResource url: ', url);
    if (headers === undefined || headers === null) {
      headers = {};
    }
    if (method === 'POST' || method === 'PUT') {
      headers['Content-Type'] = 'application/json';
    }
    if (this.bearerToken) {
      headers.Authorization = `Bearer ${this.bearerToken}`;
    }
    const requestInit: RequestInit = { method, body: bodyObject ? json(bodyObject) : null, headers };
    return this.fetch(url, resource, requestInit);
  }

  // Uses buildQueryString from 'aurelia-path' to construct an encoded query string from an object
  // queryParamObject is an object with properties for each query parameter
  // Any properties of the queryParamObject with null or undefined values are ignored by buildQueryString
  public appendQueryParamObject(resource: string, queryParamObject: any): string {
    // check for edge case of an empty string property name as buildQueryString does not ignore it
    if (queryParamObject.hasOwnProperty('')) delete queryParamObject[''];
    if (queryParamObject && Object.keys(queryParamObject).length > 0) {
      const query = buildQueryString(queryParamObject);
      if (query) {
        // check if the resource path already contains query params
        if (resource && resource.includes('?')) {
          return `${encodeURI(resource)}&${query}`;
        } else {
          return `${encodeURI(resource)}?${query}`;
        }
      }
    }
    return encodeURI(resource);
  }

  public getUrl(resource: string) {
    if (resource) {
      return this.baseUrl ? this.joinUrl(this.baseUrl, resource) : resource;
    } else {
      return this.baseUrl;
    }
  }

  // Wrapper around the aurelia-fetch-client 'fetch' method, handles cancellation and timeout using AbortController
  public fetch(url: string, resource: string, requestInit: RequestInit): Promise<ApiResponse> {
    return new Promise((resolve, reject) => {
      // Setup AbortController
      const abortController: AbortController = new AbortController();
      // If we have been supplied with an AbortController, monitor it to allow external abort.
      // This is much better than just using the supplied AbortController
      if (this.abortController) {
        if (this.abortController.signal.aborted) {
          logger.warn('fetch: The provided AbortController (apiClient.abortController) has already aborted, the request will be aborted immediately');
          // This is likely due to an logic error in the consumer of this class,
          // so force an immediate abort inside the request about to be made rather than start a request which can't be aborted
          abortController.abort();
        } else {
          // Listen for the abort event on provided AbortController's signal
          this.abortController.signal.addEventListener('abort', () => {
            logger.info('fetch: The provided AbortController has aborted!');
            abortController.abort();
          });
        }
      }

      // Fetch does not support setting a timeout (seems to be infinite until connection is broken)
      // so we use a Timer and AbortController to add a timeout
      // If we used the supplied AbortController, one request timeout would also abort any other pending requests
      // This behaviour is avoided by monitoring the supplied AbortController's signal instead as above
      let timer;
      let didTimeOut: boolean = false;
      if (this.requestTimeout != null) {
        timer = setTimeout(() => {
          didTimeOut = true;
          abortController.abort();
        }, this.requestTimeout * 1000);
      }

      // If we use .useStandardConfiguration() when setting up aurelia-fetch-client,
      // non-success status codes would result in promise rejection,
       // so in that case we would get a Response object in the first catch instead of an error
      this.pendingRequestCount++;
      const timestamp: number = this.getTimestamp();
      this.lastRequestTimestamp = timestamp;
      requestInit.signal = abortController.signal;
      // If the request is aborted, for some reason both the first .catch and the following .then is called
      this.http.fetch(url, requestInit)
        .catch((error) => { // catches errors where a request could not be sent or a response failed to arrive successfully
          // catches Network errors, such as no connection, server unavailable or a CORS error
          // Unfortunately error details are not specific, usually just "Failed to fetch"
          clearTimeout(timer);
          this.pendingRequestCount--;
          // to be sure...
          if (error instanceof Response) {
            resolve(this.handleResponse(error as Response, resource, url, requestInit.method, timestamp));
          } else {
            // resolve with an ApiResponse instance returned from handleError
            // if rejecting we must reject with en error object to avoid a warning
            resolve(this.handleError(error, resource, url, requestInit.method, timestamp, didTimeOut, 'Network Error'));
          }
        })
        .then((response) => { // If the request was aborted, response will be undefined
          clearTimeout(timer);
          if (!response) return null; //return null in the case of undefined response;
          this.pendingRequestCount--;
          resolve(this.handleResponse(response as Response, resource, url, requestInit.method, timestamp));
        })
        .catch((error) => { // catches any unhandled error while handing the response.
          // Hopefully should never reach this
          resolve(this.handleError(error, resource, url, requestInit.method, timestamp, didTimeOut, 'Response Handling Error'));
        });
    });
  }

  private handleResponse(response: Response, resource: string, originalUrl: string, method: string, timestamp: number): Promise<ApiResponse> {
    return new Promise((resolve, reject) => {
      if (!response) return null; //return null in the case of null response;
      const finishTimestamp: number = this.getTimestamp();
      //logger.debug(`${new Date().toJSON()} : handleResponse response: ${response}`);
      const apiResponse = this.buildApiResponse(response, resource, originalUrl, method);
      if (timestamp) apiResponse.duration = finishTimestamp - timestamp;
      if (apiResponse.contentType) {
        if (apiResponse.contentType.toLowerCase().includes('application/json') || apiResponse.contentType.toLowerCase().includes('application/problem+json')) {
          logger.debug(`${new Date().toJSON()} : Content-Type header indicates JSON data: ${apiResponse.contentType}`);
          this.parseJsonResponse(apiResponse, response).then((updatedApiResponse) => {
            resolve(updatedApiResponse);
          });
        } else if (apiResponse.contentType.includes('application/pdf')) {
          logger.debug(`${new Date().toJSON()} : Content-Type header indicates PDF data: ${apiResponse.contentType}`);
          this.parseBlobResponse(apiResponse, response).then((updatedApiResponse) => {
            resolve(updatedApiResponse);
          });
        } else {
          logger.debug(`${new Date().toJSON()} : Content-Type header indicates text data: ${apiResponse.contentType}`);
          this.parseTextResponse(apiResponse, response).then((updatedApiResponse) => {
            resolve(updatedApiResponse);
          });
        }
      } else {
        logger.warn(`${new Date().toJSON()} : Content-Type header not found, treating response body is string content`);
        this.parseTextResponse(apiResponse, response).then((updatedApiResponse) => {
          resolve(updatedApiResponse);
        });
      }
    });
  }

  private buildApiResponse(response: Response, resource: string, originalUrl: string, method: string): ApiResponse {
    const apiResponse = new ApiResponse({ success: response.ok, resource, url: response.url, method });
    apiResponse.timestamp = new Date();
    // check if redirected
    apiResponse.redirected = response.redirected;
    if (response.redirected) {
      apiResponse.originalUrl = originalUrl;
      logger.warn(`${new Date().toJSON()} : The Request was Redirected from: ${apiResponse.originalUrl} \nto: ${apiResponse.url}`);
    }
    logger.debug(`${new Date().toJSON()} : Response Status: ${response.status} (${response.statusText})`);
    apiResponse.statusCode = response.status;
    apiResponse.statusText = response.statusText;
    apiResponse.responseType = response.type;
    if (response.headers) {
      apiResponse.contentType = response.headers.get('Content-Type');
      if (this.captureResponseHeaders) {
        apiResponse.headers = this.getHeadersObject(response.headers);
      }
    }
    logger.debug(`${new Date().toJSON()} : Response ContentType: ${apiResponse.contentType}`);
    if (this.logResponseHeaders) {
      const headersObject: any = apiResponse.headers ? apiResponse.headers : this.getHeadersObject(response.headers);
      const headers: string = JSON.stringify(headersObject, null, 2);
      logger.debug(`${new Date().toJSON()} : Response Headers:\n${headers}`);
    }
    return apiResponse;
  }

  private getHeadersObject(headers: Headers): any {
    const headersObject: any = {};
    headers.forEach((value, name) => {
      headersObject[name] = value;
    });
    return headersObject;
  }

  // Always resolves with ApiResponse
  private parseJsonResponse(apiResponse: ApiResponse, response: Response): Promise<ApiResponse> {
    return new Promise((resolve, reject) => {
      // Extract the response body depending on value of alwaysPopulateResponseBody
      // The method below rejects on failure as no point in trying to parse as json if can't parse as text
      this.extractResponseBody(apiResponse, response).then((body) => {
        apiResponse.body = body;
        // It's not valid to have a content-type of application/json if the body isn't valid json
        // response.json() will throw on an empty response
        // However some API's may still send that kind of response in some circumstances
        // To handle those scenarios, parse as text instead and then use JSON.parse(text) as below
        response.text().then((text) => {
          if (text) {
            const jsonData = JSON.parse(text);
            logger.debug('json data:', jsonData);
            // Since the update to RFC 7159, the root of a conforming JSON document can be any JSON value. In earlier RFC 4627, only objects or arrays were allowed as root values.
            // https://tools.ietf.org/html/rfc7159.html#section-3
            // Valid JSON value types: boolean (true/false) / null / object / array / number / string
            let jsonType;
            if (jsonData === null) {
              jsonType = 'null'; // Accounts for the bogus (typeof null) return value
            } else {
              jsonType = typeof jsonData; // typeof reports arrays as objects
            }
            apiResponse.dataType = Array.isArray(jsonData) ? 'array' : jsonType; // account for typeof returning "object" for arrays
            logger.debug('json data type:', apiResponse.dataType);
            if (jsonType !== 'object' && this.allowOnlyObjectsAndArraysInJsonRoot) {
              this.handleResponseBodyParsingError(apiResponse, new Error('The JSON root element must be an object or array'));
            } else {
              apiResponse.data = jsonData;
              this.processApiResponse(apiResponse);
            }
          } else if (this.allowEmptyJsonResponses) {
            this.processApiResponse(apiResponse);
          } else {
            this.handleResponseBodyParsingError(apiResponse, new Error('Cannot parse an empty response body as JSON'));
          }
          resolve(apiResponse);
        })
        // If we want application/json with empty body to result in an error, use this method
        // In the fetch source code, the json() method just calls text().then(JSON.parse)
        // response.json().then(json => {
        //   logger.debug('json data:', json);
        //   apiResponse.data = json;
        //   this.processApiResponse(apiResponse);
        //   resolve(apiResponse);
        // })
        .catch((error) => {
          this.handleResponseBodyParsingError(apiResponse, error);
          resolve(apiResponse);
        });
      })
      .catch((error) => {
        this.handleResponseBodyParsingError(apiResponse, error);
        resolve(apiResponse);
      });
    });
  }

  // Always resolves with ApiResponse
  private parseBlobResponse(apiResponse: ApiResponse, response: Response): Promise<ApiResponse> {
    return new Promise((resolve, reject) => {
      response.blob().then((blob) => {
        apiResponse.blob = blob;
        this.processApiResponse(apiResponse);
        resolve(apiResponse);
      })
      .catch((error) => {
        this.handleResponseBodyParsingError(apiResponse, error);
        resolve(apiResponse);
      });
    });
  }

  // Always resolves with ApiResponse
  private parseTextResponse(apiResponse: ApiResponse, response: Response): Promise<ApiResponse> {
    return new Promise((resolve, reject) => {
      response.text().then((text) => {
        logger.debug('text data:', text);
        apiResponse.body = text;
        this.processApiResponse(apiResponse);
        resolve(apiResponse);
      })
      .catch((error) => {
        this.handleResponseBodyParsingError(apiResponse, error);
        resolve(apiResponse);
      });
    });
  }

  // Rejects with error on failure
  private extractResponseBody(apiResponse: ApiResponse, response: Response): Promise<string> {
    return new Promise((resolve, reject) => {
      if (this.alwaysPopulateResponseBody && response) {
        logger.debug('alwaysPopulateResponseBody is true, getting body as text data');
        response.clone().text().then((text) => {
          logger.debug('text data:', text);
          resolve(text);
        })
        .catch((error) => { reject(error); });
      } else {
        resolve(null);
      }
    });
  }

  private processApiResponse(apiResponse: ApiResponse) {
    // A zero status code could mean that a cross-origin request was made using 'no-cors' mode.
    // such a request would result in an "opaque" response, the status, body or any other data will not be available
    if (apiResponse.statusCode === 0) {
      apiResponse.statusText = 'Unknown';
      return;
    }
    if (!apiResponse.success) {
      const errorTitle = `Failure StatusCode: ${apiResponse.statusCode} (${apiResponse.statusText})`;
      apiResponse.errorTitle = errorTitle;
      apiResponse.errorType = 'FailureStatusCode';
      if (apiResponse.data) {
        logger.error(`${new Date().toJSON()} : StatusCode indicates Failure : Response Object:\n${apiResponse.data}`);
        this.parseKnownErrors(apiResponse);
      } else if (apiResponse.body) {
        logger.error(`${new Date().toJSON()} : StatusCode indicates Failure : Response Body:\n${apiResponse.body}`);
        apiResponse.errorDetail = this.truncate(apiResponse.body, 100);
      } else {
        logger.error(`${new Date().toJSON()} : StatusCode indicates Failure : Response Body is empty!`);
      }
      this.logError(apiResponse);
    }
  }

  // Note: CORS failures result in errors, but for security reasons,
  // specifics about what went wrong are not available to JavaScript code.
  // All the code knows is that an error occurred. "Failed to fetch"
  // The only way to determine what went wrong is to look at the browser's console for details.
  private handleError(error: any, resource: string, url: string, method: string, timestamp: number, didTimeout: boolean, errorTitle?: string): ApiResponse {
    logger.debug(`${new Date().toJSON()} : handleError errorTitle: ${errorTitle} error: ${error}`);
    const finishTimestamp: number = this.getTimestamp();
    const apiResponse = new ApiResponse({ success: false, resource, url, method });
    apiResponse.duration = finishTimestamp - timestamp;
    apiResponse.errorTitle = `${errorTitle ? errorTitle : 'Request Error'}`;
    apiResponse.errorDetail = `Error occurred while sending ${apiResponse.method} request to resource: ${apiResponse.resource}`;
    if (error instanceof Error) {
      logger.debug('error is an Error object');
      let newError = error;
      if (error.name === 'AbortError') {
        if (didTimeout) {
          newError = new Error(`Request timed out, did not receive response within ${this.requestTimeout} seconds`);
          newError.name = 'RequestTimeoutError';
        } else {
          apiResponse.errorTitle = 'Request Aborted';
          apiResponse.errorDetail = `The Request was Aborted while sending ${apiResponse.method} request to resource: ${apiResponse.resource}`;
        }
      }
      apiResponse.error = newError;
      apiResponse.errorType = newError.name;
      apiResponse.errorDetail = `${apiResponse.errorDetail} \nError: ${newError.message}`;
    } else {
      logger.debug('error is an unknown object');
      apiResponse.errorType = `${error.constructor}`;
      apiResponse.errorDetail = `Unknown Error: ${error}`;
    }
    this.logError(apiResponse);
    return apiResponse;
  }

  private handleResponseBodyParsingError(apiResponse: ApiResponse, error: any) {
    apiResponse.success = false;
    const errorDetail = `Error occurred while parsing the response body with content type: ${apiResponse.contentType} from resource: ${apiResponse.resource}\nError: ${error.message}`;
    logger.error(`${new Date().toJSON()} : ${errorDetail}`);
    apiResponse.error = error;
    apiResponse.errorTitle = 'Response Body Parsing Error';
    apiResponse.errorType = 'ResponseBodyParsingError';
    apiResponse.errorDetail = errorDetail;
    this.logError(apiResponse);
  }

  private logError(apiResponse: ApiResponse) {
    logger.error(`${new Date().toJSON()} : 
        apiResponse.errorTitle ${apiResponse.errorTitle} \n
        apiResponse.errorType ${apiResponse.errorType} \n
        apiResponse.errorDetail: ${apiResponse.errorDetail}`);
  }

  private parseKnownErrors(apiResponse: ApiResponse) {
    // Look for some of our Api defined error messages
    let result = this.parseProblemDetails(apiResponse, apiResponse.data);
    if (!result && apiResponse.data.error) {
      result = this.parseProblemDetails(apiResponse, apiResponse.data.error);
    }
    if (!result && apiResponse.data.errors) {
      const errors = apiResponse.data.errors;
      result = this.parseProblemDetails(apiResponse, errors);
      if (!result && errors.error) {
        result = this.parseProblemDetails(apiResponse, errors.error);
      }
    }
    if (!result && apiResponse.data.respErr) {
      result = this.parseProblemDetails(apiResponse, apiResponse.data.respErr);
    }
    if (apiResponse.errorTitle || apiResponse.errorType || apiResponse.errorDetail) {
      logger.debug(`${new Date().toJSON()} : Known Errors have been found!`);
      return true;
    }
    return false;
  }

  // Parses errors from a Problem Details response
  // https://tools.ietf.org/html/rfc7807
  // and also other common error response formats
  private parseProblemDetails(apiResponse: ApiResponse, data: any) {
    // Look for some of our Api defined error messages
    if (!data) return false;
    if (typeof data === 'object') {
      let obj = data;
      if (Array.isArray(obj)) {
        if (obj.length === 0) return false; // nothing we can do here
        obj = data[0]; // ok, so get the first element
      }
      // check for properties we are interested in
      if (obj.title) {
        apiResponse.errorTitle = obj.title;
      }
      if (!apiResponse.errorTitle && obj.name) {
        apiResponse.errorTitle = obj.name;
      }
      if (obj.type) {
        apiResponse.errorType = obj.type;
      }
      if (!apiResponse.errorType && obj.code) {
        apiResponse.errorType = obj.code;
      }
      if (obj.detail) {
        apiResponse.errorDetail = obj.detail;
      }
      if (!apiResponse.errorDetail && obj.message) {
        apiResponse.errorDetail = obj.message;
      }
      if (obj.instance) {
        apiResponse.errorInstance = obj.instance;
      }
    } else {
      apiResponse.errorDetail = String(data);
    }
    // we are really only looking for a title and detail, type and instance are not that important
    if (apiResponse.errorTitle || apiResponse.errorDetail) return true;
    return false;
  }

  // Helpers
  // tslint:disable-next-line:member-ordering
  protected joinUrl(baseUrl, url) {
    if (/^(?:[a-z]+:)?\/\//i.test(url)) {
      return url; // url is an absolute url so just return it
    }
    const joined = [baseUrl, url].join('/');
    const normalize = (str) => {
      return str
        .replace(/[\/]+/g, '/')
        .replace(/\/\?/g, '?')
        .replace(/\/\#/g, '#')
        .replace(/\:\//g, '://');
    };
    return normalize(joined);
  }

  private truncate(text: string, length: number) {
    if (text.length > length) {
      return text.substring(0, length - 3) + '...';
    } else {
      return text;
    }
  }

  private getTimestamp(): number {
    if (Date.now) {
      return Date.now();
    } else {
      return new Date().getTime();
    }
  }
}

// Defines an object for expressing a query parameter
interface QueryParam {
  name: string;
  value: string;
}

//Copied from the aurelia-fetch-client source
/**
* The init object used to initialize a fetch Request.
* See https://developer.mozilla.org/en-US/docs/Web/API/Request/Request
*/
interface RequestInit {
  /**
  * The request method, e.g., GET, POST.
  */
  method?: string;

  /**
  * Any headers you want to add to your request, contained within a Headers object or an object literal with ByteString values.
  */
  // tslint:disable-next-line:ban-types
  headers?: Headers|Object;

  /**
  * Any body that you want to add to your request: this can be a Blob, BufferSource, FormData, URLSearchParams, or USVString object. Note that a request using the GET or HEAD method cannot have a body.
  */
  body?: Blob|BufferSource|FormData|URLSearchParams|string;

  /**
  * The mode you want to use for the request, e.g., cors, no-cors, same-origin, or navigate. The default is cors. In Chrome the default is no-cors before Chrome 47 and same-origin starting with Chrome 47.
  */
  mode?: string;

  /**
  * The request credentials you want to use for the request: omit, same-origin, or include. The default is omit. In Chrome the default is same-origin before Chrome 47 and include starting with Chrome 47.
  */
  credentials?: string;

  /**
  * The cache mode you want to use for the request: default, no-store, reload, no-cache, or force-cache.
  */
  cache?: string;

  /**
  * The redirect mode to use: follow, error, or manual. In Chrome the default is follow before Chrome 47 and manual starting with Chrome 47.
  */
  redirect?: string;

  /**
  * A USVString specifying no-referrer, client, or a URL. The default is client.
  */
  referrer?: string;

  /**
  * Contains the subresource integrity value of the request (e.g., sha256-BpfBw7ivV8q2jLiT13fxDYAe2tJllusRSZ273h2nFSE=).
  */
  integrity?: string;

  /**
   * An AbortSignal to set request’s signal.
   */
  signal?: AbortSignal;
}
