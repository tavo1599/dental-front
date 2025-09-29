import { ToothStatus } from '@/types';

export const translateStatus = (status: ToothStatus) => {
  const translations: Record<string, string> = {
    [ToothStatus.HEALTHY]: 'Sano',
    [ToothStatus.CARIES]: 'Caries',
    [ToothStatus.FILLED]: 'Obturado',
    [ToothStatus.FILLED_DEFECTIVE]: 'Obturado Defectuoso',
    [ToothStatus.SEALANT]: 'Sellante',
    [ToothStatus.SEALANT_DEFECTIVE]: 'Sellante Defectuoso',
    [ToothStatus.FRACTURE]: 'Fractura',
    [ToothStatus.CROWN]: 'Corona',
    [ToothStatus.CROWN_DEFECTIVE]: 'Corona Defectuosa',
    [ToothStatus.TEMPORARY_CROWN]: 'Corona Temporal',
    [ToothStatus.ENDODONTICS]: 'Endodoncia',
    [ToothStatus.IMPLANT]: 'Implante',
    [ToothStatus.PONTIC]: 'Póntico',
    [ToothStatus.EXTRACTION_NEEDED]: 'Extracción Indicada',
    [ToothStatus.EXTRACTED]: 'Extraído / Ausente',
    [ToothStatus.SUPERNUMERARY]: 'Supernumerario',
    [ToothStatus.DISCHROMIA]: 'Discromía',
  };
  return translations[status] || status;
};

export const getStatusButtonClass = (status: ToothStatus) => {
  switch (status) {
    case ToothStatus.HEALTHY: return 'bg-white text-black border';
    case ToothStatus.CARIES: return 'bg-red-500 text-white';
    case ToothStatus.FILLED: return 'bg-blue-500 text-white';
    case ToothStatus.SEALANT: return 'bg-yellow-sealant text-black';
    case ToothStatus.FRACTURE: return 'bg-orange-fracture text-white';
    case ToothStatus.CROWN: return 'bg-primary text-white';
    case ToothStatus.TEMPORARY_CROWN: return 'bg-pink-temp text-white';
    case ToothStatus.ENDODONTICS: return 'bg-purple-endo text-white';
    case ToothStatus.IMPLANT: return 'bg-gray-implant text-white';
    case ToothStatus.PONTIC: return 'bg-gray-400 text-white';
    case ToothStatus.EXTRACTION_NEEDED: return 'bg-red-800 text-white';
    case ToothStatus.EXTRACTED: return 'bg-black text-white';
    case ToothStatus.DISCHROMIA: return 'bg-brown-dischromia text-white';
    case ToothStatus.SUPERNUMERARY: return 'bg-teal-super text-white';
    case ToothStatus.FILLED_DEFECTIVE: return 'bg-purple-defective text-white';
    case ToothStatus.SEALANT_DEFECTIVE: return 'bg-teal-defective text-white';
    default: return 'bg-gray-200 text-black';
  }
};