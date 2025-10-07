// Estado de la aplicación
const appState = {
  lotes: [],
  mapasLotes: {}, // Store satellite maps by lote index
}

let loteCounter = 0
function formatearFecha(fechaISO) {
  if (!fechaISO) return ""
  const [year, month, day] = fechaISO.split("-")
  return `${day}/${month}/${year}`
}
// ============================================
// FUNCIONES PARA LOTES
// ============================================

function agregarLote() {
  const container = document.getElementById("lotesContainer")
  const loteIndex = loteCounter++

  const loteSection = document.createElement("div")
  loteSection.className = "lote-section"
  loteSection.setAttribute("data-lote-index", loteIndex)

  loteSection.innerHTML = `
    <div class="lote-header">
      <h3>Lote ${loteIndex + 1}</h3>
      <button type="button" class="btn-delete" onclick="eliminarLote(${loteIndex})">Eliminar Lote</button>
    </div>
    
    <div class="lote-info">
      <div class="form-group">
        <label>Nombre del Lote:</label>
        <input type="text" class="lote-nombre" placeholder="Ej: Lote A" required>
      </div>
      
      <div class="form-group">
        <label>Hectáreas:</label>
        <input type="number" class="lote-hectareas" placeholder="0.00" min="0" step="0.01" required onchange="actualizarCalculosLote(${loteIndex})">
      </div>
      
      <div class="form-group">
        <label>Cultivo Antecesor:</label>
        <input type="text" class="lote-cultivo-antecesor" placeholder="Ej: Soja">
      </div>
      
      <div class="form-group">
        <label>Malezas:</label>
        <input type="text" class="lote-malezas" placeholder="Ej: Yuyo colorado">
      </div>
      
      <div class="form-group">
        <label>Tratamiento:</label>
        <input type="text" class="lote-tratamiento" placeholder="Ej: Herbicida">
      </div>
      
      <div class="form-group">
        <label>Recomendación:</label>
        <input type="text" class="lote-recomendacion" placeholder="Recomendación específica">
      </div>
      
      <div class="form-group">
        <label>Mapa Satelital:</label>
        <input type="file" class="lote-mapa" accept="image/*" onchange="cargarMapaSatelital(this, ${loteIndex})">
        <span class="mapa-status"></span>
      </div>
      
      <div class="form-group">
        <label>Observaciones:</label>
        <textarea class="lote-observaciones" placeholder="Observaciones adicionales" rows="2"></textarea>
      </div>
    </div>
    
    <div class="productos-section">
      <h4>Productos del Lote</h4>
      <div class="table-container">
        <table class="productosTable">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Dosis por Ha</th>
              <th>Unidad</th>
              <th>Precio USD</th>
              <th>USD/Ha</th>
              <th>Cantidad Total</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody></tbody>
          <tfoot>
            <tr class="total-row">
              <td colspan="4"><strong>TOTAL USD/Ha:</strong></td>
              <td class="total-usd-ha">$0.00</td>
              <td colspan="2"></td>
            </tr>
          </tfoot>
        </table>
      </div>
      <button type="button" class="btn-add-small" onclick="agregarProducto(${loteIndex})">Agregar Producto</button>
    </div>
  `

  container.appendChild(loteSection)
}

function cargarMapaSatelital(input, loteIndex) {
  const file = input.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      appState.mapasLotes[loteIndex] = e.target.result
      const statusSpan = input.nextElementSibling
      statusSpan.textContent = "✓ Cargado"
      statusSpan.style.color = "#4caf50"
      statusSpan.style.fontWeight = "bold"
    }
    reader.readAsDataURL(file)
  }
}

function eliminarLote(loteIndex) {
  const loteSection = document.querySelector(`[data-lote-index="${loteIndex}"]`)
  if (loteSection) {
    delete appState.mapasLotes[loteIndex]
    loteSection.remove()
  }
}

// ============================================
// FUNCIONES PARA PRODUCTOS
// ============================================

function agregarProducto(loteIndex) {
  const loteSection = document.querySelector(`[data-lote-index="${loteIndex}"]`)
  const tbody = loteSection.querySelector(".productosTable tbody")

  const row = document.createElement("tr")
  row.innerHTML = `
    <td><input type="text" class="prod-nombre" placeholder="Ej: Glifosato" required></td>
    <td><input type="number" class="prod-dosis-hectarea" placeholder="0.00" min="0" step="0.01" required onchange="actualizarCalculosLote(${loteIndex})"></td>
    <td>
      <select class="prod-unidad" required>
        <option value="L/ha">L/ha</option>
        <option value="kg/ha">kg/ha</option>
      </select>
    </td>
    <td><input type="number" class="prod-precio-usd" placeholder="0.00" min="0" step="0.01" required onchange="actualizarCalculosLote(${loteIndex})"></td>
    <td class="prod-usd-ha-display">$0.00</td>
    <td class="prod-cantidad-total-display">0.00 L</td>
    <td><button type="button" class="btn-delete-small" onclick="eliminarProducto(this, ${loteIndex})">Eliminar</button></td>
  `
  tbody.appendChild(row)
}

function eliminarProducto(btn, loteIndex) {
  btn.closest("tr").remove()
  actualizarCalculosLote(loteIndex)
}

// ============================================
// FUNCIÓN PARA ACTUALIZAR CÁLCULOS POR LOTE
// ============================================

function actualizarCalculosLote(loteIndex) {
  const loteSection = document.querySelector(`[data-lote-index="${loteIndex}"]`)
  if (!loteSection) return

  const hectareas = Number.parseFloat(loteSection.querySelector(".lote-hectareas").value) || 0
  const tbody = loteSection.querySelector(".productosTable tbody")
  const filas = tbody.querySelectorAll("tr")

  let totalUsdHa = 0

  filas.forEach((fila) => {
    const dosisHectarea = Number.parseFloat(fila.querySelector(".prod-dosis-hectarea").value) || 0
    const precioUsd = Number.parseFloat(fila.querySelector(".prod-precio-usd").value) || 0
    const unidad = fila.querySelector(".prod-unidad").value
    const usdHaDisplay = fila.querySelector(".prod-usd-ha-display")
    const cantidadTotalDisplay = fila.querySelector(".prod-cantidad-total-display")

    let usdHa = 0
    if (dosisHectarea > 0) {
      usdHa = precioUsd / dosisHectarea
    }
    usdHaDisplay.textContent = `$${usdHa.toFixed(2)}`

    // Calcular cantidad total basada en hectáreas
    const cantidadTotal = dosisHectarea * hectareas
    const unidadBase = unidad.split("/")[0] // "L" o "kg"
    cantidadTotalDisplay.textContent = `${cantidadTotal.toFixed(2)} ${unidadBase}`

    totalUsdHa += usdHa
  })

  // Actualizar el total USD/Ha en el footer de la tabla
  const totalUsdHaCell = loteSection.querySelector(".total-usd-ha")
  totalUsdHaCell.textContent = `$${totalUsdHa.toFixed(2)}`
}

// ============================================
// FUNCIÓN PARA RECOPILAR DATOS
// ============================================

function recopilarLotes() {
  const loteSections = document.querySelectorAll(".lote-section")
  const lotesData = []

  loteSections.forEach((loteSection) => {
    const loteIndex = loteSection.getAttribute("data-lote-index")
    const nombre = loteSection.querySelector(".lote-nombre").value.trim()
    const hectareas = Number.parseFloat(loteSection.querySelector(".lote-hectareas").value) || 0
    const cultivoAntecesor = loteSection.querySelector(".lote-cultivo-antecesor").value.trim()
    const malezas = loteSection.querySelector(".lote-malezas").value.trim()
    const tratamiento = loteSection.querySelector(".lote-tratamiento").value.trim()
    const recomendacion = loteSection.querySelector(".lote-recomendacion").value.trim()
    const observaciones = loteSection.querySelector(".lote-observaciones").value.trim()
    const mapaSatelital = appState.mapasLotes[loteIndex] || null

    // Recopilar productos del lote
    const tbody = loteSection.querySelector(".productosTable tbody")
    const filas = tbody.querySelectorAll("tr")
    const productos = []
    let totalUsdHa = 0

    filas.forEach((fila) => {
      const nombreProd = fila.querySelector(".prod-nombre").value.trim()
      const dosisHectarea = Number.parseFloat(fila.querySelector(".prod-dosis-hectarea").value) || 0
      const unidad = fila.querySelector(".prod-unidad").value
      const precioUsd = Number.parseFloat(fila.querySelector(".prod-precio-usd").value) || 0
      const usdHa = dosisHectarea > 0 ? precioUsd / dosisHectarea : 0
      const cantidadTotal = dosisHectarea * hectareas

      if (nombreProd && dosisHectarea > 0) {
        productos.push({
          nombre: nombreProd,
          dosisHectarea,
          unidad,
          precioUsd,
          usdHa,
          cantidadTotal,
        })
        totalUsdHa += usdHa
      }
    })

    if (nombre && hectareas > 0) {
      lotesData.push({
        nombre,
        hectareas,
        cultivoAntecesor,
        malezas,
        tratamiento,
        recomendacion,
        observaciones,
        mapaSatelital,
        productos,
        totalUsdHa,
      })
    }
  })

  return lotesData
}

// ============================================
// FUNCIÓN PARA GENERAR PDF
// ============================================

async function generarPDF() {
  // Validar formulario
  const fecha = document.getElementById("fecha").value
  const establecimiento = document.getElementById("establecimiento").value

  if (!fecha || !establecimiento) {
    alert("Por favor completa los campos obligatorios: Fecha y Establecimiento")
    return
  }

  // Recopilar datos
  const lotes = recopilarLotes()

  if (lotes.length === 0) {
    alert("Por favor agrega al menos un lote")
    return
  }

  const observacionesLote = document.getElementById("observacionesLote").value

  const { jsPDF } = window.jspdf
  const doc = new jsPDF()

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20

  doc.setFillColor(255, 255, 255)
  doc.rect(0, 0, pageWidth, pageHeight, "F")

  doc.setFillColor(34, 139, 34)
  doc.rect(0, 0, pageWidth, 40, "F")

  let yPos = 18

  doc.setFontSize(18)
  doc.setFont(undefined, "bold")
  doc.setTextColor(255, 255, 255)
  doc.text("INFORME DE MONITOREO DE CULTIVOS", pageWidth / 2, yPos, { align: "center" })

  yPos += 10
  doc.setFontSize(9)
  doc.setFont(undefined, "normal")
  doc.setTextColor(255, 255, 255)
  doc.text(
    "Ingeniero Agrónomo Bruno Segovia Larragneguy - Asesor Comercial Rindes y Cultivos DAS",
    pageWidth / 2,
    yPos,
    { align: "center" },
  )

  yPos = 50
  doc.setTextColor(0, 0, 0)

  doc.setFontSize(12)
  doc.setFont(undefined, "bold")
  doc.setTextColor(34, 139, 34)
  doc.text("INFORMACION GENERAL", margin, yPos)
  yPos += 2

  doc.setDrawColor(34, 139, 34)
  doc.setLineWidth(0.3)
  doc.line(margin, yPos, pageWidth - margin, yPos)
  yPos += 8

  doc.setFontSize(10)
  doc.setFont(undefined, "normal")
  doc.setTextColor(0, 0, 0)
  doc.text(`Fecha de recorrida: ${fecha}`, margin + 5, yPos)
  yPos += 6
  doc.text(`Establecimiento: ${establecimiento}`, margin + 5, yPos)
  yPos += 12

  doc.setFontSize(12)
  doc.setFont(undefined, "bold")
  doc.setTextColor(34, 139, 34)
  doc.text("DETALLE DE LOTES", margin, yPos)
  yPos += 2

  doc.setDrawColor(34, 139, 34)
  doc.setLineWidth(0.3)
  doc.line(margin, yPos, pageWidth - margin, yPos)
  yPos += 8

  lotes.forEach((lote, index) => {
    if (yPos > 240) {
      doc.addPage()
      yPos = margin
    }

    doc.setFillColor(240, 248, 240)
    doc.rect(margin, yPos - 5, pageWidth - 2 * margin, 8, "F")

    doc.setFontSize(11)
    doc.setFont(undefined, "bold")
    doc.setTextColor(34, 139, 34)
    doc.text(lote.nombre, margin + 3, yPos)
    doc.setFont(undefined, "normal")
    doc.setTextColor(80, 80, 80)
    doc.text(`(${lote.hectareas} ha)`, margin + 50, yPos)
    yPos += 8

    doc.setFontSize(9)
    doc.setTextColor(0, 0, 0)

    if (lote.cultivoAntecesor) {
      doc.setFont(undefined, "bold")
      doc.text("Cultivo Antecesor:", margin + 5, yPos)
      doc.setFont(undefined, "normal")
      doc.text(lote.cultivoAntecesor, margin + 45, yPos)
      yPos += 5
    }
    if (lote.malezas) {
      doc.setFont(undefined, "bold")
      doc.text("Malezas:", margin + 5, yPos)
      doc.setFont(undefined, "normal")
      doc.text(lote.malezas, margin + 45, yPos)
      yPos += 5
    }
    if (lote.tratamiento) {
      doc.setFont(undefined, "bold")
      doc.text("Tratamiento:", margin + 5, yPos)
      doc.setFont(undefined, "normal")
      doc.text(lote.tratamiento, margin + 45, yPos)
      yPos += 5
    }
    if (lote.recomendacion) {
      doc.setFont(undefined, "bold")
      doc.text("Recomendacion:", margin + 5, yPos)
      doc.setFont(undefined, "normal")
      const splitRec = doc.splitTextToSize(lote.recomendacion, pageWidth - margin - 50)
      doc.text(splitRec, margin + 45, yPos)
      yPos += splitRec.length * 5
    }
    if (lote.observaciones) {
      doc.setFont(undefined, "bold")
      doc.text("Observaciones:", margin + 5, yPos)
      doc.setFont(undefined, "normal")
      const splitObs = doc.splitTextToSize(lote.observaciones, pageWidth - margin - 50)
      doc.text(splitObs, margin + 45, yPos)
      yPos += splitObs.length * 5
    }

    yPos += 3

    if (lote.mapaSatelital) {
      if (yPos > 200) {
        doc.addPage()
        yPos = margin
      }

      doc.setFont(undefined, "bold")
      doc.text("Mapa Satelital:", margin + 5, yPos)
      yPos += 5

      try {
        const imgWidth = 80
        const imgHeight = 60
        doc.addImage(lote.mapaSatelital, "JPEG", margin + 5, yPos, imgWidth, imgHeight)
        yPos += imgHeight + 5
      } catch (error) {
        console.error("Error adding satellite map:", error)
        doc.setFont(undefined, "italic")
        doc.setTextColor(150, 150, 150)
        doc.text("(Error al cargar mapa)", margin + 5, yPos)
        yPos += 5
      }
    }

    if (lote.productos.length > 0) {
      doc.autoTable({
        startY: yPos,
        head: [["Producto", "Dosis/Ha", "Precio USD", "USD/Ha", "Cantidad Total"]],
        body: lote.productos.map((p) => [
          p.nombre,
          `${p.dosisHectarea} ${p.unidad}`,
          `$${p.precioUsd.toFixed(2)}`,
          `$${p.usdHa.toFixed(2)}`,
          `${p.cantidadTotal.toFixed(2)} ${p.unidad.split("/")[0]}`,
        ]),
        foot: [
          [
            { content: "TOTAL USD/Ha:", colSpan: 3, styles: { halign: "right", fontStyle: "bold" } },
            { content: `$${lote.totalUsdHa.toFixed(2)}`, styles: { fontStyle: "bold", fillColor: [240, 248, 240] } },
            "",
          ],
        ],
        theme: "grid",
        headStyles: {
          fillColor: [34, 139, 34],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          halign: "center",
          fontSize: 9,
        },
        bodyStyles: {
          fontSize: 8,
          textColor: [0, 0, 0],
        },
        footStyles: {
          fillColor: [240, 248, 240],
          textColor: [34, 139, 34],
          fontSize: 9,
        },
        alternateRowStyles: {
          fillColor: [248, 248, 248],
        },
        margin: { left: margin + 5, right: margin + 5 },
        styles: { cellPadding: 2 },
      })

      yPos = doc.lastAutoTable.finalY + 10
    }
  })

  if (observacionesLote) {
    if (yPos > 230) {
      doc.addPage()
      yPos = margin
    }

    doc.setFontSize(11)
    doc.setFont(undefined, "bold")
    doc.setTextColor(34, 139, 34)
    doc.text("OBSERVACIONES GENERALES DE LOTES", margin, yPos)
    yPos += 2
    doc.setDrawColor(34, 139, 34)
    doc.line(margin, yPos, pageWidth - margin, yPos)
    yPos += 7

    doc.setFont(undefined, "normal")
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(9)
    const splitObs = doc.splitTextToSize(observacionesLote, pageWidth - 2 * margin)
    doc.text(splitObs, margin + 5, yPos)
    yPos += splitObs.length * 5 + 8
  }

  const nombreArchivo = `Informe_${establecimiento.replace(/\s+/g, "_")}_${fecha.replace(/\//g, "-")}.pdf`
  doc.save(nombreArchivo)

  // alert("PDF generado exitosamente")
}

// ============================================
// INICIALIZACIÓN
// ============================================

window.addEventListener("DOMContentLoaded", () => {
  agregarLote()
})

