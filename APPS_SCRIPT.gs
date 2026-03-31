// ============================================================
// N5 Catalog — Apps Script API
// ============================================================
// INSTRUCCIONES:
// 1. Abre tu Google Spreadsheet
// 2. Extensiones > Apps Script
// 3. Borra todo el código existente
// 4. Pega este código completo
// 5. Cambia SPREADSHEET_ID por el ID real de tu hoja
// 6. Guarda y despliega como Aplicación Web
// ============================================================

const SPREADSHEET_ID = 'PON_AQUI_EL_ID_DE_TU_SPREADSHEET';
const CACHE_SECONDS  = 21600; // 6 horas de cache (mejora velocidad)

function doGet(e) {
  const tema = e.parameter.tema || '';

  // Intentar servir desde cache primero (mucho más rápido)
  const cache    = CacheService.getScriptCache();
  const cacheKey = 'catalogo_' + tema;
  const cached   = cache.get(cacheKey);

  if (cached) {
    return ContentService
      .createTextOutput(cached)
      .setMimeType(ContentService.MimeType.JSON);
  }

  // Sin cache: leer desde Sheets
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  // ── Leer hoja CONFIG (siempre) ──
  const configSheet = ss.getSheetByName('CONFIG');
  if (!configSheet) {
    return error('Falta la hoja CONFIG en el spreadsheet');
  }

  const configRows = configSheet.getDataRange().getValues();
  const config = {};
  configRows.forEach(([key, value]) => {
    if (key) config[String(key).trim()] = value;
  });

  // Si no se pidió tema, solo regresar config (para la página de inicio)
  if (!tema) {
    const payload = JSON.stringify({ config, cats: [], prods: [] });
    cache.put(cacheKey, payload, CACHE_SECONDS);
    return ContentService
      .createTextOutput(payload)
      .setMimeType(ContentService.MimeType.JSON);
  }

  // ── Leer hoja de productos del tema ──
  const sheet = ss.getSheetByName(tema);
  if (!sheet) {
    return error('No existe la hoja: ' + tema);
  }

  // ── Leer categorías (hoja CATS_nombreTema) ──
  const catsSheet = ss.getSheetByName('CATS_' + tema);
  const cats = [{ k: 'todos', l: 'Todos', icon: '🛠' }];
  if (catsSheet) {
    const catsData = catsSheet.getDataRange().getValues().slice(1);
    catsData.forEach(([k, l, icon]) => {
      if (k) cats.push({ k: String(k), l: String(l), icon: String(icon) });
    });
  }

  // ── Leer productos (fila 1 = encabezado, desde fila 2) ──
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    const payload = JSON.stringify({ config, cats, prods: [] });
    cache.put(cacheKey, payload, CACHE_SECONDS);
    return ContentService
      .createTextOutput(payload)
      .setMimeType(ContentService.MimeType.JSON);
  }

  const rows = sheet.getRange(2, 1, lastRow - 1, 18).getValues();

  const prods = rows
    .filter(r => r[0] && r[1]) // id y name requeridos
    .map(r => {
      const specs = [];
      if (r[10] && r[11]) specs.push([String(r[10]), String(r[11])]);
      if (r[12] && r[13]) specs.push([String(r[12]), String(r[13])]);
      if (r[14] && r[15]) specs.push([String(r[14]), String(r[15])]);

      return {
        id:       Number(r[0]),
        name:     String(r[1]),
        cat:      String(r[2] || ''),
        price:    Number(r[3]) || 0,
        orig:     r[4] ? Number(r[4]) : null,
        stock:    Number(r[5]) || 99,
        badge:    r[6] ? String(r[6]).toLowerCase() : null,
        emoji:    String(r[7] || '📦'),
        featured: r[8] === true || String(r[8]).toUpperCase() === 'TRUE',
        desc:     String(r[9] || ''),
        imageUrl: String(r[16] || ''),   // Columna Q — URL de Cloudinary
        imageFallback: String(r[17] || r[7] || '📦'), // Columna R — emoji fallback
        specs:    specs.length ? specs : null
      };
    });

  const payload = JSON.stringify({ config, cats, prods });

  // Guardar en cache
  try { cache.put(cacheKey, payload, CACHE_SECONDS); } catch(e) {}

  return ContentService
    .createTextOutput(payload)
    .setMimeType(ContentService.MimeType.JSON);
}

// Limpiar cache manualmente (ejecutar desde el editor si cambias datos urgentes)
function limpiarCache() {
  const cache = CacheService.getScriptCache();
  // Borra caches de los temas más comunes
  ['', 'herramientas', 'cosmeticos', 'ropa', 'alimentos', 'electronicos'].forEach(t => {
    cache.remove('catalogo_' + t);
  });
  Logger.log('Cache limpiado correctamente');
}

function error(msg) {
  return ContentService
    .createTextOutput(JSON.stringify({ error: msg }))
    .setMimeType(ContentService.MimeType.JSON);
}
