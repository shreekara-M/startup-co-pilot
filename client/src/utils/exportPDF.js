import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// ─── PDF Export Utility ──────────────────────────────────
//
// Captures a DOM element as a high-quality image using html2canvas,
// then splits it across A4 pages using jsPDF.
//
// Usage: await exportPDF(domElement, "filename")

const A4_WIDTH_PT = 595.28;
const A4_HEIGHT_PT = 841.89;
const SCALE = 2; // 2x for retina-quality rendering

export async function exportPDF(element, filename = "startup-plan") {
  // 1. Render DOM element to canvas at 2x scale
  const canvas = await html2canvas(element, {
    scale: SCALE,
    useCORS: true,
    logging: false,
    backgroundColor: "#ffffff",
  });

  // 2. Calculate dimensions to fit A4 width
  const imgWidth = A4_WIDTH_PT;
  const imgHeight = (canvas.height * A4_WIDTH_PT) / canvas.width;

  // 3. Create PDF (portrait A4)
  const pdf = new jsPDF("p", "pt", "a4");
  const imgData = canvas.toDataURL("image/png");

  // 4. Multi-page: if content is taller than one page, split across pages
  let yOffset = 0;

  while (yOffset < imgHeight) {
    if (yOffset > 0) {
      pdf.addPage();
    }
    pdf.addImage(imgData, "PNG", 0, -yOffset, imgWidth, imgHeight);
    yOffset += A4_HEIGHT_PT;
  }

  // 5. Download
  pdf.save(`${filename}.pdf`);
}
