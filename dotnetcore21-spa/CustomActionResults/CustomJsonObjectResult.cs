using System.IO;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Internal;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace dotnetcore21_spa.CustomActionResults
{
    public class CustomJsonObjectResult : ActionResult
    {
        public int StatusCode { get; set; }

        public object Value { get; set; }

        public CustomJsonObjectResult(object value)
        {
            this.Value = value;
            this.StatusCode = 200;
        }

        public CustomJsonObjectResult(int statusCode, object value)
        {
            this.Value = value;
            this.StatusCode = statusCode;
        }

        public override Task ExecuteResultAsync(ActionContext context)
        {
            var response = context.HttpContext.Response;
            response.ContentType = "application/json";
            response.StatusCode = StatusCode;
            string json = JsonConvert.SerializeObject(this.Value, Formatting.Indented,
                                new JsonConverter[] {new StringEnumConverter()});
            var bytes = Encoding.ASCII.GetBytes(json);
            context.HttpContext.Response.Body.WriteAsync(bytes, 0, bytes.Length);
            return Task.CompletedTask;
        }
    }
}