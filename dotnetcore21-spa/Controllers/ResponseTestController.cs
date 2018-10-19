using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using dotnetcore21_spa.CustomActionResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace DemoServer.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class ResponseTestController : ControllerBase
    {
        private readonly ILogger<ResponseTestController> _logger;
        
        public ResponseTestController(ILogger<ResponseTestController> logger)
        {
            _logger = logger;
        }

        // If the Request header Accept =  application/json,
        // sends a response body containing "somestring" (quotes added by json serializer) with Content-Type = application/json
        // Note that "some-string" is a valid json response (a json string value), some-string (without quotes) is not valid json
        // refer to https://tools.ietf.org/html/rfc7159.html
        // If no Accept application/json header is supplied,
        // sends a response body containing some-string (without quotes) with Content-Type = text/plain
        public ActionResult<dynamic> Get200String()
        {
            string json = "some-string";
            return json;
        }

        // Always sends a response body containing 1 with Content-Type = application/json
        // 1 is a valid json value type of number
        // regardless of the Request's Accept Header
        public ActionResult<dynamic> Get200Number()
        {
            var json = 1;
            return json;
        }

        // Always sends a response body containing false with Content-Type = application/json
        // false is a valid json value type of boolean
        // regardless of the Request's Accept Header
        public ActionResult<dynamic> Get200BooleanFalse()
        {
            var json = false;
            return json;
        }

        // Always sends a response body containing true with Content-Type = application/json
        // true is a valid json value type of boolean
        // regardless of the Request's Accept Header
        public ActionResult<dynamic> Get200BooleanTrue()
        {
            var json = true;
            return json;
        }

        public ActionResult<dynamic> Get200EmptyObject()
        {
            var obj = new {};
            return obj;
        }

        // Actually sends a 204 NoContent with an empty response body and no content-type header,
        // regardless of the Request's Accept Header
        public ActionResult<dynamic> Get200Null()
        {
            return null;
        }

        // The only way to return the string null as a json response
        // null is a valid json value type of null
        // Valid JSON value types: boolean (true/false) / null / object / array / number / string
        // https://tools.ietf.org/html/rfc7159.html
        public ActionResult<dynamic> Get200NullAsJson()
        {
            return new StringAsJsonResult(null);
        }

        // An easy way to return an invalid json response for testing clients etc.
        public ActionResult<dynamic> Get200InvalidJson()
        {
            //string jsonString = "{ \"Test\": 1,";
            string jsonString = "[ \"test\" : 123 ]";
            return new StringAsJsonResult(jsonString);
        }

        // An easy way to return an invalid json response for testing clients etc.
        public ActionResult<dynamic> Get200InvalidJson2()
        {
            string jsonString = "{ ";
             return new StringAsJsonResult(jsonString);
        }

        // returns an application/json content-type with an empty body
        public ActionResult<dynamic> Get200Empty()
        {
            //return Ok(null); // actually returns a 204 NoContent
            //return StatusCode(200, null); // actually returns a 204 NoContent
            //return new EmptyResult();  // returns 200 ok with an empty content-type header
            //return new ObjectResult(null); // returns 200 ok with an empty content-type header
            //return new OkResult(); // returns 200 ok with an empty content-type header
            //return new OkObjectResult(null); // actually returns a 204 NoContent

            // EmptyJsonResult returns an application/json content-type with an empty body
            // That type of response is usually regarded as invalid, used for testing client implementations
            return new EmptyJsonResult(200);
        }

        [HttpGet("{id}")]
        public ActionResult<dynamic> Get200(int id)
        {
            var obj = new { Demo = new { Title = $"Get200 {id}", Message = $"Ok {id}", Timestamp = DateTime.Now } };
            return obj;
        }

        [HttpGet] // without this decorator the method would accept any http method
        public ActionResult<dynamic> Get200()
        {
            var list = new List<dynamic>();
            for (int i = 0; i < 10; i++) {
                var demo =  new { Title = $"Get200 {i}", Message = $"Ok {i}", Timestamp = DateTime.Now.AddDays(i) };
                list.Add(demo);
            }
            var obj = new { Demos = list };
            return obj;
        }

        public ActionResult<dynamic> Get200Array()
        {
            var list = new List<dynamic>();
            for (int i = 0; i < 10; i++) {
                var demo =  new { Title = $"Get200Array {i}", Message = $"Ok {i}", Timestamp = DateTime.Now.AddDays(i) };
                list.Add(demo);
            }
            return list;
        }

        

        public ActionResult<dynamic> Get204()
        {
            return NoContent();
        }

        [HttpPost]
        public ActionResult<dynamic> Post201(dynamic obj)
        {
            return CreatedAtAction("Post201", obj); // resource created
        }

        [HttpPut]
        public ActionResult<dynamic> Put200(dynamic obj)
        {
            return obj; // resource updated
        }

        [HttpDelete("{id}")]
        public ActionResult<dynamic> Delete202(int id)
        {
            return StatusCode(202); // resource marked for deletion
        }

        [HttpDelete("{id}")]
        public ActionResult<dynamic> Delete204(int id)
        {
            return StatusCode(204); // resource deleted successfully
        }

        // Returns a RedirectPermanent 301 Moved Permanently
        public ActionResult<dynamic> Redirect301() 
        {
            //return new RedirectResult("https://localhost:5001/api/ResponseTest/Get200/1", true);
            return RedirectPermanent("https://localhost:5001/api/ResponseTest/Get200/1");
        }

        // Returns a Redirect 302 Found (Temporarily moved)   
        public ActionResult<dynamic> Redirect302()
        {
            //return new RedirectResult("https://localhost:5001/api/ResponseTest/Get200/1");
            return Redirect("https://localhost:5001/api/ResponseTest/Get200/1");
        }

        // Returns a RedirectPreserveMethod 307 Temporary Redirect
        public ActionResult<dynamic> Redirect307() 
        {
            //return new RedirectResult("https://localhost:5001/api/ResponseTest/Get200/1", false, true);
            return RedirectPreserveMethod("https://localhost:5001/api/ResponseTest/Get200/1");
        }

        // Returns a RedirectPermanentPreserveMethod 308 Permanent Redirect
        public ActionResult<dynamic> Redirect308() 
        {
            //return new RedirectResult("https://localhost:5001/api/ResponseTest/Get200/1", true, true);
            return RedirectPermanentPreserveMethod("https://localhost:5001/api/ResponseTest/Get200/1");
        }

        public ActionResult<dynamic> Get400()
        {
            var obj = new { Error = new { Title = "Get400", Type = "BadRequest", Detail = "The request was invalid", Timestamp = DateTime.Now } };
            return BadRequest(obj);
        }

        public ActionResult<dynamic> Get401()
        {
            return Unauthorized();
        }

        public ActionResult<dynamic> Get403()
        {
            var obj = new { Error = new { Title = "Get403",  Type = "Forbidden", Detail = "Access to the resource was not allowed", Timestamp = DateTime.Now } };
            return StatusCode(403, obj);
        }

        public ActionResult<dynamic> Get404()
        {
            var obj = new { Error = new { Title = "Get404", Type = "NotFound", Detail = "The resource was not found", Timestamp = DateTime.Now } };
            return NotFound(obj);
        }

        public ActionResult<dynamic> Get408()
        {
            var obj = new { Error = new { Title = "Get408", Type = "RequestTimeout", Detail = "The request timed out", Timestamp = DateTime.Now } };
            return StatusCode(408, obj);
        }

        public ActionResult<dynamic> Get409()
        {
            var obj = new { Error = new { Title = "Get409", Type = "Conflict", Detail = "There was a conflict while...", Timestamp = DateTime.Now } };
            return Conflict(obj);
        }

        [HttpGet("{retryAfter}")]
        public ActionResult<dynamic> Get429(int retryAfter)
        {
            var obj = new { Error = new { Title = "Get429", Type = "TooManyRequests", Detail = $"Too Many Requests, Retry After {retryAfter} Seconds", Timestamp = DateTime.Now } };
            Request.HttpContext.Response.Headers.Add("Retry-After", retryAfter.ToString());
            return StatusCode(429, obj);
        }

        public ActionResult<dynamic> Get500()
        {
            var obj = new { Error = new { Title = "Get500", Type = "ServerError", Detail = "An error occurred on the server", Timestamp = DateTime.Now } };
            return StatusCode(500, obj);
        }

        [HttpGet("{delay}")]
        public async Task<ActionResult<dynamic>> GetDelay(int delay)
        {
            var obj = new { Demo = new { Title = "GetTimedOut", Type = "Delayed", Detail = $"The Request was delayed for {delay} Seconds", Timestamp = DateTime.Now } };
            await Task.Delay(TimeSpan.FromSeconds(delay));
            return obj;
        }

        public async Task<ActionResult<dynamic>> GetTimedOut()
        {
            var obj = new { Demo = new { Title = "GetTimedOut", Type = "DeliberateTimeout", Detail = "The Request was deliberately Timed out", Timestamp = DateTime.Now } };
            await Task.Delay(Timeout.InfiniteTimeSpan);
            return obj;
        }
    }
}
