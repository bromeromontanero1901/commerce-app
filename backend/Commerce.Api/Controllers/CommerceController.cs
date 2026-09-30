using Commerce.Api.Models;
using Commerce.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Commerce.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CommerceController(ICommerceService service) : ControllerBase
{
    /// <summary>Carga el archivo commerce_DDMMYYYY.csv y lo registra con sp_create_commerce.</summary>
    /// <response code="400">Archivo vacío, nombre o formato inválido.</response>
    [HttpPost("upload")]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(UploadResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<UploadResult>> Upload(IFormFile file, CancellationToken ct)
        => Ok(await service.UploadAsync(file, ct));

    /// <summary>Valida los registros de la fecha indicada y envía los inválidos a cuarentena.</summary>
    /// <returns>Cantidad de registros insertados en commerce_quarantine.</returns>
    [HttpPost("process")]
    [ProducesResponseType(typeof(ProcessResult), StatusCodes.Status200OK)]
    public async Task<ActionResult<ProcessResult>> Process([FromBody] ProcessRequest request, CancellationToken ct)
        => Ok(await service.ProcessAsync(request.ProcessDate, ct));

    /// <summary>Lista los comercios de commerce_quarantine con su motivo.</summary>
    [HttpGet("quarantine")]
    [ProducesResponseType(typeof(IReadOnlyList<QuarantineRecord>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<QuarantineRecord>>> Quarantine(CancellationToken ct)
        => Ok(await service.GetQuarantineAsync(ct));
}
