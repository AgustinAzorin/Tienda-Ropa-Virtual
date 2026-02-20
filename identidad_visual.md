Identidad visual
Paleta de color:
La base tiene que ser oscura pero no fría. Un negro que tire levemente hacia el marrón cacao (#0D0A08) crea atmósfera sin sentirse corporativo. Sobre eso, un blanco cálido (#F5F0E8) para texto principal, nunca blanco puro que resulta agresivo. El acento diferenciador sería un color que no sea ni el verde tecnológico ni el violeta que usa todo el mundo — propongo un ámbar-dorado (#C9A84C) para CTAs y highlights, que evoca tanto joyería como calle, tanto lujo como accesibilidad. Para el probador 3D y elementos interactivos, un coral terracota (#D4614A) que es cálido, energético y se asocia con piel humana de forma natural.
Tipografía:
Display: Playfair Display en itálica para títulos editoriales — tiene tensión entre lo clásico y lo moderno. Body: DM Sans por su legibilidad en móvil y su personalidad ligeramente humanista sin ser genérica. Para datos numéricos (precios, cuotas, medidas) una monospace como JetBrains Mono que da precisión técnica y contrasta bien con la editorial. Esta combinación crea la sensación de una revista de moda que también es una herramienta de ingeniería.
Textura y profundidad:
Liquid Glass aplicado de forma selectiva, no en toda la interfaz. Específicamente en el panel del probador 3D flotando sobre el maniquí, en los modals de checkout y en el menú de navegación inferior. El resto de la UI usa superficies sólidas con bordes ligeramente redondeados (border-radius: 12px) y sin sombras exageradas — las sombras se reservan para los elementos flotantes con estado activo.

Estructura y layouts
Mobile-first con Bento Grid en discovery:
La pantalla de descubrimiento rompe la grilla monótona con celdas de tamaño variable. Un post de outfit ocupa 2x2, una reseña con foto ocupa 1x2, una card de producto en tendencia ocupa 1x1. Esto genera el escaneo rápido que tu investigación señala como clave, sin la monotonía del feed vertical de Instagram.
Scrollytelling en product detail:
La página de producto no es una foto con botón de compra. Al hacer scroll, la prenda se presenta primero en contexto editorial (fotografía), luego el modelo 3D aparece de fondo mientras el texto de descripción se mueve en primer plano, luego los controles de talle emergen desde abajo cuando el usuario llega a esa sección. El CTA de "Probar en 3D" está fijo en la parte inferior en la zona del pulgar, siempre visible.
Zona del pulgar como principio rector:
El 71% móvil que tu investigación menciona define la arquitectura de navegación entera. Navegación inferior con 5 íconos máximo (Inicio, Explorar, Probador, Guardarropas, Perfil). Los controles de rotación del maniquí 3D en la parte inferior de la pantalla del probador. El botón de agregar al carrito siempre en el borde inferior derecho.

El probador 3D como experiencia, no como feature
El probador no puede sentirse como un iframe pegado. Tiene que ser una transición de pantalla completa con su propio lenguaje visual. Propongo:
Fondo del probador: gradiente negro a gris muy oscuro con partículas flotantes sutiles (puntos de luz muy pequeños, casi ruido). El maniquí centrado con iluminación de tres puntos que lo hace verse tridimensional y cálido, no clínico. La prenda cargada con animación de "caída" suave sobre el maniquí. Los sliders de peso/altura en el lateral izquierdo, verticales, con haptic feedback al cambiar. El heatmap de ajuste activable como toggle, que colorea la prenda del verde al rojo según presión. Abajo: botones de rotación, cambio de variante y agregar al carrito.
La transición de entrada al probador usa un efecto de zoom-in desde la foto del producto, creando continuidad narrativa. La salida es un slide-down que devuelve al usuario exactamente donde estaba.

El lenguaje social de la identidad libre
Aquí es donde la plataforma se diferencia filosóficamente. Algunos principios de diseño que refuerzan el valor de identidad sin prejuicios:
Los avatares no tienen género predefinido. Los sliders del body profile no dicen "masculino/femenino" sino que controlan proporciones directamente. Las sugerencias de outfits no se filtran por género por default — el usuario puede activar filtros si quiere pero no se lo impone el sistema.
El feed mezcla todos los tipos de cuerpo y estilos sin secciones separadas. No hay una sección "plus size" ghetto separada del catálogo general. Las reseñas muestran la foto del reviewer junto con sus medidas compartidas voluntariamente, normalizando la diversidad corporal como información útil en lugar de categoría.
Los posts de outfits usan un sistema de etiquetas de "vibe" en lugar de categorías binarias: minimal, estructurado, fluido, oversized, ceñido, androgino, maximalista. El usuario construye su identidad visual a través de estos vectores, no a través de clichés de género o edad.

Micro-interacciones clave
El like en un post no es solo un corazón. Se puede elegir entre varios emojis de reacción que expresan emoción estética (fuego, estrella, corazón, maniquí — este último significa "quiero probarme esto"). El botón de guardar en el guardarropas tiene una animación donde la prenda "vuela" hacia el ícono del guardarropas en la navegación inferior. Al completar una compra el resultado de éxito no es un check verde genérico — es el maniquí del usuario vistiendo la prenda comprada, con un mensaje personalizado.

Adaptación al contexto argentino
Las cuotas tienen que ser el dato más visible en la card de producto, más grande que el precio total. El diseño de la card muestra 3x $8.500 en tamaño grande y el precio total en gris más pequeño debajo — inversión deliberada de la jerarquía visual tradicional. Los métodos de pago locales (Mercado Pago, MODO) tienen sus logos en el checkout con el mismo peso visual que Visa, no como opción secundaria. Las notificaciones de cambio de precio usan un lenguaje directo: "Este producto subió $2.000 desde tu última visita" — honestidad sobre inflación como valor de marca.

Lo que hay que evitar explícitamente
Fondos blancos puros con productos flotando, que es el lenguaje visual de Tiendanube y no diferencia nada. Tipografías sans-serif neutras genéricas como Inter o Roboto. Iconografía de outline ultra-fino que desaparece en pantallas de baja resolución. Secciones de "Hombre / Mujer / Niños" como estructura principal de navegación. Modelos de campaña en cuerpos únicos representando "todos los talles". Push notifications con copy genérico tipo "¡Tenemos novedades para vos!" — cada notificación tiene que ser específica y justificada.

Resumen de la dirección
La plataforma visualmente es la intersección entre una revista de moda underground, un estudio de diseño que trabaja con tecnología y un espacio seguro para expresarse. Oscura pero cálida. Técnica pero emocional. Sofisticada pero sin intimidar. Ese equilibrio es el diferencial estético que ninguna tienda de moda argentina tiene hoy.