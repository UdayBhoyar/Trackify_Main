using MongoDB.Bson;
using MongoDB.Driver;
using Trackify.Api.Dtos;
using Trackify.Api.Models;

namespace Trackify.Api.Services;

public class CategoryService
{
    private readonly MongoContext _context;

    public CategoryService(MongoContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<CategoryResponse>> GetAsync(string userId, bool isAdmin)
    {
        var filter = isAdmin ? Builders<Category>.Filter.Empty : Builders<Category>.Filter.Eq(c => c.UserId, userId);
        var list = await _context.Categories.Find(filter).SortByDescending(c => c.CreatedAt).ToListAsync();
        return list.Select(c => new CategoryResponse(c.Id, c.Name, c.Icon, c.UserId, c.CreatedAt));
    }

    public async Task<CategoryResponse?> CreateAsync(string userId, CategoryCreateDto dto)
    {
        var category = new Category
        {
            Name = dto.Name,
            Icon = dto.Icon,
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        await _context.Categories.InsertOneAsync(category);
        return new CategoryResponse(category.Id, category.Name, category.Icon, category.UserId, category.CreatedAt);
    }

    public async Task<bool> UpdateAsync(string id, string userId, bool isAdmin, CategoryUpdateDto dto)
    {
        if (!ObjectId.TryParse(id, out _))
        {
            return false;
        }

        var filter = Builders<Category>.Filter.Eq(c => c.Id, id) & (isAdmin ? Builders<Category>.Filter.Empty : Builders<Category>.Filter.Eq(c => c.UserId, userId));
        var update = Builders<Category>.Update
            .Set(c => c.Name, dto.Name)
            .Set(c => c.Icon, dto.Icon);

        var result = await _context.Categories.UpdateOneAsync(filter, update);
        return result.ModifiedCount == 1;
    }

    public async Task<bool> DeleteAsync(string id, string userId, bool isAdmin)
    {
        if (!ObjectId.TryParse(id, out _))
        {
            return false;
        }

        var filter = Builders<Category>.Filter.Eq(c => c.Id, id) & (isAdmin ? Builders<Category>.Filter.Empty : Builders<Category>.Filter.Eq(c => c.UserId, userId));
        var result = await _context.Categories.DeleteOneAsync(filter);
        return result.DeletedCount == 1;
    }

    public async Task<Category?> GetByIdAsync(string id)
    {
        return await _context.Categories.Find(c => c.Id == id).FirstOrDefaultAsync();
    }

    public async Task EnsureDefaultCategoriesAsync(string userId)
    {
        // Check if user already has categories
        var existingCount = await _context.Categories.CountDocumentsAsync(c => c.UserId == userId);
        if (existingCount > 0)
        {
            return;
        }

        // Create default categories
        var defaultCategories = new[]
        {
            new Category { Name = "Food & Dining", Icon = "🍔", UserId = userId, CreatedAt = DateTime.UtcNow },
            new Category { Name = "Transportation", Icon = "🚗", UserId = userId, CreatedAt = DateTime.UtcNow },
            new Category { Name = "Shopping", Icon = "🛍️", UserId = userId, CreatedAt = DateTime.UtcNow },
            new Category { Name = "Entertainment", Icon = "🎬", UserId = userId, CreatedAt = DateTime.UtcNow },
            new Category { Name = "Bills & Utilities", Icon = "💡", UserId = userId, CreatedAt = DateTime.UtcNow },
            new Category { Name = "Healthcare", Icon = "🏥", UserId = userId, CreatedAt = DateTime.UtcNow },
            new Category { Name = "Education", Icon = "📚", UserId = userId, CreatedAt = DateTime.UtcNow },
            new Category { Name = "Groceries", Icon = "🛒", UserId = userId, CreatedAt = DateTime.UtcNow },
            new Category { Name = "Travel", Icon = "✈️", UserId = userId, CreatedAt = DateTime.UtcNow },
            new Category { Name = "Other", Icon = "📌", UserId = userId, CreatedAt = DateTime.UtcNow }
        };

        await _context.Categories.InsertManyAsync(defaultCategories);
    }
}
