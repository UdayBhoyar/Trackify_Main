using MongoDB.Bson;
using MongoDB.Driver;
using Trackify.Api.Dtos;
using Trackify.Api.Models;

namespace Trackify.Api.Services;

public class ReportService
{
    private readonly MongoContext _context;

    public ReportService(MongoContext context)
    {
        _context = context;
    }

    private FilterDefinition<Expense> BuildUserDateFilter(string userId, bool isAdmin, DateTime? from, DateTime? to)
    {
        var filters = new List<FilterDefinition<Expense>>();
        if (!isAdmin)
        {
            filters.Add(Builders<Expense>.Filter.Eq(e => e.UserId, userId));
        }
        if (from.HasValue)
        {
            filters.Add(Builders<Expense>.Filter.Gte(e => e.SpentAt, from.Value));
        }
        if (to.HasValue)
        {
            filters.Add(Builders<Expense>.Filter.Lte(e => e.SpentAt, to.Value));
        }

        return filters.Count == 0 ? Builders<Expense>.Filter.Empty : Builders<Expense>.Filter.And(filters);
    }

    public async Task<IEnumerable<MonthlyTotalDto>> GetMonthlyTotalsAsync(string userId, bool isAdmin, int year)
    {
        var from = new DateTime(year, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        var to = from.AddYears(1);
        var match = BuildUserDateFilter(userId, isAdmin, from, to);

        var data = await _context.Expenses.Aggregate()
            .Match(match)
            .Group(e => new { e.SpentAt.Year, e.SpentAt.Month }, g => new { g.Key.Month, Total = g.Sum(x => x.Amount) })
            .SortBy(x => x.Month)
            .ToListAsync();

        return data.Select(r => new MonthlyTotalDto(r.Month, r.Total));
    }

    public async Task<IEnumerable<CategoryTotalDto>> GetCategoryTotalsAsync(string userId, bool isAdmin, DateTime? from, DateTime? to)
    {
        var match = BuildUserDateFilter(userId, isAdmin, from, to);

        var grouped = await _context.Expenses.Aggregate()
            .Match(match)
            .Group(e => e.CategoryId, g => new { CategoryId = g.Key, Total = g.Sum(x => x.Amount) })
            .ToListAsync();

        var ids = grouped.Select(g => g.CategoryId).ToList();
        var categories = await _context.Categories.Find(c => ids.Contains(c.Id)).ToListAsync();
        var lookup = categories.ToDictionary(c => c.Id, c => c.Name);

        return grouped.Select(g => new CategoryTotalDto(
            g.CategoryId,
            lookup.TryGetValue(g.CategoryId, out var name) ? name : string.Empty,
            g.Total
        ));
    }

    public async Task<IEnumerable<DailyTrendDto>> GetDailyTrendAsync(string userId, bool isAdmin, DateTime? from, DateTime? to)
    {
        var match = BuildUserDateFilter(userId, isAdmin, from, to);

        var data = await _context.Expenses.Aggregate()
            .Match(match)
            .Group(e => e.SpentAt.Date, g => new { Date = g.Key, Total = g.Sum(x => x.Amount) })
            .SortBy(x => x.Date)
            .ToListAsync();

        return data.Select(r => new DailyTrendDto(r.Date, r.Total));
    }

    public async Task<IEnumerable<TopExpenseDto>> GetTopExpensesAsync(string userId, bool isAdmin, int limit)
    {
        limit = Math.Clamp(limit, 1, 50);
        var filter = BuildUserDateFilter(userId, isAdmin, null, null);

        var expenses = await _context.Expenses.Find(filter)
            .SortByDescending(e => e.Amount)
            .Limit(limit)
            .ToListAsync();

        return expenses.Select(e => new TopExpenseDto(e.Id, e.CategoryId, e.Amount, e.PaymentMode, e.Note, e.ReceiptUrl, e.SpentAt, e.CreatedAt));
    }
}
