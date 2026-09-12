import { useState } from "react";

interface OrderProductData {
  _id?: string;
  reference?: string;
  referencia?: string;
  description?: string;
  detalle?: string;
}

interface OrderExcelItem {
  quantity: number;
  price: number;
  idProduct?: OrderProductData;
  Product?: OrderProductData;
}

interface OrderForExcel {
  _id: string;
  orderNumber?: string;
  idClient?: string;
  Client?: {
    id?: string;
    _id?: string;
  };
  items?: OrderExcelItem[];
}

interface OleStream {
  name: string;
  type: number;
  startSector: number;
  size: number;
  data: Uint8Array;
}

interface Props {
  order: OrderForExcel;
}

type CellValue = string | number;

const SECTOR_SIZE = 512;
const END_OF_CHAIN = 0xfffffffe;
const FREE_SECTOR = 0xffffffff;
const FAT_SECTOR = 0xfffffffd;

const COTIZACION_COLUMNS = [
  "referencia",
  "servicio",
  "detalle",
  "cant",
  "pdto",
  "vrunit2",
  "vrunit",
  "vrtotal",
  "piva",
  "vripocon",
  "tercero3",
  "ref1",
  "ref2",
  "ref3",
  "ref4",
  "codretef",
  "ccosto",
  "sccosto",
  "p_name1",
  "p_vr1",
  "p_cant1",
  "p_und1",
  "p_name2",
  "p_vr2",
  "p_cant2",
  "p_und2",
  "p_name3",
  "p_vr3",
  "p_cant3",
  "p_und3",
];

export const OrderExcelButton = ({ order }: Props) => {
  const [loading, setLoading] = useState(false);

  const handleDownloadExcel = async () => {
    setLoading(true);

    try {
      const templateResponse = await fetch("/templates/COTIZACION.XLS");
      if (!templateResponse.ok) throw new Error("No se pudo cargar la plantilla");

      const template = new Uint8Array(await templateResponse.arrayBuffer());
      const rows = buildCotizacionRows(order);
      const workbook = createWorkbookFromTemplate(template, rows);
      const blob = new Blob([workbook], { type: "application/vnd.ms-excel" });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `cotizacion-${order.orderNumber || order._id?.slice(-6) || "pedido"}.xls`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert("Error al generar el Excel");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownloadExcel}
      disabled={loading}
      className={`text-green-700 hover:text-green-900 underline text-sm font-medium ${
        loading ? "opacity-50 cursor-not-allowed" : ""
      }`}
      type="button"
    >
      {loading ? "Generando..." : "Descargar Excel"}
    </button>
  );
};

const buildCotizacionRows = (order: OrderForExcel): CellValue[][] => {
  const clientCode = order.Client?.id || order.Client?._id || order.idClient || "";

  const itemRows = (order.items || []).map((item) => {
    const product = item.idProduct || item.Product || {};
    const quantity = Number(item.quantity || 0);
    const total = Number(item.price || 0);
    const unitPrice = quantity > 0 ? total / quantity : total;
    const reference = product.reference || product.referencia || product._id || "";
    const detail = product.description || product.detalle || "Producto sin detalle";

    return [
      String(reference),
      "",
      detail,
      quantity,
      0,
      unitPrice,
      unitPrice,
      total,
      19,
      0,
      clientCode,
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      0,
      0,
      "",
      "",
      0,
      0,
      "",
      "",
      0,
      0,
      "",
    ];
  });

  return [COTIZACION_COLUMNS, ...itemRows];
};

const createWorkbookFromTemplate = (template: Uint8Array, rows: CellValue[][]) => {
  const streams = readOleStreams(template);
  const book = streams.find((stream) => stream.name === "Book");
  if (!book) throw new Error("La plantilla no contiene stream Book");

  const bookStream = rebuildBookStream(book.data, rows);
  const summary = streams.find((stream) => stream.name === "\u0005SummaryInformation");
  const documentSummary = streams.find((stream) => stream.name === "\u0005DocumentSummaryInformation");

  return createOleFile([
    { name: "Book", type: 2, data: bookStream },
    ...(summary ? [{ name: summary.name, type: summary.type, data: summary.data }] : []),
    ...(documentSummary
      ? [{ name: documentSummary.name, type: documentSummary.type, data: documentSummary.data }]
      : []),
  ]);
};

const rebuildBookStream = (book: Uint8Array, rows: CellValue[][]) => {
  const sheetOffset = findWorksheetOffset(book);
  const dimensionsOffset = findRecordOffset(book, 0x0200, sheetOffset);
  const worksheetPrefix = book.slice(0, dimensionsOffset);
  const worksheetCells = createWorksheetCells(rows);

  return concatBytes(worksheetPrefix, worksheetCells, record(0x000a));
};

const createWorksheetCells = (rows: CellValue[][]) => {
  const records: Uint8Array[] = [];
  const maxColumns = rows.reduce((max, row) => Math.max(max, row.length), 0);

  records.push(
    record(
      0x0200,
      uint16(0),
      uint16(rows.length),
      uint16(0),
      uint16(maxColumns),
      uint16(0)
    )
  );

  rows.forEach((row, rowIndex) => {
    records.push(createRowRecord(rowIndex, row.length));
  });

  rows.forEach((row, rowIndex) => {
    row.forEach((value, columnIndex) => {
      records.push(createCellRecord(rowIndex, columnIndex, value, columnIndex === 0));
    });
  });

  return concatBytes(...records);
};

const createRowRecord = (rowIndex: number, columnCount: number) =>
  record(
    0x0208,
    uint16(rowIndex),
    uint16(0),
    uint16(columnCount),
    uint16(0x00ff),
    uint16(0),
    uint16(0),
    uint16(0),
    uint16(0x0100)
  );

const createCellRecord = (
  rowIndex: number,
  columnIndex: number,
  value: CellValue,
  forceText: boolean
) => {
  const xfIndex = columnIndex === 0 ? 0x0039 : 0x000f;

  if (typeof value === "number" && !forceText) {
    return record(
      0x0203,
      uint16(rowIndex),
      uint16(columnIndex),
      uint16(xfIndex),
      float64(value)
    );
  }

  const textBytes = encodeAnsi(String(value ?? ""));
  return record(
    0x0204,
    uint16(rowIndex),
    uint16(columnIndex),
    uint16(xfIndex),
    uint16(textBytes.length),
    textBytes
  );
};

const findWorksheetOffset = (book: Uint8Array) => {
  let position = 0;

  while (position + 4 <= book.length) {
    const id = readUint16(book, position);
    const length = readUint16(book, position + 2);

    if (id === 0x0085) {
      return readUint32(book, position + 4);
    }

    position += 4 + length;
  }

  throw new Error("No se encontro la hoja COTIZACION");
};

const findRecordOffset = (book: Uint8Array, recordId: number, startOffset: number) => {
  let position = startOffset;

  while (position + 4 <= book.length) {
    const id = readUint16(book, position);
    const length = readUint16(book, position + 2);
    if (id === recordId) return position;
    position += 4 + length;
  }

  throw new Error("No se encontro el registro requerido");
};

const readOleStreams = (file: Uint8Array): OleStream[] => {
  const fat = readFat(file);
  const directoryStart = readUint32(file, 48);
  const directory = readStreamByChain(file, fat, directoryStart, Number.MAX_SAFE_INTEGER);
  const streams: OleStream[] = [];

  for (let offset = 0; offset + 128 <= directory.length; offset += 128) {
    const nameLength = readUint16(directory, offset + 64);
    if (!nameLength) continue;

    const name = decodeUtf16Le(directory.slice(offset, offset + nameLength - 2));
    const type = directory[offset + 66];
    const startSector = readUint32(directory, offset + 116);
    const size = readUint32(directory, offset + 120);

    streams.push({
      name,
      type,
      startSector,
      size,
      data:
        type === 2 && startSector < 0xffffff00
          ? readStreamByChain(file, fat, startSector, size)
          : new Uint8Array(),
    });
  }

  return streams;
};

const readFat = (file: Uint8Array) => {
  const fat: number[] = [];
  const fatSectorCount = readUint32(file, 44);

  for (let i = 0; i < fatSectorCount; i += 1) {
    const sector = readUint32(file, 76 + i * 4);
    const offset = sectorOffset(sector);

    for (let entry = 0; entry < SECTOR_SIZE / 4; entry += 1) {
      fat.push(readUint32(file, offset + entry * 4));
    }
  }

  return fat;
};

const readStreamByChain = (
  file: Uint8Array,
  fat: number[],
  startSector: number,
  streamSize: number
) => {
  const chunks: Uint8Array[] = [];
  let sector = startSector;
  let guard = 0;

  while (sector !== END_OF_CHAIN && sector !== FREE_SECTOR && guard < 10000) {
    const offset = sectorOffset(sector);
    chunks.push(file.slice(offset, offset + SECTOR_SIZE));
    sector = fat[sector];
    guard += 1;
  }

  return concatBytes(...chunks).slice(0, streamSize);
};

const createOleFile = (streams: Array<{ name: string; type: number; data: Uint8Array }>) => {
  const streamSectorCounts = streams.map((stream) => Math.max(1, Math.ceil(stream.data.length / SECTOR_SIZE)));
  let fatSectorCount = 1;

  while (true) {
    const directorySectorCount = 1;
    const dataSectorCount = streamSectorCounts.reduce((sum, count) => sum + count, 0);
    const totalSectors = dataSectorCount + directorySectorCount + fatSectorCount;
    const requiredFatSectorCount = Math.ceil(totalSectors / 128);
    if (requiredFatSectorCount === fatSectorCount) break;
    fatSectorCount = requiredFatSectorCount;
  }

  const dataSectorCount = streamSectorCounts.reduce((sum, count) => sum + count, 0);
  const directorySector = dataSectorCount;
  const firstFatSector = directorySector + 1;
  const totalSectors = dataSectorCount + 1 + fatSectorCount;
  const fatEntries = new Array(fatSectorCount * 128).fill(FREE_SECTOR);
  const streamStarts: number[] = [];
  let nextSector = 0;

  streams.forEach((stream, streamIndex) => {
    const sectorCount = streamSectorCounts[streamIndex];
    streamStarts.push(nextSector);

    for (let i = 0; i < sectorCount; i += 1) {
      const sector = nextSector + i;
      fatEntries[sector] = i === sectorCount - 1 ? END_OF_CHAIN : sector + 1;
    }

    nextSector += sectorCount;
  });

  fatEntries[directorySector] = END_OF_CHAIN;

  for (let i = 0; i < fatSectorCount; i += 1) {
    fatEntries[firstFatSector + i] = FAT_SECTOR;
  }

  const header = createOleHeader(fatSectorCount, directorySector, firstFatSector);
  const dataSectors = concatBytes(
    ...streams.map((stream, index) =>
      padToSector(stream.data, streamSectorCounts[index] * SECTOR_SIZE)
    )
  );
  const directory = createDirectorySector(streams, streamStarts);
  const fat = createFatSectors(fatEntries, fatSectorCount);

  return concatBytes(header, dataSectors, directory, fat).slice(0, 512 + totalSectors * SECTOR_SIZE);
};

const createOleHeader = (
  fatSectorCount: number,
  directorySector: number,
  firstFatSector: number
) => {
  const header = new Uint8Array(512);
  header.set([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1], 0);
  writeUint16(header, 24, 0x003e);
  writeUint16(header, 26, 0x0003);
  writeUint16(header, 28, 0xfffe);
  writeUint16(header, 30, 0x0009);
  writeUint16(header, 32, 0x0006);
  writeUint32(header, 44, fatSectorCount);
  writeUint32(header, 48, directorySector);
  writeUint32(header, 56, 4096);
  writeUint32(header, 60, END_OF_CHAIN);
  writeUint32(header, 68, END_OF_CHAIN);

  for (let i = 0; i < 109; i += 1) {
    writeUint32(header, 76 + i * 4, i < fatSectorCount ? firstFatSector + i : FREE_SECTOR);
  }

  return header;
};

const createDirectorySector = (
  streams: Array<{ name: string; type: number; data: Uint8Array }>,
  streamStarts: number[]
) => {
  const directory = new Uint8Array(Math.ceil((streams.length + 1) / 4) * SECTOR_SIZE);
  directory.set(createDirectoryEntry("Root Entry", 5, 0, 2, END_OF_CHAIN, 0), 0);

  streams.forEach((stream, index) => {
    const entryIndex = index + 1;
    const left = entryIndex === 2 ? 1 : FREE_SECTOR;
    const right = entryIndex === 2 && streams.length > 2 ? 3 : FREE_SECTOR;

    directory.set(
      createDirectoryEntry(
        stream.name,
        stream.type,
        left,
        FREE_SECTOR,
        right,
        streamStarts[index],
        stream.data.length
      ),
      entryIndex * 128
    );
  });

  return directory.slice(0, SECTOR_SIZE);
};

const createDirectoryEntry = (
  name: string,
  objectType: number,
  left: number,
  child: number,
  right: number,
  startSector: number,
  streamSize: number
) => {
  const entry = new Uint8Array(128);
  const nameBytes = encodeUtf16Le(`${name}\0`);
  entry.set(nameBytes.slice(0, 64), 0);
  writeUint16(entry, 64, Math.min(nameBytes.length, 64));
  entry[66] = objectType;
  entry[67] = 1;
  writeUint32(entry, 68, left);
  writeUint32(entry, 72, right);
  writeUint32(entry, 76, child);
  writeUint32(entry, 116, startSector);
  writeUint32(entry, 120, streamSize);
  return entry;
};

const createFatSectors = (fatEntries: number[], fatSectorCount: number) => {
  const fat = new Uint8Array(fatSectorCount * SECTOR_SIZE);
  fatEntries.forEach((entry, index) => writeUint32(fat, index * 4, entry));
  return fat;
};

const record = (type: number, ...parts: Uint8Array[]) => {
  const length = parts.reduce((sum, part) => sum + part.length, 0);
  return concatBytes(uint16(type), uint16(length), ...parts);
};

const uint16 = (value: number) => {
  const bytes = new Uint8Array(2);
  writeUint16(bytes, 0, value);
  return bytes;
};

const float64 = (value: number) => {
  const bytes = new Uint8Array(8);
  new DataView(bytes.buffer).setFloat64(0, value, true);
  return bytes;
};

const readUint16 = (target: Uint8Array, offset: number) =>
  new DataView(target.buffer, target.byteOffset).getUint16(offset, true);

const readUint32 = (target: Uint8Array, offset: number) =>
  new DataView(target.buffer, target.byteOffset).getUint32(offset, true);

const writeUint16 = (target: Uint8Array, offset: number, value: number) => {
  new DataView(target.buffer, target.byteOffset).setUint16(offset, value, true);
};

const writeUint32 = (target: Uint8Array, offset: number, value: number) => {
  new DataView(target.buffer, target.byteOffset).setUint32(offset, value >>> 0, true);
};

const concatBytes = (...chunks: Uint8Array[]) => {
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;

  chunks.forEach((chunk) => {
    result.set(chunk, offset);
    offset += chunk.length;
  });

  return result;
};

const padToSector = (bytes: Uint8Array, targetLength: number) => {
  const padded = new Uint8Array(targetLength);
  padded.set(bytes);
  return padded;
};

const sectorOffset = (sector: number) => 512 + sector * SECTOR_SIZE;

const encodeAnsi = (value: string) => {
  const normalized = value
    .replace(/[“”]/g, "\"")
    .replace(/[‘’]/g, "'")
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
    .trim();

  const bytes = new Uint8Array(normalized.length);
  for (let i = 0; i < normalized.length; i += 1) {
    const code = normalized.charCodeAt(i);
    bytes[i] = code <= 255 ? code : 32;
  }
  return bytes;
};

const encodeUtf16Le = (value: string) => {
  const bytes = new Uint8Array(value.length * 2);
  for (let i = 0; i < value.length; i += 1) {
    writeUint16(bytes, i * 2, value.charCodeAt(i));
  }
  return bytes;
};

const decodeUtf16Le = (bytes: Uint8Array) => {
  let value = "";
  for (let i = 0; i + 1 < bytes.length; i += 2) {
    value += String.fromCharCode(readUint16(bytes, i));
  }
  return value;
};
