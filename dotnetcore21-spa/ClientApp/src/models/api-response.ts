export interface IApiResponseOptions {
  success: boolean;
  resource: string;
  url: string;
  method: string;
  statusCode?: number;
  statusText?: string;
  data?: any;
  error?: Error;
}

export class ApiResponse {
  public success: boolean;
  public resource: string;
  public url: string;
  public originalUrl?: string; // populated if redirected
  public method: string;
  public statusCode?: number;
  public statusText?: string;

  public responseType?: string; // Contains the type of the response (e.g., basic, cors, opaque).
  // If a request is made for a resource on another origin which returns the CORs headers, then the type is cors.
  // cors and basic responses are almost identical except that a cors response restricts
  // the headers you can view to `Cache-Control`, `Content-Language`, `Content-Type`, `Expires`, `Last-Modified`, and `Pragma`.
  // An opaque response is for a request made for a resource on a different origin that doesn't return CORS headers.
  // With an opaque response we won't be able to read the data returned or view the status of the request,
  // meaning we can't check if the request was successful or not.
  
  public redirected: boolean;
  public contentType?: string;
  public headers?: Headers;
  public data?: any; // Json object data
  public dataType?: any; // Json object data
  public body?: string; // The body as a string
  public blob?: any; // binary data
  public error?: Error;
  public errorTitle?: string;
  public errorType?: string;
  public errorDetail?: string;
  public errorInstance?: string;
  public messageTitle?: string; // this is to be used to show a custom message title on the UI
  public messageDetail?: string;
  public timestamp: Date;
  public duration?: number;

  constructor(options?: IApiResponseOptions) {
    if (options) {
      this.success = options.success;
      this.resource = options.resource;
      this.url = options.url;
      this.method = options.method;
      this.statusCode = options.statusCode;
      this.statusText = options.statusText;
      this.data = options.data;
      this.error = options.error;
    }
  }
}
