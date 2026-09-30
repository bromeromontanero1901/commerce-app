using CsvHelper.Configuration.Attributes;

namespace Commerce.Api.Models;

/// <summary>Fila del archivo commerce_DDMMYYYY.csv (mismas columnas que la tabla commerce).</summary>
public class CommerceRecord
{
    [Name("pc_codcomercio")] public string PcCodComercio { get; set; } = string.Empty;
    [Name("pc_nomcomred")]   public string? PcNomComRed { get; set; }
    [Name("pc_tipdoc")]      public string? PcTipDoc { get; set; }
    [Name("pc_numdoc")]      public string? PcNumDoc { get; set; }
    [Name("pc_direccion")]   public string? PcDireccion { get; set; }
    [Name("pc_telefono")]    public string? PcTelefono { get; set; }
    [Name("pc_email")]       public string? PcEmail { get; set; }
    [Name("pc_processdate"), Format("yyyy-MM-dd")] public DateTime PcProcessDate { get; set; }
}

/// <summary>Registro de commerce_quarantine.</summary>
public class QuarantineRecord
{
    public int Id { get; set; }
    public int? CommerceId { get; set; }
    public string PcCodComercio { get; set; } = string.Empty;
    public string? PcNomComRed { get; set; }
    public string? PcTipDoc { get; set; }
    public string? PcNumDoc { get; set; }
    public string? PcDireccion { get; set; }
    public string? PcTelefono { get; set; }
    public string? PcEmail { get; set; }
    public DateTime PcProcessDate { get; set; }
    public string Motivo { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

/// <summary>Cuerpo del POST de procesamiento.</summary>
public record ProcessRequest(DateOnly ProcessDate);

public record UploadResult(string FileName, int Inserted);

public record ProcessResult(DateOnly ProcessDate, int Quarantined);
