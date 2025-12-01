# שלב build
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app

# העתק קובצי csproj לתיקייה הראשית, כדי ל־restore קודם
COPY *.csproj ./
RUN dotnet restore

# העתק את כל הקוד ובנה את האפליקציה
COPY . ./
RUN dotnet publish -c Release -o out

# שלב הרצה
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app/out .

ENTRYPOINT ["dotnet", "TodoApi.dll"]
