using Microsoft.Extensions.Options;
using MongoDB.Driver;
using Trackify.Api.Config;
using Trackify.Api.Models;

namespace Trackify.Api.Services;

public class MongoContext
{
    private readonly IMongoDatabase _database;

    public MongoContext(IOptions<MongoSettings> options)
    {
        var settings = options.Value ?? throw new InvalidOperationException("Mongo settings missing");
        if (string.IsNullOrWhiteSpace(settings.ConnectionString) || string.IsNullOrWhiteSpace(settings.Database))
        {
            throw new InvalidOperationException("Mongo configuration is incomplete");
        }

        var client = new MongoClient(settings.ConnectionString);
        _database = client.GetDatabase(settings.Database);
        ConfigureIndexes();
    }

    public IMongoCollection<User> Users => _database.GetCollection<User>("users");
    public IMongoCollection<Category> Categories => _database.GetCollection<Category>("categories");
    public IMongoCollection<Expense> Expenses => _database.GetCollection<Expense>("expenses");

    private void ConfigureIndexes()
    {
        Users.Indexes.CreateOne(new CreateIndexModel<User>(Builders<User>.IndexKeys.Ascending(u => u.Email), new CreateIndexOptions { Unique = true }));
        Categories.Indexes.CreateOne(new CreateIndexModel<Category>(Builders<Category>.IndexKeys.Combine(
            Builders<Category>.IndexKeys.Ascending(c => c.UserId),
            Builders<Category>.IndexKeys.Ascending(c => c.Name)
        ), new CreateIndexOptions { Unique = true }));
        Expenses.Indexes.CreateOne(new CreateIndexModel<Expense>(Builders<Expense>.IndexKeys.Combine(
            Builders<Expense>.IndexKeys.Ascending(e => e.UserId),
            Builders<Expense>.IndexKeys.Descending(e => e.SpentAt)
        )));
    }
}
