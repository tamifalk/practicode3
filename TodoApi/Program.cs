// Program.cs
using TodoApi;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;


var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddJsonFile("appsettings.Development.Local.json", optional: true);

var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";

builder.Services.AddCors(options =>
{
    options.AddPolicy(name: MyAllowSpecificOrigins,
                      policy =>
                      {
                          policy.WithOrigins(
                            "https://todolistclient-z3ou.onrender.com",
                            "http://localhost:5173",
                            "http://localhost:3000",
                             "http://localhost:3001"
                          ) // כתובת הקליינט שלך
                                .AllowAnyHeader()
                                .AllowAnyMethod()
                                .AllowCredentials();
                      });
});

// 🔹 Connection string
builder.Services.AddDbContext<ToDoDbContext>(options =>
    options.UseMySql(builder.Configuration.GetConnectionString("ToDoDB"),
    new MySqlServerVersion(new Version(8, 0, 33))));

// 🔹 Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 🔹 JWT Authentication
var key = builder.Configuration["Jwt:Key"];
if (string.IsNullOrEmpty(key))
{
    throw new Exception("JWT Key is missing! Make sure it exists in appsettings or environment variables.");
}

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = "Bearer";
    options.DefaultChallengeScheme = "Bearer";
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = false,
        ValidateAudience = false,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key))
    };
});

builder.Services.AddAuthorization();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ToDoDbContext>();
    db.Database.EnsureCreated();
}

// 🔹 Middleware
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors(MyAllowSpecificOrigins);

app.UseAuthentication();  // חייב לפני UseAuthorization
app.UseAuthorization();

// 🔹 Endpoints Tasks
app.MapGet("/tasks", async (ToDoDbContext db, ClaimsPrincipal userClaims) =>
{
    var userIdClaim = userClaims.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
    if (userIdClaim == null) return Results.Unauthorized();

    var userId = int.Parse(userIdClaim.Value);
    var tasks = await db.Items.Where(t => t.UserId == userId).ToListAsync();
    return Results.Ok(tasks);
}).RequireAuthorization();

app.MapPost("/tasks", async (ToDoDbContext db, Item newItem, ClaimsPrincipal userClaims) =>
{
    var userIdClaim = userClaims.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
    if (userIdClaim == null) return Results.Unauthorized();

    newItem.UserId = int.Parse(userIdClaim.Value);
    db.Items.Add(newItem);
    await db.SaveChangesAsync();
    return Results.Created($"/tasks/{newItem.Id}", newItem);
}).RequireAuthorization();

app.MapPut("/tasks/{id}", async (int id, ToDoDbContext db, Item updatedItem, ClaimsPrincipal userClaims) =>
{
    var userIdClaim = userClaims.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
    if (userIdClaim == null) return Results.Unauthorized();

    var userId = int.Parse(userIdClaim.Value);
    var item = await db.Items.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
    if (item == null) return Results.NotFound();

    item.Name = updatedItem.Name;
    item.IsComplete = updatedItem.IsComplete;
    await db.SaveChangesAsync();
    return Results.NoContent();
}).RequireAuthorization();

app.MapDelete("/tasks/{id}", async (int id, ToDoDbContext db, ClaimsPrincipal userClaims) =>
{
    var userIdClaim = userClaims.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
    if (userIdClaim == null) return Results.Unauthorized();

    var userId = int.Parse(userIdClaim.Value);
    var item = await db.Items.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
    if (item == null) return Results.NotFound();

    db.Items.Remove(item);
    await db.SaveChangesAsync();
    return Results.NoContent();
}).RequireAuthorization();

// 🔹 JWT Helper
string GenerateJwtToken(string username, int userId)
{
    var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
    var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

    var claims = new[]
    {
        new Claim(ClaimTypes.Name, username),
        new Claim(ClaimTypes.NameIdentifier, userId.ToString()) // חובה כדי להפיק userId
    };

    var token = new JwtSecurityToken(
        claims: claims,
        expires: DateTime.Now.AddHours(1),
        signingCredentials: credentials);

    return new JwtSecurityTokenHandler().WriteToken(token);
}

// 🔹 Endpoints Users

// Register
app.MapPost("/register", async (ToDoDbContext db, User user) =>
{
    try
    {
        var existingUser = await db.Users.FirstOrDefaultAsync(u => u.Username == user.Username);
        if (existingUser != null)
            return Results.BadRequest(new { message = "Username already exists in the system" });

        db.Users.Add(user);
        await db.SaveChangesAsync();
        Console.WriteLine($"User saved with ID {user.Id}");

        var token = GenerateJwtToken(user.Username, user.Id);
        return Results.Ok(new { token });
    }
    catch (Exception ex)
    {
        Console.WriteLine($"DB Error: {ex.Message}");
        throw;
    }
});

// Login
app.MapPost("/login", async (ToDoDbContext db, User loginUser) =>
{
    var user = await db.Users.FirstOrDefaultAsync(u =>
        u.Username == loginUser.Username && u.Password == loginUser.Password);

    if (user == null) return Results.Unauthorized();

    var token = GenerateJwtToken(user.Username, user.Id);
    return Results.Ok(new { token });
});

app.MapGet("/", () => "API is running!");
app.Run();
