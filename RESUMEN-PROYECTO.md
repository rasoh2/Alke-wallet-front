# 📝 RESUMEN DEL PROYECTO - ALKE WALLET

## 🎓 Información del Proyecto

**Nombre:** Alke Wallet - Billetera Digital  
**Bootcamp:** SENCE 2025  
**Módulo:** Módulo 2 - Desarrollo Web Frontend  
**Período:** Enero 2026  
**Repositorio:** https://github.com/rasoh2/alke-wallet

---

## 📦 Organización en Pull Requests (Git Workflow)

El proyecto fue desarrollado en **5 Pull Requests organizados** con ramas feature independientes:

### ✅ PR #1: Menú Principal

**Rama:** `feature/menu`  
**Archivos creados:**

- `main.html` - Página de bienvenida con información del proyecto
- `menu.html` - Dashboard principal con estadísticas
- `assets/js/menu.js` - Lógica del menú y visualización de datos

**Funcionalidades:**

- Dashboard con visualización de saldo actual
- Tarjetas de navegación hacia cada funcionalidad
- Estadísticas de transacciones (depósitos, transferencias, movimientos totales)
- Sistema de verificación de autenticación
- Botón de cerrar sesión

---

### ✅ PR #2: Sistema de Depósitos

**Rama:** `feature/depositos`  
**Archivos creados:**

- `deposit.html` - Página de depósitos con formulario
- `assets/js/deposit.js` - Lógica de depósitos y validaciones

**Funcionalidades:**

- Formulario de depósito con campo de entrada
- Botones de monto rápido ($5,000, $10,000, $20,000, $50,000, $100,000)
- Validación de monto mínimo ($1,000 pesos)
- Actualización automática del saldo en localStorage
- Registro de transacciones con ID incremental
- Alertas de éxito/error con SweetAlert
- Limpieza de formulario tras depósito exitoso

---

### ✅ PR #3: Sistema de Transferencias

**Rama:** `feature/transferencias`  
**Archivos creados:**

- `sendMoney.html` - Página de transferencias con lista de contactos
- `assets/js/sendMoney.js` - Lógica de transferencias y gestión de contactos
- `assets/data/contactos.json` - Lista de contactos predefinidos

**Funcionalidades:**

- Lista de contactos con información detallada (nombre, alias, cuenta)
- Búsqueda/filtro de contactos en tiempo real
- Agregar nuevos contactos mediante modal de Bootstrap
- Eliminar contactos con confirmación
- Formulario de transferencia con selección de contacto
- Validación de saldo disponible antes de transferir
- Actualización automática del saldo tras transferencia
- Registro de transacciones con datos del destinatario
- Alertas personalizadas con íconos

---

### ✅ PR #4: Historial de Transacciones

**Rama:** `feature/transacciones`  
**Archivos creados:**

- `transactions.html` - Página de historial con filtros
- `assets/js/transactions.js` - Lógica de visualización y filtrado

**Funcionalidades:**

- Vista completa de todas las transacciones
- Tarjetas de resumen (saldo actual, total depositado, total enviado)
- **Filtros por tipo:**
  - Todos los movimientos
  - Solo depósitos
  - Solo transferencias
- **Ordenamiento múltiple:**
  - Más reciente
  - Más antiguo
  - Mayor monto
  - Menor monto
- Diseño con íconos y colores diferenciados (verde para depósitos, rojo para transferencias)
- Animaciones de entrada escalonadas para cada transacción
- Mensaje personalizado cuando no hay movimientos
- Resumen estadístico en consola

---

### ✅ PR #5: Filtrado de Contactos en Tiempo Real

**Rama:** `feature/autocompletado`  
**Archivos modificados:**

- `sendMoney.html` - Diseño en dos columnas paralelas
- `assets/js/sendMoney.js` - Filtrado instantáneo con selección clickeable
- `assets/data/contactos.json` - 30 contactos de prueba

**Funcionalidades:**

- Filtrado instantáneo de lista de contactos al escribir
- Click en contacto para autoselección
- Diseño paralelo: formulario + lista de contactos
- 30 contactos con nombres repetidos para testing
- Animaciones suaves al filtrar
- Búsqueda por nombre, apellido, alias y banco

---

## 🛠️ Tecnologías Utilizadas

### Frontend

- **HTML5:** Estructura semántica con etiquetas modernas
- **CSS3:** Estilos avanzados con variables CSS, gradientes y animaciones
- **Bootstrap 5.3.2:** Framework CSS para diseño responsive
- **JavaScript ES6+:** Sintaxis moderna con arrow functions, template literals
- **jQuery 3.7.1:** Manipulación del DOM, eventos y AJAX

### Arquitectura

- **Carpeta assets/:** Organización profesional de recursos
  - `assets/css/` - Estilos
  - `assets/js/` - Scripts
  - `assets/data/` - Datos JSON

### Persistencia de Datos

- **LocalStorage API:** Almacenamiento de:
  - Sesión de usuario (`usuarioLogueado`)
  - Saldo actual (`saldo`)
  - Historial de transacciones (`movimientos`)
  - Lista de contactos (`contactos`)

### Control de Versiones

- **Git:** Control de versiones con workflow de ramas
- **GitHub:** Repositorio remoto para colaboración

---

## 📊 Arquitectura del Sistema

### Flujo de Datos

```
1. LOGIN (index.html)
   ├── Validación contra usuarios.json
   ├── Almacena usuario en localStorage
   └── Redirige a main.html

2. DASHBOARD (menu.html)
   ├── Lee saldo de localStorage
   ├── Cuenta transacciones
   ├── Muestra estadísticas
   └── Proporciona navegación

3. DEPÓSITOS (deposit.html)
   ├── Valida monto ingresado
   ├── Actualiza saldo en localStorage
   ├── Guarda transacción en movimientos[]
   └── Muestra confirmación

4. TRANSFERENCIAS (sendMoney.html)
   ├── Carga contactos.json (primera vez)
   ├── Permite agregar/eliminar contactos
   ├── Valida saldo disponible
   ├── Actualiza saldo en localStorage
   ├── Guarda transacción con datos del destinatario
   └── Muestra confirmación

5. HISTORIAL (transactions.html)
   ├── Lee movimientos[] de localStorage
   ├── Aplica filtros y ordenamiento
   ├── Calcula totales
   └── Renderiza lista de transacciones
```

### Estructura de Datos

#### Usuario (localStorage)

```javascript
{
  "usuarioLogueado": "user@wallet.com"
}
```

#### Saldo (localStorage)

```javascript
{
  "saldo": 50000
}
```

#### Transacción (localStorage movimientos[])

```javascript
{
  "tipo": "deposito" | "transferencia",
  "monto": 10000,
  "fecha": "13/01/2026 14:30",
  "descripcion": "Depósito manual",
  "timestamp": 1736791800000,
  // Solo para transferencias:
  "alias": "Pedro Martínez",
  "cuentaDestino": "1234567890"
}
```

#### Contacto (localStorage contactos[])

```javascript
{
  "id": 1,
  "nombre": "Pedro Martínez",
  "alias": "Pedro",
  "cuenta": "1234567890"
}
```

---

## 🎨 Diseño UI/UX

### Paleta de Colores

- **Primario:** `#4e73df` (Azul)
- **Éxito:** `#1cc88a` (Verde)
- **Peligro:** `#e74a3b` (Rojo)
- **Advertencia:** `#f6c23e` (Amarillo)
- **Info:** `#36b9cc` (Cyan)

### Características de Diseño

- **Responsive:** Adaptable a móviles (320px+), tablets (768px+) y escritorio (1200px+)
- **Animaciones:** Transiciones suaves en hover, entrada de elementos
- **Gradientes:** Fondos modernos con degradados
- **Tarjetas:** Diseño de tarjetas con sombras y bordes redondeados
- **Iconos:** Emojis nativos para mejor compatibilidad
- **Feedback Visual:** Colores diferenciados para cada tipo de acción

---

## 🔒 Seguridad y Validaciones

### Validaciones Implementadas

1. **Login:**

   - Campos obligatorios
   - Verificación de credenciales válidas
   - Protección contra acceso no autorizado

2. **Depósitos:**

   - Monto mínimo: $1,000
   - Solo números positivos
   - Validación de formato

3. **Transferencias:**

   - Saldo disponible suficiente
   - Monto mínimo: $1
   - Validación de contacto seleccionado
   - Campos obligatorios para nuevo contacto

4. **Sesión:**
   - Verificación de autenticación en cada página
   - Redirección automática a login si no hay sesión

### Limitaciones de Seguridad

⚠️ **Importante:** Este es un proyecto educativo con las siguientes limitaciones:

- Contraseñas en texto plano (no encriptadas)
- Sin backend real ni base de datos
- LocalStorage no es seguro para datos sensibles reales
- No implementa tokens de autenticación
- No hay validación del lado del servidor

---

## 📈 Métricas del Proyecto

### Archivos Creados

- **HTML:** 6 archivos (index, main, menu, deposit, sendMoney, transactions)
- **CSS:** 1 archivo (styles.css - ~500 líneas)
- **JavaScript:** 5 archivos (~1,500 líneas totales)
- **JSON:** 2 archivos (usuarios, contactos)
- **Documentación:** 3 archivos (README, RESUMEN, GITHUB-GUIDE)

### Líneas de Código (aproximadas)

- **HTML:** ~1,200 líneas
- **CSS:** ~500 líneas
- **JavaScript:** ~1,500 líneas
- **Total:** ~3,200 líneas de código

### Commits Realizados

- **Commit inicial:** Base del proyecto con login
- **PR #1:** Feature: Menú Principal
- **PR #2:** Feature: Sistema de Depósitos
- **PR #3:** Feature: Sistema de Transferencias
- **PR #4:** Feature: Historial de Transacciones
- **PR #5:** Feature: Filtrado de Contactos en Tiempo Real
- **Refactor:** Reorganización con carpeta assets/

---

## ✅ Funcionalidades Completadas

### Sistema de Login ✅

- [x] Página de inicio de sesión
- [x] Validación de credenciales
- [x] Mensajes de error personalizados
- [x] Redirección automática
- [x] Persistencia de sesión

### Dashboard ✅

- [x] Visualización de saldo
- [x] Estadísticas de transacciones
- [x] Tarjetas de navegación
- [x] Botón de cerrar sesión
- [x] Diseño responsive

### Depósitos ✅

- [x] Formulario de depósito
- [x] Botones de monto rápido
- [x] Validaciones de monto
- [x] Actualización de saldo
- [x] Registro de transacciones
- [x] Alertas de confirmación

### Transferencias ✅

- [x] Lista de contactos
- [x] Búsqueda de contactos
- [x] Agregar contactos
- [x] Eliminar contactos
- [x] Formulario de transferencia
- [x] Validación de saldo
- [x] Registro de transacciones con destinatario

### Historial ✅

- [x] Vista de todas las transacciones
- [x] Filtros por tipo
- [x] Ordenamiento múltiple
- [x] Resumen de totales
- [x] Diseño diferenciado por tipo
- [x] Animaciones de entrada

---

## 🚀 Mejoras Futuras (Opcional)

### Funcionalidades Adicionales

- [ ] Gráficos de gastos (Chart.js)
- [ ] Exportar historial a PDF
- [ ] Notificaciones push
- [ ] Modo oscuro
- [ ] Múltiples cuentas bancarias
- [ ] Categorización de gastos
- [ ] Límites de transferencia diaria
- [ ] Recuperación de contraseña

### Mejoras Técnicas

- [ ] Backend con Node.js + Express
- [ ] Base de datos real (MongoDB/PostgreSQL)
- [ ] Autenticación JWT
- [ ] Encriptación de contraseñas (bcrypt)
- [ ] API RESTful
- [ ] Testing con Jest
- [ ] CI/CD con GitHub Actions

---

## 🎓 Aprendizajes Clave

### Conceptos Aplicados

1. **Manipulación del DOM:** jQuery para selección y modificación de elementos
2. **LocalStorage:** Persistencia de datos en el navegador
3. **Validación de Formularios:** Control de entrada del usuario
4. **Diseño Responsive:** Media queries y Bootstrap grid
5. **Programación Funcional:** Funciones reutilizables y modularización
6. **Control de Versiones:** Git workflow con ramas y merges
7. **Debugging:** Uso de console.log para rastreo de errores
8. **Async/Ajax:** Carga de archivos JSON con jQuery.ajax()

### Buenas Prácticas

- ✅ Código comentado y documentado
- ✅ Nombres de variables descriptivos en español
- ✅ Estructura de archivos organizada
- ✅ Commits atómicos y descriptivos
- ✅ README completo con instrucciones
- ✅ Validaciones en el frontend
- ✅ Feedback visual al usuario
- ✅ Manejo de errores con try-catch

---

## 📞 Soporte y Contacto

**Repositorio:** https://github.com/rasoh2/alke-wallet  
**Issues:** https://github.com/rasoh2/alke-wallet/issues

---

## 📄 Licencia

Este proyecto es de código abierto y está disponible para fines educativos.

---

**Fecha de Finalización:** 16 de Enero de 2026  
**Versión:** 2.0.0  
**Estado:** ✅ Proyecto Completado con Mejoras

---

> 💡 **Nota:** Este proyecto fue desarrollado como parte del Bootcamp SENCE 2025 con fines educativos. No está destinado para uso en producción sin las mejoras de seguridad necesarias.
