# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS builder
WORKDIR /src

COPY PDFEditorHub.sln .
COPY PDFEditorHub.Domain/PDFEditorHub.Domain.csproj PDFEditorHub.Domain/
COPY PDFEditorHub.Application/PDFEditorHub.Application.csproj PDFEditorHub.Application/
COPY PDFEditorHub.Infrastructure/PDFEditorHub.Infrastructure.csproj PDFEditorHub.Infrastructure/
COPY PDFEditorHub.API/PDFEditorHub.API.csproj PDFEditorHub.API/

RUN dotnet restore

COPY . .
RUN dotnet publish PDFEditorHub.API/PDFEditorHub.API.csproj -c Release -o /app/publish

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS production
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    fontconfig \
    fonts-liberation \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/publish .

RUN adduser --disabled-password --gecos '' appuser && chown -R appuser /app
USER appuser

EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

ENTRYPOINT ["dotnet", "PDFEditorHub.API.dll"]
