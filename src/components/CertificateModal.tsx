import { useRef } from 'react';
import { jsPDF } from 'jspdf';
import { X, Download, Check, Award } from 'lucide-react';
import type { Empresa } from '@/lib/scoring';
import { CERTIFICATE_THRESHOLD } from '@/lib/scoring';
import { Logo } from './Logo';

async function loadLogoDataUrl(): Promise<string | null> {
  const svgMarkup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 50" width="960" height="150"><text x="0" y="38" font-family="system-ui, -apple-system, sans-serif" font-size="34" font-weight="800" letter-spacing="0.5"><tspan fill="#205072">KULTURE</tspan><tspan fill="#43B59C">METRIX</tspan></text></svg>`;

  try {
    const svgBlob = new Blob([svgMarkup], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to load SVG'));
      img.src = url;
    });
    const canvas = document.createElement('canvas');
    canvas.width = 960;
    canvas.height = 150;
    const context = canvas.getContext('2d');
    if (!context) return null;
    context.drawImage(img, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(url);
    return canvas.toDataURL('image/png');
  } catch {
    return null;
  }
}

interface CertificateModalProps {
  empresa: Empresa;
  notaGlobal: number;
  onClose: () => void;
}

export function CertificateModal({ empresa, notaGlobal, onClose }: CertificateModalProps) {
  const certRef = useRef<HTMLDivElement>(null);
  const dateStr = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  const certId = `KM-${empresa.id.slice(0, 8).toUpperCase()}-${new Date().getFullYear()}`;

  const handleDownload = async () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    // Fondo
    doc.setFillColor(248, 250, 252);
    doc.rect(0, 0, 297, 210, 'F');

    // Borde decorativo
    doc.setDrawColor(234, 88, 12);
    doc.setLineWidth(2);
    doc.rect(10, 10, 277, 190);
    doc.setLineWidth(0.5);
    doc.setDrawColor(203, 213, 225);
    doc.rect(14, 14, 269, 182);

    // Logo / título
    const logoDataUrl = await loadLogoDataUrl();
    if (logoDataUrl) {
      doc.addImage(logoDataUrl, 'PNG', 103, 18, 89, 30);
    }
    doc.setTextColor(38, 89, 126);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('KULTUREMETRIX · AUDITORÍA EXTERNA DEL BIENESTAR CORPORATIVO', 148.5, 52, { align: 'center' });

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(32);
    doc.text('Certificado de Bienestar Laboral', 148.5, 65, { align: 'center' });

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Se certifica que la empresa', 148.5, 75, { align: 'center' });

    // Nombre empresa
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(empresa.nombre, 148.5, 90, { align: 'center' });

    // Nota
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('ha obtenido una puntuación global de bienestar laboral de', 148.5, 108, { align: 'center' });

    doc.setFontSize(48);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(5, 150, 105);
    doc.text(`${notaGlobal.toFixed(1)} / 100`, 148.5, 128, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`superando el umbral de certificación (>= ${CERTIFICATE_THRESHOLD} puntos) en prevención del burnout`, 148.5, 140, { align: 'center' });

    // Fecha y ID
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text(`Fecha de emisión: ${dateStr}`, 60, 175);
    doc.text(`ID del certificado: ${certId}`, 180, 175);

    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text('Este certificado es válido durante el año de emisión y refleja datos agregados anónimos conforme al RGPD.', 148.5, 185, { align: 'center' });

    doc.save(`certificado-bienestar-${empresa.nombre.replace(/\s+/g, '-').toLowerCase()}.pdf`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Certificado de Bienestar Corporativo KULTUREMETRIX</h2>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Certificado visual */}
        <div ref={certRef} className="mt-4 rounded-xl border-2 border-orange-500 bg-gradient-to-br from-slate-50 to-slate-100 p-10">
          <div className="border border-slate-300 p-8">
            <div className="flex flex-col items-center text-center">
              <Logo className="h-20 w-72 text-slate-900" />

              <h3 className="mt-6 text-3xl font-bold text-slate-900">Certificado de Bienestar Laboral</h3>

              <p className="mt-8 text-sm text-slate-500">Se certifica que la empresa</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{empresa.nombre}</p>

              <p className="mt-6 text-sm text-slate-500">ha obtenido una puntuación global de bienestar laboral de</p>
              <p className="mt-2 text-5xl font-bold text-emerald-600">{notaGlobal.toFixed(1)} <span className="text-2xl text-slate-400">/ 100</span></p>
              <p className="mt-3 text-sm text-slate-500">superando el umbral de certificación (≥ {CERTIFICATE_THRESHOLD} puntos) en prevención del burnout</p>

              <div className="mt-8 flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-emerald-700">
                <Award className="h-4 w-4" />
                <span className="text-sm font-semibold">Empresa certificada</span>
                <Check className="h-4 w-4" />
              </div>

              <div className="mt-10 flex w-full justify-between text-xs text-slate-500">
                <div className="text-left">
                  <p className="font-medium">Fecha de emisión</p>
                  <p className="mt-1 text-slate-700">{dateStr}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">ID del certificado</p>
                  <p className="mt-1 text-slate-700">{certId}</p>
                </div>
              </div>

              <p className="mt-6 text-xs text-slate-400">
                Este certificado es válido durante el año de emisión y refleja datos agregados anónimos conforme al RGPD.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleDownload}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4 font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:from-emerald-500 hover:to-emerald-600"
        >
          <Download className="h-5 w-5" />
          Descargar Certificado Oficial de Bienestar Corporativo KULTUREMETRIX (PDF)
        </button>
      </div>
    </div>
  );
}
