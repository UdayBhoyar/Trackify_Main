using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Trackify.Api.Models;

public class Expense
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = default!;

    [BsonElement("userId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string UserId { get; set; } = default!;

    [BsonElement("categoryId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string CategoryId { get; set; } = default!;

    [BsonElement("amount")]
    [BsonRepresentation(BsonType.Decimal128)]
    public decimal Amount { get; set; }

    [BsonElement("paymentMode")]
    public string PaymentMode { get; set; } = string.Empty;

    [BsonElement("note")]
    public string? Note { get; set; }

    [BsonElement("receiptUrl")]
    public string? ReceiptUrl { get; set; }

    [BsonElement("spentAt")]
    public DateTime SpentAt { get; set; }

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
