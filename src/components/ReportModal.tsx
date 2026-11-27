import { jsPDF } from 'jspdf';
import { X, Download, FileText } from 'lucide-react';
import type { Empresa, BlockScore } from '@/lib/scoring';
import { CERTIFICATE_THRESHOLD } from '@/lib/scoring';
import { BLOCKS, ACTION_PLANS, STRUCTURED_ACTION_PLANS } from '@/lib/questions';
import { Logo } from './Logo';

interface ReportModalProps {
  empresa: Empresa;
  notaGlobal: number;
  blockScores: BlockScore[];
  onClose: () => void;
}

export function ReportModal({ empresa, notaGlobal, blockScores, onClose }: ReportModalProps) {
  const dateStr = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  const isCertified = notaGlobal >= CERTIFICATE_THRESHOLD;
  const alertBlocks = blockScores.filter((s) => s.alertaAtencion);
  const weakestBlock = blockScores.length > 0
    ? blockScores.reduce((min, s) => (s.nota < min.nota ? s : min), blockScores[0])
    : null;

  const priorityBlocks = [
    ...alertBlocks,
    ...(weakestBlock && !alertBlocks.find((s) => s.bloque === weakestBlock.bloque) ? [weakestBlock] : []),
  ].sort((a, b) => a.nota - b.nota);

  const handleDownload = async () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = 210;
    const pageH = 297;
    const margin = 15;
    let y = 20;

    const ensureSpace = (h: number) => {
      if (y + h > pageH - 15) { doc.addPage(); y = 20; }
    };
    const addText = (text: string, size: number, style: 'normal' | 'bold' = 'normal', color: [number, number, number] = [30, 41, 59]) => {
      doc.setFontSize(size);
      doc.setFont('helvetica', style);
      doc.setTextColor(...color);
      const lines = doc.splitTextToSize(text, pageW - margin * 2);
      for (const line of lines) {
        ensureSpace(5);
        doc.text(line, margin, y);
        y += size * 0.45;
      }
    };

    // Header bar
    doc.setFillColor(32, 80, 114);
    doc.rect(0, 0, pageW, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('KULTUREMETRIX · INFORME DE AUDITORÍA DE BIENESTAR CORPORATIVO', pageW / 2, 8, { align: 'center' });

    y = 22;
    addText(empresa.nombre, 18, 'bold', [32, 80, 114]);
    addText(`Informe de resultados — ${dateStr}`, 10, 'normal', [100, 116, 139]);
    y += 3;

    // Separator
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageW - margin, y);
    y += 8;

    // Nota global
    addText('NOTA GLOBAL', 11, 'bold', [100, 116, 139]);
    const notaColor: [number, number, number] = isCertified ? [5, 150, 105] : notaGlobal >= 65 ? [245, 158, 11] : [220, 38, 38];
    doc.setFontSize(36);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...notaColor);
    doc.text(`${notaGlobal.toFixed(1)} / 100`, margin, y + 10);
    y += 16;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    const estadoLabel = isCertified
      ? 'Insignia Kulturemetrix (uso privado, no oficial) obtenida'
      : notaGlobal > 0
        ? 'No se ha alcanzado el umbral mínimo de 70 puntos para obtener la insignia'
        : 'Auditoría en curso';
    doc.text(estadoLabel, margin, y);
    y += 8;

    // Separator
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y, pageW - margin, y);
    y += 8;

    // Block scores
    addText('DESGLOSE DE PUNTUACIÓN POR BLOQUES', 12, 'bold', [32, 80, 114]);
    y += 4;

    for (const b of BLOCKS) {
      const score = blockScores.find((s) => s.bloque === b.id);
      const nota = score ? score.nota : 0;
      const promedio = score ? score.promedio : 0;
      const color: [number, number, number] = nota >= CERTIFICATE_THRESHOLD ? [5, 150, 105] : nota >= 65 ? [245, 158, 11] : [220, 38, 38];

      ensureSpace(10);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text(`${b.id}. ${b.title}`, margin, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...color);
      doc.text(`${nota.toFixed(1)} / 100`, pageW - margin - 5, y, { align: 'right' });
      y += 5;

      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      const detail = score
        ? `Promedio Likert: ${promedio.toFixed(2)} · ${score.contador} respuestas${score.alertaAtencion ? ` · ATENCIÓN: ${score.alertaPct}% en nivel crítico` : ''}`
        : 'Sin datos';
      doc.text(detail, margin, y);
      y += 6;
    }

    y += 4;
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y, pageW - margin, y);
    y += 8;

    // Action plans
    addText('PLANES DE ACCIÓN ESTRATÉGICA PARA RRHH', 12, 'bold', [32, 80, 114]);
    y += 4;

    if (priorityBlocks.length === 0) {
      addText('No se han detectado bloques prioritarios que requieran un plan de acción específico.', 9, 'normal', [100, 116, 139]);
    }

    for (const block of priorityBlocks) {
      const plan = STRUCTURED_ACTION_PLANS[block.bloque];
      const meta = BLOCKS.find((b) => b.id === block.bloque);
      if (!plan || !meta) continue;

      ensureSpace(15);
      y += 3;
      addText(`${meta.title} — ${block.nota.toFixed(1)}/100${block.alertaAtencion ? ' (ATENCIÓN)' : ''}`, 11, 'bold', [234, 88, 12]);
      y += 2;

      addText('Diagnóstico e Impacto Organizacional', 9, 'bold', [32, 80, 114]);
      addText(plan.diagnostico, 8, 'normal', [71, 85, 105]);
      y += 2;

      for (const obj of plan.objetivos) {
        addText(`${obj.horizon}:`, 9, 'bold', [5, 150, 105]);
        for (const meta of obj.metas) {
          addText(`  • ${meta}`, 8, 'normal', [71, 85, 105]);
        }
        y += 1;
      }

      addText('Iniciativas y Acciones Tácticas', 9, 'bold', [32, 80, 114]);
      plan.iniciativas.forEach((ini, i) => addText(`${i + 1}. ${ini}`, 8, 'normal', [71, 85, 105]));
      y += 2;

      addText('KPIs de Seguimiento', 9, 'bold', [32, 80, 114]);
      plan.kpis.forEach((k) => addText(`  • ${k}`, 8, 'normal', [71, 85, 105]));
      y += 4;

      // Quick summary
      addText('Resumen rápido de acciones:', 8, 'bold', [100, 116, 139]);
      ACTION_PLANS[block.bloque].forEach((s) => addText(`  • ${s}`, 8, 'normal', [100, 116, 139]));
      y += 4;

      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      ensureSpace(5);
      doc.line(margin, y, pageW - margin, y);
      y += 6;
    }

    // Footer
    ensureSpace(15);
    y += 4;
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageW - margin, y);
    y += 6;
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`Documento generado automáticamente por KULTUREMETRIX · ${dateStr}`, pageW / 2, y, { align: 'center' });
    y += 4;
    doc.text('Este informe contiene datos agregados y anónimos. No incluye respuestas individuales.', pageW / 2, y, { align: 'center' });

    doc.save(`informe-auditoria-${empresa.nombre.replace(/\s+/g, '-').toLowerCase()}.pdf`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <FileText className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Informe y Plan de Acción</h2>
              <p className="text-xs text-slate-500">Resultados detallados de la auditoría de bienestar corporativo</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Summary */}
        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Empresa</p>
              <p className="mt-1 text-lg font-bold text-slate-900">{empresa.nombre}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Nota Global</p>
              <p className={`mt-1 text-3xl font-bold ${isCertified ? 'text-emerald-600' : notaGlobal >= 65 ? 'text-amber-600' : 'text-red-600'}`}>
                {notaGlobal.toFixed(1)} <span className="text-lg text-slate-400">/ 100</span>
              </p>
            </div>
          </div>
        </div>

        {/* Block scores preview */}
        <div className="mt-4 space-y-2">
          {BLOCKS.map((b) => {
            const score = blockScores.find((s) => s.bloque === b.id);
            const nota = score ? score.nota : 0;
            return (
              <div key={b.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-2.5">
                <span className="text-sm font-medium text-slate-700">{b.id}. {b.title}</span>
                <div className="flex items-center gap-3">
                  {score?.alertaAtencion && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">Atención {score.alertaPct}%</span>
                  )}
                  <span className={`text-sm font-bold ${nota >= CERTIFICATE_THRESHOLD ? 'text-emerald-600' : nota >= 65 ? 'text-amber-600' : 'text-red-600'}`}>
                    {nota.toFixed(1)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={handleDownload}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#205072] to-[#43B59C] px-6 py-4 font-semibold text-white shadow-lg shadow-[#205072]/20 transition hover:brightness-110"
        >
          <Download className="h-5 w-5" />
          Descargar Informe y Plan de Acción (PDF)
        </button>
      </div>
    </div>
  );
}
