# UX y accesibilidad

Objetivo: WCAG 2.2 AA, con principios de ISO 9241-210/11/112 y heurísticas de Nielsen como referencias de diseño. **No existe certificación ISO ni declaración de conformidad exhaustiva.**

Tokens propios en `src/styles/global.css`: carbón/verde en tema oscuro y superficies claras con acentos de contraste en tema claro. La Home es una superficie de investigación, no marketing. Sidebar compacta, jerarquía tipográfica, bordes discretos, visualizaciones dominantes y tablas con scroll local.

Semántica: landmarks, títulos, tablas con caption, listas de definición, labels nativos, estados textuales y aria-pressed para selección. Los botones shadcn componen Radix cuando es necesario; los selects nativos conservan comportamiento de teclado. Skip link y foco visible; el foco de ruta no desplaza automáticamente el viewport. La navegación móvil se oculta también para interacción cuando está cerrada y puede cerrarse con Escape.

Los gráficos disponen de alternativas: botones por clúster, selector de contenido, detalles y tablas de datos para curvas/histogramas. AFTER SPLIT usa forma además de color: círculo/train, cuadrado/validation, rombo/test; noise mantiene triángulo y etiqueta −1. La procedencia y asignación se pueden leer en detalles sin interpretar colores.

Desktop-first: comprobaciones a 1024, 1440 y 1920 px. En móvil la navegación se despliega, los paneles apilan y las tablas desbordan solo en su contenedor. ECharts sin animación; media query de reduced motion elimina transiciones. Tema claro/oscuro como preferencia local.

Axe prueba pantallas principales en ambos temas; Playwright comprueba navegación responsive y funcionalidades. Las pruebas automáticas no reemplazan auditoría manual exhaustiva, screen readers, zoom alto ni evaluación con investigadores reales. Las imágenes no están conectadas: futuros adapters deben proporcionar descripciones, overlays alineados y estados de error/acceso.
