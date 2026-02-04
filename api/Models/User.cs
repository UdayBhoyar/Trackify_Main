using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Trackify.Api.Models;

public class User
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = default!;

    [BsonElement("name")]
    public string Name { get; set; } = default!;

    [BsonElement("email")]
    public string Email { get; set; } = default!;

    [BsonElement("passwordHash")]
    public string PasswordHash { get; set; } = default!;

    [BsonElement("role")]
    public string Role { get; set; } = "User";

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
