FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["payment-service-dotnet.csproj", "./"]
RUN dotnet restore
COPY . .
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

# Run as non-root user for security
USER app
ENV ASPNETCORE_HTTP_PORTS=5004
EXPOSE 5004

ENTRYPOINT ["dotnet", "payment-service-dotnet.dll"]
