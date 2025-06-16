export interface AppManifest {
  name: string;
  version: string;
  description: string;
  author: string;
  license: string;
  requires: string[];
  // db files paths relative to app root
  db: string[];
  // rights
}
