using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace dotnetcore21_spa
{
    public class Program
    {
        public static void Main(string[] args)
        {
            CreateWebHostBuilder(args).Build().Run();
        }

        public static IWebHostBuilder CreateWebHostBuilder(string[] args) =>
            WebHost.CreateDefaultBuilder(args)
                .UseStartup<Startup>();
                // Sample to show how to specify ports and cert manually
                // .UseKestrel(options =>
                // {
                //     var configuration = (IConfiguration)options.ApplicationServices.GetService(typeof(IConfiguration));
                //     var httpPort = configuration.GetValue("ASPNETCORE_HTTP_PORT", 80);
                //     var httpsPort = configuration.GetValue("ASPNETCORE_HTTPS_PORT", 443);
                //     var certPassword = configuration.GetValue<string>("Kestrel:Certificates:Development:Password");
                //     var certPath = configuration.GetValue<string>("Kestrel:Certificates:Development:Path");

                //     Console.WriteLine($"{nameof(httpsPort)}: {httpsPort}");
                //     Console.WriteLine($"{nameof(certPassword)}: {certPassword}");
                //     Console.WriteLine($"{nameof(certPath)}: {certPath}");

                //     options.Listen(IPAddress.Any, httpPort);
                //     options.Listen(IPAddress.Any, httpsPort, listenOptions =>
                //     {
                //         listenOptions.UseHttps(certPath, certPassword);
                //     });
                // });
    }
}
