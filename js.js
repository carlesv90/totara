document.addEventListener('DOMContentLoaded', function() {
    // Configuración visible y fácil de modificar
    const config = {
        // Rutas base donde se aplicarán las funciones
        pathPatterns: [
            '/dashboard/', // Ruta dashboard sin parámetros adicionales
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

    // Utilidades comunes
    const Utils = {
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
         * Función debounce para optimizar eventos frecuentes
         */
        debounce: function(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func.apply(this, args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },

        /**
         * Espera a que aparezca un elemento en el DOM con promesa
         */
        waitForElement: function(selector, timeout = 10000) {
            return new Promise((resolve, reject) => {
                const element = document.querySelector(selector);
                if (element) {
                    resolve(element);
                    return;
                }

                const observer = new MutationObserver((mutations, obs) => {
                    const element = document.querySelector(selector);
                    if (element) {
                        obs.disconnect();
                        resolve(element);
                    }
                });

                observer.observe(document.body, {
                    childList: true,
                    subtree: true
                });

                setTimeout(() => {
                    observer.disconnect();
                    reject(new Error(`Element ${selector} not found within ${timeout}ms`));
                }, timeout);
            });
        },

        /**
         * Versión legacy de waitForElement con callback para compatibilidad
         */
        waitForElementLegacy: function(selector, callback, maxAttempts = 20, interval = 200) {
            let attempts = 0;
            const checkElement = setInterval(() => {
                try {
                    const element = document.querySelector(selector);
                    if (element) {
                        clearInterval(checkElement);
                        callback(element);
                        Utils.log('Optimizado', `Elemento encontrado: ${selector}`);
                    } else if (++attempts >= maxAttempts) {
                        clearInterval(checkElement);
                        Utils.log('Optimizado', `Elemento no encontrado después de ${maxAttempts} intentos: ${selector}`);
                        
                        // Si es una tabla que no se encuentra, llamar a procesarTablaEstados de todas formas
                        if (selector.includes('table') && selector.includes(config.tablaEstadosConfig.instancia)) {
                            Utils.log('Optimizado', `Ejecutando procesarTablaEstados sin tabla encontrada`);
                            DashboardFunctions.procesarTablaEstados();
                        }
                    }
                } catch (error) {
                    clearInterval(checkElement);
                    Utils.log('Optimizado', `Error esperando elemento ${selector}: ${error.message}`, true);
                }
            }, interval);
        }
    };

    const URLMatcher = {
        /**
         * Verifica si la URL actual coincide con los patrones configurados
         * y si el ID (cuando existe) está en la lista de permitidos
         */
        isUrlPatternMatched: function(configSection) {
            const currentPath = window.location.pathname;
            const currentUrl = currentPath + window.location.search;
            const id = Utils.getQueryParam('id');
            
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
        }
    };

    const MandatoryLabelsModule = {
        observers: new Map(),

        /**
         * Inicializa las funciones para las etiquetas obligatorias en múltiples idiomas
         */
        init: function() {
            if (!URLMatcher.isUrlPatternMatched(config.mandatoryLabelConfig)) {
                Utils.log('Etiquetas', `URL o ID no permitido para añadir etiquetas obligatorias`);
                return;
            }
            Utils.log('Etiquetas', `Patrón de URL permitido encontrado, procesando etiquetas obligatorias...`);

            // Procesar cada instancia
            config.mandatoryLabelConfig.instancias.forEach(containerId => {
                Utils.waitForElementLegacy(`#${containerId}`, () => {
                    this.processContainer(containerId);
                    this.observeContainer(containerId);
                });
            });
        },

        /**
         * Procesa un contenedor específico
         */
        processContainer: function(containerId) {
            const container = document.getElementById(containerId);
            if (!container) {
                Utils.log('Etiquetas', `No se encontró el contenedor ${containerId}.`, true);
                return;
            }

            const listItems = container.querySelectorAll("li.block_current_learningas-tile");
            Utils.log('Etiquetas', `Se encontraron ${listItems.length} elementos li en ${containerId}.`);

            listItems.forEach(li => this.processListItem(li));
        },

        /**
         * Procesa un elemento de lista individual
         */
        processListItem: function(li) {
            const mandatoryDiv = li.querySelector("div.block_current_learningas-customfield");
            if (!mandatoryDiv) return;

            // Lista de términos obligatorios en diferentes idiomas
            const mandatoryTerms = {
                'es': 'Obligatorio',
                'en': 'Mandatory',
                'pt': 'Obrigatório',
                'cs': 'Povinné',
                'it': 'Obbligatorio',
                'sv': 'Kursk'
            };

            // Buscar coincidencia con cualquiera de los términos obligatorios
            const matchedTerm = Object.entries(mandatoryTerms).find(([lang, term]) => 
                mandatoryDiv.textContent.includes(term));

            if (matchedTerm && !li.querySelector(".etiqueta-obligatorio")) {
                const [lang, term] = matchedTerm;
                const span = document.createElement("span");
                span.classList.add("etiqueta-obligatorio");
                span.textContent = term;
                li.appendChild(span);
                Utils.log('Etiquetas', `Etiqueta añadida (${lang}: ${term}) en ${li.closest('[id]')?.id || 'contenedor'}.`);
            }

            const customFieldsDiv = li.querySelector("div.block_current_learningas-customfields");
            if (customFieldsDiv) {
                customFieldsDiv.style.display = "none";
            }
        },

        /**
         * Observa los cambios en el contenedor para actualizar las etiquetas obligatorias
         */
        observeContainer: function(containerId) {
            const targetNode = document.getElementById(containerId);
            if (!targetNode) {
                Utils.log('Etiquetas', `No se encontró el contenedor ${containerId}.`, true);
                return;
            }

            // Verificar si ya hay un observador para este contenedor
            if (this.observers.has(containerId)) return;

            Utils.log('Etiquetas', `Observador activado en ${containerId}.`);

            const debouncedProcess = Utils.debounce(() => {
                Utils.log('Etiquetas', `Cambios detectados en ${containerId}, verificando etiquetas...`);
                this.processContainer(containerId);
            }, 300);

            const observer = new MutationObserver(debouncedProcess);
            observer.observe(targetNode, {
                childList: true,
                subtree: true
            });

            this.observers.set(containerId, observer);
        },

        /**
         * Limpia los observadores
         */
        destroy: function() {
            this.observers.forEach((observer, containerId) => {
                observer.disconnect();
                Utils.log('Etiquetas', `Observer desconectado para ${containerId}`);
            });
            this.observers.clear();
        }
    };

    const ScoreManager = {
        puntuacionCalculada: 0,
        contenidoEncontrado: false,

        /**
         * Calcula la puntuación total de las tablas
         */
        calcularPuntuacionTotal: function() {
            let sumaPuntuacionTotal = 0;
            let contenidoEncontrado = false;

            // Procesar cada div configurado
            config.acordeonConfig.instancias.forEach(divId => {
                const div = document.getElementById(divId);
                if (!div) return;

                // Buscar tablas dentro del div
                const tablas = div.querySelectorAll('table');
                if (tablas.length > 0) {
                    contenidoEncontrado = true;
                }

                sumaPuntuacionTotal += this.procesarTablasDiv(div, tablas);
            });

            this.puntuacionCalculada = sumaPuntuacionTotal;
            this.contenidoEncontrado = contenidoEncontrado;

            Utils.log('Puntuación', `Puntuación total calculada: ${sumaPuntuacionTotal}`, true);
            Utils.log('Puntuación', `¿Se encontró contenido? ${contenidoEncontrado ? 'Sí' : 'No'}`, true);

            return sumaPuntuacionTotal;
        },

        /**
         * Procesa las tablas de un div específico
         */
        procesarTablasDiv: function(div, tablas) {
            let sumaPuntuacionDiv = 0;

            tablas.forEach(tabla => {
                // Intentar con las clases específicas conocidas
                let puntosEncontrados = false;

                // 1. Probar con las clases específicas conocidas
                const celdasConocidas = tabla.querySelectorAll('td.evidence_custom_field_13, td.course_custom_field_10');
                celdasConocidas.forEach(celda => {
                    const numero = this.extraerNumero(celda.textContent.trim());
                    if (!isNaN(numero)) {
                        sumaPuntuacionDiv += numero;
                        puntosEncontrados = true;
                        Utils.log('Puntuación', `Valor encontrado (clase conocida): ${numero}`);
                    }
                });

                // 2. Si no se encontraron puntos por clases específicas
                if (!puntosEncontrados) {
                    sumaPuntuacionDiv += this.buscarPuntuacionPorColumnas(tabla);
                }
            });

            return sumaPuntuacionDiv;
        },

        /**
         * Busca puntuaciones por columnas identificadas
         */
        buscarPuntuacionPorColumnas: function(tabla) {
            let sumaPuntuacion = 0;
            const columnasPuntuacion = this.identificarColumnasPuntuacion(tabla);

            if (columnasPuntuacion.length > 0) {
                const filas = tabla.querySelectorAll('tbody tr');
                filas.forEach(fila => {
                    const celdas = fila.querySelectorAll('td');
                    columnasPuntuacion.forEach(indiceColumna => {
                        if (celdas[indiceColumna]) {
                            const numero = this.extraerNumero(celdas[indiceColumna].textContent.trim());
                            if (!isNaN(numero)) {
                                sumaPuntuacion += numero;
                                Utils.log('Puntuación', `Valor encontrado (columna identificada): ${numero}`);
                            }
                        }
                    });
                });
            } else {
                // 3. Búsqueda en última columna numérica
                sumaPuntuacion += this.buscarEnUltimaColumnaNumerica(tabla);
            }

            return sumaPuntuacion;
        },

        /**
         * Identifica columnas de puntuación por encabezados
         */
        identificarColumnasPuntuacion: function(tabla) {
            const encabezados = tabla.querySelectorAll('th');
            const columnasPuntuacion = [];

            encabezados.forEach((encabezado, indice) => {
                const textoEncabezado = encabezado.textContent.trim().toLowerCase();
                if (this.esCabeceraDeCalificacion(textoEncabezado)) {
                    columnasPuntuacion.push(indice);
                    Utils.log('Puntuación', `Columna de puntuación identificada: ${indice} (${encabezado.textContent})`);
                }
            });

            return columnasPuntuacion;
        },

        /**
         * Verifica si un encabezado es de puntuación
         */
        esCabeceraDeCalificacion: function(texto) {
            const palabrasClave = [
                'punto', 'puntos', 'lfe', 'certificación', 'calificación', 'puntuación', 'score', 'points'
            ];
            return palabrasClave.some(palabra => texto.includes(palabra));
        },

        /**
         * Busca en la última columna numérica
         */
        buscarEnUltimaColumnaNumerica: function(tabla) {
            let sumaPuntuacion = 0;
            const filas = tabla.querySelectorAll('tbody tr');

            filas.forEach(fila => {
                const celdas = Array.from(fila.querySelectorAll('td'));
                // Buscar de derecha a izquierda
                for (let i = celdas.length - 1; i >= 0; i--) {
                    const texto = celdas[i].textContent.trim();
                    if (/^\d+(\.\d+)?$/.test(texto)) {
                        const numero = parseFloat(texto);
                        if (!isNaN(numero)) {
                            sumaPuntuacion += numero;
                            Utils.log('Puntuación', `Valor numérico encontrado (última columna): ${numero}`);
                            break;
                        }
                    }
                }
            });

            return sumaPuntuacion;
        },

        /**
         * Extrae número de texto
         */
        extraerNumero: function(texto) {
            const numeroMatch = texto.match(/\d+(\.\d+)?/);
            return numeroMatch ? parseFloat(numeroMatch[0]) : NaN;
        },

        /**
         * Actualiza los spans de puntuación
         */
        actualizarSpansPuntuacion: function() {
            const puntuacionMaxima = this.obtenerPuntuacionMaxima();
            const spans = document.querySelectorAll('.lfe-visor-puntuacion');
            
            Utils.log('Puntuación', `Actualizando ${spans.length} spans con puntuación ${this.puntuacionCalculada}/${puntuacionMaxima}`, true);
            
            spans.forEach((span, index) => {
                span.textContent = `${this.puntuacionCalculada}/${puntuacionMaxima}`;
                span.classList.add('lfe-actualizado');
                Utils.log('Puntuación', `Span ${index} actualizado a: ${span.textContent}`, true);
            });
        },

        /**
         * Obtiene la puntuación máxima del div inst8008
         */
        obtenerPuntuacionMaxima: function() {
            const divContenedor = document.getElementById('inst8008');
            if (!divContenedor) {
                Utils.log('Puntuación', `No se encontró el div con ID inst8008`, true);
                return 'YYYY';
            }

            const divCustomFields = divContenedor.querySelector('.block_current_learningas-customfields');
            if (!divCustomFields) {
                Utils.log('Puntuación', `No se encontró el div con clase block_current_learningas-customfields dentro de inst8008`, true);
                return 'YYYY';
            }

            const texto = divCustomFields.textContent.trim();
            const numeroMatch = texto.match(/\d+/);
            if (numeroMatch) {
                const puntuacionMaxima = numeroMatch[0];
                Utils.log('Puntuación', `Puntuación máxima encontrada: ${puntuacionMaxima}`);
                return puntuacionMaxima;
            } else {
                Utils.log('Puntuación', `No se encontró un número en el texto: "${texto}"`, true);
                return 'YYYY';
            }
        }
    };

    const DashboardFunctions = {
        /**
         * Extrae el título del curso, lo divide por el guión y actualiza los elementos del banner
         * Finalmente oculta el contenedor original
         */
        procesarTituloYActualizarBanner: function() {
            if (!URLMatcher.isUrlPatternMatched(config.titleBannerConfig)) {
                Utils.log('Título', `URL o ID no permitido para procesar título y banner`);
                return;
            }

            Utils.log('Título', `Patrón de URL permitido encontrado, procesando título y banner...`);

            // Obtener el elemento principal por su ID
            const contenedor = document.getElementById(config.titleBannerConfig.instancia);
            if (!contenedor) {
                Utils.log('Título', `No se encontró elemento con ID: ${config.titleBannerConfig.instancia}`, true);
                return;
            }

            try {
                this.procesarTituloDelCurso(contenedor);
                this.configurarEnlaceBanner(contenedor);
                this.ocultarContenedorOriginal(contenedor);
            } catch (error) {
                Utils.log('Título', `Error procesando título y banner: ${error.message}`, true);
            }
        },

        /**
         * Procesa el título del curso y actualiza el banner
         */
        procesarTituloDelCurso: function(contenedor) {
            const elementoTitulo = contenedor.querySelector("h3.block_current_learningas-tile__link_title");
            if (!elementoTitulo) {
                Utils.log('Título', `No se encontró el título con la clase especificada`, true);
                return;
            }

            const textoCompleto = elementoTitulo.textContent.trim();
            const partes = textoCompleto.split("-");
            
            if (partes.length < 2) {
                Utils.log('Título', `El título no contiene un guión: "${textoCompleto}"`, true);
                return;
            }

            const lfe = partes[0].trim();
            const lfe_tipo = partes[1].trim();

            Utils.log('Título', `LFE: ${lfe}, LFE_TIPO: ${lfe_tipo}`);

            this.actualizarElementosBanner(lfe, lfe_tipo);
        },

        /**
         * Actualiza los elementos del banner
         */
        actualizarElementosBanner: function(lfe, lfe_tipo) {
            const bannerTitulo = document.querySelector(".lfe-banner-titulo");
            const bannerTipo = document.querySelector(".lfe-banner-tipo");

            if (bannerTitulo) {
                bannerTitulo.textContent = lfe;
                Utils.log('Título', `Banner título actualizado con: ${lfe}`);
            } else {
                Utils.log('Título', `No se encontró elemento con clase lfe-banner-titulo`, true);
            }

            if (bannerTipo) {
                bannerTipo.textContent = lfe_tipo;
                Utils.log('Título', `Banner tipo actualizado con: ${lfe_tipo}`);
            } else {
                Utils.log('Título', `No se encontró elemento con clase lfe-banner-tipo`, true);
            }
        },

        /**
         * Configura el enlace del banner
         */
        configurarEnlaceBanner: function(contenedor) {
            const enlace = contenedor.querySelector("a.block_current_learningas-tile__link");
            if (!enlace) {
                Utils.log('Título', `No se encontró enlace con la clase block_current_learningas-tile__link`, true);
                return;
            }

            const href = enlace.getAttribute("href");
            const divPreslfeDcha = document.querySelector(".preslfe-dcha");
            
            if (divPreslfeDcha) {
                divPreslfeDcha.style.cursor = "pointer";
                divPreslfeDcha.onclick = function() {
                    window.location.href = href;
                };
                Utils.log('Título', `Enlace añadido al div con clase preslfe-dcha: ${href}`);
            } else {
                Utils.log('Título', `No se encontró elemento con clase preslfe-dcha`, true);
            }
        },

        /**
         * Oculta el contenedor original
         */
        ocultarContenedorOriginal: function(contenedor) {
            contenedor.style.display = "none";
            Utils.log('Título', `Div con ID ${config.titleBannerConfig.instancia} ha sido ocultado`);
        },

        /**
         * Reemplaza números por imágenes de caras en cuestionarios de satisfacción
         */
        replaceFeedbackNumbers: function() {
            const currentPath = window.location.pathname;
            const validPath = config.feedbackFacesConfig.enabledForPaths.some(path => currentPath.includes(path));
            
            if (!validPath) {
                Utils.log('Feedback', `URL no corresponde a ruta de feedback: ${currentPath}`);
                return;
            }

            Utils.log('Feedback', `Ruta de feedback detectada, buscando cuestionarios de satisfacción...`);

            if (!this.validarTituloFeedback()) return;

            this.configurarReemplazoCaras();
            this.configurarObservadorFormulario();
        },

        /**
         * Valida que exista un título de cuestionario válido
         */
        validarTituloFeedback: function() {
            const h2Elements = document.querySelectorAll('h2');
            const validTitles = config.feedbackFacesConfig.titlePatterns;
            
            for (const h2 of h2Elements) {
                const h2TextLower = h2.textContent.toLowerCase().trim();
                if (validTitles.some(title => h2TextLower.includes(title))) {
                    Utils.log('Feedback', `Título válido encontrado: "${h2.textContent}"`);
                    return true;
                }
            }
            
            Utils.log('Feedback', `No se encontró un título de cuestionario válido`);
            return false;
        },

        /**
         * Configura el reemplazo de números por caras
         */
        configurarReemplazoCaras: function() {
            const replaceNumbersWithFaces = () => {
                const weightSpans = document.querySelectorAll('span.weight');
                let replacedCount = 0;

                weightSpans.forEach(span => {
                    const match = span.textContent.match(/\((\d+)\)/);
                    if (match) {
                        const number = parseInt(match[1]);
                        if (config.feedbackFacesConfig.faceImages[number]) {
                            const img = document.createElement('img');
                            img.src = config.feedbackFacesConfig.faceImages[number];
                            img.alt = `Opción ${number}`;
                            img.style.cssText = 'width: 24px; height: 24px; vertical-align: middle; margin-right: 5px;';

                            span.textContent = '';
                            span.appendChild(img);
                            replacedCount++;
                        }
                    }
                });

                Utils.log('Feedback', `Se reemplazaron ${replacedCount} números por imágenes`);
            };

            replaceNumbersWithFaces();
        },

        /**
         * Configura el observador del formulario de feedback
         */
        configurarObservadorFormulario: function() {
            const form = document.getElementById('feedback_complete_form');
            if (!form) {
                Utils.log('Feedback', `No se encontró el formulario de feedback`, true);
                return;
            }

            const debouncedReplace = Utils.debounce(() => {
                Utils.log('Feedback', `Cambios detectados en el formulario, actualizando imágenes...`);
                this.configurarReemplazoCaras();
            }, 300);

            const observer = new MutationObserver(debouncedReplace);
            observer.observe(form, {
                childList: true,
                subtree: true
            });

            Utils.log('Feedback', `Observador configurado en el formulario de feedback`);
        },

        /**
         * Procesa la tabla de estados reemplazando Yes/Si por ✓ y No por –
         * Muestra u oculta divs según el estado de completitud
         */
        procesarTablaEstados: function() {
            try {
                Utils.log('Estados', `Iniciando procesarTablaEstados - v3.1`, true);
                
                if (!URLMatcher.isUrlPatternMatched(config.tablaEstadosConfig)) {
                    Utils.log('Estados', `URL o ID no permitido para procesar tabla de estados`);
                    return;
                }

                const contenedor = this.obtenerContenedorEstados();
                if (!contenedor) return;

                const { noHayDatos, tabla } = this.analizarContenidoTabla(contenedor);
                
                if (noHayDatos) {
                    this.manejarTablaVacia(contenedor);
                } else if (tabla) {
                    this.procesarTablaConDatos(tabla);
                }

                Utils.log('Estados', `Proceso de tabla de estados completado`, true);
            } catch (error) {
                Utils.log('Estados', `ERROR CRÍTICO: ${error.message}`, true);
            }
        },

        /**
         * Obtiene el contenedor de estados
         */
        obtenerContenedorEstados: function() {
            const idBloque = config.tablaEstadosConfig.instancia;
            const contenedor = document.getElementById(idBloque);
            
            if (!contenedor) {
                Utils.log('Estados', `ERROR: No se encontró el contenedor con ID: ${idBloque}`, true);
                return null;
            }
            
            Utils.log('Estados', `Contenedor encontrado: ${contenedor.tagName}#${idBloque}`);
            return contenedor;
        },

        /**
         * Analiza el contenido de la tabla
         */
        analizarContenidoTabla: function(contenedor) {
            const blockContent = contenedor.querySelector('.content.block-content');
            if (!blockContent) {
                Utils.log('Estados', `ERROR: No se encontró el contenido del bloque`, true);
                return { noHayDatos: true, tabla: null };
            }

            // Verificar indicadores de "sin datos"
            const noResultsElement = contenedor.querySelector('.no-results');
            const noDataText = contenedor.textContent.toLowerCase().includes('no hay registros') || 
                              contenedor.textContent.toLowerCase().includes('no data available');

            // Buscar tabla
            let tabla = contenedor.querySelector('.totara-table-container table') || 
                       contenedor.querySelector('table');

            let hayFilas = false;
            if (tabla) {
                const tbody = tabla.querySelector('tbody');
                const filas = tbody ? tbody.querySelectorAll('tr') : [];
                hayFilas = filas.length > 0;
                Utils.log('Estados', `Tabla: ${!!tabla}, Tbody: ${!!tbody}, Filas: ${filas.length}`);
            }

            const noHayDatos = !!noResultsElement || noDataText || !tabla || !hayFilas;
            
            Utils.log('Estados', `ESTADO: No hay datos: ${noHayDatos}`);
            
            return { noHayDatos, tabla };
        },

        /**
         * Maneja el caso de tabla vacía
         */
        manejarTablaVacia: function(contenedor) {
            Utils.log('Estados', `Se detectó que no hay datos, ocultando la instancia`, true);
            contenedor.style.display = 'none';

            try {
                const divCompleta = document.querySelector('.fo-completa');
                const divIncompleta = document.querySelector('.fo-incompleta');
                const divNoTabla = document.querySelector('.sin-obligatorio');

                if (divCompleta) {
                    divCompleta.style.display = 'none';
                    Utils.log('Estados', `Div .fo-completa ocultado`);
                }

                if (divIncompleta) {
                    divIncompleta.style.display = 'none';
                    Utils.log('Estados', `Div .fo-incompleta ocultado`);
                }

                if (divNoTabla) {
                    divNoTabla.setAttribute('style', 'display: block !important');
                    Utils.log('Estados', `Div info no obligatoria mostrado`);
                }
            } catch (error) {
                Utils.log('Estados', `ERROR manipulando divs de estado: ${error.message}`, true);
            }
        },

        /**
         * Procesa tabla con datos
         */
        procesarTablaConDatos: function(tabla) {
            const divNoTabla = document.querySelector('.sin-obligatorio');
            if (divNoTabla) {
                divNoTabla.style.display = 'none';
                Utils.log('Estados', `Div info no obligatoria ocultado`);
            }

            Utils.log('Estados', `Procesando tabla con datos`);

            const filas = Array.from(tabla.querySelectorAll('tbody tr'));
            let todosCompletados = true;

            filas.forEach((fila, index) => {
                const resultado = this.procesarFilaEstado(fila, index);
                if (!resultado) {
                    todosCompletados = false;
                }
            });

            this.actualizarDivsEstado(todosCompletados);
        },

        /**
         * Procesa una fila de estado individual
         */
        procesarFilaEstado: function(fila, index) {
            try {
                const celdas = fila.querySelectorAll('td');
                if (celdas.length === 0) return true;

                const celdaEstado = celdas[celdas.length - 1];
                const textoOriginal = celdaEstado.textContent.trim().toLowerCase();

                // Si ya está transformado, retornar el estado
                if (textoOriginal === '✓' || textoOriginal === '–') {
                    return textoOriginal === '✓';
                }

                // Transformar según el valor
                if (['yes', 'si', 'sí', 'sim'].includes(textoOriginal)) {
                    celdaEstado.textContent = '✓';
                    Utils.log('Estados', `Fila ${index + 1}: "${textoOriginal}" -> "✓"`);
                    return true;
                } else if (['no', 'não'].includes(textoOriginal)) {
                    celdaEstado.textContent = '–';
                    Utils.log('Estados', `Fila ${index + 1}: "${textoOriginal}" -> "–"`);
                    return false;
                }

                return textoOriginal === '✓';
            } catch (error) {
                Utils.log('Estados', `Error procesando fila ${index + 1}: ${error.message}`, true);
                return true;
            }
        },

        /**
         * Actualiza los divs de estado
         */
        actualizarDivsEstado: function(todosCompletados) {
            try {
                const divCompleta = document.querySelector('.fo-completa');
                const divIncompleta = document.querySelector('.fo-incompleta');

                if (divCompleta && divIncompleta) {
                    divCompleta.style.display = todosCompletados ? 'block' : 'none';
                    divIncompleta.style.display = todosCompletados ? 'none' : 'block';
                    
                    const mensaje = todosCompletados ? 
                        'Todos completados, mostrando .fo-completa' : 
                        'Estados incompletos, mostrando .fo-incompleta';
                    Utils.log('Estados', mensaje);
                } else {
                    Utils.log('Estados', `No se encontraron los divs .fo-completa o .fo-incompleta`, true);
                }
            } catch (error) {
                Utils.log('Estados', `ERROR actualizando divs de estado: ${error.message}`, true);
            }
        },

        /**
         * Crea un acordeón a partir de un div específico
         */
        acordeonVisorLFE: function(divId) {
            Utils.log('Acordeón', `Creando acordeón para div: ${divId}`);
            
            const mainDiv = document.getElementById(divId);
            if (!mainDiv) {
                Utils.log('Acordeón', `No se encontró el div con ID: ${divId}`, true);
                return;
            }

            const elementos = this.obtenerElementosAcordeon(mainDiv);
            if (!elementos) return;

            const { header, content, h2 } = elementos;
            let isExpanded = true;

            this.configurarEstilosAcordeon(header, content);
            this.configurarIconoAcordeon(divId, false);
            this.configurarEventoClick(divId, header, content, isExpanded);

            Utils.log('Acordeón', `Acordeón creado exitosamente para div: ${divId}`);
        },

        /**
         * Obtiene los elementos necesarios del acordeón
         */
        obtenerElementosAcordeon: function(mainDiv) {
            const header = mainDiv.querySelector('.header.block-header');
            const content = mainDiv.querySelector('.content.block-content');
            const h2 = header?.querySelector('h2');

            if (!header || !content || !h2) {
                Utils.log('Acordeón', `No se encontraron elementos necesarios`, true);
                return null;
            }

            return { header, content, h2 };
        },

        /**
         * Configura los estilos del acordeón
         */
        configurarEstilosAcordeon: function(header, content) {
            header.style.cursor = 'pointer';
            content.style.cssText = `
                overflow: hidden;
                transition: max-height ${config.stylesConfig.animations.duration} ${config.stylesConfig.animations.timingFunction}, 
                           opacity ${config.stylesConfig.animations.duration} ${config.stylesConfig.animations.timingFunction};
                max-height: ${content.scrollHeight}px;
                opacity: 1;
            `;
        },

        /**
         * Configura el ícono del acordeón
         */
        configurarIconoAcordeon: function(divId, collapsed) {
            const iconUrl = collapsed ? 
                `url('${config.stylesConfig.icons.plusCircleIcon}')` : 
                `url('${config.stylesConfig.icons.minusCircleIcon}')`;

            let styleElement = document.getElementById(`style-${divId}`);
            if (!styleElement) {
                styleElement = document.createElement('style');
                styleElement.id = `style-${divId}`;
                document.head.appendChild(styleElement);
            }

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
        },

        /**
         * Configura el evento click del acordeón
         */
        configurarEventoClick: function(divId, header, content, isExpanded) {
            header.addEventListener('click', () => {
                isExpanded = !isExpanded;
                
                if (!isExpanded) {
                    // Contraer
                    content.style.maxHeight = `${content.scrollHeight}px`;
                    void content.offsetWidth; // Forzar reflow
                    content.style.maxHeight = '0';
                    content.style.opacity = '0';
                    content.style.paddingTop = '0';
                    content.style.paddingBottom = '0';
                    content.style.marginBottom = '0';
                    header.style.borderRadius = 'var(--block-radius)';
                    this.configurarIconoAcordeon(divId, true);
                } else {
                    // Expandir
                    content.style.maxHeight = `${content.scrollHeight}px`;
                    content.style.opacity = '1';
                    content.style.paddingTop = '';
                    content.style.paddingBottom = '';
                    content.style.marginBottom = '';
                    header.style.borderRadius = 'var(--block-radius) var(--block-radius) 0 0';
                    this.configurarIconoAcordeon(divId, false);
                    
                    setTimeout(() => {
                        content.style.maxHeight = `${content.scrollHeight}px`;
                    }, parseFloat(config.stylesConfig.animations.duration) * 1000);
                }
            });
        },

        /**
         * Inicializa los acordeones para los divs especificados en la configuración
         */
        initAcordeones: function() {
            if (!URLMatcher.isUrlPatternMatched(config.acordeonConfig)) {
                Utils.log('Acordeón', `URL o ID no permitido para crear acordeones`);
                return;
            }

            Utils.log('Acordeón', `Patrón de URL permitido encontrado, creando acordeones...`);

            this.ocultarContenedorInst8008();
            this.procesarAcordeones();
            this.gestionarPuntuacion();
        },

        /**
         * Oculta el contenedor inst8008
         */
        ocultarContenedorInst8008: function() {
            const divContenedor = document.getElementById('inst8008');
            if (divContenedor) {
                divContenedor.style.display = "none";
                Utils.log('Acordeón', `Contenedor con ID inst8008 ocultado`);
            } else {
                Utils.log('Acordeón', `No se encontró el div con ID inst8008`, true);
            }
        },

        /**
         * Procesa los acordeones
         */
        procesarAcordeones: function() {
            config.acordeonConfig.instancias.forEach(divId => {
                const div = document.getElementById(divId);
                if (div) {
                    this.acordeonVisorLFE(divId);
                }
            });
        },

        /**
         * Gestiona la puntuación
         */
        gestionarPuntuacion: function() {
            const puntuacionTotal = ScoreManager.calcularPuntuacionTotal();
            
            // Actualizar spans inmediatamente
            ScoreManager.actualizarSpansPuntuacion();
            
            // Si hay contenido, programar actualizaciones adicionales
            if (ScoreManager.contenidoEncontrado) {
                setTimeout(() => ScoreManager.actualizarSpansPuntuacion(), 1000);
                this.configurarObservadorPuntuacion();
            }

            return puntuacionTotal;
        },

        /**
         * Configura el observador de puntuación
         */
        configurarObservadorPuntuacion: function() {
            if (window.MutationObserver && !window.observadorPuntuacionLFE) {
                let contadorCorrecciones = 0;
                const maxCorrecciones = 5;

                const verificarYCorregirSpans = () => {
                    if (contadorCorrecciones >= maxCorrecciones) {
                        window.observadorPuntuacionLFE.disconnect();
                        Utils.log('Acordeón', `Límite de correcciones alcanzado`, true);
                        return;
                    }

                    const spans = document.querySelectorAll('.lfe-visor-puntuacion');
                    spans.forEach(span => {
                        const textoActual = span.textContent;
                        const necesitaCorreccion = !span.classList.contains('lfe-actualizado') || 
                                                 (textoActual.startsWith('0/') && ScoreManager.puntuacionCalculada > 0) || 
                                                 textoActual.includes('XXX');

                        if (necesitaCorreccion) {
                            contadorCorrecciones++;
                            const puntuacionMaxima = ScoreManager.obtenerPuntuacionMaxima();
                            span.textContent = `${ScoreManager.puntuacionCalculada}/${puntuacionMaxima}`;
                            span.classList.add('lfe-actualizado');
                            Utils.log('Acordeón', `Corrección automática #${contadorCorrecciones}: ${span.textContent}`, true);
                        }
                    });
                };

                window.observadorPuntuacionLFE = new MutationObserver(Utils.debounce(verificarYCorregirSpans, 300));
                window.observadorPuntuacionLFE.observe(document.body, {
                    childList: true,
                    subtree: true,
                    characterData: true
                });

                Utils.log('Acordeón', `Observador de mutaciones activado (máximo ${maxCorrecciones} correcciones)`, true);

                // Desconectar después de 5 segundos
                setTimeout(() => {
                    if (window.observadorPuntuacionLFE) {
                        window.observadorPuntuacionLFE.disconnect();
                        Utils.log('Acordeón', `Observador desconectado después de 5 segundos`, true);
                    }
                }, 5000);
            }
        },

        /**
         * Reemplaza los íconos en las tablas según la configuración
         */
        replaceTableIcons: function() {
            if (!URLMatcher.isUrlPatternMatched(config.iconReplacerConfig)) {
                Utils.log('IconReplacer', `URL o ID no permitido para reemplazar íconos`);
                return;
            }

            Utils.log('IconReplacer', `Patrón de URL permitido encontrado, reemplazando íconos...`);

            config.iconReplacerConfig.instancias.forEach(instancia => {
                Utils.waitForElementLegacy(`#${instancia}`, (container) => {
                    this.procesarIconosContainer(container, instancia);
                });
            });
        },

        /**
         * Procesa los íconos de un contenedor
         */
        procesarIconosContainer: function(container, instancia) {
            const filas = container.querySelectorAll('tr');
            
            if (filas && filas.length > 0) {
                Utils.log('IconReplacer', `Se encontraron ${filas.length} filas en #${instancia}`);
                this.procesarFilasConIconos(filas);
            } else {
                // Enfoque simple si no hay filas
                this.procesarImagenesSimples(container, instancia);
            }
        },

        /**
         * Procesa filas con íconos
         */
        procesarFilasConIconos: function(filas) {
            filas.forEach(fila => {
                const customFieldCell = fila.querySelector('td.course_custom_field_1');
                const useLfeIcon = customFieldCell && 
                                 customFieldCell.textContent.toLowerCase().includes('lfe');

                if (customFieldCell) {
                    customFieldCell.style.display = 'none';
                    Utils.log('IconReplacer', `Celda course_custom_field_1 ocultada`);
                }

                const iconUrl = useLfeIcon ? 
                    config.iconReplacerConfig.lfeIconUrl : 
                    config.iconReplacerConfig.newIconUrl;

                const imagenes = fila.querySelectorAll('img');
                imagenes.forEach(img => {
                    const originalSrc = img.src;
                    img.src = iconUrl;
                    Utils.log('IconReplacer', `Imagen reemplazada: ${originalSrc} -> ${iconUrl}`);
                });
            });
        },

        /**
         * Procesa imágenes de forma simple
         */
        procesarImagenesSimples: function(container, instancia) {
            const imagenes = container.querySelectorAll('img');
            Utils.log('IconReplacer', `Se encontraron ${imagenes.length} imágenes en #${instancia}`);

            imagenes.forEach(img => {
                const originalSrc = img.src;
                img.src = config.iconReplacerConfig.newIconUrl;
                Utils.log('IconReplacer', `Imagen reemplazada: ${originalSrc} -> ${config.iconReplacerConfig.newIconUrl}`);
            });
        },

        /**
         * Añade iconos de completado y oculta el estado de completado original
         */
        addCompletionIconAndHideStatus: function() {
            if (!URLMatcher.isUrlPatternMatched(config.completionIconConfig)) {
                Utils.log('Icono', `URL o ID no permitido para añadir el icono de completado`);
                return;
            }

            Utils.log('Icono', `Patrón de URL permitido encontrado, añadiendo iconos de completado...`);

            document.querySelectorAll('td.course_completion_iscomplete').forEach(td => {
                td.style.display = 'none';
                const completionText = td.textContent.trim().toLowerCase();
                const siRegex = /^s[ií]$/;
                const yesRegex = /^yes$/;

                if (siRegex.test(completionText) || yesRegex.test(completionText)) {
                    this.añadirIconoCompletado(td);
                }
            });
        },

        /**
         * Añade ícono de completado a un elemento
         */
        añadirIconoCompletado: function(td) {
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
                Utils.log('Icono', `Icono de completado añadido.`);
            }
        },

        /**
         * Oculta los divs de Current Learning o Programas que no contienen cursos matriculados
         */
        hideCurrentLearningVacios: function(instanceIds) {
            if (!URLMatcher.isUrlPatternMatched(config.currentLearningVaciosConfig)) {
                Utils.log('CurrentLearningVacios', `URL o ID no permitido para ocultar contenedores vacíos`);
                return;
            }

            Utils.log('CurrentLearningVacios', `Verificando ${instanceIds.length} instancias para ocultar si están vacíos`, true);

            instanceIds.forEach(instId => {
                try {
                    this.procesarInstanciaCurrentLearning(instId);
                } catch (error) {
                    Utils.log('CurrentLearningVacios', `Error al procesar ${instId}: ${error.message}`, true);
                }
            });
        },

        /**
         * Procesa una instancia de Current Learning
         */
        procesarInstanciaCurrentLearning: function(instId) {
            const container = document.getElementById(instId);
            if (!container) {
                Utils.log('CurrentLearningVacios', `No se encontró el contenedor con ID: ${instId}`, true);
                return;
            }

            Utils.log('CurrentLearningVacios', `Analizando contenedor ${instId}`);

            const tipoContenedor = this.identificarTipoContenedor(container);
            const hasContent = this.verificarContenidoContainer(container, tipoContenedor);

            if (!hasContent) {
                Utils.log('CurrentLearningVacios', `No se encontró contenido relevante en ${instId}, ocultando contenedor`, true);
                container.style.display = 'none';
            } else {
                Utils.log('CurrentLearningVacios', `Contenedor ${instId} tiene contenido, manteniéndolo visible`);
            }
        },

        /**
         * Identifica el tipo de contenedor
         */
        identificarTipoContenedor: function(container) {
            const isLearning = container.classList.contains('block_current_learningas');
            const isProgramas = container.classList.contains('block_current_programsas');
            
            return {
                isLearning,
                isProgramas,
                tilesClass: isLearning ? '.block_current_learningas-tiles' : '.block_current_programsas-tiles',
                tileItemClass: isLearning ? 'li.block_current_learningas-tile' : 'li.block_current_programsas-tile'
            };
        },

        /**
         * Verifica el contenido del contenedor
         */
        verificarContenidoContainer: function(container, tipo) {
            const tilesContainer = container.querySelector(tipo.tilesClass);
            if (!tilesContainer) {
                Utils.log('CurrentLearningVacios', `No se encontró el contenedor de tiles`, true);
                return false;
            }

            // Buscar ULs que no sean dropdown-menu
            const contentULs = Array.from(tilesContainer.querySelectorAll('ul')).filter(ul => 
                !ul.classList.contains('dropdown-menu'));

            // Verificar si hay ULs con elementos LI
            for (const ul of contentULs) {
                const liItems = ul.querySelectorAll('li');
                if (liItems.length > 0) {
                    Utils.log('CurrentLearningVacios', `Encontrado UL con ${liItems.length} elementos LI, manteniendo visible`, true);
                    return true;
                }
            }

            // Verificar directamente los LI de curso
            const courseElements = container.querySelectorAll(tipo.tileItemClass);
            if (courseElements.length > 0) {
                Utils.log('CurrentLearningVacios', `Encontrados ${courseElements.length} elementos de curso, manteniendo visible`);
                return true;
            }

            return false;
        },

        /**
         * Función principal de inicialización
         */
        init: function() {
            const currentPath = window.location.pathname;
            const currentUrl = currentPath + window.location.search;
            
            const isUrlMatched = config.pathPatterns.some(pattern => {
                if (pattern.endsWith('id=')) {
                    return currentUrl.includes(pattern) && Utils.getQueryParam('id') !== null;
                }
                return currentPath.includes(pattern) || currentUrl.includes(pattern);
            });

            // Verificar si estamos en una ruta de feedback
            if (config.feedbackFacesConfig.enabledForPaths.some(path => currentPath.includes(path))) {
                Utils.log('Dashboard', `URL de feedback detectada: ${currentUrl}`);
                this.replaceFeedbackNumbers();
            } else if (isUrlMatched) {
                Utils.log('Dashboard', `URL coincide con patrones configurados: ${currentUrl}`);
                this.inicializarModulosPrincipales();
            } else {
                Utils.log('Dashboard', `URL no coincide con los patrones configurados: ${currentUrl}`);
            }
        },

        /**
         * Inicializa los módulos principales
         */
        inicializarModulosPrincipales: function() {
            // Inicializar etiquetas obligatorias
            MandatoryLabelsModule.init();

            // Inicializar procesamiento de título y banner
            Utils.waitForElementLegacy(`#${config.titleBannerConfig.instancia}`, () => {
                this.procesarTituloYActualizarBanner();
            });
            
            // Inicializar procesamiento de tabla de estados
            this.inicializarTablaEstados();
            
            // Inicializar acordeones
            this.initAcordeones();
            
            // Inicializar reemplazo de íconos en tablas
            this.replaceTableIcons();
            
            // Inicializar iconos de completado
            Utils.waitForElementLegacy('.course_completion_iscomplete', () => {
                this.addCompletionIconAndHideStatus();
            });
            
            // Inicializar ocultar Current Learning vacíos
            this.inicializarCurrentLearningVacios();
        },

        /**
         * Inicializa la tabla de estados
         */
        inicializarTablaEstados: function() {
            const estadosContainer = document.getElementById(config.tablaEstadosConfig.instancia);
            if (estadosContainer) {
                Utils.log('Dashboard', `Contenedor de tabla de estados encontrado`);
                const tabla = estadosContainer.querySelector('table');
                if (tabla) {
                    Utils.log('Dashboard', `Tabla encontrada, procesando estados...`);
                    this.procesarTablaEstados();
                } else {
                    Utils.log('Dashboard', `No se encontró tabla, procesando como tabla vacía...`);
                    this.procesarTablaEstados();
                }
            } else {
                Utils.log('Dashboard', `Contenedor de tabla de estados no encontrado`);
            }
        },

        /**
         * Inicializa Current Learning vacíos
         */
        inicializarCurrentLearningVacios: function() {
            if (config.currentLearningVaciosConfig && config.currentLearningVaciosConfig.instancias) {
                Utils.log('Dashboard', `Inicializando verificación de Current Learning vacíos...`);
                
                const checkAndHideEmptyContainers = () => {
                    let allContainersFound = true;
                    
                    config.currentLearningVaciosConfig.instancias.forEach(instId => {
                        if (!document.getElementById(instId)) {
                            allContainersFound = false;
                        }
                    });
                    
                    if (allContainersFound) {
                        Utils.log('Dashboard', `Todos los contenedores encontrados, ejecutando hideCurrentLearningVacios`);
                        this.hideCurrentLearningVacios(config.currentLearningVaciosConfig.instancias);
                    } else {
                        Utils.log('Dashboard', `Esperando a que se carguen todos los contenedores...`);
                        setTimeout(checkAndHideEmptyContainers, 300);
                    }
                };
                
                checkAndHideEmptyContainers();
            }
        }
    };

    // Iniciar todas las funcionalidades
    DashboardFunctions.init();

    // Función para limpiar recursos al salir
    window.addEventListener('beforeunload', () => {
        MandatoryLabelsModule.destroy();
        if (window.observadorPuntuacionLFE) {
            window.observadorPuntuacionLFE.disconnect();
        }
    });
});

/**************** SCRIPT QUITAR IDIOMA *******************/
(function() {
    const LanguageSelector = {
        init: function() {
            this.verificarYOcultar();
            this.configurarObservador();
        },

        verificarYOcultar: function() {
            // Verificar si existe un elemento con la clase tenant-user-ext
            const tenantUserExt = document.querySelector('.tenant-user-ext');
            
            if (!tenantUserExt) return false;

            return this.ocultarSelectorIdioma();
        },

        ocultarSelectorIdioma: function() {
            // Método 1: Por data-title
            let selector = document.querySelector('a[data-title="selectedlang"]');
            if (selector && selector.closest('li')) {
                selector.closest('li').style.display = 'none';
                return true;
            }

            // Método 2: Por el ícono característico
            selector = document.querySelector('#action-menu-0-menu li a .tfont-var-chevron-right');
            if (selector && selector.closest('li')) {
                selector.closest('li').style.display = 'none';
                return true;
            }

            // Método 3: Por la estructura
            const menuItems = document.querySelectorAll('#action-menu-0-menu li');
            for (let i = 0; i < menuItems.length; i++) {
                const currentItem = menuItems[i];
                const nextItem = menuItems[i + 1];
                if (nextItem && nextItem.querySelector('a[data-title^="notselected lang_"]')) {
                    currentItem.style.display = 'none';
                    return true;
                }
            }

            return false;
        },

        configurarObservador: function() {
            if (!this.verificarYOcultar()) {
                let intentos = 0;
                const interval = setInterval(() => {
                    if (this.verificarYOcultar() || intentos >= 15) {
                        clearInterval(interval);
                    }
                    intentos++;
                }, 200);
            }

            const observer = new MutationObserver(() => {
                this.verificarYOcultar();
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['class']
            });
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => LanguageSelector.init());
    } else {
        LanguageSelector.init();
    }
})();

// Script para detectar idioma e insertar contenido HTML según el idioma detectado
const EnrollmentPageHandler = {
    init: function() {
        console.log("[ENROL PAGE MOD] Script iniciado");
        
        this.checkConditionsAndExecute();
    },

    checkConditionsAndExecute: function() {
        const hasTenantUserExt = document.querySelector('.tenant-user-ext') === null;
        const isEnrolPage = window.location.href.includes("/enrol/index.php?id=");
        const hasInfoContentEsq = document.querySelector('.infocontent.esq') !== null;

        console.log("[ENROL PAGE MOD] Condiciones iniciales:", {
            hasTenantUserExt,
            isEnrolPage,
            hasInfoContentEsq
        });

        if (isEnrolPage) {
            this.updatePageTitle();
        }

        if (hasTenantUserExt && isEnrolPage && hasInfoContentEsq) {
            this.handleEnrollmentContent();
        } else {
            console.log("[ENROL PAGE MOD] No se cumplen las condiciones para ejecutar este script");
        }
    },

    updatePageTitle: function() {
        console.log("[ENROL PAGE MOD] Actualizando título de la pestaña");
        
        const infoContentDiv = document.querySelector('.infocontent.esq');
        if (!infoContentDiv) {
            console.log("[ENROL PAGE MOD] No se encontró el div con clase 'infocontent esq'");
            return;
        }

        const h2Element = infoContentDiv.querySelector('h2');
        if (!h2Element) {
            console.log("[ENROL PAGE MOD] No se encontró el elemento h2");
            return;
        }

        const aElement = h2Element.querySelector('a');
        if (!aElement) {
            console.log("[ENROL PAGE MOD] No se encontró el enlace dentro del h2");
            return;
        }

        const courseTitle = aElement.textContent.trim();
        if (courseTitle) {
            document.title = courseTitle;
            console.log("[ENROL PAGE MOD] Título actualizado a:", courseTitle);
        }
    },

    handleEnrollmentContent: function() {
        console.log("[ENROL PAGE MOD] Condiciones cumplidas, verificando enrolinstances");
        
        const enrolInstancesDiv = document.querySelector('.enrolinstances');
        const hasContent = enrolInstancesDiv && 
                          (enrolInstancesDiv.children.length > 0 || 
                           enrolInstancesDiv.textContent.trim() !== '');

        console.log("[ENROL PAGE MOD] enrolinstances tiene contenido:", hasContent);

        if (hasContent) {
            this.hideAsCoursecustomfields();
        } else {
            this.executeFullScript();
        }
    },

    hideAsCoursecustomfields: function() {
        console.log("[ENROL PAGE MOD] Solo ocultando ascoursecustomfields");
        
        const ascoursecustomfieldsDiv = document.querySelector('.ascoursecustomfields');
        if (ascoursecustomfieldsDiv) {
            ascoursecustomfieldsDiv.style.display = 'none';
            console.log("[ENROL PAGE MOD] Div ascoursecustomfields ocultado");
        }
    },

    executeFullScript: function() {
        console.log("[ENROL PAGE MOD] Ejecutando script completo");
        
        const detectedLanguage = this.detectLanguage();
        if (!detectedLanguage) return;

        const structure = this.getPageStructure();
        if (!structure) return;

        this.insertContentAndModifyStructure(structure, detectedLanguage);
    },

    detectLanguage: function() {
        const menuElement = document.getElementById('totaramenuitem37');
        if (!menuElement) {
            console.log("[ENROL PAGE MOD] No se encontró el elemento totaramenuitem37");
            return null;
        }

        const languageLabel = menuElement.querySelector('.totaraNav_prim--list_item_label');
        if (!languageLabel) {
            console.log("[ENROL PAGE MOD] No se encontró el label del idioma");
            return null;
        }

        const menuText = languageLabel.textContent.trim();
        console.log("[ENROL PAGE MOD] Texto del menú:", menuText);

        const languageMap = {
            'Minha Formação': 'PT',
            'Moje školení': 'CS',
            'My Training': 'EN',
            'La mia formazione': 'IT',
            'Mi Formación': 'ES',
            'Min utbildning': 'SV'
        };

        for (const [text, lang] of Object.entries(languageMap)) {
            if (menuText.includes(text)) {
                console.log("[ENROL PAGE MOD] Idioma detectado:", lang);
                return lang;
            }
        }

        console.log("[ENROL PAGE MOD] Usando idioma por defecto: EN");
        return 'EN';
    },

    getPageStructure: function() {
        const mainDiv = document.querySelector('div[role="main"]');
        if (!mainDiv) {
            console.log("[ENROL PAGE MOD] No se encontró div[role='main']");
            return null;
        }

        const rowDiv = mainDiv.querySelector('.row');
        if (!rowDiv) {
            console.log("[ENROL PAGE MOD] No se encontró div.row");
            return null;
        }

        const childDivs = Array.from(rowDiv.children).filter(child => child.tagName === 'DIV');
        if (childDivs.length < 2) {
            console.log("[ENROL PAGE MOD] No se encontraron suficientes divs");
            return null;
        }

        let firstDiv, secondDiv;
        if (childDivs[0].querySelector('.infocontent.esq')) {
            firstDiv = childDivs[0];
            secondDiv = childDivs[1];
        } else if (childDivs[1].querySelector('.infocontent.esq')) {
            firstDiv = childDivs[1];
            secondDiv = childDivs[0];
        } else {
            console.log("[ENROL PAGE MOD] No se pudieron identificar los divs");
            return null;
        }

        return {
            firstDiv,
            secondDiv,
            enrollForm: secondDiv.querySelector('#mform2')
        };
    },

    insertContentAndModifyStructure: function(structure, language) {
        const { firstDiv, secondDiv, enrollForm } = structure;

        const htmlContent = this.getLanguageContent();
        const infoContentElement = firstDiv.querySelector('.infocontent.esq');
        if (!infoContentElement) {
            console.log("[ENROL PAGE MOD] No se encontró .infocontent.esq");
            return;
        }

        const h2Element = infoContentElement.querySelector('h2');
        if (!h2Element) {
            console.log("[ENROL PAGE MOD] No se encontró h2");
            return;
        }

        // Crear y insertar estructura
        const summaryDiv = document.createElement('div');
        summaryDiv.className = 'summary';
        
        const noOverflowDiv = document.createElement('div');
        noOverflowDiv.className = 'no-overflow';
        noOverflowDiv.innerHTML = htmlContent[language];
        
        summaryDiv.appendChild(noOverflowDiv);
        h2Element.insertAdjacentElement('afterend', summaryDiv);

        console.log("[ENROL PAGE MOD] Contenido insertado para idioma:", language);

        // Insertar formulario clonado
        if (enrollForm) {
            const clonedForm = enrollForm.cloneNode(true);
            const lastP = noOverflowDiv.querySelector('p.last-p');
            
            if (lastP) {
                lastP.insertAdjacentElement('afterend', clonedForm);
                console.log("[ENROL PAGE MOD] Formulario insertado");
            }
        }

        // Modificar estructura
        firstDiv.style.width = '100%';
        const submitButton = document.querySelector('#id_submitbutton');
        if (submitButton) {
            submitButton.style.width = 'auto';
        }
        secondDiv.remove();

        console.log("[ENROL PAGE MOD] Estructura modificada");
    },

    getLanguageContent: function() {
        return {
            'ES': `<div class="info-catalogo"><div class="info-izq">Este curso está diseñado para facilitar tu formación en aspectos clave de tu actividad diaria. Podrás acceder a los contenidos a tu ritmo, con recursos útiles y prácticos para aplicar en tu trabajo.&nbsp;<p><b>Fórmate a tu ritmo, con materiales de calidad y el respaldo de IVI RMA.&nbsp;</b></p><p class="last-p">Si te interesa, puedes iniciar el curso haciendo clic en el botón inferior <b>"Matricularme"</b>.</p></div><div class="img"><img src="https://ivirmacampus.com/pluginfile.php/1/local_uploadfiles/additionalimages/0/matriculate-img.svg" alt="" width="400" height="264" role="presentation" class="img-responsive atto_image_button_text-bottom"></div></div>`,
            
            'EN': `<div class="info-catalogo"><div class="info-izq">This course is designed to support your training in key aspects of your daily work. You can access the content at your own pace, with useful and practical resources to apply in your job.&nbsp;</p><p><b>Learn at your own pace, with quality materials and the support of IVI RMA.&nbsp;</b></p><p class="last-p">If you're interested, you can start the course by clicking the <b>"Enroll"</b> button below.</p></div><div class="img"><img src="https://ivirmacampus.com/pluginfile.php/1/local_uploadfiles/additionalimages/0/matriculate-img.svg" alt="" width="400" height="264" role="presentation" class="img-responsive atto_image_button_text-bottom"></div></div>`,
            
            'PT': `<div class="info-catalogo"><div class="info-izq">Este curso foi desenvolvido para apoiar a sua formação em aspectos-chave da sua atividade diária. Você poderá acessar os conteúdos no seu próprio ritmo, com recursos úteis e práticos para aplicar no seu trabalho.&nbsp;</p><p><b>Forme-se no seu ritmo, com materiais de qualidade e o respaldo da IVI RMA.&nbsp;</b></p><p class="last-p">Se tiver interesse, pode iniciar o curso clicando no botão abaixo<b> "Matricular-me"</b>.</p></div><div class="img"><img src="https://ivirmacampus.com/pluginfile.php/1/local_uploadfiles/additionalimages/0/matriculate-img.svg" alt="" width="400" height="264" role="presentation" class="img-responsive atto_image_button_text-bottom"></div></div>`,
            
            'IT': `<div class="info-catalogo"><div class="info-izq">Questo corso è stato progettato per supportare la tua formazione sugli aspetti chiave della tua attività quotidiana. Potrai accedere ai contenuti al tuo ritmo, con risorse utili e pratiche da applicare al lavoro.&nbsp;</p><p><b>Formati al tuo ritmo, con materiali di qualità e il supporto di IVI RMA.</b>&nbsp;</p><p class="last-p">Se sei interessato, puoi iniziare il corso cliccando sul pulsante in basso <b>"Iscrivimi"</b>.</p></div><div class="img"><img src="https://ivirmacampus.com/pluginfile.php/1/local_uploadfiles/additionalimages/0/matriculate-img.svg" alt="" width="400" height="264" role="presentation" class="img-responsive atto_image_button_text-bottom"></div></div>`,
            
            'CS': `<div class="info-catalogo"><div class="info-izq">Tento kurz je navržen tak, aby podpořil vaše vzdělávání v klíčových oblastech vaší každodenní práce. K obsahu můžete přistupovat vlastním tempem, s užitečnými a praktickými materiály pro vaši práci.&nbsp;</p><p><b>Vzdělávejte se vlastním tempem, s kvalitními materiály a podporou IVI RMA.</b>&nbsp;</p><p class="last-p">Máte-li zájem, můžete kurz zahájit kliknutím na tlačítko dole "<b>Zapsat se"</b>.</p></div><div class="img"><img src="https://ivirmacampus.com/pluginfile.php/1/local_uploadfiles/additionalimages/0/matriculate-img.svg" alt="" width="400" height="264" role="presentation" class="img-responsive atto_image_button_text-bottom"></div></div>`,
            
            'SV': `<div class="info-catalogo"><div class="info-izq">Den här kursen är utformad för att stödja din utbildning inom viktiga delar av ditt dagliga arbete. Du kan ta del av innehållet i din egen takt, med användbara och praktiska resurser att tillämpa i arbetet.&nbsp;</p><p><b>Utbilda dig i din egen takt, med kvalitetsmaterial och stöd från IVI RMA.&nbsp;</b></p><p class="last-p">Om du är intresserad kan du starta kursen genom att klicka på knappen<b> "Registrera mig"</b> nedan.</p></div><div class="img"><img src="https://ivirmacampus.com/pluginfile.php/1/local_uploadfiles/additionalimages/0/matriculate-img.svg" alt="" width="400" height="264" role="presentation" class="img-responsive atto_image_button_text-bottom"></div></div>`
        };
    }
};

// Inicializar si estamos en página de matrícula
if (window.location.href.includes("/enrol/index.php?id=")) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => EnrollmentPageHandler.init());
    } else {
        EnrollmentPageHandler.init();
    }
}

/** SCRIPT PARA EVALUACIONES **/
const EvaluationHandler = (function() {
    'use strict';
    
    const CONFIG = {
        NO_MORE_ATTEMPTS_MESSAGES: [
            'No se permiten más intentos',
            'No more attempts are allowed',
            'Již nemáte další pokusy',
            'Non sono permessi altri tentativi',
            'Inga fler försök tillåtna',
            'Não são permitidas mais tentativas'
        ],
        
        COLUMN_KEYWORDS: {
            POINTS: ['puntos', 'points', 'body', 'Punteggio', 'poäng', 'Nota'],
            GRADE: ['calificación', 'grade', 'známka', 'Valutazione', 'betyg', 'Avaliação'],
            REVIEW: ['revisión', 'review', 'Revize', 'Revisione', 'Granska', 'rever']
        },
        
        SELECTORS: {
            QUIZ_TABLE: 'table.quizattemptsummary',
            START_BUTTON: '.quizstartbuttondiv',
            ATTEMPT_BOX: '.box.quizattempt',
            NOTE_MIN_COMMENT: /<!--\s*<span id="nota_min_aprobado">(\d+(?:\.\d+)?)<\/span>\s*-->/
        },
        
        URL_PATTERN: '/mod/quiz/view.php?id='
    };

    function checkURL() {
        return window.location.href.includes(CONFIG.URL_PATTERN);
    }

    function getNotaMinima() {
        const htmlContent = document.documentElement.outerHTML;
        const match = htmlContent.match(CONFIG.SELECTORS.NOTE_MIN_COMMENT);
        return match ? parseFloat(match[1]) : null;
    }

    function identificarColumnas() {
        const tabla = document.querySelector(CONFIG.SELECTORS.QUIZ_TABLE);
        if (!tabla) return { points: -1, grade: -1, review: -1 };

        const headers = tabla.querySelectorAll('thead th');
        const columnas = { points: -1, grade: -1, review: -1 };

        headers.forEach((header, index) => {
            const textoHeader = header.textContent.toLowerCase().trim();

            if (CONFIG.COLUMN_KEYWORDS.POINTS.some(keyword => 
                textoHeader.includes(keyword.toLowerCase()))) {
                columnas.points = index;
            } else if (CONFIG.COLUMN_KEYWORDS.GRADE.some(keyword => 
                textoHeader.includes(keyword.toLowerCase()))) {
                columnas.grade = index;
            } else if (CONFIG.COLUMN_KEYWORDS.REVIEW.some(keyword => 
                textoHeader.includes(keyword.toLowerCase()))) {
                columnas.review = index;
            }
        });

        console.log('[EVALUACIÓN] Columnas identificadas:', columnas);
        return columnas;
    }

    function toggleColumna(indiceColumna, show = true) {
        if (indiceColumna === -1) return;

        const tabla = document.querySelector(CONFIG.SELECTORS.QUIZ_TABLE);
        if (!tabla) return;

        const displayValue = show ? '' : 'none';

        const header = tabla.querySelector(`thead th:nth-child(${indiceColumna + 1})`);
        if (header) header.style.display = displayValue;

        const celdas = tabla.querySelectorAll(`tbody td:nth-child(${indiceColumna + 1})`);
        celdas.forEach(celda => celda.style.display = displayValue);
    }

    function toggleBotonInicio(show = true) {
        const boton = document.querySelector(CONFIG.SELECTORS.START_BUTTON);
        if (boton) {
            boton.style.display = show ? '' : 'none';
        }
    }

    function hayMensajeNoIntentos() {
        const contenedorIntentos = document.querySelector(CONFIG.SELECTORS.ATTEMPT_BOX);
        if (!contenedorIntentos) return false;

        const textoContenedor = contenedorIntentos.textContent.trim();
        return CONFIG.NO_MORE_ATTEMPTS_MESSAGES.some(mensaje => 
            textoContenedor.includes(mensaje));
    }

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

    function ejecutarScript() {
        if (!checkURL()) {
            console.log('[EVALUACIÓN] URL no coincide con el patrón requerido');
            return;
        }

        const notaMinima = getNotaMinima();
        if (notaMinima === null) {
            console.log('[EVALUACIÓN] No se encontró la nota mínima de aprobado');
            return;
        }

        console.log(`[EVALUACIÓN] Nota mínima de aprobado: ${notaMinima}`);

        const columnas = identificarColumnas();

        // Ocultar columna de puntos si existe
        if (columnas.points !== -1) {
            toggleColumna(columnas.points, false);
            console.log('[EVALUACIÓN] Columna de puntos ocultada');
        }

        // Inicialmente ocultar columna Revisión
        if (columnas.review !== -1) {
            toggleColumna(columnas.review, false);
        }

        // Verificar condiciones para mostrar columna Revisión
        const calificaciones = obtenerCalificaciones(columnas.grade);
        const hayNotaAprobada = calificaciones.some(cal => cal >= notaMinima);
        const noMasIntentos = hayMensajeNoIntentos();

        console.log(`[EVALUACIÓN] Calificaciones: ${calificaciones.join(', ')}`);
        console.log(`[EVALUACIÓN] Hay nota aprobada: ${hayNotaAprobada}`);
        console.log(`[EVALUACIÓN] No más intentos: ${noMasIntentos}`);

        if (hayNotaAprobada || noMasIntentos) {
            if (columnas.review !== -1) {
                toggleColumna(columnas.review, true);
                console.log('[EVALUACIÓN] Columna de revisión mostrada');
            }

            if (hayNotaAprobada) {
                toggleBotonInicio(false);
                console.log('[EVALUACIÓN] Botón de inicio ocultado');
            }
        } else {
            toggleBotonInicio(true);
        }

        console.log('[EVALUACIÓN] Script ejecutado correctamente');
    }

    return {
        init: ejecutarScript
    };
})();

// Ejecutar evaluación si estamos en página de quiz
if (window.location.href.includes('/mod/quiz/view.php?id=')) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', EvaluationHandler.init);
    } else {
        EvaluationHandler.init();
    }
    
    setTimeout(EvaluationHandler.init, 1000);
}

// ========== SCRIPT PARA PÁGINAS DE CURSO ==========
const CourseReportHandler = {
    translations: {
        'es': 'Informe de Progreso',
        'en': 'Progress Report',
        'pt': 'Relatório de Progresso',
        'it': 'Rapporto di Progresso',
        'sv': 'Framstegsrapport',
        'cz': 'Zpráva o pokroku'
    },

    init: function() {
        if (window.location.href.indexOf('/course/view.php?id=') === -1) return;
        
        console.log('[Report Tutor] Iniciando en página de curso');
        this.executeReplacement();
    },

    executeReplacement: function() {
        if (!this.replaceCompletionLink()) {
            console.log('[Report Tutor] Primer intento fallido, reintentando...');
            setTimeout(() => {
                if (!this.replaceCompletionLink()) {
                    console.log('[Report Tutor] Segundo intento fallido, último intento...');
                    setTimeout(() => this.replaceCompletionLink(), 2000);
                }
            }, 500);
        }
    },

    replaceCompletionLink: function() {
        const completionBlock = document.querySelector('.block_completionstatus.block');
        if (!completionBlock) {
            console.log('[Report Tutor] No se encontró bloque de completion status');
            return false;
        }

        const completionLink = completionBlock.querySelector('a[href*="/report/completion/index.php?course="]');
        if (!completionLink) {
            console.log('[Report Tutor] No se encontró enlace de completion');
            return false;
        }

        console.log('[Report Tutor] Enlace encontrado, creando botón');

        const lang = this.detectLanguage();
        const buttonText = this.translations[lang] || this.translations['es'];

        const newButton = document.createElement('button');
        newButton.className = 'informe-tutor btn btn-primary w-100';
        newButton.textContent = buttonText;

        completionLink.parentNode.replaceChild(newButton, completionLink);
        
        this.addButtonFunctionality(newButton);
        
        console.log('[Report Tutor] Botón creado y configurado');
        return true;
    },

    detectLanguage: function() {
        const bodyClasses = document.body.className;
        const langMatch = bodyClasses.match(/lang-([a-z]{2})/);
        return langMatch ? langMatch[1] : 'es';
    },

    addButtonFunctionality: function(button) {
        const getCourseIdFromUrl = () => {
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get('id');
        };

        const buildReportUrl = (courseId) => {
            return `https://ivirmacampus.com/report/asreports/index.php?send=1&course=${courseId}&url=1`;
        };

        const redirectToReport = () => {
            const courseId = getCourseIdFromUrl();
            
            if (courseId) {
                const reportUrl = buildReportUrl(courseId);
                console.log('[Report Tutor] Redirigiendo a:', reportUrl);
                window.location.href = reportUrl;
            } else {
                console.log('[Report Tutor] Error: No se pudo encontrar la ID del curso');
                alert('No se pudo encontrar la ID del curso en la URL actual.');
            }
        };

        button.addEventListener('click', redirectToReport);
        console.log('[Report Tutor] Funcionalidad añadida al botón');
    }
};

// Inicializar CourseReportHandler si estamos en página de curso
if (window.location.href.indexOf('/course/view.php?id=') !== -1) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => CourseReportHandler.init());
    } else {
        CourseReportHandler.init();
    }
}

// ========== SCRIPT PARA PÁGINAS DE ASREPORTS ==========
const ASReportsHandler = {
    translations: {
        'es': 'Informe del curso',
        'en': 'Course Report',
        'pt': 'Relatório do curso',
        'it': 'Rapporto del corso',
        'sv': 'Kursrapport',
        'cz': 'Zpráva o kurzu'
    },

    init: function() {
        if (window.location.href.indexOf('/asreports/index.php') === -1) return;

        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('url') !== '1') return;

        console.log('[ASReports] Iniciando en página de ASReports');
        this.executeActions();
    },

    executeActions: function() {
        this.hideElements();
        
        if (!this.translateH2()) {
            console.log('[ASReports] Primer intento de traducción fallido, reintentando...');
            setTimeout(() => {
                if (!this.translateH2()) {
                    console.log('[ASReports] Segundo intento fallido, último intento...');
                    setTimeout(() => this.translateH2(), 2000);
                }
            }, 500);
        }
    },

    detectLanguage: function() {
        const bodyClasses = document.body.className;
        const langMatch = bodyClasses.match(/lang-([a-z]{2})/);
        return langMatch ? langMatch[1] : 'es';
    },

    translateH2: function() {
        const lang = this.detectLanguage();

        let h2Element = document.querySelector('#region-main h2') || 
                       document.querySelector('h2') ||
                       document.querySelector('.page-header-headings h1');

        let courseSpan = document.querySelector('.select2-selection__rendered') ||
                        document.querySelector('.select2-selection__rendered[title]') ||
                        document.querySelector('select option:checked') ||
                        document.querySelector('[name="course"] option:checked');

        console.log('[ASReports] H2 element found:', !!h2Element);
        console.log('[ASReports] Course span found:', !!courseSpan);

        if (h2Element && courseSpan) {
            const courseTitle = courseSpan.title || courseSpan.textContent || courseSpan.innerText;
            const translatedText = this.translations[lang] || this.translations['es'];
            
            console.log('[ASReports] Course title:', courseTitle);
            console.log('[ASReports] Translated text:', translatedText);
            
            h2Element.textContent = `${translatedText} ${courseTitle}`;
            return true;
        }
        
        return false;
    },

    hideElements: function() {
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
};

// Inicializar ASReportsHandler si estamos en la página correcta
if (window.location.href.indexOf('/asreports/index.php') !== -1) {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('url') === '1') {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => ASReportsHandler.init());
        } else {
            ASReportsHandler.init();
        }
    }
}