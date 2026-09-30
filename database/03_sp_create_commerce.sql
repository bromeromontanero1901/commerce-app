USE CommerceDb;
GO
-- Tipo de tabla para enviar el CSV completo en una sola llamada (eficiente)
IF TYPE_ID('dbo.commerce_type') IS NULL
CREATE TYPE dbo.commerce_type AS TABLE (
    pc_codcomercio  VARCHAR(20)   NOT NULL,
    pc_nomcomred    NVARCHAR(150) NULL,
    pc_tipdoc       VARCHAR(10)   NULL,
    pc_numdoc       VARCHAR(30)   NULL,
    pc_direccion    NVARCHAR(200) NULL,
    pc_telefono     VARCHAR(20)   NULL,
    pc_email        VARCHAR(120)  NULL,
    pc_processdate  DATE          NOT NULL
);
GO
CREATE OR ALTER PROCEDURE dbo.sp_create_commerce
    @rows dbo.commerce_type READONLY
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO dbo.commerce
        (pc_codcomercio, pc_nomcomred, pc_tipdoc, pc_numdoc, pc_direccion, pc_telefono, pc_email, pc_processdate)
    SELECT pc_codcomercio, pc_nomcomred, pc_tipdoc, pc_numdoc, pc_direccion, pc_telefono, pc_email, pc_processdate
    FROM @rows;

    SELECT @@ROWCOUNT AS inserted;   -- registros insertados
END
GO
