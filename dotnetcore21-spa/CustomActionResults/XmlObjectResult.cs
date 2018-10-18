using System.IO;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using System.Xml.Serialization;
using Microsoft.AspNetCore.Mvc.Internal;

namespace dotnetcore21_spa.CustomActionResults
{
    public class XmlObjectResult : ActionResult
    {
        public int StatusCode { get; set; }

        public object Value { get; set; }

        public XmlObjectResult(object value)
        {
            this.Value = value;
            this.StatusCode = 200;
        }

        public XmlObjectResult(int statusCode, object value)
        {
            this.Value = value;
            this.StatusCode = statusCode;
        }

        private string Serialize<T>(T value)
        {
            if (value == null)
            {
                return string.Empty;
            }

            var type = value.GetType();
            XmlSerializer serializer = new XmlSerializer(type);

            using (StringWriter writer = new StringWriter())
            {
                serializer.Serialize(writer, value);
                return writer.ToString();
            }
        }

        public override Task ExecuteResultAsync(ActionContext context)
        {
            var response = context.HttpContext.Response;
            response.ContentType = "application/xml";
            response.StatusCode = StatusCode;
            var xmlBytes = Encoding.ASCII.GetBytes(Serialize(Value));
            context.HttpContext.Response.Body.WriteAsync(xmlBytes, 0, xmlBytes.Length);
            return Task.CompletedTask;
        }
    }
}