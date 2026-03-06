FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build
WORKDIR /src
COPY EmployeeRegistry.API/*.csproj ./EmployeeRegistry.API/
RUN dotnet restore ./EmployeeRegistry.API/EmployeeRegistry.API.csproj

COPY EmployeeRegistry.API/ ./EmployeeRegistry.API/
RUN dotnet publish ./EmployeeRegistry.API/EmployeeRegistry.API.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview AS runtime
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 5000
ENV ASPNETCORE_URLS=http://+:5000
ENTRYPOINT ["dotnet", "EmployeeRegistry.API.dll"]
