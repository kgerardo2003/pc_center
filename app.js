const state = {
  invoice: null,
  template: "classic",
  paperSize: "letter",
  logoAlign: "left",
  showQr: true,
  logoDataUrl: "",
  logoFileName: "",
  theme: {
    primary: "#164e63",
    accent: "#d97706",
    paper: "#ffffff",
    ink: "#172033",
  },
};

const PREFERENCES_KEY = "facturaXmlPersonalizador.v1";
let printScalePreparedAt = 0;

function readPreferences() {
  try {
    const raw = window.localStorage.getItem(PREFERENCES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    return {};
  }
}

function savePreferences() {
  const preferences = {
    template: state.template,
    paperSize: state.paperSize,
    logoAlign: state.logoAlign,
    showQr: state.showQr,
    logoDataUrl: state.logoDataUrl,
    logoFileName: state.logoFileName,
    logoSize: els.logoSizeInput.value,
    logoZoom: els.logoZoomInput.value,
    note: els.noteInput.value,
    theme: state.theme,
  };

  try {
    window.localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
    return true;
  } catch (error) {
    window.alert("El logo es demasiado pesado para guardarlo en este navegador. Se mostrara ahora, pero tendras que volver a cargarlo al abrir la app.");
    return false;
  }
}

function applySavedPreferences(preferences) {
  if (!preferences || typeof preferences !== "object") return;

  if (preferences.theme && typeof preferences.theme === "object") {
    state.theme = {
      ...state.theme,
      ...preferences.theme,
    };
    els.primaryColor.value = state.theme.primary;
    els.accentColor.value = state.theme.accent;
    els.paperColor.value = state.theme.paper;
    els.inkColor.value = state.theme.ink;
  }

  if (preferences.logoDataUrl) {
    state.logoDataUrl = preferences.logoDataUrl;
    state.logoFileName = preferences.logoFileName || "Logo guardado";
    els.logoPreview.src = preferences.logoDataUrl;
    els.logoFileName.textContent = state.logoFileName;
  }

  if (preferences.note) {
    els.noteInput.value = preferences.note;
  }

  state.showQr = preferences.showQr !== false;
  els.showQrInput.checked = state.showQr;
}


const demoXml = `<?xml version="1.0" encoding="UTF-8"?>
<dte:GTDocumento xmlns:dte="http://www.sat.gob.gt/dte/fel/0.2.0" Version="0.1">
  <dte:SAT ClaseDocumento="dte">
    <dte:DTE ID="DatosCertificados">
      <dte:DatosEmision ID="DatosEmision">
        <dte:DatosGenerales CodigoMoneda="GTQ" FechaHoraEmision="2026-05-26T09:30:00-06:00" Tipo="FACT"/>
        <dte:Emisor AfiliacionIVA="GEN" CodigoEstablecimiento="1" CorreoEmisor="ventas@empresa.gt" NITEmisor="1234567-8" NombreComercial="Empresa Demo" NombreEmisor="Empresa Demo, S.A.">
          <dte:DireccionEmisor>
            <dte:Direccion>Ciudad de Guatemala</dte:Direccion>
            <dte:Municipio>Guatemala</dte:Municipio>
            <dte:Departamento>Guatemala</dte:Departamento>
            <dte:Pais>GT</dte:Pais>
          </dte:DireccionEmisor>
        </dte:Emisor>
        <dte:Receptor CorreoReceptor="cliente@correo.com" IDReceptor="CF" NombreReceptor="Cliente Demo">
          <dte:DireccionReceptor>
            <dte:Direccion>Guatemala</dte:Direccion>
          </dte:DireccionReceptor>
        </dte:Receptor>
        <dte:Items>
          <dte:Item BienOServicio="S" NumeroLinea="1">
            <dte:Cantidad>1</dte:Cantidad>
            <dte:UnidadMedida>UNI</dte:UnidadMedida>
            <dte:Descripcion>Servicio profesional</dte:Descripcion>
            <dte:PrecioUnitario>1200.00</dte:PrecioUnitario>
            <dte:Precio>1200.00</dte:Precio>
            <dte:Descuento>0.00</dte:Descuento>
            <dte:Impuestos>
              <dte:Impuesto>
                <dte:NombreCorto>IVA</dte:NombreCorto>
                <dte:MontoImpuesto>128.57</dte:MontoImpuesto>
              </dte:Impuesto>
            </dte:Impuestos>
            <dte:Total>1200.00</dte:Total>
          </dte:Item>
          <dte:Item BienOServicio="B" NumeroLinea="2">
            <dte:Cantidad>2</dte:Cantidad>
            <dte:UnidadMedida>UNI</dte:UnidadMedida>
            <dte:Descripcion>Producto personalizado</dte:Descripcion>
            <dte:PrecioUnitario>350.00</dte:PrecioUnitario>
            <dte:Precio>700.00</dte:Precio>
            <dte:Descuento>25.00</dte:Descuento>
            <dte:Impuestos>
              <dte:Impuesto>
                <dte:NombreCorto>IVA</dte:NombreCorto>
                <dte:MontoImpuesto>72.32</dte:MontoImpuesto>
              </dte:Impuesto>
            </dte:Impuestos>
            <dte:Total>675.00</dte:Total>
          </dte:Item>
        </dte:Items>
        <dte:Totales>
          <dte:TotalImpuestos>
            <dte:TotalImpuesto NombreCorto="IVA" TotalMontoImpuesto="200.89"/>
          </dte:TotalImpuestos>
          <dte:GranTotal>1875.00</dte:GranTotal>
        </dte:Totales>
      </dte:DatosEmision>
      <dte:Certificacion>
        <dte:NumeroAutorizacion Serie="A1B2C3" Numero="987654321">A1B2C3-987654321</dte:NumeroAutorizacion>
      </dte:Certificacion>
    </dte:DTE>
  </dte:SAT>
</dte:GTDocumento>`;

const els = {
  xmlInput: document.querySelector("#xmlInput"),
  logoInput: document.querySelector("#logoInput"),
  xmlDropZone: document.querySelector("#xmlDropZone"),
  logoDropZone: document.querySelector("#logoDropZone"),
  xmlFileName: document.querySelector("#xmlFileName"),
  logoFileName: document.querySelector("#logoFileName"),
  primaryColor: document.querySelector("#primaryColor"),
  accentColor: document.querySelector("#accentColor"),
  paperColor: document.querySelector("#paperColor"),
  inkColor: document.querySelector("#inkColor"),
  resetThemeBtn: document.querySelector("#resetThemeBtn"),
  invoiceTitleInput: document.querySelector("#invoiceTitleInput"),
  noteInput: document.querySelector("#noteInput"),
  logoSizeInput: document.querySelector("#logoSizeInput"),
  logoSizeValue: document.querySelector("#logoSizeValue"),
  logoZoomInput: document.querySelector("#logoZoomInput"),
  logoZoomValue: document.querySelector("#logoZoomValue"),
  showQrInput: document.querySelector("#showQrInput"),
  issuerNameInput: document.querySelector("#issuerNameInput"),
  issuerTaxInput: document.querySelector("#issuerTaxInput"),
  customerNameInput: document.querySelector("#customerNameInput"),
  customerTaxInput: document.querySelector("#customerTaxInput"),
  loadSampleBtn: document.querySelector("#loadSampleBtn"),
  printBtn: document.querySelector("#printBtn"),
  invoicePage: document.querySelector("#invoicePage"),
  logoPreview: document.querySelector("#logoPreview"),
  previewName: document.querySelector("#previewName"),
  parseStatus: document.querySelector("#parseStatus"),
  issuerName: document.querySelector("#issuerName"),
  issuerMeta: document.querySelector("#issuerMeta"),
  issuerAddress: document.querySelector("#issuerAddress"),
  invoiceTitle: document.querySelector("#invoiceTitle"),
  invoiceSeries: document.querySelector("#invoiceSeries"),
  invoiceDteNumber: document.querySelector("#invoiceDteNumber"),
  invoiceDate: document.querySelector("#invoiceDate"),
  customerName: document.querySelector("#customerName"),
  customerMeta: document.querySelector("#customerMeta"),
  currencyLabel: document.querySelector("#currencyLabel"),
  documentType: document.querySelector("#documentType"),
  heroTotal: document.querySelector("#heroTotal"),
  taxSummary: document.querySelector("#taxSummary"),
  itemsBody: document.querySelector("#itemsBody"),
  subtotalValue: document.querySelector("#subtotalValue"),
  taxValue: document.querySelector("#taxValue"),
  totalValue: document.querySelector("#totalValue"),
  invoiceNote: document.querySelector("#invoiceNote"),
  certificationText: document.querySelector("#certificationText"),
  qrCard: document.querySelector("#qrCard"),
  qrCode: document.querySelector("#qrCode"),
  qrLink: document.querySelector("#qrLink"),
  itemRowTemplate: document.querySelector("#itemRowTemplate"),
};

function getElements(root, localName) {
  return Array.from(root.getElementsByTagName("*")).filter(
    (node) => node.localName && node.localName.toLowerCase() === localName.toLowerCase(),
  );
}

function firstElement(root, localName) {
  return getElements(root, localName)[0] || null;
}

function textOf(root, localName, fallback = "") {
  const node = firstElement(root, localName);
  return node ? node.textContent.trim() : fallback;
}

function attrOf(node, names, fallback = "") {
  if (!node) return fallback;
  const wanted = Array.isArray(names) ? names : [names];
  for (const name of wanted) {
    if (node.hasAttribute(name)) return node.getAttribute(name) || fallback;
  }
  const found = Array.from(node.attributes || []).find((attr) =>
    wanted.some((name) => attr.localName.toLowerCase() === name.toLowerCase()),
  );
  return found ? found.value : fallback;
}

function numberFrom(value) {
  const clean = String(value || "").replace(/[^\d.-]/g, "");
  const numeric = Number.parseFloat(clean);
  return Number.isFinite(numeric) ? numeric : 0;
}

function parseInvoiceXml(xmlText) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, "application/xml");
  const parseError = doc.querySelector("parsererror");

  if (parseError) {
    throw new Error("El XML no se pudo leer. Revisa que el archivo este completo.");
  }

  const datos = firstElement(doc, "DatosGenerales") || doc.documentElement;
  const emisor = firstElement(doc, "Emisor");
  const receptor = firstElement(doc, "Receptor");
  const direccionEmisor = firstElement(doc, "DireccionEmisor") || emisor;
  const direccionReceptor = firstElement(doc, "DireccionReceptor") || receptor;
  const cert = firstElement(doc, "NumeroAutorizacion");
  const accessNumber = textOf(doc, "NumeroAcceso", "");
  const itemNodes = getElements(doc, "Item");

  const items = itemNodes.map((item, index) => {
    const quantity = numberFrom(textOf(item, "Cantidad", "1"));
    const unitPrice = numberFrom(textOf(item, "PrecioUnitario", textOf(item, "Precio", "0")));
    const discount = numberFrom(textOf(item, "Descuento", "0"));
    const total = numberFrom(textOf(item, "Total", String(quantity * unitPrice - discount)));
    const tax = getElements(item, "MontoImpuesto").reduce((sum, node) => sum + numberFrom(node.textContent), 0);

    return {
      quantity,
      unit: textOf(item, "UnidadMedida", ""),
      description: textOf(item, "Descripcion", `Linea ${index + 1}`),
      unitPrice,
      discount,
      tax,
      total,
    };
  });

  const grandTotal = numberFrom(textOf(doc, "GranTotal", ""));
  const taxFromTotals = getElements(doc, "TotalImpuesto").reduce(
    (sum, node) => sum + numberFrom(attrOf(node, "TotalMontoImpuesto", node.textContent)),
    0,
  );
  const total = grandTotal || items.reduce((sum, item) => sum + item.total, 0);
  const tax = taxFromTotals || items.reduce((sum, item) => sum + item.tax, 0);
  const subtotal = Math.max(total - tax, 0);

  return {
    title: "Factura",
    fileLabel: "XML cargado",
    type: attrOf(datos, ["Tipo", "tipo"], "FACT"),
    currency: attrOf(datos, ["CodigoMoneda", "Moneda"], "GTQ"),
    date: attrOf(datos, ["FechaHoraEmision", "Fecha"], ""),
    authorization: cert ? cert.textContent.trim() : "",
    accessNumber,
    series: attrOf(cert, ["Serie", "serie"], ""),
    number: attrOf(cert, ["Numero", "numero"], ""),
    issuer: {
      name: attrOf(emisor, ["NombreComercial", "NombreEmisor"], textOf(doc, "NombreEmisor", "Empresa")),
      legalName: attrOf(emisor, "NombreEmisor", ""),
      taxId: attrOf(emisor, ["NITEmisor", "nit"], ""),
      email: attrOf(emisor, "CorreoEmisor", ""),
      address: [
        textOf(direccionEmisor, "Direccion", ""),
        textOf(direccionEmisor, "Municipio", ""),
        textOf(direccionEmisor, "Departamento", ""),
      ]
        .filter(Boolean)
        .join(", "),
    },
    customer: {
      name: attrOf(receptor, "NombreReceptor", textOf(doc, "NombreReceptor", "Cliente")),
      taxId: attrOf(receptor, ["IDReceptor", "NITReceptor"], ""),
      email: attrOf(receptor, "CorreoReceptor", ""),
      address: textOf(direccionReceptor, "Direccion", ""),
    },
    items: items.length
      ? items
      : [
          {
            quantity: 1,
            unit: "",
            description: "Item sin detalle detectado",
            unitPrice: total,
            discount: 0,
            tax,
            total,
          },
        ],
    totals: {
      subtotal,
      tax,
      total,
    },
  };
}

function currencySymbol(currency) {
  const code = String(currency || "").toUpperCase();
  const symbols = {
    GTQ: "Q",
    USD: "$",
    EUR: "EUR",
    MXN: "$",
    HNL: "L",
    CRC: "CRC",
  };
  return symbols[code] || code || "";
}

function money(value, currency) {
  const symbol = currencySymbol(currency);
  return `${symbol} ${numberFrom(value).toLocaleString("es-GT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`.trim();
}

function displayDate(value) {
  if (!value) return new Date().toLocaleDateString("es-GT");
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("es-GT", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function documentNumber(invoice) {
  const serial = [invoice.series, invoice.number].filter(Boolean).join("-");
  return serial || invoice.authorization || "Sin numero";
}

function mmToPx(mm) {
  return (mm / 25.4) * 96;
}

function inchToPx(inches) {
  return inches * 96;
}

function printAreaForPaper(paperSize) {
  const paperAreas = {
    letter: {
      width: inchToPx(8.5) - mmToPx(24),
      height: inchToPx(11) - mmToPx(24),
    },
    "half-letter": {
      width: inchToPx(5.5) - mmToPx(16),
      height: inchToPx(8.5) - mmToPx(16),
    },
    ticket: {
      width: mmToPx(80) - mmToPx(8),
      height: mmToPx(297) - mmToPx(8),
    },
  };

  return paperAreas[paperSize] || paperAreas.letter;
}

function prepareSinglePagePrint(force = false) {
  if (!force && Date.now() - printScalePreparedAt < 2000) {
    return numberFrom(getComputedStyle(document.documentElement).getPropertyValue("--print-scale")) || 1;
  }

  const area = printAreaForPaper(state.paperSize);
  const container = document.createElement("div");
  const clone = els.invoicePage.cloneNode(true);

  container.setAttribute("aria-hidden", "true");
  container.style.position = "fixed";
  container.style.left = "-10000px";
  container.style.top = "0";
  container.style.width = `${area.width}px`;
  container.style.visibility = "hidden";
  container.style.pointerEvents = "none";
  container.style.zIndex = "-1";

  clone.style.width = "100%";
  clone.style.minHeight = "auto";
  clone.style.padding = "0";
  clone.style.border = "0";
  clone.style.borderRadius = "0";
  clone.style.boxShadow = "none";
  clone.style.zoom = "1";
  clone.style.height = "auto";
  clone.style.transform = "none";
  clone.style.overflow = "visible";

  if (state.paperSize === "ticket") {
    clone.style.fontSize = "8.5pt";
  }

  container.appendChild(clone);
  document.body.appendChild(container);

  const measuredWidth = Math.max(clone.scrollWidth, clone.getBoundingClientRect().width);
  const measuredHeight = Math.max(clone.scrollHeight, clone.getBoundingClientRect().height);
  const widthScale = area.width / measuredWidth;
  const heightScale = area.height / measuredHeight;
  const desiredScale = Math.max(0.01, Number.isFinite(Math.min(widthScale, heightScale)) ? Math.min(1, widthScale, heightScale) * 0.97 : 1);
  const zoomScale = Math.max(0.1, desiredScale);
  const density = Math.min(1, desiredScale / zoomScale);
  const rootStyles = getComputedStyle(document.documentElement);
  const currentLogoSize = numberFrom(rootStyles.getPropertyValue("--logo-size")) || 132;
  const currentQrSize = state.paperSize === "ticket" ? 116 : 132;
  const scaledPx = (value, minimum = 1) => `${Math.max(minimum, value * density).toFixed(2)}px`;

  document.documentElement.style.setProperty("--print-scale", zoomScale.toFixed(4));
  document.documentElement.style.setProperty("--print-density", density.toFixed(4));
  document.documentElement.style.setProperty("--print-logo-size", scaledPx(currentLogoSize, 10));
  document.documentElement.style.setProperty("--print-qr-size", scaledPx(currentQrSize, 20));
  document.documentElement.style.setProperty("--print-gap", scaledPx(24, 1));
  document.documentElement.style.setProperty("--print-small-gap", scaledPx(12, 1));
  document.documentElement.style.setProperty("--print-pad", scaledPx(18, 1));
  document.documentElement.style.setProperty("--print-cell-y", scaledPx(15, 0.5));
  document.documentElement.style.setProperty("--print-cell-x", scaledPx(15, 0.5));
  document.documentElement.style.setProperty("--print-table-font", scaledPx(13, 3));
  printScalePreparedAt = Date.now();
  container.remove();

  return desiredScale;
}

function resetPrintScale() {
  [
    "--print-scale",
    "--print-density",
    "--print-logo-size",
    "--print-qr-size",
    "--print-gap",
    "--print-small-gap",
    "--print-pad",
    "--print-cell-y",
    "--print-cell-x",
    "--print-table-font",
  ].forEach((property) => document.documentElement.style.removeProperty(property));
  printScalePreparedAt = 0;
}

function verifierValue(value) {
  return String(value || "").trim().replace(/\s+/g, "");
}

function buildVerifierUrl(invoice, issuerTax, customerTax) {
  const number = invoice.authorization || invoice.accessNumber;
  if (!number) return "";

  const params = new URLSearchParams({
    tipo: invoice.authorization ? "autorizacion" : "contingencia",
    numero: verifierValue(number),
    emisor: verifierValue(issuerTax || invoice.issuer.taxId),
    receptor: verifierValue(customerTax || invoice.customer.taxId || "CF"),
    monto: numberFrom(invoice.totals.total).toFixed(2),
  });

  return `https://felpub.c.sat.gob.gt/verificador-web/publico/vistas/verificacionDte.jsf?${params.toString()}`;
}

function applyTheme() {
  const root = document.documentElement;
  root.style.setProperty("--primary", state.theme.primary);
  root.style.setProperty("--accent", state.theme.accent);
  root.style.setProperty("--paper", state.theme.paper);
  root.style.setProperty("--ink", state.theme.ink);
}

function applyTemplate(template) {
  state.template = template;
  els.invoicePage.classList.remove("template-classic", "template-modern", "template-compact");
  els.invoicePage.classList.add(`template-${template}`);
  document.querySelectorAll("[data-template]").forEach((button) => {
    button.classList.toggle("active", button.dataset.template === template);
  });
}

function applyPaperSize(paperSize) {
  state.paperSize = paperSize;
  els.invoicePage.classList.remove("paper-letter", "paper-half-letter", "paper-ticket");
  els.invoicePage.classList.add(`paper-${paperSize}`);
  document.querySelectorAll("[data-paper]").forEach((button) => {
    button.classList.toggle("active", button.dataset.paper === paperSize);
  });
}

function applyLogoAlign(align) {
  state.logoAlign = align;
  els.invoicePage.classList.remove("logo-left", "logo-center", "logo-right");
  els.invoicePage.classList.add(`logo-${align}`);
  document.querySelectorAll("[data-logo-align]").forEach((button) => {
    button.classList.toggle("active", button.dataset.logoAlign === align);
  });
}

function applyLogoSize(size) {
  const value = Math.max(64, Math.min(440, numberFrom(size) || 132));
  document.documentElement.style.setProperty("--logo-size", `${value}px`);
  els.logoSizeInput.value = String(value);
  els.logoSizeValue.textContent = `${value} px`;
}

function applyLogoZoom(zoom) {
  const value = Math.max(80, Math.min(190, numberFrom(zoom) || 100));
  document.documentElement.style.setProperty("--logo-zoom", String(value / 100));
  els.logoZoomInput.value = String(value);
  els.logoZoomValue.textContent = `${value}%`;
}

function syncInputs(invoice) {
  els.invoiceTitleInput.value = invoice.title || "Factura";
  els.issuerNameInput.value = invoice.issuer.name || "";
  els.issuerTaxInput.value = invoice.issuer.taxId || "";
  els.customerNameInput.value = invoice.customer.name || "";
  els.customerTaxInput.value = invoice.customer.taxId || "";
}

function renderInvoice() {
  const invoice = state.invoice;
  if (!invoice) return;

  const title = els.invoiceTitleInput.value.trim() || "Factura";
  const issuerName = els.issuerNameInput.value.trim() || invoice.issuer.name;
  const issuerTax = els.issuerTaxInput.value.trim() || invoice.issuer.taxId || "CF";
  const customerName = els.customerNameInput.value.trim() || invoice.customer.name;
  const customerTax = els.customerTaxInput.value.trim() || invoice.customer.taxId || "CF";
  const note = els.noteInput.value.trim() || "Gracias por su compra.";

  els.previewName.textContent = issuerName || "Factura";
  els.invoiceTitle.textContent = title;
  els.issuerName.textContent = issuerName || "Empresa";
  els.issuerMeta.textContent = [
    `NIT: ${issuerTax}`,
    invoice.issuer.email,
    invoice.issuer.legalName && invoice.issuer.legalName !== issuerName ? invoice.issuer.legalName : "",
  ]
    .filter(Boolean)
    .join(" | ");
  els.issuerAddress.textContent = invoice.issuer.address || "Direccion no incluida";
  els.invoiceSeries.textContent = invoice.series || "Sin serie";
  els.invoiceDteNumber.textContent = invoice.number || invoice.authorization || invoice.accessNumber || "Sin numero";
  els.invoiceDate.textContent = displayDate(invoice.date);
  els.customerName.textContent = customerName || "Cliente";
  els.customerMeta.textContent = [`NIT: ${customerTax}`, invoice.customer.email, invoice.customer.address]
    .filter(Boolean)
    .join(" | ");
  els.currencyLabel.textContent = invoice.currency;
  els.documentType.textContent = invoice.type;
  els.heroTotal.textContent = money(invoice.totals.total, invoice.currency);
  els.taxSummary.textContent = invoice.totals.tax ? `${money(invoice.totals.tax, invoice.currency)} impuestos` : "Sin impuestos detectados";
  els.subtotalValue.textContent = money(invoice.totals.subtotal, invoice.currency);
  els.taxValue.textContent = money(invoice.totals.tax, invoice.currency);
  els.totalValue.textContent = money(invoice.totals.total, invoice.currency);
  els.invoiceNote.textContent = note;
  els.certificationText.textContent = invoice.authorization
    ? `Autorizacion: ${invoice.authorization}`
    : "Documento generado desde XML.";
  renderVerifierQr(buildVerifierUrl(invoice, issuerTax, customerTax));

  els.itemsBody.replaceChildren(
    ...invoice.items.map((item) => {
      const row = els.itemRowTemplate.content.firstElementChild.cloneNode(true);
      const cells = row.querySelectorAll("td");
      cells[0].textContent = [item.quantity, item.unit].filter(Boolean).join(" ");
      cells[1].textContent = item.description;
      cells[2].textContent = money(item.unitPrice, invoice.currency);
      cells[3].textContent = money(item.total, invoice.currency);
      return row;
    }),
  );
}

function renderVerifierQr(url) {
  const shouldShow = state.showQr && Boolean(url);
  els.qrCard.classList.toggle("is-hidden", !shouldShow);
  els.invoicePage.classList.toggle("qr-hidden", !shouldShow);
  els.qrLink.href = url || "#";

  if (!shouldShow) {
    els.qrCode.replaceChildren();
    return;
  }

  try {
    els.qrCode.innerHTML = createQrSvg(url);
  } catch (error) {
    els.qrCode.textContent = "QR";
    els.qrLink.href = url;
  }
}

const QR_VERSION = 10;
const QR_SIZE = 21 + (QR_VERSION - 1) * 4;
const QR_ECC_CODEWORDS = 18;
const QR_DATA_BLOCKS = [68, 68, 69, 69];
const QR_DATA_CODEWORDS = QR_DATA_BLOCKS.reduce((sum, value) => sum + value, 0);
const QR_ALIGNMENT_POSITIONS = [6, 28, 50];
const QR_EXP = [];
const QR_LOG = [];

function initGaloisTables() {
  if (QR_EXP.length) return;
  let value = 1;
  for (let i = 0; i < 255; i += 1) {
    QR_EXP[i] = value;
    QR_LOG[value] = i;
    value <<= 1;
    if (value & 0x100) value ^= 0x11d;
  }
  for (let i = 255; i < 512; i += 1) {
    QR_EXP[i] = QR_EXP[i - 255];
  }
}

function gfMultiply(left, right) {
  if (!left || !right) return 0;
  return QR_EXP[QR_LOG[left] + QR_LOG[right]];
}

function reedSolomonDivisor(degree) {
  initGaloisTables();
  const result = Array(degree).fill(0);
  result[degree - 1] = 1;
  let root = 1;

  for (let i = 0; i < degree; i += 1) {
    for (let j = 0; j < degree; j += 1) {
      result[j] = gfMultiply(result[j], root);
      if (j + 1 < degree) result[j] ^= result[j + 1];
    }
    root = gfMultiply(root, 0x02);
  }

  return result;
}

function reedSolomonRemainder(data, divisor) {
  const result = Array(divisor.length).fill(0);

  data.forEach((byte) => {
    const factor = byte ^ result.shift();
    result.push(0);
    divisor.forEach((coefficient, index) => {
      result[index] ^= gfMultiply(coefficient, factor);
    });
  });

  return result;
}

function appendBits(target, value, length) {
  for (let i = length - 1; i >= 0; i -= 1) {
    target.push((value >>> i) & 1);
  }
}

function dataCodewordsFromText(text) {
  const bytes = Array.from(new TextEncoder().encode(text));
  const capacityBits = QR_DATA_CODEWORDS * 8;

  if (bytes.length > 271) {
    throw new Error("El enlace de verificacion es demasiado largo para el QR local.");
  }

  const bits = [];
  appendBits(bits, 0x4, 4);
  appendBits(bits, bytes.length, 16);
  bytes.forEach((byte) => appendBits(bits, byte, 8));
  appendBits(bits, 0, Math.min(4, capacityBits - bits.length));

  while (bits.length % 8) bits.push(0);

  const result = [];
  for (let i = 0; i < bits.length; i += 8) {
    let value = 0;
    for (let j = 0; j < 8; j += 1) value = (value << 1) | bits[i + j];
    result.push(value);
  }

  for (let pad = 0xec; result.length < QR_DATA_CODEWORDS; pad ^= 0xfd) {
    result.push(pad);
  }

  return result;
}

function createQrCodewords(text) {
  const data = dataCodewordsFromText(text);
  const divisor = reedSolomonDivisor(QR_ECC_CODEWORDS);
  let offset = 0;
  const blocks = QR_DATA_BLOCKS.map((length) => {
    const block = data.slice(offset, offset + length);
    offset += length;
    return block;
  });
  const eccBlocks = blocks.map((block) => reedSolomonRemainder(block, divisor));
  const result = [];

  for (let i = 0; i < Math.max(...QR_DATA_BLOCKS); i += 1) {
    blocks.forEach((block) => {
      if (i < block.length) result.push(block[i]);
    });
  }

  for (let i = 0; i < QR_ECC_CODEWORDS; i += 1) {
    eccBlocks.forEach((block) => result.push(block[i]));
  }

  return result;
}

function qrBit(value, index) {
  return ((value >>> index) & 1) !== 0;
}

function qrFormatBits(mask) {
  const data = (1 << 3) | mask;
  let remainder = data;
  for (let i = 0; i < 10; i += 1) {
    remainder = (remainder << 1) ^ (((remainder >>> 9) & 1) * 0x537);
  }
  return ((data << 10) | remainder) ^ 0x5412;
}

function qrVersionBits() {
  let remainder = QR_VERSION;
  for (let i = 0; i < 12; i += 1) {
    remainder = (remainder << 1) ^ (((remainder >>> 11) & 1) * 0x1f25);
  }
  return (QR_VERSION << 12) | remainder;
}

function createEmptyQrMatrix() {
  return {
    modules: Array.from({ length: QR_SIZE }, () => Array(QR_SIZE).fill(false)),
    reserved: Array.from({ length: QR_SIZE }, () => Array(QR_SIZE).fill(false)),
  };
}

function setQrFunction(matrix, x, y, dark) {
  if (x < 0 || y < 0 || x >= QR_SIZE || y >= QR_SIZE) return;
  matrix.modules[y][x] = Boolean(dark);
  matrix.reserved[y][x] = true;
}

function drawFinder(matrix, left, top) {
  for (let y = -1; y <= 7; y += 1) {
    for (let x = -1; x <= 7; x += 1) {
      const xx = left + x;
      const yy = top + y;
      const inFinder = x >= 0 && x <= 6 && y >= 0 && y <= 6;
      const dark = inFinder && (x === 0 || x === 6 || y === 0 || y === 6 || (x >= 2 && x <= 4 && y >= 2 && y <= 4));
      setQrFunction(matrix, xx, yy, dark);
    }
  }
}

function drawAlignment(matrix, centerX, centerY) {
  for (let y = -2; y <= 2; y += 1) {
    for (let x = -2; x <= 2; x += 1) {
      const dark = Math.max(Math.abs(x), Math.abs(y)) !== 1;
      setQrFunction(matrix, centerX + x, centerY + y, dark);
    }
  }
}

function drawQrFunctionPatterns(matrix) {
  drawFinder(matrix, 0, 0);
  drawFinder(matrix, QR_SIZE - 7, 0);
  drawFinder(matrix, 0, QR_SIZE - 7);

  for (let i = 8; i < QR_SIZE - 8; i += 1) {
    setQrFunction(matrix, 6, i, i % 2 === 0);
    setQrFunction(matrix, i, 6, i % 2 === 0);
  }

  QR_ALIGNMENT_POSITIONS.forEach((x) => {
    QR_ALIGNMENT_POSITIONS.forEach((y) => {
      const overlapsFinder = (x === 6 && y === 6) || (x === 6 && y === QR_SIZE - 7) || (x === QR_SIZE - 7 && y === 6);
      if (!overlapsFinder) drawAlignment(matrix, x, y);
    });
  });

  drawQrFormatBits(matrix, 0);
  drawQrVersionBits(matrix);
}

function drawQrFormatBits(matrix, mask) {
  const bits = qrFormatBits(mask);

  for (let i = 0; i <= 5; i += 1) setQrFunction(matrix, 8, i, qrBit(bits, i));
  setQrFunction(matrix, 8, 7, qrBit(bits, 6));
  setQrFunction(matrix, 8, 8, qrBit(bits, 7));
  setQrFunction(matrix, 7, 8, qrBit(bits, 8));
  for (let i = 9; i < 15; i += 1) setQrFunction(matrix, 14 - i, 8, qrBit(bits, i));

  for (let i = 0; i < 8; i += 1) setQrFunction(matrix, QR_SIZE - 1 - i, 8, qrBit(bits, i));
  for (let i = 8; i < 15; i += 1) setQrFunction(matrix, 8, QR_SIZE - 15 + i, qrBit(bits, i));
  setQrFunction(matrix, 8, QR_SIZE - 8, true);
}

function drawQrVersionBits(matrix) {
  const bits = qrVersionBits();

  for (let i = 0; i < 18; i += 1) {
    const bit = qrBit(bits, i);
    const x = QR_SIZE - 11 + (i % 3);
    const y = Math.floor(i / 3);
    setQrFunction(matrix, x, y, bit);
    setQrFunction(matrix, y, x, bit);
  }
}

function placeQrData(matrix, codewords) {
  const bits = [];
  codewords.forEach((codeword) => appendBits(bits, codeword, 8));
  let index = 0;

  for (let right = QR_SIZE - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;

    for (let vertical = 0; vertical < QR_SIZE; vertical += 1) {
      const upward = ((right + 1) & 2) === 0;
      const y = upward ? QR_SIZE - 1 - vertical : vertical;

      for (let offset = 0; offset < 2; offset += 1) {
        const x = right - offset;
        if (matrix.reserved[y][x]) continue;

        const masked = Boolean(bits[index]) !== ((x + y) % 2 === 0);
        matrix.modules[y][x] = masked;
        index += 1;
      }
    }
  }
}

function createQrSvg(text) {
  const matrix = createEmptyQrMatrix();
  drawQrFunctionPatterns(matrix);
  placeQrData(matrix, createQrCodewords(text));

  const border = 4;
  const viewSize = QR_SIZE + border * 2;
  const paths = [];

  matrix.modules.forEach((row, y) => {
    row.forEach((dark, x) => {
      if (dark) paths.push(`M${x + border},${y + border}h1v1h-1z`);
    });
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewSize} ${viewSize}" shape-rendering="crispEdges" aria-hidden="true"><rect width="100%" height="100%" fill="#fff"/><path fill="#111" d="${paths.join(" ")}"/></svg>`;
}

function setInvoice(invoice, label, status = "XML cargado") {
  state.invoice = invoice;
  invoice.fileLabel = label;
  els.xmlFileName.textContent = label;
  els.parseStatus.textContent = status;
  syncInputs(invoice);
  renderInvoice();
}

async function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file, "UTF-8");
  });
}

async function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function handleXmlFile(file) {
  if (!file) return;
  try {
    const xmlText = await readFileAsText(file);
    const invoice = parseInvoiceXml(xmlText);
    setInvoice(invoice, file.name, "Listo");
  } catch (error) {
    els.parseStatus.textContent = "Error XML";
    window.alert(error.message);
  }
}

async function handleLogoFile(file) {
  if (!file) return;
  const dataUrl = await readFileAsDataUrl(file);
  state.logoDataUrl = dataUrl;
  state.logoFileName = file.name;
  els.logoPreview.src = dataUrl;
  els.logoFileName.textContent = file.name;
  savePreferences();
}

function bindDropZone(zone, callback) {
  zone.addEventListener("dragover", (event) => {
    event.preventDefault();
    zone.classList.add("dragover");
  });
  zone.addEventListener("dragleave", () => zone.classList.remove("dragover"));
  zone.addEventListener("drop", (event) => {
    event.preventDefault();
    zone.classList.remove("dragover");
    callback(event.dataTransfer.files[0]);
  });
}

function bindEvents() {
  els.xmlInput.addEventListener("change", (event) => handleXmlFile(event.target.files[0]));
  els.logoInput.addEventListener("change", (event) => handleLogoFile(event.target.files[0]));
  bindDropZone(els.xmlDropZone, handleXmlFile);
  bindDropZone(els.logoDropZone, handleLogoFile);

  [
    ["primary", els.primaryColor],
    ["accent", els.accentColor],
    ["paper", els.paperColor],
    ["ink", els.inkColor],
  ].forEach(([key, input]) => {
    input.addEventListener("input", () => {
      state.theme[key] = input.value;
      applyTheme();
      savePreferences();
    });
  });

  els.resetThemeBtn.addEventListener("click", () => {
    state.theme = {
      primary: "#164e63",
      accent: "#d97706",
      paper: "#ffffff",
      ink: "#172033",
    };
    els.primaryColor.value = state.theme.primary;
    els.accentColor.value = state.theme.accent;
    els.paperColor.value = state.theme.paper;
    els.inkColor.value = state.theme.ink;
    applyTheme();
    savePreferences();
  });

  document.querySelectorAll("[data-template]").forEach((button) => {
    button.addEventListener("click", () => {
      applyTemplate(button.dataset.template);
      savePreferences();
    });
  });

  document.querySelectorAll("[data-paper]").forEach((button) => {
    button.addEventListener("click", () => {
      applyPaperSize(button.dataset.paper);
      savePreferences();
    });
  });

  document.querySelectorAll("[data-logo-align]").forEach((button) => {
    button.addEventListener("click", () => {
      applyLogoAlign(button.dataset.logoAlign);
      savePreferences();
    });
  });

  els.logoSizeInput.addEventListener("input", () => {
    applyLogoSize(els.logoSizeInput.value);
    savePreferences();
  });
  els.logoZoomInput.addEventListener("input", () => {
    applyLogoZoom(els.logoZoomInput.value);
    savePreferences();
  });

  els.showQrInput.addEventListener("change", () => {
    state.showQr = els.showQrInput.checked;
    renderInvoice();
    savePreferences();
  });

  [
    els.invoiceTitleInput,
    els.noteInput,
    els.issuerNameInput,
    els.issuerTaxInput,
    els.customerNameInput,
    els.customerTaxInput,
  ].forEach((input) =>
    input.addEventListener("input", () => {
      renderInvoice();
      if (input === els.noteInput) savePreferences();
    }),
  );

  els.loadSampleBtn.addEventListener("click", () => {
    setInvoice(parseInvoiceXml(demoXml), "factura-ejemplo.xml", "Demo");
  });

  els.printBtn.addEventListener("click", () => {
    document.title = `${els.invoiceTitle.textContent} - ${documentNumber(state.invoice)}`;
    prepareSinglePagePrint(true);
    window.print();
  });

  window.addEventListener("beforeprint", prepareSinglePagePrint);
  window.addEventListener("afterprint", resetPrintScale);
}

function boot() {
  const preferences = readPreferences();
  bindEvents();
  applySavedPreferences(preferences);
  applyTheme();
  applyTemplate(preferences.template || state.template);
  applyPaperSize(preferences.paperSize || state.paperSize);
  applyLogoAlign(preferences.logoAlign || state.logoAlign);
  applyLogoSize(preferences.logoSize || 132);
  applyLogoZoom(preferences.logoZoom || 100);
  setInvoice(parseInvoiceXml(demoXml), "factura-ejemplo.xml", "Demo");
}

boot();
