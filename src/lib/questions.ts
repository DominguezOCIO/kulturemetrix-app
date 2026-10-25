export interface Question {
  id: string;
  bloque: 1 | 2 | 3 | 4;
  text: string;
}

export interface Bank5Option {
  texto: string;
  puntos: number;
  accion?: 'allow' | 'trigger_veto_alert';
}

export interface Bank5Question {
  id: string;
  pregunta: string;
  opciones: Bank5Option[];
}

export interface ClosingQuestion {
  id: string;
  pregunta: string;
  opciones: Bank5Option[];
}

export const BLOCKS: { id: 1 | 2 | 3 | 4 | 5; title: string; short: string; icon: string }[] = [
  { id: 1, title: 'Gestión del Tiempo y Desconexión', short: 'Tiempo', icon: 'Clock' },
  { id: 2, title: 'Carga de Trabajo y Salud Mental', short: 'Carga', icon: 'Brain' },
  { id: 3, title: 'Clima Laboral y Liderazgo', short: 'Clima', icon: 'Users' },
  { id: 4, title: 'Reconocimiento y Crecimiento', short: 'Reconocim.', icon: 'TrendingUp' },
  { id: 5, title: 'Auditoría Cualitativa Cultural', short: 'Cultura', icon: 'ShieldCheck' },
];

export const QUESTIONS: Question[] = [
  // Bloque 1: Gestión del Tiempo y Desconexión
  { id: 'P1.1', bloque: 1, text: 'Mi horario de trabajo habitual es predecible y me permite conciliar correctamente mi vida personal y laboral.' },
  { id: 'P1.2', bloque: 1, text: 'Cuando se me requiere realizar horas extraordinarias, estas quedan debidamente registradas y son pagadas o compensadas.' },
  { id: 'P1.3', bloque: 1, text: 'Rara vez necesito hacer horas extraordinarias para cumplir con mis responsabilidades diarias.' },
  { id: 'P1.4', bloque: 1, text: 'Fuera de mi turno o jornada laboral, se respeta mi derecho a la desconexión (no recibo llamadas, correos ni mensajes de trabajo).' },
  { id: 'P1.5', bloque: 1, text: 'Al iniciar mi jornada laboral, me siento con energía y motivación para afrontar el día, no arrastro cansancio emocional del trabajo.' },
  // Bloque 2: Carga de Trabajo y Salud Mental
  { id: 'P2.1', bloque: 2, text: 'El volumen de tareas asignado es adecuado para realizarse dentro de mi jornada laboral sin vivir en prisa constante.' },
  { id: 'P2.2', bloque: 2, text: 'Los plazos de entrega y objetivos fijados por mis responsables son realistas y alcanzables.' },
  { id: 'P2.3', bloque: 2, text: 'Siento que los recursos y herramientas que me proporciona la empresa son suficientes para hacer mi trabajo sin frustraciones.' },
  { id: 'P2.4', bloque: 2, text: 'Al terminar mi jornada laboral, NO me siento agotado física y mentalmente de forma extrema.' },
  { id: 'P2.5', bloque: 2, text: 'En las últimas semanas, he podido mantener la concentración y el rendimiento sin sentirme mentalmente bloqueado o abrumado por la presión.' },
  // Bloque 3: Clima Laboral y Liderazgo
  { id: 'P3.1', bloque: 3, text: 'En mi equipo existe un ambiente de respeto, colaboración y apoyo mutuo.' },
  { id: 'P3.2', bloque: 3, text: 'Mi supervisor directo me apoya, escucha mis preocupaciones y se interesa por mi bienestar laboral.' },
  { id: 'P3.3', bloque: 3, text: 'Siento que puedo expresar mis opiniones, errores o desacuerdos de forma segura, sin miedo a represalias.' },
  { id: 'P3.4', bloque: 3, text: 'La empresa comunica de manera transparente los cambios u objetivos importantes que afectan a mi trabajo.' },
  { id: 'P3.5', bloque: 3, text: 'Cuando tengo un problema personal o de salud, siento que cuento con el respaldo y la comprensión de mi equipo y responsables.' },
  // Bloque 4: Reconocimiento y Crecimiento
  { id: 'P4.1', bloque: 4, text: 'Siento que mi esfuerzo y los logros que aporto a la empresa son reconocidos y valorados de manera justa.' },
  { id: 'P4.2', bloque: 4, text: 'Considero que mi retribución (salario y beneficios) es justa y acorde a mis responsabilidades.' },
  { id: 'P4.3', bloque: 4, text: 'Tengo claras cuáles son mis funciones y veo oportunidades de crecimiento o estabilidad dentro de esta empresa.' },
  { id: 'P4.4', bloque: 4, text: 'La empresa invierte en mi desarrollo profesional ofreciéndome formación, mentoría o recursos para mejorar mis habilidades.' },
  { id: 'P4.5', bloque: 4, text: 'Siento que mi trabajo tiene un propósito y contribuye a algo significativo, lo que me mantiene ilusionado y motivado.' },
];

export const LIKERT_OPTIONS = [
  { value: 1, label: 'Totalmente en desacuerdo' },
  { value: 2, label: 'En desacuerdo' },
  { value: 3, label: 'Neutral' },
  { value: 4, label: 'De acuerdo' },
  { value: 5, label: 'Totalmente de acuerdo' },
];

export const BLOCK5_BANK: Bank5Question[] = [
  {
    id: 'Q1',
    pregunta: 'Si cometes un error involuntario pero grave en tu trabajo, la reacción real de tu supervisor directo es...',
    opciones: [
      { texto: 'Analizar el fallo en equipo para buscar una solución y aprender de ello.', puntos: 5 },
      { texto: 'Solucionarlo con tensión, pero sin represalias personales graves.', puntos: 3 },
      { texto: 'Buscar culpables, aplicar broncas públicas o generar miedo al despido.', puntos: 1 },
    ],
  },
  {
    id: 'Q2',
    pregunta: 'Pensando en las últimas 2 semanas, ¿cuántas veces has tenido que responder comunicaciones de trabajo (llamadas, Slack, emails) fuera de tu jornada laboral?',
    opciones: [
      { texto: 'Ninguna vez o máximo 1 vez por una emergencia global real.', puntos: 5 },
      { texto: 'Entre 2 y 4 veces (es algo ocasional pero ocurre).', puntos: 3 },
      { texto: '5 o más veces (es la dinámica habitual de la empresa).', puntos: 1 },
    ],
  },
  {
    id: 'Q3',
    pregunta: 'El último ascenso, aumento o reconocimiento importante en tu departamento se otorgó a...',
    opciones: [
      { texto: 'La persona con los mejores resultados y desempeño demostrable.', puntos: 5 },
      { texto: 'Un criterio mixto entre antigüedad y desempeño.', puntos: 3 },
      { texto: 'Cuestiones de afinidad personal o favoritismo con la dirección.', puntos: 1 },
    ],
  },
  {
    id: 'Q4',
    pregunta: 'Si tu mejor amigo estuviera buscando trabajo hoy mismo en tu sector, ¿le recomendarías entrar a tu puesto actual?',
    opciones: [
      { texto: 'Sí, sin dudarlo. Es un entorno excelente.', puntos: 5 },
      { texto: 'Sí, pero con advertencias sobre la carga de trabajo o la presión.', puntos: 3 },
      { texto: 'No, le diría que busque otra opción para evitar el desgaste.', puntos: 1 },
    ],
  },
  {
    id: 'Q5',
    pregunta: 'Cuando el volumen de trabajo es excesivo y te sientes al límite del estrés (burnout), la respuesta habitual de la empresa es...',
    opciones: [
      { texto: 'Redistribuir las tareas de forma efectiva y priorizar el bienestar del equipo.', puntos: 5 },
      { texto: 'Escuchar el problema, pero ofrecer soluciones lentas que no alivian la presión inmediata.', puntos: 3 },
      { texto: 'Ignorar la situación o exigir que se cumplan los objetivos sin importar el coste personal.', puntos: 1 },
    ],
  },
  {
    id: 'Q6',
    pregunta: 'Si tienes una urgencia médica o familiar imprevista en horario de trabajo, la cultura real de la empresa te permite...',
    opciones: [
      { texto: 'Atenderla de inmediato con total confianza y apoyo de tu equipo, recuperando el tiempo después sin presión.', puntos: 5 },
      { texto: 'Avisar y marcharte, pero sintiendo la tensión o sabiendo que se mirará con lupa tu ausencia.', puntos: 3 },
      { texto: 'Poner problemas, exigir justificaciones excesivas o penalizar indirectamente tu compromiso.', puntos: 1 },
    ],
  },
  {
    id: 'Q7',
    pregunta: 'A la hora de realizar tus tareas diarias, el estilo de liderazgo de tus superiores se basa en...',
    opciones: [
      { texto: 'Confianza total en tu criterio, evaluándote por objetivos conseguidos y dándote autonomía.', puntos: 5 },
      { texto: 'Un control intermedio (revisiones constantes pero tolerables).', puntos: 3 },
      { texto: 'Microgestión extrema (controlar cada minuto, vigilar cuándo te conectas o pedir reportes excesivos).', puntos: 1 },
    ],
  },
  {
    id: 'Q8',
    pregunta: 'En los comités, reuniones o interacciones diarias, ¿cómo se tratan las opiniones diferentes o las discrepancias de fondo?',
    opciones: [
      { texto: 'Se escuchan con respeto constructivo, aportando diversidad de puntos de vista.', puntos: 5 },
      { texto: 'Se toleran en público, pero en privado se prefiere que no se cuestione la línea oficial.', puntos: 3 },
      { texto: 'Se silencian, se ignoran o se penaliza al empleado que opina de manera diferente.', puntos: 1 },
    ],
  },
  {
    id: 'Q9',
    pregunta: 'Cuando ocurren cambios importantes en la empresa (pérdida de clientes, cambios de rumbo, reestructuraciones), la dirección...',
    opciones: [
      { texto: 'Comunica la situación de forma clara, honesta y transparente a toda la plantilla.', puntos: 5 },
      { texto: 'Informa tarde o solo cuando los rumores ya se han extendido por los pasillos.', puntos: 3 },
      { texto: 'Oculta la información deliberadamente, generando incertidumbre y desconfianza.', puntos: 1 },
    ],
  },
  {
    id: 'Q10',
    pregunta: 'Para cumplir con tus objetivos y plazos de entrega, las herramientas, softwares y recursos que te da la empresa son...',
    opciones: [
      { texto: 'Excelentes y actualizados; la empresa invierte activamente para hacernos el trabajo más fácil.', puntos: 5 },
      { texto: 'Suficientes para ir tirando, aunque a menudo provocan retrasos por falta de actualización.', puntos: 3 },
      { texto: 'Totalmente deficientes o nulos, obligándonos a hacer horas extra para compensar la falta de medios.', puntos: 1 },
    ],
  },
];

export const CLOSING_QUESTION: ClosingQuestion = {
  id: 'Q_FINAL',
  pregunta: 'Por último, ¿te has sentido libre al realizar este test, contestando de la manera más honesta sin ningún tipo de recomendación o coacción por parte de tus superiores? Recuerda que KultureMetrix procesa tus respuestas de forma 100% anónima. Estamos aquí para analizar tu propio bienestar laboral real y ayudar a que tu empresa pueda corregir errores o mejorar a futuro, creando un gran ambiente de trabajo para ti.',
  opciones: [
    { texto: 'Sí, he respondido con total libertad, tranquilidad y honestidad.', puntos: 5, accion: 'allow' },
    { texto: 'No del todo, he sentido cierta presión, supervisión o directrices implícitas sobre qué debía responder.', puntos: 1, accion: 'trigger_veto_alert' },
  ],
};

export const BLOCK5_QUESTION_COUNT = 5;

export function pickRandomBlock5Questions(count: number = BLOCK5_QUESTION_COUNT): Bank5Question[] {
  const shuffled = [...BLOCK5_BANK].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export const ACTION_PLANS: Record<number, string[]> = {
  1: [
    'Implementar una política de desconexión digital verificable: desactivar envíos de correo/mensajería fuera de jornada y establecer un protocolo de guardias rotativo documentado.',
    'Auditar y publicar mensualmente el registro de horas extraordinarias; garantizar compensación equivalente y revisar la carga que las genera.',
    'Introducir controles de fatiga emocional: encuestas de pulso semanales anónimas y reuniones de equipo centradas en bienestar, no solo en tareas.',
  ],
  2: [
    'Realizar una revisión de cargas de trabajo por puesto con el mando intermedio y reequilibrar prioridades; introducir planificación semanal realista basada en capacidad.',
    'Facilitar acceso a un programa de apoyo psicológico (EAP) y sesiones de prevención de fatiga mental, con métricas de uso anónimas.',
  ],
  3: [
    'Diseñar un programa de formación en liderazgo cercano y comunicación segura para mandos intermedios, con evaluación 360º anónima.',
    'Crear canales de comunicación interna transparente (reuniones trimestrales, tablón de decisiones) y un buzón de sugerencias con respuesta garantizada.',
    'Establecer un protocolo de acompañamiento ante situaciones personales o de salud: permisos flexibles, seguimiento individualizado por RRHH y cultura de respaldo explícito.',
  ],
  4: [
    'Definir un esquema de retribución variable y reconocimientos públicos vinculado a objetivos transparentes; revisar equidad salarial interna.',
    'Establecer itinerarios de carrera individuales con revisión semestral de funciones, formación y oportunidades de promoción interna documentadas.',
    'Diseñar un plan de desarrollo profesional con presupuesto de formación anual por empleado y sesiones de mentoría interna o externa.',
    'Comunicar la misión y el impacto del trabajo de cada puesto en los resultados de la empresa; fomentar reuniones periódicas donde se comparta el propósito y la contribución de cada equipo.',
  ],
  5: [
    'Investigar de forma confidencial las áreas donde se detecta discrepancia entre la percepción cuantitativa y la cualitativa; realizar entrevistas anónimas con trabajadores.',
    'Implementar un canal de denuncia interna seguro y anónimo, con compromiso de respuesta y seguimiento documentado.',
    'Revisar las prácticas de liderazgo que generan miedo o coacción; formar a mandos intermedios en gestión de errores y comunicación psicológicamente segura.',
  ],
};
