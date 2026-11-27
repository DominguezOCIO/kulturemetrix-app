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

export interface ActionPlanSection {
  titulo: string;
  items: string[];
}

export interface StructuredActionPlan {
  diagnostico: string;
  objetivos: { horizon: string; metas: string[] }[];
  iniciativas: string[];
  kpis: string[];
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

export const STRUCTURED_ACTION_PLANS: Record<number, StructuredActionPlan> = {
  1: {
    diagnostico:
      'La detección de un porcentaje significativo de respuestas en el nivel mínimo del bloque "Gestión del Tiempo y Desconexión" revela una disfunción estructural en la gestión de la jornada laboral. Los empleados perciben que su tiempo no se respeta: las horas extraordinarias son habituales, la desconexión digital es inexistente y el cansancio emocional se arrastra de un día para otro. El impacto organizacional es directo: aumenta el riesgo de burnout, disminuye la productividad cognitiva en tareas complejas, se eleva la tasa de rotación involuntaria y se erosiona la confianza en el liderazgo. A medio plazo, esta dinámica genera costes ocultos por absentismo, bajas laborales y pérdida de talento crítico, además de exponer a la empresa a riesgos de cumplimiento normativo en materia de tiempo de trabajo y desconexión digital.',
    objetivos: [
      {
        horizon: '30 días',
        metas: [
          'Realizar una auditoría completa de registros horarios y horas extraordinarias de los últimos 3 meses en todos los departamentos.',
          'Establecer y comunicar formalmente una política de desconexión digital corporativa, con reglas claras sobre comunicación fuera de jornada.',
          'Identificar a los empleados o equipos con mayor acumulación de horas extra y convocar entrevistas individuales confidenciales con RRHH.',
        ],
      },
      {
        horizon: '60 días',
        metas: [
          'Reducir en al menos un 30% el volumen de horas extraordinarias respecto al baseline medido en los últimos 3 meses.',
          'Implantar un sistema de registro horario verificable y accesible para el empleado, con alertas automáticas al superar el 10% de la jornada teórica.',
          'Designar a un responsable de bienestar o comité de desconexión que supervise semanalmente el cumplimiento de la política.',
        ],
      },
      {
        horizon: '90 días',
        metas: [
          'Conseguir que el 90% de los empleados reporten en una encuesta de pulso que su derecho a la desconexión se respeta "casi siempre" o "siempre".',
          'Eliminar el uso de mensajería laboral fuera de jornada en al menos el 80% de los equipos, salvo emergencias documentadas.',
          'Reducir a menos del 10% el porcentaje de empleados que reportan llegar al inicio de jornada sin energía o arrastrando cansancio.',
        ],
      },
    ],
    iniciativas: [
      'Configurar servidores de correo y mensajería corporativa para retrasar o bloquear envíos automáticos fuera del horario laboral (ej. 19:00–08:00), con opción de excepción por proyecto documentado.',
      'Establecer un protocolo de guardias rotativo formalizado: solo el personal designado como "guardia" recibirá comunicaciones urgentes fuera de jornada, con compensación específica y rotación equitativa.',
      'Implantar reuniones semanales de equipo de 15 minutos centradas exclusivamente en bienestar y carga percibida —no en tareas—, utilizando una escala simple de 1-5 para registrar el estado anímico y ajustar prioridades.',
      'Diseñar talleres prácticos de 90 minutos sobre gestión del tiempo y técnicas de desconexión mental, impartidos por un especialista externo, con un mínimo de 2 sesiones por departamento en el primer trimestre.',
      'Crear una guía visual interna ("Manifesto de la Desconexión") distribuida en áreas comunes y onboarding, estableciendo explícitamente que no responder fuera de jornada no es una falta, sino una práctica esperada y valorada.',
      'Establecer un sistema de compensación flexible para horas extra: tiempo libre recuperado en los 7 días siguientes como opción prioritaria, con pago solo cuando la recuperación sea materialmente imposible.',
      'Implementar una encuesta de pulso sembral anónima de 3 preguntas (energía al iniciar jornada, percepción de carga, respeto de desconexión) con dashboard en tiempo real para RRHH y líderes.',
    ],
    kpis: [
      'Horas extraordinarias mensuales por empleado (objetivo: < 5% de la jornada teórica).',
      'Porcentaje de empleados que reportan respetar su desconexión digital "siempre o casi siempre" (objetivo: ≥ 90%).',
      'Índice de fatiga emocional al inicio de jornada (encuesta de pulso semanal, escala 1-5; objetivo: media ≥ 3.5).',
      'Tasa de uso del correo/mensajería fuera de jornada (telemetría de servidor; objetivo: reducción del 70% en 90 días).',
      'Días de baja por causas relacionadas con estrés o burnout por cada 100 empleados (objetivo: tendencia descendente trimestral).',
      'Tasa de rotación voluntaria en equipos con históricos de exceso horario (objetivo: reducción del 25% en 6 meses).',
    ],
  },
  2: {
    diagnostico:
      'La concentración de respuestas en el nivel mínimo del bloque "Carga de Trabajo y Salud Mental" indica que un sector significativo de la plantilla vive en un estado de sobrecarga crónica. El volumen de tareas excede la capacidad real de la jornada, los plazos se perciben como sistemáticamente irreales, los recursos proporcionados son insuficientes y el agotamiento físico-mental al finalizar la jornada es la norma, no la excepción. Este patrón es el precursor más fiable del síndrome de burnout y tiene consecuencias medibles: deterioro de la calidad del trabajo, aumento de errores, reducción de la creatividad y la capacidad de toma de decisiones, y un incremento significativo del riesgo de bajas laborales prolongadas. A nivel cultural, transmite el mensaje de que la empresa prioriza la output bruto sobre la sostenibilidad humana, lo que degrada el compromiso organizacional y la retención de talento, especialmente en los perfiles más competentes, que tienen mayor movilidad en el mercado.',
    objetivos: [
      {
        horizon: '30 días',
        metas: [
          'Realizar un mapa de carga de trabajo por puesto y departamento, cuantificando horas estimadas vs. horas reales invertidas en las principales tareas.',
          'Convocar entrevistas estructuradas con cada responsable de departamento para revisar la asignación de prioridades y identificar tareas de bajo valor que puedan eliminarse o delegarse.',
          'Lanzar un programa de apoyo psicológico externo (EAP) confidencial y gratuito, comunicándolo activamente a toda la plantilla.',
        ],
      },
      {
        horizon: '60 días',
        metas: [
          'Reducir en al menos un 20% la proporción de empleados que reportan que su carga de trabajo no es gestionable dentro de la jornada.',
          'Implantar un sistema de planificación semanal basado en capacidad disponible (no en objetivos teóricos), con tope de asignación por persona al 85% de la jornada.',
          'Conseguir que al menos el 50% de los empleados con señales de agotamiento crónico accedan al programa EAP o a recursos de bienestar.',
        ],
      },
      {
        horizon: '90 días',
        metas: [
          'Lograr que el 85% de los empleados perciban los plazos como "realistas o alcanzables" en la encuesta de pulso trimestral.',
          'Reducir a menos del 15% el porcentaje de empleados que reportan agotamiento extremo al finalizar la jornada de forma habitual.',
          'Establecer un comité de salud mental y carga laboral con representación de RRHH, prevención de riesgos y mandos intermedios, con reuniones mensuales y plan de acción documentado.',
        ],
      },
    ],
    iniciativas: [
      'Implantar una metodología de planificación semanal estructurada: cada viernes, el líder y el empleado revisan conjuntamente las prioridades de la semana siguiente, asignando un máximo de 3 objetivos principales y reservando un 15% de la jornada como buffer para imprevistos.',
      'Conducir un ejercicio de "deshinchado de backlog" por departamento: identificar y eliminar formalmente tareas, reuniones y reportes de bajo valor que consumen tiempo sin generar impacto, con un objetivo de liberar al menos 2 horas semanales por empleado.',
      'Negociar con proveedores de software o herramientas un plan de actualización para eliminar las fricciones tecnológicas que generan rework; si la inversión no es viable a corto plazo, documentar el déficit y priorizarlo en el presupuesto del siguiente ciclo.',
      'Diseñar un protocolo de "escalada de sobrecarga": cualquier empleado que perciba que su carga excede la capacidad puede activar una revisión inmediata con su líder y RRHH, sin que esto se considere una señal de bajo rendimiento —al contrario, se reconoce como una práctica de gestión responsable.',
      'Organizar talleres mensuales de higiene mental y prevención del burnout (60 min, presenciales o virtuales), cubriendo técnicas de gestión del estrés, sleep hygiene, micro-descansos activos y reconocimiento de señales tempranas de agotamiento.',
      'Establecer "zonas de trabajo profundo" protegidas: bloques de 2-3 horas sin reuniones ni interrupciones, al menos 2 días por semana, para reducir el coste cognitivo del context-switching.',
      'Implementar un sistema de monitoreo de señales de burnout a través de la encuesta de pulso semanal, con alertas automáticas a RRHH cuando un departamento muestra un deterioro sostenido de 3 semanas consecutivas.',
    ],
    kpis: [
      'Porcentaje de empleados que reportan que su carga es gestionable dentro de la jornada (objetivo: ≥ 80%).',
      'Horas medias de trabajo efectivo vs. jornada teórica por empleado (objetivo: ratio < 1.10).',
      'Tasa de acceso al programa EAP (objetivo: ≥ 20% de la plantilla en el primer trimestre).',
      'Días de baja por causas psicológicas o fatiga por cada 100 empleados (objetivo: reducción del 30% en 6 meses).',
      'Índice de agotamiento al final de la jornada (encuesta de pulso; objetivo: media ≤ 2.5 en escala 1-5).',
      'Número de reuniones eliminadas o reducidas por departamento (objetivo: -20% en 90 días).',
    ],
  },
  3: {
    diagnostico:
      'La elevada proporción de respuestas en el nivel mínimo del bloque "Clima Laboral y Liderazgo" señala una crisis de confianza entre la plantilla y el liderazgo directo. Los empleados no perciben un ambiente de respeto y colaboración, no se sienten escuchados ni apoyados por sus supervisores, temen represalias al expresar opiniones o errores, y consideran que la comunicación de la empresa es opaca. Este es uno de los hallazgos más graves que puede arrojar una auditoría de bienestar, porque el clima laboral y la calidad del liderazgo son los predictores más potentes de compromiso, retención y desempeño. El impacto se manifiesta en silencio organizacional (los empleados dejan de aportar ideas o señalar problemas), en un aumento de conflictos interpersonales no resueltos, en la pérdida de talento hacia competidores con mejor cultura, y en la creación de subculturas tóxicas que se refuerzan a sí mismas. A largo plazo, la falta de seguridad psicológica erosiona la capacidad de innovación y adaptación de toda la organización.',
    objetivos: [
      {
        horizon: '30 días',
        metas: [
          'Realizar entrevistas de salida y confidenciales con empleados clave para mapear los focos concretos de conflicto o mala praxis de liderazgo.',
          'Comunicar un compromiso explícito de la dirección general con la mejora del clima laboral, reconociendo los resultados de la auditoría sin minimizarlos.',
          'Establecer un canal anónimo y seguro para reportar comportamientos de liderazgo inadecuados, con compromiso de respuesta en 48 horas.',
        ],
      },
      {
        horizon: '60 días',
        metas: [
          'Iniciar un programa de formación intensiva en liderazgo cercano y comunicación psicológicamente segura para el 100% de los mandos intermedios.',
          'Implantar evaluación 360º anónima para todos los directivos y mandos intermedios, con resultados individuales confidenciales y plan de mejora obligatorio.',
          'Crear un calendario de comunicación interna transparente: reuniones trimestrales de toda la empresa, y un tablón de decisiones que explique el "porqué" detrás de cada cambio relevante.',
        ],
      },
      {
        horizon: '90 días',
        metas: [
          'Conseguir que al menos el 75% de los empleados reporten sentir que pueden expresar opiniones o errores "sin miedo" en la encuesta de pulso.',
          'Reducir a menos del 10% el porcentaje de empleados que perciben que su supervisor no les apoya ni escucha.',
          'Establecer un protocolo de acompañamiento ante situaciones personales o de salud, con permisos flexibles formalizados y seguimiento individualizado por RRHH en el 100% de los casos.',
        ],
      },
    ],
    iniciativas: [
      'Diseñar un programa de formación en liderazgo de 4 módulos (comunicación activa, feedback constructivo, gestión de conflictos, seguridad psicológica), con sesiones quincenales de 2 horas y trabajo práctico entre sesiones; la finalización es obligatoria para mantener el rol de mando.',
      'Implantar evaluación 360º anónima con 4 dimensiones (escucha, apoyo, equidad, desarrollo), generando un informe individual confidencial para cada mando con fortalezas, áreas de mejora y un plan de desarrollo personalizado revisado con RRHH.',
      'Crear "reuniones town hall" trimestrales dirigidas por la dirección general, con formato de preguntas abiertas sin filtro, donde cualquier empleado puede plantear cualquier tema y recibe respuesta pública y directa.',
      'Establecer un buzón de sugerencias digital y anónimo con compromiso de respuesta documentada en 5 días hábiles; las sugerencias implementadas se comunican públicamente para reforzar la credibilidad del canal.',
      'Diseñar un protocolo de acompañamiento personal: cuando un empleado atraviesa una situación de salud, crisis familiar o duelo, RRHH contacta al mando directo para ajustar expectativas, flexibilizar permisos y garantizar que el empleado no sienta que su compromiso se cuestiona.',
      'Implantar "rondas de check-in" mensuales individuales de 20 minutos entre cada mando y sus colaboradores, con guion estructurado (cómo estás, qué necesitas, qué te frena, qué te motiva), separadas de las conversaciones de rendimiento.',
      'Crear un programa de "embajadores de cultura": empleados voluntarios de distintos departamentos que actúan como punto de contacto para canalizar inquietudes, proponer iniciativas de mejora del clima y participar en el comité de bienestar.',
    ],
    kpis: [
      'Índice de seguridad psicológica (encuesta de pulso; objetivo: media ≥ 4.0 en escala 1-5).',
      'Porcentaje de empleados que perciben que su supervisor les apoya y escucha (objetivo: ≥ 85%).',
      'Número de reports anónimos recibidos y tasa de resolución en 48 horas (objetivo: ≥ 90% resueltos en plazo).',
      'Diferencia entre la valoración 360º inicial y la de seguimiento a 90 días para cada mando (objetivo: mejora media ≥ 0.8 puntos).',
      'Tasa de retención de talento en equipos con históricos de clima bajo (objetivo: reducción de rotación del 30% en 6 meses).',
      'Asistencia y finalización del programa de formación en liderazgo (objetivo: 100% de mandos intermedios).',
    ],
  },
  4: {
    diagnostico:
      'La concentración de respuestas en el nivel mínimo del bloque "Reconocimiento y Crecimiento" evidencia una desconexión profunda entre el esfuerzo que los empleados perciben aportar y la retribución, el reconocimiento y las oportunidades que reciben a cambio. Los empleados sienten que su trabajo no se valora, que su retribución no es justa, que no tienen visibilidad de su itinerario profesional, y que la empresa no invierte en su desarrollo. Este patrón es especialmente dañino porque afecta al contrato psicológico: el empleado deja de percibir una relación de reciprocidad y pasa a ver la relación laboral como una transacción puramente económica. Las consecuencias son medibles: disminución del esfuerzo discrecional, aumento de la intención de salida (especialmente en perfiles con alta employability), pérdida de la ventaja competitiva que aporta el talento desarrollado internamente, y un deterioro del employer branding que dificulta la atracción de nuevos perfiles. A largo plazo, la falta de inversión en desarrollo genera una brecha de competencias que limita la capacidad de la organización para adaptarse a nuevos retos.',
    objetivos: [
      {
        horizon: '30 días',
        metas: [
          'Realizar una auditoría de equidad salarial interna por puesto, nivel y antigüedad, identificando brechas injustificadas y preparando un plan de corrección.',
          'Convocar reuniones individuales de "career check-in" con cada empleado para revisar sus expectativas de crecimiento, funciones y desarrollo.',
          'Comunicar formalmente un compromiso de inversión en formación con un presupuesto mínimo definido por empleado para el año en curso.',
        ],
      },
      {
        horizon: '60 días',
        metas: [
          'Implantar un programa de reconocimiento estructurado con dos componentes: reconocimientos públicos mensuales (peer-to-peer y de líder a colaborador) y reconocimientos anuales vinculados a valores corporativos.',
          'Definir itinerarios de carrera individuales para el 80% de la plantilla, con hitos de desarrollo, requisitos de competencias y ventanas temporales de revisión semestral.',
          'Lanzar el primer ciclo de formación o mentoría: al menos el 40% de los empleados participando en una acción de desarrollo formal.',
        ],
      },
      {
        horizon: '90 días',
        metas: [
          'Conseguir que al menos el 70% de los empleados reporten sentir que su esfuerzo es reconocido de manera justa.',
          'Cubrir al menos el 60% de las nuevas vacantes o ascensos con candidatos internos, siempre que exista el perfil adecuado.',
          'Reducir a menos del 15% el porcentaje de empleados que sienten que su trabajo "no tiene propósito" o que no ven oportunidades de crecimiento.',
        ],
      },
    ],
    iniciativas: [
      'Diseñar un esquema de retribución variable transparente y basado en objetivos cuantificables, con pesos definidos entre resultado individual (50%), resultado de equipo (30%) y contribución a valores corporativos (20%); los criterios se publican y se explican antes del inicio de cada ciclo.',
      'Realizar un estudio de benchmark salarial externo por puesto para identificar desviaciones frente al mercado; las brechas superiores al 10% se corrigen en el siguiente ciclo de revisión salarial con un plan de cierre en 12 meses.',
      'Establecer itinerarios de carrera individuales documentados: cada empleado tiene un documento de "roadmap de desarrollo" con su posición actual, la siguiente posición objetivo, las competencias requeridas, las acciones de formación planificadas y el horizonte temporal estimado; se revisa cada 6 meses con el líder directo.',
      'Crear un programa de mentoría interna que empareja a empleados con senior o directivos de otras áreas, con sesiones mensuales de 1 hora durante 6 meses; el matching se basa en intereses de desarrollo declarados por el empleado, no en asignación jerárquica.',
      'Implantar un programa de reconocimiento peer-to-peer en una plataforma digital sencilla (o canal de mensajería dedicado), donde cualquier empleado puede reconocer públicamente a un compañero por un valor corporativo específico; los reconocimientos se recopilan y se visibilizan en reuniones mensuales de equipo.',
      'Asignar un presupuesto de formación anual por empleado (mínimo 300€) con libertad de elección del empleado entre un catálogo curado; las acciones completadas se registran en el roadmap de desarrollo.',
      'Organizar sesiones trimestrales de "propósito e impacto" donde la dirección comparte la estrategia, los resultados y cómo el trabajo de cada departamento contribuye al éxito global; cada jefe de departamento prepara un micro-relato de impacto de su equipo que se comparte internamente.',
    ],
    kpis: [
      'Índice de percepción de reconocimiento justo (encuesta de pulso; objetivo: media ≥ 3.8 en escala 1-5).',
      'Brecha salarial interna media por puesto y nivel (objetivo: < 5% de desviación injustificada).',
      'Porcentaje de empleados con itinerario de carrera documentado (objetivo: ≥ 80%).',
      'Tasa de cobertura interna de vacantes y ascensos (objetivo: ≥ 60%).',
      'Inversión media en formación por empleado y tasa de finalización (objetivo: ≥ 300€/empleado y ≥ 75% de finalización).',
      'Índice de percepción de propósito y crecimiento (encuesta de pulso; objetivo: media ≥ 4.0 en escala 1-5).',
    ],
  },
  5: {
    diagnostico:
      'La detección de alertas en el bloque "Auditoría Cualitativa Cultural" revela que existe una discrepancia significativa entre lo que los empleados reportan en las preguntas cuantitativas (bloques 1-4) y lo que expresan cuando se les pregunta de forma cualitativa sobre comportamientos reales y concretos del liderazgo y la cultura. Esta discrepancia puede indicar varias cosas: que los empleados suavizan sus respuestas en las escalas Likert por mecanismo de defensa o miedo, pero cuando se les plantean escenarios específicos (cómo reacciona el jefe ante un error, cómo se gestionan los ascensos, cómo se comunican los cambios) revelan una realidad más dura; o que la cultura formal declarada por la empresa difiere de la cultura real vivida en el día a día. El impacto organizacional es grave: indica que los problemas detectados en los bloques anteriores pueden ser más profundos de lo que las puntuaciones cuantitativas sugieren, y que existe una capa de miedo o desconfianza que impide a los empleados expresar su realidad de forma directa. Si no se aborda, la brecha entre cultura declarada y cultura real se amplía, generando cinismo organizacional y invalidando cualquier iniciativa de mejora que no parta de un reconocimiento honesto del problema.',
    objetivos: [
      {
        horizon: '30 días',
        metas: [
          'Realizar entrevistas cualitativas confidenciales con una muestra representativa de empleados (mínimo 10% por departamento) para validar y profundizar en los hallazgos del bloque cualitativo.',
          'Mapear las áreas específicas donde la discrepancia entre lo cuantitativo y lo cualitativo es mayor (gestión de errores, comunicación de cambios, ascensos, coacción) y priorizar las 2 más críticas.',
          'Comunicar a la organización que la dirección ha recibido los resultados y va a actuar, sin revelar datos individuales ni departamentales específicos.',
        ],
      },
      {
        horizon: '60 días',
        metas: [
          'Implantar un canal de denuncia interna seguro, anónimo y gestionado por un tercero independiente, con compromiso de respuesta documentada en 5 días hábiles.',
          'Iniciar un programa de formación en gestión de errores y comunicación psicológicamente segura para el 100% de los mandos intermedios, con foco en las 2 áreas priorizadas.',
          'Realizar una auditoría de las prácticas reales de promoción y reconocimiento de los últimos 12 meses para identificar posibles casos de favoritismo o criterios no transparentes.',
        ],
      },
      {
        horizon: '90 días',
        metas: [
          'Reducir la discrepancia media entre nota cuantitativa y cualitativa a menos del 15% (medido en el siguiente ciclo de auditoría o en una encuesta de validación intermedia).',
          'Conseguir que el canal de denuncia reciba y resuelva al menos los casos reportados con una tasa de satisfacción del 80% por parte del denunciante.',
          'Establecer un comité de cultura y ética con representación transversal (RRHH, dirección, empleados) que revise trimestralmente las prácticas de liderazgo, comunicación y promoción, y emplane recomendaciones vinculantes.',
        ],
      },
    ],
    iniciativas: [
      'Contratar a un consultor externo especializado en cultura organizacional para conducir entrevistas confidenciales de 45 minutos con una muestra de empleados de cada departamento, usando un guion estructurado basado en las áreas de discrepancia detectadas; el consultor emite un informe agregado y anónimo con hallazgos y recomendaciones.',
      'Implantar un canal de denuncia interna gestionado por un proveedor externo independiente, con triple garantía: anonimato real (sin metadatos identificativos), respuesta garantizada en 5 días, y compromiso de no represalia formalizado en política corporativa.',
      'Diseñar un programa de formación intensiva en "gestión del error y seguridad psicológica" para mandos intermedios: 3 sesiones de 2 horas cubriendo (1) cómo reaccionar ante errores sin generar miedo, (2) cómo dar feedback correctivo sin erosionar la dignidad, (3) cómo fomentar que el equipo señale problemas sin temor; con role-playing basado en casos reales de la organización.',
      'Revisar y publicar los criterios formales de promoción y reconocimiento: definir qué competencias y resultados se evalúan, quién participa en la decisión, y qué documentación se genera; los criterios se comunican a toda la plantilla y se aplican de forma consistente en todos los departamentos.',
      'Establecer "autopsias de proyecto sin culpa": cuando un proyecto o iniciativa fracasa, el equipo implicado realiza una sesión estructurada de 90 minutos para analizar qué falló, qué se aprendió y qué se cambiará, con la regla explícita de que no se buscan culpables sino factores sistémicos; el aprendizaje se documenta y comparte.',
      'Crear un "tablero de transparencia" interno accesible a toda la plantilla donde se publican las decisiones relevantes de dirección (cambios de estrategia, reestructuraciones, resultados financieros) con una explicación del contexto y los criterios, para reducir la brecha entre lo que se decide y lo que se comunica.',
      'Realizar una encuesta de validación cultural intermedia (a los 60 días) con 5 preguntas cualitativas específicas sobre las áreas priorizadas, para medir si las acciones implementadas están cerrando la brecha entre cultura declarada y cultura real.',
    ],
    kpis: [
      'Discrepancia media entre nota cuantitativa (bloques 1-4) y nota cualitativa (bloque 5) por departamento (objetivo: < 15%).',
      'Número de denuncias recibidas y tasa de resolución en 5 días hábiles (objetivo: ≥ 90%).',
      'Índice de seguridad psicológica medido en encuesta de validación intermedia (objetivo: media ≥ 4.0 en escala 1-5).',
      'Porcentaje de mandos intermedios que completan el programa de gestión del error (objetivo: 100%).',
      'Tasa de promociones y reconocimientos con criterios documentados y auditables (objetivo: 100%).',
      'Diferencia entre cultura declarada y cultura real medida en encuesta de validación (objetivo: reducción del 40% en la brecha en 90 días).',
    ],
  },
};
