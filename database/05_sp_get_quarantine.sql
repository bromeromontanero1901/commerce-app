USE CommerceDb;
GO
CREATE OR ALTER PROCEDURE dbo.sp_get_commerce_quarantine
AS
BEGIN
    SET NOCOUNT ON;
    SELECT id, commerce_id, pc_codcomercio, pc_nomcomred, pc_tipdoc, pc_numdoc,
           pc_direccion, pc_telefono, pc_email, pc_processdate, motivo, created_at
    FROM dbo.commerce_quarantine
    ORDER BY created_at DESC, id DESC;
END
GO
