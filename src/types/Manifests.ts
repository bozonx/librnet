import { EntityTypes } from './types.js';

// Manifest of a service or app
export interface EntityManifest {
  type: EntityTypes;
  // Unique name
  name: string;
  // If not set, it will be the same as the package version
  version: string;
  // Path to the package
  distDir: string;
  // name in different languages
  nameLocale?: Record<string, string>;
  // description in different languages
  description?: Record<string, string>;
  // If not set, it will be the same as the package author
  author?: string;
  // If not set, it will be the same as the package license
  license?: string;
  // homepage of the entity
  homepage?: string;
  // repository of the entity
  repository?: string;
  // bugs of the entity
  bugs?: string;
  requireDriver?: string[];
  requireService?: string[];
}

export interface AppManifest extends EntityManifest {
  type: EntityTypes.app;
}

export interface ServiceManifest extends EntityManifest {
  type: EntityTypes.service;
}

export interface DriverManifest extends EntityManifest {
  type: EntityTypes.driver;
}

export interface IoManifest extends EntityManifest {
  type: EntityTypes.io;
}
