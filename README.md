# Backend - OralSuite

API backend construida con NestJS como **monolito modular**.

## Stack

- **NestJS 10+**: Framework Node.js
- **TypeScript**: Tipado estático
- **TypeORM**: ORM para PostgreSQL
- **PostgreSQL**: Base de datos
- **Socket.io**: Chat en tiempo real
- **JWT**: Autenticación
- **Class Validator**: Validación de DTOs

## Puerto

`3000`

## Arquitectura: Monolito Modular

```
backend/
├── src/
│   ├── main.ts                    # Punto de entrada
│   ├── app.module.ts              # Módulo raíz
│   │
│   ├── config/                    # Configuración
│   │   ├── database.config.ts
│   │   ├── jwt.config.ts
│   │   └── app.config.ts
│   │
│   ├── common/                    # Código compartido
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts
│   │   │   └── roles.decorator.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   ├── interceptors/
│   │   │   └── transform.interceptor.ts
│   │   ├── pipes/
│   │   │   └── validation.pipe.ts
│   │   ├── dto/
│   │   │   ├── pagination.dto.ts
│   │   │   └── api-response.dto.ts
│   │   ├── enums/
│   │   │   ├── roles.enum.ts
│   │   │   ├── order-status.enum.ts
│   │   │   └── work-type.enum.ts
│   │   └── utils/
│   │       └── hash.util.ts
│   │
│   └── modules/                   # Módulos de dominio
│       ├── auth/
│       │   ├── auth.module.ts
│       │   ├── auth.controller.ts
│       │   ├── auth.service.ts
│       │   ├── dto/
│       │   │   ├── login.dto.ts
│       │   │   ├── register.dto.ts
│       │   │   └── token-response.dto.ts
│       │   └── strategies/
│       │       ├── jwt.strategy.ts
│       │       └── local.strategy.ts
│       │
│       ├── users/
│       │   ├── users.module.ts
│       │   ├── users.controller.ts
│       │   ├── users.service.ts
│       │   ├── dto/
│       │   │   ├── create-user.dto.ts
│       │   │   └── update-user.dto.ts
│       │   └── entities/
│       │       ├── user.entity.ts
│       │       ├── dentist.entity.ts
│       │       └── laboratory.entity.ts
│       │
│       ├── patients/
│       │   ├── patients.module.ts
│       │   ├── patients.controller.ts
│       │   ├── patients.service.ts
│       │   ├── dto/
│       │   │   ├── create-patient.dto.ts
│       │   │   └── update-patient.dto.ts
│       │   └── entities/
│       │       └── patient.entity.ts
│       │
│       ├── orders/
│       │   ├── orders.module.ts
│       │   ├── orders.controller.ts
│       │   ├── orders.service.ts
│       │   ├── dto/
│       │   │   ├── create-order.dto.ts
│       │   │   ├── update-order.dto.ts
│       │   │   ├── update-status.dto.ts
│       │   │   └── order-filter.dto.ts
│       │   └── entities/
│       │       ├── order.entity.ts
│       │       ├── order-item.entity.ts
│       │       └── order-status-history.entity.ts
│       │
│       └── chat/
│           ├── chat.module.ts
│           ├── chat.controller.ts     # REST: historial
│           ├── chat.gateway.ts        # WebSocket
│           ├── chat.service.ts
│           ├── dto/
│           │   ├── create-conversation.dto.ts
│           │   └── send-message.dto.ts
│           └── entities/
│               ├── conversation.entity.ts
│               ├── participant.entity.ts
│               └── message.entity.ts
│
├── test/                          # Tests
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
│
├── package.json
├── tsconfig.json
├── tsconfig.build.json
├── nest-cli.json
├── .env.example
├── .eslintrc.js
├── .prettierrc
└── Dockerfile
```

## Inicialización

```bash
# Crear proyecto NestJS (ejecutar en carpeta backend/)
nest new . --package-manager pnpm

# Instalar dependencias principales
pnpm add @nestjs/typeorm typeorm pg
pnpm add @nestjs/jwt @nestjs/passport passport passport-jwt passport-local
pnpm add @nestjs/websockets @nestjs/platform-socket.io socket.io
pnpm add @nestjs/config @nestjs/swagger swagger-ui-express
pnpm add class-validator class-transformer bcrypt
pnpm add -D @types/passport-jwt @types/passport-local @types/bcrypt
```

## Variables de Entorno

```bash
# .env.example
NODE_ENV=development
PORT=3000

# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_USER=oralsuite
DB_PASSWORD=oralsuite_dev_password
DB_NAME=oralsuite

# JWT
JWT_SECRET=tu-secreto-jwt-cambiar-en-produccion
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=otro-secreto-para-refresh
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGINS=http://localhost:3100,http://localhost:3200
```

## Endpoints

### Auth (`/api/auth`)
```
POST   /api/auth/register     Registrar usuario
POST   /api/auth/login        Iniciar sesión
POST   /api/auth/refresh      Renovar token
GET    /api/auth/me           Usuario actual
```

### Users (`/api/users`)
```
GET    /api/users             Listar usuarios (admin)
GET    /api/users/:id         Obtener usuario
PATCH  /api/users/:id         Actualizar usuario
GET    /api/dentists          Listar odontólogos
GET    /api/laboratories      Listar laboratorios
```

### Patients (`/api/patients`)
```
GET    /api/patients          Listar pacientes (del odontólogo)
POST   /api/patients          Crear paciente
GET    /api/patients/:id      Obtener paciente
PATCH  /api/patients/:id      Actualizar paciente
DELETE /api/patients/:id      Eliminar paciente
```

### Orders (`/api/orders`)
```
GET    /api/orders            Listar órdenes
POST   /api/orders            Crear orden
GET    /api/orders/:id        Obtener orden
PATCH  /api/orders/:id        Actualizar orden
PATCH  /api/orders/:id/status Cambiar estado
GET    /api/orders/:id/history Historial de estados
DELETE /api/orders/:id        Cancelar orden
```

### Chat (`/api/chat` + WebSocket)
```
GET    /api/chat/conversations           Listar conversaciones
POST   /api/chat/conversations           Crear conversación
GET    /api/chat/conversations/:id       Obtener conversación
GET    /api/chat/conversations/:id/messages  Mensajes (paginado)

WebSocket Events:
- connect (con JWT)
- join_conversation
- send_message
- typing
- mark_read
```

### Health
```
GET    /api/health            Health check
```

## Módulos Detallados

### Auth Module
Maneja autenticación y tokens JWT.

```typescript
// src/modules/auth/auth.service.ts
@Injectable()
export class AuthService {
  async register(dto: RegisterDto): Promise<TokenResponse> { }
  async login(dto: LoginDto): Promise<TokenResponse> { }
  async refreshToken(refreshToken: string): Promise<TokenResponse> { }
  async validateUser(email: string, password: string): Promise<User> { }
}
```

### Users Module
Gestión de usuarios y perfiles (odontólogos/laboratorios).

```typescript
// src/modules/users/entities/user.entity.ts
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @Column({ default: true })
  isActive: boolean;

  // Relación con perfil específico
  @OneToOne(() => Dentist, dentist => dentist.user)
  dentist?: Dentist;

  @OneToOne(() => Laboratory, lab => lab.user)
  laboratory?: Laboratory;
}
```

### Orders Module
CRUD de órdenes y tracking de estados.

```typescript
// src/modules/orders/entities/order.entity.ts
@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  orderNumber: string;  // ORD-2024-0001

  @ManyToOne(() => User)
  dentist: User;

  @ManyToOne(() => User)
  laboratory: User;

  @ManyToOne(() => Patient, { nullable: true })
  patient: Patient;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.RECEIVED })
  status: OrderStatus;

  @OneToMany(() => OrderItem, item => item.order, { cascade: true })
  items: OrderItem[];

  @Column({ type: 'date', nullable: true })
  deliveryDate: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;
}
```

### Chat Module
Mensajería en tiempo real con WebSocket.

```typescript
// src/modules/chat/chat.gateway.ts
@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    // Validar JWT del handshake
  }

  @SubscribeMessage('send_message')
  handleMessage(client: Socket, payload: SendMessageDto) {
    // Guardar mensaje y emitir a participantes
  }

  @SubscribeMessage('join_conversation')
  handleJoin(client: Socket, conversationId: number) {
    client.join(`conversation:${conversationId}`);
  }
}
```

## Enums

```typescript
// src/common/enums/roles.enum.ts
export enum UserRole {
  DENTIST = 'DENTIST',
  LABORATORY = 'LABORATORY',
  ADMIN = 'ADMIN',
}

// src/common/enums/order-status.enum.ts
export enum OrderStatus {
  RECEIVED = 'RECEIVED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

// src/common/enums/work-type.enum.ts
export enum WorkType {
  CROWN = 'CROWN',
  BRIDGE = 'BRIDGE',
  IMPLANT = 'IMPLANT',
  DENTURE = 'DENTURE',
  VENEER = 'VENEER',
  INLAY = 'INLAY',
  ONLAY = 'ONLAY',
  POST = 'POST',
  TEMPORARY = 'TEMPORARY',
  REPAIR = 'REPAIR',
  OTHER = 'OTHER',
}
```

## Comandos

```bash
# Desarrollo
pnpm start:dev

# Build
pnpm build

# Producción
pnpm start:prod

# Tests
pnpm test
pnpm test:e2e

# Lint
pnpm lint
```

## Swagger (Documentación API)

Acceder a `http://localhost:3000/api/docs` para ver la documentación interactiva.

```typescript
// main.ts
const config = new DocumentBuilder()
  .setTitle('OralSuite API')
  .setDescription('API para gestión dental')
  .setVersion('1.0')
  .addBearerAuth()
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api/docs', app, document);
```

## Estructura de Respuestas

```typescript
// Éxito
{
  "success": true,
  "data": { ... }
}

// Error
{
  "success": false,
  "message": "Descripción del error",
  "errors": ["detalle1", "detalle2"]
}

// Paginado
{
  "success": true,
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

## Convenciones

- **Archivos**: kebab-case (`create-order.dto.ts`)
- **Clases**: PascalCase (`CreateOrderDto`)
- **Variables/funciones**: camelCase (`createOrder`)
- **Constantes**: UPPER_SNAKE_CASE (`ORDER_STATUS`)

## Ventajas del Monolito Modular

1. **Simple**: Todo en un lugar, fácil de entender
2. **Rápido de desarrollar**: Sin overhead de red entre servicios
3. **Fácil debugging**: Un proceso, logs unificados
4. **Bajo costo**: Un servidor/container
5. **Escalable**: Puede extraerse a microservicios si crece mucho

## Migración Futura (si es necesario)

Los módulos están diseñados para poder extraerse fácilmente:

```
Ahora:           Futuro (si escala mucho):
┌──────────┐     ┌──────────┐  ┌──────────┐
│  NestJS  │     │   Auth   │  │  Orders  │
│ Monolito │ --> │ Service  │  │ Service  │
│          │     └──────────┘  └──────────┘
└──────────┘     ┌──────────┐
                 │   Chat   │
                 │ Service  │
                 └──────────┘
```

Pero esto probablemente **no será necesario** hasta tener cientos de miles de usuarios.
