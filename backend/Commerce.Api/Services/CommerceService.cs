using System.Globalization;
using System.Text.RegularExpressions;
using Commerce.Api.Middleware;
using Commerce.Api.Models;
using Commerce.Api.Repositories;
using CsvHelper;
using CsvHelper.Configuration;

namespace Commerce.Api.Services;

public interface ICommerceService
{
    Task<UploadResult> UploadAsync(IFormFile? file, CancellationToken ct);
    Task<ProcessResult> ProcessAsync(DateOnly processDate, CancellationToken ct);
    Task<IReadOnlyList<QuarantineRecord>> GetQuarantineAsync(CancellationToken ct);
}

public partial class CommerceService(ICommerceRepository repo, ILogger<CommerceService> logger) : ICommerceService
{
    // commerce_DDMMYYYY.csv
    [GeneratedRegex(@"^commerce_(\d{2})(\d{2})(\d{4})\.csv$", RegexOptions.IgnoreCase)]
    private static partial Regex FileNameRegex();

    public async Task<UploadResult> UploadAsync(IFormFile? file, CancellationToken ct)
    {
        if (file is null || file.Length == 0)
            throw new BusinessException("El archivo está vacío o no fue enviado.");

        ValidateFileName(file.FileName);

        var rows = await ParseCsvAsync(file, ct);
        if (rows.Count == 0)
            throw new BusinessException("El archivo no contiene registros.");

        var inserted = await repo.CreateAsync(rows, ct);
        logger.LogInformation("Archivo {File}: {Count} registros insertados", file.FileName, inserted);
        return new UploadResult(file.FileName, inserted);
    }

    public async Task<ProcessResult> ProcessAsync(DateOnly processDate, CancellationToken ct)
        => new(processDate, await repo.ProcessAsync(processDate, ct));

    public Task<IReadOnlyList<QuarantineRecord>> GetQuarantineAsync(CancellationToken ct)
        => repo.GetQuarantineAsync(ct);

    private static void ValidateFileName(string name)
    {
        var m = FileNameRegex().Match(Path.GetFileName(name));
        if (!m.Success ||
            !DateTime.TryParseExact($"{m.Groups[1]}{m.Groups[2]}{m.Groups[3]}", "ddMMyyyy",
                CultureInfo.InvariantCulture, DateTimeStyles.None, out _))
            throw new BusinessException("El nombre del archivo debe ser commerce_DDMMYYYY.csv con una fecha válida.");
    }

    private static async Task<List<CommerceRecord>> ParseCsvAsync(IFormFile file, CancellationToken ct)
    {
        var cfg = new CsvConfiguration(CultureInfo.InvariantCulture)
        {
            TrimOptions = TrimOptions.Trim,
            PrepareHeaderForMatch = a => a.Header.Trim().ToLowerInvariant(),
            BadDataFound = null
        };
        var rows = new List<CommerceRecord>();
        try
        {
            using var reader = new StreamReader(file.OpenReadStream());
            using var csv = new CsvReader(reader, cfg);
            await foreach (var r in csv.GetRecordsAsync<CommerceRecord>(ct)) rows.Add(r);
        }
        catch (CsvHelperException ex)
        {
            throw new BusinessException($"El CSV no tiene el formato esperado: {ex.Message.Split('\n')[0]}");
        }
        return rows;
    }
}
