using System.IO;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Internal;

namespace dotnetcore21_spa.CustomActionResults
{
    public class StringAsJsonResult : ActionResult
    {
        public int StatusCode { get; set; }

        public string Value { get; set; }

        public StringAsJsonResult(string value)
        {
            this.Value = value;
            this.StatusCode = 200;
        }

        public StringAsJsonResult(int statusCode, string value)
        {
            this.Value = value;
            this.StatusCode = statusCode;
        }

        public override Task ExecuteResultAsync(ActionContext context)
        {
            var response = context.HttpContext.Response;
            response.ContentType = "application/json";
            response.StatusCode = StatusCode;
            var bytes = Encoding.ASCII.GetBytes(this.Value ?? "null");
            context.HttpContext.Response.Body.WriteAsync(bytes, 0, bytes.Length);
            return Task.CompletedTask;
        }
    }
}