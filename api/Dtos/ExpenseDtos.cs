using System.ComponentModel.DataAnnotations;

namespace Trackify.Api.Dtos;

public record ExpenseCreateDto(
    [Required] string CategoryId,
    [Required, Range(0.01, 999999999.99)] decimal Amount,
    [Required, StringLength(50)] string PaymentMode,
    [StringLength(500)] string? Note,
    [StringLength(500), Url] string? ReceiptUrl,
    [Required] DateTime SpentAt
);

public record ExpenseUpdateDto(
    [Required] string CategoryId,
    [Required, Range(0.01, 999999999.99)] decimal Amount,
    [Required, StringLength(50)] string PaymentMode,
    [StringLength(500)] string? Note,
    [StringLength(500), Url] string? ReceiptUrl,
    [Required] DateTime SpentAt
);

public record ExpenseResponse(
    string Id,
    string CategoryId,
    string CategoryName,
    decimal Amount,
    string PaymentMode,
    string? Note,
    string? ReceiptUrl,
    DateTime SpentAt,
    DateTime CreatedAt
);

public class ExpenseQuery
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public DateTime? From { get; set; }
    public DateTime? To { get; set; }
    public string? CategoryId { get; set; }
    public decimal? Min { get; set; }
    public decimal? Max { get; set; }
    public string? Sort { get; set; } = "spentAt_desc";

    public void Normalize()
    {
        if (Page <= 0) Page = 1;
        if (PageSize <= 0 || PageSize > 100) PageSize = 10;
    }
}
