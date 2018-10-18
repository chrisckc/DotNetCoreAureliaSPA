using System.IO;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Internal;

namespace dotnetcore21_spa.CustomActionResults
{
    public class EmptyJsonResult : ActionResult
    {
        public int StatusCode { get; set; }

        public EmptyJsonResult()
        {
            this.StatusCode = 200;
        }

        public EmptyJsonResult(int statusCode)
        {
            this.StatusCode = statusCode;
        }

        public override Task ExecuteResultAsync(ActionContext context)
        {
            var response = context.HttpContext.Response;
            response.ContentType = "application/json";
            response.StatusCode = StatusCode;
            return Task.CompletedTask;
        }
    }
}