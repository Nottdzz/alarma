# Alarma - Sistema de Gestión de Horarios, Alarmas y Estado Emocional Escolar

Aplicación web enfocada en estudiantes escolares para la centralización y organización de horarios semanales, programación de alarmas con ejecución secuencial en caso de colisión de horas, registro del estado emocional diario y gestión de notas rápidas.

---

## 🛠 Metodología: Spec-Driven Development (SDD / SSD) con OpenSpec

Este proyecto adopta **Desarrollo Guiado por Especificaciones (Spec-Driven Development / SDD)** utilizando **[OpenSpec](https://openspec.dev)** como fuente única de verdad del comportamiento del sistema.

### ¿Por qué SDD / SSD?
- **Especificaciones Vivas:** Cada funcionalidad se define primero en un contrato formal en `openspec/specs/` antes de escribir código.
- **Control Antideriva de IA:** Los asistentes de desarrollo e ingenieros se guían por especificaciones estructuradas con requisitos RFC 2119 (`SHALL`, `MUST`), eliminando inconsistencias.
- **Ciclo de Cambios Trazable:** Cualquier modificación pasa por una propuesta (`proposal.md`), especificaciones delta (`specs/`), diseño técnico (`design.md`) y checklist de tareas (`tasks.md`).

---

## 📂 Estructura de OpenSpec en el Proyecto

```text
alarma/
├── openspec/
│   ├── config.yaml               # Configuración del esquema, contexto del proyecto y reglas
│   ├── specs/                    # Especificaciones vivas (fuente de verdad del sistema)
│   │   ├── autenticacion/        # Registro, login JWT, contraseñas bcrypt y seguridad
│   │   ├── gestion-horarios/     # CRUD de horarios y prevención de solapamientos
│   │   ├── alarmas/              # CRUD de alarmas, toggle y cola de reproducción secuencial
│   │   ├── estados-emocionales/  # Registro diario de emociones (1 por día)
│   │   └── notas/                # CRUD de notas rápidas y recordatorios
│   └── changes/                  # Propuestas y cambios activos
│       └── archive/              # Historial de cambios completados y archivados
├── .agents/                      # Habilidades y flujos OpenSpec para Antigravity / Coding Agents
│   ├── skills/                   # openspec-propose, openspec-apply, etc.
│   └── workflows/                # opsx-propose.md, opsx-apply.md, etc.
└── Documentos/                   # Documentación de diseño original (SDD, SRS, UI/UX, Estándares)
```

---

## 🚀 Comandos y Flujo de Trabajo

OpenSpec está instalado tanto a nivel de proyecto (`package.json`) como integrado con el entorno de desarrollo.

### Scripts de NPM
| Comando | Descripción |
|---|---|
| `npm run opsx` | Ejecuta la CLI de OpenSpec |
| `npm run opsx:specs` | Lista todas las especificaciones activas y sus requisitos |
| `npm run opsx:validate` | Valida la sintaxis y coherencia de las especificaciones |
| `npm run opsx:doctor` | Diagnostica el estado del directorio raíz de OpenSpec |
| `npm run opsx:view` | Abre el dashboard visual interactivo de especificaciones |

### Comandos de Asistente IA (Antigravity Slash Commands)
Cuando desarrolles nuevas funcionalidades o ajustes, utiliza el ciclo de comandos de OpenSpec:

1. **Explorar requerimientos o ideas:**
   ```text
   /opsx-explore
   ```
2. **Proponer un nuevo cambio (Crea proposal, specs delta, design y tasks):**
   ```text
   /opsx-propose "nombre-del-cambio"
   ```
3. **Revisar y actualizar la propuesta si hay ajustes:**
   ```text
   /opsx-update
   ```
4. **Implementar el cambio aprobado paso a paso:**
   ```text
   /opsx-apply
   ```
5. **Sincronizar las especificaciones vivas o archivar el cambio terminado:**
   ```text
   /opsx-sync
   /opsx-archive
   ```

---

## 📦 Stack Tecnológico

- **Frontend:** HTML5, CSS3 (variables CSS, diseño responsive tipo dashboard), JavaScript Vanilla ES6+.
- **Backend:** Node.js + Express.
- **Base de Datos:** SQLite3 (`database.db`) con consultas preparadas (`?`) para máxima seguridad.
- **Autenticación:** JWT (JSON Web Tokens) con contraseñas encriptadas mediante `bcrypt` (10 salt rounds).
