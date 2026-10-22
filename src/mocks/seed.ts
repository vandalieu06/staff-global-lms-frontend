import type { Capitulo, Curso, Formacion, Material, Pregunta, Test } from '@/types/domain'

/**
 * Datos de ejemplo: formación «DEMO Dermoconsejeras Verano 2026»
 * (docs/contenido-ejemplo/dermoconsejeras-verano-2026.md). Las preguntas, respuestas y
 * explicaciones de los capítulos 1 y 2 son las reales; la respuesta correcta es siempre la
 * primera en el contenido fuente (la app baraja el orden en cada intento).
 *
 * Provisional hasta recibir el contenido: capítulos 3–5 (títulos deducidos de la descripción del
 * curso), materiales de muestra (spec 04) y test final (usa las preguntas de los capítulos 1–2).
 */

export const formacionDemo: Formacion = {
  id: 'dermoconsejeras-verano-2026',
  nombre: 'DEMO Dermoconsejeras Verano 2026',
}

const NOTA_MINIMA = 80
// Con la base de Vite para que funcione también bajo /<repo>/ en GitHub Pages.
const MATERIALES = `${import.meta.env.BASE_URL}mock/materiales`

const preguntasCap1: Pregunta[] = [
  {
    id: 'cap-1-p1',
    enunciado:
      'Llegas a tu centro de El Corte Inglés para comenzar tu turno continuo de mañana (11:00 a 15:00 h). ¿Qué operativa debes realizar en GlobalApp con respecto a tus fichajes?',
    respuestas: [
      'Pulsar «Ingreso al evento» al llegar al punto de venta y «Salida del evento» al finalizar tu turno, manteniendo la ubicación activa al fichar.',
      'Fichar únicamente al inicio de la jornada, ya que el sistema cierra automáticamente el turno a las 15:00 h.',
      'Realizar cuatro fichajes a lo largo de la mañana para registrar las pausas de descanso en el centro.',
      'Fichar únicamente al finalizar el día mediante el cuestionario de reporting general de ventas.',
    ],
    correcta: 0,
    explicacion:
      'En turnos continuos se realizan dos fichajes: entrada («Ingreso al evento») al llegar y salida («Salida del evento» o «Me voy del evento») al finalizar, con la ubicación del móvil activada.',
  },
  {
    id: 'cap-1-p2',
    enunciado:
      'Al completar el reporting diario en GlobalApp indicas que has atendido a 18 clientes compradores en total. Al rellenar las encuestas de producto vendido, ¿qué regla de coherencia debes cumplir?',
    respuestas: [
      'El total de ventas reportado en encuestas no puede ser inferior a 18 unidades.',
      'Solo debes registrar una encuesta por cada dos clientes compradores que hayan aprovechado la promoción.',
      'Basta con registrar una única encuesta global resumiendo los 18 productos vendidos.',
      'Puedes registrar menos encuestas si varios productos fueron adquiridos en el mismo ticket de compra.',
    ],
    correcta: 0,
    explicacion:
      'El procedimiento operativo establece que el total de ventas reportadas en encuestas no puede ser inferior al número de clientes compradores indicados en el cuestionario.',
  },
  {
    id: 'cap-1-p3',
    enunciado:
      'Te despiertas indispuesta un sábado por la mañana y no puedes acudir a tu turno en El Corte Inglés. ¿Cómo debes actuar según el procedimiento de incidencias de SGG?',
    respuestas: [
      'Contactar a primera hora a través de los canales de SGG (teléfono de guardia en fin de semana) y tramitar posteriormente el correspondiente justificante.',
      'Avisar exclusivamente al responsable de perfumería de El Corte Inglés cuando abra el centro a las 10:00 h.',
      'Enviar un mensaje por el chat de la app al finalizar el fin de semana para que conste el lunes en RR. HH.',
      'Esperar a que tu coordinadora te llame al detectar que no has fichado en GlobalApp para explicarle lo ocurrido.',
    ],
    correcta: 0,
    explicacion:
      'Las faltas de asistencia se comunican a primera hora directamente a SGG (teléfono de guardia en fin de semana) para gestionar la incidencia y su justificación.',
  },
  {
    id: 'cap-1-p4',
    enunciado:
      'Recibes en tu correo electrónico la nómina de octubre dentro de un archivo ZIP protegido. ¿Qué clave debes introducir para abrir el documento?',
    respuestas: [
      'Tu número de DNI o NIE (con las letras en mayúscula).',
      'Tu código de empleada de Staff Global Group facilitado en la firma del contrato.',
      'La contraseña habitual con la que inicias sesión en GlobalApp.',
      'Tu fecha de nacimiento en formato DDMMAAAA.',
    ],
    correcta: 0,
    explicacion:
      'Por cumplimiento de la LOPD, las nóminas se envían en un ZIP protegido cuya contraseña es tu DNI (o NIE, con las letras en mayúscula).',
  },
  {
    id: 'cap-1-p5',
    enunciado:
      'Al incorporarte a tu jornada te percatas de que la balda asignada a Longevity está semivacía y no encuentras stock en el mueble. ¿Qué paso debes dar?',
    respuestas: [
      'Informar al responsable de El Corte Inglés para verificar producto en almacén y avisar a tu coordinadora/SGG si no se resuelve.',
      'Reorganizar el lineal colocando productos de marcas de la competencia para que no se vea el hueco.',
      'No intervenir y esperar a que el reponedor de Eucerin acuda semanalmente a revisar el surtido.',
      'Suspender la atención al público hasta que el centro reponga todas las referencias que faltan.',
    ],
    correcta: 0,
    explicacion:
      'Ante falta de stock o exposición, primero se informa al responsable del centro (El Corte Inglés) y, si no se resuelve, a SGG o a la coordinadora.',
  },
]

const preguntasCap2: Pregunta[] = [
  {
    id: 'cap-2-p1',
    enunciado:
      'Llega al stand una caja grande con material promocional que supera los 15 kg de peso. Según las normas de Prevención de Riesgos Laborales de SGG, ¿cómo debes proceder?',
    respuestas: [
      'Pedir ayuda al personal del centro para moverla conjuntamente, doblando las rodillas y manteniendo la espalda recta.',
      'Levantarla rápidamente haciendo palanca con la cintura para evitar retrasar la apertura del stand.',
      'Arrastrar la caja con el pie por el suelo del centro hasta colocarla detrás del mostrador.',
      'Dejar la caja en el pasillo central de paso hasta que finalice tu jornada de trabajo.',
    ],
    correcta: 0,
    explicacion:
      'No se levantan en solitario cargas de más de 15 kg; hay que doblar las rodillas, mantener la espalda recta y pedir ayuda al personal del centro.',
  },
  {
    id: 'cap-2-p2',
    enunciado:
      'Durante la demostración de un producto en el stand, ¿dónde debes aplicar el tester cosmético a la consumidora?',
    respuestas: [
      'Exclusivamente en el dorso de su mano, comprobando previamente que no presente heridas o irritación.',
      'Directamente en sus mejillas o frente si la clienta no lleva maquillaje.',
      'En la zona del contorno de sus ojos para que aprecie el efecto tensor inmediato.',
      'En el dorso de tu propia mano para que ella únicamente observe la absorción.',
    ],
    correcta: 0,
    explicacion:
      'Los testers se aplican siempre en el dorso de la mano de la consumidora, nunca en el rostro, para prevenir riesgos y valorar la tolerancia.',
  },
  {
    id: 'cap-2-p3',
    enunciado:
      'Una clienta queda fascinada con la rutina Longevity y te pide que le guardes dos unidades para el día siguiente, ofreciéndote su nombre y teléfono en un papel. ¿Qué debes hacer?',
    respuestas: [
      'Explicarle amablemente que por protección de datos no puedes recoger sus datos personales ni gestionar reservas personales de producto.',
      'Guardar el papel en tu bolso personal y destruir la información una vez que regrese al día siguiente.',
      'Introducir su número de teléfono en las notas internas de GlobalApp para que quede constancia en el sistema.',
      'Aceptar los datos y solicitarle además su firma de consentimiento expreso en un cuaderno propio.',
    ],
    correcta: 0,
    explicacion:
      'Según el RGPD y la LOPDGDD, está prohibido anotar o recopilar datos personales de las consumidoras en el punto de venta.',
  },
  {
    id: 'cap-2-p4',
    enunciado:
      'Una consumidora te pregunta si Hyaluron-Filler + Longevity le curará la dermatitis y eliminará sus arrugas en 7 días. ¿Cuál es la respuesta correcta conforme a la regulación de cosméticos?',
    respuestas: [
      'Aclarar que los cosméticos mejoran visiblemente el aspecto de la piel pero no curan enfermedades, y derivar al médico ante patologías cutáneas sin garantizar plazos exactos.',
      'Confirmar que al actuar a nivel epigenético erradicará cualquier afección cutánea en menos de una semana.',
      'Garantizarle la desaparición completa de las arrugas en 7 días siempre que adquiera la rutina completa.',
      'Recomendarle sustituir cualquier tratamiento farmacológico pautado por el sérum de Longevity.',
    ],
    correcta: 0,
    explicacion:
      'Según los Reglamentos CE 1223/2009 y UE 655/2013, un cosmético no puede presentarse como tratamiento curativo ni prometer resultados en plazos concretos.',
  },
  {
    id: 'cap-2-p5',
    enunciado:
      'Una clienta se acerca al stand muy molesta queriendo devolver un producto abierto comprado la semana pasada y exige una compensación económica inmediata. ¿Cómo debes actuar?',
    respuestas: [
      'Indicarle con amabilidad que el cobro y las devoluciones las gestiona el personal de El Corte Inglés en atención al cliente, e informar luego a tu coordinadora.',
      'Recoger el producto defectuoso y devolverle el importe en efectivo de tu propio fondo de maniobra.',
      'Tramitarle una hoja oficial de reclamaciones de Staff Global Group en el mismo mostrador.',
      'Cambiarle el producto por otro del stand sin necesidad de ticket de compra para evitar discusiones.',
    ],
    correcta: 0,
    explicacion:
      'El personal de SGG no gestiona cobros, cambios ni devoluciones; se remite a la clienta al personal o a atención al cliente de El Corte Inglés y después se informa a la coordinadora.',
  },
]

// Materiales de muestra generados por scripts/generar-materiales-mock.sh (spec 04). Tamaños,
// páginas y duraciones son los de los archivos reales (lo comprueba seed.test.ts).
const materialesCap1: Material[] = [
  {
    id: 'cap-1-pdf',
    tipo: 'pdf',
    titulo: 'Procedimiento operativo SGG',
    url: `${MATERIALES}/cap-1-procedimiento-operativo.pdf`,
    tamanoBytes: 152913,
    paginas: 4,
  },
  {
    id: 'cap-1-imagen',
    tipo: 'imagen',
    titulo: 'Infografía: fichajes en GlobalApp',
    url: `${MATERIALES}/cap-1-fichajes-globalapp.png`,
    tamanoBytes: 122271,
  },
  {
    id: 'cap-1-video',
    tipo: 'video',
    titulo: 'Reporting diario en GlobalApp',
    url: `${MATERIALES}/cap-1-reporting-diario.mp4`,
    tamanoBytes: 248718,
    duracionSeg: 20,
  },
  {
    id: 'cap-1-audio',
    tipo: 'audio',
    titulo: 'Qué hacer ante una incidencia',
    url: `${MATERIALES}/cap-1-incidencias.mp3`,
    tamanoBytes: 160539,
    duracionSeg: 20,
  },
]

const materialesCap2: Material[] = [
  {
    id: 'cap-2-pdf',
    tipo: 'pdf',
    titulo: 'Prevención de riesgos en el stand',
    url: `${MATERIALES}/cap-2-prevencion-riesgos.pdf`,
    tamanoBytes: 138785,
    paginas: 4,
  },
  {
    id: 'cap-2-imagen',
    tipo: 'imagen',
    titulo: 'Infografía: datos personales en el punto de venta',
    url: `${MATERIALES}/cap-2-datos-personales.png`,
    tamanoBytes: 122450,
  },
  {
    id: 'cap-2-video',
    tipo: 'video',
    titulo: 'Cómo aplicar el tester a la consumidora',
    descripcion:
      'Demostración en el stand: comprobar la piel, aplicar en el dorso de la mano y explicar la textura de Hyaluron-Filler sin prometer resultados.',
    url: `${MATERIALES}/cap-2-aplicar-tester.mp4`,
    tamanoBytes: 252348,
    duracionSeg: 20,
  },
  {
    id: 'cap-2-audio',
    tipo: 'audio',
    titulo: 'Qué puedes y qué no puedes prometer de un cosmético',
    url: `${MATERIALES}/cap-2-marco-publicitario.mp3`,
    tamanoBytes: 160539,
    duracionSeg: 20,
  },
]

function test(id: string, preguntas: Pregunta[]): Test {
  return { id, preguntas, notaMinima: NOTA_MINIMA }
}

function capituloPendiente(orden: number, titulo: string): Capitulo {
  return {
    id: `cap-${orden}`,
    orden,
    titulo,
    materiales: [],
    test: test(`cap-${orden}-test`, []),
    contenidoPendiente: true,
  }
}

export const cursoDermoconsejera: Curso = {
  id: 'dermoconsejera',
  formacion: formacionDemo,
  titulo: 'Dermoconsejera',
  descripcion:
    'Atención y asesoramiento a la consumidora en el espacio Eucerin de El Corte Inglés, recomendación de la rutina Hyaluron-Filler + Longevity y venta cruzada autorizada, cuidado del espacio y stock, entrega de muestras y promociones, y registro diario de jornada y ventas en GlobalApp.',
  capitulos: [
    {
      id: 'cap-1',
      orden: 1,
      titulo: 'Procedimiento operativo SGG: organización, jornada y GlobalApp',
      materiales: materialesCap1,
      test: test('cap-1-test', preguntasCap1),
      contenidoPendiente: false,
    },
    {
      id: 'cap-2',
      orden: 2,
      titulo: 'Normativa aplicable: PRL, protección de datos, igualdad y marco publicitario',
      materiales: materialesCap2,
      test: test('cap-2-test', preguntasCap2),
      contenidoPendiente: false,
    },
    capituloPendiente(3, 'Rutina Hyaluron-Filler + Longevity'),
    capituloPendiente(4, 'Asesoramiento y venta cruzada autorizada'),
    capituloPendiente(5, 'Espacio, stock, muestras y promociones'),
  ],
  testFinal: test('test-final', [...preguntasCap1, ...preguntasCap2]),
}

export const cursos: Curso[] = [cursoDermoconsejera]
