using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SpaServices.AngularCli;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System.IO;

namespace dotnetcore21_spa
{
    public class Startup
    {
        public Startup(IConfiguration configuration, ILogger<Startup> logger)
        {
            Configuration = configuration;
            // Debugging info to help with running in Docker
            string defaultCertPath = configuration.GetSection("Kestrel:Certificates:Default:Path").Value;
            logger.LogInformation($"Kestrel Default cert path: {defaultCertPath}");
            if (!string.IsNullOrEmpty(defaultCertPath)) {
                if (File.Exists(defaultCertPath)) {
                    logger.LogInformation("Default Cert file exists");
                } else {
                    logger.LogInformation("Default Cert file does NOT exist!"); 
                } 
            }  
            logger.LogInformation($"Kestrel Default cert pass: {configuration.GetSection("Kestrel:Certificates:Default:Password").Value}");
            
            string devCertPath = configuration.GetSection("Kestrel:Certificates:Development:Path").Value;
            logger.LogInformation($"Kestrel Development cert path: {devCertPath}");
            if (!string.IsNullOrEmpty(devCertPath)) {
                if (File.Exists(devCertPath)) {
                    logger.LogInformation("Development Cert file exists");
                } else {
                    logger.LogInformation("Development Cert file does NOT exist!"); 
                }   
            }
            logger.LogInformation($"Kestrel Development cert pass: {configuration.GetSection("Kestrel:Certificates:Development:Password").Value}");

        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddCors();

            services.AddMvc().SetCompatibilityVersion(CompatibilityVersion.Version_2_1);

            // In production, the Angular files will be served from this directory
            services.AddSpaStaticFiles(configuration =>
            {
                configuration.RootPath = "ClientApp/dist";
            });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILogger<Startup> logger)
        {
            logger.LogInformation($"env.EnvironmentName: {env.EnvironmentName}"); //Log the exact name of the environment
            
            // app.UseCors(builder => 
            //     builder.AllowAnyOrigin()
            //         .AllowAnyMethod().AllowAnyHeader()
            //     );

            app.UseCors(builder => 
                builder.WithOrigins("http://localhost:8080","http://localhost")
                    .AllowAnyMethod().AllowAnyHeader()
                    //.AllowCredentials()
                    //.WithExposedHeaders("x-custom-header")
                );

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Error");
                app.UseHsts();
            }

            app.UseHttpsRedirection();
            app.UseStaticFiles();
            app.UseSpaStaticFiles();

            app.UseMvc(routes =>
            {
                routes.MapRoute(
                    name: "default",
                    template: "{controller}/{action=Index}/{id?}");
            });

            app.UseSpa(spa =>
            {
                // To learn more about options for serving an Angular SPA from ASP.NET Core,
                // see https://go.microsoft.com/fwlink/?linkid=864501

                spa.Options.SourcePath = "ClientApp";

                // In Development env, ClientApp is served by Webpack Dev server
                // In Production env, ClientApp is served using minified and bundled code from 'ClientApp/dist'
                if (env.IsDevelopment())
                {
                    //spa.UseAngularCliServer(npmScript: "start");
                    //spa.UseProxyToSpaDevelopmentServer(baseUri: "http://localhost:4200"); // Alternative for Angular
                    
                    // Aurelia Webpack Dev Server
                    spa.UseProxyToSpaDevelopmentServer(baseUri: "http://localhost:8080");
                }
            });
        }
    }
}
