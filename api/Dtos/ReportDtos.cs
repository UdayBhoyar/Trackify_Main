namespace Trackify.Api.Dtos;

public record MonthlyTotalDto(int Month, decimal Total);
public record CategoryTotalDto(string CategoryId, string CategoryName, decimal Total);
public record DailyTrendDto(DateTime Date, decimal Total);
public record TopExpenseDto(string Id, string CategoryId, decimal Amount, string PaymentMode, string? Note, string? ReceiptUrl, DateTime SpentAt, DateTime CreatedAt);
