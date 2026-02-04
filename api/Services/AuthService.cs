using MongoDB.Driver;
using Trackify.Api.Dtos;
using Trackify.Api.Models;

namespace Trackify.Api.Services;

public class AuthService
{
    private readonly MongoContext _context;
    private readonly JwtService _jwt;
    private readonly CategoryService _categoryService;

    public AuthService(MongoContext context, JwtService jwt, CategoryService categoryService)
    {
        _context = context;
        _jwt = jwt;
        _categoryService = categoryService;
    }

    public async Task<User?> GetByIdAsync(string id)
    {
        return await _context.Users.Find(u => u.Id == id).FirstOrDefaultAsync();
    }

    public async Task<AuthResponse?> RegisterAsync(RegisterRequest request)
    {
        var existing = await _context.Users.Find(u => u.Email == request.Email.ToLowerInvariant()).FirstOrDefaultAsync();
        if (existing != null)
        {
            return null;
        }

        var user = new User
        {
            Name = request.Name,
            Email = request.Email.ToLowerInvariant(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = "User",
            CreatedAt = DateTime.UtcNow
        };

        await _context.Users.InsertOneAsync(user);
        
        // Create default categories for new user
        await _categoryService.EnsureDefaultCategoriesAsync(user.Id);
        
        var token = _jwt.CreateToken(user);
        return new AuthResponse(token, new UserResponse(user.Id, user.Name, user.Email, user.Role));
    }

    public async Task<AuthResponse?> LoginAsync(LoginRequest request)
    {
        var user = await _context.Users.Find(u => u.Email == request.Email.ToLowerInvariant()).FirstOrDefaultAsync();
        if (user == null)
        {
            return null;
        }

        var verified = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
        if (!verified)
        {
            return null;
        }

        // Ensure default categories exist for existing users
        await _categoryService.EnsureDefaultCategoriesAsync(user.Id);
        
        var token = _jwt.CreateToken(user);
        return new AuthResponse(token, new UserResponse(user.Id, user.Name, user.Email, user.Role));
    }

    public async Task EnsureAdminUserAsync(string email, string password)
    {
        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
        {
            return;
        }

        var admin = await _context.Users.Find(u => u.Email == email.ToLowerInvariant()).FirstOrDefaultAsync();
        if (admin != null)
        {
            return;
        }

        var user = new User
        {
            Name = "Administrator",
            Email = email.ToLowerInvariant(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
            Role = "Admin",
            CreatedAt = DateTime.UtcNow
        };

        await _context.Users.InsertOneAsync(user);
    }

    public async Task<UserResponse?> UpdateProfileAsync(string userId, UpdateProfileRequest request)
    {
        var user = await GetByIdAsync(userId);
        if (user == null)
        {
            return null;
        }

        var emailLower = request.Email.ToLowerInvariant();
        
        // Check if new email already exists (excluding current user)
        if (emailLower != user.Email.ToLowerInvariant())
        {
            var emailExists = await _context.Users.Find(u => 
                u.Email == emailLower && u.Id != userId
            ).FirstOrDefaultAsync();
            
            if (emailExists != null)
            {
                return null;
            }
        }

        // Build update definition dynamically
        var updateBuilder = Builders<User>.Update;
        var updates = new List<UpdateDefinition<User>>
        {
            updateBuilder.Set(u => u.Name, request.Name)
        };

        // Only update email if it changed
        if (emailLower != user.Email.ToLowerInvariant())
        {
            updates.Add(updateBuilder.Set(u => u.Email, emailLower));
        }

        // Only update password if provided
        if (!string.IsNullOrWhiteSpace(request.Password))
        {
            updates.Add(updateBuilder.Set(u => u.PasswordHash, BCrypt.Net.BCrypt.HashPassword(request.Password)));
        }

        var combinedUpdate = updateBuilder.Combine(updates);
        await _context.Users.UpdateOneAsync(u => u.Id == userId, combinedUpdate);
        
        // Fetch updated user
        var updatedUser = await GetByIdAsync(userId);
        return updatedUser == null ? null : new UserResponse(updatedUser.Id, updatedUser.Name, updatedUser.Email, updatedUser.Role);
    }
}
