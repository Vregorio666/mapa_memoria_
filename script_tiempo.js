// Casos que faltan Benjamin Bustos Morales y José Segundo Veloso Araya 
//Bruno García Morales Huachocopihue
// Domingo Perez San Martin 
// Caso Pirihueico Barra

// Inicio mapa
var mapa = L.map('mapa').setView([-39.90, -72.8], 9);


// Capa OSM
var positron = L.tileLayer(
  'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  {
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 19
  }
);
positron.addTo(mapa)



// Función para abrir panel con 3 contenidos
function openPanel(content1, content2, content3) {
    const panel   = document.getElementById('info-panel');
    const page1   = document.getElementById('page1');
    const ic      = document.getElementById('info-content');
    const Abierto = panel.classList.contains('open');
    setTimeout(actualizarNavPanel, 0);

    markers.forEach(m => m._panelAbierto = false);

    panel.classList.add('open');
    document.querySelectorAll('.panel-page').forEach(p => p.classList.remove('active'));
    page1.classList.add('active');
    document.querySelectorAll('.tab-btn').forEach(d => d.classList.remove('active'));
    document.querySelector('.tab-btn[data-tab="page1"]').classList.add('active');
    document.querySelector('.tab-btn[data-tab="page3"]').style.display = content3 ? 'block' : 'none';
    ajustarPanel();

    if (navegandoConFlechas) {
        ic.style.transition = 'none';
        ic.style.opacity = '0';
        ic.innerHTML = content1 || '';
        document.getElementById('third-content').innerHTML = content3 || '';
        requestAnimationFrame(function() {
            initgalerias();
            ic.style.transition = 'opacity 0.15s ease';
            ic.style.opacity = '1';
        });
        return;
    }

    // Click manual: fade suave
    ic.style.transition = 'none';
    ic.style.opacity = '0';
    if (!Abierto) page1.style.opacity = '0';

    ic.innerHTML = content1 || '';
    document.getElementById('third-content').innerHTML = content3 || '';

    requestAnimationFrame(function() {
        ic.style.transition = '';
        initgalerias();
        ic.style.opacity = '1';
        page1.style.opacity = '1';
    });
}

function esMobile() {
    return window.innerWidth <= 768 || (window.innerHeight <= 500 && window.innerWidth <= 1024);
}
function ajustarPanel() {
    const panel = document.getElementById('info-panel');
    if (esMobile()) {
        panel.style.left = '';
        panel.style.right = '';
        panel.style.width = '';
        return;
    }
    const btnSiguiente = document.getElementById('btn-siguiente');
    const rectBtn = btnSiguiente.getBoundingClientRect();
    panel.style.left = (rectBtn.right + 15) + 'px';
    panel.style.right = '10px';
    panel.style.width = '';
}
ajustarPanel();
window.addEventListener('resize', ajustarPanel);


// Alternar entre páginas al pulsar botones
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.panel-page').forEach(page => page.classList.remove('active'));
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.getElementById(btn.getAttribute('data-tab')).classList.add('active');
        btn.classList.add('active');
    });
});

// Cerrar panel
document.getElementById('close-btn').addEventListener('click', () => {
    document.getElementById('info-panel').classList.remove('open');
    document.getElementById('panel-nav').style.display = 'none';
    panelMarker = null;
    setAnio('');
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// PDF de Libro
function openLibroPDF(page = 1) {
    // Crear overlay oscuro
    const overlay = document.createElement('div');
    overlay.id = 'pdf-overlay-libro';  // ← ID único
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        z-index: 2000;
        display: flex;
        align-items: center;
        justify-content: center;
    `;

    
    // Crear ventana del PDF
    const pdfWindow = document.createElement('div');
    pdfWindow.style.cssText = `
        width: 90%;
        max-width: 1000px;
        height: 90%;
        background: white;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        position: relative;
        display: flex;
        flex-direction: column;
    `;
    
    pdfWindow.innerHTML = `
        <button onclick="closePDFOverlay('pdf-overlay-libro')" style="
            position: absolute;
            top: 10px;
            right: 10px;
            background: #1b2734;
            color: white;
            border: none;
            border-radius: 5px;
            padding: 8px 15px;
            cursor: pointer;
            font-size: 18px;
            font-weight: bold;
            z-index: 10;
        ">✕</button>
        <iframe src="./libros/libro_cm/ruta_libro.pdf#page=${page}&zoom=page-width&toolbar=1" style="
            width: 100%;
            height: 100%;
            border: none;
            border-radius: 10px;
        "></iframe>
    `;
    
    overlay.appendChild(pdfWindow);
    document.body.appendChild(overlay);
    
    // Cerrar al hacer click fuera del PDF
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            closePDFOverlay('pdf-overlay-libro');
        }
    });
}
// PDF Ruta de la memoria 
function closePDFOverlay(overlayId) {
    const overlay = overlayId ? document.getElementById(overlayId) : document.getElementById('pdf-overlay');
    if (overlay) {
        overlay.remove();
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Poner año
function setAnio(texto) {
    const anioDiv = document.getElementById('info-anio');
    if (anioDiv) {
        const contenido = texto || sliderEtiqueta;
        anioDiv.innerHTML = contenido;
        anioDiv.style.display = esMobile() ? 'none' : 'block';
    }
}
// Barra de Tiempo
const anioActual = new Date().getFullYear();
const slider = document.getElementById('slider-anio');
slider.min = 1972;        // ← parte en 1972
slider.max = anioActual;
slider.value = anioActual;    // ← valor inicial
slider.step = 0.01

let _sliderRAF = null;
let _sliderV   = null;
let navegandoConFlechas = false;
let sliderEtiqueta = 'Hoy';

document.getElementById('slider-anio').addEventListener('input', function() {
    if (!navegandoConFlechas) {
        document.getElementById('info-panel').classList.remove('open');
        setAnio('');
    }

    const v = parseFloat(this.value);
    _sliderV = v;

    let etiqueta;
    if (v >= anioActual)  etiqueta = 'Hoy';
    else if (v < 1972.1)  etiqueta = '10 de septiembre de 1973';
    else if (v < 1973.1)  etiqueta = '11 de septiembre de 1973';
    else                  etiqueta = Math.floor(v).toString();
    sliderEtiqueta = etiqueta;

    if (_sliderRAF) cancelAnimationFrame(_sliderRAF);
    _sliderRAF = requestAnimationFrame(function() {
        const cv = _sliderV;
        filtrarMarcadores(cv);
        let textoEvento = '';
        for (let i = fechasClave.length - 1; i >= 0; i--) {
            if (fechasClave[i].valor <= cv && fechasClave[i].marker) {
                if (fechasClave[i].marker._anioTexto) textoEvento = fechasClave[i].marker._anioTexto;
                break;
            }
        }
        if (!textoEvento && cv < 1972.1) textoEvento = '<span style="font-family:\'Courier New\',monospace;font-weight:bold;">Línea de tiempo</span>';
        setAnio(textoEvento);
        actualizarContexto(cv);
        indiceFecha = 0;
        for (let i = 0; i < fechasClave.length; i++) {
            if (fechasClave[i].valor <= cv) indiceFecha = i;
        }
        _sliderRAF = null;
    });
});


const titulo = document.getElementById('info-titulo');
titulo.style.position = 'fixed';
titulo.style.display = 'block';

const leyenda = document.getElementById('info-leyenda');
leyenda.style.position = 'fixed';
if (window.innerWidth > 768) {
    leyenda.style.display = 'block';
}

function actualizarContexto(v) {
    const contexto = document.getElementById('info-contexto');
    const frase = document.getElementById('info-frase'); // ← agrega esto
    if (!contexto) return;

    

    let texto = '';


if (v < 1973) {
    texto = `<p style="font-weight: bolder;">1970 - 1973</p>
    Chile vive el gobierno de la Unidad Popular de Salvador Allende, el único proyecto socialista elegido
     por la vía democrática en esa época. 
     <br><br>
    Este proyecto popular buscará redistribuir las riquezas 
    del país nacionalizando los recursos naturales como el cobre, y redistribuyendo las tierras entre los campesinos 
    a traves de la reforma agraria.
Para los niños se implementó la medida del medio litro de leche diario, también se aumentarón los consultorios en zonas rurales y populares.
Se regularizaron campamentos y tomas, mientras se construían nuevas viviendas.
<br><br>
    El gobierno deberá resistir una campaña de desestabilización y boicot orquestada por la CIA y EEUU.
     Para el año 1973 la inestabilidad social y económica es muy alta,
     el gobierno opta por llamar a un plebiscito para evaluar la continuidad de este. 
    Sin embargo ese plebiscito nunca se podrá concretar debido al golpe de estado.`;

} else if (v < 1973.1) {
    texto = `<p style="font-weight: bolder;">11 de septiembre de 1973</p>
    El 11 de septiembre de 1973 se produce el golpe de Estado en Chile, derrocando el gobierno del presidente Salvador Allende.
    Este día comienza la larga noche negra, con una feroz dictadura que durará 17 años 
    en la que serán hechas desaparecer 1.093 personas y asesinadas 2.123.`;

} else if (v < 1973.3) {
    texto = `<p style="font-weight: bolder;">1973</p>
    Comienzan las detenciones y ejecuciones a lo largo de todo Chile.
    A través de bandos militares transmitidos por las radios, el ejército comienza a solicitar la presentación de ciudadanos
    a las unidades militares, muchas de la cuales nunca más aparecerán.`;

} else if (v <= 1973.9) {
    texto = `<p style="font-weight: bolder;">1973</p>En octubre de 1973 llega la Caravana de la Muerte a la región de Los Ríos.
    Esta caravana, dirigida por el coronel Sergio Arellano Stark, recorre distintas ciudades de todo Chile
    en helicópteros Puma entre septiembre y octubre de 1973, deteniéndose en distintos lugares
    para ejecutar y hacer desaparecer a personas asociadas a la izquierda.<br><br>
    En la región de Los Ríos, en las matanzas de Chihuío, Neltume, Liquiñe y Maiquillahue,
    son asesinados más de 40 campesinos y dirigentes políticos.`;

} else if (v >= 1974 && v < 1975) {
    texto = `<p style="font-weight: bolder;">1974</p>
    La represión se consolida en Chile. Se firman los decretos que declaran a Augusto Pinochet como Jefe Supremo de la Nación,
    y el decreto que oficializa la creación de uno de los organismos más macabros de la dictadura:
    la Dirección de Inteligencia Nacional (DINA), el que estará a cargo de la persecución, tortura, asesinatos y desaparición de personas.
    <br><br>
    El 29 de septiembre las acciones de la DINA cruzan la cordillera. Mediante la implantación de una bomba en su vehículo,
    asesinan al ex comandante Carlos Prats y su esposa Sofía Cuthbert, quienes habían defendido el gobierno de la Unidad Popular.<br>
    El 5 de octubre la cacería llevada a cabo por la DINA da con el máximo dirigente del MIR, Miguel Enríquez,
     quien es asesinado en Santiago demoralizando a la resistencia.<br><br>

La agrupación de familiares de detenidos desaparecidos nace a fines de año al amparo del Comité Pro Paz, con solo veinte miembros. 
Son principalmente mujeres que comenzaron a acompañarse mutuamente en las filas de las comisarías, 
centros de detención y morgues buscando noticias de sus familiares desaparecidos.
     
     `;

} else if (v >= 1975 && v < 1976) {
    texto = `<p style="font-weight: bolder;">1975</p>
    El 23 de julio se produce una de las acciones más macabras de la DINA: a través de un montaje,
    reportan la aparición de 119 asesinados en Argentina en un falso enfrentamiento entre militantes de izquierda.
    Estos militantes habían sido asesinados en Chile por las fuerzas represivas.
    Sus nombres habían sido sacados de los recursos de amparo presentados por los familiares de los desaparecidos,
    y el montaje cometía las mismas faltas ortográficas de los archivos originales.
    El periódico chileno La Segunda titula la noticia "Exterminados como ratones".
    <br><br>
    En respuesta a este burdo montaje, se produce la primera huelga de hambre en los centros de detención y tortura del régimen.
    En el campo de prisioneros Melinka Puchuncaví, más de un centenar de prisioneros inician una huelga de hambre
    que se extiende por más de una semana. Durante los años siguientes, las huelgas de hambre se convierten
    en un método de protesta de las agrupaciones que enfrentan a la dictadura.
    <br><br>
    Para fines de año la AFDD ya agrupa a más de 300 personas. 
   Sin embargo tambien es disuelto el Comité Pro Paz, organización que agrupa a las iglesias de Chile
    y ha sido el principal apoyo a la agrupación`;

} else if (v >= 1976 && v < 1977) {
    texto = `<p style="font-weight: bolder;">1976</p>
    En enero el Cardenal Raúl Silva Henríquez funda la Vicaría de la Solidaridad,
    el principal organismo de defensa de los derechos humanos durante la dictadura, el continua el apoyo a la agrupación de familiares.
    <br><br>
    Mientras tanto, los aparatos represivos se concentran en la persecución de los dirigentes del Partido Comunista.
    A través de distintos operativos, entre ellos el conocido como Calle Conferencia, son asesinados 13 dirigentes del Partido.
    Una de estas militantes es Marta Ugarte Román, cuyo cuerpo aparece en la playa Los Molles en la Quinta Región
    luego de ser brutalmente torturada y arrojada al mar desde un helicóptero.
    El régimen monta un operativo adjudicando la muerte a un crimen pasional,
    pero la autopsia evidencia su tortura y asesinato. Así los métodos del régimen comienzan a salir a la luz pública.
    <br><br>
    Posteriormente la DINA, confiada en su impunidad, asesina en Washington DC al ex canciller Orlando Letelier
    y a una ciudadana norteamericana mediante una bomba adosada al automóvil del diplomático.<br><br>
    En noviembre, gracias a la presión nacional e internacional cierra Tres Álamos, uno de los centros de detencion y tortura más crueles del regimén.
     Los presos políticos son liberados,     pero los familiares de la agrupación comprueban que sus seres queridos no están entre los liberados.
     La certeza de que algo grave ocurrió con ellos se instala.
    `;

} else if (v >= 1977 && v < 1978) {
    texto = `<p style="font-weight: bolder;">1977</p>
    El 14 de junio la Agrupación de Familiares de Detenidos Desaparecidos realiza una histórica huelga de hambre
    en el edificio de la CEPAL, exigiendo la verdad sobre el paradero de sus familiares secuestrados.<br>
    En diciembre realizan una segunda huelga de hambre donde participan 90 familiares en la Iglesia San Francisco. La valentía de estas mujeres conmueve a Chile y al mundo.
    <br><br>
    Como consecuencia del asesinato de Orlando Letelier y ante la presión del gobierno norteamericano,
    Pinochet disuelve la DINA y crea la Central Nacional de Inteligencia (CNI), aparato que con un disfraz más institucional
    retoma las labores de represión y tortura de la DINA.
    <br><br>
    A fines del año, en respuesta a la rotunda condena de la ONU al régimen,
    Pinochet convoca a una consulta nacional sobre el apoyo al gobierno militar.`;

} else if (v >= 1978 && v < 1979) {
    texto = `<p style="font-weight: bolder;">1978</p>
    El 4 de enero triunfa el Sí en la fraudulenta consulta nacional, donde es evidente la manipulación de la elección.
    El general Gustavo Leigh, parte de la Junta Militar, critica abiertamente la consulta, lo que le cuesta su expulsión dela junta el 24 de julio.
    <br><br>
    En abril la dictadura intenta levantar un manto de impunidad sobre las masacres cometidas por el ejército.
    A través del Decreto Ley 2191 se firma la Ley de Amnistía, que indulta a todos los autores, cómplices
    o encubridores de los crímenes cometidos durante el estado de sitio vigente entre 1973 y 1978.
    <br><br>
    En marzo del mismo año nace la Cueca Sola en el Teatro Caupolicán, 
    bailada por mujeres de la AFDD ante diez mil personas en el Día Internacional de la Mujer. Esta demostración se convierte en símbolo mundial de la resistencia.
    luego 22 de mayo la AFDD inicia una nueva huelga de hambre de 17 días en las afueras de las iglesias La Estampa, 
    Jesús Obrero y Don Bosco en Santiago. 
    <br><br>
    En noviembre son descubiertos, en los hornos de Lonquén, los cuerpos de 15 campesinos asesinados por la dictadura.
    Esta es la primera evidencia pública de las ejecuciones masivas perpetradas por los organismos represivos. 
    Este descubriemiento signifa, para la agrupación, la dolorosa verdad de que muchos de sus familiares no regresarán con vida.
     La lucha continua, aún se buscará verdad y justicia, aunque estos ya no respiren.
    <br>
    A partir de este caso Pinochet ordena la Operación Retiro de Televisores, donde se obligo a los militares a retiras los cuerpos de los asesinados de las fosas y desaserce de los resto.
    Esta operación condenará a los familiares de los detenidos desaparecidos a una búsqueda eterna.
    `;

} else if (v >= 1979 && v < 1980) {
    texto = `<p style="font-weight: bolder;">1979</p>
    La agrupación comienza a salir a la calle, inspirando a el resto del país, Las rondas silenciosas
     frente a La Moneda y los tribunales se convierten en una imagen permanente.
    Estas acciones inspiran a los trabajadores, quienes el primero de mayo convocan un protesta con una masiva convocatoria.
    <br><br>
    En junio, el ministro del trabajo José Piñera entrega los cinco decretos de ley que componen el Plan Laboral,
    dando inicio a la implementación del modelo neoliberal en Chile.
    <br><br>
    En el pueblo de Yumbel son exhumados los restos de 19 personas asesinadas por la dictadura
    en las localidades de Laja y San Rosendo en 1973.
    En Santiago se denuncian los entierros masivos en el Patio 29 del Cementerio General,
    donde fueron enterrados los cuerpos de distintas víctimas de la dictadura.`;

} else if (v >= 1980 && v < 1981) {
    texto = `<p style="font-weight: bolder;">1980</p>
    Los trabajadores de Chile continúan sus protestas, el 25 de enero los mineros de El Teniente
    inician un paro indefinido.
    <br> Paralelamente comienza la Operación Retorno del MIR,
    donde vuelven clandestinamente a Chile varios militantes exiliados formados militarmente en el extranjero.
    <br><br>
    En agosto se anuncia el plebiscito para aprobar la nueva Constitución,
    elaborada por asesores liberales de derecha del régimen, cuyo ideólogo principal es el abogado Jaime Guzmán.
    El 11 de septiembre la Constitución es aprobada, condenando a Chile al modelo neoliberal que marca la economía hasta el día de hoy.
    <br>
    Comienza la crisis económica que caracteriza el inicio de los años 80:
    récord de quiebras en empresas y aumento histórico de la deuda per cápita del país.`;

} else if (v >= 1981 && v < 1982) {
    texto = `<p style="font-weight: bolder;">1981</p>
    En el marco de la Operación Retorno, una quincena de combatientes del MIR se instala en la precordillera
    de la región de Los Ríos, cerca de Neltume, para preparar una avanzada guerrillera y desafiar a la dictadura
    Los combatientes, organizados en el Destacamento Guerrillero Toqui Lautaro, construyen bases
    y analizan el territorio para la futura guerrilla.
    <br><br>
    Sin embargo, son identificados por campesinos del sector que avisan a las fuerzas armadas.
    Comienza entonces la Operación Machete, destinada a aniquilar el foco guerrillero.
    Más de 2.000 soldados se despliegan en el territorio. Después de varios meses de persecución,
    dan muerte a 7 guerrilleros, mientras el resto logra escapar exitosamente.`;

} else if (v >= 1982 && v < 1983) {
    texto = `<p style="font-weight: bolder;">1982</p>
    El 22 de enero muere en extrañas circunstancias el ex presidente Eduardo Frei Montalva,
    quien mantenía una postura de oposición al régimen. Con los años la tesis de su asesinato se hace más fuerte.
    <br><br>
    En febrero es asesinado el dirigente sindical Tucapel Jiménez, uno de los grandes dirigentes obreros que lideraban la oposición la régimen.
    <br><br>
    En agosto, en respuesta al empeoramiento de las condiciones de vida debido a la crisis económica,
    se convoca a la primera Marcha del Hambre. El miedo da un paso al costado
    y el descontento popular comienza a hacerse notar en las calles.<br>
    La agrupación de familiares se hace presente en cada protesta, la imagen de las mujeres con las fotografías colgadas al cuello 
    se convierte en uno de los íconos más poderosos de la resistencia.`;

} else if (v >= 1983 && v < 1984) {
    texto = `<p style="font-weight: bolder;">1983</p>
    Este es el año en que el pueblo pierde el miedo y se toma las calles.
    Las agrupaciones de trabajadores convocan a 7 jornadas de protesta nacional durante el año.
    La masividad de estas y la valentía de la gente hacen temblar al régimen,
    que no duda en ejercer la más cruda represión.
    Salen a la calle estudiantes, trabajadores y pobladores.
    <br><br> Al caer la noche y comenzar el toque de queda,
    resuenan en todo Chile los ensordecedores ruidos de las cacerolas.
    Los "cacerolazos" quedan grabados en la historia de Chile y se convierten en una forma de protesta
    que acompañará al pueblo hasta el día de hoy. La agrupación se mantendra firme en cada protesta.
    A pesar de la cruda represión que deja más de un centenar de muertos durante las protestas,
    la gente no claudica y se mantiene en pie de lucha.
    <br><br>
    En septiembre, frente a la crisis de la vivienda, 1.900 familias se toman terrenos al sur de Santiago,
    dando origen a distintos campamentos.
    <br><br>
    El 11 de septiembre en Concepción, frente a la catedral, se inmola Sebastián Acevedo,
    exigiendo saber el paradero de sus dos hijos secuestrados por la CNI.
    Este sacrificio da origen al Movimiento contra la Tortura Sebastián Acevedo.
    <br><br>
    A fines de año el Frente Patriótico Manuel Rodríguez, brazo armado del Partido Comunista,
    efectúa su primera acción generando un apagón que afecta a casi todo Chile.`;

} else if (v >= 1984 && v < 1985) {
    texto = `<p style="font-weight: bolder;">1984</p>
    En marzo se realiza la octava jornada de protesta nacional. La gente paraliza la locomoción y el comercio.
    En la noche las barricadas se toman las poblaciones y las cacerolas rugen a lo largo del país.
    <br><br>
    El 12 de abril los estudiantes universitarios convocan a un paro estudiantil
    al que se adhieren casi todas las universidades del país.
    El 1 de mayo las organizaciones de trabajadores realizan un masivo acto en el Parque O'Higgins.
    <br><br>
    El 28 de agosto los pobladores convocan a una nueva Marcha del Hambre.
    La crisis económica empeora y aparecen más ollas comunes en el país,
    estas convierten en espacios de organización y solidaridad popular.
    <br><br>
    Los días 4 y 5 de septiembre se convoca a una doble jornada de protesta nacional,
    en esta es asesinado el emblemático sacerdote francés de la población La Victoria, André Jarlan.
    El entierro del párroco el 7 de septiembre convoca a una gran multitud que acompañara la carroza funebre enfrentando a la represión.
    <br><br>
    El 7 de noviembre se rompe el pacto de silencio por primera vez:
    el ex militar Andrés Valenzuela confiesa las violaciones a los derechos humanos cometidas
    por los organismos represivos. Su testimonio será fundamental para las investigaciones contra los asesinos y torturadores.`;

} else if (v >= 1985 && v < 1986) {
    texto = `<p style="font-weight: bolder;">1985</p>
    Los días 28 y 29 de marzo son recordados por dos de los crímenes más atroces de la dictadura.
    El 28 son secuestrados y degollados José Manuel Parada, Manuel Guerrero y Santiago Nattino.
    La crueldad del asesinato conmueve al país. La investigación prueba la culpabilidad de funcionarios de Carabineros
    y es destituido su general. A los funerales asisten más de 15.000 personas.
    <br><br>
    El 29 de marzo, en la población Villa Francia de Santiago, son asesinados los hermanos Rafael y Eduardo Vergara Toledo.
    Este día se conmemora cada año como el Día del Joven Combatiente.
    <br><br>
    Durante el invierno se realizaran diversas convocatorias de protestas que aunarán a estudiantes, trabajadores, y pobladores.
    Serán asesianadas decenas de manifestantes, pero la gente se mantendrá en pie de lucha.
    <br><br>
    El 21 de noviembre se realiza la concentración más grande de la que se tenga memoria,
    bajo el lema "Chile exige democracia". Miles de manifestantes se reúnen en el Parque O'Higgins.`;

} else if (v >= 1986 && v < 1987) {
    texto = `<p style="font-weight: bolder;">1986</p>
    Los días 15 y 16 de abril los estudiantes secundarios lideran nuevamente las protestas,
    demostrando su valentía enfrentando la represión en las calles.
    A fines del mismo mes son allanadas nuevamente las poblaciones de la zona sur de Santiago.
    <br><br>
    En agosto, en Carrizal Bajo en la Cuarta Región, es desmantelado parte del operativo del Partido Comunista
    que ingresaba arsenales de armas para enfrentar al tirano. Varios otros cargamentos logran ingresar.
    <br><br>
    El 7 de septiembre es el día en que el FPMR casi logra asesinar al dictador.
    La comitiva de Pinochet es emboscada con ametralladoras y lanzacohetes en el Cajón del Maipo.
    El tirano se salva por poco, pero cinco de sus escoltas mueren.
    En venganza, Pinochet ordena el asesinato de militantes de distintas agrupaciones de izquierda.`;

} else if (v >= 1987 && v < 1988) {
    texto = `<p style="font-weight: bolder;">1987</p>
    El 1 de abril llega a Chile el Papa Juan Pablo II.La agrupación le presenta  
    documento con los casos de desaparecidos, esperando que el Pontífice intervenga públicamente. El Papa no se atreve, 
    La decepción es grande pero la organización no se detiene. 
    <br><br>
    El 15 de junio se produce la Operación Albania o Matanza del Corpus Christi,
    en la que son asesinados doce militantes del FPMR por la CNI.
    <br><br>
    En octubre los trabajadores salen nuevamente a las calles.`;

} else if (v >= 1988 && v < 1989) {
    texto = `<p style="font-weight: bolder;">1988 — El año del plebiscito</p>
    La Constitución de 1980 contempla la realización de un plebiscito este año.
    Muchos creen que la elección será manipulada, pero diversos partidos y organizaciones, incluyendo la agrupación de familiares de izquierda
    se unen para pelear la elección.
    <br><br>
    En agosto renace la Central Única de Trabajadores (CUT), reuniendo a las principales organizaciones obreras y sindicales del país.
    En septiembre se inicia la Franja Electoral. La campaña del NO coordina a las distintas agrupaciones de izquierda, en esta campaña la lucha de la agrupación de familiares sera un emblema inolvidable de la lucha.
    En octubre más de un millón de personas se reúnen en el Parque O'Higgins bajo el lema "¡Vamos a decir que NO!".
    <br><br>
    El 5 de octubre el pueblo sale masivamente a votar. Las agrupaciones de izquierda realizan un conteo paralelo
    para enfrentar la posible manipulación. A las 2:30 de la madrugada es reconocido el triunfo del NO.
    Las celebraciones comienzan en todo Chile. El 8 de octubre más de un millón de personas
    vuelven a las calles a celebrar. Comienza el retorno a la democracia.`;

} else if (v >= 1989 && v < 1990) {
    texto = `<p style="font-weight: bolder;">1989</p>
    A pesar de la victoria del No, la represión continúa. Durante este año siguen siendo asesinados
    chilenos y chilenas en manifestaciones y centros de detención.
    <br><br>
    Los partidos de izquierda se preparan para las elecciones y levantan a Patricio Aylwin como candidato,
    quien gana por mayoría absoluta las elecciones del 14 de diciembre.
    Tras 16 años de sangrienta dictadura, el año siguiente se retorna a la democracia.
    Sin embargo el tirano y los asesinos siguen impunes y cercanos al poder.
    La lucha por Verdad y Justicia continúa.`;

} else if (v >= 1990 && v < 1991) {
    texto = `<p style="font-weight: bolder;">1990</p>
    A pesar del retorno a la democracia aún no llega justicia para los familiares de ejecutados y desaparecidos, la lucha por la verdad y la justicia se mantiene firme. El 25 de abril se crea la Comisión Nacional de Verdad y Reconciliación,
    que inicia una rigurosa investigación sobre las violaciones a los derechos humanos durante la dictadura.La AFDD y la AFEP, que llevan años organizadas, entregan sus testimonios y archivos a la Comisión, siendo fuente fundamental de la investigación.<br>
    Pinochet se mantiene como comandante en jefe del Ejército, blindado por la Constitución que él mismo diseñó.`;

} else if (v >= 1991 && v < 1992) {
    texto = `<p style="font-weight: bolder;">1991</p>
    El 9 de febrero se entrega el Informe Rettig, primer reconocimiento oficial del Estado
    de las violaciones a los derechos humanos. En tres tomos y más de mil páginas se detallan
    las atrocidades del régimen. El informe identifica 2.279 víctimas.La AFDD rechaza el informe como insuficiente y exige justicia, no solo verdad. 
    <br>La Ley de Amnistía de 1978 sigue vigente y los tribunales la aplican para archivar causas.`;

} else if (v >= 1992 && v < 1993) {
    texto = `<p style="font-weight: bolder;">1992</p>
    Este año se promulga la Ley 19.123 que crea la Corporación Nacional de Reparación y Reconciliación,
    encargada de calificar los casos que el Informe Rettig no pudo resolver por falta de antecedentes.
    En diciembre cierra la Vicaría de la Solidaridad. Su archivo, que contiene décadas de denuncias, 
    es traspasado al Arzobispado. La AFDD queda sin su principal espacio de apoyo institucional pero continúa su lucha.`;

    

   } else if (v >= 1995 && v < 1996) {
    texto = `<p style="font-weight: bolder;">1995</p>
    Este año tuvo lugar la primera condena importante de la transición — el general Manuel Contreras, ex jefe de la DINA, y el brigadier Pedro Espinoza son condenados a 7 y 6 años
     de prisión respectivamente por el asesinato de Orlando Letelier. Si bien la condena es baja, marcó un presedente importante contra la impunidad
     La sentencia genera una grave crisis entre el gobierno y el Ejército.`

        } else if (v >= 1996 && v < 1997) {
    texto = `<p style="font-weight: bolder;">1995</p>
  a AFDD intensifica su presencia pública. Las rondas de familiares frente a La Moneda y 
  los tribunales se convierten en una imagen permanente de la lucha por justicia. 
  Los abogados de derechos humanos comienzan a preparar nuevas estrategias jurídicas para superar la Ley de Amnistía.`

            } else if (v >= 1997 && v < 1998) {
    texto = `<p style="font-weight: bolder;">1997</p>
    Se inaugura el Sitio de Memoria Parque por la Paz Villa Grimaldi, el principal centro de tortura de la DINA en Santiago,
     convertido en espacio de memoria. Es un hito en el reconocimiento físico de los crímenes de la dictadura.`

                 } else if (v >= 1998 && v < 1999) {
    texto = `<p style="font-weight: bolder;">1998</p>
En enero un grupo de abogados presenta la primera querella criminal contra Pinochet ante los tribunales chilenos.
 El 16 de octubre Pinochet es detenido en Londres por orden del juez español Baltasar Garzón, quien buscaba juzgarlo por el asesinato de ciudadanos españoles durante la dictadura.
 El hecho sacude al mundo y abre una nueva era en el derecho internacional de los derechos humanos.Para la AFDD y la AFEP es un momento histórico de emoción y esperanza después de 25 años de lucha. 
 Por primera vez el dictador enfrenta a la justicia`



       } else if (v >= 1999 && v < 2000) {
    texto = `<p style="font-weight: bolder;">1999</p>
El 24 de marzo el Tribunal de Apelaciones de la Cámara de los Lores británica ratifica que Pinochet no tiene inmunidad diplomática, sentando un precedente histórico en el d
erecho penal internacional sobre jurisdicción universal. El caso moviliza a los tribunales chilenos, que comienzan a aceptar más querellas.`

       } else if (v >= 2000 && v < 2001) {
    texto = `<p style="font-weight: bolder;">2000</p>
    El 2 de marzo el ministro del Interior británico libera a Pinochet por razones humanitarias debido a su estado de salud. A tres días de su retorno a Chile, el juez Juan Guzmán pide el desafuero de Pinochet, aprobado por la Corte de Apelaciones en junio y ratificado por la Corte Suprema en agosto, por su responsabilidad en la Caravana de la Muerte. 
    Es la primera vez que el dictador enfrenta formalmente la justicia en su propio país.<br><br>
    El juez Guzmán comienza las primeras exhumaciones de detenidos desaparecidos en Chile. 
    Al enfrentarse con los cuerpos de las víctimas crea la figura jurídica del secuestro permanente: mientras no aparezca el cuerpo el crimen sigue ocurriendo y no prescribe, 
    lo que hace inaplicable la Ley de Amnistía. Esta figura abre la puerta a cientos de causas.
`
       } else if (v >= 2003 && v < 2004) {
    texto = `<p style="font-weight: bolder;">2003</p>
 Se crea la Comisión Valech presidida por monseñor Sergio Valech, para investigar la tortura y la prisión política, 
 dimensión que el Informe Rettig no había abordado. La AFDD y la AFEP impulsan activamente la participación de los sobrevivientes en la comisión.
  Decenas de miles de personas se presentan a testimoniar.
  Para muchos es la primera vez que el Estado los escucha formalmente sobre lo que vivieron
`
       } else if (v >= 2004 && v < 2005) {
    texto = `<p style="font-weight: bolder;">2004</p>
El Informe Valech reconoce más de 28.000 víctimas de tortura y prisión política. El Estado se disculpa formalmente por primera vez con los torturados. 
Para la AFDD y la AFEP es un reconocimiento parcial, la verdad avanza pero la justicia sigue pendiente.
 El juez Guzmán revoca el sobreseimiento de Pinochet y lo procesa nuevamente por Villa Grimaldi.
`








    }

    

      if (texto === '') {
        contexto.style.display = 'none';
        if (frase) frase.style.display = 'block';
    } else {
        contexto.style.display = 'block';
        contexto.innerHTML = texto;
        contexto.style.top = '140px';

        if (texto.length > 1000) {
            if (frase) frase.style.display = 'none';
            contexto.style.top = '100px';
        } else {
            if (frase) frase.style.display = 'block';
            contexto.style.top = '140px';
        }
    }
}




var memorial = L.icon({ 
    iconUrl: './iconos/clavel.png', 
    iconSize: [35, 35],
    popupAnchor: [-1, -10]
});

var CCDD = L.icon({ 
    iconUrl: './iconos/detenido.png', 
    iconSize: [25, 25],
    popupAnchor: [-1, -10]
});

var ejecucion = L.icon({ 
    iconUrl: './iconos/rifle.png', 
    iconSize: [30, 30],
    popupAnchor: [-1, -10]
});

var invisible = L.icon({ 
    iconUrl: './iconos/detenido.png',
    iconSize: [0, 0],
    popupAnchor: [0, 0]
});


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Galeria
function ampliarFoto(src, galeria) {
    const fotos = Array.from(galeria.querySelectorAll('img')).map(img => img.src);
    let indice = fotos.indexOf(src);

    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.90);z-index:3000;display:flex;align-items:center;justify-content:center;';

    const btnClose = document.createElement('button');
    btnClose.textContent = '✕';
    btnClose.style.cssText = 'position:absolute;top:20px;right:20px;background:none;border:none;color:white;font-size:32px;cursor:pointer;';

    const btnPrev = document.createElement('button');
    btnPrev.textContent = '‹';
    btnPrev.style.cssText = 'position:absolute;left:60px;background:none;border:none;color:white;font-size:48px;cursor:pointer;';

    const img = document.createElement('img');
    img.style.cssText = 'max-width:85%;max-height:85vh;border-radius:8px;box-shadow:0 4px 20px rgba(0,0,0,0.5);';

    const btnNext = document.createElement('button');
    btnNext.textContent = '›';
    btnNext.style.cssText = 'position:absolute;right:60px;background:none;border:none;color:white;font-size:48px;cursor:pointer;';

    const counter = document.createElement('div');
    counter.style.cssText = 'position:absolute;bottom:20px;color:white;font-family:Arial;font-size:14px;opacity:0.7;';

    overlay.append(btnClose, btnPrev, img, btnNext, counter);

    function actualizar() {
        img.src = fotos[indice];
        counter.textContent = (indice + 1) + ' / ' + fotos.length;
        btnPrev.style.opacity = indice === 0 ? '0.2' : '1';
        btnPrev.style.pointerEvents = indice === 0 ? 'none' : 'auto';
        btnNext.style.opacity = indice === fotos.length - 1 ? '0.2' : '1';
        btnNext.style.pointerEvents = indice === fotos.length - 1 ? 'none' : 'auto';
    }

    function cerrar() { overlay.remove(); document.removeEventListener('keydown', onKey); }

    function onKey(e) {
        if (e.key === 'ArrowLeft'  && indice > 0)                { indice--; actualizar(); }
        if (e.key === 'ArrowRight' && indice < fotos.length - 1) { indice++; actualizar(); }
        if (e.key === 'Escape')                                   { cerrar(); }
    }

    btnClose.onclick = cerrar;
    btnPrev.onclick  = function() { if (indice > 0)                { indice--; actualizar(); } };
    btnNext.onclick  = function() { if (indice < fotos.length - 1) { indice++; actualizar(); } };
    document.addEventListener('keydown', onKey);

    actualizar();
    document.body.appendChild(overlay);
}

function initgalerias() {
    document.querySelectorAll('.galeria').forEach(function(galeria) {
        const items = galeria.querySelectorAll('img, video, iframe');
        if (items.length === 0) return;

        // Si ya fue inicializada, solo resetear
if (galeria.closest('.galeria-contenedor')) {
    items.forEach(item => item.classList.remove('activa'));
    items[0].classList.add('activa');
    const contador = galeria.querySelector('.galeria-contador');
    const desc = galeria.closest('.galeria-contenedor').querySelector('.galeria-descripcion');
    if (contador) contador.innerHTML = items.length > 1 ? `1 / ${items.length}` : '';
    if (desc) desc.innerHTML = items[0].dataset.descripcion || '';
    
    // ← actualizar visibilidad flechas al resetear
    const prevBtn = galeria.closest('.galeria-wrapper')?.querySelector('.galeria-prev');
    const nextBtn = galeria.closest('.galeria-wrapper')?.querySelector('.galeria-next');
    if (prevBtn) prevBtn.style.visibility = 'hidden';
    if (nextBtn) nextBtn.style.visibility = items.length === 1 ? 'hidden' : 'visible';
    return;
}

        // Primera vez: construir estructura
        items.forEach(item => item.classList.remove('activa'));
        let indice = 0;
        items[0].classList.add('activa');

        const contenedor = document.createElement('div');
        contenedor.className = 'galeria-contenedor';

        const wrapper = document.createElement('div');
        wrapper.className = 'galeria-wrapper';

        const prev = document.createElement('button');
        prev.className = 'galeria-prev';
        prev.innerHTML = '‹';

        const next = document.createElement('button');
        next.className = 'galeria-next';
        next.innerHTML = '›';

        const contador = document.createElement('div');
        contador.className = 'galeria-contador';

        const descripcion = document.createElement('div');
        descripcion.className = 'galeria-descripcion';

function actualizar() {
    items.forEach(item => {
        item.classList.remove('activa');
        if (item.tagName === 'VIDEO') item.pause();
        if (item.tagName === 'IFRAME') {
            const src = item.src;
            item.src = '';
            item.src = src;
        }
    });
    items[indice].classList.add('activa');

   const esVideo = items[indice].tagName === 'VIDEO' || items[indice].tagName === 'IFRAME';
const esIframe = items[indice].tagName === 'IFRAME';
const esRetrato = items[indice].classList && items[indice].classList.contains('retrato'); // ← agrega esto
contenedor.style.width = esVideo ? (esIframe ? '100%' : 'fit-content') : (esRetrato ? '350px' : 'fit-content');
contenedor.style.margin = '10px auto';
wrapper.style.width = esVideo ? (esIframe ? '100%' : 'fit-content') : (esRetrato ? '350px' : 'fit-content');
galeria.style.width = esIframe ? '100%' : (esRetrato ? '500px' : 'fit-content');

            contador.innerHTML = items.length > 1 ? `${indice + 1} / ${items.length}` : '';
     prev.style.visibility = indice === 0 ? 'hidden' : 'visible';
next.style.visibility = indice === items.length - 1 ? 'hidden' : 'visible';
            descripcion.innerHTML = items[indice].dataset.descripcion || '';
            if (items.length === 1) {
    prev.style.visibility = 'hidden';
    next.style.visibility = 'hidden';
}
        }

        prev.onclick = e => { e.stopPropagation(); if (indice > 0) { indice--; actualizar(); } };
        next.onclick = e => { e.stopPropagation(); if (indice < items.length - 1) { indice++; actualizar(); } };

        items.forEach(item => {
            if (item.tagName === 'IMG') {
                item.onclick = () => ampliarFoto(item.src, galeria);
            }
        });

        galeria.parentNode.insertBefore(contenedor, galeria);
        contenedor.appendChild(wrapper);
        wrapper.appendChild(prev);
        wrapper.appendChild(galeria);
        wrapper.appendChild(next);
        galeria.appendChild(contador);
        contenedor.appendChild(descripcion);
        actualizar();
    });
}
//////////////////////////////////////////////////////////////

// Galeria Video



// =============================================
// ARRAY GLOBAL DE MARCADORES
// =============================================
var markers = [];

// =============================================
// FUNCIÓN DE FILTRO POR AÑO
// =============================================
function filtrarMarcadores(anioSeleccionado) {
    markers.forEach(function(m) {
        if (Math.round(m.anio * 100) <= Math.round(anioSeleccionado * 100)) {
            if (!mapa.hasLayer(m)) m.addTo(mapa);
            if (m.anioMemorial) {
                if (anioSeleccionado >= m.anioMemorial) {
                    m.setIcon(memorial);
                    if (m.contenidoMemorial && m._panelAbierto) {
                        document.getElementById('info-content').innerHTML = m.contenidoMemorial;
                    }
                } else {
                    m.setIcon(m.iconoInicial || ejecucion);
                    if (m.contenidoOriginal && m._panelAbierto) {
                        document.getElementById('info-content').innerHTML = m.contenidoOriginal;
                    }
                }
            }
        } else {
            if (mapa.hasLayer(m)) mapa.removeLayer(m);
        }
    });
}

//==========================================================================================================================================================
                   //EJECUCIONES
//==========================================================================================================================================================


// Puente Pilmaiquén
var markerpilmaiken = L.marker([-40.383681, -73.002411], {icon: ejecucion});
markerpilmaiken.anio = 1973.1;
markerpilmaiken.anioMemorial = 2017.2;
markerpilmaiken.iconoInicial = ejecucion;

markerpilmaiken.on('click', function() {
    const anioSlider = parseFloat(document.getElementById('slider-anio').value);

    let contenido, anioTexto;

    if (anioSlider >= 2017.2) {
        contenido = `<h3>Memorial Puente Pilmaiquén</h3>
       <div class="galeria">
               <iframe src="https://www.youtube.com/embed/QBHuxbtYRV0" frameborder="0" allowfullscreen></iframe>
        </div>
        <p>El puente Pilmaiquén fue un espacio en el que decenas de campesinos, dirigentes y
pobladores de Osorno, San Pablo, La Unión y Río Bueno fueron torturados, estacados,
degollados, amarrados con alambres de púa y fusilados por personal militar.
<br><br>
En la ribera sur poniente del río Pilmaiquén, el 11 de septiembre de 2017, se
dieron cita familiares de ejecutados, detenidos desaparecidos, ex presos políticos
y personas vinculadas a la promoción y defensa de los derechos humanos para
inaugurar oficialmente un Mural denominado “En memoria a los caídos en 1973".
La organización de esta actividad estuvo a cargo de la “Agrupación de Familiares de
Detenidos Desaparecidos y Ejecutados Políticos de Osorno" con la colaboración de la
Corporación de DD. HH Pilmaiquén y ex presos políticos de la zona (principalmente
de las comunas de Río Bueno, La Unión, Osorno, Entre Lagos y Valdivia).
<br><br>
De acuerdo al Informe Rettig, entre los casos de ejecutados en el puente
Pilmaiquén se señala el del 7 de septiembre de 1973, donde fue detenido por
Carabineros de la Comisaría de Rahue, previo al Golpe de Estado y a la salida de la
Penitenciaría de Osorno, César Osvaldo del Carmen Ávila Lara de 36 años, Director
Provincial de Educación y militante del Partido Socialista. Tras su arresto fue subido
a un furgón institucional y trasladado a la comisaría. Hubo varios testigos de su
detención. Desde esa fecha no se ha sabido de su paradero. Mientras en el cuartel
policial se negó siempre a su arresto, un testimonio recibido por la comisión permite
presumir que su cuerpo habría sido arrojado al río Pilmaiquén.
<br><br>
El 19 de septiembre de 1973 se ejecuta en el puente sobre el río
Pilmaiquén a Raúl Santana Alarcón de 29 años, auxiliar de la Universidad de
Chile, sede Osorno; Dirigente vecinal, Presidente del Comité de pobladores sin
casa y militante del Partido Socialista y de José Mateo Vidal Panguilef de 26 años,
obrero y militante socialista. 
<br><br>
El 29 de septiembre de ese mismo año, también fue detenido junto a su hermano
y en su domicilio de Osorno, Gustavo Bernardo Igor Sporman de 22 años, estudiante
y militante comunista. Sus aprehensores fueron carabineros de la 3º Comisaría de
Rahue, quienes le golpearon duramente al momento de su detención, llevándolo
inconsciente al cuartel policial. Meses después, el 14 de enero de 1974, el cuerpo sin
vida de la víctima apareció en la morgue, pudiendo ser reconocido por la familia, la
que se enteró por el parte policial que había sido hallado en el río Pilmaiquén.
<br><br>
En este lugar inauguraron un Memorial la Agrupación de Familiares de Detenidos
Desaparecidos de Osorno. Está en el límite regional y evidencia una estrategia usada
para desaparecer cuerpos de personas en la dictadura. </p>
<p style="font-style: italic; text-align: right;">Ruta de la memoria</p>


        <p>En 2022 se inauguró el memorial en el Puente Pilmaiquén en homenaje a Raúl Santana Alarcón y José Mateo Vidal Panguilef, ejecutados el 19 de septiembre de 1973.</p>
`;
        anioTexto = '';
    } else {
        contenido = `<h3>Puente Pilmaiquén</h3>
        <div class="galeria">
        <img src="./galerias/sin_foto.webp" data-descripcion="Luis Sergio Aros Huichachan<br> 29 años, Obrero, y militante del PS" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
        <img src="./galerias/sin_foto.webp" data-descripcion="Joel Fierro Inostroza<br> 50 años, Obrero Maderero, Ex regidor de Entre Lagos, y militante del PS" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
        <img src="./galerias/sin_foto.webp" data-descripcion="Raúl Santana Alarcón<br> 30 años, Regidor de Entre Lagos, y militante del PS" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
        <img src="./galerias/sin_foto.webp" data-descripcion="Raúl Santana Alarcón<br> 33 años, Funcionario de la ECA, y militante del PS" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
        <img src="./galerias/memoriales/pilmaiquen/santana_raul.webp" data-descripcion="Raúl Santana Alarcón<br> 29 años, Funcionario universitario y militante del PS" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
            <img src="./galerias/memoriales/pilmaiquen/jose_mateo_vidal_panguilef.webp" data-descripcion="José Mateo Segundo Vidal Panguilef<br> 26 años, Carpintero y militante del PS" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
        </div>
        <p style="font-style: italic; text-align: justify;"> "El 18 de Septiembre de 1973 fueron ejectuados en el puente colgante sobre el río Pilmaiquén, cuatro personas, que hasta esa fecha permanecían detenidas en la Unidad de Carabineros de Entre Lagos:
<br><br>
<a href="https://www.memoriaviva.com/detenidos-desaparecidos/aros-huichacan-luis" target="_blank">Luis Sergio Aros Huichachan</a>, 24 años, obrero, socialista<br>
<br><a href="https://www.memoriaviva.com/detenidos-desaparecidos/fierro-inostroza-joel" target="_blank">Joel Fierro Inostroza</a>, 50 años, obrero maderero, ex regidor de Entre Lagos, socialista<br>
<br><a href="https://www.memoriaviva.com/detenidos-desaparecidos/huenuman-huenuman-jose-ricardo" target="_blank">José Ricardo Huenuman Huenuman</a>, 30 años, regidor de Entre Lagos, socialista<br>
<br><a href="https://www.memoriaviva.com/detenidos-desaparecidos/nunez-rosas-martin" target="_blank">Martín Nuñez Rosas</a>, 33 años, funcionario de la ECA, socialista<br>
<br>
Los cuatro fueron detenidos por personal de carabineros de Entre Lagos, junto a la Alcadesa de la ciudad, el dia 17 de septiembre de 1973 y llevados al cuartel policial,
donde se dejo en un calabozo a los 4 hombres, y en otro a la Alcaldesa. Alrededor de la 00:10 horas del dia 18 de septiembre de 1973, todos fueron sacados de los calabozos hacia la calle,
donde se encontraron con una fila de individuos vestidos de civil, de negro, con máscaras de vampiro cubriéndoles los rostros<br>
<br>
Los detenidos fueron subidos a un vehículo de propiedad de un civil de la zona y conducidos hasta el río Pilmaiquén, cerca de Osorno. En ese lugar los hicieron bajar del furgón y entrar al puente, pimero la Alcadesa y tras ella,
los otros cuatro. Allí los cinco, arrodillados y mirando hacia el río, fueron ejecutados cada uno por un individuo que se ubicó detras de cada cual y cayeron a las aguas.
La Alcaldesa logró salir con vida al no ser herida mortalmente y ponder nadar por el río hasta un lugar no vigilado. Los cadáveres de los otros cuatro nunca fueron hallados."
</p>
<br>
       <p> "El 19 de septiembre de 1973 fueron ejecutados en el puente sobre el Río Pilmaiquén, por carabineros pertenecientes a la Comisaría de Rahue:
<br>
       <br> <a href="https://memoriaviva.com/ejecutados-politicos/santana-alarcon-raul" target="_blank">Raúl Santana Alarcón</a>, 29 años, auxiliar de la Universidad de Chile, sede Osorno; Dirigente vecinal, Presidente del Comité de pobladores sin casa y militante del Partido Socialista.<br>
       <br> <a href="https://memoriaviva.com/detenidos-desaparecidos/vidal-panguilef-jose" target="_blank">José Mateo Vidal Panguilef</a>, 26 años, obrero, militante socialista.
        <br><br>El día 16 de septiembre de 1973 por un Bando emitido por radio se llamó a presentarse a ambos ante las nuevas autoridades. Al día siguiente, horas después de que fueran allanados sus domicilios, decidieron presentarse y, en compañía de la cónyuge de Santana, se dirigieron al domicilio de un oficial de la Tercera Comisaría de Rahue, Osorno. 
        Este los dejó en su casa de calle Manuel Rodríguez, de la ciudad de Osorno. 
      Desde allí fueron trasladados a la Tercera Comisaría de Rahue, donde fueron vistos por testigos entre el 17 y 19 de septiembre de 1973. <br><br>El día 19 fueron sacados de dicha unidad policial y conducidos al puente sobre el Río Pilmaiquén, lugar donde se les dio muerte mediante disparos que carabineros les hicieron, tras hacerlos correr.<br>Los cuerpos de Santana y Vidal fueron encontrados en el mes de enero de 1974 en el Río Pilmaiquén."</p>
        <p style="font-style: italic; text-align: right;">Informe Rettig p 401-403</p>`;
        anioTexto = '18 y 19 de Septiembre de 1973';
    }

    setAnio(anioTexto);
    markerpilmaiken._panelAbierto = true;
    openPanel(
        contenido, null, 
        `<h3>Expedientes</h3>
        <div style="text-align: center; margin-top: 15px;">
            <a href="https://expedientesdelarepresion.cl/causa/episodio-rahue-31-victimas" target="_blank">
                <img src="./iconos/logo-expedientes-de-la-represion.png" style="max-width: 80%;">
            </a>
        </div>
        <br><p>
        El caso conocido como Episodio Rahue (roles 1673-2003, 1686-13, 17-2012) da cuenta de las 31 victimas que pasaron por la 3ra comisaria de Rahue,
        dentro de los prisioneros algunos fueron desaparecidos, otros ejecutados, y otros solo torturados. 
        
    Existe un sentencia de 2014 que condena a: <br><br>
   <a href="https://www.memoriaviva.com/criminales/fernandez-hernandez-adrian-jose" target="_blank">Adrián José Fernández Hernández</a>, Coronel de carabineros <br>
   <a href="https://www.memoriaviva.com/criminales/garcia-german" target="_blank">Germán Garía Romero</a>, Sargento de carabineros <br>
   <a href="https://www.memoriaviva.com/criminales/munoz-albornoz-gustavo-del-carmen" target="_blank">Gustavo Muñoz Albornoz</a>, Sargento 1° de carabineros <br> 
   <a href="https://www.memoriaviva.com/criminales/perez-torres-rafael" target="_blank">Rafael Pérez Torres</a>, Sargento 1° de carabineros <br> 
   </p>
   `
    );
});

markers.push(markerpilmaiken);


// Puente Nilahue
var markernilahue = L.marker([-40.285166, -72.171522], {icon: ejecucion});
markernilahue.anio = 1973.2;
markernilahue.on('click', function() {
    setAnio(' 20 de Septiembre de 1973');
    openPanel(
        `<h3>Puente Nilahue</h3>
             <div class="galeria">
        
         <img src="./galerias/sin_foto.webp"data-descripcion="Roberto Eder Huaiqui Barria<br> 17 años, Estudiante secundario y militante del PS" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
 </div>
         <p style="font-style: italic;">"El 20 de septiembre de 1973, fue muerto <a href="https://memoriaviva.com/detenidos-desaparecidos/huaiqui-barria-roberto" target="_blank">Roberto Eder Huaiqui Barria</a> 17
años,  hijo  del  presidente  comunal  campesino  de  Lago  Ranco,  estudiante
secundario, militante socialista. <br><br>
El afectado había salido de Lago Ranco el 11 de septiembre de 1973, junto a otras
personas, con la intención de cruzar la cordillera para dirigirse a Argentina.
Cuando iban cruzando el río Nilahue, les dispararon desde una avioneta tripulada
por civiles, dándole muerte e hiriendo en la espalda a uno de los acompañantes,
quien fue recogido y llevado a un hospital.  El cuerpo sin vida de Roberto Huaiqui
cayó al río y fue impulsado aguas abajo por la corriente, sin que pudiese ser
recuperado.
"</p>
<p style="font-style: italic; text-align: right;"> Informe Rettig p 389 </p><br>`,
null, 
        `<h3>Expedientes</h3> <br><a href="https://www.pjud.cl/prensa-y-comunicaciones/noticias-del-poder-judicial/135423" target="_blank">Corte de Temuco confirma condena de carabineros (r) por homicidios de jóvenes en Lago Ranco (2025)</a>
        <br>
        <br><a href="https://share.google/I8rnjZC6M5u6UgVsv" target="_blank">Causa Rol N° 2-2014.- Sentencia dictada por el Ministro en Visita Extraordinaria, don Álvaro Mesa Latorre</a>
        `,
       
    );
});

markers.push(markernilahue);



var markerllancahue = L.marker([-39.848117, -73.197300], {icon: ejecucion});
markerllancahue.anio = 1973.3;
markerllancahue.anioMemorial = 2017;
markerllancahue.iconoInicial = ejecucion;

markerllancahue.on('click', function() {
    const anioSlider = parseFloat(document.getElementById('slider-anio').value);

    let contenido, anioTexto;

    if (anioSlider >= 2017) {
        contenido = `<h3>Memorial de Llancahue</h3>
            <p>   <div class="galeria">
               <iframe src="https://www.youtube.com/embed/u5DLXrgTTKg" frameborder="0" allowfullscreen></iframe>
        </div></p>`;
        anioTexto = '2017 - Inauguración Memorial de Llancahue';
    } else if (anioSlider >= 2004) {
        contenido = `<h3>Primeros pasos para el memorial de LLancahue</h3>

         <div class="galeria">
                

<img src="./galerias/memoriales/llancahue/llancahue_2004.jpg" data-descripcion="Victor Eugenio Rudlof Reyes <br> 32 años, Obrero Maderero."onclick="ampliarFoto(this.src, this.closest('.galeria'))">
    </div>

        `;
        anioTexto = 'Llancahue 2004';
    } else {
        contenido = `<h3>Ejecuciones caso Neltume</h3>
                <div class="galeria">
                
                           <video data-descripcion="Video del memorial" controls>
        <source src="./galerias/memoriales/llancahue/ReelNeltume.mp4" type="video/mp4">
    </video>

    <img src="./galerias/memoriales/llancahue/barria_ordonez_pedro_purisimo.webp"data-descripcion="Pedro Purisimo Barria Ordoñez<br> 22 años, estudiante." onclick="ampliarFoto(this.src, this.closest('.galeria'))">
    <img src="./galerias/memoriales/llancahue/barrientos_warner_jos_ren.webp" data-descripcion="Jose René Barrientos Warner<br> 29 años, Estudiante<br> Musico de la cámara de orquesta UACH " onclick="ampliarFoto(this.src, this.closest('.galeria'))">
    <img src="./galerias/memoriales/llancahue/guzmn_soto_enrique_del_carmen.webp" data-descripcion="Luis Enrique del Carmen Guzmán Soto<br> 21 años, Obrero maderero." onclick="ampliarFoto(this.src, this.closest('.galeria'))">
    <img src="./galerias/memoriales/llancahue/krauss-iturra-victor-fernando-scaled.webp"data-descripcion="Fernando Krauss Iturra <br> 24 años, Estudiante."  onclick="ampliarFoto(this.src, this.closest('.galeria'))">
    <img src="./galerias/memoriales/llancahue/liendo_jose.webp"data-descripcion="Jose Gregorio Liendo Vera <br> 28 años, Estudiante." onclick=" ampliarFoto(this.src, this.closest('.galeria'))">
    <img src="./galerias/memoriales/llancahue/santiago_segundo_garcia_morales.webp" data-descripcion= "Santiago Segundo García Morales<br>26 años, Obrero Maderero." onclick="ampliarFoto(this.src, this.closest('.galeria'))">
    <img src="./galerias/memoriales/llancahue/luis_hernan_pezo_jara.webp" data-descripcion="Luis Gernán Pezo Jara<br>29 años, Obrero Maderero." onclick="ampliarFoto(this.src, this.closest('.galeria'))">
    <img src="./galerias/memoriales/llancahue/luis_mario_valenzuela_ferrada.webp" data-descripcion="Luis Mario Valenzuela Ferrada <br> 20 años, Obrero Maderero." onclick="ampliarFoto(this.src, this.closest('.galeria'))">
    <img src="./galerias/memoriales/llancahue/saavedra_munoz_victor_segundo.webp" data-descripcion="Victor Segundo Saavedra Muñoz <br> 19 años, Obrero Maderero" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
    <img src="./galerias/memoriales/llancahue/saavedra_bahamondes_rudemir.webp" data-descripcion="Rudemir Saavedra Bahamodes, 29 años, Obrero Maderero." onclick="ampliarFoto(this.src, this.closest('.galeria'))">
    <img src="./galerias/memoriales/llancahue/sergio_jaime_bravo_aguilera.webp" data-descripcion="Sergio Jaime Bravo Aguilera, 21 años, Obrero Maderero" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
    <img src="./galerias/memoriales/llancahue/victor_eugenio_rudolph_reyes.webp" data-descripcion="Victor Eugenio Rudlof Reyes <br> 32 años, Obrero Maderero."onclick="ampliarFoto(this.src, this.closest('.galeria'))">
    </div>
        <p style="font-style: italic;">"Los días 3 y 4 de octubre de 1973, fueron ejecutados en cumplimiento de una sentencia del Consejo de Guerra de Valdivia, las siguientes personas, en su mayoría militantes del MIR-MCR, todos acusados de asaltar el retén de carabineros de Neltume el dia 12 de septiembre de 1973:
        <br> 
<br> <a href="https://memoriaviva.com/nuevaweb/detenidos-desaparecidos/desaparecidos-b/barria-ordonez-pedro-purisimo/" target="_blank">Pedro Purísimo Barria Ordóñez</a>, 22 años 
<br> <a href="https://memoriaviva.com/nuevaweb/detenidos-desaparecidos/desaparecidos-b/barrientos-warner-jose-rene/" target="_blank">José René Barrientos Warner</a>, 29 años
<br> <a href="https://memoriaviva.com/nuevaweb/detenidos-desaparecidos/desaparecidos-b/bravo-aguilera-sergio-jaime/" target="_blank">Sergio Jaime Bravo Aguilera</a>, 21 años
<br> <a href="https://memoriaviva.com/nuevaweb/detenidos-desaparecidos/desaparecidos-b/garcia-morales-santiago-segundo/" target="_blank">Santiago Segundo Garcia Morales</a>, 26 años
<br> <a href="https://memoriaviva.com/nuevaweb/detenidos-desaparecidos/desaparecidos-b/liendo-vera-jose-gregorio/" target="_blank">José Gregorio Liendo Vera "Comandante Pepe"</a>, 28 años 
<br> <a href="https://memoriaviva.com/nuevaweb/detenidos-desaparecidos/desaparecidos-b/guzman-soto-luis-enrique-del-carmen/" target="_blank">Luis Enrique del Carmen Guzman Soto</a>, 21 años
<br> <a href="https://memoriaviva.com/nuevaweb/detenidos-desaparecidos/desaparecidos-b/krauss-iturra-victor-fernando/" target="_blank">Fernando Krauss Iturra</a>, 24 años
<br> <a href="https://memoriaviva.com/nuevaweb/detenidos-desaparecidos/desaparecidos-b/pezo-jara-luis-hernan" target="_blank">Luis Hernán Pezo Jara</a>, 29 años
<br> <a href="https://memoriaviva.com/nuevaweb/detenidos-desaparecidos/desaparecidos-b/rudolf-reyes-victor-eugenio/" target="_blank">Víctor Eugenio Rudolf Reyes</a>, 32 años
<br> <a href="https://memoriaviva.com/nuevaweb/detenidos-desaparecidos/desaparecidos-b/saavedra-bahamondes-rudemir/" target="_blank">Rudemir Saavedra Bahamondes</a>, 29 años
<br> <a href="https://memoriaviva.com/nuevaweb/detenidos-desaparecidos/desaparecidos-b/saavedra-munoz-victor-segundo/" target="_blank">Víctor Segundo Saavedra Muñoz</a>, 19 años
<br> <a href="https://memoriaviva.com/nuevaweb/detenidos-desaparecidos/desaparecidos-b/valenzuela-ferrada-luis-mario/" target="_blank">Luis Mario Valenzuela Ferrada</a>, 20 años
<br><br>Múltiples versiones de prensa de la época hacen referencia a la tramitación de este
Consejo de Guerra.  Una comunicación oficial de sus ejecuciones señala que se
les habría acusado de varios delitos, entre ellos, el asalto al Retén de Neltume."</p>
        <p style="font-style: italic; text-align: right;">Informe Rettig p 389</p>`;
        anioTexto = 'Caso Neltume 3 y 4 de octubre de 1973';
    }

    setAnio(anioTexto);
    markerllancahue._panelAbierto = true;
    openPanel(
        contenido,
       null,
        `<h3>Expedientes</h3>
        <div style="text-align: center; margin-top: 15px;">
            <a href="https://expedientesdelarepresion.cl/causa/caso-caravana-episodio-valdivia/" target="_blank">
                <img src="./iconos/logo-expedientes-de-la-represion.png" style="max-width: 80%;">
            </a>
        </div>
<br> <p> El 2023 se firma la sentencia final del Caso Neltume(Roles 122163-2020, 2070-2018, 2182-98), donde fueron asesinados 12 obreros del complejo forestal y maderero Panguipulli
        Los condenados por estas ejecuciones son:<br>
        <a href="https://www.memoriaviva.com/criminales/de-la-mahotiere-gonzalez-emilio-robert" target="_blank">Emilio Robert de la Mahotiere González</a>, Coronel del Ejercito
        <a href="https://www.memoriaviva.com/criminales/sinclair-oyaneder-santiago-arturo-ariel-de-jesus" target="_blank">Santiago Arturo Sinclair Oyaneder</a>, General, Comandante del Regimiento Cazadores de Valdivia, e integrante de la junta militar.
        <a href="https://www.memoriaviva.com/criminales/chiminelli-fullerton-juan-viterbo" target="_blank">Juan Viterbo Chiminelli Fullerton</a>, Coronel del Ejercito, miembro de la DINA.
        <a href="https://www.memoriaviva.com/criminales/espinoza-bravo-pedro-octavio" target="_blank">Pedro Octavio Espinoza Bravo</a>, Brigadier del Ejercito miembro de la DINA.
       </p>
        `
    );
});


markers.push(markerllancahue);

// Catamutun
var markercatamutun = L.marker([-40.15691150211494, -73.12944129156637], {icon: ejecucion});
markercatamutun.anio = 1973.31;
markercatamutun.on('click', function() {
    setAnio('4 de Octubre de 1973');
    openPanel(
        `
        <h3>Catamutun</h3>

                      <div class="galeria">
         <img src="./galerias/sin_foto.webp"data-descripcion="Reinaldo Segundo Huentequeo Almonacid<br> 28 años, Agricultor y militante del PC" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
        </div>

        <p><a href="https://www.memoriaviva.com/ejecutados-politicos/jaramillo-figueroa-osvaldo-segundo" target="_blank">Osvaldo Jaramillo Figueroa</a>
    murió ese día por fusilamiento, según el Certificado de Defunción, el que no consigna la hora de su fallecimiento.
<br><br>
Según declaraciones de testigos, Osvaldo Jaramillo -simpatizante de la Unidad Popular-
 fue detenido el 4 de octubre por carabineros de la Tercera Comisaría de La Unión, en el sector de Catamutún,
  luego que no respondiera a un llamado de las autoridades de la época para presentarse en la unidad policial mencionada.
<br><br>
En dicho recinto se encontraban detenidas otras cinco personas, acusadas de participar en la elaboración del supuesto Plan Z.
 Estos detenidos narraron después que vieron el cadáver de Osvaldo Jaramillo Figueroa en el interior de un jeep institucional.
<br><br>
La inscripción de su muerte se hizo por orden del Cuarto Juzgado Militar de Valdivia.</p>
        <p style="font-style: italic; text-align: right;">Informe Valech p 411</p>`, `<h3>Expedientes</h3>`
    );
});

markers.push(markercatamutun);






// Aerodromo Las Marías
var markerlasmarias = L.marker([-39.800118, -73.244429], {icon: ejecucion});
markerlasmarias.anio = 1973.4;
markerlasmarias.anioMemorial = 2017.1;
markerlasmarias.iconoInicial = ejecucion;

markerlasmarias.on('click', function() {
    const anioSlider = parseFloat(document.getElementById('slider-anio').value);

    let contenido, anioTexto;

    if (anioSlider >= 2017.1) {
        contenido = `<h3>Memorial Aeródromo Las Marías</h3>
            <p></p>`;
        anioTexto = '';
    } else {
        contenido = `<h3>Ejecución Aerodromo las Marías</h3>
                     <div class="galeria">
                    <img src="./galerias/memoriales/lasmarias/chico-carreno-.png" data-descripcion="Victor Hugo Carreño Zuñiga<br>
                    21 años, estudiante y presidente regional de las Juventudes Socialistas." onclick="ampliarFoto(this.src, this.closest('.galeria'))">
    </div>
        <p style="font-style: italic;">"El 5 de octubre de 1973 fue muerto en Valdivia, por personal del Ejército,
        <a href="https://memoriaviva.com/nuevaweb/ejecutados-politicos/ejecutados-politicos-c/carreno-zuniga-victor-hugo/" target="_blank">Victor Hugo Carreño Zuñiga</a>, 21 años, estudiante, Presidente Regional de la Juventud Socialista. La prensa informó que fue muerto, en horas de toque de queda, cuando se arrancó
de la patrulla militar que lo llevaba detenido.
Se ha acreditado ante esta Comisión que esta persona fue detenida en su
domicilio, ante testigos, el día 4 de octubre de 1973 por funcionarios del Ejército."</p>
        <p style="font-style: italic; text-align: right;">Informe Rettig p 390</p>`;
        anioTexto = '5 de octubre de 1973';
    }

    setAnio(anioTexto);
    markerlasmarias._panelAbierto = true;
    openPanel(
        contenido,
       null,
        `<h3>Expedientes</h3>
        <div style="text-align: center; margin-top: 15px;">
            <a href="https://expedientesdelarepresion.cl/causa/victor-hugo-carreno-zuniga/" target="_blank">
                <img src="./iconos/logo-expedientes-de-la-represion.png" style="max-width: 80%;">
            </a>
        </div>
        El 2021 se dicta la sentencia de la causa de Victor Hugo Carreño Zuñiga (roles 33551-2018, 4-2010-V, 494-2018) condenando a:
        <br> 
        <a href="https://www.memoriaviva.com/criminales/aguirre-mendiboure-marco-augusto" target="_blank">Marco Augusto Aguirre Mendiboure</a>, Teniente Coronel del Ejército
        `
    );
});

markers.push(markerlasmarias);




// Pishuinco
var markerpishuinco = L.marker([-39.80460433742437, -73.05672623841112], {icon: ejecucion});
markerpishuinco.anio = 1973.41;
markerpishuinco.on('click', function() {
    setAnio('5 de octubre de 1973');
    openPanel(
        `<h3>Pishuinco</h3>

        <div class="galeria">
        <img src="./galerias/sin_foto.webp"data-descripcion="Bienvenido Molina Monsalve, 28 años, obrero forestal, Militante de Partido Socialista" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
        </div>


        <p>
         <a href="https://memoriaviva.com/ejecutados-politicos/molina-monsalve-bienvenido" target="_blank">Bienvenido Molina Monsalve</a> murió 
         ese día por asfixia por ahorcamiento, según consigna el Certificado de Defunción y el Protocolo de Autopsia.
murió ese día en Valdivia en el río Calle-Calle, por asfixia por sumersión en agua, según consigna el Certificado de Defunción.
<br><br>
Molina Monsalve fue detenido a fines del mes de septiembre de 1973, 
en la mañana, en su domicilio ubicado en el sector de Pishuinco, en Valdivia, por carabineros de Valdivia
 y de Huellelhue que llegaron en búsqueda de un conocido militante socialista de la zona, prófugo. 
 <br><br>
 En la oportunidad, fue intensamente interrogado acerca del paradero de la persona buscada. Los carabineros decidieron
  esperar al buscado en el domicilio, obligando a toda a la familia a permanecer con ellos en arresto domiciliario.

Cerca del mediodía, un grupo de carabineros dejaron el lugar con Bienvenido
 Molina para se suponía que éste fuera a cobrar su sueldo. Desde entonces,
  la familia no supo de su paradero, 
hasta que un mes después fueron avisados por terceros que 
su cuerpo se encontraba en el Instituto Médico Legal.
<p style="font-style: italic; text-align: right;">Informe Rettig</p>
     `,
        ``
    );
});

markers.push(markerpishuinco);


// Fundo Collico
var markercollico = L.marker([-39.82373072344541, -73.19953241478078], {icon: ejecucion});
markercollico.anio = 1973.42;
markercollico.on('click', function() {
    setAnio('6 de octubre de 1973');
    openPanel(
        `<h3>Fundo Collico</h3>

        <div class="galeria">
        <img src="./galerias/sin_foto.webp"data-descripcion=" Heriberto Henriquez Burgos 64 años, Obrero, Casado, Militante del Partico Comunista" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
        </div>


        <p>
         <a href="https://www.memoriaviva.com/ejecutados-politicos/henriquez-burgos-heriberto" target="_blank">Heriberto Henriquez Burgos</a> murió ese día por asfixia por ahorcamiento, según consigna el Certificado de Defunción y el Protocolo de Autopsia.
Heriberto Henríquez, de militancia comunista, estuvo desaparecido desde el 6 de octubre de 1973
 hasta el 13 de octubre de 1973, día en que fue encontrado al interior del fundo Collico en Valdivia, 
 colgado de un árbol con el cuerpo ligeramente inclinado y los pies tocando la
superficie del suelo. Según carabineros que concurrieron al lugar, encontraron junto a 
él una nota que explicaba la razón de su autoeliminación.
<br><br>
De acuerdo con lo declarado por familiares, Heriberto Henríquez desapareció después que 
saliera de su domicilio en la población Los Jazmines, en dirección a su trabajo. La noche 
anterior les había expresado un gran temor y preocupación debido a que en su lugar de trabajo militares 
habían detenido a tres trabajadores que públicamente -como él- habían expresado ser partidarios de la Unidad Popular.
 Esta situación lo tenía muy angustiado, 
pues estas personas habían sido interrogadas bajo tortura y temía que le sucediera lo mismo.
<br><br>Considerando los antecedentes reunidos y la investigación hecha por esta Corporación, el Consejo Superior, si bien no pudo determinar las circunstancias precisas de su muerte, concluyó que ésta, hubiera o no sido por suicidio, se produjo como consecuencia directa e inmediata del acoso y del legítimo temor de que no se les respetaran sus derechos básicos. Por tal razón, declaró que Heriberto Henríquez Burgos fue víctima de la violencia política imperante en la época de su fallecimiento.
</p>
<p style="font-style: italic; text-align: right;">Informe Rettig</p>
`,
    );
});

markers.push(markercollico);


// Siscahue
var markersiscahue = L.marker([-40.205396, -72.103042], {icon: ejecucion});
markersiscahue.anio = 1973.43;
markersiscahue.iconoInicial = ejecucion;
markersiscahue.on('click', function() {
    setAnio('7 de Octubre de 1973');
    openPanel(
        `<h3>Ejecución de Sischahue</h3>
        
                               <div class="galeria">
        <img src="./galerias/sin_foto.webp"data-descripcion="Andrés Silva Silva<br> 33 años, Obrero maderero" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
</div>
        <p style="font-style: italic;">"El día 7 de octubre de 1973 fue ejecutado por personal del Ejército, 
        <a href="https://memoriaviva.com/nuevaweb/ejecutados-politicos/ejecutados-politicos-s/silva-silva-andres/" target="_blank">Andres Silva Silva</a>, 33 años, obrero maderero en el Complejo Maderero y Forestal Panguipulli.
        El afectado fue detenido en el hogar de sus padres, el día 6 de octubre de 1973,
por un contingente militar que se lo llevaron a un Fundo del Sector de Nilahue.
Al día siguiente, los mismos militares lo condujeron a su domicilio y allanaron el
lugar.  Posteriormente fue ejecutado en el sector denominado Sichahue, y su
cuerpo sin vida abandonado en un pequeño bosque de ese lugar. <br><br> Carabineros de
Llifén prohibió darle sepultura y los familiares, después de dos meses, decidieron
inhumarlo, contra las órdenes, en razón de que los perros ya habían destrozado
completamente el cuerpo.  En la causa tramitada por el Ministro en Visita sobre
los hechos de Chihuío se exhumaron sus restos."</p>
        <p style="font-style: italic; text-align: right;">Informe Rettig p 390</p>`
    );
});

markers.push(markersiscahue);

// Ñancul Alto
var markernancul = L.marker([-39.749328, -72.431395], {icon: ejecucion});
markernancul.anio = 1973.44;

markernancul.on('click', function() {
    setAnio('7 de octubre 1973');
    openPanel(
        `<h3>Ñancul Alto</h3>
<div class="galeria">
  <img src="./galerias/memoriales/nancul/cofre__atril.webp"data-descripcion="Juana del Carmen Cofré Catril <br>22 años, empleada domestica" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
   </div>
        <p style="font-style: italic;">"<a href="https://memoriaviva.com/nuevaweb/ejecutados-politicos/ejecutados-politicos-c/cofre-catril-juana-del-carmen/" target="_blank">Juana del Carmen Cofre Catril</a> de 22 años, 
        era empleada administrativa en el Complejo Maderero y Forestal Panguipulli y militante del Partido Socialista.
        <br><br>Se encontraba oculta en la localidad de Huellelhe, dentro del Complejo, pues estaba siendo intensamente
buscada por las autoridades militares de Valdivia, acusada de realizar actos subversivos.  De acuerdo a los
antecedentes recabados, se habría suicidado en Huellelhue, presionada por la situación en que se encontraba, y
habría sido enterrada por terceras personas en un lugar cercano.
La Comisión no pudo formarse convicción sobre su calidad de víctima por no haber podido confirmar este
hecho."
</a></p>
        <p style="font-style: italic; text-align: right;">Informe Rettig p 1165</p>
        
        <div class="galeria">
               <iframe src="https://www.youtube.com/embed/RdeOdUxUgk0" frameborder="0" allowfullscreen></iframe>
        </div>
        
        
        `,
       null, null,
    );
});

markers.push(markernancul);


// Casa Administración Fundo Chihuio
var markerchihuio = L.marker([-40.194129, -71.935565], {icon: ejecucion});
markerchihuio.anio = 1973.5;
markerchihuio.iconoInicial = ejecucion;
markerchihuio.on('click', function() {
    const anioSlider = parseFloat(document.getElementById('slider-anio').value);

    if (anioSlider >= 2000) {
        setAnio('26 de Julio de 2000 - Exhumación Caso Chihuío');
        openPanel(
            `<h3>Exhumación Caso Chihuío - Juez Guzmán</h3>
            <p></p>`,
            ``,
            `<h3>Expedientes</h3>
        <div style="text-align: center; margin-top: 15px;">
            <a href="https://expedientesdelarepresion.cl/causa/episodio-chihuio/" target="_blank">
                <img src="./iconos/logo-expedientes-de-la-represion.png" style="max-width: 80%;">
            </a>
        </div>`
        );
    } else if (anioSlider >= 1990) {
        setAnio('15 de Diciembre de 1990');
        openPanel(
            `<h3>Querella y Exhumación del Caso Chihuío</h3>

                                                          <div class="galeria">
        <img src="./galerias/memoriales/chihuio/osamentas_chihuio.jpg"data-descripcion="Exhumación en Chihuio" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
     <img src="./galerias/memoriales/chihuio/osamentas_chihuio_2.jpg"data-descripcion="Exhumación en Chihuio" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
</div>
<p>La Vicaría de la Solidaridad y la Pastoral de Derechos Humanos del Obispado de Valdivia interpusieron una querella criminal en contra de quienes resulten responsables
de lo que se conocería como Caso Chihuío, es decir, el asesinato de 17 obreros forestales del COFOMAP y un menor de edad.
Para esta querella fueron revisadas las fosas donde fueron enterrados los ejecutados, esta querella fue llevada por el ministro Nibaldo Segura, quién fallecio esta semana.</p>
<p>"Los familiares empezaron a hacer la denuncia y aquí es donde aparece el apoyo de la Vicaría (de la Solidaridad) y del
CODEPU, pero quien hace esa denuncia fue Elisa Hernández;
y de quien se atrevió a hablar directamente de los familiares,
fue la señora Purísima Martínez, viuda de José Orlando Barriga.
Ellas fueron quienes hicieron la denuncia y ahí este caso llegó a la corte.[...]
Nibaldo Segura. El ministro hace la exhumación de las fosas del caso Chihuío, pero antes, toma la denuncia de
la víctima que fue muerto a mitad de camino, en Sichahue, que es Andrés Silva Silva. Fue lo primero que hizo de camino
a Chihuío el ministro Nibaldo Segura y le dieron sepultura.
Luego sacan los restos del caso Chihuío, los traen a Valdivia, los velan en la iglesia San Francisco y se realizan los funerales."</p>
<p style="font-style: italic; text-align: right;">Ida Sepúlveda, presidenta de la AFEP-AFDD Valdivia</p>`,
        
            `<h3>Expedientes</h3>
        <div style="text-align: center; margin-top: 15px;">
            <a href="https://expedientesdelarepresion.cl/causa/episodio-chihuio/" target="_blank">
                <img src="./iconos/logo-expedientes-de-la-represion.png" style="max-width: 80%;">
            </a>
        </div>`
        );
    } else if (anioSlider >= 1978) {
        setAnio('15 de Diciembre de 1978');
        openPanel(
            `<h3>Operación Retiro de Televisores</h3>

          <div class="galeria">
               <iframe src="https://www.youtube.com/embed/G3EtcgEh7Mg" frameborder="0" allowfullscreen></iframe>
        </div>

        <p>En los primeros años de la dictadura, cuando el régimen aún negaba la existencia de los detenidos desaparecidos, cada secuestro de opositores consideró siempre la destrucción de registros documentales que permitieran dilucidar el destino final de las víctimas. Esos intentos de borrar evidencias alcanzaron, a fines de 1978, un nivel de maldad difícil de dimensionar: desenterrar los cuerpos sepultados en fosas clandestinas para arrojarlos al mar desde aviones o quemarlos en hornos o tambores. Bajo el nombre clave de Operación Retiro de Televisores,
         el plan condenó a los familiares de las víctimas a una dolorosa búsqueda que se ha prolongado por casi medio siglo.</p>
        <p style="font-style: italic; text-align: right;">Mauricio Weibel Barahona CiperChile</p>

        En el marco de la operación retiro de televisores en 1978 fueron retirados de las fosas los restos de los asesinados en la matanza de Chihuio
    `,
            ``,
            `<h3>Expedientes</h3>
        <div style="text-align: center; margin-top: 15px;">
            <a href="https://expedientesdelarepresion.cl/causa/episodio-chihuio/" target="_blank">
                <img src="./iconos/logo-expedientes-de-la-represion.png" style="max-width: 80%;">
            </a>
        </div>`
        );
    } else {
    setAnio('Caso Chihuio 9 de Octubre de 1973');
    openPanel(
        `<h3>Ejecuciones de <a href="https://memoriaviva.com/nuevaweb/centros-de-detencion/x-region/casa-de-administracion-del-fundo-chihuio/" target="_blank">Fundo Chihuio</a></h3>
         

 


                       <div class="galeria">
              <video data-descripcion="Video del memorial" controls>
        <source src="./galerias/memoriales/chihuio/ChihuioReel.mp4" type="video/mp4">
    </video>
           <img class="retrato" src="./galerias/memoriales/chihuio/ferrada_sandoval_luis_arnoldo.webp"data-descripcion="Luis Arnoldo Ferrada Sandoval<br> 42 años, Obrero agrícola" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
           <img src="./galerias/memoriales/chihuio/cortes_jose.webp"data-descripcion="José Rosamel Cortes Díaz<br> 35 años, Obrero maderero" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
           <img src="./galerias/sin_foto.webp"data-descripcion="Neftalí Rubén Duran Zuñiga<br> 22 años, Obrero maderero" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
           <img src="./galerias/memoriales/chihuio/freire_caamao_eliacer_sigisfredo.webp"data-descripcion="Eliecer Sigisfredo Freire Camaño<br> 20 años, Obrero maderero" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
           <img src="./galerias/memoriales/chihuio/gonzlez_delgado_juan_walter.webp"data-descripcion="Juan Walter González Delgado<br> 31 años, Obrero Forestal, y militante del PS" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
           <img src="./galerias/memoriales/chihuio/pedreros_ferreira_pedro_segundo.webp"data-descripcion="Pedro Segundo Pedreros Ferreira<br> 48 años, Obrero" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
           <img src="./galerias/memoriales/chihuio/rebolledo_mndez_rosendo.webp"data-descripcion="Rosendo Rebolledo Méndez<br> 40 años, Obrero maderero" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
           <img src="./galerias/memoriales/chihuio/ruiz_ricardo.webp"data-descripcion="Ricardo Segundo Ruiz Rodriguez<br> 24 años, Obrero y militante del PS" onclick="ampliarFoto(this.src, this.closest('.galeria'))">          
           <img src="./galerias/memoriales/chihuio/salinas_flores_carlos_vicente.webp"data-descripcion="Carlos Vicente Salinas Flores<br> 21 años, Radio operador" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
           <img src="./galerias/sin_foto.webp"data-descripcion="Manuel Jesús Sepúlveda Rebolledo<br> 28 años, Obrero maderero" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
           <img src="./galerias/memoriales/chihuio/acua_insotroza_carlos_maximiliano.webp"data-descripcion="Carlos Maximiliano Acuña Inostroza <br> 46 años, Obrero maderero" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
           <img src="./galerias/memoriales/chihuio/garca_cancino_narciso_segundo.webp"data-descripcion="Narciso Segundo Cancino Garcia <br> 31 años, Obrero Maderero y militante del PS" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
           <img src="./galerias/memoriales/chihuio/mendez_daniel.webp"data-descripcion="Daniel Mendez Mendez <br> 42 años, Obrero maderero" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
           <img src="./galerias/sin_foto.webp"data-descripcion="Fernando Adrián Mora Gutierrez<br> 17 años, Obrero maderero" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
           <img src="./galerias/sin_foto.webp"data-descripcion="Sebastián Mora Osses<br> 47 años, Obrero maderero" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
           <img src="./galerias/memoriales/chihuio/vargas_ruben.webp"data-descripcion="Rubén Vargas Quezada<br>56 años, Obrero" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
           <img src="./galerias/memoriales/chihuio/barriga_soto_jos_orlando.webp"data-descripcion="José Orlando Barriga Soto<br>32 años, Herrero" onclick="ampliarFoto(this.src, this.closest('.galeria'))"> 
     </div>


<p style="font-style: italic; text-align: justify;"> "El 9 de Octubre de 1973, en el sector denominado Baños de Chihuío, personal del
Ejército dio muerte a las siguientes personas, en su mayoría miembros del
Sindicato Campesino Esperanza del Obrero:

<br>   
<br> <a href="https://memoriaviva.com/nuevaweb/ejecutados-politicos/ejecutados-politicos-f/ferrada-sandoval-luis-arnoldo/" target="_blank">Luis Arnaldo Ferrada Sandoval</a>, 42 años.
<br> <a href="https://memoriaviva.com/nuevaweb/ejecutados-politicos/ejecutados-politicos-a/acuna-inostroza-carlos-maximiliano/" target="_blank">Carlos Maximiliano Acuña Inostroza</a>, 46 años.
<br> <a href="https://www.memoriaviva.com/ejecutados-politicos/barriga-soto-jose-orlando" target="_blank">José Orlando Barriga Soto</a> de 32 años
<br> <a href="https://www.memoriaviva.com/ejecutados-politicos/cortes-dias-jose-rosamel" target="_blank">José Rosamel Cortes Diaz</a> de 35 años
<br> <a href="https://memoriaviva.com/nuevaweb/ejecutados-politicos/ejecutados-politicos-d/duran-zuniga-neftali-ruben/" target="_blank">Rubén Neftalí Duran Zuñiga</a> de 22 años
<br> <a href="https://memoriaviva.com/nuevaweb/ejecutados-politicos/ejecutados-politicos-f/freire-caamano-eliecer-sigisfredo/" target="_blank">Eliacer Sigisfredo Freire Camaño</a> de 20 años
<br> <a href="https://memoriaviva.com/nuevaweb/ejecutados-politicos/ejecutados-politicos-g/garcia-cancino-narciso-segundo/" target="_blank">Narciso Segundo Garcia Cancino</a> de 31 años.
<br> <a href="https://memoriaviva.com/nuevaweb/ejecutados-politicos/ejecutados-politicos-g/gonzalez-delgado-juan-walter/" target="_blank">Juan Walter Gonzalez Delgado </a> de 31 años.
<br> <a href="https://memoriaviva.com/nuevaweb/ejecutados-politicos/ejecutados-politicos-m/mendez-mendez-daniel/" target="_blank">Daniel Mendez Mendez</a> de 42 años
<br> <a href="https://www.memoriaviva.com/ejecutados-politicos/mora-gutierrez-fernando-adrian" target="_blank">Fernando Adrián Mora Gutierrez</a> de 17 años
<br> <a href="https://memoriaviva.com/nuevaweb/ejecutados-politicos/ejecutados-politicos-m/mora-osses-sebastian/" target="_blank">Sebastián Mora Osses</a> de 47 años
<br> <a href="https://memoriaviva.com/nuevaweb/ejecutados-politicos/ejecutados-politicos-p/pedreros-ferreira-pedro-segundo/" target="_blank">Pedro Segundo Prederos Ferreira</a>, de 48 años
<br> <a href="https://memoriaviva.com/nuevaweb/ejecutados-politicos/ejecutados-politicos-r/rebolledo-mendez-rosendo/" target="_blank">Rosendo Rebolledo Mendez</a> de 40 años
<br> <a href="https://memoriaviva.com/nuevaweb/ejecutados-politicos/ejecutados-politicos-r/ruiz-rodriguez-ricardo-segundo/" target="_blank">Ricardo Segundo Ruiz Rodriguez</a> de 24 años
<br> <a href="https://memoriaviva.com/nuevaweb/ejecutados-politicos/ejecutados-politicos-s/salinas-flores-carlos-vicente/" target="_blank">Carlos Vicente Salinas Flores</a> de 21 años
<br> <a href="https://memoriaviva.com/nuevaweb/ejecutados-politicos/ejecutados-politicos-s/sepulveda-rebolledo-manuel-jesus/" target="_blank">Manuel Jesús Sepulveda Rebolledo</a> de 28 años
<br> <a href="https://memoriaviva.com/nuevaweb/ejecutados-politicos/ejecutados-politicos-v/vargas-quezada-ruben/" target="_blank">Rubén Vargas Quezada, 56 años</a>

<br><br>
  Ese día 9 de octubre, un convoy militar procedente de los Regimientos Cazadores
y Maturana, ambos con asiento en la ciudad de Valdivia, compuesto por varios
vehículos entre jeeps y camiones y con una dotación aproximada de noventa
personas, inició una caravana hacia el Sector Sur del Complejo Maderero
Panguipulli.<br>
En  las  localidades  de  Chabranco,  Curriñe,  Llifén  y  Futrono  los  militares
detuvieron desde sus domicilios o lugares de trabajo, o recibieron de manos de
Carabineros, a los campesinos antes indicados.<br>
<br>La noche del mismo 9 de octubre de 1973 se les condujo a un fundo de propiedad
de un civil en el sector cordillerano denominado Baños de Chihuío.  En una hora
no precisada, los prisioneros fueron sacados de la casa patronal de ese fundo y
llevados a las inmediaciones a una distancia aproximada de 500 metros, lugar en
el cual se les ejecutó.<br>
Al día siguiente, esto es, el 10 de octubre de 1973, un testigo reconoció en ese
lugar a varias de las víctimas y pudo percibir que la mayoría los cuerpos tenían
cortes en las manos, en los dedos, en el estómago e incluso algunos se
encontraban degollados y con sus testículos cercenados, sin poder observar
huellas de impactos de bala en los restos.<br><br>
Los cadáveres de los ejecutados permanecieron en el lugar de su ejecución
durante   varios   días,   cubiertos   tan   sólo   con   algunas   ramas   y   troncos.
Aproximadamente unos quince días después de la ejecución, fueron enterrados
por los efectivos militares en fosas de diferentes dimensiones.<br><br>
En fecha que no es posible precisar, pero que podría corresponder a fines del año
1978 o principios de 1979, en horas de la noche, personas de civil llegaron hasta
la casa patronal del Fundo Chihuío y exigieron al dueño que les indicara el lugar
en que se encontraban las fosas.  Estos civiles, asociados de otros que les
acompañaban,  excavaron  durante  toda  la  noche  en  el  lugar  de  las  fosas,
trasladando los restos a un lugar que hasta la fecha de este informe ha sido
imposible de determinar.<br><br>
La circunstancia del fallecimiento de las personas ejecutadas en la localidad de
Chihuío  consta  inexplicablemente  en  certificados  de  defunción,  sin  haber
existido© entrega de cadáver ni sepultación.  En todos ellos se indica que la data
de fallecimiento es de fecha 9 de octubre de 1973, en la localidad de "Liquiñe",
por causas no precisadas, acreditándose el fallecimiento mediante el testimonio de
dos personas singulares (testigos de la defunción)."
</p>
        <p style="font-style: italic; text-align: right;">Informe Rettig p 390-392</p>
        `,
       null, 
        `<h3>Expedientes</h3>
        <div style="text-align: center; margin-top: 15px;">
            <a href="https://expedientesdelarepresion.cl/causa/episodio-chihuio/" target="_blank">
                <img src="./iconos/logo-expedientes-de-la-represion.png" style="max-width: 80%;">
            </a>
        </div>
        
        En 2011 se dicta la sentencia por el Episodio Chihuio (roles 2182-98, 2715-2008, 8314-2009), donde fueron asesinados 17 campesinos del sector. 
        Los condenados por estas ejeciciones son:
        <a href="https://www.memoriaviva.com/criminales/osorio-garardazanic-luis-alberto" target="_blank">Luis Alberto Osorio Garardazanic</a> Brigadier del Ejertcito, miembro de la DINA.
        <a href="https://www.memoriaviva.com/criminales/osses-chavarria-luis-eduardo" target="_blank">Luis Osses Chavarría</a> Brigadier del Ejertcito, miembro de la DINA.


        `
    );
    }
});

markers.push(markerchihuio);

// Ejecucion Rio Tolten
var markerliquine = L.marker([-39.2748409, -72.2310227], {icon: ejecucion});
markerliquine.anio = 1973.6;
markerliquine.anioMemorial = 2008.1;
markerliquine.iconoInicial = ejecucion;

markerliquine.on('click', function() {
    const anioSlider = parseFloat(document.getElementById('slider-anio').value);
    let contenido, anioTexto;

    if (anioSlider >= 2008.1) {
        contenido = `<h3>Memorial Paseo Herido</h3>
        <p>En 2008 se inauguró el memorial en el puente sobre el Río Toltén, en homenaje a las 15 víctimas
         del Caso Liquiñe, ejecutadas el 10 de octubre de 1973 y cuyos cuerpos fueron arrojados a las aguas del río.
                 <div class="galeria">

            <iframe src="https://www.youtube.com/embed/OhZj6yLDPi4" frameborder="0" allowfullscreen></iframe>
        </div>
         
         
         
         </p>`;
        anioTexto = '2008 - Memorial Río Toltén / Caso Liquiñe';
    } else {
        contenido = `<h3>Ejecuciones Río Toltén</h3>    
        <div class="galeria">
       <video data-descripcion="Video del memorial" controls>
        <source src="./galerias/memoriales/liquine/Liquinereel.mp4" type="video/mp4">
    </video>


    <img src="./galerias/memoriales/liquine/alamos_rubilar_salvador.webp" data-descripcion="Salvador Alamos Rubirlar,<br> 45 años, industrial, militante del Partido Socialista, detenido en Liquiñe" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
    <img src="./galerias/sin_foto.webp" data-descripcion="José Héctor Bórquez Levicán <br>, 30 años, obrero maderero, Jefe de faenas del fundo Trafún, miembro del MCR, detenido en Trafún" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
    <img src="./galerias/memoriales/liquine/castro_daniel.webp" data-descripcion="Daniel Antonio Castro López <br> 68 años, comerciante, militante del Partido Socialista, detenido en Liquiñe" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
    <img src="./galerias/sin_foto.webp" data-descripcion="Carlos Alberto Cayumán Cayumán <br> 21 años, obrero maderero, vinculado al MCR, detenido en Trafún." onclick="ampliarFoto(this.src, this.closest('.galeria'))">
    <img src="./galerias/memoriales/liquine/mauricio_curinanco.webp" data-descripcion="Mauricio Segundo Curiñanco Reyes <br> 38 años, artesano carpintero, militante del Partido Socialista, detenido en Liquiñe" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
    <img src="./galerias/memoriales/liquine/figueroa_zapata_carlos_segundo.webp" data-descripcion="Carlos Segundo Figueroa Zapata, 46 años, obrero maderero, consejero del Sindicato Campesino Esperanza del Obrero del COFOMAP, militante del Partido Socialista, detenido en Paimún" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
    <img src="./galerias/memoriales/liquine/fuentealba_caldern_isaas_jos.webp" data-descripcion="Isaías José Fuentealba Calderón<br> 29 años, Jefe de área del COFOMAP en el fundo Trafún, miembro del MCR.<br> Fue detenido en Liquiñe, cuando se dirigía a su domicilio" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
    <img src="./galerias/sin_foto.webp" data-descripcion="Luis Armando Lagos Torres <br> 50 años, obrero maderero del COFOMAP, militante del Partido Socialista, detenido en Carranco" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
    <img src="./galerias/sin_foto.webp" data-descripcion="Alberto Segundo Reinante Raipán<br> 29 años, obrero maderero del COFOMAP, miembro del MCR, detenido en Trafún." onclick="ampliarFoto(this.src, this.closest('.galeria'))">
    <img src="./galerias/memoriales/liquine/reinante_ernesto.webp" data-descripcion="Ernesto Reinante Raipán, 29 años, obrero maderero del COFOMAP, miembro del MCR, detenido en Trafún." onclick="ampliarFoto(this.src, this.closest('.galeria'))">
    <img src="./galerias/memoriales/liquine/reinante_modesto.webp" data-descripcion="Modesto Juan Reinante Raipán <br>18 años, obrero maderero del COFOMAP, miembro del MCR, detenido en Trafún" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
    <img src="./galerias/sin_foto.webp" data-descripcion="Luis Alfredo Rivera Catricheo <br> 54 años, obrero maderero del COFOMAP, sin militancia política, detenido en Paimún" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
    <img src="./galerias/sin_foto.webp" data-descripcion="Alejandro Antonio Tracanao Pincheira<br> 22 años, obrero maderero del COFOMAP, vinculado al MCR, detenido en Trafún" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
    <img src="./galerias/sin_foto.webp" data-descripcion="Miguel José Tracanao Pincheira <br> 25 años, obrero maderero del COFOMAP, vinculado al MCR, detenido en Trafún" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
    <img src="./galerias/memoriales/liquine/tracanao_pincheira_eliseo_maximiliano.webp" data-descripcion="Eliseo Maximiliano Tracanao Valenzuela <br> 18 años, obrero maderero del COFOMAP, vinculado al MCR, detenido en Trafún" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
    </div>
        <p style="font-style: italic; text-align: justify;">"El 10 de octubre de 1973, entre las 21:00 y las 23:00 horas, fueron detenidas en el
sector de Liquiñe, dentro del Complejo Maderero y Forestal Panguipulli, las
siguientes personas:
<br><br>
 <a href="https://memoriaviva.com/detenidos-desaparecidos/alamos-rubilar-salvador" target="_blank">Salvador Alamos Rubilar</a>, 45 años<br> 
 <a href="https://memoriaviva.com/detenidos-desaparecidos/borquez-levican-jose-hector" target="_blank">José Héctor Bórquez Levicán</a>, 30 años<br> 
 <a href="https://memoriaviva.com/detenidos-desaparecidos/castro-lopez-daniel-antonio" target="_blank">Daniel Antonio Castro López</a>, 68 años<br> 
 <a href="https://memoriaviva.com/detenidos-desaparecidos/cayuman-cayuman-carlos-alberto" target="_blank">Carlos Alberto Cayumán Cayumán</a>, 31 años<br> 
 <a href="https://memoriaviva.com/detenidos-desaparecidos/curinanco-reyes-mauricio-segundo" target="_blank">Mauricio Segundo Curiñanco Reyes</a>, 38 años<br> 
 <a href="https://memoriaviva.com/detenidos-desaparecidos/figueroa-zapata-carlos-segundo" target="_blank">Carlos Segundo Figueroa Zapata</a>, 46 años<br> 
 <a href="https://memoriaviva.com/detenidos-desaparecidos/fuentealba-calderon-isaias-jose" target="_blank">Isaías José Fuentealba Calderón</a>, 29 años<br> 
 <a href="https://memoriaviva.com/detenidos-desaparecidos/lagos-torres-luis-armando" target="_blank">Luis Armando Lagos Torres</a>, 50 años<br> 
 <a href="https://memoriaviva.com/detenidos-desaparecidos/reinante-raipan-alberto-segundo" target="_blank">Alberto Segundo Reinante Raipán</a>, 39 años<br> 
 <a href="https://memoriaviva.com/detenidos-desaparecidos/reinante-raipan-ernesto" target="_blank">Ernesto Reinante Raipán</a>, 29 años<br> 
 <a href="https://memoriaviva.com/detenidos-desaparecidos/reinante-raipan-modesto-juan" target="_blank">Modesto Juan Reinante Raipán</a>, 18 años<br> 
 <a href="https://memoriaviva.com/detenidos-desaparecidos/rivera-catricheo-luis-alfredo" target="_blank">Luis Alfredo Rivera Catricheo</a>, 54 años<br> 
 <a href="https://memoriaviva.com/detenidos-desaparecidos/tracanao-pincheira-alejandro-antonio" target="_blank">Alejandro Antonio Tracanao Pincheira</a>, 22 años<br> 
 <a href="https://memoriaviva.com/detenidos-desaparecidos/tracanao-pincheira-miguel-jose" target="_blank">Miguel José Tracanao Pincheira</a>, 25 años<br>  
 <a href="https://memoriaviva.com/detenidos-desaparecidos/tracanao-pincheira-eliseo-maximiliano" target="_blank">Eliseo Maximiliano Tracanao Valenzuela</a>, 18 años<br> 
<br><br>
Actuaron divididos en varios grupos, que se juntaron en el cruce de Coñaripe. Allí tomaron el
camino a Villarrica y en el puente sobre el río Toltén, les dieron muerte y arrojaron sus cuerpos a las aguas."</p>
<p style="font-style: italic; text-align: right;"> Informe Rettig p 393 </p>`;
        anioTexto = 'Caso Liquiñe 10 de octubre de 1973';
    }

    setAnio(anioTexto);
    markerliquine._panelAbierto = true;
    openPanel(
        contenido,
       null,
        `<h3>Expedientes</h3>
        <div style="text-align: center; margin-top: 15px;">
            <a href="https://expedientesdelarepresion.cl/causa/episodio-liquine/" target="_blank">
                <img src="./iconos/logo-expedientes-de-la-represion.png" style="max-width: 80%;">
            </a>
        </div>
     <p>>
        El 2908 se dicta la sentencia de la matanza de Liquiñe (roles 2136-2006, 2182-98, 4662-2007), donde fueron hechos desaparece 15 trabajadores del complejo forestal y maderero Panguipulli.
        La sentencia condeno a  
        <a href="https://www.memoriaviva.com/criminales/guerra-jorquera-hugo-alberto" target="_blank">Hugo Alberto Guerra Jorquera</a>, Coronel del Ejercito , y a 
        <a href="https://www.memoriaviva.com/criminales/garcia-guzman-luis-osvaldo" target="_blank">Luis Alberto García Guzmán</a>, empresario hotelero, dueño de las termas de Liquiñe.
</p>
        `
    );
});
markers.push(markerliquine);


//Puente Pichoy
var markerpichoy = L.marker([-39.686294, -73.101902], {icon: ejecucion});
markerpichoy.anio =  1973.7;
markerpichoy.anioMemorial = 2000.1;
markerpichoy.iconoInicial = ejecucion;
markerpichoy.on('click', function() {

    const anioSlider = parseFloat(document.getElementById('slider-anio').value);

    let contenido, anioTexto;

    if (anioSlider >= 1994) {
        contenido = `<h3>Memorial Puente Pichoy</h3>
        <div class="galeria">
          <iframe src="https://www.youtube.com/embed/F6DBK9Oi5Eo" frameborder="0" allowfullscreen></iframe>
    <img src="./galerias/memoriales/pichoy/pichoy_1.jpg" data-descripcion="" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
    <img src="./galerias/memoriales/pichoy/pichoy_2.jpg" data-descripcion="" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
    <img src="./galerias/memoriales/pichoy/pichoy_3.jpg" data-descripcion="" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
     <img src="./galerias/memoriales/pichoy/pichoy_4.jpg" data-descripcion="" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
    </div>`;
        anioTexto = 'Memorial Puente Pichoy';
    } else {

 contenido=
        `<h3>Ejecuciones Puente Pichoy</h3>
                                     <div class="galeria">
                <img src="./galerias/memoriales/pichoy/arriagada_corts_jos_manuel.webp"data-descripcion="José Manuel Arriagada Cortés<br> 19 años, Suplementero y militante del PC" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
                <img src="./galerias/memoriales/pichoy/arriagada-zuiga-jose-gabriel.webp"data-descripcion="José Gabriel Arriagada Zuñiga<br> 30 años, Topógrafo, y militante del PS" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
               <img src="./galerias/memoriales/pichoy/gilberto_antonio_ortega_alegria.webp"data-descripcion="Gilberto Antonio Ortega Alegría<br> 39 años, Empleado y militante del PS" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
                <img src="./galerias/sin_foto.webp"data-descripcion="José Manuel Carrasco Torres<br> 43 años, Contador y militante del PC" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
            </div>

        <p style="font-style: italic;">"El día 12 de octubre de 1973, en el Puente Pichoy, Valdivia, fueron ejecutados
por carabineros, tres de las siguientes personas, mientras la otra falleció producto
de las torturas recibidas:<br>

<br><a href="https://memoriaviva.com/nuevaweb/ejecutados-politicos/ejecutados-politicos-a/arriagada-cortes-jose-manuel/" target="_blank">José Manuel Arriagada Cortes</a>, 19 años
<br><a href="https://memoriaviva.com/nuevaweb/ejecutados-politicos/ejecutados-politicos-a/arriagada-zuniga-jose-gabriel/" target="_blank">José Gabriel Arriagada Zuñiga</a>, 30 años
<br><a href="https://memoriaviva.com/nuevaweb/ejecutados-politicos/ejecutados-politicos-c/carrasco-torres-jose-manuel/" target="_blank">José Manuel Carrasco Torres</a>, 19 años
<br><a href="https://memoriaviva.com/nuevaweb/ejecutados-politicos/ejecutados-politicos-o/ortega-alegria-gilberto-antonio/" target="_blank">Gilberto Antonio Ortega Alegria</a>, 39 años

<br><br>Todos ellos fueron detenidos el día 10 de octubre de 1973 por Carabineros de
Malalhue y de Lanco, y conducidos al Retén de Malalhue, siendo trasladados
posteriormente a la Tenencia de Lanco, donde permanecieron hasta el día 12 de
octubre de 1973.  <br><br>En dicho recinto, producto de las torturas, falleció <a href="https://memoriaviva.com/nuevaweb/ejecutados-politicos/ejecutados-politicos-o/ortega-alegria-gilberto-antonio/" target="_blank">Gilberto Antonio Ortega Alegria</a>, en presencia de testigos.  Al cabo de pocas horas, los
otros tres detenidos y el cuerpo de Ortega fueron sacados de la Tenencia para ser
trasladados a Valdivia.<a href="https://memoriaviva.com/nuevaweb/ejecutados-politicos/ejecutados-politicos-a/arriagada-zuniga-jose-gabriel/" target="_blank">José Gabriel Arriagada Zuñiga</a> fue amarrado con <a href="https://memoriaviva.com/nuevaweb/ejecutados-politicos/ejecutados-politicos-a/arriagada-cortes-jose-manuel/" target="_blank">José Manuel Arriagada Cortes</a>, y <a href="https://memoriaviva.com/nuevaweb/ejecutados-politicos/ejecutados-politicos-c/carrasco-torres-jose-manuel/" target="_blank">José Manuel Carrasco Torres</a> con el cuerpo de Ortega.
Al llegar al Puente Pichoy, los detenidos fueron ejecutados.  Todos los cuerpos
registraban múltiples impactos de bala.  <br><br>Sus restos fueron entregados a sus
familiares para su sepultación.  Versiones verbales entregadas a las familias por
autoridades de Carabineros dieron como razón de la muerte el que los detenidos
habrían intentado fugarse, sin dar explicaciones mas circunstanciadas sobre ello.
<p style="font-style: italic; text-align: right;"> Informe Rettig p 394 </p>`;
        anioTexto = 'Caso Pichoy 12 de Octubre de 1973';
    }

    setAnio(anioTexto);
    markerpichoy._panelAbierto = true;
    openPanel(
        contenido,
       null, 
        `<h3>Expedientes</h3>
        <div style="text-align: center; margin-top: 15px;">
            <a href="https://expedientesdelarepresion.cl/causa/episodio-pichoy/" target="_blank">
                <img src="./iconos/logo-expedientes-de-la-represion.png" style="max-width: 80%;">
            </a>
        </div>
      El 2009 se dicto la setencia de las ejecuciones del puente Pichoy, donde fueron asesinados 4 militantes del Partido Comunista y Socialista.
      Esta sentencia condeno a:
      <a href="https://www.memoriaviva.com/criminales/arenas-gonzalez-oscar-enrique" target="_blank">Óscar Enrique Arenas González</a>, capitán de Carabineros
      <a href="https://www.memoriaviva.com/criminales/aburto-vera-samuel" target="_blank">Samuel Aburto Vera</a>, cabo de Carabineros
      <a href="https://www.memoriaviva.com/criminales/flandez-vergara-arturo-eladio" target="_blank">Arturo Eladio Flández Vergara</a>, cabo de Carabineros
        `
    );
});

markers.push(markerpichoy);


// Memorial Lago Ranco
var markerlaja = L.marker([-40.3217019089184, -72.48979936495127], {icon: memorial});
markerlaja.anio = 1973.71;
markerlaja.anioMemorial = 2023;
markerlaja.iconoInicial = ejecucion;
markerlaja.on('click', function() {
    const anioSlider = parseFloat(document.getElementById('slider-anio').value);

    let contenido, anioTexto;

    if (anioSlider >= 2023) {
        contenido = `<h3>Memorial Ejecutados de Lago Ranco</h3>
        <p>
        
        </p>`;
        anioTexto = '2023 - Memorial Vapor Laja';
    } else {
        contenido = `<h3>Ejecuciones Vapor Laja</h3>

                               <div class="galeria">

                                                          <video data-descripcion="Video del memorial" controls>
        <source src="./galerias/memoriales/lagoranco/LagoRancoReel.mp4" type="video/mp4">
    </video>

      <img src="./galerias/memoriales/Lagoranco/ancacura_manquian_cardenio.webp"data-descripcion="Cardenio Ancacura Maquian<br> 45 años, Obrero agrícola" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
      <img src="./galerias/sin_foto.webp"data-descripcion="Teófilo Zaragozo González Calfulef<br> 24 años, Transportista y militante del Partido Socialista" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
      <img src="./galerias/memoriales/Lagoranco/manuel_jesus_hernandez_inostroza.webp"data-descripcion="Manuel Hernández Inostroza<br> 42 años,Sastre y militante del PS" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
      <img src="./galerias/memoriales/Lagoranco/arturo-benito-vega-gonzalez.webp"data-descripcion="Arturo Benito Vega González<br> 20 años, Obrero planificador" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
    </div>
        <p style="font-style: italic;">
        "El 16 de octubre de 1973, fueron muertos a bordo del vapor Laja, por personal de la Gobernación Marítima de Valdivia, las siguientes personas, cuyos cuerpos fueron arrojados a las aguas del lago Ranco:
<br>
<br> <a href="https://www.memoriaviva.com/detenidos-desaparecidos/ancacura-manquian-cardenio" target="_blank">Cardenio Ancacura Maquian</a>45 años, campesino y militante socialista;
<br> <a href="https://www.memoriaviva.com/detenidos-desaparecidos/gonzalez-calfulef-teofilo-zaragozo" target="_blank">Teófilo Zaragozo Gonzalez Calfulef</a>, 24 años, camionero, militante socialista;
<br> <a href="https://www.memoriaviva.com/detenidos-desaparecidos/hernandez-inostroza-manuel-jesus" target="_blank">Manuel Hernandez Inostroza</a>, 42 años, sastre, ex candidato a Regidor por Lago Ranco y militante del Partido Socialista;
<br> <a href="https://www.memoriaviva.com/detenidos-desaparecidos/vega-gonzalez-arturo" target="_blank">Arturo Vega Gonzalez</a>, 20 años, obrero panificador, también socialista.
<br><br>
Todos fueron detenidos el día 16 de octubre de 1973 en sus domicilios de Lago
Ranco y conducidos a la Tenencia de Carabineros de dicho pueblo.  En la noche
de ese día fueron subidas al vapor Laja, donde fueron ejecutadas.  Sus cuerpos
fueron lanzados al lago, sin que hayan sido encontrados hasta la fecha."</p>
        <p style="font-style: italic; text-align: right;">Informe Rettig 395</p>`;
        anioTexto = '16 de octubre de 1973';
    }

    setAnio(anioTexto);
    markerlaja._panelAbierto = true;
    openPanel(
        contenido,
        null,
        `<h3>Expedientes</h3>
        <div style="text-align: center; margin-top: 15px;">
            <a href="https://expedientesdelarepresion.cl/causa/caso-lago-ranco/" target="_blank">
                <img src="./iconos/logo-expedientes-de-la-represion.png" style="max-width: 80%;">
            </a>
        </div>`
    );
});

markers.push(markerlaja);


// Antilhue
var markerantilhue = L.marker([-39.807423, -72.9621176], {icon: ejecucion});
markerantilhue.anio = 1973.72;
markerantilhue.on('click', function() {
    setAnio('18 de octubre de 1973');
    openPanel(
        `<h3>Antilhue</h3>

        <div class="galeria">
        <img src="./galerias/memoriales/antilhue/espinoza_barrientos_pedro_segundo.webp"data-descripcion=" Pedro Segundo Espinoza Barrientos, 32 años, 
        militante del Partido Comunista y Presidente del Sindicato Agricola "Venceremos"" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
        </div>
        <p>
         <a href="https://www.memoriaviva.com/detenidos-desaparecidos/espinoza-barrientos-pedro-segundo" target="_blank">Pedro Segundo Espinoza Barrientos </a> 
         militante del Partido Comunista y Presidente del Sindicato Agrícola «Venceremos» de la localidad de Los Lagos,
          fue detenido ese día alrededor de las 19:00 horas, en el Asentamiento Junco, Antilhue, por militares
           que realizaron un operativo en el lugar.<br><br>
De acuerdo con testigos que presenciaron la detención, fue subido a un camión que partió con rumbo
 desconocido y desde entonces se encuentra desaparecido. Familiares iniciaron su búsqueda en Valdivia, La Unión, Corral, Temuco y Santiago preguntando por él en comisarías, 
en la Cuarta División del Ejército, cárceles, hospitales y morgues, sin lograr resultados positivos.
<br><br>Con anterioridad, recién ocurrido el 11 de septiembre de 1973, Pedro Espinoza había permanecido 18
 días detenido e incomunicado por Carabineros de la localidad de Los Lagos. Al salir en libertad, 
 junto con su familia había buscado refugio en el Asentamiento Junco. </p>
     `,
    );
});

markers.push(markerantilhue);


// Ñancul 
var markernancul2 = L.marker([-39.71981, -72.406478], {icon: ejecucion});
markernancul2.anio = 1973.73;
markernancul2.on('click', function() {
    setAnio('19 de octubre 1973');
    openPanel(
        `<h3>Ñancul </h3>

        <div class="galeria">
        <img src="./galerias/memoriales/nancul/vallejos_ramos_jorge.webp"data-descripcion="Jorge Vallejos Ramos, 34 años, Obrero Maderero,
         militante del Partido Socialista y Concejero comunal del COFOMAP" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
        </div>
        <p>
         <a href="https://www.memoriaviva.com/detenidos-desaparecidos/vallejos-ramos-jorge" target="_blank">Jorge Ramos Vallejos</a>, 
         consejero comunal del Complejo Maderero y Forestal Panguipulli, fue detenido 
         ese día en su domicilio, por un grupo de militares y carabineros. Desde esa fecha se encuentra desaparecido. 
         Según declaraciones de testigos y familiares, ese día, alrededor de las 10:00 horas, una patrulla formada por militares y 
         carabineros llegó hasta la vivienda de Jorge Vallejos, ubicada en el sector rural de Ñancul, comuna de Panguipulli.
          Luego de golpearlo y amenazar a su grupo familiar, lo subieron a un camión y se lo llevaron con destino desconocido. 
          Desde entonces, y pese a las diligencias efectuadas por sus familiares, no ha sido posible obtener noticias acerca de su 
          paradero. De acuerdo con lo afirmado por testigos, su cuerpo fue encontrado en la localidad de Máfil por carabineros, 
          quienes lo inhumaron sin notificar de este hecho. Tal como lo informaron diversos medios de prensa de la época, 
          después del 11 de septiembre de 1973 llegaron hasta la zona de Panguipulli grupos de fuerzas especiales del Ejército,
        provenientes de Santiago. Su misión era actuar en el Complejo 
         Maderero y Forestal de Panguipulli para terminar con la resistencia que presentaban aproximadamente doscientos
        trabajadores.`,

    );
});

markers.push(markernancul2);


// Tenencia Gil de Castro
var markergil = L.marker([-39.832340, -73.201687], {icon: ejecucion});
markergil.anio = 1973.8;
markergil.on('click', function() {
    setAnio('Caso menores de edad 25 de Octubre y 8 de Noviembre de 1973');
    openPanel(
        `<h3><a href="https://memoriaviva.com/centros-de-detencion/x-region/tenencia-de-carabineros-gil-castro" target="_blank">Tenencia de Carabineros Gil de Castro</a></h3>
         
        <div class="galeria">

                                                                <video data-descripcion="Video del memorial" controls>
        <source src="./galerias/memoriales/gildecastro/MenoresEdadReel.mp4" type="video/mp4">
    </video>

    <img src="./galerias/sin_foto.webp"data-descripcion="Juan Bautista Fierro Pérez <br>17 años, estudiante." onclick="ampliarFoto(this.src, this.closest('.galeria'))">
    <img src="./galerias/sin_foto.webp" data-descripcion="Pedro Robinson Fierro Pérez<br> 16 años, estudiante.<br> Musico de la cámara de orquesta UACH " onclick="ampliarFoto(this.src, this.closest('.galeria'))">
    <img src="./galerias/sin_foto.webp" data-descripcion="Victor Inostroza Ñanco<br> 19 años, electricista." onclick="ampliarFoto(this.src, this.closest('.galeria'))">
    <img src="./galerias/memoriales/gildecastro/chavez_oyarzn_cosme_ricardo.webp" data-descripcion="Ricardo Cosme Chavez Oyarzún <br>18 años, obrero pintor." onclick="ampliarFoto(this.src, this.closest('.galeria'))">
    <img src="./galerias/sin_foto.webp" data-descripcion="Victor Joel Gatica Coronado <br> 18 años, comerciante ambulante." onclick="ampliarFoto(this.src, this.closest('.galeria'))">
    <img src="./galerias/sin_foto.webp" data-descripcion="Victor Enrique romero Canales<br> 22 años, obrero." onclick="ampliarFoto(this.src, this.closest('.galeria'))">
    
    </div>
    
        <p style="font-style: italic;">"El 25 de octubre de 1973 fueron ejecutados en la ciudad de Valdivia por personal de Carabineros y probablemente del Ejército, tres jóvenes ninguno de ellos con
militancia política: <br><br>
        <a href="https://www.memoriaviva.com/ejecutados-politicos/fierro-perez-juan-bautista" target="_blank">Juan Bautista Fierro Pérez</a>, 17 años<br>
        <a href="https://www.memoriaviva.com/ejecutados-politicos/fierro-perez-pedro-robinson" target="_blank">Pedro Robinson Fierro Pérez</a>, 16 años<br>
        <a href="https://www.memoriaviva.com/ejecutados-politicos/inostroza-nanco-jose-victor" target="_blank">Victor Inostroza Ñanco</a>, 19 años<br>
       <br> Los hermanos Fierro Pérez fueron detenidos el 20 de octubre de 1973 en su
domicilio, por efectivos de Carabineros y militares, y llevados a la Tenencia Gil
de Castro.  Inostroza Ñanco lo fue el día 21 de octubre de 1973, en la Feria Libre
de Valdivia, por la misma clase de efectivos.  Los tres fueron ejecutados en
circunstancias no precisadas el día 25 de octubre de 1973, indicando los
certificados de defunción como lugar la vía pública.  Los cuerpos pudieron ser
sepultados por sus familiares.<br>

  
<br>  El 8 de noviembre de 1973, por sentencia del Consejo de Guerra Rol Nº 1572-73
de Valdivia, fueron ejecutadas las siguientes personas, acusadas de asaltar la
Tenencia de Carabineros Gil de Castro, de la misma ciudad, el día 13 de
septiembre de 1973:<br>

<br><a href="https://memoriaviva.com/nuevaweb/ejecutados-politicos/ejecutados-politicos-c/chavez-oyarzun-cosme-ricardo/" target="_blank">Ricardo Cosme Chavez Oyarzun</a> 18 años, obrero pintor
<br><a href="https://memoriaviva.com/nuevaweb/ejecutados-politicos/ejecutados-politicos-g/gatica-coronado-victor-joel/" target="_blank">Victor Joel Gatica Coronado</a> 18 años, comerciante ambulante
<br><a href="https://memoriaviva.com/nuevaweb/ejecutados-politicos/ejecutados-politicos-r/romero-corrales-victor-enrique/" target="_blank">Victor Enrique Romero Coralles</a>, 22 años, orbero"</p>
</p>
        <p style="font-style: italic; text-align: right;">Informe Rettig p 396-397</p>`,
        null, 
        `<h3>Expedientes</h3>
        <div style="text-align: center; margin-top: 15px;">
            <a href="https://expedientesdelarepresion.cl/causa/episodio-valdivia-n4/" target="_blank">
                <img src="./iconos/logo-expedientes-de-la-represion.png" style="max-width: 80%;">
            </a>
        </div>`
    );
});

markers.push(markergil);


// Memorial Maiquillahue
markernanco = L.marker([-39.461455, -73.232988], {icon: memorial});
markernanco.anio = 1973.9;
markernanco.anioMemorial = 2016;
markernanco.iconoInicial = ejecucion;

markernanco.on('click', function() {
    const anioSlider = parseFloat(document.getElementById('slider-anio').value);

    let contenido, anioTexto;

    if (anioSlider >= 2016) {
        contenido = `<h3>Memorial de Maiquillahue</h3>
       
              <div class="galeria">
               <iframe src="https://www.youtube.com/embed/Bc_EMZO8W5o" frameborder="0" allowfullscreen></iframe>
         <img src="./galerias/memoriales/maiquillahue/maiquillahue_1.jpg"data-descripcion="" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
         
         </div>.
          
          <p>
          El día 31 de octubre de 1973 personal naval perteneciente a 
la Gobernación Marítima de Valdivia al mando de un Teniente 
de la Armada de Chile se trasladó en dos helicópteros al sector 
Maquillahue de la comuna de Mariquina. Una vez en el lugar, 
ejecutaron un operativo terrestre en busca de armamento y 
de personas supuestamente vinculadas a partidos políticos de 
izquierda. Así las cosas, el citado personal naval, a  instancias 
de un sujeto de raza mapuche que adhería al Partido Nacional 
y profesaba la fe católica, actuado como delator, procedió a 
la detención de varios comuneros mapuches que simpatizaban 
con ideas políticas de izquierda y profesaban la fe evangélica
pentecostal. En tales circunstancias, alrededor del medio 
día, el Teniente aludido procedió a hacer fuego con su fusil 
SIG de cargo en contra del comunero mapuche evangélico 
José Matías Ñanco, a causa de lo cual, éste falleció en forma 
inmediata.
 <br><br>
Con posterioridad a los hechos antes mencionados, 
el Teniente a cargo del operativo ordenó la reanudación de éste 
y, concertado con cuatro ex cadetes navales reincorporados a 
la Gobernación Marítima de Valdivia en colaboración con el 
delator ya mencionado que actuó como baquiano, dispusieron 
que algunos de los detenidos trasladaran el cadáver en una 
camilla artesanal hasta uno de los helicópteros, desde el cual, 
los uniformados, una vez en vuelo, procedieron a arrojar el 
cuerpo a las aguas del Océano Pacífico, extendiéndose luego, la 
pertinente partida de defunción de conformidad a los artículos 
305 inciso 3°, 306 y 307 del Código Civil.<br><br>

Por otra parte, de aquellos mismos antecedentes se encuentra 
justificado que el sujeto de raza mapuche que intervino en los 
hechos ya mencionados, actuó movido por razonesétnicas, 
religiosas y políticas, facilitando al autor y restantes 
encubridores todos los medios para que éstos aprovecharan 
de los efectos del homicidio, esto es, procurar la intimidación 
de otros mapuches y conducir a aquéllos por el agreste sector 
de Maquillahue, a fin de que pudieran salir y, en definitiva, 
consumar así la desaparición del cadáver de José Matías 
Ñanco." 
</p>
          
          
          `;
        anioTexto = '2016 - Memorial de Maiquillahue';
    } else {
        contenido = `<h3>Ejecución de Maiquillahue</h3>
                                  <div class="galeria">

 <video data-descripcion="Video del memorial" controls>
        <source src="./galerias/memoriales/liquine/Liquinereel.mp4" type="video/mp4">
    </video>
                                  
         <img src="./galerias/sin_foto.webp"data-descripcion="José Matias Ñanco Lillo, 60 años <br> Pescador, predicador protestante y simpatizante de izquierda" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
          </div>
      <p style="font-style: italic; text-align: justify;">
       "El 31 de octubre de 1973, en el sector de Maiquillahue, San José de la Mariquina,
fue muerto por militares <a href="https://www.memoriaviva.com/ejecutados-politicos/nanco-jose-matias" target="_blank">José Matías Ñanco Lillo</a>, 60 años, pescador, predicador
protestante, simpatizante de izquierda.<br><br>
En la localidad señalada efectivos militares realizaron un operativo y detuvieron a
alrededor de trece personas, formándolas en fila.  José Ñanco se negó a obedecer
dirigiéndose en términos duros a los militares y forzó el arma de uno de ellos,
entonces le dispararon y le dieron muerte.  El mismo uniformado ordenó levantar
el cuerpo, a lo que se negaron los demás detenidos, por lo que los propios
militares lo llevaron hacia un lugar que se desconoce."</p>
        <p style="font-style: italic; text-align: right;">Informe Rettig p 396</p>
           <div style="display: flex; justify-content: space-around; gap: 20px; margin-top: 20px;">
            <div style="text-align: center; cursor: pointer; flex: 1;" onclick="openLibroPDF(121)">
                <img src="./libros/libro_cm/portada.jpg" alt="Portada Libro" style="width: 100%; max-width: 250px; border: 2px solid #ddd; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: all 0.2s;" onmouseover="this.style.transform='scale(1.03)'" onmouseout="this.style.transform='scale(1)'">
            </div>
</div>`;
        anioTexto = '31 de octubre de 1973';
    }

    setAnio(anioTexto);
    markernanco._panelAbierto = true;
    openPanel(
        contenido,
       null,
        `<h3>Expedientes</h3>
        <div style="text-align: center; margin-top: 15px;">
            <a href="https://expedientesdelarepresion.cl/causa/jose-matias-nanco/" target="_blank">
                <img src="./iconos/logo-expedientes-de-la-represion.png" style="max-width: 80%;">
            </a>
        </div>`
    );
}); 

markers.push(markernanco);




// Caso Molco
var markermolco = L.marker([-39.823737, -72.082169], {icon: ejecucion});
markermolco.anio = 1973.91;
markermolco.on('click', function() {
    setAnio(' 23 de diciembre de 1973');
    openPanel(
        `<h3>Caso Molco</h3>
        <div class="galeria">
        <img src="./galerias/memoriales/uach/hugo_rivol_vasquez_martinez.webp"data-descripcion="Hugo Rivol Vásquez Martínez<br>21 años, estudiante universitario" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
     <img src="./galerias/memoriales/molco/superby_mario.webp"data-descripcion="Mario Edmundo Superby Jeldres<br>23 años, estudiante universitario y militante del MIR" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
        </div>

       <p style="font-style: italic;">"El 23 de diciembre de 1973 fueron ejecutados por carabineros en el sector de
Molco, Choshuenco, en el Complejo Panguipulli, dos personas: <a href="https://memoriaviva.com/nuevaweb/ejecutados-politicos/ejecutados-politicos-v/vasquez-martinez-hugo-rivol/" target="_blank">Hugo Rivol Vasquez Martinez</a>, y
<a href="https://www.memoriaviva.com/ejecutados-politicos/superby-jeldres-mario-edmundo" target="_blank">Mario Edmundo Superby Jeldres</a>
que se encontraban internados en la montaña, en el sector de Choshuenco,
desde  donde  bajaban  al  pueblo  esporádicamente  a  alimentarse.    Según
información de prensa de la época, "dos extremistas fueron muertos durante el
transcurso de un operativo que hicieron a las 23:45 horas funcionarios de
Choshuenco  al  lugar  denominado  Molco.  
    <br><br>  En  momentos  que  Carabineros
patrullaba el sector fueron atacados con disparos de armas por los extremistas,
repeliendo de inmediato el ataque.  Durante la balacera fue muerto con impactos
en el tórax Hugo Rivol Vásquez Martínez, 21 años, el que portaba un rifle marca
Winchester de repetición.  Andaba con otro sujeto apodado "El Braulio", quién
fue herido en las piernas y mientras era conducido al Hospital de Panguipulli dejó
de existir en el camino".</p>
<p style="font-style: italic; text-align: right;"> Informe Rettig p 398</p><br></p>`, null,  `<h3>Expedientes</h3>
         <div style="text-align: center; margin-top: 15px;">
            <a href="https://expedientesdelarepresion.cl/wp-content/uploads/2018/03/sentencia-caso-mario-superby-y-hugo-vasquez.pdf" target="_blank">
                <img src="./iconos/logo-expedientes-de-la-represion.png" style="max-width: 80%;">
            </a>
        </div>
        
        
        `
    );
});
markers.push(markermolco);





// Los Conales
var markerconales = L.marker([-40.23938, -73.0044782], {icon: ejecucion});
markerconales.anio = 1975;
markerconales.on('click', function() {
    setAnio('21 de Julio de 1975');
    openPanel(
        `<p><a href="https://memoriaviva.com/ejecutados-politicos/foitzick-casanova-balmorir-ventura" target="_blank">Balmorir Ventura Foitzick Casanova</a>
    murió ese día a las 18:30 horas, en Los Conales, "a causa de herida de bala del cráneo, fractura 
    expuesta con salida masa encefálica. Suicidio" (sic),
    según señala el Certificado de Defunción respectivo.
    <br><br>

De acuerdo con lo declarado por testigos presenciales, ese día, el domicilio de 
Balmorir Foitzick, ubicado en la parcela El Mirador, Los Conales, fue rodeado por carabineros y
 militares que se movilizaban en dos buses institucionales; luego de hacer salir de la casa a las dos mujeres
  que allí se encontraban, comenzaron a disparar hacia el interior, donde Balmorir Foitzick yacía en cama, 
  enfermo. Se le acusaba de guardar armas en su domicilio. Sus hijos varones habían sido detenidos previamente y 
  retenidos durante varias horas en un cuartel policial. Los uniformados dispararon en contra de la casa y lanzaron bombas
   lacrimógenas, mataron animales y destruyeron los árboles. Al día siguiente, sacaron el cuerpo de Balmorir Foitzick y 
   lo trasladaron a la Morgue de La Unión.
   <br><br>
La inscripción de la defunción fue ordenada por la Fiscalía Militar de Valdivia.</p>
        <p style="font-style: italic; text-align: right;">Informe Valech XXX</p>`,
        `<h3>Expedientes</h3>`
    );
});

markers.push(markerconales);




var markerneltume1 = L.marker([-39.709117489262105, -71.91632806814408], {icon: ejecucion});
markerneltume1.anio =  1981.1;
markerneltume1.anioMemorial = 1994;
markerneltume1.iconoInicial = ejecucion;
markerneltume1.on('click', function() {
    setAnio('13 de septiembre de 1981');
    openPanel(
        `<h3>Ejecucion Raúl Rodrigo Obregón Torres "Pablo"</h3>
        <div class="galeria">
    <img src="./galerias/memoriales/neltume81/obregon_raul.webp" data-descripcion="Raúl Rodrigo Obregón Torres Pablo <br> 31 años, Técnico topógrafo y militante del MIR" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
    </div>
      
        <p style="font-style: italic;"> "El 13 de septiembre de 1981, aprovechaándose de esta información los agentes dieron muerte a 
        <a href="https://www.memoriaviva.com/ejecutados-politicos/obregon-torres-raul-rodrigo" target="_blank">Raúl Rodrigo Obregon Torres "Pablo"</a>, tecnico topográfico cuando concurriía a reunirse con sus compañeros,
         teniendo la Comisión la convicción de que fue ejecutado,valiéndose los agentes del conocimiento que tenían del 
         lugar del encuentro y del santo y seña. Por lo anterior es falsa la versión oficial que en el caso de ésta, como la mayoría de las restantes muertes
         se difundío a través de comunicados por DINACOS, en donde se señaló que se produjeron a consecuencias de enfrentamientos."</p>
<p style="font-style: italic; text-align: right;"> Informe Rettig p 992 </p>

  <div style="text-align: center; margin-top: 15px;">
            <a href="https://www.museoneltume.cl/memorias-y-testimonios/memorias-rebeldes-pablo-sigue-combatiendo-en-el-corazon-de-las-montanas-de-neltume/" target="_blank">
                <img src="./iconos/logo-museo-neltume.png" style="max-width: 60%;">
            </a>
        </div>
`,
      null, 
        `<h3>Expedientes</h3>
<br><a href="https://www.pjud.cl/prensa-y-comunicaciones/noticias-del-poder-judicial/117784" target="_blank">Noticia Poder Judicial</a>`
    );
});
markers.push(markerneltume1);





var markerneltume2 = L.marker([-39.713321924793085, -71.9205356236486], {icon: ejecucion});
markerneltume2.anio =  1981.2;
markerneltume2.anioMemorial = 1994;
markerneltume2.iconoInicial = ejecucion;
markerneltume2.on('click', function() {
    setAnio('17 de septiembre de 1981');
    openPanel(
        `<h3>Ejecución Pedro Juan Yañez Palacios</h3>
                <div class="galeria">
    <img src="./galerias/memoriales/neltume81/yanez-palacios-pedro-juan.webp" data-descripcion="Pedro Juan Yáñez Palacios<br> 31 años, Obrero electricista y militante del MIR" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
    </div>
        
        <p style="font-style: italic;"> "El 17 de septiembre de 1981, fue también ejecutado por las fuerzas de seguridad 
        <a href="https://www.memoriaviva.com/ejecutados-politicos/yanez-palacios-pedro-juan" target="_blank">Pedro Yañez Palacios "Jorge"</a>, ayudante de electricista,
        quien se había separado del grupo debido a que se encontraba en muy malas condiciones fisicas, dadas las adversidades cliáticas que debia soportar,
         habiéndole sido amputado por sus compañeros un pie que se le había congelado y gangrenado.
         Este hecho le permite a la Comisión llegar a la convicción de que es altamente improbable que haya opuesto resistencia."</p>
<p style="font-style: italic; text-align: right;"> Informe Rettig p 992 </p>
<br>
 <div style="text-align: center; margin-top: 15px;">
            <a href="https://www.museoneltume.cl/memorias-y-testimonios/pedro-juan-yanez-palacios-jorge-con-toda-la-dignidad-enfrentando-a-los-enemigos-del-pueblo/" target="_blank">
                <img src="./iconos/logo-museo-neltume.png" style="max-width: 60%;">
            </a>
        </div>`,
      null, 
        `<h3>Expedientes</h3>
        <a href="https://www.pjud.cl/prensa-y-comunicaciones/noticias-del-poder-judicial/117784" target="_blank">Noticia Poder Judicial</a>`
    );
});
markers.push(markerneltume2);

// Remeco Alto
var markerremeco = L.marker([-39.817188171939335, -71.94666915089196], {icon: memorial});
markerremeco.anio = 1981.3;
markerremeco.anioMemorial = 2001;
markerremeco.iconoInicial = ejecucion;
markerremeco.on('click', function() {
    setAnio('20 de septiembre de 1981');


    openPanel(
        `<h3>Ejecuciones de Remeco Alto</h3>

<div class="galeria">
  <img src="./galerias/memoriales/neltume81/calfuquir-henriquez-patricio.webp"data-descripcion="Patricio Alejandro Calfuquir Henríquez 28 años, obrero electricista" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
  <img src="./galerias/memoriales/neltume81/guzman_soto_prospero.webp"data-descripcion="Próspero del Carmen Guzmán Soto  <br>27 años, obrero maderero" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
 <img src="./galerias/memoriales/neltume81/monsalve-sandoval-jose-eugenio.webp"data-descripcion="José Eugenio Monsalve Sandoval  <br>28 años, obrero electricista" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
  </div>

      <p style="font-style: italic;"> "Por esa fecha el grupo se dividió y tres de ellos se dirigieron al sector de Remeco Alto, a casa de una pariente de unos de ellos, con el fin de obtener alimentos.
Los militares fueron alertados de la presencia de estas personas por los propios moradores de la casa y los sorprendieron mientras dormían, dándoles muerte.
  Fallecieron asi los obreros <a href="https://memoriaviva.com/ejecutados-politicos/calfuquir-henriquez-patricio-alejandro" target="_blank">Patricio Alejandro Calfuquir Henríquez "Pedro"</a>, y 
<a href="https://memoriaviva.com/ejecutados-politicos/guzman-soto-prospero-del-carmen" target="_blank">Próspero del Carmen Guzmán Soto "Victor"</a>, en el interior de la vivienda, la que quedó totalmente destruida por los disparos.
<br><br><a href="https://memoriaviva.com/ejecutados-politicos/monsalve-sandoval-jose-eugenio" target="_blank">José Eugenio Monsalve Sandoval "Camilo"</a>, 27 años, obrero maderero.
también obrero, alcanzó a huir algunos metros de la casa, siendo alcanzado y ejecutado. Le consta a la Comisión que en ninguna de estas muertes hubo resistencia
 previa por parte de las víctimas. Todo esto sucedió el 20 de septiembre de 1981."<p>
  <p style="font-style: italic; text-align: right;">Informe Rettig p 992</p>
  
     <div style="text-align: center; margin-top: 15px;">
            <a href="https://www.museoneltume.cl/memorias-y-testimonios/memorias-rebeldes-prospero-del-carmen-guzman-soto-victor-el-grande-el-hijo-mas-sencillo-y-humilde-de-neltume/" target="_blank">
                <img src="./iconos/logo-museo-neltume.png" style="max-width: 60%;">
            </a>
        </div>
           <div style="text-align: center; margin-top: 15px;">
            <a href="https://www.museoneltume.cl/memorias-y-testimonios/memorias-rebeldes-jose-eugenio-monsalve-sandoval-camilo-explorador-actor-y-maestro-chasquilla-del-destacamento-de-la-nueva-aurora/" target="_blank">
                <img src="./iconos/logo-museo-neltume.png" style="max-width: 60%;">
            </a>
        </div>   <div style="text-align: center; margin-top: 15px;">
            <a href="https://www.museoneltume.cl/memorias-y-testimonios/memorias-rebeldes-memoria-de-la-vida-politica-de-patricio-calfuquir-henriquez/" target="_blank">
                <img src="./iconos/logo-museo-neltume.png" style="max-width: 60%;">
            </a>
        </div>
  `,
       null,  `<h3>Expedientes</h3>
       <a href="https://www.pjud.cl/prensa-y-comunicaciones/noticias-del-poder-judicial/117784" target="_blank">Noticia Poder Judicial</a>`
    );
});

markers.push(markerremeco);

var markerneltume3 = L.marker([-39.70573544295161, -71.90284171237761], {icon: ejecucion});
markerneltume3.anio =  1981.4;
markerneltume3.anioMemorial = 1994;
markerneltume3.iconoInicial = ejecucion;
markerneltume3.on('click', function() {
    setAnio('21 de septiembre de 1981');
    openPanel(
        `<h3>Ejecuciones de Rene Eduardo Bravo Aguilera "Oscar" y Julio Cesar Riffo Figueroa "Rigo"</h3>
                     <div class="galeria">
    <img src="./galerias/memoriales/neltume81/bravo-aguilera-rene-eduardo.webp" data-descripcion="René Eduardo Bravo Aguilera<br> 25 años, Obrero maderero y militante del MIR" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
    <img src="./galerias/memoriales/neltume81/riffo-figueroa-julio-cesar.webp" data-descripcion="Julio César Riffo Figueroa<br> 30 años, Obrero maderero y militante del MIR" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
    </div>
        <p style="font-style: italic;">El 21 de septiembre fueron ejecutados dos miembros que habían sido detenidos al principio de los hechos, de nombres 
        <a href="https://www.memoriaviva.com/ejecutados-politicos/bravo-aguilera-rene-eduardo">René Eduardo Bravo Aguilera "Oscar"</a> y 
         <a href="https://www.memoriaviva.com/ejecutados-politicos/riffo-figueroa-julio-cesar">Julio César Riffo Figueroa "Rigo"</a>, ambos obreros, quienes habian sido conducidos al lugar del operativo desde Santiago.
        <br><br>
         En el comunicado distribuido por DINACOS no se señala la forma en que fallecieron estas personas. Otras informaciones provenientes de la CNI dan cuenta de la detención pero señala que habrían sido muertas al intentar darse a la fuga, versión que resulta inversomil
         dado lo amplio del despliegue militar y la celosa custodia aque deben haber estado sometidos, lo que se ratifica con omisiones del comunicado oficial. 
        
        </p>
<p style="font-style: italic; text-align: right;"> Informe Rettig p 992 </p>

<div style="text-align: center; margin-top: 15px;">
            <a href="https://www.museoneltume.cl/memorias-y-testimonios/memorias-rebeldes-las-trayectorias-de-oscar-y-rigo/" target="_blank">
                <img src="./iconos/logo-museo-neltume.png" style="max-width: 60%;">
            </a>
        </div>
`,
      null, 
        `<h3>Expedientes</h3>
        <a href="https://www.pjud.cl/prensa-y-comunicaciones/noticias-del-poder-judicial/117784" target="_blank">Noticia Poder Judicial</a>`
    );
})
markers.push(markerneltume3);

var markerneltume4 = L.marker([-39.87394087611495, -71.89398526498002], {icon: ejecucion});
markerneltume4.anio =  1981.5;
markerneltume4.anioMemorial = 1994;
markerneltume4.iconoInicial = ejecucion;
markerneltume4.on('click', function() {
    setAnio('21 de septiembre de 1981');
    openPanel(
        `<h3>Ejecución de "Pequeco" en Puente Quilmio</h3>
              <div class="galeria">
    <img src="./galerias/memoriales/neltume81/ojeda-aguayo-j-a.webp" data-descripcion="Juan Angel Ojeda Aguayo<br> 27 años, Obrero maderero y militante del MIR" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
    </div>

        <p style="font-style: italic;">Finalmente, el 28 de noviembre de 1981, en Quebrada Honda, fue ejecutado por efectivos del ejército, el practicante 
        <a href="https://www.memoriaviva.com/ejecutados-politicos/ojeda-aguayo-juan-angel"> Juan Angel Ojeda Aguayo "Pequeco"</a>. El relato de un testigo presencial
         de los hechos le hace fe a esta Comisión en el sentido que tampoco hubo realmente un enfrentemiento en esta oportunidad.
        </p>
<p style="font-style: italic; text-align: right;"> Informe Rettig p 992 </p>

<div style="text-align: center; margin-top: 15px;">
            <a href="https://www.museoneltume.cl/memorias-y-testimonios/memorias-rebeldes-juan-angel-ojeda-aguayo-pequeco-y-la-futura-escuela-de-medicina-en-la-cordillera/" target="_blank">
                <img src="./iconos/logo-museo-neltume.png" style="max-width: 60%;">
            </a>
        </div>`,
       null, 
        `<h3>Expedientes</h3>
        <a href="https://www.pjud.cl/prensa-y-comunicaciones/noticias-del-poder-judicial/117784" target="_blank">Noticia Poder Judicial</a>`
    );
});
markers.push(markerneltume4);

// Memorial Paine / Miguel Cabrera
var markerpaine = L.marker([-39.836791, -72.0838169], {icon: memorial});
markerpaine.anio = 1981.6;
markerpaine.anioMemorial = 2010;
markerpaine.iconoInicial = ejecucion;
markerpaine.on('click', function() {
    setAnio('16 de octubre de 1981');
    openPanel(
        `<h3>Ejecución de <a href = "https://memoriaviva.com/ejecutados-politicos/cabrera-fernandez-miguel"target="_blank"> Miguel Cabrera "Paine"</a></h3>

        
                                             <div class="galeria">
  <img src="./galerias/memoriales/neltume81/cabrera_miguel.webp"data-descripcion="Miguel Cabrera Fernandez<br> 30 años, Obrero" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
  </div>
     
<p>El unicó enfrentamiento real en estos hechos tuvo lugar entre <a href = "https://memoriaviva.com/ejecutados-politicos/cabrera-fernandez-miguel"target="_blank"> Miguel Cabrera "Paine"</a>,
obrero, quien cayó el 16 de octubre de 1981 en la localidad de Choshuenco al ser descubierto por carabineros y luego de producirse intercambio de tiros entre ellos.
 La Comisión considera que su muerte se produjo a consecuencias del enfrentamiento, y sin violación de los derechos humanos.
  <p style="font-style: italic; text-align: right;">Informe Rettig p 993</p>

   <div style="text-align: center; margin-top: 15px;">
            <a href="https://www.museoneltume.cl/memorias-y-testimonios/memorias-rebeldes-la-lucha-constante-de-paine-por-la-justicia-y-la-libertad-de-nuestros-pueblos/" target="_blank">
                <img src="./iconos/logo-museo-neltume.png" style="max-width: 60%;">
            </a>
        </div>`,
        null,  `<h3>Expedientes</h3>
        <a href="https://www.pjud.cl/prensa-y-comunicaciones/noticias-del-poder-judicial/117784" target="_blank">Noticia Poder Judicial</a>`
    );
});

markers.push(markerpaine);




// Memorial Puente Estancilla
var markerestancilla = L.marker([-39.843286, -73.292629], {icon: ejecucion});
markerestancilla.anio = 1984;
markerestancilla.anioMemorial = 2007;
markerestancilla.iconoInicial = ejecucion;

markerestancilla.on('click', function() {
    const anioSlider = parseFloat(document.getElementById('slider-anio').value);

    let contenido, anioTexto;

    if (anioSlider >= 2007) {
        contenido = `<h3>Memorial Puente Estancilla</h3>
            <p>
                                                 <div class="galeria">

               <iframe src="https://www.youtube.com/embed/LZ1JL3X4-TA" frameborder="0" allowfullscreen></iframe>
                                
  <img src="./galerias/memoriales/estancilla/romeria_estancilla.jpg"data-descripcion="Juan José Boncompte Andreu <br> 31 años. economista y militante del mir" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
  </div>
  Este memorial nació como una cruz de madera en honor
a Rogelio Tapia de la Puente y Raúl Barrientos Matamala,
asesinados por la CNI en agosto de 1984 en el puente Estancilla.
La cruz fue varias veces destruida y repuesta, hasta que
finalmente el memorial fue reforzado con concreto y metal por
gestión de los familiares e instalando una placa que recuerda
además a Juan Boncompte Andreu, acribillado en Valdivia,
en la población Rubén Darío; Mario Mujica Barros, en Los
Ángeles; Luciano Aedo Arias, Mario Lagos Rodríguez y Nelson
Herrera Riveros, en Concepción, todos asesinados por la CNI
en la operación "alfa carbón"
            
            </p>`;
        anioTexto = '2007 - Inauguración Memorial Puente Estancilla';
    } else {
        contenido = `<h3>Ejecuciones Puente Estancilla</h3>
                                     <div class="galeria">
  <img src="./galerias/memoriales/estancilla/barrientos_matamala_ral_jaime.webp"data-descripcion="Raúl Jaime Barrientos Matamala <br> 23 años, empleado y militante del mir" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
  <img src="./galerias/memoriales/estancilla/tapia_de_rogelio.webp"data-descripcion="Rogelio Humberto Tapia de la Puente<br> 31 años, ingeniero forestal y militante del mir" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
  <img src="./galerias/memoriales/estancilla/boncompte_andreu_juan_jos.webp"data-descripcion="Juan José Boncompte Andreu <br> 31 años. economista y militante del mir" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
  </div>
  <p style="font-style: italic; text-align: left;">
"Entre el 23 y el 24 de agosto de 1984 la CNI, con agentes enviados desde Santiago,
ejecutó una operación destinada a eliminar a los dirigentes del MIR en la zona sur del país,
específicamente en Concepción, Los Angeles y Valdivia.  Muchos de ellos habían ingresado
ilegalmente al país y se encontraban realizando trabajo clandestino.  Todos estaban siendo
seguidos por agentes de seguridad con anterioridad y por lo mismo éstos tenían claridad
absoluta sobre sus actividades.[...]<br><br>
El 23 de agosto murieron en el camino que une a Valdivia con Niebla,
<a href="https://memoriaviva.com/nuevaweb/ejecutados-politicos/ejecutados-politicos-b/barrientos-matamala-raul-jaime/" target="_blank">Raúl Jaime Barrientos Matamala</a> y <a href="https://memoriaviva.com/nuevaweb/ejecutados-politicos/ejecutados-politicos-t/tapia-de-la-fuente-rogelio-humberto/" target="_blank">Rogelio Tapia de la Puente</a>,
empleado e ingeniero forestal respectivamente. La Comisión tiene
información de que las víctimas habrían sido detenidas en Valdivia y conducidas a ese lugar
para su ejecución por los agentes de la CNI.<br><br>
El 24 de agosto se produjo el último de los hechos, el que le costó la vida a <a href="https://memoriaviva.com/nuevaweb/ejecutados-politicos/ejecutados-politicos-b/boncompte-andreu-juan-jose/" target="_blank">Juan Boncompte Andreu</a>, de profesión economista. El fue sorprendido en su domicilio
por un elevado número de agentes. Juan Boncompte intentó huir por la parte trasera de la
casa pero fue cercado, disparándosele luego en repetidas ocasiones, a consecuencia de lo
cual falleció de manera inmediata. Varios relatos de testigos indican que no hubo ningún
tipo de resistencia por parte de la víctima y que ésta se encontraba a merced de los agentes
cuando fue muerta.</p>
<p style="font-style: italic; text-align: right;"> Informe Rettig p 998 </p>
<div style="display: flex; justify-content: space-around; gap: 25px; margin-top: 20px;">
    <div style="text-align: center; cursor: pointer; flex: 1;" onclick="openLibroPDF(92)">
        <img src="./libros/libro_cm/portada.jpg" alt="Portada Libro" style="width: 100%; max-width: 250px; border: 2px solid #ddd; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: all 0.2s;" onmouseover="this.style.transform='scale(1.03)'" onmouseout="this.style.transform='scale(1)'">
    </div>
</div>`;
        anioTexto = '23 y 24 de agosto de 1984';
    }

    setAnio(anioTexto);
    markerestancilla._panelAbierto = true;
    openPanel(
        contenido,
        `
        <div class="galeria">
               <iframe src="https://www.youtube.com/embed/LZ1JL3X4-TA" frameborder="0" allowfullscreen></iframe>
        </div>`,
        `<h3>Expedientes</h3>
        <div style="text-align: center; margin-top: 15px;">
            <a href="https://expedientesdelarepresion.cl/causa/caso-caravana-episodio-valdivia/" target="_blank">
                <img src="./iconos/logo-expedientes-de-la-represion.png" style="max-width: 80%;">
            </a>
        </div>`
    );
});

markers.push(markerestancilla);


// Memorial de la Mano
var markermano = L.marker([-39.840809, -73.215964], {icon: ejecucion});
markermano.anio = 1984;
markermano.anioMemorial = 1997;
markermano.iconoInicial = ejecucion;

markermano.on('click', function() {
    const anioSlider = parseFloat(document.getElementById('slider-anio').value);

    let contenido, anioTexto;

    if (anioSlider >= 1997) {
        contenido = `<h3>Inauguración Memorial de la Mano</h3>
            <div class="galeria">
               <iframe src="https://www.youtube.com/embed/BfCzDHOQqBo" frameborder="0" allowfullscreen></iframe>
        <img src="./galerias/memoriales/lamano/lamano_2.jpg"data-descripcion="2004 Velatón en conmemoración de Juan José Boncompte Andreu" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
        <img src="./galerias/memoriales/lamano/lamano_3.jpg"data-descripcion="2004 Velatón en conmemoración de Juan José Boncompte Andreu" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
<img src="./galerias/memoriales/lamano/lamano_1.jpg"data-descripcion="Juan José Boncompte Andreu <br> 31 años. economista y militante del mir" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
        </div>
       
        
        En recuerdo de Juan José Boncompte Andreu (31, economista), 
asesinado el 24 de agosto de 1984 en dicha población (operación 
alfa carbón). Su mujer, Inés embarazada de 7 meses, estaba 
con él en el momento del allanamiento de su casa y ejecución 
de parte de alrededor de 15 funcionarios de la CNI.

`;
        anioTexto = '1997';
    } else {
        contenido = `<h3>Ejecución Juan José Boncompte Andreu</h3>
        <div class="galeria">
        <img src="./galerias/memoriales/estancilla/boncompte_andreu_juan_jos.webp"data-descripcion="Juan José Boncompte Andreu <br> 31 años. economista y militante del mir" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
        </div>

        <p>El 24 de agosto se produjo el último de los hechos, el que le costó la vida a <a href="https://memoriaviva.com/nuevaweb/ejecutados-politicos/ejecutados-politicos-b/boncompte-andreu-juan-jose/" target="_blank">Juan José Boncompte Andreu</a>, de profesión economista. El fue sorprendido en su domicilio por un elevado número de agentes.
        Juan Boncompte intentó huir por la parte trasera de la casa pero fue cercado, 
        disparándosele luego en repetidas ocasiones, a consecuencia de lo cual falleció de manera inmediata. Varios relatos de 
        testigos indican que no hubo ningún tipo de resistencia por parte de la victima y que ésta se encontraba a la merced de los agentes cuando fue muerta.</p>
        <p style="font-style: italic; text-align: right;">Informe Rettig p 998</p>
        
                <div style="display: flex; justify-content: space-around; gap: 20px; margin-top: 20px;">
            <div style="text-align: center; cursor: pointer; flex: 1;" onclick="openLibroPDF(119)">
                <img src="./libros/libro_cm/portada.jpg" alt="Portada Libro" style="width: 100%; max-width: 250px; border: 2px solid #ddd; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: all 0.2s;" onmouseover="this.style.transform='scale(1.03)'" onmouseout="this.style.transform='scale(1)'">
            </div>`;
        anioTexto = '24 de agosto de 1984';
    }

    setAnio(anioTexto);
    markermano._panelAbierto = true;
    openPanel(
        contenido,
        ``,
        `<h3>Expedientes</h3>
        <div style="text-align: center; margin-top: 15px;">
            <a href="https://expedientesdelarepresion.cl/causa/caso-caravana-episodio-valdivia/" target="_blank">
                <img src="./iconos/logo-expedientes-de-la-represion.png" style="max-width: 80%;">
            </a>
        </div>`
    );
});

markers.push(markermano);



// SEDE RUBEN DARIO
var markersededario = L.marker([-39.841374168705045, -73.21527195208925], {icon: memorial});
markersededario.anio = 2004.1;
markersededario.on('click', function() {
    setAnio('2004');
    openPanel(
        `     
        <h3>Encuentro Nacional de Agrupación de Familiares en Sede Rubén Darío</h3>
        <div class="galeria">
    <img src="./galerias/actividades/encuentro_nacional/encuentro_2004.jpg"data-descripcion="Encuentro nacional en Sede Rubén Darío" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
        </div>`,
        `<h3>Expedientes</h3>`
    );
});

markers.push(markersededario);





// Escuela Mexico
var markermexico = L.marker([-39.817788, -73.232166], {icon: ejecucion});
markermexico.anio = 1989;
markermexico.iconoInicial = ejecucion;
markermexico.on('click', function() {
    setAnio(' 15 de diciembre de 1989');
    openPanel(
        `<h3>Escuela Mexico</h3>

                   <div class="galeria">
                    <img src="./galerias/memoriales/escuelamexico/rivas_sebastian.webp"data-descripcion="Sebastián Rodrigo Rivas Ovalle<br> 23 años, estudiante" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
  
    </div>
        <p style="font-style: italic;">"El 15 de diciembre de 1989 en una manifestación de celebración del triunfo de don Patricio Aylwin en las elecciones presidenciales, murió
        <a href="https://memoriaviva.com/nuevaweb/ejecutados-politicos/ejecutados-politicos-r/rivas-ovalle-sebastian/" target="_blank">Sebastián Rodrigo Rivas Ovalle</a>."</p>
        
Los hechos ocurrieron en el sector de Escuela México (Valdivia), hasta donde llegaron efectivos de
Carabineros.  Los manifestantes decidieron no huir, pero - según relata un testigo - "a Sebastián lo
distinguieron porque iba con la camiseta puesta (la de la candidatura de Aylwin)"; posteriormente,
según las mismas versiones, fue golpeado por los carabineros. 
<br><br>Llegó a su casa con señales de golpes
en todo el cuerpo.  Al día siguiente fue trasladado a un hospital, donde falleció a causa de una
contusión hemorrágica, meningo encefálica, traumatismo encéfalo craneano, según reza el certificado
de defunción.  La versión de Carabineros fue que se produjeron violentos incidentes, ante lo cual
intervino la fuerza pública, y que era posible que el afectado hubiese recibido algún bastonazo, pero
que también había otras posibles causas de las lesiones en esas circunstancias, independientes de la
acción de Carabineros.<br><br>
Aunque hubiese habido alguna necesidad de intervención de Carabineros en este caso, la Comisión,
sopesando los antecedentes reunidos, de modo particular los testimonios de personas más cercanas a
los hechos, presume que los agentes del Estado violaron el derecho a la vida de Rodrigo Rivas, al
excederse en el uso de la fuerza. </a>
</p>        
        <p style="font-style: italic; text-align: right;">Informe Rettig p 398</p>`,
        ``, 
        `<h3>Expedientes</h3>
        <div style="text-align: center; margin-top: 15px;">
            <a href="https://expedientesdelarepresion.cl/causa/sebastian-rivas-ovalle/" target="_blank">
                <img src="./iconos/logo-expedientes-de-la-represion.png" style="max-width: 80%;">
            </a>
        </div>`
    );
});

markers.push(markermexico);






//====================================================================================================================================================
//                      Centros de Detencion y tortura
//====================================================================================================================================================



// -----------------------------------Valdivia-------------------------------------------------

// CNI Valdivia / Casa de la Memoria
var markercni = L.marker([-39.817309, -73.246849], {icon: CCDD});
markercni.anio = 1981;
markercni.anioMemorial = 2008;
markercni.iconoInicial = CCDD;

markercni.on('click', function() {
    const anioSlider = parseFloat(document.getElementById('slider-anio').value);

    let contenido, anioTexto;

    if (anioSlider >= 2013) {
        contenido = `<h3>Encuentro Nacional de la Agrupación 2013</h3>
               <div class="galeria">
<img src="./galerias/actividades/encuentro_2013/encuentro_2013.jpg"data-descripcion="" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
</div>
    `;
        anioTexto = '2013';

    }else if (anioSlider >= 2010) {
        contenido = `<h3>Visita Ana Gonzalez de Recabarren</h3> 
        <p>
               <div class="galeria">
<img src="./galerias/actividades/visita_ana/ana_1.jpg"data-descripcion="" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
  <img src="./galerias/actividades/visita_ana/ana_2.jpg"data-descripcion="" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
  <img src="./galerias/actividades/visita_ana/ana_3.jpg"data-descripcion="" onclick="ampliarFoto(this.src, this.closest('.galeria'))">

</div>
<p>
 
        
        
        
        </p>`;
        anioTexto = 'Visita Ana González de Recabarren';
    } else if (anioSlider >= 2008) {
        contenido = `<h3>Primer ingreso a la Casa de la Memoria</h3>
   <div class="galeria">
            <iframe src="https://www.youtube.com/embed/HakqK7JHXV8" frameborder="0" allowfullscreen></iframe>
             <iframe src="https://www.youtube.com/embed/zZ3ueI2Tt2Q" frameborder="0" allowfullscreen></iframe>
            <iframe src="https://www.youtube.com/embed/G6yOp5Kl-Oo" frameborder="0" allowfullscreen></iframe>
        </div>

        <p>
Esta casa vino a resolver una necesidad esencial de toda 
colectividad: un espacio propio donde reunirse y trabajar 
para el logro de sus objetivos. Durante más de veinte años la 
Agrupación se reunía en diversos locales gestionados con la 
solidaridad de varias organizaciones sociales de la Valdivia: 
la sede del Sindicato de la Papelera; sede de la Central Única 
de Trabajadores; Comedor Los Copihues; Comedor de Iglesia 
Preciosa Sangre; Centro de Desarrollo Juvenil (Corvi).
<br><br>
Construida como casa habitación, fue adquirida en lso ´70 
por el Estado y destinada a oficina de la Corporación de la 
Reforma Agraria (CORA) pasó a ser luego un centro clandestino 
de la CNI para reclusión y tortura de opositores a la última 
dictadura civil-militar. No se tiene certeza de la cantidad exacta 
de ciudadanos que sufrieron en este recinto, pero fueron 
más de seis años de funcionamiento, lo que es indicativo de 
posiblemente cientos de personas. 
<br><br>
Hoy este espacio, transformado en la Casa de la Memoria de 
los DD.HH. abre sus puertas a este oscuro capítulo de nuestra 
historia no para abrir heridas sino para sanarlas con acciones 
de verdad y justicia. 
<br><br>
“Este tremendo desafío de darle vida a este espacio donde 
sus paredes son mudo testigo de tanto dolor y tanta atrocidad
confirmado por los testimonios de la gente que pasó por 
aquí" 
<br><br>

"Decirle a los jóvenes de hoy en día que luchen con 
inteligencia, queremos este espacio para eso, para hacer 
seminarios, talleres y darles a conocer lo que realmente 
pasó. Para eso se necesita esta casa, para decirles a los 
jóvenes que lo que pasó no tiene que pasar nunca más 
y para eso se necesita gente con vocación con orgullo, 
vocación, con coraje y luchar por lo que nosotros queremos, 
por lo que quiere cada ser humano, cada persona."  


        </p>


        `;
        anioTexto = '2008';
        setAnio(anioTexto);
    markercni._panelAbierto = true;
    openPanel(
        contenido,
        `<h3>Registro Audiovisual</h3><br> 
        <div class="galeria">

            <iframe src="https://www.youtube.com/embed/BvJWuSVc8PU" frameborder="0" allowfullscreen></iframe>
        </div>
        <h3>Arpilleras por la memoria</h3><br> 
        <div class="galeria">
            <iframe src="https://www.youtube.com/embed/TobTr6ehhMw" frameborder="0" allowfullscreen></iframe>
            <iframe src="https://www.youtube.com/embed/DU-OxsAvABk" frameborder="0" allowfullscreen></iframe>
            <iframe src="https://www.youtube.com/embed/SE_d2a7kFwg" frameborder="0" allowfullscreen></iframe>
            <iframe src="https://www.youtube.com/embed/gKymlZGmyxY" frameborder="0" allowfullscreen></iframe>
            <iframe src="https://www.youtube.com/embed/7CdY9wQLYuE" frameborder="0" allowfullscreen></iframe>
            <iframe src="https://www.youtube.com/embed/dYIK14S_vHI" frameborder="0" allowfullscreen></iframe>
            <iframe src="https://www.youtube.com/embed/snoS7-Btu28" frameborder="0" allowfullscreen></iframe>
            <iframe src="https://www.youtube.com/embed/G6yOp5Kl-Oo" frameborder="0" allowfullscreen></iframe>
        </div>`,
        `<h3>Expedientes</h3>
        <div style="text-align: center; margin-top: 15px;">
            <a href="https://expedientesdelarepresion.cl/causa/caso-caravana-episodio-valdivia/" target="_blank">
                <img src="./iconos/logo-expedientes-de-la-represion.png" style="max-width: 80%;"> 
            </a>
        </div>`
    );
} else {
        contenido = `<h3><a href="https://memoriaviva.com/nuevaweb/centros-de-detencion/x-region/recinto-cni-en-calle-perez-rosales-no-764-valdivia/" target="_blank"> Recinto CNI Valdivia</a></h3>
        
        <p> En 1981 comienza a funcionar el centro de detencion y tortura ubicado en calle Perez Rosales 764, actualmente Casa de la Memoria de Valdivia.</p>
   
        <p style="font-style: italic;">"Ubicado en calle Pérez Rosales 764<br><br>
        Hubo testimonios de ex presos políticos que denunciaron haber estado en este recinto, ubicado en Pérez Rosales 764 en Valdivia, entre los años 1981 y 1988. La mayor cantidad de detenidos en este lugar se consignó en el año 1986.<br><br>
        La existencia de este centro fue reconocida públicamente en 1984, por la publicación en el Diario Oficial del <a href="./libros/decreto_cm.pdf" target="_blank">Decreto Supremo N° 594 del 14 de junio de 1984.</a><br><br>
        De acuerdo a los testimonios recibidos, esta Comisión pudo establecer que, luego de ser detenidos por este organismo de seguridad, los presos eran conducidos hasta el subterráneo de este recinto, en donde fueron sometidos a interrogatorios y torturas, permanentemente vendados, amarrados y desnudos."</p>
        <p style="font-style: italic; text-align: right;">Informe Valech p 409</p>
        <div style="display: flex; justify-content: space-around; gap: 20px; margin-top: 30px;">
            <div style="text-align: center; cursor: pointer; flex: 1;" onclick="openLibroPDF(124)">
                <img src="./libros/libro_cm/portada.jpg" alt="Portada Libro"
                     style="width: 100%; max-width: 250px; border: 2px solid #ddd; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: all 0.2s;"
                     onmouseover="this.style.transform='scale(1.03)'" onmouseout="this.style.transform='scale(1)'">
            </div>`;
        anioTexto = '1981 - 1988';
    }

    setAnio(anioTexto);
    markercni._panelAbierto = true;
    openPanel(
        contenido,

        `<h3>Registro Audiovisual</h3><br> 
        <div class="galeria">
            <iframe src="https://www.youtube.com/embed/G6yOp5Kl-Oo" frameborder="0" allowfullscreen></iframe>
            <iframe src="https://www.youtube.com/embed/BvJWuSVc8PU" frameborder="0" allowfullscreen></iframe>
        </div>
        <h3>Arpilleras por la memoria</h3><br> 
        <div class="galeria">
            <iframe src="https://www.youtube.com/embed/TobTr6ehhMw" frameborder="0" allowfullscreen></iframe>
            <iframe src="https://www.youtube.com/embed/DU-OxsAvABk" frameborder="0" allowfullscreen></iframe>
            <iframe src="https://www.youtube.com/embed/SE_d2a7kFwg" frameborder="0" allowfullscreen></iframe>
            <iframe src="https://www.youtube.com/embed/gKymlZGmyxY" frameborder="0" allowfullscreen></iframe>
            <iframe src="https://www.youtube.com/embed/7CdY9wQLYuE" frameborder="0" allowfullscreen></iframe>
            <iframe src="https://www.youtube.com/embed/dYIK14S_vHI" frameborder="0" allowfullscreen></iframe>
            <iframe src="https://www.youtube.com/embed/snoS7-Btu28" frameborder="0" allowfullscreen></iframe>
            <iframe src="https://www.youtube.com/embed/G6yOp5Kl-Oo" frameborder="0" allowfullscreen></iframe>
        </div>`,
        `<h3>Expedientes</h3>
        <div style="text-align: center; margin-top: 15px;">
            <a href="https://expedientesdelarepresion.cl/causa/caso-caravana-episodio-valdivia/" target="_blank">
                <img src="./iconos/logo-expedientes-de-la-represion.png" style="max-width: 80%;"> 
            </a>
        </div>`
    );
});

markers.push(markercni);


// Juez Guzman
var markerguzman = L.marker([-39.83307544668858, -73.21536267396671], {icon: memorial});
markerguzman.anio = 2001;
markerguzman.on('click', function() {
    setAnio('2001'); 
    openPanel(`
        <h3> El Juez Guzman toma declaraciones en la región de los Ríos</h3>
        
                   <div class="galeria">
                    <img src="./galerias/prensa/guzman_1.jpg"data-descripcion="Sebastián Rodrigo Rivas Ovalle<br> 23 años, estudiante" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
  
    </div>
        
        
        <p>El juez Juan Guzmán Tapia es una de las figuras más importantes de la 
búsqueda de justicia en la transición chilena. Designado en 1998 para investigar 
la primera querella criminal contra Pinochet, presentada por Gladys Marín por el asesinato
 de su esposo, Guzmán comenzó un proceso que transformó radicalmente su visión del mundo.
  El juez, quien había apoyado el golpe de 1973, se convirtió al enfrentarse con las víctimas 
  y sus familias en el magistrado más tenaz en la persecución de los crímenes de la dictadura. <br><br>
Su aporte jurídico más importante fue la creación de la figura del secuestro permanente en 1998. 
Esta figura establece que mientras no aparezca el cuerpo de un detenido desaparecido, el delito sigue
 ocurriendo en el presente y por lo tanto no prescribe. Con este argumento logró hacer inaplicable la Ley de 
 Amnistía de 1978, abriendo la puerta a cientos de causas que los tribunales habían archivado durante décadas.<br><br>
En el año 2000 logró el primer desafuero de Pinochet como senador vitalicio, procesándolo por 19 delitos de secuestro
 permanente y 57 casos de homicidio en el marco de la Caravana de la Muerte. Fue la primera vez en la historia que un
  ex dictador chileno enfrentaba formalmente a la justicia en su propio país.<br><br>

El año 2001 el juez Guzmán se hizo presente en la región de Los Ríos, tomando declaraciones a los familiares de la AFDD-AFEP de Valdivia en el marco de las investigaciones por los casos de la Caravana de la Muerte en la región. Para las familias fue un momento histórico — por primera vez un juez llegaba hasta ellos, los escuchaba y tomaba en serio sus testimonios después de casi 30 años de lucha.
       </p>
       `
            );
});
markers.push(markerguzman);


// Retén Isla Teja
var marker = L.marker([-39.814784, -73.258046], {icon: CCDD});
marker.anio = 1973;
marker.iconoInicial = CCDD;
marker.on('click', function() {
    setAnio('1973');
    openPanel(
        `<h3><a href="https://memoriaviva.com/nuevaweb/centros-de-detencion/x-region/reten-de-carabineros-isla-teja/" target="_blank">Retén de carabineros de Isla Teja</a></h3>
        <p>El Retén de Carabineros, Isla Teja fue utilizado para la detención de presos políticos de la región.</p>
        <p style="font-style: italic; text-align: right;">Informe Valech p 412</p>`,

    );
});

markers.push(marker);

// Cárcel Isla Teja
var markerisla = L.marker([-39.813046, -73.263345], {icon: CCDD});
markerisla.anio = 1973;
markerisla.anioMemorial = 2018;
markerisla.iconoInicial = CCDD;

markerisla.on('click', function() {
    const anioSlider = parseFloat(document.getElementById('slider-anio').value);

    let contenido, anioTexto;

    if (anioSlider >= 2018) {
        contenido = `<h3>Sitio de Memoria Ex Cárcel de Isla Teja</h3>
            <p>
     <p> <div class="galeria">
               <iframe src="https://www.youtube.com/embed/mc-I5VQCypk" frameborder="0" allowfullscreen></iframe>
 </div>
</p>

            </p>`;
        anioTexto = '2018 - Sitio de Memoria Ex Cárcel de Isla Teja';
    } else {
        contenido = `<h3><a href="https://memoriaviva.com/nuevaweb/centros-de-detencion/x-region/carcel-de-valdivia-carcel-de-isla-teja/" target="_blank">Cárcel Isla Teja</a></h3>
        <p>Hoy Sitio de Memoria Complejo Penitenciario Ex Cárcel de Isla Teja</p>

     <p> <div class="galeria">
<img src="./galerias/memoriales/carcelteja/avila_velsquez_juan_bautista.webp"data-descripcion="Juan Bautista Avila Velásquez, 24 años, Obrero Agricola, militante del MIR. <br><br>Fue torturado en la Cárcel de Isla Teja, salio de la carcél camino a la primera comisaria para obtener su salvoconducto, sin embargo, tras detenerse a descansar nunca mas apareció" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
<img src="./galerias/sin_foto.webp"data-descripcion="Guillermo Pinto Viel, 82 años, Abogado, sin militancia. <br>Fue encerrado en la Cárcel Isla Teja en precarias condiciones hasta enfermar gravemente y morir en el Hospital Kennedy el 23 de Noviembre de 1973." onclick="ampliarFoto(this.src, this.closest('.galeria'))">
               
 
                </div>

 Por la Cárcel Isla Teja pasaron distintas personas que, debido a las vejaciones vividads ahi, murieron :
 <a href="https://www.memoriaviva.com/detenidos-desaparecidos/avila-velasquez-juan-bautista" target="_blank">Juan Bautista Ávila Velásquez</a><br>
 <a href="https://www.memoriaviva.com/ejecutados-politicos/pinto-viel-guillermo" target="_blank">Guillermo Pinto Viel</a><br>



        <p style="font-style: italic;">"En este recinto, ubicado en la Isla Teja, se concentraron los detenidos políticos en el año 1973, 
        y en menor número hasta el año 1989."<br>
<br>Los testimonios consignan que se trataba de un edificio de construcción nueva, inaugurado en 1973. 
Hombres y mujeres permanecían separados. En 1973 los prisioneros
políticos no tenían permiso para ver a sus familiares ni para trabajar. Con el tiempo esta
situación cambió y se permitieron las visitas los días sábado y facilidades para trabajar
en un taller de carpintería.<br>
<br>Los detenidos llegaban en su mayoría en muy malas condiciones físicas y anímicas,
debido a que desde el mismomomento de su detención eran sometidos a malos tratos
e intensos interrogatorios. Ellos procedían de los diversos retenes y comisarías de la
provincia, así como de recintos militares habilitados para este propósito.<br>
<br>De acuerdo a los testimonios recibidos, en 1973 los detenidos eran sometidos a constantes
amenazas. En varias oportunidades, los guardias hacían descargas de metralletas en la
madrugada, simulando operativos de liberación; sufrieron simulacros de fusilamiento,
golpes, fueron obligados a permanecer en prolongadas posiciones forzadas y fueron
hostigados permanentemente. <br><br>
Los detenidos eran sacados del penal durante la noche, por personal del Servicio de
Inteligencia Militar (SIM), que los trasladaban a otros recintos en los cuales eran interrogados y torturados.
Los sitios de tortura más frecuentes, según los testimonios, eran
el Regimiento Cazadores, en cuyo interior funcionaba la Fiscalía Militar, y el cuartel
del Servicio de Inteligencia Militar (SIM) de calle Errázuriz. Volvían a la cárcel en muy
malas condiciones. En el traslado eran también golpeados y amenazados, muchas veces
vendados y amarrados."</p>
        <p style="font-style: italic; text-align: right;">Informe Valech p 407</p>
`;
        anioTexto = '1973 - 1989';
    }

    setAnio(anioTexto);
    markerisla._panelAbierto = true;
    openPanel(
        contenido,
        `
        <div class="galeria">
               <iframe src="https://www.youtube.com/embed/mc-I5VQCypk" frameborder="0" allowfullscreen></iframe>
        </div>`,
        null
    );
});

markers.push(markerisla);

// Primera Comisaría / Fiscalía de Carabineros
var marker = L.marker([-39.817372, -73.235384], {icon: CCDD});
marker.anio = 1973;
marker.on('click', function() {
    setAnio('1973');
    openPanel(
        `<h3><a href="https://memoriaviva.com/nuevaweb/centros-de-detencion/x-region/comisaria-de-carabineros-calle-beaucheff-valdivia/" target="_blank">Primera Comisaria de Valdivia / Fiscalia de Carabineros</a></h3>
        
        <p style="font-style: italic;">"El mayor número de detenidos se concentró durante 1973. 
 Los declarantes señalaron quese trataba de un recinto de reclusión transitorio. Muchos de los detenidos provenían de
otros retenes y comisarías de pueblos y ciudades de la provincia. Luego de permanecer
por un breve período en ese lugar, fueron trasladados a otros, en la misma ciudad de
Valdivia.<br>
<br> Cabe señalar que en el mismo recinto, en otras dependencias, funcionó el Servicio de
Inteligencia de Carabineros (SICAR), que también mantuvo detenidos.<br>
A los detenidos les vendaban los ojos y los amarraban. Al principio permanecían en calabozos tan hacinados que debían dormir de pie. Frecuentemente eran sacados al patio,
donde eran interrogados y torturados.<br>
Sufrieron privación de agua y de alimentos, fueron obligados a permanecer en celdas
permanentemente mojadas con aguas servidas y en posiciones forzadas por tiempo
prolongado. En la década de 1980, relataron, se les aplicó electricidad en diversas partes
del cuerpo y fueron sometidos a tormentos psicológicos." <br>
Los ex presos políticos denunciaron haber sido sometidos a golpes, aplicación de electricidad en la parrilla y picana,
         colgamientos, amenazas, simulacros de fusilamiento, el submarino seco y el mojado."</p>
        <p style="font-style: italic; text-align: right;">Comisión Valech p 399</p>
        
`,
        `<h3>Expedientes</h3>`
    );
});

markers.push(marker);



// Recinto SIM "Palacio de la Risa"
var marker = L.marker([-39.820803, -73.230224], {icon: CCDD});
marker.anio = 1973;
marker.on('click', function() {
    setAnio('1973 - 1975');
    openPanel(
        `<h3><a href="https://memoriaviva.com/nuevaweb/centros-de-detencion/x-region/recinto-sim-palacio-de-la-risa-valdivia/" target="_blank">Recinto SIM "Palacio de la Risa"</a></h3>
    
<p style="font-style: italic;">Estaba ubicado en Av. Ramón Picarte N° 1451. Funcionó entre septiembre de 1973
y el año 1975.

Los detenidos provenían de la ciudad de Valdivia y de otras comunas de la provincia. Unos
permanecían vendados y amarrados y otros en calabozos sin alimento ni agua. Luego, la mayoría era trasladada a otros centros de reclusión, principalmente a la cárcel. Los testimonios
dieron cuenta de diversos tormentos físicos y psicológicos. Sufrieron golpes, aplicación de
electricidad, amenazas, simulacros de fusilamiento, colgamientos y el submarino.</p>
<p style="font-style: italic; text-align: right;"> Comisión Valech p397 </p><br> 
`,

    );
});

markers.push(marker);

// Regimiento Cuartel Bueras
var markerbueras = L.marker([-39.827105, -73.231834], {icon: ejecucion});
markerbueras.anio = 1973.21;
markerbueras.on('click', function() {
    const v = parseFloat(document.getElementById('slider-anio').value);
    if (v >= 1974) {
        setAnio('12 de marzo de 1974');
        openPanel(
            `<h3>Regimiento Cuartel Bueras</h3>
            <div class="galeria">
                <img src="./galerias/sin_foto.webp" data-descripcion="Jorge Eugenio Maldonado Sepúlveda <br>20 años, soltero, soldado conscripto del Ejército de Chile, muerto el 12 de marzo de 1974 en Valdivia, por una herida de bala cráneo encéfalo facial" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
            </div>
            <p style="font-style: italic;"> "De acuerdo con las declaraciones de familiares, el Ejército les informó que el joven se había suicidado con un arma de fuego en la cara, en el interior del Regimiento donde estaba destacado. Un testigo que en esos momentos estaba haciendo el Servicio Militar aseguró que Jorge Maldonado tenía serios problemas con el Servicio de Inteligencia Militar, por su actitud de rechazo a determinadas acciones que se les ordenaba realizar.
            <br><br> No fue posible ubicar el proceso judicial respectivo ni el Protocolo de Autopsia. Considerando los antecedentes reunidos y la investigación realizada por esta Corporación, pese a no haber establecido las circunstancias precisas de su muerte, el Consejo Superior estimó que la decisión de autoeliminarse es atribuible a las condiciones de tensión en que efectivos militares de escasa experiencia cumplían funciones para las que no estaban suficientemente entrenados. Por tal razón, y atendida la época de estos sucesos, declaró a Jorge Eugenio Maldonado Sepúlveda víctima de la violencia política imperante."</p>,
            <p style="font-style: italic; text-align: right;">Informe Rettig</p>`,
            null, null
        );
        return;
    }
    setAnio('20 de septiembre 1973');
    openPanel(
        `<h3>Regimiento Cuartel Bueras</h3>

                <div class="galeria">
    <img src="./galerias/memoriales/regimientobueras/buchhorsts_fernndez_jos_gastn.webp"data-descripcion="José Gastón Buchorsts Fernández <br> 19 años, conscripto." onclick="ampliarFoto(this.src, this.closest('.galeria'))">

    </div>
<p style="font-style: italic;">
    "El mismo 20 de septiembre de 1973 desaparece <a href="https://memoriaviva.com/nuevaweb/detenidos-desaparecidos/desaparecidos-b/buchhorsts-fernandez-jose-gaston/" target="_blank">José Gastón Buchhorsts Fernandez</a>,  de 19 años
botero , quien se encontraba haciendo servicio militar obligatorio en el Regimiento de Cazadores de Valdiva.
<br><br>
Esta persona desaparece desde ese recinto militar, luego de quedar detenido al
presentarse con días de retraso, después de un permiso.  Su familia declara que en
dicho Regimiento, fue informada verbalmente, que había sido ejecutado luego de
intentar una fuga.  Sin embargo, sus restos nunca fueron entregados y su muerte
no se encuentra registrada oficialmente."
<br><br>
La comisión se formó la convicción que el desaparecimiento de 
<a href="https://memoriaviva.com/nuevaweb/detenidos-desaparecidos/desaparecidos-b/buchhorsts-fernandez-jose-gaston/" target="_blank">José Gastón Buchhorsts Fernandez</a>
constituye una violación a los derechos humanos de
 responsabilidad de agentes del Estado, en razón de que se produjo mientras estaba detenido en un recinto militar."</p>
<p style="font-style: italic; text-align: right;"> Informe Rettig p 388 </p>
  
        <p>En este recinto funcionaron:
        <a href="https://memoriaviva.com/nuevaweb/centros-de-detencion/x-region/regimiento-de-artilleria-n-2-maturana-valdivia/" target="_blank">El Regimiento de Artillería N°2 Maturana</a> /
        <a href="https://memoriaviva.com/nuevaweb/centros-de-detencion/x-region/regimiento-de-caballeria-blindada-no-2-cazadores/" target="_blank">El Regimiento Caballería Blindada N°2 Cazadores</a> /
        <a href="https://memoriaviva.com/nuevaweb/centros-de-detencion/x-region/fiscalia-militar-de-valdivia/" target="_blank">La Fiscalia Militar de Valdivia</a></p>
        


        <p style="font-style: italic;">"El mayor número de detenidos se dio entre septiembre y octubre del año 1973.
        <br><br> Se trata de un recinto que concentraba cuatro regimientos ubicados en la ciudad de
Valdivia. Muchos de los prisioneros, hombres y mujeres, fueron trasladados desde
recintos como la cárcel o comisarías de Valdivia y otras ciudades. Varios eran traídos
luego de ser detenidos durante operativos militares en zonas rurales, especialmente
en la precordillera de Valdivia. Los declarantes afirmaron que llegaban en camiones,
hacinados y en muy malas condiciones físicas. Por las características del lugar, es
probable que los detenidos no supieran con certeza en cual de los tres regimientos
se encontraban.<br>
<br>Se los mantuvo al interior del regimiento en el gimnasio, en galpones y en las caballerizas,
incomunicados, encapuchados durante varios días, privados de alimento yagua. Hay víctimas que
 denunciaron haber sido rapadas al ingresar.<br><br>
La Fiscalía Militar de Valdivia funcionó en el Regimiento N° 2 Cazadores, por lo cual
muchos prisioneros fueron llevados desde la cárcel u otros recintos por personal del
Servicio de Inteligencia Militar (SIM) para ser interrogados.<br>
<br>Ex presos políticos denunciaron haber sufrido golpes, algunos con varillas de mimbre;
aplicación de electricidad, simulacros de fusilamiento, el submarino en agua con inmundicias, extracción de uñas, obligación de permanecer en posiciones forzadas, colgamientos
y quemaduras con cigarrillos.<br><br>
Luego de un tiempo eran trasladados a la Comisaría de Valdivia, a la cárcel o al recinto
de reclusión ubicado en el gimnasio del Banco del Estado-Cendyr." </a>
<p style="font-style: italic; text-align: right;">Comision Valech p 396</p><br>




`, null,  `<h3>Expedientes</h3> <br><a href="https://www.pjud.cl/prensa-y-comunicaciones/noticias-del-poder-judicial/141837" target="_blank">Corte de Temuco condena a ex soldados conscriptos por homicidio de compañero en Villarrica en 1973 (2026)</a>
        <br>
        <br><a href="https://share.google/ZTgMZuaYVapXey6HJ" target="_blank">Causa Rol N° 2-2014.- Sentencia dictada por el Ministro en Visita Extraordinaria, don Álvaro Mesa Latorre</a>
        `
    );
});

markers.push(markerbueras);

// Campamento Prisioneros / Gimnasio Cendyr
var markercendyr = L.marker([-39.82898931783156, -73.22762137804432], {icon: CCDD});
markercendyr.anio = 1973;
markercendyr.anioMemorial = 2023.1;
markercendyr.iconoInicial = CCDD;

markercendyr.on('click', function() {
    const anioSlider = parseFloat(document.getElementById('slider-anio').value);

    let contenido, anioTexto;

    if (anioSlider >= 2023) {
        contenido = `<h3>Sitio de Memoria Gimnasio Cendyr</h3>
            <p> <div class="galeria">
               <iframe src="https://www.youtube.com/embed/dLdu1NVzbDY" frameborder="0" allowfullscreen></iframe>
        </div></p>
        El dia 21 de septiembre el Gimnasio Cendyr cambio su nombre a Centro Deportivo Comunitario Valdivia
        “Espacio de Memoria" mediante decreto del Ministerio del Deporte.
<p>
De acuerdo a testimonios recabados en el Informe Valech, este recinto fue 
utilizado en el año 1973 por personal del Ejército para la reclusión y tortura de presos 
políticos, hombres y mujeres, quienes durante su permanencia eran mantenidos 
en una sala del gimnasio de 36 x 26 metros, durmiendo en las graderías del recinto. 
A los prisioneros aquí recluidos, les estaba prohibido salir al aire libre y en cuanto 
ingresaban se les asignaba un número, por el cual sería identificado durante toda 
su estadía en el lugar.<br>
En el Gimnasio CENDYR los detenidos fueron sometidos a golpizas y torturas, 
simulacros de fusilamiento y aplicación de electricidad, para luego ser trasladados 
a interrogatorios al regimiento de caballería, al SIM (Servicio de Inteligencia 
Militar) y al cuartel de Investigaciones de la ciudad de Valdivia, generalmente en 
camiones cerrados.<br>
Este inmueble está identificado en el Catastro de la Memoria, de acuerdo a la 
nómina de inmuebles incluidos por la Comisión Nacional sobre Prisión Política y 
Tortura, de modo que presenta una connotación socio-histórica relevante.
Para continuar con el hito 7, te recomendamos seguir por calle Ángel Muñoz 
hacia la Av. Simpson, para luego llegar a calle Racloma y bajar por ella hasta calle 
Bueras, donde te encontrarás, inmediatamente con el Regimiento Bueras, al que 
no se puede ingresar debido al resguardo militar. No obstante, desde el exterior, 
puedes observar su estructura que se mantiene sin modificaciones. Las caballerizas 
fueron zonas de detención y tortura.<br>
De acuerdo a lo señalado en el Informe Valech, a los detenidos se les recluyó 
transitoriamente en el gimnasio, se realizaron interrogatorios en el casino del 
recinto y se les mantuvo detenidos en galpones y caballerizas.  Posteriormente, los 
detenidos eran trasladados a la Comisaría de Valdivia, a la Cárcel Isla Teja o bien al 
Gimnasio CENDYR.<br>
Para continuar el circuito te recomendamos que una vez que hayas visitado el 
regimiento, camines por la Av. Santiago Bueras dirigiéndote hacia el norte hasta 
llegar a Avenida Picarte. Una vez allí, camina hacia el este hasta llegar al Cementerio 
Alemán y justo al frente encontrarás el edificio de la actual Delegación Presidencial 
de Valdivia y Secretaría Regional Ministerial de Bienes Nacionales, ex cuartel de la 
IV División del Ejército, un edificio público que puedes visitar y conocer


        `;
        anioTexto = '2023 - Sitio de Memoria Gimnasio Cendyr';
    } else {
        contenido = `<h3><a href="https://memoriaviva.com/nuevaweb/centros-de-detencion/x-region/gimnasio-del-cendyr-valdivia/" target="_blank">Campamento de Prisioneros Valdivia (Actual Gimnasio Cendyr)</a></h3>
        <p style="font-style: italic;">"Durante 1973 este recinto, que estaba a cargo del Ejército, se utilizó para la reclusión de presos políticos.
        <br> <br>Los detenidos, hombres y mujeres, provenían en su mayoría de otros recintos. Durante su
permanencia eran mantenidos en una sala del gimnasio de 36 por 26 metros, con camarotes
o camas de campaña, dormían en las graderías del gimnasio. No se les permitía salir al
aire libre y en cuanto ingresaban se les asignaba un número, a modo de identificación;
por ese número serían llamados durante toda su permanencia en el lugar. <br> <br>
Los conducían a interrogatorios al regimiento de caballería, al <a href="https://memoriaviva.com/nuevaweb/centros-de-detencion/x-region/recinto-sim-palacio-de-la-risa-valdivia/" target="_blank">Recinto SIM "Palacio de la Risa"</a> de Valdivia en la calle Errázuriz y al
cuartel de Investigaciones de esta ciudad. Algunos denunciaron haber sido trasladados
en camiones cerrados.
Los declarantes denunciaron también golpes, simulacros de fusilamiento y aplicación
de electricidad."</p>
        <p style="font-style: italic; text-align: right;">Comisión Valech p 398</p>
`;
        anioTexto = '1973';
    }

    setAnio(anioTexto);
    markercendyr._panelAbierto = true;
    openPanel(
        contenido,
        ``,
        null
    );
});

markers.push(markercendyr);


// Tenencia Los Jazmines
var marker = L.marker([-39.821043, -73.211172], {icon: CCDD});
marker.anio = 1973;
marker.on('click', function() {
    setAnio('1973');
    openPanel(
        `<h3><a href="https://memoriaviva.com/nuevaweb/centros-de-detencion/x-region/tenencia-de-carabineros-los-jazmines/" target="_blank">Tenencia de carabineros Los Jazmines</a></h3>
        <p>La Tenencia de Carabineros, Los Jazmines fue utilizada para la detención de presos políticos de la región.</p>
        <p style="font-style: italic; text-align: right;">Comisión Valech p 413</p>`,
        ``
    );
});

markers.push(marker);



// Retén Collico
var marker = L.marker([-39.806373, -73.208712], {icon: CCDD});
marker.anio = 1973;
marker.on('click', function() {
    setAnio('1973');
    openPanel(
        `<h3><a href="https://memoriaviva.com/nuevaweb/centros-de-detencion/x-region/reten-de-carabineros-collico/" target="_blank">Retén de Carabineros Collico</a></h3>
        <p>El retén de carabineros de Collico fue utilizado para la detención de presos políticos de la región.</p>
        <p style="font-style: italic; text-align: right;">Comisión Valech p 413</p>`,
     
    );
});

markers.push(marker);





// Retén de Niebla
var markerniebla = L.marker([-39.8690490, -73.399510], {icon: CCDD});
markerniebla.anio = 1980;
markerniebla.iconoInicial = CCDD;
markerniebla.on('click', function() {
    setAnio('1980');
    openPanel(
        `<h3><a href="https://www.memoriaviva.com/centros-de-detencion/x-region/reten-de-carabineros-niebla" target="_blank">Retén de Niebla</a></h3>
  

<div class="galeria">
        <img src="./galerias/memoriales/reteniebla/pedro_catalan_ojeda.webp"data-descripcion=" Pedro Luis Catalán Ojeda 18 años, soltero, estudiante y trabajador municipal, detenido desaparecido el 19 de enero de 1980 en Valdivia." onclick="ampliarFoto(this.src, this.closest('.galeria'))">
        </div>


  <p>      

   Pedro Luis Catalán Ojeda fue detenido ese día en la localidad de Niebla por efectivos de Carabineros que lo trasladaron
    al retén del lugar. El detenido desapareció desde el recinto policial donde se encontraba recluido. De acuerdo con lo
     declarado por testigos presenciales, en la época de los hechos Pedro Catalán se encontraba de vacaciones en el balneario
      de Niebla. <br>En la madrugada del 19 de enero de 1980, al salir de una discoteca, fue detenido junto con unos amigos por
       Carabineros y trasladado al retén. Después de permanecer quince minutos detenidos, todos fueron liberados sin cargo
        alguno. La tarde de ese mismo día, se fue junto con sus amigos a la playa, donde ingirieron alucinógenos. <br>
        En estas circunstancias, fue nuevamente detenido por carabineros junto con otro joven, en presencia del resto de sus
         amigos. Ambos fueron llevados al retén de Niebla. Al otro día, el amigo recuperó la libertad.
          No ocurrió lo mismo con Pedro Catalán, quien desde entonces se encuentra desaparecido. Familiares declararon 
          que el carabinero a cargo de la referida unidad policial nunca reconoció su detención. La denuncia
           judicial por presunta desgracia presentada en el Segundo Juzgado del Crimen de Valdivia fue sobreseida 
           temporalmente sin que se esclareciera la suerte corrida por Pedro Catalán ni se ubicaran sus restos. <br><br> 
           El expediente judicial se encuentra extraviado. Considerando los antecedentes reunidos y la investigación realizada 
           por esta Corporación, el Consejo Superior llegó a la convicción de que Pedro Luis Catalán Ojeda fue 
           detenido por agentes del Estado y desapareció mientras se encontraba en esa calidad en un cuartel policial.
    Por tal razón, lo declaró víctima de violación de derechos humanos.</p>
        `,

    );
});

markers.push(markerniebla);

// Retén Las Ánimas
var marker = L.marker([-39.816662, -73.226129], {icon: CCDD});
marker.anio = 1973;
marker.on('click', function() {
    openPanel(
        `<h3><a href="https://memoriaviva.com/nuevaweb/centros-de-detencion/x-region/reten-de-carabineros-las-animas/" target="_blank">Ex Retén de Carabineros de las Ánimas</a></h3>
        
        <p>El retén de carabineros de Las Ánimas fue utilizado para la detención de presos políticos de la región.</p>
        <p style="font-style: italic; text-align: right;">Comisión Valech p 413</p>
        
</p>`,
        `<h3>Expedientes</h3>`
    );
});

markers.push(marker);

// Ex Cuartel de Investigacion 
var marker = L.marker([-39.813565, -73.241661], {icon: CCDD});
marker.anio = 1973;
marker.on('click', function() {
    setAnio('1973 - 1975');
    openPanel(
        `<h3>Ex Cuartel de Investigacion</h3>


  <div class="galeria">
        <img src="./galerias/sin_foto.webp"data-descripcion="Erasmo Juvenal Vásquez San Martín,  27 años <br> Muerto por torturas el 13 de mayo de 1987" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
        </div>

<p> <a href="https://www.memoriaviva.com/ejecutados-politicos/vasquez-san-martin-erasmo-juvenal" target="_blank">Erasmo Juvenal Vásquez San Martin</a> murió ese día a las 17:30 horas, 
en el recinto de Investigaciones de Valdivia, por asfixia por ahorcamiento, como lo acredita el Certificado de Defunción.
Según declaraciones de familiares, Erasmo Vásquez fue detenido a las 5:00 horas del día indicado en su domicilio,
 acusado de un delito común, y trasladado al Cuartel de Investigaciones de Valdivia, donde fue encerrado en una celda.<br><br>

De acuerdo con testigos, en el curso de esa mañana fue sacado en tres oportunidades para ser sometido a interrogatorios
 bajo torturas. En la tarde, se le encontró muerto en el calabozo, colgado de las mangas de su camisa. Sin embargo, 
 la pericia policial efectuada sobre éstas no es plenamente concordante con la versión oficial.


            <p style="font-style: italic;">Los detenidos, hombres y mujeres, provenían en su mayoría de otros recintos. Durante su
permanencia eran mantenidos en una sala del gimnasio de 36 por 26 metros, con camarotes
o camas de campaña, dormían en las graderías del gimnasio. N o se les permitía salir al
aire libre y en cuanto ingresaban se les asignaba un número, a modo de identificación;
por ese número serían llamados durante toda su permanencia en el lugar. Los conducían
a interrogatorios al regimiento de caballería, al SIM de Valdivia en la calle Errázuriz y al
cuartel de Investigaciones de esta ciudad. Algunos denunciaron haber sido trasladados
en camiones cerrados.
Los declarantes denunciaron también golpes, simulacros de fusilamiento y aplicación
de electricidad.</p>
   <p style="font-style: italic; text-align: right;">Informe Valech p 389</p>

`,
        `<h3>Expedientes</h3>`
    );
});

markers.push(marker);




// Plazuela Carlos Lorca
var marker = L.marker([-39.830120, -73.209806], {icon: memorial});
marker.anio = 1975;
marker.on('click', function() {
    setAnio('1975');
    openPanel(
        `<h3>Plazuela Carlos Lorca Tobar</h3> 

<a href="https://www.memoriaviva.com/detenidos-desaparecidos/lorca-tobar-carlos-enrique" target="_blank">Carlos Enrique Lorca Tobar</a>."</p>
Detenido desaparecido, Santiago, junio de 1973.
<p> Carlos Lorca tenia 30 años de edad y estaba casado. Era médicoy miembro de la comisión politica del comité central del Partido Socialista. Habia sido diputado por Valdivia
<br><br>
Fue detenido junto a otra persona el dia 25 de junio de 1975 en la via pública por agentes de la DINA. Posteriormente fue visto en Villa Grimaldi. Hasta 
la fecha Carlos Lorca permance Desaparecido.

<p style="font-style: italic; text-align: right;"> Informe Rettig tomo 3 </p>

</p>`,
        `<h3>Expedientes</h3>`
    );
});

markers.push(marker);

// Memorial UACH
var markeruach = L.marker([-39.806129, -73.248338], {icon: memorial});
markeruach.anio = 1994;
markeruach.on('click', function() {
    setAnio(' 30 de septiembre 1994');
    openPanel(
        `<h3>Memorial Universidad Austral de Chile</h3>

         <div class="galeria">

         <img src="./galerias/memoriales/uach/cruz_uach.jpg"data-descripcion="Primera cruz memorial UACH" onclick=" ampliarFoto(this.src, this.closest('.galeria'))">
         <img src="./galerias/memoriales/uach/Uach1.png"data-descripcion="Primera cruz memorial UACH" onclick=" ampliarFoto(this.src, this.closest('.galeria'))">
         <img src="./galerias/memoriales/uach/uach-28.jpg"data-descripcion="Primera cruz memorial UACH" onclick=" ampliarFoto(this.src, this.closest('.galeria'))">
                  
    <img src="./galerias/memoriales/llancahue/barrientos_warner_jos_ren.webp" data-descripcion="Jose René Barrientos Warner<br> 29 años, Estudiante<br> Musico de la cámara de orquesta UACH " onclick="ampliarFoto(this.src, this.closest('.galeria'))">
    <img src="./galerias/memoriales/llancahue/krauss-iturra-victor-fernando-scaled.webp"data-descripcion="Fernando Krauss Iturra <br> 24 años, Estudiante."  onclick="ampliarFoto(this.src, this.closest('.galeria'))">
    <img src="./galerias/memoriales/llancahue/liendo_jose.webp"data-descripcion="José Gregorio Liendo Vera <br> 28 años, Estudiante." onclick=" ampliarFoto(this.src, this.closest('.galeria'))">
    <img src="./galerias/memoriales/uach/appel_de_la_cruz.webp"data-descripcion="José Luis Appel <br> 20 años, Estudiante y militante del MIR." onclick=" ampliarFoto(this.src, this.closest('.galeria'))">
    <img src="./galerias/memoriales/uach/carmen_angelica_delard_cabezas.webp"data-descripcion="Carmen Angelica Delard Cabezas<br> 23 años, Estudiante y militante del MIR." onclick=" ampliarFoto(this.src, this.closest('.galeria'))">
    <img src="./galerias/memoriales/uach/VALENZUELA-SALAZAR-HECTOR-DARIO.jpg"data-descripcion="Héctor Dario Valenzuela Salazar<br> 27 años, Profesor universitario" onclick=" ampliarFoto(this.src, this.closest('.galeria'))">
    <img src="./galerias/memoriales/uach/pardo_pedemonte_sergio_ral.webp"data-descripcion="Sergio Raúl Pardo Pedemonte <br> 25 años, Biologo Marino y militante del MIR." onclick=" ampliarFoto(this.src, this.closest('.galeria'))">
    <img src="./galerias/memoriales/uach/hugo_rivol_vasquez_martinez.webp"data-descripcion="Hugo Rivol Vásquez Martínez <br> 21 años, Estudiante y militante del MIR." onclick=" ampliarFoto(this.src, this.closest('.galeria'))">
    <img src="./galerias/memoriales/uach/pardo_pedemonte_sergio_ral.webp"data-descripcion="Memorial" onclick=" ampliarFoto(this.src, this.closest('.galeria'))">
    <img src="./galerias/memoriales/uach/pardo_pedemonte_sergio_ral.webp"data-descripcion="Memorial" onclick=" ampliarFoto(this.src, this.closest('.galeria'))">
    </div>

        <p>La Piedra Recordatoria a Estudiantes Víctimas de Violación a los Derechos Humanos, recuerda a los jóvenes alumnos de la Universidad Austral de Chile que fueron asesinados
         por agentes del Estado.</p>

         Los estudiantes conmemorados son: 
<br>
<br><a href="https://www.memoriaviva.com/detenidos-desaparecidos/appel-de-la-cruz-jose-luis/" target="_blank">José Luis Appel</a>, 20 años
<br><a href="https://memoriaviva.com/nuevaweb/detenidos-desaparecidos/desaparecidos-b/barrientos-warner-jose-rene/" target="_blank">José René Barrientos Warner</a>, 29 años
<br><a href="https://www.memoriaviva.com/detenidos-desaparecidos/delard-cabezas-carmen-angelica/" target="_blank">Carmen Angélica Delard Cabezas</a>, 23 años
<br><a href="https://memoriaviva.com/nuevaweb/detenidos-desaparecidos/desaparecidos-b/krauss-iturra-victor-fernando/" target="_blank">Fernando Krauss Iturra</a>, 24 años
<br><a href="https://memoriaviva.com/nuevaweb/detenidos-desaparecidos/desaparecidos-b/liendo-vera-jose-gregorio/" target="_blank">José Gregorio Liendo Vera</a>, 28 años
<br> Mario Alejandro Mellado Manríquez
<br><a href="https://www.memoriaviva.com/ejecutados-politicos/valenzuela-salazar-hector-dario/" target="_blank">Héctor Darío Valenzuela, 27 años</a>
<br><a href="https://www.memoriaviva.com/detenidos-desaparecidos/pardo-pedemonte-sergio-raul/" target="_blank">Sergio Raúl Pardo Pedemonte, 25 años</a>
<br><a href="https://www.memoriaviva.com/ejecutados-politicos/vasquez-martinez-hugo-rivol/" target="_blank">Hugo Ribol Vásquez, 21 años</a>
  
        El 10 de enero de 1977, <a href="https://www.memoriaviva.com/detenidos-desaparecidos/appel-de-la-cruz-jose-luis/" target="_blank">José Luis Appel</a>, 20 años fue secuestrado por un grupo de
civiles armados, en plena vía pública de la ciudad de Cipolletti, provincia de Neuquén,
Argentina, ante los ojos de su cónyuge Carmen Angélica DELARD CABEZAS y de su
hija.  Carmen Delard desapareció en la Comisaría de esa ciudad al hacer la denuncia de la
desaparición de su cónyuge.
<p style="font-style: italic; text-align: right;"> Informe Rettig p 872 </p>

      
`,
        `<h3>Expedientes</h3>`
    );
});

markers.push(markeruach);


// Memorial por la Vida
var markercementerio = L.marker([-39.829300, -73.215533], {icon: memorial});
markercementerio.anio = 2001.1;
markercementerio.on('click', function() {
    setAnio('10 de diciembre de 2001');
    openPanel(
        `<h3>Memorial por la vida</h3>

                 <div class="galeria">
  <iframe src="https://www.youtube.com/embed/wvomdPilkK8" frameborder="0" allowfullscreen></iframe>
  <img src="./galerias/memoriales/cementerio/memorial_cementerio.jpg"data-descripcion="" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
  </div>
<p>

  "El año 2000 la AFDD-AFEP Valdivia con el fin de hacer una
reparación simbólica para las víctimas de las violaciones al
derecho a la vida ocurridas en Valdivia durante el gobierno
militar ya que en la provincia están reconocidas 116 víctimas
de estas violaciones. Por ello presentamos esta iniciativa con el
diseño del escultor Alejandro Verdi, quien junto a la secretaria
de la AFDD-AFEP para instalar la obra en el patio 24, fila 02,
sepultura 28 y 29 folio 3558 del Cementerio Municipal.
<br><br>
Esta idea que pasó a ser este proyecto, nació de la exhumación
de los restos de los mártires de Chihuio el 26 de julio de 2000
con el fin de que no queden en el olvido nuestros seres queridos
fue que trabajamos incansablemente hasta hacerlo realidad.
<br>
Como esta sepultura del Cementerio Municipal era de
propiedad de la Gobernación le solicitamos a la Sra. Marta
Meza, gobernadora de Valdivia, autorización para levantar
un memorial, la que fue aprobada el 25 de agosto de 2000.
<br>
Para conseguir recursos económicos vicepresidenta Juana Mora
y secretaria Ida Sepúlveda presentaron el proyecto el 14 de
febrero a la gobernadora, quien lo canalizó al Ministerio del
Interior para financiar con el Fondo Social ya que la agrupación
no tiene personalidad jurídica (presentaron el proyecto). En
la resolución 8588 del 05 de julio de 2001 del Ministerio del
Interior se nos comunica la aprobación de los recursos el
21 de agosto de 2001. El memorial fue inaugurado el 09 de
diciembre de 2001.
<br><br>
Esta mano la hizo Alejandro Verdi Zamora, un compañero miracho que es escultor, 
pesa 800 kilos. Fue una epopeya instalarla."
</p>
        <div style="display: flex; justify-content: space-around; gap: 20px; margin-top: 20px;">
            <div style="text-align: center; cursor: pointer; flex: 1;" onclick="openLibroPDF(30)">
                <img src="./libros/libro_cm/portada.jpg" alt="Portada Libro" style="width: 100%; max-width: 250px; border: 2px solid #ddd; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: all 0.2s;" onmouseover="this.style.transform='scale(1.03)'" onmouseout="this.style.transform='scale(1)'">
            </div>
</div>`,
        `
iv>
        
        
        `,  `<h3>Expedientes</h3>`
    );
});

markers.push(markercementerio);


// =============================================
// PANGUIPULLI
// =============================================

// Comisaría Panguipulli
var markermatus = L.marker([-39.641441, -72.336967], {icon: CCDD});
markermatus.anio = 1974.1;
markermatus.on('click', function() {
    setAnio('15 de enero de 1974');
    openPanel(
        `<h3><a href="https://memoriaviva.com/nuevaweb/centros-de-detencion/x-region/comisaria-de-carabineros-panguipulli/" target="_blank">Quinta Comisaria de carabineros de Panguipulli</a></h3>
        
        
                                             <div class="galeria">
  <img src="./galerias/sin_foto.webp"data-descripcion="Victor Matus Hermosilla<br> 39 años, obrero maderero" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
  </div>
        

        <p style="font-style: italic;">"La mayor cantidad de detenidos en este recinto se registró en el año 1973. Parte de
los presos, según los testimonios, provenía de retenes de la precordillera (Neltume,
Futrono, Liquiñe y Choshuenco) y fueron detenidos en operativos conjuntos con el
Ejército en asentamientos campesinos y en la zona del Complejo Maderero Panguipulli.<br>
<br> A la comisaría ingresaron en muy malas condiciones físicas, fueron desnudados,
mojados y encerrados en calabozos muy húmedos. Los declarantes señalaron que
permanecieron siempre incomunicados y muchos amarrados con alambre de púas.
Eran conducidos al subterráneo del recinto o a las caballerizas para ser sometidos a
interrogatorios y torturas; aunque muchos denunciaron que ni siquiera se les interrogaba, sino que sólo eran torturados.<br>
<br> Desde aquí, por lo general, eran trasladados a
la ciudad de Valdivia, a la cárcel, al Servicio de Inteligencia Militar (SIM), al regimiento
o a campos de prisioneros.Los ex presos políticos denunciaron haber sufrido el submarino, golpes con co1igües,
haber sido pisoteados y amenazados constantemente."</p>

        <p style="font-style: italic; text-align: right;">Comisión Valech p 403</p>

<p style="font-style: italic;"> "<a href="https://memoriaviva.com/nuevaweb/ejecutados-politicos/ejecutados-politicos-m/matus-hermosilla-victoriano/" target="_blank">Victoriano Matus Hermosilla</a>
  , de 39 años, era obrero del Complejo Maderero y Forestal Panguipulli.
Sin tener militancia política, había estado vinculado con algunos miembros del Movimiento Campesino
Revolucionario (MCR) y con militantes del Movimiento de Izquierda Revolucionaria, MIR.  Fue detenido con
posterioridad al 11 de septiembre de 1973, recuperando días después su libertad.  Según testimonios recibidos,
el 15 de enero de 1974, fue nuevamente detenido por Carabineros de Panguipulli.  Al cabo de algunos días, su
familia fue informada de su traslado a Valdivia, adonde nunca llegó, pues resultó muerto en el camino en
circunstancias que no se han podido determinar."</p>
<p style="font-style: italic; text-align: right;"> Informe Rettig p 1172</p><br>  

`,
        ``, 
        `<h3>Expedientes</h3>
        <div style="text-align: center; margin-top: 15px;">
            <a href="https://expedientesdelarepresion.cl/causa/harry-cohen-vera/" target="_blank">
                <img src="./iconos/logo-expedientes-de-la-represion.png" style="max-width: 80%;">
            </a>
        </div>

        <br><a href="https://www.pjud.cl/prensa-y-comunicaciones/noticias-del-poder-judicial/91641" target="_blank">Noticia Poder Judicial sobre caso Victor Matus Hermosilla</a>
        
        `
    );
});

markers.push(markermatus);

//Gimnasio municipal Pangui
var markergp = L.marker([-39.64158180366318, -72.33180351941546], {icon: CCDD});
markergp.anio = 1973;
markergp.anioMemorial = 2017.3;
markergp.iconoInicial = CCDD;

markergp.on('click', function() {
    const anioSlider = parseFloat(document.getElementById('slider-anio').value);

    let contenido, anioTexto;

    if (anioSlider >= 2017.3) {
        contenido = `<h3>Sitio de Memoria Gimnasio Municipal Edgardo Brevis</h3>
        <p>
        El 1 de diciembre de 2017, con la presencia de miembros de la Agrupación de Ex Presos Políticos 
        de la comuna de Panguipulli, autoridades regionales, comunales y público en general, se realizó 
        el acto de instalación de una placa recordatoria en el Gimnasio Municipal Eduardo Brevis Aravena, 
        recinto deportivo utilizado como centro de detención y tortura tras el golpe de Estado de 1973.<br><br>
Roberto Alarcón, presidente de la Agrupación de Ex Presos Políticos, habló en nombre de sus compañeros: 
“es una pequeña, pero no menos significativa ceremonia de instalación de la placa en conmemoración 
de los ex presos políticos que fueron torturados en este gimnasio y el sentimiento que me embarga es de
 reconciliación con el pasado, con la mirada en el futuro para que nunca más vuelva a ocurrir algo similar."
<br><br>
La placa, colocada en el ingreso al recinto deportivo, reza: “Este inmueble fue un centro
 de detención en dictadura militar y es sitio de interés en la Ruta Patrimonial de la Memoria y
  Derechos Humanos del Ministerio de Bienes Nacionales".</p>`;
        anioTexto = '2017 - Placa recordatoria Gimnasio Municipal Edgardo Brevis';
    } else {
        contenido = `<h3>Gimnasio Municipal Edgardo Brevis de Panguipulli</h3>
      
        <p>El recinto deportivo fue utilizado como centro de detención y tortura tras el golpe de Estado de 1973.</p>
        <p style="font-style: italic; text-align: right;">Ruta de la Memoria Región de los Ríos</p>
`;
        anioTexto = '1973';
    }

    setAnio(anioTexto);
    markergp._panelAbierto = true;
    openPanel(
        contenido,
        ``,
        `<h3>Expedientes</h3>`
    );
});

markers.push(markergp);




// Casa Administración Fundo Releco
var marker = L.marker([-39.627591, -72.138181], {icon: CCDD});
marker.anio = 1973;
marker.on('click', function() {
    setAnio('1973');
    openPanel(
        `<h3><a href="https://memoriaviva.com/nuevaweb/centros-de-detencion/x-region/casa-de-administracion-fundo-releco/" target="_blank">Casa de Administración Fundo Releco</a></h3>
        <p>La Casa de Administración Fundo "Releco" en Panguipulli fue utilizada como lugar de detención de presos políticos.</p>
        <p style="font-style: italic; text-align: right;">Comision Valech p 411</p>`,
        `<h3>Expedientes</h3>`
    );
});

markers.push(marker);

// =============================================
// LIQUIÑE / NELTUME / CORDILLERA
// =============================================

// Campamento Militar Liquiñe
var marker = L.marker([-39.731076, -71.852518], {icon: CCDD});
marker.anio = 1973.6;
marker.on('click', function() {
    setAnio('1973');
    openPanel(
        `<h3><a href="https://memoriaviva.com/nuevaweb/centros-de-detencion/x-region/campamento-militar-liquine/" target="_blank">Campamento militar de Liquiñe</a></h3>
        <p>El Campamento Militar Liquiñe fue utilizado como lugar de detención de presos políticos.</p>
        <p style="font-style: italic; text-align: right;">Comision Valech p 412</p>`,
        `<h3>Expedientes</h3>`
    );
});

markers.push(marker);

// Retén Liquiñe
var marker = L.marker([-39.747389, -71.855621], {icon: CCDD});
marker.anio = 1973.6;
marker.on('click', function() {
    setAnio('1973');
    openPanel(
        `<h3><a href="https://memoriaviva.com/nuevaweb/centros-de-detencion/x-region/reten-de-carabineros-liquine/" target="_blank">Retén de carabineros de Liquiñe</a></h3>
        <p>El retén de Liquiñe fue utilizado como lugar de detención de presos políticos.</p>
        <p style="font-style: italic; text-align: right;">Comision Valech p 412</p>`,
        `<h3>Expedientes</h3>`
    );
});

markers.push(marker);

// Retén Neltume
var marker = L.marker([-39.851113, -71.947269], {icon: CCDD});
marker.anio = 1973;
 marker.anioMemorial = 2025;
marker.iconoInicial = CCDD;
marker.on('click', function() {
    setAnio('1973');
    openPanel(
        `<h3><a href="https://memoriaviva.com/nuevaweb/centros-de-detencion/x-region/reten-de-carabineros-neltume/" target="_blank">Retén de carabineros de Neltume</a></h3>
        <p style="font-style: italic;">"Este retén fue utilizado en el año 1973. 
        La mayoría de los testimonios recibidos sobre ese año fueron hombres del Complejo Maderero Panguipulli., detenidos en operativos conjuntos de carabineros
y militares, también con la participación de algunos civiles. Según dichos testimonios,
se les interrogaba en relación con el asalto del retén de Neltume. <br>
<br> Ingresados al recinto, eran mantenidos en calabozos o en las pesebreras con cerdos y caballos, incomunicados,
con los ojos vendados y amarrados mientras eran interrogados y torturados.
Los ex prisioneros denunciaron haber sufrido golpes, amenazas, introducción de líquido
a presión por la nariz, azotes con ramas de ortiga y pinchazos de agujas en los testículos.
Varios testigos denunciaron haber sido obligados a permanecer en una casa de perro."</p>
        <p style="font-style: italic; text-align: right;">Informe Valech p 404</p>
        
"Valdivia, Complejo Maderero y
Forestal Panguipulli, se produjo una tentativa fracasada de asalto al retén de
Neltume.  La realizaron elementos de izquierda extrema de aquel complejo,
especialmente miembros del Movimiento Campesino Revolucionario (MCR),
rama del MIR, que tras su fracaso y sin que hubiera víctimas, se dispersaron sin
efectuar nuevas operaciones.
<p style="font-style: italic; text-align: right;"> Informe Rettig p 94 </p><br>

`,
        `<h3>Expedientes</h3>`
    );
});

markers.push(marker);

// Campamento Puerto Fuy / Pirihueico
var marker = L.marker([-39.871893, -71.893167], {icon: CCDD});
marker.anio = 1973;
marker.on('click', function() {
    setAnio('1973');
    openPanel(
        `        
        <h3><a href="https://memoriaviva.com/nuevaweb/centros-de-detencion/x-region/campamento-militar-puerto-fuy-pirihueico/" target="_blank">Campamento militar Puerto Fuy / Pirehueico</a></h3>
        <p>El Campamento Militar Puerto Fuy / Pirihueico fue utilizado por el Ejército para la detención de presos políticos en los meses subsiguientes al 11 de Septiembre 1973.</p>
        
        <p style="font-style: italic; text-align: right;">Comision Valech p 412</p>`,
        `<h3>Expedientes</h3>`
    );
});
markers.push(marker);

// Tenencia Pirihueico
var marker = L.marker([-40.025581, -71.721359], {icon: CCDD});
marker.anio = 1973;
marker.on('click', function() {
    setAnio('1973');
    openPanel(
        `<h3><a href="https://memoriaviva.com/nuevaweb/centros-de-detencion/x-region/tenencia-de-carabineros-de-pirehueico-panguipulli/" target="_blank">Tenencia fronteriza de carabineros de Pirihueico</a></h3>
         
        <div class="galeria">
  <img src="./galerias/sin_foto.webp"data-descripcion="Luis Arturo Barria Umaña<br> 39 años, obrero maderero" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
  </div>
      
  
  <p><a href="https://memoriaviva.com/ejecutados-politicos/barria-umana-luis-arturo" target="_blank">Luis Barra Umaña</a>, 31 años, casado, Cabo de Carabineros,
         muerto el 11 de diciembre de 1973 en Pirihueico, Valdivia. Abdominales, 
         complicadas de roturas viscerales múltiples, como lo acredita el Certificado de Defunción. 
         De acuerdo con declaraciones de sus familiares, Luis Barra, quien se desempeñaba en la Tenencia de
          Carabineros de Pirihueico, había solicitado su traslado a Valdivia, denunciando irregularidades en su 
          unidad policial. Al recibir la aceptación de su solicitud, tuvo una discusión con el teniente a cargo del recinto 
          policial, quien le disparó una ráfaga de metralleta, ocasionándole la muerte en forma inmediata
        
  
`,
        `<h3>Expedientes</h3>`
    );
});
markers.push(marker);

// Retén Choshuenco
var marker = L.marker([-39.837410, -72.084467], {icon: CCDD});
marker.anio = 1973;
marker.on('click', function() {
    setAnio('1973 / 1981');
    openPanel(
        `<h3><a href="https://memoriaviva.com/nuevaweb/centros-de-detencion/x-region/reten-de-carabineros-choshuenco/" target="_blank">Reten de carabineros de Choshuenco</a></h3>
        <p style="font-style: italic;">"De acuerdo con los antecedentes, este retén se utilizó en el año 1973. 
        Sólo se denunciaron algunos casos en la década de 1980.
        Según los testimonios, al igual que en el caso del retén de Neltume, la mayoría de los
hombres detenidos en 1973 provenían del Complejo Maderero Panguipulli y 
apresados durante la ocupación militar de la zona, en operativos en los que participaban
militares, civiles y carabineros de los retenes de este sector precordillerano de la provincia
de Valdivia.
Los testigos denunciaron que en el cuartel policial actuaba personal del Ejército, interrogando y torturando a los prisioneros.<br>
<br> Los casos del año 1981 se relacionaron con detenciones de militantes del MIR que
ingresaron clandestinamente a la zona del complejo. Los detenidos, luego de haber
permanecido un tiempo en este recinto, fueron conducidos a Panguipulli y a Valdivia.
Los testimonios señalan que sufrieron golpes, vejaciones sexuales, amenazas, fueron
amarrados y mojados con agua fría, padecieron simulacro de fusilamiento y corte de
pelo y bigotes con yataganes. </p>
        <p style="font-style: italic; text-align: right;">Informe Valech p 404</p>`,
        `<h3>Expedientes</h3>`
    );
});

markers.push(marker);

// Ex-Hotel Pirihueico
var marker = L.marker([-40.026590, -71.724451], {icon: CCDD});
marker.anio = 1973;
marker.on('click', function() {
    setAnio('1973');
    openPanel(
        `<h3>Ex-Hotel Pirihueico</h3>
<p>El Hotel Pirehueico fue un lugar donde en los días posteriores al Golpe de Estado los militares llevaban a obreros y trabajadores del Complejo Forestal y Maderero Panguipulli, los que eran torturados en los subterráneos del inmueble.</p>
        <p style="font-style: italic; text-align: right;">Ruta de la Memoria Región de los Ríos</p>`,
        `<h3>Expedientes</h3>`
    );
});

markers.push(marker);

// Memorial Liquiñe
var markermemoliquine = L.marker([-39.746590, -71.852240], {icon: memorial});
markermemoliquine.anio = 1992;

markermemoliquine.on('click', function() {
    const anioSlider = parseFloat(document.getElementById('slider-anio').value);
    if (anioSlider < 1995) {
        setAnio('1992');
        openPanel(
            `<h3>Familiares Inician Memorial de Liquiñe</h3>
            <div class="galeria">
                <img src="./galerias/memoriales/liquine/Liquine_1992.jpg" data-descripcion="" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
            </div>
            
    <p> Sí, es que no hallábamos cómo hacerlo para
recordarlos, porque ya se sabía realmente que los habían
fusilado y para tener un lugar donde recordarlo entonces alguien
me dijo, no sé qué persona me dijo, ¿y no se podrá conseguir
ahí un espacio en el cementerio?. Entonces yo sí le dije a otra
que me ayudó y ella qué tenía que ver con la junta de vecinos,
no sé si era la secretaria y ella me dijo “yo las voy a ayudar y
vamos a conseguir un pedazo de tierra"[...]
<br><br>
Entre nosotros, o sea 2 familias. Mi marido puso el
trabajo y un hijo de un desaparecido aportó con todo el material.
Ese caballero vino a trabajar con su señora; la mujer trabajaba
como un hombre y después se acoplaron dos personas más,
pero poco. Pero por lo general fuimos dos familias. Él era de la
familia Rivas, vive en Argentina, de allá vino hacer este trabajo
acá a Liquiñe.[...]
<br><br>
De primera sí. Me daba un poquitito y ahí la Gisella
Ga me daba ánimo, no, me decía ella, si de aquí en adelante
vamos a triunfar nosotros, no tenga miedo, echémosle pa
delante no más. Y ella nos llevó, la primera vez que conocí
Valdivia, ella nos llevó, la Guisela Ga, cuando entregaron un
libro allá en Valdivia. Porque yo apurao conocía Panguipulli
y Villarrica. Y ella nos llevó y nos trajo, porque ella era amiga
y había estudiado con las personas que vinieron a hacer el
primer informe de los detenidos desaparecidos aquí en
Liquiñe. Parece que era del CODEPU, no sé, yo me olvidé.
Entonces ahí anduvimos muy bien atendidas con la señora
Zoila en un tremendo restoran al lado del río en Valdivia,
estuvimos muy regaloneadas. Y ahí nos juntamos con hartas
personas de distintas partes que tenían sus casos.[...]
<br><br>
No yo no conocía Valdivia, si la Guisela Ga nos
anduvo traendo, casi de la mano nos andaba traendo (risas).
Yo en eso le agradezco mucho a esa mujer, porque cuando le
decía: tengo miedo, porque fulano me puede echar al agua,
o me puede pasar algo… no me decía ella, ahora no tenga
miedo, si ahora vamos a triunfar nosotros y me daba ánimo
pa que participara po… y de ahí en adelante, no me pararon
más (risas). Cuando nos llamaban a reuniones, allá íbamos,
porque nosotras también firmamos el libro grande para la
organización
 <p style="font-style: italic; text-align: right;">Domitila Curiñanco Reyes</p>`,
            null, null
        );
        return;
    }
    setAnio('15 de marzo de 1995');
    openPanel(
        `<h3>Memorial de Liquiñe</h3>

        <div class="galeria">
            <iframe src="https://www.youtube.com/embed/r6hhX9qJvUI" frameborder="0" allowfullscreen></iframe>
    <img src="./galerias/memoriales/liquine/Liquine_1992.jpg" data-descripcion="" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
    </div>

   
“</p>`,
        ``,
        `<h3>Expedientes</h3>
        <div style="text-align: center; margin-top: 15px;">
            <a href="https://expedientesdelarepresion.cl/causa/episodio-liquine/" target="_blank">
                <img src="./iconos/logo-expedientes-de-la-represion.png" style="max-width: 80%;">
            </a>
        </div>`
    );
});

markers.push(markermemoliquine);

// Memorial Neltume
var markermemoneltume = L.marker([-39.850383, -71.945767], {icon: memorial});
markermemoneltume.anio = 1999;
markermemoneltume.on('click', function() {
    setAnio('13 de marzo de 1999');
    openPanel(
        `<h3>Memorial de Neltume</h3>

        <div class="galeria">
            <iframe src="https://www.youtube.com/embed/n5oEyd-sLNE" frameborder="0" allowfullscreen></iframe>
  <img src="./galerias/memoriales/neltume/neltume_1.jpg" data-descripcion="" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
        </div>
“El 25 de agosto de 1998 la agrupación solicita el espacio para
instalar un memorial en Neltume, gestiones realizadas por la
secretaria de la AFDD-AFEP de Valdivia Ida Sepúlveda, solicitud
que fue muy bien acogida por el alcalde Andrés Sandoval y
concejo de la alcaldía de Panguipulli en la cual, por no tener
personalidad jurídica se le solicita de parte de la agrupación al
CODEPU de Valdivia oficio con personalidad jurídica, documento
que fue entregado al municipio de Panguipulli con copia para
la Agrupación de familiares de Valdivia. El memorial fue
inaugurado el 13 de marzo de 1999 en la localidad de Neltume,
una escultura donada por su autor, Alejandro Verdi."
        
        <div style="display: flex; justify-content: space-around; gap: 20px; margin-top: 20px;">
            <div style="text-align: center; cursor: pointer; flex: 1;" onclick="openLibroPDF(108)">
                <img src="./libros/libro_cm/portada.jpg" alt="Portada Libro" style="width: 100%; max-width: 250px; border: 2px solid #ddd; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: all 0.2s;" onmouseover="this.style.transform='scale(1.03)'" onmouseout="this.style.transform='scale(1)'">
            </div>
</div>`,
        `<h3>Expedientes</h3>`
    );
});

markers.push(markermemoneltume);

// Museo de la Memoria Neltume
var marker = L.marker([-39.849068592154566, -71.94588809927382], {icon: memorial});
marker.anio = 1990;
marker.on('click', function() {
    setAnio('1990');
    openPanel(
        `<h3>Museo de la memoria Neltume</h3>
`,
        `<h3>Expedientes</h3>`
    );
});

markers.push(marker);





// Retén Riñihue
var marker = L.marker([-39.819882, -72.442796], {icon: CCDD});
marker.anio = 1973;
marker.on('click', function() {
    setAnio('1973');
    openPanel(
        `<h3><a href="https://memoriaviva.com/nuevaweb/centros-de-detencion/x-region/reten-de-carabineros-rinihue/" target="_blank">Retén de carabineros de Riñihue</a></h3>
        <p>El retén de carabineros de Riñihue fue utilizado como lugar de detención de presos políticos.</p>
        <p style="font-style: italic; text-align: right;">Informe Valech p 413</p>`,
        `<h3>Expedientes</h3>`
    );
});

markers.push(marker);


// =============================================
// FUTRONO
// =============================================

// Comisaría Futrono
var marker = L.marker([-40.127781, -72.393749], {icon: CCDD});
marker.anio = 1973;
marker.on('click', function() {
    setAnio('1973 - 1974');
    openPanel(
        `<h3><a href="https://memoriaviva.com/nuevaweb/centros-de-detencion/x-region/comisaria-de-carabineros-futrono/" target="_blank">Comisaria de carabineros de Futrono</a></h3>

        <p style="font-style: italic;">"Según consta de los antecedentes, la gran mayoría de casos se registró en los años 1973 y 1974.
        <br><br>En el año 1973 las detenciones se produjeron en los asentamientos campesinos y en el
Complejo Maderero Panguipulli, durante operativos militares realizados en conjunto
con Carabineros y civiles, según señalaron los declarantes. Esta comisaría se constituyó
en un recinto de tránsito, interrogatorios y torturas. De acuerdo a los testimonios,
un gran número de campesinos fue traído en helicópteros desde la isla Huapi, en el
Lago Ranco. Al interior de la comisaría eran interrogados y torturados por militares
en el sector de las caballerizas; el resto del tiempo eran mantenidos en calabozos,
hacinados y sucios, incomunicados, vendados, sin alimento, sin baño ni agua." </p>
        <p style="font-style: italic; text-align: right;">Informe Valech p 403</p>

`,
        ``, 
        `<h3>Expedientes</h3>
        <div style="text-align: center; margin-top: 15px;">
            <a href="https://expedientesdelarepresion.cl/causa/harry-cohen-vera/" target="_blank">
                <img src="./iconos/logo-expedientes-de-la-represion.png" style="max-width: 80%;">
            </a>
        </div>`
    );
});

markers.push(marker);

// Colegio María Deogracia
var marker = L.marker([-40.131416, -72.389006], {icon: CCDD});
marker.anio = 1973;
marker.on('click', function() {
    setAnio('1973');
    openPanel(
        `<h3>Colegio Maria Deogracia</h3>
<p>Durante el operativo de gran envergadura en el sector denominado “Baños de Chihuío", por parte de la IV División del Ejercito, 
 en el cual participaron miembros de la Fuerza Aérea, boinas Verdes de la Escuela de Montaña (con asiento en Temuco), conscriptos del Regimiento “Cazadores" y “Maturana" y civiles de la localidad, 
  detuvieron y dieron muerte a 18 personas, en su mayoría miembros del Sindicato Campesino “Esperanza del Obrero".<br>
  La caravana militar se hospedo en Futrono en la Escuela Particular Nº 45 Maria DeoGracia en Balmaceda 280,
 Futrono (hoy Colegio Maria DeoGracia). <br> Esta escuela era perteneciente a las religiosas Franciscanas del Sagrado Corazón de Purulón, 
 y por invitación directa de las mojas que dirigían dicho establecimiento educacional los militares utilizaron este recinto para la detencion
 y tortura de presos politicos. <br>

<br> El testimonio de uno de los conscripto del Regimiento “Cazadores" que participo en dicho operativo, 
asegura que ellos albergaron en esta escuela a invitación de las religiosas, donde se hicieron asados y comilonas, 
mientras los presos políticos de la localidad, que habían sido trasladado desde la Comisaría de Carabineros de Futrono, 
eran interrogados en las aulas de la escuela.</p>
        <p style="font-style: italic; text-align: right;">Memoria Viva</p>`,
        `<h3>Expedientes</h3>`
    );
});

markers.push(marker);

// Sede Sindicato Chabranco
var marker = L.marker([-40.233055, -71.958596], {icon: CCDD});
marker.anio = 1973;
marker.on('click', function() {
    setAnio('1973.5');
    openPanel(
        `<h3><a href="https://memoriaviva.com/centros-de-detencion/x-region/bodega-edifico-del-sindicato-esperanza-del-obrero-chabranco" target="_blank">Sede Sindicato esperanza del obrero de Chabranco</a></h3>
       
        <div class="galeria">
    <img src="./galerias/memoriales/chihuio/acua_insotroza_carlos_maximiliano.webp"data-descripcion="Carlos Maximiliano Acuña Inostroza <br> 46 años, Obrero maderero" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
    <img src="./galerias/memoriales/chihuio/garca_cancino_narciso_segundo.webp"data-descripcion="Narciso Segundo Cancino Garcia <br> 31 años, Obrero Maderero y militante del PS" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
    <img src="./galerias/memoriales/chihuio/mendez_daniel.webp"data-descripcion="Daniel Mendez Mendez <br> 42 años, Obrero maderero" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
    <img src="./galerias/sin_foto.webp"data-descripcion="Fernando Adrián Mora Gutierrez<br> 17 años, Obrero maderero" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
    <img src="./galerias/sin_foto.webp"data-descripcion="Sebastián Mora Osses<br> 47 años, Obrero maderero" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
    <img src="./galerias/memoriales/chihuio/vargas_ruben.webp"data-descripcion="Rubén Vargas Quezada<br>56 años, Obrero" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
    <img src="./galerias/memoriales/chihuio/barriga_soto_jos_orlando.webp"data-descripcion="José Orlando Barriga Soto<br>32 años, Herrero" onclick="ampliarFoto(this.src, this.closest('.galeria'))"> 
     </div>
        <p>La Bodega del edificio del Sindicato “Esperanza del Obrero" se ubica en las cercanías
de Chabranco. Fue utilizada como centro de detención y tortura, específicamente,
de los miembros del mismo Sindicato, antes de ser asesinados en el fundo “Chihuío".
<br>
Los delitos fueron calificados en la acusación de oficio como secuestro y fueron
perpetrados en la localidad de Chabranco, las víctimas de estos delitos fueron:<br>
<br> <a href="https://memoriaviva.com/nuevaweb/ejecutados-politicos/ejecutados-politicos-a/acuna-inostroza-carlos-maximiliano/" target="_blank">Carlos Maximiliano Acuña Inostroza</a>, 46 años
<br> <a href="https://memoriaviva.com/nuevaweb/ejecutados-politicos/ejecutados-politicos-g/garcia-cancino-narciso-segundo/" target="_blank">Narciso Segundo Garcia Cancino</a>, 31 años
<br> <a href="https://memoriaviva.com/nuevaweb/ejecutados-politicos/ejecutados-politicos-m/mendez-mendez-daniel/" target="_blank">Daniel Mendez Mendez</a>, 42 años
<br> <a href="https://www.memoriaviva.com/ejecutados-politicos/mora-gutierrez-fernando-adrian" target="_blank">Fernando Adrián Mora Gutierrez</a>, 17 años
<br> <a href="https://memoriaviva.com/nuevaweb/ejecutados-politicos/ejecutados-politicos-m/mora-osses-sebastian/" target="_blank">Sebastián Mora Osses</a>, 47 años
<br> <a href="https://memoriaviva.com/nuevaweb/ejecutados-politicos/ejecutados-politicos-v/vargas-quezada-ruben/" target="_blank">Rubén Vargas Quezada</a>, 56 años
<br> <a href="https://www.memoriaviva.com/ejecutados-politicos/barriga-soto-jose-orlando" target="_blank">José Orlando Barriga Soto</a>, 32 años
<br>
<br>
Todos ellos trabajaban en el Complejo Forestal y Maderero Panguipulli y eran
integrantes del Sindicato Campesino “Esperanza del Obrero". Varios de ellos no
tenían militancia política, pero si participaban activamente en esta organización.
Fueron detenidos el 9 de octubre de 1973 en la localidad de Chabranco, por
efectivos militares de los Regimientos Cazadores y Maturana, quienes los trasladaron
hasta el sector de los Baños de Chihuío. Allí les dieron muerte y los sepultaron
clandestinamente. A fines del año 1978, los cadáveres fueron desenterrados por
personal de civil y posteriormente se encargaron de hacerlos desaparecer.
<p style="font-style: italic; text-align: right;">Ruta de la Memoria Región de los Ríos</p></p>`,
        `
          <div class="galeria">
               <iframe src="https://www.youtube.com/embed/BngiH2YNf4" frameborder="0" allowfullscreen></iframe>
        </div>`,
        `<h3>Expedientes</h3>`
    );
});

markers.push(marker);





// Exhumación Comandante PEPE
var markerexhumacion = L.marker([-39.829593349696204, -73.21842024488174], {icon: invisible});
markerexhumacion.anio = 1991;
markerexhumacion.on('click', function() {
    setAnio('1991 Exhumación del José Gregorio Liendo ');
    openPanel(
         `    
         <h3>Exhumación José Liendo Vera "Comandante Pepe"</h3>
         <div class="galeria">
        <img src="./galerias/memoriales/exhumacion/img066.jpg"data-descripcion="Exhumación Jose Gregorio Liendo Vera" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
         <img src="./galerias/memoriales/exhumacion/img065.jpg"data-descripcion="Exhumación Jose Gregorio Liendo Vera" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
              
</div>`,
        `<h3>Expedientes</h3>`
    );
});

markers.push(markerexhumacion);

// CODEPU
var markercodepu = L.marker([-39.814396393250966, -73.24259636084062], {icon: invisible});
markercodepu.anio = 1991.1;
markercodepu.on('click', function() {
    setAnio('1991');
    openPanel(
        `<div class="galeria">
        <img src="./galerias/codepu/1991_formalizaAfdd_Codepu.tif"data-descripcion="Exhumación Jose Gregorio Liendo Vera" onclick="ampliarFoto(this.src, this.closest('.galeria'))">      
</div>`,
        `<h3>Expedientes</h3>`
    );
});

markers.push(markercodepu);




// Visita Sola Sierra 
var markersolasierra = L.marker([-39.829593349696204, -73.21842024488174], {icon: invisible});
markersolasierra.anio = 1993;
markersolasierra.on('click', function() {
    setAnio('1991');
    openPanel(
         `  
         <h3>Visita de Sola Sierra</h3>
         
         <div class="galeria">
        <img src="./galerias/actividades/solasierra/sola_sierra_1.jpg"data-descripcion="Visita a la tumba de José Liendo Vera junto a Sola Sierra" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
         <img src="./galerias/actividades/solasierra/sola_sierra_2.jpg"data-descripcion="Visita a la tumba de José Liendo Vera junto a Sola Sierra" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
</div>`,
        `<h3>Expedientes</h3>`
    );
});
markers.push(markersolasierra);


// Retén Llifén
var marker = L.marker([-40.198930, -72.259331], {icon: CCDD});
marker.anio = 1973;
marker.on('click', function() {
    setAnio('1973 - 1976');
    openPanel(
        `<h3><a href="https://memoriaviva.com/centros-de-detencion/x-region/reten-de-carabineros-llifen/" target="_blank">Retén de carabineros de Llifén</a></h3>
        <p style="font-style: italic;">"Este retén fue utilizado entre septiembre del año 1973 y mayo del año 1976. La mayoría
de los casos se produjo en el año 1973. Durante 1975 no se registraron detenidos en este
recinto.<br><br>
Los detenidos fueron conducidos hasta este retén amarrados o encadenados y en la
misma condición permanecieron en él, encerrados en calabozos con agua sucia, muchos
de ellos completamente desnudos.
Los declarantes denunciaron que sufrieron golpes, el submarino seco y el mojado y amenazas. "</p>
        <p style="font-style: italic; text-align: right;">Comisión Valech p 404</p>`,
        `<h3>Expedientes</h3>`
    );
});

markers.push(marker);

// Memorial Chihuio
var markermemochihuio = L.marker([-40.231556, -71.970582], {icon: memorial});
markermemochihuio.anio = 1990.1;

markermemochihuio.on('click', function() {
    const anioSlider = parseFloat(document.getElementById('slider-anio').value);

    let contenido, anioTexto;

    if (anioSlider >= 2006) {
        contenido = `<h3>Memorial de Chihuío</h3>
        <p>El 9 de abril de 2006 se inauguró el memorial en Curriñe en conmemoración a las 18 víctimas de Chihuío.</p>
                                         <div class="galeria">
                 <iframe src="https://www.youtube.com/embed/uhz4SeEEDPg" frameborder="0" allowfullscreen></iframe>
        <img src="./galerias/memoriales/chihuio/chihuio_1.jpg"data-descripcion="Inauguración memoria de Chihuio" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
        <img src="./galerias/memoriales/chihuio/chihuio_2.jpg"data-descripcion="Inauguración memoria de Chihuio" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
        <img src="./galerias/memoriales/chihuio/chihuio_3.jpg"data-descripcion="Inauguración memoria de Chihuio" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
        <img src="./galerias/memoriales/chihuio/chihuio_4.jpg"data-descripcion="Inauguración memoria de Chihuio" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
        <img src="./galerias/memoriales/chihuio/chihuio_5.jpg"data-descripcion="Inauguración memoria de Chihuio" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
         <img src="./galerias/memoriales/chihuio/chihuio_6.jpg"data-descripcion="Inauguración memoria de Chihuio" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
          <img src="./galerias/memoriales/chihuio/chihuio_7.jpg"data-descripcion="Inauguración memoria de Chihuio" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
           <img src="./galerias/memoriales/chihuio/chihuio_8.jpg"data-descripcion="Inauguración memoria de Chihuio" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
        
</div>
El 12 de octubre de 1998 viajamos a Curriñe y tuvimos una reunión con
los familiares y el directorio de la agrupación de familiares
en casa de la Sra. Irma Carrasco. Viajamos gracias al aporte
de la locomoción de Rodrigo Moulian.
Este proyecto se realizó gracias a los aportes de familiares,
CODEPU y a la gran colaboración y solidaridad de Jorge Gatica
quien puso a disposición un vehículo para todos los viajes que
se realizaron hasta concretar nuestro trabajo que fue entregado
a la comunidad con la inauguración del 22 de noviembre de
1998 una cruz en memoria de los 18 desaparecidos en Chihuío.
A la inauguración asistieron autoridades de Valdivia, el alcalde
de Futrono y familiares de la Agrupación de Valdivia gracias
a la solidaridad de Jorge Gatica se concretó este trabajo




        </div>
        `;
        anioTexto = '9 de Abril de 2006 - Inauguración Memorial de Chihuío';
    } else if (anioSlider >= 2002) {
        contenido = `<h3>2002 - Chihuío</h3>
        <div class="galeria">
            <img src="./galerias/memoriales/chihuio/chihuio_2002.jpg" data-descripcion="Primeros pasos para el memorial de Chihuio" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
        </div>
        <p></p>`;
        anioTexto = '2002 - Chihuío';
    } else if (anioSlider >= 1998) {
        contenido = `<h3>Primera piedra memorial de Chihuío</h3>
                                     <div class="galeria">
        <img src="./galerias/memoriales/chihuio/piedra_chihuio.jpeg"data-descripcion="Primera piedra del memorial de Chihuio" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
</div>
        <p>El 22 de noviembre de 1998, familiares instalan la primera piedra del memorial
         en Curriñe en conmemoración a las 18 víctimas de Chihuío. Las cruces de madera que se habian instalado
          anteriormente eran constantemente sacadas por vecinos del sector que no estaban de acuerdo.
          Esta piedra estaba al otro lado del puente allí en Curriñe, no sabemos aún quien fue el que le escribio lo que dice.
    Cuando atacaban las cruces no podian con la piedra, porque es pesadita. Y así cuando hicimos el lanzamiento del memorial, la movimos con una yunta de bueyes de un vecino con nos ayudo.
    Ahi la juntamos con la cruz de fierro que armamos.


         </p>`;
        anioTexto = '22 de noviembre de 1998 - Primera piedra memorial de Chihuío';
    }
    if (contenido) {
        setAnio(anioTexto || '');
        openPanel(contenido, null, null);
    }
});

markers.push(markermemochihuio);




// Comision DDHH Laminadora
var markercddhh = L.marker([-39.82444350640225, -73.22986497900578], {icon: memorial});
markercddhh.anio = 2007.1;
markercddhh.on('click', function() {
    setAnio('2007');
    openPanel(
        `<h3>Comisión de nacional de DDHH se reune en en Valdivia </h3>
      
 <div class="galeria">
         <img src="./galerias/actividades/cddhh/cddhh_1.jpg"data-descripcion="Comisión nacional de derechos humanos se reune en la sede Laminadora" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
         <img src="./galerias/actividades/cddhh/cdhh_2.jpg"data-descripcion="Comisión nacional de derechos humanos se reune en la sede Laminadora" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
        </div>`,
        `<h3>Expedientes</h3>`
    );
});
markers.push(markercddhh);


// =============================================
// LAGO RANCO
// =============================================

// Isla Huapi
var marker = L.marker([-40.2245019, -72.382421], {icon: CCDD});
marker.anio = 1973;
marker.on('click', function() {
    setAnio('1973');
    openPanel(
        `<h3>Isla Huapi</h3>
      
        <p>Según consta de los antecedentes, la gran mayoría de casos se registró en los años 1973
y 1974.
<br>En el año 1973 las detenciones se produjeron en los asentamientos campesinos y en el
Complejo Maderero Panguipulli, durante operativos militares realizados en conjunto
con Carabineros y civiles, según señalaron los declarantes. Esta comisaría se constituyó
en un recinto de tránsito, interrogatorios y torturas. De acuerdo a los testimonios,
un gran número de campesinos fue traído en helicópteros desde la isla Huapi, en el
Lago Ranco. Al interior de la comisaría eran interrogados y torturados por militares
en el sector de las caballerizas; el resto del tiempo eran mantenidos en calabozos,
hacinados y sucios, incomunicados, vendados, sin alimento, sin baño ni agua." </p>
<p style="font-style: italic; text-align: right;"> Informe Valech p 403</p>
`,
        `<h3>Expedientes</h3>`
    );
});

markers.push(marker);


// Retén Riñinahue
var marker = L.marker([-40.323342, -72.210104], {icon: CCDD});
marker.anio = 1973;
marker.on('click', function() {
    setAnio('1973');
    openPanel(
        `<h3>Retén de Riñinahue</h3>
`,
        `<h3>Expedientes</h3>`
    );
});

markers.push(marker);


// =============================================
// RIO BUENO Y LA UNION
// =============================================

// Comisaría Río Bueno
var marker = L.marker([-40.335495, -72.957977], {icon: CCDD});
marker.anio = 1973;
marker.on('click', function() {
    setAnio('1973');
    openPanel(
        `<h3><a href="https://memoriaviva.com/nuevaweb/centros-de-detencion/x-region/comisaria-de-carabineros-rio-bueno/" target="_blank">Comisaría de Rio Bueno</a></h3>
    
                  <div class="galeria">
         <img src="./galerias/sin_foto.webp"data-descripcion="Reinaldo Segundo Huentequeo Almonacid<br> 28 años, Agricultor y militante del PC" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
        </div>
<p style="font-style: italic;" text-align: left;"> "Los hombres y mujeres que estuvieron detenidos en este lugar denunciaron haber sido tratados con violencia desde el mismo momento de su detención.
Varios declarantes fueron golpeados frente a sus hijos pequeños y a sus mujeres. Luego, 
durante el trayecto hasta la comisaría, fueron maltratados.<br>

<br>Al llegar, eran amarrados, algunos con alambre de púas, se les vendaban los ojos y los encerraban en calabozos a los que se lanzaba agua constantemente. 
En esas condiciones permanecían durante varios días, sin alimento, incomunicados e interrogados y torturados. 
Desde aquí eran trasladados a Valdivia, la mayoría a la Cárcel de esa ciudad, en camiones militares,
amarrados unos con otros y en muy malas condiciones físicas.<br>

<br> En la década de 1980, según los detenidos que estuvieron allí, la CNI participó en la Comisaría,
trasladándolos a un recinto ubicado en la ciudad de Valdivia. Los testimonios de detenidos en este recinto en 1973,
refieren la aplicación de electricidad, golpes, posturas forzadas, amenazas de detención y tortura a sus familiares, 
simulacro de fusilamiento, el submarino, introducción de agua a presión por la boca y la nariz, golpes con martillos en las uñas,
fueron obligados a escuchar torturas infligidas a otros detenidos y soportaron vejación y violación sexual."</p>
<p style="font-style: italic; text-align: right;">Comision Valech p 400</p><br>

<p style="font-style: italic;" text-align: left;">
El 6 de octubre de 1973 fue detenido por carabineros del Retén Carimallín, de la
localidad de Mantilhue, <a href="https://www.memoriaviva.com/detenidos-desaparecidos/huentequeo-almonacid-reinaldo-segundo" target="_blank">Reinaldo Huentequeo Almonacid</a>, 30 años,
Secretario del Comité de Pequeños Agricultores.<br>
Tras su arresto fue trasladado a la Comisaría de Río Bueno.  Desde allí es sacado
junto a otros detenidos y llevado al puente colgante sobre el río Pilmaiquén,
donde se les fusiló.  Huentequeo pudo saltar al agua instantes antes de recibir las
descargas, pero le dispararon hacia el río y recibió heridas a bala en su pierna
izquierda.  A pesar de ello logró salir del agua y refugiarse en casa de unos
campesinos de la zona, desde donde envió un mensaje a sus padres informando
sobre el lugar en que se hallaba. <br>
<br> Cuando la familia llegó a ese lugar, supo que la
noche anterior había vuelto a ser detenido por carabineros de la Comisaría de Río
Bueno, lo que también ocurrió ante testigos.  Con posterioridad a ello, no hubo
más noticias acerca del afectado, quien permanece hasta la fecha desaparecido.
Personeros religiosos de la zona denunciaron este hecho a las autoridades
militares de la época." </p>                                                      
<p style="font-style: italic; text-align: right;"> Informe Rettig p 407</p>

`,
        `<h3>Expedientes</h3>`
    );
});

markers.push(marker);

// Retén Crucero
var marker = L.marker([-40.419208, -72.786062], {icon: CCDD});
marker.anio = 1973;
marker.on('click', function() {
    setAnio('1973');
    openPanel(
        `<h3><a href="https://memoriaviva.com/nuevaweb/centros-de-detencion/x-region/reten-de-carabineros-crucero/" target="_blank">Reten de Carabineros de Crucero</a></h3>
        <p>El Retén de carabineros de Crucero funcionó como centro de detención de presos políticos durante la dictadura </p>
        <p style="font-style: italic; text-align: right;">Informe Valech p 412</p>`,
        `<h3>Expedientes</h3>`
    );
});

markers.push(marker);

// Retén Vivanco
var marker = L.marker([-40.374884, -72.621354], {icon: CCDD});
marker.anio = 1973;
marker.on('click', function() {
    setAnio('1973');
    openPanel(
        `<h3><a href="https://memoriaviva.com/nuevaweb/centros-de-detencion/x-region/reten-de-carabineros-vivanco/" target="_blank">Retén de Carabineros de Vivanco</a></h3>
        <p>El Retén de carabineros de Vivanco funcionó como centro de detención de presos políticos durante la dictadura </p>
        <p style="font-style: italic; text-align: right;">Informe Valech p 413</p>`,
        `<h3>Expedientes</h3>`
    );
});

markers.push(marker);

// Cárcel Río Bueno
var marker = L.marker([-40.334607, -72.962581], {icon: CCDD});
marker.anio = 1973;
marker.on('click', function() {
    setAnio('1973');
    openPanel(
        `<h3><a href="https://memoriaviva.com/nuevaweb/centros-de-detencion/x-region/carcel-de-rio-bueno/" target="_blank">Cárcel de Río Bueno</a></h3>
<p>La Cárcel de Río Bueno funcionó como centro de detención de presos políticos en los meses subsiguientes al 11 de Septiembre 1973.</p>
        <p style="font-style: italic; text-align: right;">Informe Valech p 412</p>`,
        `<h3>Expedientes</h3>`
    );
});

markers.push(marker);


// Tenencia Lago Ranco
var marker = L.marker([-40.31986, -72.47661], {icon: CCDD});
marker.anio = 1973;
marker.on('click', function() {
    setAnio('1973');
    openPanel(
        `<h3><a href="https://memoriaviva.com/nuevaweb/centros-de-detencion/x-region/tenencia-de-carabineros-de-lago-ranco/" target="_blank">Tenencia de Carabineros de Lago Ranco</a></h3>
     
        <p style="font-style: italic;">"Según consta de los antecedentes recogidos, la gran mayoría de los prisioneros se concentró en 1973.
Era un recinto de tránsito, interrogación y tortura de prisioneros. Como constó en los
testimonios, la mayoría eran campesinos del mismo sector de Lago Ranco que, luego de
ser detenidos y conducidos al retén, fueron trasladados a la Comisaría de Río Bueno.
<br>Allí se les mantuvo incomunicados, se les interrogó y torturó. Las condiciones de vida en
este cuartel eran similares a las de muchos otros: hacinamiento, frío, privación de alimento
yagua. Allí permanecían amarrados y con los ojos vendados.
Los declarantes denunciaron haber sufrido golpes, amenazas de fusilamiento, fueron
obligados a beber agua con orina y excrementos y recibían amenazas permanentes. 
"</p>
        <p style="font-style: italic; text-align: right;">Comision Valech p 405</p>
        
`,
        ``, 
        `<h3>Expedientes</h3>
        <div style="text-align: center; margin-top: 15px;">
            <a href="https://expedientesdelarepresion.cl/causa/caso-lago-ranco/" target="_blank">
                <img src="./iconos/logo-expedientes-de-la-represion.png" style="max-width: 80%;">
            </a>
        </div>`
    );
});

markers.push(marker);

// Hospital La Unión
var markerlaunion = L.marker([-40.284640, -73.076326], {icon: memorial});
markerlaunion.anio = 1977;
markerlaunion.on('click', function() {
    setAnio('18 de agosto de 1977');
    openPanel(
        `<h3>Hospital de La Unión</h3>

                          <div class="galeria">
         <img src="./galerias/memoriales/launion/leal_diaz_sergio_hernan.webp"data-descripcion="Sergio Hernán Leal Díaz<br> 42 años, Pequeño empresario y militante del PS" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
        </div>

  <p style="font-style: italic;">"El 18 de agosto de 1977, fue detenido <a href="https://memoriaviva.com/nuevaweb/detenidos-desaparecidos/desaparecidos-l/leal-diaz-sergio-hernan/" target="_blank">Sergio Hernán Leal Diaz</a> 
, pequeño industrial de Río Bueno, militante del Partido Socialista. Su aprehensión se produjo al momento de llegar
al Hospital de la Unión, donde se encontraban las dependencias del Servicio de Sanidad, ante
testigos, por parte de agentes de civil.<br><br>
La víctima había sido detenida después del 11 de septiembre de 1973 y sufrido persecuciones posteriores. Desde la fecha de su última detención nose tienen noticias suyas."
</p>
<p style="font-style: italic; text-align: right;"> Informe Rettig p 1014</p><br>`,
        `<h3>Expedientes</h3>`
    );
});

markers.push(markerlaunion);

// Comisaría La Unión
var marker = L.marker([-40.293143, -73.085891], {icon: CCDD});
marker.anio = 1973;
marker.on('click', function() {
    setAnio('1973');
    openPanel(
        `<h3><a href="https://memoriaviva.com/nuevaweb/centros-de-detencion/x-region/comisaria-de-carabineros-la-union/" target="_blank">Comisaria de carabineros de La Unión</a></h3>
        <p style="font-style: italic;">"Este recinto concentró en el año 1973 la mayor cantidad de detenidos."</p>
        <p style="font-style: italic; text-align: right;">Informe Valech p 401</p>`,
        null,  null,
    );
});

markers.push(marker);

// Cuartel Investigaciones La Unión
var marker = L.marker([-40.291996, -73.081155], {icon: CCDD});
marker.anio = 1973;
marker.on('click', function() {
    setAnio('1973');
    openPanel(
        `<h3><a href="https://memoriaviva.com/nuevaweb/centros-de-detencion/x-region/cuartel-de-investigaciones-la-union/" target="_blank">Ex Cuartel de investigaciones de La Unión (Hoy Delegación presidencial)</a></h3>
<p>El cuartel de investigaciones de la Unión funcionó como centro de detención de presos políticos en los meses subsiguientes al 11 de Septiembre 1973.</p>
        <p style="font-style: italic; text-align: right;">Informe Valech p 411</p>`,
        `<h3>Expedientes</h3>`
    );
});

markers.push(marker);

// Cárcel La Unión
var marker = L.marker([-40.29321, -73.08455], {icon: CCDD});
marker.anio = 1973;
marker.on('click', function() {
    setAnio('1973');
    openPanel(
        `<h3><a href="https://www.memoriaviva.com/centros-de-detencion/x-region/carcel-de-la-union" target="_blank">Cárcel de La Unión</a></h3>
        <p>La cárcel de la Unión funcionó como centro de detención de presos políticos en los meses subsiguientes al 11 de Septiembre 1973.</p>
        <p style="font-style: italic; text-align: right;">Informe Valech p 411</p>`,
        `<h3>Expedientes</h3>`
    );
});

markers.push(marker);









// =============================================
// RESTO (LOS LAGOS, LANCO, MARIQUINA, CORRAL, PAILLACO)
// =============================================


// Memorial Huachocopihue
var markerhuacho = L.marker([-39.832977, -73.239235], {icon: memorial});
markerhuacho.anio = 2023.2;
markerhuacho.on('click', function() {
    setAnio('2023');
    openPanel(
        `<h3>Memorial de Huachocopihue</h3>

        
                                     <div class="galeria">
                <img src="./galerias/memoriales/huachocopihue/memo_huachocopihue.jpg"data-descripcion="Memorial Huachocopihue" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
 <img src="./galerias/memoriales/estancilla/barrientos_matamala_ral_jaime.webp"data-descripcion="Raúl Jaime Barrientos Matamala <br> 23 años, empleado y militante del mir" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
  <img src="./galerias/memoriales/llancahue/krauss-iturra-victor-fernando-scaled.webp"data-descripcion="Fernando Krauss Iturra <br> 24 años, Estudiante."  onclick="ampliarFoto(this.src, this.closest('.galeria'))">
            </div>

        <p style="font-style: italic;">"Con un memorial homenajearon a vecinos del sector Huachocopihue de Valdivia que fueron víctimas de la Dictadura Cívico-Militar, acción que fue impulsada por las propias organizaciones del barrio.

En el marco de los 50 años del Golpe de Estado, la Junta de Vecinos del lugar quiso honrar a 
<a href="https://memoriaviva.com/nuevaweb/detenidos-desaparecidos/desaparecidos-b/barria-ordonez-pedro-purisimo/" target="_blank">Pedro Purísimo Barria Ordóñez</a>
<a href="https://www.memoriaviva.com/detenidos-desaparecidos/lorca-tobar-carlos-enrique" target="_blank">Carlos Enrique Lorca Tobar</a>.
<a href="https://memoriaviva.com/nuevaweb/ejecutados-politicos/ejecutados-politicos-b/barrientos-matamala-raul-jaime/" target="_blank">Raúl Jaime Barrientos Matamala</a
<a href="https://memoriaviva.com/nuevaweb/detenidos-desaparecidos/desaparecidos-b/krauss-iturra-victor-fernando/" target="_blank">Fernando Krauss Iturra</a>

Barría Ordóñez y Krauss Iturra eran jóvenes estudiantes que pertenecían al Movimiento de Izquierda Revolucionaria (MIR), quienes fueron fusilados en octubre de 1973 en el paso de la Caravana de la Muerte.
<br><br>
Misma suerte sufrió Barrientos Matamala, quien también militaba en el MIR y fue ejecutado en el puente Estancilla, camino a Niebla, en agosto de 1984 en medio de la Operación Alfa Carbón implementada por la Central Nacional de Inteligencia (CNI) en el sur del país.
Por otro lado, Lorca Tobar era un militante socialista, médico de profesión y que había sido electo recientemente como Diputado de Valdivia, todo eso antes de ser detenido y mantenerse desaparecido hasta los días de hoy.
<br><br>
Es así como la organización vecinal, el Centro Cultural Humedales de Huachocopihue y la Corporación Colectivo Sur, Memoria y Dignidad, pidieron a la Corporación Cultural Municipal de Valdivia (CCM) que donen una escultura para homenajear a las víctimas de la Dictadura.
Dicho ente terminó acogiendo la solicitud de las agrupaciones y donó la obra en metal “Danza con el viento", 
creada por el artista boliviano Jaime López en el marco del XIX Simposio Internacional de Escultura de Valdivia, 
evento que fue organizado por la propia CCM y cuyo diseño fue elegido por los vecinos."
<br>
</p>
`,
        `<h3>Expedientes</h3>`
    );
});

markers.push(markerhuacho);

// Comisaría Los Lagos
var marker = L.marker([-39.862216, -72.812525], {icon: CCDD});
marker.anio = 1973;
marker.on('click', function() {
    setAnio('1973');
    openPanel(
        `<h3><a href="https://memoriaviva.com/nuevaweb/centros-de-detencion/x-region/comisaria-de-carabineros-n-2-los-lagos/" target="_blank">Comisaria de Los Lagos</a></h3>
        <p style="font-style: italic;">"Según consta de los antecedentes recabados por la Comisión, fue en el año 1973 cuando se registraron la casi totalidad de las detenciones en ese lugar."</p>
        <p style="font-style: italic; text-align: right;">Comision Valech p 400</p>`,
        `<h3>Expedientes</h3>`
    );
});

markers.push(marker);

// Tenencia Lanco
var marker = L.marker([-39.452502, -72.772324], {icon: CCDD});
marker.anio = 1973;
marker.on('click', function() {
    setAnio('1973.7');
    openPanel(
        `<h3><a href="https://memoriaviva.com/nuevaweb/centros-de-detencion/x-region/tenencia-de-carabineros-lanco/" target="_blank">Tenencia de carabineros de Lanco</a></h3>
    
                                     <div class="galeria">
                <img src="./galerias/memoriales/pichoy/arriagada_corts_jos_manuel.webp"data-descripcion="José Manuel Arriagada Cortés<br> 19 años, Suplementero y militante del PC" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
                <img src="./galerias/memoriales/pichoy/arriagada-zuiga-jose-gabriel.webp"data-descripcion="José Gabriel Arriagada Zuñiga<br> 30 años, Topógrafo, y militante del PS" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
               <img src="./galerias/memoriales/pichoy/gilberto_antonio_ortega_alegria.webp"data-descripcion="Gilberto Antonio Ortega Alegría<br> 39 años, Empleado y militante del PS" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
                <img src="./galerias/sin_foto.webp"data-descripcion="José Manuel Carrasco Torres<br> 43 años, Contador y militante del PC" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
            </div>
    
    
        <p style="font-style: italic; text-align: justify;">"El día 12 de octubre de 1973, en el Puente Pichoy, Valdivia, fueron ejecutados
por carabineros, tres de las siguientes personas, mientras la otra falleció producto
de las torturas recibidas:<br>
  
<br><a href="https://memoriaviva.com/nuevaweb/ejecutados-politicos/ejecutados-politicos-a/arriagada-cortes-jose-manuel/" target="_blank">José Manuel Arriagada Cortes</a>, 19 años
<br><a href="https://memoriaviva.com/nuevaweb/ejecutados-politicos/ejecutados-politicos-a/arriagada-zuniga-jose-gabriel/" target="_blank">José Gabriel Arriagada Zuñiga</a>, 30 años
<br><a href="https://memoriaviva.com/nuevaweb/ejecutados-politicos/ejecutados-politicos-c/carrasco-torres-jose-manuel/" target="_blank">José Manuel Carrasco Torres</a>, 19 años
<br><a href="https://memoriaviva.com/nuevaweb/ejecutados-politicos/ejecutados-politicos-o/ortega-alegria-gilberto-antonio/" target="_blank">Gilberto Antonio Ortega Alegria</a>, 39 años
<br>
<br>Todos ellos fueron detenidos el día 10 de octubre de 1973 por Carabineros de
Malalhue y de Lanco, y conducidos al Retén de Malalhue, siendo trasladados
posteriormente a la Tenencia de Lanco, donde permanecieron hasta el día 12 de
octubre de 1973.  <br><br>En dicho recinto, producto de las torturas, falleció <a href="https://memoriaviva.com/nuevaweb/ejecutados-politicos/ejecutados-politicos-o/ortega-alegria-gilberto-antonio/" target="_blank">Gilberto Antonio Ortega Alegria</a>, en presencia de testigos.  Al cabo de pocas horas, los
otros tres detenidos y el cuerpo de Ortega fueron sacados de la Tenencia para ser
trasladados a Valdivia.<a href="https://memoriaviva.com/nuevaweb/ejecutados-politicos/ejecutados-politicos-a/arriagada-zuniga-jose-gabriel/" target="_blank">José Gabriel Arriagada Zuñiga</a> fue amarrado con <a href="https://memoriaviva.com/nuevaweb/ejecutados-politicos/ejecutados-politicos-a/arriagada-cortes-jose-manuel/" target="_blank">José Manuel Arriagada Cortes</a>, y <a href="https://memoriaviva.com/nuevaweb/ejecutados-politicos/ejecutados-politicos-c/carrasco-torres-jose-manuel/" target="_blank">José Manuel Carrasco Torres</a> con el cuerpo de Ortega.
Al llegar al Puente Pichoy, los detenidos fueron ejecutados.  Todos los cuerpos
registraban múltiples impactos de bala.  <br><br>Sus restos fueron entregados a sus
familiares para su sepultación.  Versiones verbales entregadas a las familias por
autoridades de Carabineros dieron como razón de la muerte el que los detenidos
habrían intentado fugarse, sin dar explicaciones mas circunstanciadas sobre ello.
<p style="font-style: italic; text-align: right;"> Informe Rettig p 394 </p>

<p style="font-style: italic; text-align: left;">
Los declarantes establecieron en sus testimonios que esta tenencia fue un recinto de
tránsito, donde los prisioneros eran torturados y luego conducidos a la ciudad de Valdivia. En el año 1973, según algunos testigos, presenciaron la muerte de un prisionero por
los golpes sufridos y otros relataron que cuatro detenidos que eran llevados a Valdivia
fueron asesinados en el trayecto, con el pretexto de la ley de fuga.
Los ex presos políticos denunciaron que sufrieron golpes, fueron pisoteados, amenazados
y expuestos a fuerte presión psicológica. </p>
<p style="font-style: italic; text-align: right;"> Informe Valech p 405</p>`,
        ``, 
        `<h3>Expedientes</h3>
        <div style="text-align: center; margin-top: 15px;">
            <a href="https://expedientesdelarepresion.cl/causa/episodio-pichoy/" target="_blank">
                <img src="./iconos/logo-expedientes-de-la-represion.png" style="max-width: 80%;">
            </a>
        </div>`
    );
});

markers.push(marker);

// Retén Malalhue
var marker = L.marker([-39.544432, -72.503030], {icon: CCDD});
marker.anio = 1973;
marker.on('click', function() {
    setAnio('1973');
    openPanel(
        `<h3><a href="https://memoriaviva.com/nuevaweb/centros-de-detencion/x-region/reten-de-carabineros-malalhue/" target="_blank">Retén de carabineros de Malalhue</a></h3>
        "El día 12 de octubre de 1973, en el Puente Pichoy, Valdivia, fueron ejecutados
por carabineros, tres de las siguientes personas, mientras la otra falleció producto
de las torturas recibidas:<br>

<br><a href="https://memoriaviva.com/nuevaweb/ejecutados-politicos/ejecutados-politicos-a/arriagada-cortes-jose-manuel/" target="_blank">José Manuel Arriagada Cortes</a>, 19 años
<br><a href="https://memoriaviva.com/nuevaweb/ejecutados-politicos/ejecutados-politicos-a/arriagada-zuniga-jose-gabriel/" target="_blank">José Gabriel Arriagada Zuñiga</a>, 30 años
<br><a href="https://memoriaviva.com/nuevaweb/ejecutados-politicos/ejecutados-politicos-c/carrasco-torres-jose-manuel/" target="_blank">José Manuel Carrasco Torres</a>, 19 años
<br><a href="https://memoriaviva.com/nuevaweb/ejecutados-politicos/ejecutados-politicos-o/ortega-alegria-gilberto-antonio/" target="_blank">Gilberto Antonio Ortega Alegria</a>, 39 años

<br><br>Todos ellos fueron detenidos el día 10 de octubre de 1973 por Carabineros de
Malalhue y de Lanco, y conducidos al Retén de Malalhue, siendo trasladados
posteriormente a la Tenencia de Lanco, donde permanecieron hasta el día 12 de
octubre de 1973.  <br><br>En dicho recinto, producto de las torturas, falleció <a href="https://memoriaviva.com/nuevaweb/ejecutados-politicos/ejecutados-politicos-o/ortega-alegria-gilberto-antonio/" target="_blank">Gilberto Antonio Ortega Alegria</a>, en presencia de testigos.  Al cabo de pocas horas, los
otros tres detenidos y el cuerpo de Ortega fueron sacados de la Tenencia para ser
trasladados a Valdivia.<a href="https://memoriaviva.com/nuevaweb/ejecutados-politicos/ejecutados-politicos-a/arriagada-zuniga-jose-gabriel/" target="_blank">José Gabriel Arriagada Zuñiga</a> fue amarrado con <a href="https://memoriaviva.com/nuevaweb/ejecutados-politicos/ejecutados-politicos-a/arriagada-cortes-jose-manuel/" target="_blank">José Manuel Arriagada Cortes</a>, y <a href="https://memoriaviva.com/nuevaweb/ejecutados-politicos/ejecutados-politicos-c/carrasco-torres-jose-manuel/" target="_blank">José Manuel Carrasco Torres</a> con el cuerpo de Ortega.
Al llegar al Puente Pichoy, los detenidos fueron ejecutados.  Todos los cuerpos
registraban múltiples impactos de bala.  <br><br>Sus restos fueron entregados a sus
familiares para su sepultación.  Versiones verbales entregadas a las familias por
autoridades de Carabineros dieron como razón de la muerte el que los detenidos
habrían intentado fugarse, sin dar explicaciones mas circunstanciadas sobre ello.
<p style="font-style: italic; text-align: right;"> Informe Rettig p 394 </p>
        <p>El retén de carabineros de Malalhue fue utilizado para la detención de presos políticos en los meses subsiguientes al 11 de Septiembre 1973.</p>
        <p style="font-style: italic; text-align: right;">Informe Valech p 412</p>`,
        `<h3>Expedientes</h3>`
    );
});

markers.push(marker);

// Comisaría San José de la Mariquina
var marker = L.marker([-39.540736, -72.960657], {icon: CCDD});
marker.anio = 1973;
marker.on('click', function() {
    setAnio('1973');
    openPanel(
        `<h3><a href="https://memoriaviva.com/nuevaweb/centros-de-detencion/x-region/comisaria-de-carabineros-san-jose-de-la-mariquina/" target="_blank">Comisaria de Carabineros San José de la Mariquina</a></h3>
        <p>La comisaría de carabineros de San José de la Mariquina fue utilizada para la detención de presos políticos en los meses subsiguientes al 11 de Septiembre 1973.</p>
        <p style="font-style: italic; text-align: right;">Informe Valech p 411</p>`,
        `<h3>Expedientes</h3>`
    );
});

markers.push(marker);

// Retén Corral
var marker = L.marker([-39.889087, -73.426458], {icon: CCDD});
marker.anio = 1973;
marker.on('click', function() {
    setAnio('1973');
    openPanel(
        `<h3><a href="https://memoriaviva.com/nuevaweb/centros-de-detencion/x-region/reten-de-carabineros-corral/" target="_blank">Retén de Corral</a></h3>
        <p>El retén de carabineros de Corral fue utilizado para la detención de presos políticos en los meses subsiguientes al 11 de Septiembre 1973.</p>
        <p style="font-style: italic; text-align: right;">Informe Valech p 411</p>`,
        `<h3>Expedientes</h3>`
    );
});

markers.push(marker);

// Tenencia Paillaco
var marker = L.marker([-40.069418, -72.873192], {icon: CCDD});
marker.anio = 1973;
marker.on('click', function() {
    setAnio('1973');
    openPanel(
        `<h3><a href="https://memoriaviva.com/nuevaweb/centros-de-detencion/x-region/tenencia-de-carabineros-paillaco/" target="_blank">Tenencia de carabineros de Paillaco</a></h3>
        <p>La tenencia de carabineros de Paillaco fue utilizada para la detención de presos políticos en los meses subsiguientes al 11 de Septiembre 1973.</p>
        <p style="font-style: italic; text-align: right;">Informe Valech p 411</p>`,
        `<h3>Expedientes</h3>`
    );
});

markers.push(marker);


// Memorial SILLA
var markersilla = L.marker([-39.81566755551341, -73.24232969025542], {icon: memorial});
markersilla.anio = 2018.1;
markersilla.on('click', function() {
    setAnio('2023');
    openPanel(
        `<h3>Memorial de la Silla</h3>

        
                                     <div class="galeria">
                <img src="./galerias/memoriales/silla/silla.jpg"data-descripcion="Memorial de La Silla Liceo Armando Robles" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
         </div>

        <p style="font-style: italic;">"La Silla: Se trata de un hito de memoria, reconocido como monumento público de la ciudad de Valdivia, ubicado en el frontis del Liceo Armando Robles Rivera Se trata de un conjunto compuesto por dos baldosas y una estructura metálica de una silla tipo escolar, de la que emerge un árbol.

La silla, simboliza el establecimiento educacional; el liceo que albergó a los estudiantes cuyas vidas fueron posteriormente cegadas por la dictadura. El árbol representa a su vez, la continuidad de la vida y sus ideas, que siguen brotando desde la ausencia de los homenajeados.
</p>
`,
        `<h3>Expedientes</h3>`
    );
});

markers.push(markersilla);


// Fundacion AFFDD
var markerafdd = L.marker([-39.828616, -73.203874], {icon: memorial});
markerafdd.anio = 1986;
markerafdd.on('click', function() {
    setAnio('Agosto 1986');
    openPanel(
        `<h3> Fundacion AFDD y AFEP</h3>
        <br>
<p>"La agrupación de familiares
de ejecutados políticos fue creada en casa de
Elisa Hernández; La directiva elegida
fue Presidente: Manuel Barrientos
Matamala; Secretaria: Juana Mora
Gutiérrez; Tesorera: Rosa Alvarado Méndez. 
<br><br> 
La principal actividad
desarrollada por esta organización
creada en plena dictadura fue la de
reunir a otros familiares de víctimas
de la represión, cuestión esencial
para fortalecer la organización de la
resistencia, junto con contener y apoyar
solidariamente a las familias.
"
<p style="font-style: italic; text-align: right;">Elisa Hernandez, viuda de <a href="https://memoriaviva.com/nuevaweb/ejecutados-politicos/ejecutados-politicos-t/tapia-de-la-fuente-rogelio-humberto/" target="_blank">Rogelio Tapia de la Puente</a>, Fundadora de la AFEP-AFDD de Valdiva.</p>


        `,
        `<h3>Expedientes</h3>`
    );
});
markers.push(markerafdd);



// Formalización AFDD y CODEPU
var markercodepu = L.marker([-39.828616, -73.203874], {icon: memorial});
markercodepu.anio = 1991.1;
markercodepu.on('click', function() {
    setAnio('1991');
    openPanel(
        `<h3>Formalización AFDD y AFEP y CODEPU</h3>
        <br>
                                    <div class="galeria">
                <img src="./galerias/actividades/codepu/afdd_codepu.jpg"data-descripcion="Formalización de la Agrupación de Familiares de Detenidos Desaparecidos y Ejecutados Politicos en conjunto con el Comité de Defensa del Pueblo" onclick="ampliarFoto(this.src, this.closest('.galeria'))">
         </div>" `,
        `<h3>Expedientes</h3>`
    );
});
markers.push(markercodepu);


// cantata
var markercantata = L.marker([-39.812870685382606, -73.24570627256476], {icon: memorial});
markercantata.anio = 2023.3;
markercantata.on('click', function() {
    setAnio('23 de septiembre 2023');
    openPanel(
        `<h3>Lanzamiento Cantata 4 Actos de Memoria y Esperanza </h3>
        <br>
            `,
    );
});
markers.push(markercantata);




const fechasClave = [
    { valor: 1972.0, marker: null },
    { valor: 1973.0, marker: null },
    { valor: 1973.1,  marker: markerpilmaiken,}, 
    { valor: 1973.2,  marker: markernilahue },    
    { valor: 1973.21,  marker: markerbueras }, 
    { valor: 1973.3, marker: markerllancahue },
    { valor: 1973.31, marker: markercatamutun },
    { valor: 1973.4, marker: markerlasmarias },
    { valor: 1973.41, marker: markerpishuinco },
    { valor: 1973.42, marker: markercollico },
    { valor: 1973.43, marker: markernancul },
    { valor: 1973.44, marker: markersiscahue },
    { valor: 1973.5, marker: markerchihuio },
    { valor: 1973.6, marker: markerliquine },
    { valor: 1973.7, marker: markerpichoy },
    { valor: 1973.71, marker: markerlaja },
    {valor: 1973.72, marker: markerantilhue },
    { valor: 1973.73, marker: markernancul2 },
    { valor: 1973.8, marker: markergil },
    { valor: 1973.9, marker: markernanco },
    { valor: 1973.91, marker: markermolco },
    { valor: 1974,  marker: markerbueras }, 
    { valor: 1974.1, marker: markermatus },
    { valor: 1975, marker: markerconales },
    { valor: 1976, marker: null },
    { valor: 1977.1, marker: markerlaunion },
    { valor: 1978, marker: markerchihuio },
    { valor: 1979, marker: null },
    { valor: 1980, marker: markerniebla },
    { valor: 1981, marker: markercni },
    { valor: 1981.1, marker: markerneltume1 },
    { valor: 1981.2, marker: markerneltume2 },
    { valor: 1981.3, marker: markerremeco },
    { valor: 1981.4, marker: markerneltume3 },
    { valor: 1981.5, marker: markerneltume4 },
    { valor: 1981.6, marker: markerpaine },
    { valor: 1982, marker: null },
    { valor: 1983, marker: null },
    { valor: 1984.1, marker: markerestancilla },   
    { valor: 1984.2, marker: markermano },  
    { valor: 1985, marker: null },
    { valor: 1986.1, marker: markerafdd }, 
    { valor: 1987, marker: null },
    { valor: 1988, marker: null },
    { valor: 1989.1, marker: markermexico },
    { valor: 1990, marker: markerchihuio },
    { valor: 1991, marker: markerexhumacion },
    { valor: 1991.1, marker: markercodepu },
    { valor: 1992, marker: markermemoliquine },
    { valor: 1993, marker: markersolasierra }, 
    { valor: 1994, marker: markeruach },
    { valor: 1995, marker: markermemoliquine }, 
    { valor: 1996, marker: null },
    { valor: 1997, marker: markermano },
    { valor: 1998, marker: markermemochihuio },   
    { valor: 1999, marker: markermemoneltume }, 
    { valor: 2000, marker: markerpichoy},
    { valor: 2001, marker: markerguzman },
    { valor: 2001.1, marker: markercementerio },
    { valor: 2002, marker: markermemochihuio },
    { valor: 2004, marker: markerllancahue },
    { valor: 2004.1, marker: markersededario },
    { valor: 2006, marker: markermemochihuio }, 
    { valor: 2007, marker: markerestancilla },
     { valor: 2007.1, marker: markercddhh},
    { valor: 2008, marker: markercni },
    { valor: 2008.1, marker: markerliquine },
    { valor: 2010, marker: markercni },
    { valor: 2013, marker: markercni },
    { valor: 2016, marker: markernanco },
    { valor: 2017, marker: markerllancahue },
    { valor: 2017.1, marker: markerlasmarias }, 
    { valor: 2017.2, marker: markerpilmaiken }, 
    { valor: 2017.3, marker: markergp }, 
    { valor: 2018, marker: markerisla }, 
     { valor: 2018.1, marker: markersilla},
          { valor: 2023, marker: markerlaja },
    { valor: 2023.1, marker: markercendyr }, 
    { valor: 2023.2, marker: markerhuacho }, 
    { valor: 2023.3, marker: markercantata },//      
    { valor: anioActual, marker: null },
];

let indiceFecha = 0;
let panelMarker = null;

// Inyecta tracker en cada marker para saber cuál está abierto
markers.forEach(function(m) {
    m.on('click', function() {
        panelMarker = m;
        if (!navegandoConFlechas) {
            var cv = parseFloat(slider.value);
            var best = null;
            fechasClave.forEach(function(f) {
                if (f.marker === m && f.valor <= cv) {
                    if (!best || f.valor > best.valor) best = f;
                }
            });
            if (!best) {
                // Marker is before current slider — jump to its first entry
                fechasClave.forEach(function(f) {
                    if (f.marker === m) {
                        if (!best || f.valor < best.valor) best = f;
                    }
                });
            }
            if (best && Math.abs(best.valor - cv) > 0.01) {
                navegandoConFlechas = true;
                slider.value = best.valor;
                slider.dispatchEvent(new Event('input'));
                navegandoConFlechas = false;
            }
        }
    });
});

function actualizarNavPanel() {
    const nav = document.getElementById('panel-nav');
    if (!nav) return;
    if (!panelMarker) { nav.style.display = 'none'; return; }

    const entradas = [];
    fechasClave.forEach(function(f, i) {
        if (f.marker === panelMarker) entradas.push({ valor: f.valor, idx: i });
    });

    if (entradas.length <= 1) { nav.style.display = 'none'; return; }

    const cv = parseFloat(slider.value);
    let posActual = 0;
    for (let i = 0; i < entradas.length; i++) {
        if (entradas[i].valor <= cv) posActual = i;
    }

    nav.style.display = 'flex';
    document.getElementById('panel-nav-label').textContent =
        Math.floor(entradas[posActual].valor);

    const btnPrev = document.getElementById('panel-nav-prev');
    const btnNext = document.getElementById('panel-nav-next');
    btnPrev.disabled = posActual <= 0;
    btnNext.disabled = posActual >= entradas.length - 1;
    btnPrev.onclick = function() { if (posActual > 0) irAFecha(entradas[posActual - 1].idx); };
    btnNext.onclick = function() { if (posActual < entradas.length - 1) irAFecha(entradas[posActual + 1].idx); };
}

function irAFecha(indice) {
    indiceFecha = indice;
    const fecha = fechasClave[indiceFecha];
    navegandoConFlechas = true;
    slider.value = fecha.valor;
    slider.dispatchEvent(new Event('input'));
    navegandoConFlechas = false;
    if (fecha.marker) {
        mapa.setView(fecha.marker.getLatLng(), 15, { animate: true });
        setTimeout(() => {
            navegandoConFlechas = true;
            fecha.marker.fire('click');
            navegandoConFlechas = false;
        }, 50);
    } else {
        mapa.setView([-39.90, -72.8], 9, { animate: true });
        document.getElementById('info-panel').classList.remove('open');
        setAnio('');
    }
}

document.getElementById('btn-anterior').addEventListener('click', function() {
    const valorActual = parseFloat(slider.value);
    let indiceMasCercano = -1;
    for (let i = fechasClave.length - 1; i >= 0; i--) {
        if (fechasClave[i].valor < valorActual) {
            indiceMasCercano = i;
            break;
        }
    }

    if (indiceMasCercano !== -1) irAFecha(indiceMasCercano);
});

document.getElementById('btn-siguiente').addEventListener('click', function() {
    const valorActual = parseFloat(slider.value);
    console.log('CLICK siguiente, valor slider:', valorActual);
    let indiceMasCercano = -1;
    for (let i = 0; i < fechasClave.length; i++) {
        if (fechasClave[i].valor > valorActual) {
            indiceMasCercano = i;
            break;
        }
    }

    if (indiceMasCercano !== -1) irAFecha(indiceMasCercano);
});

window.addEventListener('load', function() {
    irAFecha(0);
        actualizarContexto(parseFloat(slider.value)); // ← agrega esto
});

mapa.on('contextmenu', function(e) {
    const lat = e.latlng.lat.toFixed(6);
    const lng = e.latlng.lng.toFixed(6);

L.popup({ zIndexOffset: 9999 })
        .setLatLng(e.latlng)
        .setContent(`
            <div style="font-family: Arial; min-width: 220px;">
                <h4 style="margin: 0 0 8px 0; font-size: 14px;">¡Aqui dejarnos un mensaje! Lo que se te venga a la cabeza.</h4>
                <textarea id="aporte-texto" placeholder="Escribe tu aporte, testimonio o información..." 
                    style="width: 100%; height: 80px; padding: 4px; box-sizing: border-box; font-size: 12px; resize: vertical;"></textarea>
                <button onclick="guardarAporte(${lat}, ${lng})" 
                    style="margin-top: 6px; width: 100%; padding: 6px; background: #1b2734; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
                    Guardar
                </button>
            </div>
        `)
        .openOn(mapa);
});

function guardarAporte(lat, lng) {
    const texto = document.getElementById('aporte-texto').value.trim();
    if (!texto) return; 

    const aportes = JSON.parse(localStorage.getItem('aportes-mapa') || '[]');
    aportes.push({
        texto: texto,
        lat: lat,
        lng: lng,
        fecha: new Date().toLocaleDateString('es-CL')
    });
    localStorage.setItem('aportes-mapa', JSON.stringify(aportes));
    mapa.closePopup();

}
