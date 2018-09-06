
FROM microsoft/dotnet:2.1-aspnetcore-runtime AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM microsoft/dotnet:2.1-sdk AS build
WORKDIR /src
RUN echo "$(date +%Y-%m-%d:%H:%M:%S) Dotnet Version: $(dotnet --version)"

# NodeJs Required to build the Aurelia ClientApp
RUN echo "Installing NodeJS.."
RUN curl -sL https://deb.nodesource.com/setup_8.x |  bash -
RUN apt-get install -y nodejs

# Update NPM
RUN echo "Installing Latest NPM"
RUN npm install npm@latest -g
RUN echo "NPM Version: $(npm -v)"

# Aurelia CLI Required to build the Aurelia ClientApp
RUN echo "Installing Aurelia CLI"
RUN npm install aurelia-cli -g
RUN echo "Aurelia CLI Version: $(au -v)"

COPY dotnetcore21-spa.csproj dotnetcore21-spa/
RUN dotnet restore dotnetcore21-spa/dotnetcore21-spa.csproj
WORKDIR /src/dotnetcore21-spa
COPY . .
RUN dotnet build dotnetcore21-spa.csproj -c Release -o /app

FROM build AS publish
RUN dotnet publish dotnetcore21-spa.csproj -c Release -o /app

FROM base AS final
WORKDIR /app
COPY --from=publish /app .
ENTRYPOINT ["dotnet", "dotnetcore21-spa.dll"]
