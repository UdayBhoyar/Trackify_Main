using MongoDB.Bson;
using MongoDB.Driver;
using Trackify.Api.Dtos;
using Trackify.Api.Models;

namespace Trackify.Api.Services;

public class ExpenseService
{
    private readonly MongoContext _context;
    private readonly CategoryService _categories;

    public ExpenseService(MongoContext context, CategoryService categories)
    {
        _context = context;
        _categories = categories;
    }

    public async Task<PagedResult<ExpenseResponse>> QueryAsync(string userId, bool isAdmin, ExpenseQuery query)
    {
        query.Normalize();
        var filters = new List<FilterDefinition<Expense>>();
        if (!isAdmin)
        {
            filters.Add(Builders<Expense>.Filter.Eq(e => e.UserId, userId));
        }

        if (query.From.HasValue)
        {
            filters.Add(Builders<Expense>.Filter.Gte(e => e.SpentAt, query.From.Value));
        }

        if (query.To.HasValue)
        {
            filters.Add(Builders<Expense>.Filter.Lte(e => e.SpentAt, query.To.Value));
        }

        if (!string.IsNullOrWhiteSpace(query.CategoryId))
        {
            filters.Add(Builders<Expense>.Filter.Eq(e => e.CategoryId, query.CategoryId));
        }

        if (query.Min.HasValue)
        {
            filters.Add(Builders<Expense>.Filter.Gte(e => e.Amount, query.Min.Value));
        }

        if (query.Max.HasValue)
        {
            filters.Add(Builders<Expense>.Filter.Lte(e => e.Amount, query.Max.Value));
        }

        var filter = filters.Count == 0 ? Builders<Expense>.Filter.Empty : Builders<Expense>.Filter.And(filters);

        var sort = query.Sort?.ToLowerInvariant() switch
        {
            "amount_desc" => Builders<Expense>.Sort.Descending(e => e.Amount),
            "amount_asc" => Builders<Expense>.Sort.Ascending(e => e.Amount),
            "spentat_asc" => Builders<Expense>.Sort.Ascending(e => e.SpentAt),
            _ => Builders<Expense>.Sort.Descending(e => e.SpentAt)
        };

        var total = await _context.Expenses.CountDocumentsAsync(filter);
        var expenses = await _context.Expenses.Find(filter)
            .Sort(sort)
            .Skip((query.Page - 1) * query.PageSize)
            .Limit(query.PageSize)
            .ToListAsync();

        var categoryIds = expenses.Select(e => e.CategoryId).Distinct().ToList();
        var categories = await _context.Categories.Find(c => categoryIds.Contains(c.Id)).ToListAsync();
        var categoryLookup = categories.ToDictionary(c => c.Id, c => c.Name);

        var items = expenses.Select(e => new ExpenseResponse(
            e.Id,
            e.CategoryId,
            categoryLookup.TryGetValue(e.CategoryId, out var name) ? name : "",
            e.Amount,
            e.PaymentMode,
            e.Note,
            e.ReceiptUrl,
            e.SpentAt,
            e.CreatedAt
        ));

        return new PagedResult<ExpenseResponse>
        {
            Items = items,
            Page = query.Page,
            PageSize = query.PageSize,
            TotalCount = total
        };
    }

    public async Task<ExpenseResponse?> CreateAsync(string userId, bool isAdmin, ExpenseCreateDto dto)
    {
        if (!ObjectId.TryParse(dto.CategoryId, out _))
        {
            return null;
        }

        var category = await _categories.GetByIdAsync(dto.CategoryId);
        if (category == null || (!isAdmin && category.UserId != userId))
        {
            return null;
        }

        var expense = new Expense
        {
            UserId = isAdmin ? category.UserId : userId,
            CategoryId = dto.CategoryId,
            Amount = dto.Amount,
            PaymentMode = dto.PaymentMode,
            Note = dto.Note,
            ReceiptUrl = dto.ReceiptUrl,
            SpentAt = dto.SpentAt,
            CreatedAt = DateTime.UtcNow
        };

        await _context.Expenses.InsertOneAsync(expense);
        return new ExpenseResponse(expense.Id, expense.CategoryId, category.Name, expense.Amount, expense.PaymentMode, expense.Note, expense.ReceiptUrl, expense.SpentAt, expense.CreatedAt);
    }

    public async Task<bool> UpdateAsync(string id, string userId, bool isAdmin, ExpenseUpdateDto dto)
    {
        if (!ObjectId.TryParse(id, out _))
        {
            return false;
        }

        var category = await _categories.GetByIdAsync(dto.CategoryId);
        if (category == null || (!isAdmin && category.UserId != userId))
        {
            return false;
        }

        var filter = Builders<Expense>.Filter.Eq(e => e.Id, id) & (isAdmin ? Builders<Expense>.Filter.Empty : Builders<Expense>.Filter.Eq(e => e.UserId, userId));
        var update = Builders<Expense>.Update
            .Set(e => e.CategoryId, dto.CategoryId)
            .Set(e => e.Amount, dto.Amount)
            .Set(e => e.PaymentMode, dto.PaymentMode)
            .Set(e => e.Note, dto.Note)
            .Set(e => e.ReceiptUrl, dto.ReceiptUrl)
            .Set(e => e.SpentAt, dto.SpentAt);

        var result = await _context.Expenses.UpdateOneAsync(filter, update);
        return result.ModifiedCount == 1;
    }

    public async Task<bool> DeleteAsync(string id, string userId, bool isAdmin)
    {
        if (!ObjectId.TryParse(id, out _))
        {
            return false;
        }

        var filter = Builders<Expense>.Filter.Eq(e => e.Id, id) & (isAdmin ? Builders<Expense>.Filter.Empty : Builders<Expense>.Filter.Eq(e => e.UserId, userId));
        var result = await _context.Expenses.DeleteOneAsync(filter);
        return result.DeletedCount == 1;
    }
}
