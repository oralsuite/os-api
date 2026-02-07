-- EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ENUMS

-- tipo de rol de usuario (ENUM)
CREATE TYPE tipo_rol_usuario AS ENUM('odontologo', 'laboratorio', 'admin', 'clinica');
--estados de orden
CREATE TYPE estado_orden AS ENUM (
    'borrador',        -- Borrador (no enviada)
    'pendiente',       -- Enviada, esperando aceptación
    'aceptada',        -- Aceptada por laboratorio
    'en_progreso',     -- En proceso de fabricación
    'lista',           -- Lista para retirar/enviar
    'enviada',         -- Enviada al odontólogo
    'entregada',       -- Entregada
    'cancelada'        -- Cancelada
);
-- tipos de trabajo
CREATE TYPE tipo_trabajo AS ENUM (
    'corona',           -- Corona
    'puente',           -- Puente
    'protesis',         -- Prótesis
    'implante',         -- Implante
    'carilla',          -- Carilla
    'inlay_onlay',      -- Inlay/Onlay
    'ortodoncia'        -- Ortodoncia
);
-- especialidades odontologicas
CREATE TYPE especialidad_odontologica AS ENUM (
    'general',              -- Odontología General
    'rehabilitador_oral',   -- Rehabilitador Oral
    'cirujano',             -- Cirujano
    'implantologo',         -- Implantólogo
    'ortodoncista',         -- Ortodoncista
    'odontopediatra',       -- Odontopediatra
    'periodoncista',        -- Periodoncista
    'endodoncista'          -- Endodoncista
);

-- TABLAS

-- TABLA rol_usuario
CREATE TABLE rol_usuario(
    id_rol_usuario serial primary key not null,
    nombre_rol tipo_rol_usuario not null unique,
    descripcion text
);

-- TABLA permiso
CREATE TABLE permiso(
    id_permiso serial primary key not null,
    nombre_permiso varchar(100) not null unique,
    descripcion text
);

-- TABLA permiso_rol_usuario
CREATE TABLE permiso_rol_usuario(
    id_rol_usuario integer not null,
    id_permiso integer not null,
    foreign key (id_permiso) references permiso(id_permiso) on delete cascade,
    foreign key (id_rol_usuario) references rol_usuario(id_rol_usuario) on delete cascade,
    primary key (id_rol_usuario, id_permiso)
);

-- TABLA clinica
CREATE TABLE clinica(
    id_clinica uuid primary key not null default uuid_generate_v4(),
    nombre varchar(255) not null,
    correo varchar(255) not null unique,
    telefono varchar(20) not null unique,
    contrasena varchar(255) not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz,
    deleted_at timestamptz
);

-- TABLA paciente
CREATE TABLE paciente(
    id_paciente uuid primary key not null default uuid_generate_v4(),
    id_clinica uuid not null,
    nombre varchar(100) not null,
    apellido varchar(100) not null,
    numero_documento varchar(20) not null unique,
    created_at timestamptz not null default now(),
    updated_at timestamptz,
    deleted_at timestamptz,
    foreign key (id_clinica) references clinica(id_clinica) on delete cascade
);

-- TABLA odontologo
CREATE TABLE odontologo(
    id_odontologo uuid primary key not null default uuid_generate_v4(),
    id_clinica uuid not null,
    nombre varchar(100) not null,
    apellido varchar(100) not null,
    correo varchar(255) unique,
    telefono varchar(20) unique,
    especialidad especialidad_odontologica not null,
    contrasena varchar(255) not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz, 
    deleted_at timestamptz,
    foreign key (id_clinica) references clinica(id_clinica) on delete cascade
);

-- TABLA laboratorio
CREATE TABLE laboratorio(
    id_laboratorio uuid primary key not null default uuid_generate_v4(),
    nombre_comercial varchar(255) not null,
    ciudad varchar(100) not null,
    correo varchar(255) not null unique,
    contrasena varchar(255) not null,
    telefono varchar(20) not null unique,
    nit varchar(20) not null unique,
    rut varchar(20) not null unique,
    created_at timestamptz not null default now(),
    updated_at timestamptz,
    deleted_at timestamptz
);

-- TABLA laboratorio_clinica
CREATE TABLE laboratorio_clinica(
    id_laboratorio_clinica serial primary key not null,
    id_laboratorio uuid not null,
    id_clinica uuid not null,
    foreign key (id_laboratorio) references laboratorio(id_laboratorio) on delete cascade,
    foreign key (id_clinica) references clinica(id_clinica) on delete cascade,
    unique (id_laboratorio, id_clinica)  
);

-- TABLA orden
CREATE TABLE orden(
    id_orden uuid primary key not null default uuid_generate_v4(),
    id_odontologo uuid not null,
    id_paciente uuid not null, 
    id_clinica uuid not null,
    id_laboratorio uuid not null,
    fecha_ingreso timestamptz not null default now(),
    fecha_entrega timestamptz,
    tipo_entrega varchar(50) not null,
    observaciones text,
    clase_trabajo tipo_trabajo not null,
    estado_orden estado_orden not null default 'borrador',
    created_at timestamptz not null default now(),
    updated_at timestamptz,
    deleted_at timestamptz,
    foreign key (id_odontologo) references odontologo(id_odontologo) on delete cascade,
    foreign key (id_paciente) references paciente(id_paciente) on delete cascade,
    foreign key (id_clinica) references clinica(id_clinica) on delete cascade,
    foreign key (id_laboratorio) references laboratorio(id_laboratorio) on delete cascade
);

-- TABLA archivo_orden
CREATE TABLE archivo_orden(
    id_archivo_orden uuid primary key not null default uuid_generate_v4(),
    id_orden uuid not null,
    nombre_archivo varchar(255) not null,
    url_archivo varchar(255) not null,
    fecha_vencimiento timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz,
    deleted_at timestamptz,
    foreign key (id_orden) references orden(id_orden) on delete cascade
);

-- TABLA grafico_orden
CREATE TABLE grafico_orden(
    id_grafico_orden uuid primary key not null default uuid_generate_v4(),
    id_orden uuid not null,
    nombre_grafico varchar(255) not null,
    foreign key (id_orden) references orden(id_orden) on delete cascade
);

-- TABLA admin_web
CREATE TABLE admin_web(
    id_admin_web uuid primary key not null default uuid_generate_v4(),
    id_rol_usuario integer not null,
    ultimo_acceso timestamptz,
    nombre varchar(100) not null,
    apellido varchar(100) not null,
    correo varchar(255) not null unique,
    contrasena varchar(255) not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz,
    deleted_at timestamptz,
    foreign key (id_rol_usuario) references rol_usuario(id_rol_usuario) on delete cascade
);
