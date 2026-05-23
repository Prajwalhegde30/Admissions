import * as fs from 'fs';
import * as path from 'path';

const controllerPath = path.join(__dirname, 'dist/modules/applications/applications.controller.ts');
const servicePath = path.join(__dirname, 'dist/modules/applications/applications.service.ts');

// We'll use multi_replace_file_content to edit them instead.
