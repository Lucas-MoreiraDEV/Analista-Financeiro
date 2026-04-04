import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export async function exportarRelatorioPDF(elementId: string, nomeArquivo: string) {
  const elemento = document.getElementById(elementId)
  if (!elemento) return

  const canvas = await html2canvas(elemento, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
  })

  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pdfWidth = pdf.internal.pageSize.getWidth()
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width

  // Se o conteúdo for maior que uma página, divide em páginas
  const alturaA4 = pdf.internal.pageSize.getHeight()

  if (pdfHeight <= alturaA4) {
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
  } else {
    let posY = 0
    while (posY < pdfHeight) {
      pdf.addImage(imgData, 'PNG', 0, -posY, pdfWidth, pdfHeight)
      posY += alturaA4
      if (posY < pdfHeight) pdf.addPage()
    }
  }

  pdf.save(nomeArquivo)
}