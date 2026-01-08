-- ===========================================
-- OralSuite - Inicialización de Base de Datos
-- ===========================================
-- Este script se ejecuta automáticamente cuando
-- PostgreSQL se inicia por primera vez con Docker Compose
--
-- Para reiniciar la BD desde cero:
--   docker compose down -v
--   docker compose up -d postgres
--

-- Habilitar extensiones útiles
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===========================================
-- ENUMS
-- ===========================================

-- Roles de usuario
CREATE TYPE user_role AS ENUM ('DENTIST', 'LABORATORY', 'ADMIN');

-- Estados de orden
CREATE TYPE order_status AS ENUM (
    'DRAFT',           -- Borrador (no enviada)
    'PENDING',         -- Enviada, esperando aceptación
    'ACCEPTED',        -- Aceptada por laboratorio
    'IN_PROGRESS',     -- En proceso de fabricación
    'READY',           -- Lista para retirar/enviar
    'SHIPPED',         -- Enviada al odontólogo
    'DELIVERED',       -- Entregada
    'CANCELLED'        -- Cancelada
);

-- Tipo de trabajo dental
CREATE TYPE work_type AS ENUM (
    'CROWN',           -- Corona
    'BRIDGE',          -- Puente
    'DENTURE',         -- Prótesis
    'IMPLANT',         -- Implante
    'VENEER',          -- Carilla
    'INLAY_ONLAY',     -- Inlay/Onlay
    'ORTHODONTICS',    -- Ortodoncia
    'OTHER'            -- Otro
);

-- Material del trabajo
CREATE TYPE material_type AS ENUM (
    'ZIRCONIA',
    'PORCELAIN',
    'METAL_CERAMIC',
    'ACRYLIC',
    'COMPOSITE',
    'TITANIUM',
    'GOLD',
    'OTHER'
);

-- ===========================================
-- TABLA: users (usuarios base)
-- ===========================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

COMMENT ON TABLE users IS 'Usuarios del sistema (odontólogos, laboratorios, admins)';

-- ===========================================
-- TABLA: dentist_profiles (perfil de odontólogo)
-- ===========================================
CREATE TABLE dentist_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,

    -- Datos profesionales
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    license_number VARCHAR(50),
    specialization VARCHAR(100),

    -- Datos de la clínica
    clinic_name VARCHAR(200),
    clinic_address VARCHAR(500),
    clinic_phone VARCHAR(50),
    clinic_city VARCHAR(100),
    clinic_state VARCHAR(100),

    -- Configuración
    avatar_url VARCHAR(500),
    notification_email BOOLEAN DEFAULT true,
    notification_push BOOLEAN DEFAULT true,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE dentist_profiles IS 'Perfiles de odontólogos con datos de clínica';

-- ===========================================
-- TABLA: laboratory_profiles (perfil de laboratorio)
-- ===========================================
CREATE TABLE laboratory_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,

    -- Datos del negocio
    business_name VARCHAR(200) NOT NULL,
    tax_id VARCHAR(50),                    -- CUIT/RUT/NIF
    contact_name VARCHAR(200),

    -- Ubicación
    address VARCHAR(500),
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    phone VARCHAR(50),

    -- Información adicional
    website VARCHAR(255),
    description TEXT,
    logo_url VARCHAR(500),

    -- Capacidades
    work_types_offered work_type[] DEFAULT '{}',
    materials_offered material_type[] DEFAULT '{}',
    average_turnaround_days INTEGER DEFAULT 7,

    -- Configuración
    accepts_new_clients BOOLEAN DEFAULT true,
    notification_email BOOLEAN DEFAULT true,
    notification_push BOOLEAN DEFAULT true,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE laboratory_profiles IS 'Perfiles de laboratorios dentales';

-- ===========================================
-- TABLA: dentist_laboratory_connections (conexiones)
-- ===========================================
CREATE TABLE dentist_laboratory_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dentist_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    laboratory_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Estado de la conexión
    is_active BOOLEAN DEFAULT true,
    is_favorite BOOLEAN DEFAULT false,

    -- Metadatos
    connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,

    UNIQUE(dentist_id, laboratory_id)
);

CREATE INDEX idx_connections_dentist ON dentist_laboratory_connections(dentist_id);
CREATE INDEX idx_connections_laboratory ON dentist_laboratory_connections(laboratory_id);

COMMENT ON TABLE dentist_laboratory_connections IS 'Relaciones entre odontólogos y laboratorios';

-- ===========================================
-- TABLA: patients (pacientes)
-- ===========================================
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dentist_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Datos del paciente (solo identificación básica)
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    identifier VARCHAR(50),               -- DNI, ID interno, etc.
    birth_date DATE,
    notes TEXT,

    -- Metadatos
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_patients_dentist ON patients(dentist_id);

COMMENT ON TABLE patients IS 'Pacientes de cada odontólogo';

-- ===========================================
-- TABLA: orders (órdenes/remitos)
-- ===========================================
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(20) NOT NULL UNIQUE,  -- Ej: ORD-2024-0001

    -- Relaciones
    dentist_id UUID NOT NULL REFERENCES users(id),
    laboratory_id UUID NOT NULL REFERENCES users(id),
    patient_id UUID REFERENCES patients(id),

    -- Estado
    status order_status DEFAULT 'DRAFT',

    -- Información del paciente (copiada para historial)
    patient_name VARCHAR(200),
    patient_identifier VARCHAR(50),

    -- Detalles generales
    priority VARCHAR(20) DEFAULT 'normal',    -- low, normal, high, urgent
    notes TEXT,
    internal_notes TEXT,                       -- Notas del laboratorio

    -- Fechas
    due_date DATE,
    estimated_delivery DATE,
    shipped_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,

    -- Metadatos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_orders_dentist ON orders(dentist_id);
CREATE INDEX idx_orders_laboratory ON orders(laboratory_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_number ON orders(order_number);

COMMENT ON TABLE orders IS 'Órdenes de trabajo (remitos digitales)';

-- ===========================================
-- TABLA: order_items (items de la orden)
-- ===========================================
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

    -- Tipo de trabajo
    work_type work_type NOT NULL,
    work_type_other VARCHAR(100),          -- Si work_type es OTHER

    -- Detalles del trabajo
    teeth_numbers INTEGER[],               -- Piezas dentales (1-32)
    material material_type,
    material_other VARCHAR(100),
    shade VARCHAR(50),                     -- Color/tono

    -- Descripción
    description TEXT,

    -- Cantidad y precio (opcional)
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(10,2),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_order_items_order ON order_items(order_id);

COMMENT ON TABLE order_items IS 'Items individuales de cada orden';

-- ===========================================
-- TABLA: order_attachments (archivos adjuntos)
-- ===========================================
CREATE TABLE order_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

    -- Archivo
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100),                -- MIME type
    file_size INTEGER,                     -- bytes
    file_url VARCHAR(500) NOT NULL,

    -- Metadatos
    description VARCHAR(255),
    uploaded_by UUID REFERENCES users(id),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_attachments_order ON order_attachments(order_id);

COMMENT ON TABLE order_attachments IS 'Archivos adjuntos (fotos, STL, etc.)';

-- ===========================================
-- TABLA: order_status_history (historial de estados)
-- ===========================================
CREATE TABLE order_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

    -- Cambio de estado
    from_status order_status,
    to_status order_status NOT NULL,

    -- Quién y cuándo
    changed_by UUID REFERENCES users(id),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Notas del cambio
    notes TEXT
);

CREATE INDEX idx_status_history_order ON order_status_history(order_id);

COMMENT ON TABLE order_status_history IS 'Historial de cambios de estado de órdenes';

-- ===========================================
-- TABLA: conversations (conversaciones de chat)
-- ===========================================
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Puede estar vinculada a una orden o ser general
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,

    -- Participantes
    dentist_id UUID NOT NULL REFERENCES users(id),
    laboratory_id UUID NOT NULL REFERENCES users(id),

    -- Estado
    is_active BOOLEAN DEFAULT true,

    -- Metadatos
    last_message_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_conversations_order ON conversations(order_id);
CREATE INDEX idx_conversations_dentist ON conversations(dentist_id);
CREATE INDEX idx_conversations_laboratory ON conversations(laboratory_id);

COMMENT ON TABLE conversations IS 'Conversaciones entre odontólogos y laboratorios';

-- ===========================================
-- TABLA: messages (mensajes del chat)
-- ===========================================
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,

    -- Remitente
    sender_id UUID NOT NULL REFERENCES users(id),

    -- Contenido
    content TEXT NOT NULL,

    -- Estado de lectura
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,

    -- Metadatos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created ON messages(created_at);

COMMENT ON TABLE messages IS 'Mensajes de chat';

-- ===========================================
-- TABLA: message_attachments (archivos en mensajes)
-- ===========================================
CREATE TABLE message_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,

    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100),
    file_size INTEGER,
    file_url VARCHAR(500) NOT NULL
);

CREATE INDEX idx_message_attachments_message ON message_attachments(message_id);

COMMENT ON TABLE message_attachments IS 'Archivos adjuntos en mensajes';

-- ===========================================
-- TABLA: notifications (notificaciones)
-- ===========================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Contenido
    title VARCHAR(200) NOT NULL,
    body TEXT,
    type VARCHAR(50),                      -- order_update, new_message, etc.

    -- Referencia
    reference_type VARCHAR(50),            -- order, conversation, etc.
    reference_id UUID,

    -- Estado
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id) WHERE is_read = false;

COMMENT ON TABLE notifications IS 'Notificaciones del sistema';

-- ===========================================
-- TABLA: refresh_tokens (tokens de refresco)
-- ===========================================
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,

    -- Información del dispositivo
    user_agent TEXT,
    ip_address VARCHAR(45),

    -- Estado
    is_revoked BOOLEAN DEFAULT false,
    revoked_at TIMESTAMP WITH TIME ZONE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_hash ON refresh_tokens(token_hash);

COMMENT ON TABLE refresh_tokens IS 'Tokens de refresco para autenticación';

-- ===========================================
-- FUNCIÓN: Actualizar updated_at automáticamente
-- ===========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger a tablas relevantes
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dentist_profiles_updated_at
    BEFORE UPDATE ON dentist_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_laboratory_profiles_updated_at
    BEFORE UPDATE ON laboratory_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at
    BEFORE UPDATE ON patients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- FUNCIÓN: Generar número de orden
-- ===========================================
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
    year_part VARCHAR(4);
    seq_num INTEGER;
BEGIN
    year_part := TO_CHAR(NOW(), 'YYYY');

    SELECT COALESCE(MAX(
        CAST(SPLIT_PART(order_number, '-', 3) AS INTEGER)
    ), 0) + 1
    INTO seq_num
    FROM orders
    WHERE order_number LIKE 'ORD-' || year_part || '-%';

    NEW.order_number := 'ORD-' || year_part || '-' || LPAD(seq_num::TEXT, 4, '0');

    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER generate_order_number_trigger
    BEFORE INSERT ON orders
    FOR EACH ROW
    WHEN (NEW.order_number IS NULL OR NEW.order_number = '')
    EXECUTE FUNCTION generate_order_number();

-- ===========================================
-- DATOS DE PRUEBA (Desarrollo)
-- ===========================================

-- Usuario Admin
INSERT INTO users (id, email, password_hash, role, is_active, is_verified) VALUES
    ('a0000000-0000-4000-a000-000000000001',
     'admin@oralsuite.com',
     crypt('admin123', gen_salt('bf')),
     'ADMIN',
     true,
     true);

-- Odontólogo de prueba
INSERT INTO users (id, email, password_hash, role, is_active, is_verified) VALUES
    ('a0000000-0000-4000-a000-000000000002',
     'dentist@test.com',
     crypt('password123', gen_salt('bf')),
     'DENTIST',
     true,
     true);

INSERT INTO dentist_profiles (user_id, first_name, last_name, license_number, clinic_name, clinic_city) VALUES
    ('a0000000-0000-4000-a000-000000000002',
     'Juan',
     'Pérez',
     'MP-12345',
     'Clínica Dental Sonrisa',
     'Buenos Aires');

-- Laboratorio de prueba
INSERT INTO users (id, email, password_hash, role, is_active, is_verified) VALUES
    ('a0000000-0000-4000-a000-000000000003',
     'lab@test.com',
     crypt('password123', gen_salt('bf')),
     'LABORATORY',
     true,
     true);

INSERT INTO laboratory_profiles (user_id, business_name, tax_id, city, work_types_offered, materials_offered) VALUES
    ('a0000000-0000-4000-a000-000000000003',
     'Laboratorio Dental Excellence',
     '30-12345678-9',
     'Buenos Aires',
     ARRAY['CROWN', 'BRIDGE', 'VENEER', 'IMPLANT']::work_type[],
     ARRAY['ZIRCONIA', 'PORCELAIN', 'METAL_CERAMIC']::material_type[]);

-- Conexión entre odontólogo y laboratorio
INSERT INTO dentist_laboratory_connections (dentist_id, laboratory_id, is_favorite) VALUES
    ('a0000000-0000-4000-a000-000000000002',
     'a0000000-0000-4000-a000-000000000003',
     true);

-- Paciente de prueba
INSERT INTO patients (id, dentist_id, first_name, last_name, identifier) VALUES
    ('a0000000-0000-4000-a000-000000000010',
     'a0000000-0000-4000-a000-000000000002',
     'María',
     'González',
     'DNI-12345678');

-- Orden de prueba
INSERT INTO orders (
    id,
    dentist_id,
    laboratory_id,
    patient_id,
    status,
    patient_name,
    priority,
    notes,
    due_date
) VALUES (
    'a0000000-0000-4000-a000-000000000020',
    'a0000000-0000-4000-a000-000000000002',
    'a0000000-0000-4000-a000-000000000003',
    'a0000000-0000-4000-a000-000000000010',
    'PENDING',
    'María González',
    'normal',
    'Corona de zirconia para pieza 16. Paciente con bruxismo leve.',
    CURRENT_DATE + INTERVAL '7 days'
);

-- Item de la orden
INSERT INTO order_items (order_id, work_type, teeth_numbers, material, shade, description) VALUES
    ('a0000000-0000-4000-a000-000000000020',
     'CROWN',
     ARRAY[16],
     'ZIRCONIA',
     'A2',
     'Corona completa de zirconia monolítica');

-- Historial de estado
INSERT INTO order_status_history (order_id, to_status, changed_by, notes) VALUES
    ('a0000000-0000-4000-a000-000000000020',
     'PENDING',
     'a0000000-0000-4000-a000-000000000002',
     'Orden enviada al laboratorio');

-- ===========================================
-- Mensaje de confirmación
-- ===========================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'OralSuite - Base de datos inicializada';
    RAISE NOTICE '===========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Tablas creadas:';
    RAISE NOTICE '  - users (usuarios)';
    RAISE NOTICE '  - dentist_profiles (perfiles odontólogos)';
    RAISE NOTICE '  - laboratory_profiles (perfiles laboratorios)';
    RAISE NOTICE '  - dentist_laboratory_connections';
    RAISE NOTICE '  - patients (pacientes)';
    RAISE NOTICE '  - orders (órdenes)';
    RAISE NOTICE '  - order_items (items de orden)';
    RAISE NOTICE '  - order_attachments (archivos)';
    RAISE NOTICE '  - order_status_history (historial)';
    RAISE NOTICE '  - conversations (chat)';
    RAISE NOTICE '  - messages (mensajes)';
    RAISE NOTICE '  - message_attachments';
    RAISE NOTICE '  - notifications';
    RAISE NOTICE '  - refresh_tokens';
    RAISE NOTICE '';
    RAISE NOTICE 'Usuarios de prueba:';
    RAISE NOTICE '  - admin@oralsuite.com / admin123';
    RAISE NOTICE '  - dentist@test.com / password123';
    RAISE NOTICE '  - lab@test.com / password123';
    RAISE NOTICE '';
    RAISE NOTICE '===========================================';
END $$;
