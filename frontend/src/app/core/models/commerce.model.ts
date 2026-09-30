export const CSV_COLUMNS = [
  'pc_codcomercio', 'pc_nomcomred', 'pc_tipdoc', 'pc_numdoc',
  'pc_direccion', 'pc_telefono', 'pc_email', 'pc_processdate'
] as const;

export type CommerceRow = Record<(typeof CSV_COLUMNS)[number], string>;

export interface UploadResult { fileName: string; inserted: number; }
export interface ProcessResult { processDate: string; quarantined: number; }

export interface QuarantineRecord {
  id: number;
  commerceId: number | null;
  pcCodComercio: string;
  pcNomComRed: string | null;
  pcTipDoc: string | null;
  pcNumDoc: string | null;
  pcDireccion: string | null;
  pcTelefono: string | null;
  pcEmail: string | null;
  pcProcessDate: string;
  motivo: string;
  createdAt: string;
}
