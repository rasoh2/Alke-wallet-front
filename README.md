# 💰 Alke Wallet - Frontend

**Billetera Digital Responsiva | Aplicación Web Interactiva**

---

## 📋 Descripción General

Alke Wallet Frontend es la interfaz de usuario para una plataforma de gestión de billetera digital. Proporciona una experiencia interactiva y responsiva que permite a los usuarios gestionar sus finanzas digitales con operaciones en tiempo real.

Desarrollada como proyecto final del Bootcamp SENCE 2025, implementa patrones modernos de desarrollo frontend y validación de datos del lado del cliente.

---

## ✨ Características Principales

- 🔐 **Sistema de Autenticación** - Login seguro con validación de credenciales
- 💰 **Módulo de Depósitos** - Simulación de depósitos con validación
- 💸 **Transferencias de Dinero** - Envío seguro a contactos registrados
- 📊 **Historial de Transacciones** - Registro detallado de operaciones
- 👥 **Gestión de Contactos** - Agregar y gestionar destinatarios
- 📊 **Dashboard Interactivo** - Visualización de saldo en tiempo real
- 📱 **Diseño 100% Responsivo** - Compatible con mobile, tablet y desktop
- ⚡ **Interfaz Intuitiva** - UX optimizada con Bootstrap

---

## 🛠️ Stack Tecnológico

| Tecnología          | Versión              | Uso                     |
| ------------------- | -------------------- | ----------------------- |
| **HTML5**           | -                    | Estructura semántica    |
| **CSS3**            | Bootstrap 5.3        | Estilos y responsividad |
| **JavaScript**      | Vanilla + jQuery 3.7 | Lógica interactiva      |
| **LocalStorage**    | Web API              | Persistencia de datos   |
| **Bootstrap Icons** | -                    | Iconografía             |

---

## 📁 Estructura del Proyecto

```
alke-wallet/
├── index.html              # Página de login/registro
├── main.html               # Dashboard principal
├── menu.html               # Componente de menú
├── deposit.html            # Módulo de depósitos
├── sendMoney.html          # Módulo de transferencias
├── transactions.html       # Historial de transacciones
├── package.json            # Metadatos del proyecto
├── README.md               # Este archivo
│
└── assets/
    ├── css/
    │   └── styles.css      # Estilos personalizados
    │
    └── js/
        ├── login.js        # Lógica de autenticación
        ├── menu.js         # Gestión del menú
        ├── deposit.js      # Lógica de depósitos
        ├── sendMoney.js    # Lógica de transferencias
        └── transactions.js # Gestión del historial
```

---

## 🚀 Instalación y Configuración

### Requisitos Previos

- Navegador moderno (Chrome, Firefox, Safari, Edge)
- Servidor HTTP local (recomendado para desarrollo)
- Backend API de Alke Wallet ejecutándose en `localhost:5000`

### Pasos de Instalación

#### Opción 1: Ejecución Directa

```bash
# Simplemente abre index.html en tu navegador
# Funciona directamente sin necesidad de instalación
```

#### Opción 2: Con Servidor Local (Recomendado)

```bash
# Con Python 3
python -m http.server 8000

# Con Node.js/npm
npm install -g http-server
http-server

# Luego accede a: http://localhost:8000
```

#### Opción 3: Con Node.js

```bash
npm install
npm start
```

---

## 📖 Guía de Uso

### 1. **Autenticación**

```
Página: index.html
Credenciales de prueba:
- Email: user@wallet.com | Contraseña: 12345
- Email: admin@wallet.com | Contraseña: admin123
- Email: maria@wallet.com | Contraseña: maria456
```

### 2. **Dashboard Principal**

```
Página: main.html
Funcionalidades:
- Visualización de saldo actual
- Acceso a todas las operaciones
- Estado de sesión del usuario
```

### 3. **Realizar Depósito**

```
Página: deposit.html
Pasos:
1. Ingresar cantidad a depositar
2. Seleccionar método (Simulado)
3. Confirmar operación
4. Ver confirmación en historial
```

### 4. **Transferir Dinero**

```
Página: sendMoney.html
Pasos:
1. Seleccionar contacto destinatario
2. Ingresar cantidad
3. Validar saldo disponible
4. Confirmar transferencia
```

### 5. **Ver Historial**

```
Página: transactions.html
Funcionalidades:
- Listado de todas las transacciones
- Filtrado por tipo (depósito/transferencia)
- Detalles de cada operación
- Exportación de datos
```

---

## 💾 Almacenamiento de Datos

### LocalStorage

Los datos se almacenan localmente en el navegador:

```javascript
// Estructura de datos
{
  "users": [
    {
      "id": 1,
      "email": "user@wallet.com",
      "password": "hashed_password",
      "balance": 5000,
      "created_at": "2024-01-15"
    }
  ],
  "transactions": [
    {
      "id": 1,
      "user_id": 1,
      "type": "deposit",
      "amount": 500,
      "date": "2024-03-20"
    }
  ]
}
```

---

## 🔒 Seguridad Implementada

- ✅ Validación de entrada del lado del cliente
- ✅ Verificación de saldo antes de operaciones
- ✅ Sesión con token (conexión con backend)
- ✅ Encriptación de datos sensibles
- ✅ Logout seguro
- ✅ Protección contra XSS
- ✅ CSRF tokens en formularios

---

## 🎨 Personalización

### Modificar Estilos

Editar `assets/css/styles.css`:

```css
/* Variables principales */
:root {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --success-color: #28a745;
  --danger-color: #dc3545;
}
```

---

## 📱 Responsividad

Puntos de quiebre Bootstrap:

- **Extra pequeño (xs):** < 576px
- **Pequeño (sm):** ≥ 576px
- **Mediano (md):** ≥ 768px
- **Grande (lg):** ≥ 992px
- **Extra grande (xl):** ≥ 1200px

---

## 🔗 Integración con Backend

### Configuración de API

En los archivos JS, establecer URL del backend:

```javascript
const API_URL = "http://localhost:5000";
```

### Endpoints Utilizados

```javascript
// Autenticación
POST / users / login;
POST / users / register;

// Transacciones
POST / transactions / deposit;
POST / transactions / transfer;
GET / transactions / history;

// Contactos
GET / contactos / list;
POST / contactos / add;
```

---

## 🐛 Troubleshooting

| Problema                   | Solución                                |
| -------------------------- | --------------------------------------- |
| Los datos no persisten     | Activar LocalStorage en navegador       |
| Conexión rechazada con API | Verificar que backend está ejecutándose |
| Estilos no cargan          | Revisar rutas de archivos CSS           |
| jQuery no funciona         | Verificar CDN de jQuery activo          |

---

## 🔄 Actualizaciones Futuras

- [ ] Integración con API real
- [ ] Autenticación con Google/GitHub
- [ ] Gráficos de estadísticas
- [ ] Exportación de reportes PDF
- [ ] Notificaciones push
- [ ] App progresiva (PWA)
- [ ] Tema oscuro
- [ ] Multi-idioma

---

## 👨‍💻 Desarrollo Local

### Servidor Recomendado para Desarrollo

```bash
npx live-server
```

---

## 📝 Licencia

Proyecto educativo - Bootcamp SENCE 2025

---

**Última actualización:** Abril 2026
**Versión:** 1.0.0
