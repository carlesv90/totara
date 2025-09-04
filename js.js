  document.addEventListener('DOMContentLoaded', function() {
    // Configuración visible y fácil de modificar
    const config = {
      // Rutas base donde se aplicarán las funciones
      pathPatterns: ['/dashboard/', // Ruta dashboard sin parámetros adicionales
        '/dashboard/index.php', // Ruta index.php sin parámetros
        '/dashboard/?id=', // Ruta dashboard con ID (patrón original)
        '/dashboard/index.php?id=' // Ruta index.php con ID
      ],
      // Configuración para ocultar Current Learning que no tienen cursos
      currentLearningVaciosConfig: {
        enabledForIds: ['9'], // IDs específicos donde se activa la función
        enabledForAllPatterns: true, 
        instancias: ['inst233', 'inst8272'], // Instancias a verificar
      },
      // Configuración para Iconos check PNTs
      completionIconConfig: {
        enabledForIds: ['9', '1'], // IDs específicos donde se activa la función
        instancias: ['inst230', 'inst215'], // Instancias donde buscar íconos
        enabledForAllPatterns: true, // Si es true, se activará para todas las rutas sin importar el ID
      },
      // Configuración para reemplazo de íconos informes PNTs
      iconReplacerConfig: {
        enabledForIds: ['9', '1'], // IDs específicos donde se activa la función
        enabledForAllPatterns: true, // Si es true, se activará para todas las rutas sin importar el ID
        instancias: ['inst230', 'inst215'], // Instancias donde buscar íconos
        newIconUrl: '/pluginfile.php/1/local_uploadfiles/additionalimages/0/pnt-white.svg', // URL del ícono estándar
        lfeIconUrl: 'https://ivirmacampus.com/pluginfile.php/1/local_uploadfiles/additionalimages/0/pnt-lfe.svg' // URL del ícono para LFE
      },
      // Configuración para Etiquetas Obligatorio/Mandatory
      mandatoryLabelConfig: {
        enabledForIds: ['9', '1'], // IDs específicos donde se activa la función
        enabledForAllPatterns: true, // Si es true, se activará para todas las rutas sin importar el ID
        instancias: ['inst212', 'inst226'], // Instancias de los bloques para etiquetas
      },
      // Configuración para procesar título y actualizar banner
      titleBannerConfig: {
        enabledForIds: ['1'], // IDs específicos donde se activa la función
        enabledForAllPatterns: true, // Si es true, se activará para todas las rutas sin importar el ID
        instancia: 'inst211', // Instancia del video de presentación
      },
      // Configuración para procesar tabla de estados
      tablaEstadosConfig: {
        enabledForIds: ['10'], // IDs específicos donde se activa la función
        enabledForAllPatterns: true, // Si es true, se activará para todas las rutas sin importar el ID
        instancia: 'inst277', // Instancia de la tabla de estados
      },
      // Configuración para acordeonVisorLFE y suma de puntos
      acordeonConfig: {
        enabledForIds: ['10'], // IDs específicos donde se activa la función
        enabledForAllPatterns: false, // Si es true, se activará para todas las rutas sin importar el ID
        instancias: ['inst278', 'inst279', 'inst280', 'inst281'] // Instancias de los bloques para convertir en acordeones
      },
      // Configuración para reemplazo de caras en cuestionarios de satisfacción
      feedbackFacesConfig: {
        enabledForPaths: ['/feedback'], // Rutas exclusivas para esta función
        enabledForAllPatterns: false, // No usar las rutas generales
        titlePatterns: ['cuestionario satisfacción', 'dotazník spokojenosti', 'satisfaction questionnaire', 'questionario di gradimento', 'questionário de satisfação', 'utvärderingsformulär'],
        faceImages: {
          1: 'https://ivirmacampus.com/pluginfile.php/1/local_uploadfiles/additionalimages/0/cuestionario-1.svg',
          2: 'https://ivirmacampus.com/pluginfile.php/1/local_uploadfiles/additionalimages/0/cuestionario-2.svg',
          3: 'https://ivirmacampus.com/pluginfile.php/1/local_uploadfiles/additionalimages/0/cuestionario-3.svg',
          4: 'https://ivirmacampus.com/pluginfile.php/1/local_uploadfiles/additionalimages/0/cuestionario-4.svg',
          5: 'https://ivirmacampus.com/pluginfile.php/1/local_uploadfiles/additionalimages/0/cuestionario-5.svg'
        }
      },
      // Configuración común para estilos
      stylesConfig: {
        icons: {
          completedIcon: '/pluginfile.php/1/local_uploadfiles/additionalimages/0/Completed.svg', //check pnts completados
          plusCircleIcon: 'https://ivirmacampus.com/pluginfile.php/1/local_uploadfiles/additionalimages/0/plus-circle.svg', //colapsar acordeon visor
          minusCircleIcon: 'https://ivirmacampus.com/pluginfile.php/1/local_uploadfiles/additionalimages/0/minus-circle.svg' //expandir acordeon visor
        },
        animations: {
          duration: '0.4s',
          timingFunction: 'ease-in-out'
        }
      },
      // Configuración para logging
      debug: true // Activar/desactivar mensajes de depuración
    };
    const DashboardFunctions = {
      /**
       * Sistema de logging centralizado
       */
      log: function(component, message, isError = false) {
        if (!config.debug && !isError) return;
        const prefix = `[${component}]`;
        if (isError) {
          console.error(`${prefix} ${message}`);
        } else {
          console.log(`${prefix} ${message}`);
        }
      },
      /**
       * Obtiene un parámetro de la URL
       */
      getQueryParam: function(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
      },
      /**
       * Verifica si la URL actual coincide con los patrones configurados
       * y si el ID (cuando existe) está en la lista de permitidos
       */
      isUrlPatternMatched: function(configSection) {
        const currentPath = window.location.pathname;
        const currentUrl = currentPath + window.location.search;
        const id = this.getQueryParam('id');
        // Verificar si la URL coincide con alguno de los patrones
        const patternMatched = config.pathPatterns.some(pattern => {
          // Si el patrón termina con "id=", verificamos que la URL incluya esa parte con algún valor
          if (pattern.endsWith('id=')) {
            return currentUrl.includes(pattern) && id !== null;
          }
          // Si no, verificamos que la URL comience con el patrón
          return currentPath.includes(pattern) || currentUrl.includes(pattern);
        });
        if (!patternMatched) {
          return false;
        }
        // Si la configuración indica que se activa para todos los patrones, retornar true
        if (configSection.enabledForAllPatterns) {
          // Nueva lógica:
          // Solo retornar true si no hay ID en la URL o si configSection no tiene IDs específicos
          if (id === null || !configSection.enabledForIds || configSection.enabledForIds.length === 0) {
            return true;
          }
          // Si hay ID y configSection tiene IDs específicos, verificar si la ID está permitida
          return configSection.enabledForIds.includes(id);
        }
        // Si no hay ID pero la configuración requiere IDs específicos, retornar false
        if (!id && configSection.enabledForIds && configSection.enabledForIds.length > 0) {
          return false;
        }
        // Verificar si el ID está en la lista de permitidos
        return id && configSection.enabledForIds && configSection.enabledForIds.includes(id);
      },
      /**
       * Espera a que aparezca un elemento en el DOM y ejecuta un callback
       */
waitForElement: function(selector, callback, maxAttempts = 20, interval = 200) {
    let attempts = 0;
    const checkElement = setInterval(() => {
        const element = document.querySelector(selector);
        if (element) {
            clearInterval(checkElement);
            callback(element);
            this.log('Optimizado', `Elemento encontrado: ${selector}`);
        } else if (++attempts >= maxAttempts) {
            clearInterval(checkElement);
            // No marcar como error, solo como información
            this.log('Optimizado', `Elemento no encontrado después de ${maxAttempts} intentos: ${selector}`);
            
            // Si es una tabla que no se encuentra, llamar a procesarTablaEstados de todas formas
            if (selector.includes('table') && selector.includes(config.tablaEstadosConfig.instancia)) {
                this.log('Optimizado', `Ejecutando procesarTablaEstados sin tabla encontrada`);
                this.procesarTablaEstados();
            }
        }
    }, interval);
},
      /**
       * Observa los cambios en el contenedor para actualizar las etiquetas obligatorias
       */
      observeMandatoryLabels: function(containerId) {
        const targetNode = document.getElementById(containerId);
        if (!targetNode) {
          this.log('Etiquetas', `No se encontró el contenedor ${containerId}.`, true);
          return;
        }
        // Verificar si ya hay un observador para este contenedor
        if (targetNode._observer) return; // Evitar duplicados
        this.log('Etiquetas', `Observador activado en ${containerId}.`);
        const observer = new MutationObserver(() => {
          this.log('Etiquetas', `Cambios detectados en ${containerId}, verificando etiquetas...`);
          this.agregarEtiquetaObligatorio(containerId);
        });
        observer.observe(targetNode, {
          childList: true,
          subtree: true
        });
        targetNode._observer = observer; // Guardar referencia al observador
      },
      /**
       * Agrega etiquetas "Obligatorio" o "Mandatory" a los elementos que lo requieran
       */
      agregarEtiquetaObligatorio: function(containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
          this.log('Etiquetas', `No se encontró el contenedor ${containerId}.`, true);
          return;
        }
        const listItems = container.querySelectorAll("li.block_current_learningas-tile");
        this.log('Etiquetas', `Se encontraron ${listItems.length} elementos 
      <li> en ${containerId}.`);
        listItems.forEach(li => {
          const mandatoryDiv = li.querySelector("div.block_current_learningas-customfield");
          if (mandatoryDiv && (mandatoryDiv.textContent.includes("Mandatory") || mandatoryDiv.textContent.includes("Obligatorio"))) {
            if (!li.querySelector(".etiqueta-obligatorio")) {
              const span = document.createElement("span");
              span.classList.add("etiqueta-obligatorio");
              span.textContent = mandatoryDiv.textContent.includes("Mandatory") ? "Mandatory" : "Obligatorio";
              li.appendChild(span);
              this.log('Etiquetas', `Etiqueta añadida en ${containerId}.`);
            }
          }
          const customFieldsDiv = li.querySelector("div.block_current_learningas-customfields");
          if (customFieldsDiv) {
            customFieldsDiv.style.display = "none";
          }
        });
      },
      /**
       * Extrae el título del curso, lo divide por el guión y actualiza los elementos del banner
       * Finalmente oculta el contenedor original
       */
      procesarTituloYActualizarBanner: function() {
        if (!this.isUrlPatternMatched(config.titleBannerConfig)) {
          this.log('Título', `URL o ID no permitido para procesar título y banner`);
          return;
        }
        this.log('Título', `Patrón de URL permitido encontrado, procesando título y banner...`);
        // Obtener el elemento principal por su ID
        const contenedor = document.getElementById(config.titleBannerConfig.instancia);
        if (!contenedor) {
          this.log('Título', `No se encontró elemento con ID: ${config.titleBannerConfig.instancia}`, true);
          return;
        }
        // Buscar el título dentro del H3 con la clase específica
        const elementoTitulo = contenedor.querySelector("h3.block_current_learningas-tile__link_title");
        if (!elementoTitulo) {
          this.log('Título', `No se encontró el título con la clase especificada dentro de #${config.titleBannerConfig.instancia}`, true);
          return;
        }
        // Obtener el texto del título
        const textoCompleto = elementoTitulo.textContent.trim();
        // Dividir el texto por el guión
        const partes = textoCompleto.split("-");
        if (partes.length < 2) {
          this.log('Título', `El título no contiene un guión: "${textoCompleto}"`, true);
          return;
        }
        // Guardar las partes en variables
        const lfe = partes[0].trim();
        const lfe_tipo = partes[1].trim();
        this.log('Título', `Texto completo: ${textoCompleto}`);
        this.log('Título', `LFE: ${lfe}`);
        this.log('Título', `LFE_TIPO: ${lfe_tipo}`);
        // Buscar los elementos del banner y actualizar sus valores
        const bannerTitulo = document.querySelector(".lfe-banner-titulo");
        const bannerTipo = document.querySelector(".lfe-banner-tipo");
        if (bannerTitulo) {
          bannerTitulo.textContent = lfe;
          this.log('Título', `Banner título actualizado con: ${lfe}`);
        } else {
          this.log('Título', `No se encontró elemento con clase lfe-banner-titulo`, true);
        }
        if (bannerTipo) {
          bannerTipo.textContent = lfe_tipo;
          this.log('Título', `Banner tipo actualizado con: ${lfe_tipo}`);
        } else {
          this.log('Título', `No se encontró elemento con clase lfe-banner-tipo`, true);
        }
        // Buscar el enlace dentro del contenedor con la clase especificada
        const enlace = contenedor.querySelector("a.block_current_learningas-tile__link");
        if (enlace) {
          const href = enlace.getAttribute("href");
          // Obtener el div con la clase preslfe-dcha
          const divPreslfeDcha = document.querySelector(".preslfe-dcha");
          if (divPreslfeDcha) {
            // Añadir el href al div y establecer el cursor pointer
            divPreslfeDcha.style.cursor = "pointer";
            divPreslfeDcha.onclick = function() {
              window.location.href = href;
            };
            this.log('Título', `Enlace añadido al div con clase preslfe-dcha: ${href}`);
          } else {
            this.log('Título', `No se encontró elemento con clase preslfe-dcha`, true);
          }
        } else {
          this.log('Título', `No se encontró enlace con la clase block_current_learningas-tile__link`, true);
        }
        // Ocultar el div original después de extraer y actualizar
        contenedor.style.display = "none";
        this.log('Título', `Div con ID ${config.titleBannerConfig.instancia} ha sido ocultado`);
      },
      /**
       * Reemplaza números por imágenes de caras en cuestionarios de satisfacción
       */
      replaceFeedbackNumbers: function() {
        // Verificar que estamos en una ruta válida para esta función
        const currentPath = window.location.pathname;
        const validPath = config.feedbackFacesConfig.enabledForPaths.some(path => currentPath.includes(path));
        if (!validPath) {
          this.log('Feedback', `URL no corresponde a ruta de feedback: ${currentPath}`);
          return;
        }
        this.log('Feedback', `Ruta de feedback detectada, buscando cuestionarios de satisfacción...`);
        // Buscar H2 con texto específico
        const h2Elements = document.querySelectorAll('h2');
        const validTitles = config.feedbackFacesConfig.titlePatterns;
        let validH2Found = false;
        for (const h2 of h2Elements) {
          const h2TextLower = h2.textContent.toLowerCase().trim();
          if (validTitles.some(title => h2TextLower.includes(title))) {
            validH2Found = true;
            this.log('Feedback', `Título válido encontrado: "${h2.textContent}"`);
            break;
          }
        }
        // Continuar solo si se encuentra un h2 válido
        if (!validH2Found) {
          this.log('Feedback', `No se encontró un título de cuestionario válido`);
          return;
        }
        // Función para reemplazar los números por imágenes
        const replaceNumbersWithFaces = () => {
          // Seleccionar todos los elementos span.weight que contienen los números
          const weightSpans = document.querySelectorAll('span.weight');
          let replacedCount = 0;
          weightSpans.forEach(span => {
            // Extraer el número del texto (ejemplo: "(1)" -> 1)
            const match = span.textContent.match(/\((\d+)\)/);
            if (match) {
              const number = parseInt(match[1]);
              if (config.feedbackFacesConfig.faceImages[number]) {
                // Crear elemento img con la cara correspondiente
                const img = document.createElement('img');
                img.src = config.feedbackFacesConfig.faceImages[number];
                img.alt = `Opción ${number}`;
                img.style.width = '24px';
                img.style.height = '24px';
                img.style.verticalAlign = 'middle';
                img.style.marginRight = '5px';
                // Reemplazar el texto con la imagen
                span.textContent = '';
                span.appendChild(img);
                replacedCount++;
              }
            }
          });
          this.log('Feedback', `Se reemplazaron ${replacedCount} números por imágenes`);
        };
        // Ejecutar la función cuando el DOM esté listo
        replaceNumbersWithFaces();
        // Observar cambios en el formulario para actualizar dinámicamente
        const form = document.getElementById('feedback_complete_form');
        if (form) {
          const observer = new MutationObserver(() => {
            this.log('Feedback', `Cambios detectados en el formulario, actualizando imágenes...`);
            replaceNumbersWithFaces();
          });
          observer.observe(form, {
            childList: true,
            subtree: true
          });
          this.log('Feedback', `Observador configurado en el formulario de feedback`);
        } else {
          this.log('Feedback', `No se encontró el formulario de feedback`, true);
        }
      },
/**
 * Procesa la tabla de estados reemplazando Yes/Si por ✓ y No por ─
 * Muestra u oculta divs según el estado de completitud
 * Si no hay datos, oculta la instancia especificada en la configuración
 */
procesarTablaEstados: function() {
    try {
        // Mejorar debugging - Agregar versión del código
        this.log('Estados', `Iniciando procesarTablaEstados - v3.0`, true);
        
        // Verificar si la URL coincide con el patrón configurado
        if (!this.isUrlPatternMatched(config.tablaEstadosConfig)) {
            this.log('Estados', `URL o ID no permitido para procesar tabla de estados`);
            return;
        }
        
        // Obtener el ID del bloque de la configuración
        const idBloque = config.tablaEstadosConfig.instancia;
        this.log('Estados', `Buscando contenedor con ID: ${idBloque}`);
        
        // Buscar el contenedor del bloque
        const contenedor = document.getElementById(idBloque);
        if (!contenedor) {
            this.log('Estados', `ERROR: No se encontró el contenedor con ID: ${idBloque}`, true);
            return;
        }
        this.log('Estados', `Contenedor encontrado: ${contenedor.tagName}#${idBloque}`);
        
        // Buscar el contenido del bloque
        const blockContent = contenedor.querySelector('.content.block-content');
        if (!blockContent) {
            this.log('Estados', `ERROR: No se encontró el contenido del bloque (.content.block-content)`, true);
            return;
        }
        
        // DETECCIÓN MEJORADA: Consideramos que no hay datos si:
        // 1. Existe un elemento con la clase no-results
        // 2. El texto contiene "no hay registros" o "no data available"
        // 3. No hay una tabla o la tabla no tiene filas
        
        // Buscar elementos que indiquen "sin datos"
        const noResultsElement = contenedor.querySelector('.no-results');
        const noDataText = contenedor.textContent.toLowerCase().includes('no hay registros') || 
                          contenedor.textContent.toLowerCase().includes('no data available');
        
        // Buscar tabla y verificar si tiene datos
        const tableContainer = contenedor.querySelector('.totara-table-container');
        let tabla = tableContainer ? tableContainer.querySelector('table') : null;
        
        // Si no encontramos en el contenedor específico, buscar en todo el bloque
        if (!tabla) {
            tabla = contenedor.querySelector('table');
        }
        
        let hayFilas = false;
        if (tabla) {
            const tbody = tabla.querySelector('tbody');
            const filas = tbody ? tbody.querySelectorAll('tr') : [];
            hayFilas = filas.length > 0;
            this.log('Estados', `Tabla: ${!!tabla}, Tbody: ${!!tbody}, Filas: ${filas.length}`);
        } else {
            this.log('Estados', `No se encontró ninguna tabla en el contenedor`);
        }
        
        // DECISIÓN: Consideramos que no hay datos si cualquiera de estas condiciones es verdadera
        const noHayDatos = !!noResultsElement || noDataText || !tabla || !hayFilas;
        const divNoTabla = document.querySelector('.sin-obligatorio');
        
        this.log('Estados', `ESTADO DETECTADO: No hay datos: ${noHayDatos} (NoResults: ${!!noResultsElement}, NoDataText: ${noDataText}, NoTabla: ${!tabla}, NoFilas: ${!hayFilas})`);
        
        // CASO 1: No hay datos - Ocultar la instancia
        if (noHayDatos) {
            this.log('Estados', `Se detectó que no hay datos, ocultando la instancia ${idBloque}`, true);
            contenedor.style.display = 'none';
            
            // Ocultar los divs fo-completa y fo-incompleta
            try {
                const divCompleta = document.querySelector('.fo-completa');
                const divIncompleta = document.querySelector('.fo-incompleta');
                
                if (divCompleta) {
                    divCompleta.style.display = 'none';
                    this.log('Estados', `Div .fo-completa ocultado`);
                }

                if (divNoTabla) {
                    divNoTabla.setAttribute('style', 'display: block !important');
                    this.log('Estados', `Div info no obligatoria mostrado`);
                }
                
                if (divIncompleta) {
                    divIncompleta.style.display = 'none';
                    this.log('Estados', `Div .fo-incompleta ocultado`);
                }
            } catch (divError) {
                this.log('Estados', `ERROR al manipular los divs de estado: ${divError.message}`, true);
            }
            return;
        }
        
        // CASO 2: Hay tabla con datos - Procesar estados
        if (hayFilas) {
            if (divNoTabla) {
                    divNoTabla.style.display = 'none';
                    this.log('Estados', `Div info no obligatoria ocultado`);
            }
            this.log('Estados', `Procesando tabla con datos en ${idBloque}`);
            
            // Obtener todas las filas de datos (excluir encabezados)
            const filas = Array.from(tabla.querySelectorAll('tbody tr'));
            this.log('Estados', `Se encontraron ${filas.length} filas de datos`);
            
            let todosCompletados = true; // Asumimos que todos están completos inicialmente
            
            // Procesar cada fila
            filas.forEach((fila, index) => {
                try {
                    // Obtener la última celda (celda de estado)
                    const celdas = fila.querySelectorAll('td');
                    if (celdas.length === 0) return;
                    
                    const celdaEstado = celdas[celdas.length - 1];
                    
                    if (celdaEstado) {
                        const textoOriginal = celdaEstado.textContent.trim().toLowerCase();
                        
                        // Verificar si el valor ya está transformado para evitar procesarlo múltiples veces
                        if (textoOriginal === '✓' || textoOriginal === '─') {
                            // Ya está transformado, solo actualizar el estado
                            if (textoOriginal === '─') {
                                todosCompletados = false;
                            }
                            return;
                        }
                        
                        // Verificar y reemplazar el estado
                        if (textoOriginal === 'yes' || textoOriginal === 'si' || textoOriginal === 'sí' || textoOriginal === 'sim') {
                            celdaEstado.textContent = '✓'; // Reemplazar con check
                            this.log('Estados', `Fila ${index + 1}: Estado "${textoOriginal}" reemplazado por "✓"`);
                        } else if (textoOriginal === 'no' || textoOriginal === 'não') {
                            celdaEstado.textContent = '─'; // Reemplazar con guión
                            todosCompletados = false; // No todos están completos
                            this.log('Estados', `Fila ${index + 1}: Estado "${textoOriginal}" reemplazado por "─"`);
                        } else {
                            // Si ya tiene otro valor (como "─"), verificar si indica no completado
                            if (textoOriginal !== '✓') {
                                todosCompletados = false;
                            }
                        }
                    }
                } catch (rowError) {
                    this.log('Estados', `Error al procesar fila ${index + 1}: ${rowError.message}`, true);
                }
            });
            
            // Mostrar u ocultar el div correspondiente según el estado
            try {
                const divCompleta = document.querySelector('.fo-completa');
                const divIncompleta = document.querySelector('.fo-incompleta');
                
                if (divCompleta && divIncompleta) {
                    divCompleta.style.display = todosCompletados ? 'block' : 'none';
                    divIncompleta.style.display = todosCompletados ? 'none' : 'block';
                    
                    this.log('Estados', 
                        todosCompletados ? 
                        'Todos los estados completados, mostrando div .fo-completa y ocultando .fo-incompleta' : 
                        'Detectados estados incompletos, mostrando div .fo-incompleta y ocultando .fo-completa'
                    );
                } else {
                    this.log('Estados', `No se encontraron los divs .fo-completa o .fo-incompleta`, true);
                }
            } catch (divStateError) {
                this.log('Estados', `ERROR al manipular los divs de estado: ${divStateError.message}`, true);
            }
        }
        
        this.log('Estados', `Proceso de tabla de estados completado`, true);
    } catch (error) {
        this.log('Estados', `ERROR CRÍTICO al procesar la tabla de estados: ${error.message}`, true);
        console.error('Error en procesarTablaEstados:', error);
    }
},
      /**
       * Crea un acordeón a partir de un div específico y suma puntuaciones
       * @param {string} divId - ID del div que se convertirá en acordeón
       */
      acordeonVisorLFE: function(divId) {
        this.log('Acordeón', `Iniciando creación de acordeón para div: ${divId}`);
        const mainDiv = document.getElementById(divId);
        if (!mainDiv) {
          this.log('Acordeón', `No se encontró el div con ID: ${divId}`, true);
          return;
        }
        const header = mainDiv.querySelector('.header.block-header');
        const content = mainDiv.querySelector('.content.block-content');
        const h2 = header?.querySelector('h2');
        if (!header || !content || !h2) {
          this.log('Acordeón', `No se encontraron los elementos necesarios dentro del div: ${divId}`, true);
          return;
        }
        // Variable para rastrear el estado (expandido/contraído)
        let isExpanded = true;
        // Estilo inicial
        header.style.cursor = 'pointer';
        // Añadir estilos para la transición suave
        content.style.cssText = `
                overflow: hidden;
                transition: max-height ${config.stylesConfig.animations.duration} ${config.stylesConfig.animations.timingFunction}, 
                           opacity ${config.stylesConfig.animations.duration} ${config.stylesConfig.animations.timingFunction};
                max-height: ${content.scrollHeight}px;
                opacity: 1;
            `;
        // Función para cambiar solo la background-image del pseudo-elemento after
        const updateIconBackgroundImage = (collapsed) => {
          const iconUrl = collapsed ? `url('${config.stylesConfig.icons.plusCircleIcon}')` : `url('${config.stylesConfig.icons.minusCircleIcon}')`;
          // Crear o actualizar la regla de estilo específica para este elemento
          let styleElement = document.getElementById(`style-${divId}`);
          if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = `style-${divId}`;
            document.head.appendChild(styleElement);
          }
          // Mantener todos los estilos originales y solo cambiar la background-image
          styleElement.textContent = `
                    div#region-main #${divId} .header.block-header h2::after {
                        content: "";
                        display: inline-block;
                        width: 25px;
                        height: 25px;
                        background-image: ${iconUrl};
                        background-size: contain;
                        background-repeat: no-repeat;
                        margin-left: 15px;
                        vertical-align: middle;
                    }
                `;
        };
        // Configurar icono inicial
        updateIconBackgroundImage(false);
        // Añadir evento de clic al encabezado
        header.addEventListener('click', () => {
          // Alternar visibilidad del contenido con animación
          if (isExpanded) {
            // Guardar la altura actual para la animación
            content.style.maxHeight = `${content.scrollHeight}px`;
            // Forzar un reflow para que la transición funcione
            void content.offsetWidth;
            // Iniciar la animación
            content.style.maxHeight = '0';
            content.style.opacity = '0';
            content.style.paddingTop = '0';
            content.style.paddingBottom = '0';
            content.style.marginBottom = '0';
            // Aplicar borde redondeado al header cuando está contraído
            header.style.borderRadius = 'var(--block-radius)';
            // Cambiar el icono a plus-circle
            updateIconBackgroundImage(true);
          } else {
            // Restaurar el contenido con animación
            content.style.maxHeight = `${content.scrollHeight}px`;
            content.style.opacity = '1';
            content.style.paddingTop = '';
            content.style.paddingBottom = '';
            content.style.marginBottom = '';
            // Restaurar borde original cuando está expandido
            header.style.borderRadius = 'var(--block-radius) var(--block-radius) 0 0';
            // Cambiar el icono a minus-circle
            updateIconBackgroundImage(false);
            // Actualizar maxHeight después de un pequeño retraso para manejar contenido dinámico
            setTimeout(() => {
              content.style.maxHeight = `${content.scrollHeight}px`;
            }, parseFloat(config.stylesConfig.animations.duration) * 1000);
          }
          // Invertir el estado
          isExpanded = !isExpanded;
        });
        // Inicializar con el estilo apropiado para el encabezado
        header.style.borderRadius = isExpanded ? 'var(--block-radius) var(--block-radius) 0 0' : 'var(--block-radius)';
        this.log('Acordeón', `Acordeón creado exitosamente para div: ${divId}`);
      },


/**
 * Inicializa los acordeones para los divs especificados en la configuración y suma puntuaciones
 */
initAcordeones: function() {
  if (!this.isUrlPatternMatched(config.acordeonConfig)) {
    this.log('Acordeón', `URL o ID no permitido para crear acordeones`);
    return;
  }
  this.log('Acordeón', `Patrón de URL permitido encontrado, creando acordeones...`);
  
  // Ocultar el div inst8008 si existe
  const divContenedor = document.getElementById('inst8008');
  if (divContenedor) {
    divContenedor.style.display = "none";
    this.log('Acordeón', `Contenedor con ID inst8008 ocultado`);
  } else {
    this.log('Acordeón', `No se encontró el div con ID inst8008`, true);
  }
  
  // Función para obtener la puntuación máxima del div inst8008
  const obtenerPuntuacionMaxima = () => {
    const divContenedor = document.getElementById('inst8008');
    if (!divContenedor) {
      this.log('Acordeón', `No se encontró el div con ID inst8008`, true);
      return 'YYYY'; // Mantener YYYY si no se encuentra el div
    }
    const divCustomFields = divContenedor.querySelector('.block_current_learningas-customfields');
    if (!divCustomFields) {
      this.log('Acordeón', `No se encontró el div con clase block_current_learningas-customfields dentro de inst8008`, true);
      return 'YYYY'; // Mantener YYYY si no se encuentra el div interno
    }
    // Extraer el número del texto del div
    const texto = divCustomFields.textContent.trim();
    const numeroMatch = texto.match(/\d+/); // Buscar uno o más dígitos
    if (numeroMatch) {
      const puntuacionMaxima = numeroMatch[0];
      this.log('Acordeón', `Puntuación máxima encontrada: ${puntuacionMaxima}`);
      return puntuacionMaxima;
    } else {
      this.log('Acordeón', `No se encontró un número en el texto: "${texto}"`, true);
      return 'YYYY'; // Mantener YYYY si no se encuentra un número
    }
  };
  
  // Función auxiliar para identificar si un encabezado es de puntuación
  const esCabeceraDeCalificacion = (texto) => {
    if (!texto) return false;
    texto = texto.toLowerCase();
    // Palabras clave que pueden indicar que la columna es de puntuación/calificación
    const palabrasClave = [
      'punto', 'puntos', 'lfe', 'certificación', 'calificación', 'puntuación', 'score', 'points'
    ];
    return palabrasClave.some(palabra => texto.includes(palabra));
  };
  
  // Variable para la suma total de puntuaciones
  let sumaPuntuacionTotal = 0;
  // Variable para controlar si se encontró contenido
  let contenidoEncontrado = false;
  
  // Procesar cada div configurado
  config.acordeonConfig.instancias.forEach(divId => {
    const div = document.getElementById(divId);
    if (div) {
      // Crear el acordeón
      this.acordeonVisorLFE(divId);
      
      // Buscar tablas dentro del div
      const tablas = div.querySelectorAll('table');
      if (tablas.length > 0) {
        contenidoEncontrado = true;
      }
      
      tablas.forEach(tabla => {
        // Primero intentamos usando las clases específicas que sabemos
        let puntosEncontrados = false;
        
        // 1. Probar con las clases específicas conocidas
        const celdasConocidas = tabla.querySelectorAll('td.evidence_custom_field_13, td.course_custom_field_10');
        celdasConocidas.forEach(celda => {
          const texto = celda.textContent.trim();
          const numero = parseFloat(texto);
          if (!isNaN(numero)) {
            sumaPuntuacionTotal += numero;
            puntosEncontrados = true;
            this.log('Acordeón', `Valor encontrado (clase conocida): ${numero}, Total: ${sumaPuntuacionTotal}`);
          }
        });
        
        // 2. Si no se encontraron puntos por clases específicas, intentamos encontrar la columna de puntuación
        if (!puntosEncontrados) {
          // Obtener encabezados de la tabla
          const encabezados = tabla.querySelectorAll('th');
          const columnasPuntuacion = [];
          
          // Identificar qué columnas podrían contener puntuaciones basado en el texto del encabezado
          encabezados.forEach((encabezado, indice) => {
            const textoEncabezado = encabezado.textContent.trim();
            if (esCabeceraDeCalificacion(textoEncabezado)) {
              columnasPuntuacion.push(indice);
              this.log('Acordeón', `Columna de puntuación identificada: ${indice} (${textoEncabezado})`);
            }
          });
          
          // Si encontramos columnas de puntuación, procesamos esas columnas específicas
          if (columnasPuntuacion.length > 0) {
            const filas = tabla.querySelectorAll('tbody tr');
            filas.forEach(fila => {
              const celdas = fila.querySelectorAll('td');
              columnasPuntuacion.forEach(indiceColumna => {
                if (celdas[indiceColumna]) {
                  const texto = celdas[indiceColumna].textContent.trim();
                  const numero = parseFloat(texto);
                  if (!isNaN(numero)) {
                    sumaPuntuacionTotal += numero;
                    this.log('Acordeón', `Valor encontrado (columna identificada): ${numero}, Total: ${sumaPuntuacionTotal}`);
                  }
                }
              });
            });
          } 
          // 3. Si no encontramos columnas por el encabezado, buscamos cualquier celda que tenga solo un número
          else {
            const filas = tabla.querySelectorAll('tbody tr');
            filas.forEach(fila => {
              // Buscar la última celda de cada fila que tenga solo un número
              const celdas = Array.from(fila.querySelectorAll('td'));
              // Buscamos de derecha a izquierda para encontrar la última columna numérica
              for (let i = celdas.length - 1; i >= 0; i--) {
                const celda = celdas[i];
                const texto = celda.textContent.trim();
                // Verificar si el texto contiene solo un número
                if (/^\d+(\.\d+)?$/.test(texto)) {
                  const numero = parseFloat(texto);
                  if (!isNaN(numero)) {
                    sumaPuntuacionTotal += numero;
                    this.log('Acordeón', `Valor numérico encontrado (última columna): ${numero}, Total: ${sumaPuntuacionTotal}`);
                    break; // Solo tomamos un valor por fila
                  }
                }
              }
            });
          }
        }
      });
    }
  });
  
  // Verificación crítica: registrar el valor calculado
  this.log('Acordeón', `Puntuación total calculada: ${sumaPuntuacionTotal}`, true);
  this.log('Acordeón', `¿Se encontró contenido? ${contenidoEncontrado ? 'Sí' : 'No'}`, true);
  
  // Mantener una referencia a this para usar dentro del setTimeout
  const self = this;
  
  // Guardar el valor en una variable global
  window.puntuacionCalculadaLFE = sumaPuntuacionTotal;
  window.contenidoLFEEncontrado = contenidoEncontrado;
  
  // Función para actualizar los spans con la puntuación
  const actualizarSpansPuntuacion = function() {
    // Obtener la puntuación máxima
    const puntuacionMaxima = obtenerPuntuacionMaxima();
    
    // Usar la variable global para obtener la puntuación calculada
    const puntuacionActual = window.puntuacionCalculadaLFE;
    
    // Forzar la actualización directa de los spans
    const spans = document.querySelectorAll('.lfe-visor-puntuacion');
    self.log('Acordeón', `Actualizando ${spans.length} spans con puntuación ${puntuacionActual}/${puntuacionMaxima}`, true);
    
    spans.forEach((span, index) => {
      // Reemplazar directamente con el formato X/Y
      span.textContent = `${puntuacionActual}/${puntuacionMaxima}`;
      
      // Verificar DOM después de la actualización para cada span
      self.log('Acordeón', `Span ${index} actualizado a: ${span.textContent}`, true);
      
      // Añadir clase para indicar que ya se actualizó el span
      span.classList.add('lfe-actualizado');
      
      // Forzar repintado del DOM - técnica adicional para asegurar que se muestre
      span.style.display = 'none';
      setTimeout(() => { span.style.display = ''; }, 10);
    });
    
    self.log('Acordeón', `Puntuación actualizada: ${puntuacionActual}/${puntuacionMaxima}`, true);
    
    // Verificar si la actualización ha tenido éxito después de un momento
    setTimeout(() => {
      const spanVerificacion = document.querySelector('.lfe-visor-puntuacion');
      if (spanVerificacion) {
        self.log('Acordeón', `Verificación final - valor en span: ${spanVerificacion.textContent}`, true);
      }
    }, 500);
  };
  
  // Ejecutar la actualización inmediatamente 
  actualizarSpansPuntuacion();
  
  // Si no hay contenido, detenemos cualquier actualización adicional para evitar bucles
  if (!contenidoEncontrado) {
    self.log('Acordeón', `No se encontró contenido. Mostrando puntuación 0/${obtenerPuntuacionMaxima()} y deteniendo actualizaciones.`, true);
    // No programamos más actualizaciones
    return sumaPuntuacionTotal;
  }
  
  // Solo programar actualización adicional si hay contenido
  setTimeout(actualizarSpansPuntuacion, 1000);
  
  // Agregar un observador de mutaciones con limitación de tiempo
  if (window.MutationObserver && !window.observadorPuntuacionLFE) {
    // Contador para limitar las correcciones
    let contadorCorrecciones = 0;
    const maxCorrecciones = 5;
    
    window.observadorPuntuacionLFE = new MutationObserver(function(mutations) {
      // Limitar el número de correcciones para evitar bucles infinitos
      if (contadorCorrecciones >= maxCorrecciones) {
        self.log('Acordeón', `Límite de correcciones alcanzado (${maxCorrecciones}). Deteniendo observador.`, true);
        window.observadorPuntuacionLFE.disconnect();
        return;
      }
      
      mutations.forEach(function(mutation) {
        if (mutation.type === 'childList' || mutation.type === 'characterData') {
          // Si detectamos cambios en el DOM, volvemos a verificar los spans
          const spans = document.querySelectorAll('.lfe-visor-puntuacion');
          spans.forEach(span => {
            // Solo corregir si no tiene la clase de actualizado o si tiene valor incorrecto
            const textoActual = span.textContent;
            if (!span.classList.contains('lfe-actualizado') || 
                textoActual.startsWith('0/') && window.puntuacionCalculadaLFE > 0 || 
                textoActual.includes('XXX')) {
              
              // Incrementar contador de correcciones
              contadorCorrecciones++;
              
              // Si encontramos un span con valor incorrecto, lo actualizamos
              const puntuacionMaxima = obtenerPuntuacionMaxima();
              span.textContent = `${window.puntuacionCalculadaLFE}/${puntuacionMaxima}`;
              span.classList.add('lfe-actualizado');
              self.log('Acordeón', `Corrección automática de span a: ${span.textContent} (corrección #${contadorCorrecciones})`, true);
            }
          });
        }
      });
    });
    
    // Observar el documento por tiempo limitado (5 segundos)
    window.observadorPuntuacionLFE.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
    
    self.log('Acordeón', `Observador de mutaciones activado para mantener la puntuación (máximo ${maxCorrecciones} correcciones)`, true);
    
    // Desconectar el observador después de 5 segundos para evitar problemas de rendimiento
    setTimeout(() => {
      if (window.observadorPuntuacionLFE) {
        window.observadorPuntuacionLFE.disconnect();
        self.log('Acordeón', `Observador de mutaciones desconectado después de 5 segundos`, true);
      }
    }, 5000);
  }
  
  return sumaPuntuacionTotal;
},
      /**
       * Inicializa las funciones para las etiquetas obligatorias en múltiples idiomas
       */
      initMandatoryLabels: function() {
        if (!this.isUrlPatternMatched(config.mandatoryLabelConfig)) {
          this.log('Etiquetas', `URL o ID no permitido para añadir etiquetas obligatorias`);
          return;
        }
        this.log('Etiquetas', `Patrón de URL permitido encontrado, procesando etiquetas obligatorias...`);
        // Lista de términos obligatorios en diferentes idiomas
        const mandatoryTerms = {
          'es': 'Obligatorio',
          'en': 'Mandatory',
          'pt': 'Obrigatório',
          'cs': 'Povinné',
          'it': 'Obbligatorio',
          'sv': 'Kursk'
        };
        // Versión modificada de agregarEtiquetaObligatorio que soporta múltiples idiomas
        const agregarEtiquetaMultilingue = (containerId) => {
          const container = document.getElementById(containerId);
          if (!container) {
            this.log('Etiquetas', `No se encontró el contenedor ${containerId}.`, true);
            return;
          }
          const listItems = container.querySelectorAll("li.block_current_learningas-tile");
          this.log('Etiquetas', `Se encontraron ${listItems.length} elementos 
          <li> en ${containerId}.`);
          listItems.forEach(li => {
            const mandatoryDiv = li.querySelector("div.block_current_learningas-customfield");
            if (mandatoryDiv) {
              // Buscar coincidencia con cualquiera de los términos obligatorios
              const matchedTerm = Object.entries(mandatoryTerms).find(([lang, term]) => mandatoryDiv.textContent.includes(term));
              if (matchedTerm && !li.querySelector(".etiqueta-obligatorio")) {
                const [lang, term] = matchedTerm;
                const span = document.createElement("span");
                span.classList.add("etiqueta-obligatorio");
                span.textContent = term;
                li.appendChild(span);
                this.log('Etiquetas', `Etiqueta añadida (${lang}: ${term}) en ${containerId}.`);
              }
            }
            const customFieldsDiv = li.querySelector("div.block_current_learningas-customfields");
            if (customFieldsDiv) {
              customFieldsDiv.style.display = "none";
            }
          });
        };
        // Versión modificada de observeMandatoryLabels que usa la nueva función multilingüe
        const observeMultilingualLabels = (containerId) => {
          const targetNode = document.getElementById(containerId);
          if (!targetNode) {
            this.log('Etiquetas', `No se encontró el contenedor ${containerId}.`, true);
            return;
          }
          if (targetNode._observer) return;
          this.log('Etiquetas', `Observador activado en ${containerId}.`);
          const observer = new MutationObserver(() => {
            this.log('Etiquetas', `Cambios detectados en ${containerId}, verificando etiquetas...`);
            agregarEtiquetaMultilingue(containerId);
          });
          observer.observe(targetNode, {
            childList: true,
            subtree: true
          });
          targetNode._observer = observer;
        };
        // Procesar cada instancia con las nuevas funciones
        config.mandatoryLabelConfig.instancias.forEach(containerId => {
          this.waitForElement(`#${containerId}`, () => {
            agregarEtiquetaMultilingue(containerId);
            observeMultilingualLabels(containerId);
          });
        });
      },

      /**
       * Reemplaza los íconos en las tablas según la configuración
       * Esta versión combina ambas funcionalidades: reemplazo simple y reemplazo condicional basado en LFE
       */
      replaceTableIcons: function() {
        if (!this.isUrlPatternMatched(config.iconReplacerConfig)) {
          this.log('IconReplacer', `URL o ID no permitido para reemplazar íconos`);
          return;
        }
        this.log('IconReplacer', `Patrón de URL permitido encontrado, reemplazando íconos...`);
        // Procesar cada instancia configurada
        config.iconReplacerConfig.instancias.forEach(instancia => {
          this.waitForElement(`#${instancia}`, (container) => {
            // Intentar primero el enfoque basado en filas (segunda implementación)
            const filas = container.querySelectorAll('tr');
            if (filas && filas.length > 0) {
              this.log('IconReplacer', `Se encontraron ${filas.length} filas en #${instancia}`);
              // Procesar cada fila
              filas.forEach(fila => {
                // Comprobar si existe la celda con la clase course_custom_field_1
                const customFieldCell = fila.querySelector('td.course_custom_field_1');
                let useLfeIcon = false;
                // Comprobar si contiene 'lfe' en el texto (convertido a minúsculas)
                if (customFieldCell && customFieldCell.textContent.toLowerCase().includes('lfe')) {
                  useLfeIcon = true;
                  this.log('IconReplacer', `Se encontró texto LFE en fila`);
                }
                // Ocultar la celda course_custom_field_1
                if (customFieldCell) {
                  customFieldCell.style.display = 'none';
                  this.log('IconReplacer', `Celda course_custom_field_1 ocultada`);
                }
                // Determinar qué ícono usar basado en la comprobación
                const iconUrl = useLfeIcon ? config.iconReplacerConfig.lfeIconUrl : config.iconReplacerConfig.newIconUrl;
                // Reemplazar las imágenes en esta fila
                const imagenes = fila.querySelectorAll('img');
                imagenes.forEach(img => {
                  const originalSrc = img.src;
                  img.src = iconUrl;
                  this.log('IconReplacer', `Imagen reemplazada: ${originalSrc} -> ${iconUrl}`);
                });
              });
            } else {
              // Si no hay filas, usar el enfoque simple (primera implementación)
              const imagenes = container.querySelectorAll('img');
              this.log('IconReplacer', `Se encontraron ${imagenes.length} imágenes en #${instancia}`);
              // Reemplazar cada imagen con la nueva URL
              imagenes.forEach(img => {
                const originalSrc = img.src;
                img.src = config.iconReplacerConfig.newIconUrl;
                this.log('IconReplacer', `Imagen reemplazada: ${originalSrc} -> ${config.iconReplacerConfig.newIconUrl}`);
              });
            }
          });
        });
      },
      /**
       * Añade iconos de completado y oculta el estado de completado original
       */
      addCompletionIconAndHideStatus: function() {
        if (!this.isUrlPatternMatched(config.completionIconConfig)) {
          this.log('Icono', `URL o ID no permitido para añadir el icono de completado`);
          return;
        }
        this.log('Icono', `Patrón de URL permitido encontrado, añadiendo iconos de completado...`);
        document.querySelectorAll('td.course_completion_iscomplete').forEach(td => {
          td.style.display = 'none';
          const completionText = td.textContent.trim().toLowerCase();
          const siRegex = /^s[ií]$/;
          const yesRegex = /^yes$/;
          if (siRegex.test(completionText) || yesRegex.test(completionText)) {
            const link = td.parentNode.querySelector('.course_courselinkicon a');
            if (link) {
              const icon = document.createElement('img');
              icon.src = config.stylesConfig.icons.completedIcon;
              icon.style.cssText = `
                            display: block;
                            width: 20px;
                            height: 20px;
                            position: absolute;
                            right: 10px;
                            top: 24px;
                        `;
              if (!link.style.position || link.style.position === 'static') {
                link.style.position = 'relative';
              }
              link.appendChild(icon);
              this.log('Icono', `Icono de completado añadido.`);
            }
          }
        });
      },
/**
 * Oculta los divs de Current Learning o Programas que no contienen cursos matriculados
 * @param {Array} instanceIds - Array de IDs de instancias a verificar
 */
hideCurrentLearningVacios: function(instanceIds) {
  // Verificar si la URL coincide con los patrones configurados
  if (!this.isUrlPatternMatched(config.currentLearningVaciosConfig)) {
    this.log('CurrentLearningVacios', `URL o ID no permitido para ocultar contenedores vacíos`);
    return;
  }
  
  this.log('CurrentLearningVacios', `Verificando ${instanceIds.length} instancias para ocultar si están vacíos`, true);
  
  // Iterar sobre cada ID de instancia proporcionado
  instanceIds.forEach(instId => {
    try {
      // Obtener el elemento por su ID
      const container = document.getElementById(instId);
      
      if (!container) {
        this.log('CurrentLearningVacios', `No se encontró el contenedor con ID: ${instId}`, true);
        return;
      }
      
      this.log('CurrentLearningVacios', `Analizando contenedor ${instId}`);
      
      // Detectar si es Learning o Programas
      const isLearning = container.classList.contains('block_current_learningas');
      const isProgramas = container.classList.contains('block_current_programsas');
      const tilesClass = isLearning ? '.block_current_learningas-tiles' : '.block_current_programsas-tiles';
      const tileItemClass = isLearning ? 'li.block_current_learningas-tile' : 'li.block_current_programsas-tile';
      
      // Buscar el contenedor principal de tiles
      const tilesContainer = container.querySelector(tilesClass);
      if (!tilesContainer) {
        this.log('CurrentLearningVacios', `No se encontró el contenedor de tiles en ${instId}`, true);
        return;
      }
      
      // CLAVE: Buscar elementos UL dentro del contenedor de tiles
      // excluyendo los UL del dropdown-menu
      const contentULs = Array.from(tilesContainer.querySelectorAll('ul')).filter(ul => {
        // Excluir ULs que sean parte del dropdown-menu
        return !ul.classList.contains('dropdown-menu');
      });
      
      // Si hay al menos un UL con elementos LI (que no sea dropdown), mantener visible
      let hasContent = false;
      
      for (const ul of contentULs) {
        const liItems = ul.querySelectorAll('li');
        if (liItems.length > 0) {
          this.log('CurrentLearningVacios', `Encontrado UL con ${liItems.length} elementos LI en ${instId}, manteniendo visible`, true);
          hasContent = true;
          break;
        }
      }
      
      // Si no se encontraron ULs con elementos, verificar directamente los LI de curso
      if (!hasContent) {
        const courseElements = container.querySelectorAll(tileItemClass);
        if (courseElements.length > 0) {
          this.log('CurrentLearningVacios', `Encontrados ${courseElements.length} elementos de curso en ${instId}, manteniendo visible`);
          hasContent = true;
        }
      }
      
      // Toma la decisión final basada en el contenido
      if (!hasContent) {
        this.log('CurrentLearningVacios', `No se encontró contenido relevante en ${instId}, ocultando contenedor`, true);
        container.style.display = 'none';
      } else {
        this.log('CurrentLearningVacios', `Contenedor ${instId} tiene contenido, manteniéndolo visible`);
      }
    } catch (error) {
      this.log('CurrentLearningVacios', `Error al procesar ${instId}: ${error.message}`, true);
    }
  });
},

/**
 * Mejora de la función init para asegurar que hideCurrentLearningVacios se ejecute correctamente
 */
init: function() {
   const currentPath = window.location.pathname;
    const currentUrl = currentPath + window.location.search;
    
    const isUrlMatched = config.pathPatterns.some(pattern => {
        if (pattern.endsWith('id=')) {
            return currentUrl.includes(pattern) && this.getQueryParam('id') !== null;
        }
        return currentPath.includes(pattern) || currentUrl.includes(pattern);
    });

    // Verificar si estamos en una ruta de feedback
    if (config.feedbackFacesConfig.enabledForPaths.some(path => currentPath.includes(path))) {
        this.log('Dashboard', `URL de feedback detectada: ${currentUrl}`);
        this.replaceFeedbackNumbers();
    } else if (isUrlMatched) {
        this.log('Dashboard', `URL coincide con patrones configurados: ${currentUrl}`);
        
        // Inicializar etiquetas obligatorias
        this.initMandatoryLabels();

        // Inicializar procesamiento de título y banner
        this.waitForElement(`#${config.titleBannerConfig.instancia}`, () => {
            this.procesarTituloYActualizarBanner();
        });
        
        // Inicializar procesamiento de tabla de estados
        const estadosContainer = document.getElementById(config.tablaEstadosConfig.instancia);
        if (estadosContainer) {
            this.log('Dashboard', `Contenedor de tabla de estados encontrado: #${config.tablaEstadosConfig.instancia}`);
            const tabla = estadosContainer.querySelector('table');
            if (tabla) {
                this.log('Dashboard', `Tabla encontrada, procesando estados...`);
                this.procesarTablaEstados();
            } else {
                this.log('Dashboard', `No se encontró tabla, procesando como tabla vacía...`);
                this.procesarTablaEstados();
            }
        } else {
            this.log('Dashboard', `Contenedor de tabla de estados no encontrado: #${config.tablaEstadosConfig.instancia}`);
        }
        
        // Inicializar acordeones
        this.initAcordeones();
        
        // Inicializar reemplazo de íconos en tablas
        this.replaceTableIcons();
        
        // Inicializar iconos de completado
        this.waitForElement('.course_completion_iscomplete', () => {
            this.addCompletionIconAndHideStatus();
        });
        
        // Inicializar ocultar Current Learning vacíos
        if (config.currentLearningVaciosConfig && config.currentLearningVaciosConfig.instancias) {
            this.log('Dashboard', `Inicializando verificación de Current Learning vacíos...`);
            // Asegurar que los elementos estén cargados antes de intentar ocultarlos
            const checkAndHideEmptyContainers = () => {
                let allContainersFound = true;
                
                // Verificar si todos los contenedores existen
                config.currentLearningVaciosConfig.instancias.forEach(instId => {
                    if (!document.getElementById(instId)) {
                        allContainersFound = false;
                    }
                });
                
                if (allContainersFound) {
                    this.log('Dashboard', `Todos los contenedores Current Learning encontrados, ejecutando hideCurrentLearningVacios`);
                    this.hideCurrentLearningVacios(config.currentLearningVaciosConfig.instancias);
                } else {
                    this.log('Dashboard', `Esperando a que se carguen todos los contenedores Current Learning...`);
                    setTimeout(checkAndHideEmptyContainers, 300);
                }
            };
            
            checkAndHideEmptyContainers();
        }
    } else {
        this.log('Dashboard', `URL no coincide con los patrones configurados: ${currentUrl}`);
    }
}
      
    };
    // Iniciar todas las funcionalidades
    DashboardFunctions.init();
  });
  /**************** SCRIPT QUITAR IDIOMA *******************/
  (function() {
    function verificarYOcultar() {
      // Verificar si existe un elemento con la clase tenant-user-ext
      const tenantUserExt = document.querySelector('.tenant-user-ext');
      // Solo proceder a ocultar si existe la clase tenant-user-ext
      if (tenantUserExt) {
        // Buscar el selector de idioma por sus características distintivas
        // Método 1: Por data-title
        const selectorPorDataTitle = document.querySelector('a[data-title="selectedlang"]');
        if (selectorPorDataTitle && selectorPorDataTitle.closest('li')) {
          selectorPorDataTitle.closest('li').style.display = 'none';
          return true;
        }
        // Método 2: Por el ícono característico
        const selectorPorIcono = document.querySelector('#action-menu-0-menu li a .tfont-var-chevron-right');
        if (selectorPorIcono && selectorPorIcono.closest('li')) {
          selectorPorIcono.closest('li').style.display = 'none';
          return true;
        }
        // Método 3: Por la estructura - elemento seguido de opciones de idioma
        const menuItems = document.querySelectorAll('#action-menu-0-menu li');
        for (let i = 0; i < menuItems.length; i++) {
          const currentItem = menuItems[i];
          const nextItem = menuItems[i + 1];
          if (nextItem && nextItem.querySelector('a[data-title^="notselected lang_"]')) {
            currentItem.style.display = 'none';
            return true;
          }
        }
      }
      return false;
    }
    // Función de configuración inicial
    function iniciar() {
      // Intentar ocultar inmediatamente
      if (!verificarYOcultar()) {
        // Si no funciona, intentar periódicamente
        let intentos = 0;
        const interval = setInterval(function() {
          if (verificarYOcultar() || intentos >= 15) {
            clearInterval(interval);
          }
          intentos++;
        }, 200);
      }
      // Configurar observer para detectar cambios en el DOM
      const observer = new MutationObserver(function(mutations) {
        // Si hay cambios, verificar y ocultar si es necesario
        verificarYOcultar();
      });
      // Observar cambios en todo el documento
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class'] // Para detectar si se añade la clase tenant-user-ext
      });
    }
    // Ejecutar cuando el DOM esté listo
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', iniciar);
    } else {
      iniciar();
    }
  })();



// Script para detectar idioma e insertar contenido HTML según el idioma detectado
console.log("[ENROL PAGE MOD] Script iniciado");

// Verificar las condiciones antes de ejecutar el script
const hasTenantUserExt = document.querySelector('.tenant-user-ext') === null;
const isEnrolPage = window.location.href.includes("/enrol/index.php?id=");
const hasInfoContentEsq = document.querySelector('.infocontent.esq') !== null;

console.log("[ENROL PAGE MOD] Condiciones iniciales:", {
  hasTenantUserExt,
  isEnrolPage,
  hasInfoContentEsq
});

// SIEMPRE que sea una página de matrícula (URL contiene "/enrol/index.php?id=")
if (isEnrolPage) {
  console.log("[ENROL PAGE MOD] Es una página de matrícula, actualizando el título de la pestaña");
  
  // Encontrar el div con la clase "infocontent esq"
  const infoContentDiv = document.querySelector('.infocontent.esq');
  
  if (infoContentDiv) {
    // Buscar el h2 y luego el enlace dentro de él
    const h2Element = infoContentDiv.querySelector('h2');
    
    if (h2Element) {
      const aElement = h2Element.querySelector('a');
      
      if (aElement) {
        // Obtener el texto del enlace y establecerlo como título de la página
        const courseTitle = aElement.textContent.trim();
        if (courseTitle) {
          document.title = courseTitle;
          console.log("[ENROL PAGE MOD] Título de la pestaña actualizado a:", courseTitle);
        } else {
          console.log("[ENROL PAGE MOD] El enlace no tiene texto");
        }
      } else {
        console.log("[ENROL PAGE MOD] No se encontró el enlace dentro del h2");
      }
    } else {
      console.log("[ENROL PAGE MOD] No se encontró el elemento h2");
    }
  } else {
    console.log("[ENROL PAGE MOD] No se encontró el div con clase 'infocontent esq'");
  }
}

// Solo ejecutar el resto del script si se cumplen todas las condiciones
if (hasTenantUserExt && isEnrolPage && hasInfoContentEsq) {
  console.log("[ENROL PAGE MOD] Condiciones cumplidas, verificando enrolinstances");
  
  // NUEVA CONDICIÓN: Verificar si el div enrolinstances tiene elementos o contiene texto
  const enrolInstancesDiv = document.querySelector('.enrolinstances');
  
  // Verificar si tiene elementos hijos O contiene texto que no sean solo espacios en blanco
  const hasContent = enrolInstancesDiv && 
                     (enrolInstancesDiv.children.length > 0 || 
                      enrolInstancesDiv.textContent.trim() !== '');
  
  console.log("[ENROL PAGE MOD] enrolinstances tiene contenido:", hasContent);
  
  // Si tiene elementos o texto en enrolinstances, solo ocultar el div ascoursecustomfields
  if (hasContent) {
    console.log("[ENROL PAGE MOD] enrolinstances tiene elementos o texto, solo ocultando ascoursecustomfields");
    
    const ascoursecustomfieldsDiv = document.querySelector('.ascoursecustomfields');
    if (ascoursecustomfieldsDiv) {
      ascoursecustomfieldsDiv.style.display = 'none';
      console.log("[ENROL PAGE MOD] Div ascoursecustomfields ocultado correctamente");
    } else {
      console.log("[ENROL PAGE MOD] No se encontró el div ascoursecustomfields");
    }
  } 
  // Si NO tiene elementos ni texto en enrolinstances, ejecutar el script original completo
  else {
    console.log("[ENROL PAGE MOD] enrolinstances está vacío, ejecutando script completo");
    
    // Detectar el idioma basado en el elemento del menú
    const menuElement = document.getElementById('totaramenuitem37');
    
    if (!menuElement) {
      console.log("[ENROL PAGE MOD] No se encontró el elemento con ID totaramenuitem37");
    } else {
      // Buscar el elemento con la clase específica dentro del menú
      const languageLabel = menuElement.querySelector('.totaraNav_prim--list_item_label');
      
      if (!languageLabel) {
        console.log("[ENROL PAGE MOD] No se encontró el elemento con clase totaraNav_prim--list_item_label");
      } else {
        const menuText = languageLabel.textContent.trim();
        console.log("[ENROL PAGE MOD] Texto del menú detectado:", menuText);
        
        // Determinar el idioma basado en el texto del menú
        let detectedLanguage = '';
        
        if (menuText.includes('Minha Formação')) {
          detectedLanguage = 'PT';
        } else if (menuText.includes('Moje školení')) {
          detectedLanguage = 'CS';
        } else if (menuText.includes('My Training')) {
          detectedLanguage = 'EN';
        } else if (menuText.includes('La mia formazione')) {
          detectedLanguage = 'IT';
        } else if (menuText.includes('Mi Formación')) {
          detectedLanguage = 'ES';
        } else if (menuText.includes('Min utbildning')) {
          detectedLanguage = 'SV';
        } else {
          console.log("[ENROL PAGE MOD] No se pudo detectar un idioma válido, usando inglés por defecto");
          detectedLanguage = 'EN';
        }
        
        console.log("[ENROL PAGE MOD] Idioma detectado:", detectedLanguage);
        
        // Localizar el div con role="main"
        const mainDiv = document.querySelector('div[role="main"]');
        
        if (!mainDiv) {
          console.log("[ENROL PAGE MOD] No se encontró el div con role='main'");
        } else {
          console.log("[ENROL PAGE MOD] Se encontró el div con role='main'");
          
          // Encontrar el div con clase "row" dentro del main
          const rowDiv = mainDiv.querySelector('.row');
          
          if (!rowDiv) {
            console.log("[ENROL PAGE MOD] No se encontró el div con clase 'row'");
          } else {
            console.log("[ENROL PAGE MOD] Se encontró el div con clase 'row'");
            
            // Obtener los divs hijos del rowDiv
            const childDivs = Array.from(rowDiv.children).filter(child => child.tagName === 'DIV');
            
            if (childDivs.length < 2) {
              console.log("[ENROL PAGE MOD] No se encontraron los dos divs esperados dentro de 'row'");
            } else {
              // Identificar cuál div contiene el elemento con clase "infocontent esq"
              let firstDiv, secondDiv;
              
              if (childDivs[0].querySelector('.infocontent.esq')) {
                firstDiv = childDivs[0];
                secondDiv = childDivs[1];
              } else if (childDivs[1].querySelector('.infocontent.esq')) {
                firstDiv = childDivs[1];
                secondDiv = childDivs[0];
              } else {
                console.log("[ENROL PAGE MOD] No se pudo identificar correctamente los divs");
                firstDiv = null;
                secondDiv = null;
              }
              
              if (!firstDiv || !secondDiv) {
                console.log("[ENROL PAGE MOD] No se pudieron identificar los divs correctamente");
              } else {
                console.log("[ENROL PAGE MOD] Se identificaron correctamente los dos divs");
                
                // Buscar el formulario completo con id "mform2" en el segundo div
                const enrollForm = secondDiv.querySelector('#mform2');
                
                if (!enrollForm) {
                  console.log("[ENROL PAGE MOD] No se encontró el formulario con id 'mform2'");
                } else {
                  console.log("[ENROL PAGE MOD] Se encontró el formulario con id 'mform2'");
                }
                
                // Clonar el formulario para insertarlo después
                const clonedForm = enrollForm ? enrollForm.cloneNode(true) : null;
                
                // Contenido HTML para cada idioma
                const htmlContent = {
                  'ES': `<div class="info-catalogo"><div class="info-izq">Este curso está diseñado para facilitar tu formación en aspectos clave de tu actividad diaria. Podrás acceder a los contenidos a tu ritmo, con recursos útiles y prácticos para aplicar en tu trabajo.&nbsp;<p><b>Fórmate a tu ritmo, con materiales de calidad y el respaldo de IVI RMA.&nbsp;</b></p><p class="last-p">Si te interesa, puedes iniciar el curso haciendo clic en el botón inferior <b>"Matricularme"</b>.</p></div><div class="img"><img src="https://ivirmacampus.com/pluginfile.php/1/local_uploadfiles/additionalimages/0/matriculate-img.svg" alt="" width="400" height="264" role="presentation" class="img-responsive atto_image_button_text-bottom"></div>
</div>`,
                  
                  'EN': `<div class="info-catalogo"><div class="info-izq">This course is designed to support your training in key aspects of your daily work. You can access the content at your own pace, with useful and practical resources to apply in your job.&nbsp;</p><p><b>Learn at your own pace, with quality materials and the support of IVI RMA.&nbsp;</b></p><p class="last-p">If you're interested, you can start the course by clicking the <b>"Enroll"</b> button below.</p></div><div class="img"><img src="https://ivirmacampus.com/pluginfile.php/1/local_uploadfiles/additionalimages/0/matriculate-img.svg" alt="" width="400" height="264" role="presentation" class="img-responsive atto_image_button_text-bottom"></div>
</div>`,
                  
                  'PT': `<div class="info-catalogo"><div class="info-izq">Este curso foi desenvolvido para apoiar a sua formação em aspectos-chave da sua atividade diária. Você poderá acessar os conteúdos no seu próprio ritmo, com recursos úteis e práticos para aplicar no seu trabalho.&nbsp;</p><p><b>Forme-se no seu ritmo, com materiais de qualidade e o respaldo da IVI RMA.&nbsp;</b></p><p class="last-p">Se tiver interesse, pode iniciar o curso clicando no botão abaixo<b> "Matricular-me"</b>.</p></div><div class="img"><img src="https://ivirmacampus.com/pluginfile.php/1/local_uploadfiles/additionalimages/0/matriculate-img.svg" alt="" width="400" height="264" role="presentation" class="img-responsive atto_image_button_text-bottom"></div>
</div>`,
                  
                  'IT': `<div class="info-catalogo"><div class="info-izq">Questo corso è stato progettato per supportare la tua formazione sugli aspetti chiave della tua attività quotidiana. Potrai accedere ai contenuti al tuo ritmo, con risorse utili e pratiche da applicare al lavoro.&nbsp;</p><p><b>Formati al tuo ritmo, con materiali di qualità e il supporto di IVI RMA.</b>&nbsp;</p><p class="last-p">Se sei interessato, puoi iniziare il corso cliccando sul pulsante in basso <b>"Iscrivimi"</b>.</p></div><div class="img"><img src="https://ivirmacampus.com/pluginfile.php/1/local_uploadfiles/additionalimages/0/matriculate-img.svg" alt="" width="400" height="264" role="presentation" class="img-responsive atto_image_button_text-bottom"></div>
</div>`,
                  
                  'CS': `<div class="info-catalogo"><div class="info-izq">Tento kurz je navržen tak, aby podpořil vaše vzdělávání v klíčových oblastech vaší každodenní práce. K obsahu můžete přistupovat vlastním tempem, s užitečnými a praktickými materiály pro vaši práci.&nbsp;</p><p><b>Vzdělávejte se vlastním tempem, s kvalitními materiály a podporou IVI RMA.</b>&nbsp;</p><p class="last-p">Máte-li zájem, můžete kurz zahájit kliknutím na tlačítko dole "<b>Zapsat se"</b>.</p></div><div class="img"><img src="https://ivirmacampus.com/pluginfile.php/1/local_uploadfiles/additionalimages/0/matriculate-img.svg" alt="" width="400" height="264" role="presentation" class="img-responsive atto_image_button_text-bottom"></div>
</div>`,
                  
                  'SV': `<div class="info-catalogo"><div class="info-izq">Den här kursen är utformad för att stödja din utbildning inom viktiga delar av ditt dagliga arbete. Du kan ta del av innehållet i din egen takt, med användbara och praktiska resurser att tillämpa i arbetet.&nbsp;</p><p><b>Utbilda dig i din egen takt, med kvalitetsmaterial och stöd från IVI RMA.&nbsp;</b></p><p class="last-p">Om du är intresserad kan du starta kursen genom att klicka på knappen<b> "Registrera mig"</b> nedan.</p></div><div class="img"><img src="https://ivirmacampus.com/pluginfile.php/1/local_uploadfiles/additionalimages/0/matriculate-img.svg" alt="" width="400" height="264" role="presentation" class="img-responsive atto_image_button_text-bottom"></div>
</div>`
                };
                
                // Encontrar el elemento donde insertar el contenido
                const infoContentElement = firstDiv.querySelector('.infocontent.esq');
                
                if (!infoContentElement) {
                  console.log("[ENROL PAGE MOD] No se encontró el elemento con clase 'infocontent esq'");
                } else {
                  const h2Element = infoContentElement.querySelector('h2');
                  
                  if (!h2Element) {
                    console.log("[ENROL PAGE MOD] No se encontró el elemento h2 dentro de 'infocontent esq'");
                  } else {
                    console.log("[ENROL PAGE MOD] Se encontró el elemento h2, procediendo a insertar el contenido");
                    
                    // Crear estructura de DIVs y agregar el contenido
                    const summaryDiv = document.createElement('div');
                    summaryDiv.className = 'summary';
                    
                    const noOverflowDiv = document.createElement('div');
                    noOverflowDiv.className = 'no-overflow';
                    
                    // Insertar el contenido HTML según el idioma detectado
                    noOverflowDiv.innerHTML = htmlContent[detectedLanguage];
                    
                    // Construir estructura anidada
                    summaryDiv.appendChild(noOverflowDiv);
                    
                    // Insertar después del h2
                    h2Element.insertAdjacentElement('afterend', summaryDiv);


                    console.log("[ENROL PAGE MOD] Contenido insertado correctamente para el idioma:", detectedLanguage);
                    
                    // IMPORTANTE: Ahora el contenido está en el DOM, y podemos buscar el elemento last-p
                    if (clonedForm) {
                      // Buscar el párrafo recién insertado con clase "last-p"
                      const lastP = noOverflowDiv.querySelector('p.last-p');
                      
                      if (lastP) {
                        console.log("[ENROL PAGE MOD] Párrafo con clase 'last-p' encontrado, insertando formulario a continuación");
                        lastP.insertAdjacentElement('afterend', clonedForm);
                        console.log("[ENROL PAGE MOD] Formulario completo añadido después del último párrafo");
                      } else {
                        console.log("[ENROL PAGE MOD] Error: No se encontró el párrafo con clase 'last-p' después de insertar el contenido");
                      }
                    }
                    
                    // Establecer el ancho del primer div a 100%
                    firstDiv.style.width = '100%';
                    console.log("[ENROL PAGE MOD] Ancho del primer div establecido a 100%");
                    
                    const submitButton = document.querySelector('#id_submitbutton');
                    submitButton.style.width = 'auto';

                    // Eliminar el segundo div
                    secondDiv.remove();
                    console.log("[ENROL PAGE MOD] Segundo div eliminado");
                  }
                }
              }
            }
          }
        }
      }
    }
  }
} else {
  console.log("[ENROL PAGE MOD] No se cumplen las condiciones para ejecutar este script");
}

/** SCRIPT PARA EVALUACIONES **/
// Script para controlar la visibilidad de elementos en quiz de Moodle
(function() {
    'use strict';
    
    // CONFIGURACIÓN DE STRINGS
    const CONFIG = {
        // Mensajes de "No más intentos" en diferentes idiomas
        NO_MORE_ATTEMPTS_MESSAGES: [
            'No se permiten más intentos',      // Español
            'No more attempts are allowed',     // Inglés
            'Již nemáte další pokusy',         // Checo
            'Non sono permessi altri tentativi', // Italiano
            'Inga fler försök tillåtna',        // Sueco
            'Não são permitidas mais tentativas'        // pt
        ],
        
        // Palabras clave para identificar columnas en diferentes idiomas
        COLUMN_KEYWORDS: {
            POINTS: [
                'puntos', 'points', 'body', 'Punteggio', 'poäng', 'Nota'
            ],
            GRADE: [
                'calificación', 'grade', 'známka', 'Valutazione', 'betyg', 'Avaliação'
            ],
            REVIEW: [
                'revisión', 'review', 'Revize', 'Revisione', 'Granska', 'rever'
            ]
        },
        
        // Selectores CSS
        SELECTORS: {
            QUIZ_TABLE: 'table.quizattemptsummary',
            START_BUTTON: '.quizstartbuttondiv',
            ATTEMPT_BOX: '.box.quizattempt',
            NOTE_MIN_COMMENT: /<!--\s*<span id="nota_min_aprobado">(\d+(?:\.\d+)?)<\/span>\s*-->/
        },
        
        // Patrón de URL del quiz
        URL_PATTERN: '/mod/quiz/view.php?id='
    };
    
    // Verificar si la URL contiene la ruta del quiz
    function checkURL() {
        return window.location.href.includes(CONFIG.URL_PATTERN);
    }
    
    // Obtener la nota mínima de aprobado del comentario HTML
    function getNotaMinima() {
        const htmlContent = document.documentElement.outerHTML;
        const match = htmlContent.match(CONFIG.SELECTORS.NOTE_MIN_COMMENT);
        return match ? parseFloat(match[1]) : null;
    }
    
    // Identificar índices de columnas por contenido de texto
    function identificarColumnas() {
        const tabla = document.querySelector(CONFIG.SELECTORS.QUIZ_TABLE);
        if (!tabla) return { points: -1, grade: -1, review: -1 };
        
        const headers = tabla.querySelectorAll('thead th');
        const columnas = { points: -1, grade: -1, review: -1 };
        
        headers.forEach((header, index) => {
            const textoHeader = header.textContent.toLowerCase().trim();
            
            // Buscar columna de puntos
            if (CONFIG.COLUMN_KEYWORDS.POINTS.some(keyword => 
                textoHeader.includes(keyword.toLowerCase()))) {
                columnas.points = index;
            }
            // Buscar columna de calificación (solo si no contiene palabras de puntos)
            else if (CONFIG.COLUMN_KEYWORDS.GRADE.some(keyword => 
                textoHeader.includes(keyword.toLowerCase()))) {
                columnas.grade = index;
            }
            // Buscar columna de revisión
            else if (CONFIG.COLUMN_KEYWORDS.REVIEW.some(keyword => 
                textoHeader.includes(keyword.toLowerCase()))) {
                columnas.review = index;
            }
        });
        
        console.log('[EVALUACIÓN] Columnas identificadas:', columnas);
        return columnas;
    }
    
    // Ocultar columna de la tabla
    function ocultarColumna(indiceColumna) {
        if (indiceColumna === -1) return;
        
        const tabla = document.querySelector(CONFIG.SELECTORS.QUIZ_TABLE);
        if (!tabla) return;
        
        // Ocultar header
        const header = tabla.querySelector(`thead th:nth-child(${indiceColumna + 1})`);
        if (header) header.style.display = 'none';
        
        // Ocultar todas las celdas de esa columna
        const celdas = tabla.querySelectorAll(`tbody td:nth-child(${indiceColumna + 1})`);
        celdas.forEach(celda => celda.style.display = 'none');
    }
    
    // Mostrar columna de la tabla
    function mostrarColumna(indiceColumna) {
        if (indiceColumna === -1) return;
        
        const tabla = document.querySelector(CONFIG.SELECTORS.QUIZ_TABLE);
        if (!tabla) return;
        
        // Mostrar header
        const header = tabla.querySelector(`thead th:nth-child(${indiceColumna + 1})`);
        if (header) header.style.display = '';
        
        // Mostrar todas las celdas de esa columna
        const celdas = tabla.querySelectorAll(`tbody td:nth-child(${indiceColumna + 1})`);
        celdas.forEach(celda => celda.style.display = '');
    }
    
    // Ocultar botón de inicio de quiz
    function ocultarBotonInicio() {
        const boton = document.querySelector(CONFIG.SELECTORS.START_BUTTON);
        if (boton) {
            boton.style.display = 'none';
        }
    }
    
    // Mostrar botón de inicio de quiz
    function mostrarBotonInicio() {
        const boton = document.querySelector(CONFIG.SELECTORS.START_BUTTON);
        if (boton) {
            boton.style.display = '';
        }
    }
    
    // Verificar si hay mensaje "No se permiten más intentos"
    function hayMensajeNoIntentos() {
        const contenedorIntentos = document.querySelector(CONFIG.SELECTORS.ATTEMPT_BOX);
        if (!contenedorIntentos) return false;
        
        const textoContenedor = contenedorIntentos.textContent.trim();
        
        // Verificar si alguno de los mensajes configurados está presente
        return CONFIG.NO_MORE_ATTEMPTS_MESSAGES.some(mensaje => 
            textoContenedor.includes(mensaje)
        );
    }
    
    // Obtener todas las calificaciones de la tabla
    function obtenerCalificaciones(indiceColumnaGrade) {
        if (indiceColumnaGrade === -1) return [];
        
        const tabla = document.querySelector(CONFIG.SELECTORS.QUIZ_TABLE);
        if (!tabla) return [];
        
        const filasCalificacion = tabla.querySelectorAll('tbody tr');
        const calificaciones = [];
        
        filasCalificacion.forEach(fila => {
            const celdaCalificacion = fila.querySelector(`td:nth-child(${indiceColumnaGrade + 1})`);
            if (celdaCalificacion) {
                const textoCalificacion = celdaCalificacion.textContent.trim();
                // Extraer el número de la calificación (puede estar en formato "2.50 / 3.00" o solo "2.50")
                const match = textoCalificacion.match(/(\d+(?:\.\d+)?)/);
                if (match) {
                    const calificacion = parseFloat(match[1]);
                    if (!isNaN(calificacion)) {
                        calificaciones.push(calificacion);
                    }
                }
            }
        });
        
        return calificaciones;
    }
    
    // Función principal
    function ejecutarScript() {
        // Verificar condiciones iniciales
        if (!checkURL()) {
            console.log('[EVALUACIÓN] URL no coincide con el patrón requerido');
            return;
        }
        
        const notaMinima = getNotaMinima();
        if (notaMinima === null) {
            console.log('[EVALUACIÓN] No se encontró la nota mínima de aprobado en el HTML');
            return;
        }
        
        console.log(`[EVALUACIÓN] Nota mínima de aprobado encontrada: ${notaMinima}`);
        
        // Identificar columnas dinámicamente
        const columnas = identificarColumnas();
        
        // Solo ocultar columna de puntos si existe
        if (columnas.points !== -1) {
            ocultarColumna(columnas.points);
            console.log('[EVALUACIÓN] Columna de puntos ocultada');
        } else {
            console.log('[EVALUACIÓN] No se encontró columna de puntos para ocultar');
        }
        
        // Inicialmente ocultar columna Revisión si existe
        if (columnas.review !== -1) {
            ocultarColumna(columnas.review);
        }
        
        // Verificar condiciones para mostrar columna Revisión
        const calificaciones = obtenerCalificaciones(columnas.grade);
        const hayNotaAprobada = calificaciones.some(cal => cal >= notaMinima);
        const noMasIntentos = hayMensajeNoIntentos();
        
        console.log(`[EVALUACIÓN] Calificaciones encontradas: ${calificaciones.join(', ')}`);
        console.log(`[EVALUACIÓN] Hay nota aprobada (>= ${notaMinima}): ${hayNotaAprobada}`);
        console.log(`[EVALUACIÓN] Mensaje "No más intentos": ${noMasIntentos}`);
        
        if (hayNotaAprobada || noMasIntentos) {
            // Mostrar columna Revisión
            if (columnas.review !== -1) {
                mostrarColumna(columnas.review);
                console.log('[EVALUACIÓN] Columna de revisión mostrada');
            }
            
            // Si hay nota aprobada, ocultar botón de inicio
            if (hayNotaAprobada) {
                ocultarBotonInicio();
                console.log('[EVALUACIÓN] Botón de inicio ocultado (nota aprobada)');
            }
        } else {
            // Asegurarse de que el botón esté visible si no hay condiciones especiales
            mostrarBotonInicio();
        }
        
        console.log('[EVALUACIÓN] Script ejecutado correctamente');
    }
    
    // Ejecutar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', ejecutarScript);
    } else {
        ejecutarScript();
    }
    
    // También ejecutar en caso de que el contenido se cargue dinámicamente
    setTimeout(ejecutarScript, 1000);
    
})();


// ========== SCRIPT PARA PÁGINAS DE CURSO ==========
// Verificar si estamos en una página de curso
if (window.location.href.indexOf('/course/view.php?id=') !== -1) {
    
    // Función para buscar y reemplazar el enlace por el botón
    function reportTutorReplaceCompletionLink() {
        console.log('[Report Tutor] Iniciando verificaciones...');
        
        // PRIMERA VERIFICACIÓN: Buscar el bloque con las clases específicas
        const completionBlock = document.querySelector('.block_completionstatus.block');
        
        if (!completionBlock) {
            console.log('[Report Tutor] No se encontró el bloque de completion status');
            return false;
        }
        
        console.log('[Report Tutor] Bloque de completion status encontrado');
        
        // SEGUNDA VERIFICACIÓN: Buscar dentro del bloque un enlace que contenga "/report/completion/index.php?course="
        const completionLink = completionBlock.querySelector('a[href*="/report/completion/index.php?course="]');
        
        if (!completionLink) {
            console.log('[Report Tutor] No se encontró el enlace de completion dentro del bloque');
            return false;
        }
        
        console.log('[Report Tutor] Enlace de completion encontrado:', completionLink.href);
        
        // SOLO SI AMBAS VERIFICACIONES PASAN, PROCEDER CON EL RESTO
        
        // Traducciones para el botón "Informe de Progreso"
        const buttonTranslations = {
            'es': 'Informe de Progreso',
            'en': 'Progress Report',
            'pt': 'Relatório de Progresso',
            'it': 'Rapporto di Progresso',
            'sv': 'Framstegsrapport',
            'cz': 'Zpráva o pokroku'
        };
        
        // Función para detectar el idioma desde las clases del body
        function detectLanguage() {
            const bodyClasses = document.body.className;
            const langMatch = bodyClasses.match(/lang-([a-z]{2})/);
            return langMatch ? langMatch[1] : 'es'; // Por defecto español
        }
        
        // Detectar idioma y obtener traducción
        const lang = detectLanguage();
        const buttonText = buttonTranslations[lang] || buttonTranslations['es'];
        
        console.log('[Report Tutor] Idioma detectado:', lang);
        console.log('[Report Tutor] Texto del botón:', buttonText);
        
        // Crear el nuevo botón
        const newButton = document.createElement('button');
        newButton.className = 'informe-tutor btn btn-primary w-100';
        newButton.textContent = buttonText;
        
        // Reemplazar el enlace por el botón
        completionLink.parentNode.replaceChild(newButton, completionLink);
        
        console.log('[Report Tutor] Enlace reemplazado por botón');
        
        // Añadir la funcionalidad al botón
        reportTutorAddButtonFunctionality();
        
        return true;
    }
    
    // Función para añadir la funcionalidad al botón
    function reportTutorAddButtonFunctionality() {
        // Función para extraer la ID del curso de la URL actual
        function reportTutorGetCourseIdFromUrl() {
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get('id');
        }
        
        // Función para construir la URL de destino
        function reportTutorBuildReportUrl(courseId) {
            return `https://ivirmacampus.com/report/asreports/index.php?send=1&course=${courseId}&url=1`;
        }
        
        // Función para manejar el click del botón
        function reportTutorRedirectToReport() {
            const courseId = reportTutorGetCourseIdFromUrl();
            
            if (courseId) {
                const reportUrl = reportTutorBuildReportUrl(courseId);
                console.log('[Report Tutor] Redirigiendo a:', reportUrl);
                window.location.href = reportUrl;
            } else {
                console.log('[Report Tutor] Error: No se pudo encontrar la ID del curso');
                alert('No se pudo encontrar la ID del curso en la URL actual.');
            }
        }
        
        // Asignar el evento click al botón
        const button = document.querySelector('.informe-tutor');
        if (button) {
            button.addEventListener('click', reportTutorRedirectToReport);
            console.log('[Report Tutor] Funcionalidad añadida al botón');
        } else {
            console.log('[Report Tutor] Error: No se encontró el botón con clase informe-tutor');
        }
    }
    
    // Función principal que ejecuta todas las acciones
    function reportTutorExecuteReplacement() {
        console.log('[Report Tutor] Iniciando proceso de reemplazo');
        
        if (!reportTutorReplaceCompletionLink()) {
            console.log('[Report Tutor] Primer intento fallido, reintentando en 500ms');
            // Si no se encuentra inmediatamente, intentar después de un delay
            setTimeout(() => {
                if (!reportTutorReplaceCompletionLink()) {
                    console.log('[Report Tutor] Segundo intento fallido, último intento en 2000ms');
                    // Un último intento después de más tiempo por si se carga dinámicamente
                    setTimeout(reportTutorReplaceCompletionLink, 2000);
                }
            }, 500);
        }
    }
    
    // Ejecutar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        console.log('[Report Tutor] DOM cargando, esperando DOMContentLoaded');
        document.addEventListener('DOMContentLoaded', reportTutorExecuteReplacement);
    } else {
        console.log('[Report Tutor] DOM ya cargado, ejecutando inmediatamente');
        reportTutorExecuteReplacement();
    }
}

// ========== SCRIPT PARA PÁGINAS DE ASREPORTS ==========
// Verificar si la URL contiene la ruta específica y el parámetro url=1
if (window.location.href.indexOf('/asreports/index.php') !== -1) {
    // Verificar si existe el parámetro url=1
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('url') === '1') {
        
        // Traducciones para "Informe del curso" en diferentes idiomas
        const translations = {
            'es': 'Informe del curso',
            'en': 'Course Report',
            'pt': 'Relatório do curso',
            'it': 'Rapporto del corso',
            'sv': 'Kursrapport',
            'cz': 'Zpráva o kurzu'
        };
        
        // Función para detectar el idioma desde las clases del body
        function asreportsDetectLanguage() {
            const bodyClasses = document.body.className;
            const langMatch = bodyClasses.match(/lang-([a-z]{2})/);
            return langMatch ? langMatch[1] : 'es'; // Por defecto español
        }
        
        // Función para traducir el h2 con múltiples intentos
        function asreportsTranslateH2() {
            const lang = asreportsDetectLanguage();
            
            // Buscar el h2 con diferentes selectores
            let h2Element = document.querySelector('#region-main h2') || 
                           document.querySelector('h2') ||
                           document.querySelector('.page-header-headings h1');
            
            // Buscar el título del curso con diferentes selectores
            let courseSpan = document.querySelector('.select2-selection__rendered') ||
                           document.querySelector('.select2-selection__rendered[title]') ||
                           document.querySelector('select option:checked') ||
                           document.querySelector('[name="course"] option:checked');
            
            console.log('[ASReports] H2 element found:', h2Element);
            console.log('[ASReports] Course span found:', courseSpan);
            
            if (h2Element && courseSpan) {
                const courseTitle = courseSpan.title || courseSpan.textContent || courseSpan.innerText;
                const translatedText = translations[lang] || translations['es'];
                console.log('[ASReports] Course title:', courseTitle);
                console.log('[ASReports] Translated text:', translatedText);
                h2Element.textContent = `${translatedText} ${courseTitle}`;
                return true;
            }
            return false;
        }
        
        // Función para ocultar elementos
        function asreportsHideElements() {
            // Ocultar elementos con clase "dreta"
            const dretaElements = document.querySelectorAll('.dreta');
            dretaElements.forEach(element => {
                element.style.display = 'none';
            });
            
            // Ocultar elementos con clase "esquerra"
            const esquerraElements = document.querySelectorAll('.esquerra');
            esquerraElements.forEach(element => {
                element.style.display = 'none';
            });
            
            // Ocultar el primer botón de divbotons
            const divbotons = document.querySelector('.divbotons');
            if (divbotons) {
                const firstButton = divbotons.querySelector('input[type="submit"]');
                if (firstButton) {
                    firstButton.style.display = 'none';
                }
            }
            
            console.log('[ASReports] Elementos ocultos correctamente');
        }
        
        // Función principal que ejecuta todas las acciones
        function asreportsExecuteActions() {
            console.log('[ASReports] Iniciando acciones en página de ASReports');
            asreportsHideElements();
            
            // Intentar traducir el h2 inmediatamente
            if (!asreportsTranslateH2()) {
                console.log('[ASReports] Primer intento de traducción fallido, reintentando en 500ms');
                // Si no funciona, intentar después de un pequeño delay
                setTimeout(() => {
                    if (!asreportsTranslateH2()) {
                        console.log('[ASReports] Segundo intento fallido, último intento en 2000ms');
                        // Un último intento después de más tiempo
                        setTimeout(asreportsTranslateH2, 2000);
                    }
                }, 500);
            }
        }
        
        // Ejecutar cuando el DOM esté listo
        if (document.readyState === 'loading') {
            console.log('[ASReports] DOM cargando, esperando DOMContentLoaded');
            document.addEventListener('DOMContentLoaded', asreportsExecuteActions);
        } else {
            console.log('[ASReports] DOM ya cargado, ejecutando inmediatamente');
            asreportsExecuteActions();
        }
    }
}
