namespace Trackify.Api.Dtos;

public class PagedResult<T>
{
    public required IEnumerable<T> Items { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public long TotalCount { get; set; }
}
