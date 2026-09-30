using System.Data;
using Commerce.Api.Models;
using Microsoft.Data.SqlClient;

namespace Commerce.Api.Repositories;

public interface ICommerceRepository
{
    Task<int> CreateAsync(IReadOnlyCollection<CommerceRecord> rows, CancellationToken ct);
    Task<int> ProcessAsync(DateOnly processDate, CancellationToken ct);
    Task<IReadOnlyList<QuarantineRecord>> GetQuarantineAsync(CancellationToken ct);
}

/// <summary>Acceso a datos con ADO.NET; toda la lógica de BD vive en stored procedures.</summary>
public class CommerceRepository(IConfiguration config) : ICommerceRepository
{
    private readonly string _cs = config.GetConnectionString("CommerceDb")
        ?? throw new InvalidOperationException("Falta la cadena de conexión CommerceDb.");

    public async Task<int> CreateAsync(IReadOnlyCollection<CommerceRecord> rows, CancellationToken ct)
    {
        // Un solo viaje a BD mediante Table-Valued Parameter
        var table = new DataTable();
        table.Columns.Add("pc_codcomercio", typeof(string));
        table.Columns.Add("pc_nomcomred", typeof(string));
        table.Columns.Add("pc_tipdoc", typeof(string));
        table.Columns.Add("pc_numdoc", typeof(string));
        table.Columns.Add("pc_direccion", typeof(string));
        table.Columns.Add("pc_telefono", typeof(string));
        table.Columns.Add("pc_email", typeof(string));
        table.Columns.Add("pc_processdate", typeof(DateTime));

        foreach (var r in rows)
            table.Rows.Add(r.PcCodComercio, r.PcNomComRed, r.PcTipDoc, r.PcNumDoc,
                           r.PcDireccion, r.PcTelefono, r.PcEmail, r.PcProcessDate.Date);

        await using var cn = new SqlConnection(_cs);
        await using var cmd = new SqlCommand("dbo.sp_create_commerce", cn) { CommandType = CommandType.StoredProcedure };
        cmd.Parameters.Add(new SqlParameter("@rows", SqlDbType.Structured) { TypeName = "dbo.commerce_type", Value = table });

        await cn.OpenAsync(ct);
        return Convert.ToInt32(await cmd.ExecuteScalarAsync(ct));
    }

    public async Task<int> ProcessAsync(DateOnly processDate, CancellationToken ct)
    {
        await using var cn = new SqlConnection(_cs);
        await using var cmd = new SqlCommand("dbo.sp_process_commerce", cn) { CommandType = CommandType.StoredProcedure };
        cmd.Parameters.Add(new SqlParameter("@processdate", SqlDbType.Date)
            { Value = processDate.ToDateTime(TimeOnly.MinValue) });

        await cn.OpenAsync(ct);
        return Convert.ToInt32(await cmd.ExecuteScalarAsync(ct));
    }

    public async Task<IReadOnlyList<QuarantineRecord>> GetQuarantineAsync(CancellationToken ct)
    {
        var list = new List<QuarantineRecord>();
        await using var cn = new SqlConnection(_cs);
        await using var cmd = new SqlCommand("dbo.sp_get_commerce_quarantine", cn) { CommandType = CommandType.StoredProcedure };
        await cn.OpenAsync(ct);
        await using var rd = await cmd.ExecuteReaderAsync(ct);
        while (await rd.ReadAsync(ct))
        {
            list.Add(new QuarantineRecord
            {
                Id = rd.GetInt32(rd.GetOrdinal("id")),
                CommerceId = rd.IsDBNull(rd.GetOrdinal("commerce_id")) ? null : rd.GetInt32(rd.GetOrdinal("commerce_id")),
                PcCodComercio = rd.GetString(rd.GetOrdinal("pc_codcomercio")),
                PcNomComRed = Str(rd, "pc_nomcomred"),
                PcTipDoc = Str(rd, "pc_tipdoc"),
                PcNumDoc = Str(rd, "pc_numdoc"),
                PcDireccion = Str(rd, "pc_direccion"),
                PcTelefono = Str(rd, "pc_telefono"),
                PcEmail = Str(rd, "pc_email"),
                PcProcessDate = rd.GetDateTime(rd.GetOrdinal("pc_processdate")),
                Motivo = rd.GetString(rd.GetOrdinal("motivo")),
                CreatedAt = rd.GetDateTime(rd.GetOrdinal("created_at"))
            });
        }
        return list;
    }

    private static string? Str(SqlDataReader rd, string col)
    {
        var i = rd.GetOrdinal(col);
        return rd.IsDBNull(i) ? null : rd.GetString(i);
    }
}
