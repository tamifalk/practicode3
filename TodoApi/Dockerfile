# שלב build
FROM mcr.microsoft.com/dotnet/sdk:7.0 AS build
WORKDIR /app

# העתק קובצי csproj והתקן תלויות
COPY *.csproj ./
RUN dotnet restore

# העתק את שאר הקוד ובנה את האפליקציה
COPY . ./
RUN dotnet publish -c Release -o out

# שלב הרצה
FROM mcr.microsoft.com/dotnet/aspnet:7.0
WORKDIR /app
COPY --from=build /app/out .
ENTRYPOINT ["dotnet", "TodoApi.dll"]
