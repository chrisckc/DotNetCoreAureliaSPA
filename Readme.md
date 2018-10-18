# ASP.NET Core with Aurelia SPA

This is based on the latest .NET Core v2.1 Angular template and then updated to use Aurelia instead.

The latest .NET Core v2.1 Angular template proxies requests to the Angular CLI server while in dev mode and serves the Angular app from static files when in production mode.
This project provides an Aurelia app configured in the same way, refer to Readme inside dotnetcore21-spa project dir for more details..

The main advantage to this method is to remove the need for CORS in both development and production by serving both the back-end API and the Client App from the same origin.

This project template was created to use a base for converting other projects to a .NET Core backend and Aurelia SPA frontend inline with current practices for each framework.

Specifically projects that used a Node/Express backend and Aurelia SPA frontend using the previously popular Gulp/JSPM/SystemJS/RequireJS build system.

### Setup

Make sure .NET Core SDK 2.1 and NodeJS is installed, the Latest 8.x LTS version is a good choice.

Update NPM globally:
```npm install npm@latest -g```

Install Aurelia CLI globally:
```npm install aurelia-cli -g```

cd into dotnetcore21-spa/ClientApp dir

From within the ClientApp dir run:
```npm install```


## VSCode

This project has been configured to run in VSCode with Javascript debugging.

To run the project, launch 2 separate VSCode instances, on against the root directory and one against the "dotnetcore21-spa/ClientApp" dir.

1. In a separate terminal window, cd into dotnetcore21-spa/ClientApp dir and run ```au run --watch``` to run the Aurelia CLI dev server in watch mode.

2. In the root dir VSCode instance, run in Debug by selecting the ".NET Core Launch (web)" profile

3. In the ClientApp VSCode instance, run in Debug by selecting the "Chrome Https 5001 Launch Debug" profile.

The second VSCode instance will launch Chrome pointing at https://localhost:5001 which is proxied through the dotnet app

Breakpoints can be set in both the back-end .Net Core Web Api and the front-end Aurelia client and will be hit in the relevant VSCode instance.

## Docker support

Experimented with HTTPS support in docker container, used the auto generated "ASP.NET Core HTTPS Development Certificate" for testing. I prefer to use Nginx for adding HTTPS support.

Note: If running this on a separate Docker host rather than on your development machine, you will see a certificate error because the dev certificate is for localhost so it won't match the hostname of a remote host.

### To run in Dev mode (no real use for this scenario)
```docker-compose -f docker-compose.yml -f docker-compose.dev.yml up```

Visit your docker host:
http://dockerhost:5000
and you should be redirected to:
https://dockerhost:5001 and see an error due to the Aurelia dev server not running inside the container.

TODO: Update the Dockerfile to also run the Aurelia dev server when running in Development mode, this will require NodeJS to be installed into the dotnet runtime container...


### To run in production mode (uses .override.yml file)
```docker-compose up -d```

Visit your docker host:
http://dockerhost:5000
and you should be redirected to:
https://dockerhost:5001

This works because the Aurelia dev server not used in production mode.
Edit the ports in the docker-compose file and use a real certificate for a real production environment.

## Docker HTTPS details

To remove the HTTPS support in docker, comment out the ```"ASPNETCORE_URLS"``` and ```"ASPNETCORE_HTTPS_PORT"``` env vars inside the docker-compose files.

Also need to either remove the UserSecrets file or comment out the volume mapping:
```"....:/root/.microsoft/usersecrets:ro,z"```

otherwise the default Startup code will try to look for the certificate.

Also comment out the ```"Kestrel:Certificates:..."``` env vars if used instead of UserSecrets

#### Used this guide to help get it working:
https://github.com/dotnet/dotnet-docker/blob/master/samples/aspnetapp/aspnetcore-docker-https-development.md

#### Adding UserSecrets
https://docs.microsoft.com/en-us/aspnet/core/security/app-secrets?view=aspnetcore-2.1&tabs=macos

#### Docker Compose notes:
Setup the docker-compose file as per notes here:
https://github.com/aspnet/Docs/issues/6199

### Mac OSX specific notes:

#### Export the dev certs to correct location in home dir:
```dotnet dev-certs https -v -ep ~/.aspnet/https/dotnetcore21-spa.pfx -p devcertpass```

#### Generate a guid
```uuidgen | awk '{print tolower($0)}'```

#### Add "UserSecretsId" property with the new guid to .csproj file under "PropertyGroup":
 ```
 <PropertyGroup>
    <TargetFramework>netcoreapp2.1</TargetFramework>
    <UserSecretsId>bbeb0a3d-2552-47df-b31e-d2a3e7577545</UserSecretsId>
```

#### Don't specifically add the cert path to UserSecrets, it breaks:
```dotnet user-secrets set "Kestrel:Certificates:Development:Path" "/root/.aspnet/https/dotnetcore21-spa.pfx"```
Logged an issue here: https://github.com/aspnet/Docs/issues/6199
#### To fix it, remove from UserSecrets
```dotnet user-secrets remove "Kestrel:Certificates:Development:Path"```
Refer to this to see why it's broken: https://github.com/aspnet/Hosting/issues/1294

#### Just need to set the password, nothing else:
```dotnet user-secrets set "Kestrel:Certificates:Development:Password" "devcertpass"```

#### Check the entries have been added to the UserSecrets json file:
```cat ~/.microsoft/usersecrets/bbeb0a3d-2552-47df-b31e-d2a3e7577545/secrets.json ```


