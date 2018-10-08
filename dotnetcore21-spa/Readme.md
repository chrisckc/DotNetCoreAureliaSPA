# ASP.NET Core with Aurelia SPA

This is based on the latest Angular template, the template was then updated to use Aurelia instead.

This was created by running 'dotnet new angular' using the latest dotnet v2.1 built-in SpaTemplates.
The ClientApp dir was then replaced by a new one generated using the Aurelia CLI.
This was done to use the new style of .NET Core SPA templates which use the
'UseProxyToSpaDevelopmentServer' middleware rather than the 'UseWebpackDevMiddleware'.

There is no new style template available for Aurelia, so the Angular template was used as the starting point.
The old templates are now retired:
https://github.com/aspnet/Announcements/issues/289
There will no longer be any Aurelia/Knockout/Vue templates.

I agree with this comment:
https://github.com/aspnet/JavaScriptServices/issues/1522#issuecomment-364333953
but understand why they have reduced the number of supported templates.

See Readme inside ClientApp dir for notes on how the Aurelia project was created.

The decision to just proxy the requests to the SPA Dev server seems to have been made to allow developers to use the standard dev workflow for the SPA framework (which for both Angular and Aurelia now seems to be the CLI). The ClientApp is no longer tied into the .NET code and can be developed as a separate project if required further down in the development process. In Production the ClientApp is just served from the minified and bundled code in the 'ClientApp/dist' dir using the AddSpaStaticFiles middleware.

Running both the .NET backend and ClientApp under the .NET host has advantages in both development and production for small projects. The ClientApp can easily be separated out and served from another location by another method if required, as long as CORS is used. To avoid CORS, Nginx reverse proxy could be used to serve both the .NET App and ClientApp from the same origin.

The previous SPA template method is detailed here:

https://blogs.msdn.microsoft.com/webdev/2017/02/14/building-single-page-applications-on-asp-net-core-with-javascriptservices/

https://docs.microsoft.com/en-us/aspnet/core/client-side/spa-services?view=aspnetcore-2.0

The new method detailed here:

https://github.com/aspnet/JavaScriptServices/issues/1288

https://github.com/aspnet/JavaScriptServices/issues/1288#issuecomment-346003334

https://docs.microsoft.com/en-us/aspnet/core/client-side/spa/angular?view=aspnetcore-2.1&tabs=visual-studio

## Running the Project

### Setup

Make sure .NET Core SDK 2.1 and NodeJS is installed, the Latest 8.x LTS version is a good choice.

Update NPM globally:
```npm install npm@latest -g```

Install Aurelia CLI globally:
```npm install aurelia-cli -g```

From within the ClientApp dir run:
```npm install```

### Running in dev
To run this in dev you need to run both dotnet and the Aurelia dev server (Webpack dev server)

#### dotnet application:
From within the dotnetcore21-spa dir run:

```dotnet run```

#### aurelia/webpack dev server:
From within the ClientApp dir run:

```au run --watch```
or
```npm start```

Note: don't use the --hmr flag (Hot Module Reloading) as it breaks the automatic refresh through the 
UseProxyToSpaDevelopmentServer middleware, an issue has been logged about this as it works in Angular.
https://github.com/aspnet/JavaScriptServices/issues/1743
Hot Module Reloading only works when the Aurelia app is viewed directly. I haven't had time to look into it any further.

The app can be viewed through the usual http://localhost:5000
or the Aurelia App can be viewed directly via http://localhost:8080
Changes to the ClientApp code will auto-refresh the browser.
To also auto-refresh the browser on changes to the .NET code use:
```dotnet watch run```


### Testing

To run the unit tests:
`au jest`

To run the UI tests:
`au karma`


### Publishing
```dotnet publish -c Release```
This builds and publishes both the .NET App and the Aurelia App.
The published files can then be found here:
/DotNetCoreSpa/dotnetcore21-spa/bin/Release/netcoreapp2.1/publish


### Building the Aurelia App Separately:
If you wish to build the Aurelia app separately for whatever reason:
```au build --env prod```   (use either dev, stage, prod)
This creates the minified and bundled ClientApp code in the 'ClientApp/dist' dir.


# Build Notes

Added docker support by creating Dockerfile and docker-compose files.
Dockerfile was created by adding Docker support via VSCode docker extension, docker file updated to add NodeJS to the build container, Update NPM and install the Aurelia CLI.

Also added the following to the generated .dockerignore file:
```
**/node_modules/
**/dist/
```

Experimented with HTTPS support in docker for both development and production scenarios.
Used the auto generated "ASP.NET Core HTTPS Development Certificate" for testing.
I prefer to use Nginx for adding HTTPS support.

### Changes required to the .NET project

In addition to swapping out the ClientApp dir, the following changes were made:

Updated Startup.cs:
Added some debugging statements to the Startup method.

Replaced:

```spa.UseAngularCliServer(npmScript: "start");```

with:

```spa.UseProxyToSpaDevelopmentServer(baseUri: "http://localhost:8080");```

Edited Program.cs:
Added sample code to demonstrate manually specifying the cert location and password.

To fix publishing error, edited .csproj file:
Replaced the line:

```<Exec WorkingDirectory="$(SpaRoot)" Command="npm run build -- --prod" />```

with:

```<Exec WorkingDirectory="$(SpaRoot)" Command="au build --env prod" />```

or, if you want to build Aurelia using webpack directly rather than use the CLI:

```<Exec WorkingDirectory="$(SpaRoot)" Command="npm run build --prod" />```

Removed the line that is not required for Aurelia:

```<Exec WorkingDirectory="$(SpaRoot)" Command="npm run build:ssr -- --prod" Condition=" '$(BuildServerSideRenderer)' == 'true' " />```

Added UserSecrets support to the csproj file:

```<UserSecretsId>generated-a-guid</UserSecretsId>```






