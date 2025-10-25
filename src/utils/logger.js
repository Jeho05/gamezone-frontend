/**
 * Système de logging intelligent
 * N'affiche les logs qu'en développement
 */

const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost';

class Logger {
  constructor(context = 'App') {
    this.context = context;
  }

  log(...args) {
    if (isDevelopment) {
      console.log(`[${this.context}]`, ...args);
    }
  }

  info(...args) {
    if (isDevelopment) {
      console.info(`[${this.context}] ℹ️`, ...args);
    }
  }

  warn(...args) {
    if (isDevelopment) {
      console.warn(`[${this.context}] ⚠️`, ...args);
    }
  }

  error(...args) {
    // Les erreurs sont toujours logguées
    console.error(`[${this.context}] ❌`, ...args);
  }

  success(...args) {
    if (isDevelopment) {
      console.log(`[${this.context}] ✅`, ...args);
    }
  }

  debug(...args) {
    if (isDevelopment) {
      console.debug(`[${this.context}] 🐛`, ...args);
    }
  }

  table(data) {
    if (isDevelopment) {
      console.table(data);
    }
  }

  group(label) {
    if (isDevelopment) {
      console.group(`[${this.context}] ${label}`);
    }
  }

  groupEnd() {
    if (isDevelopment) {
      console.groupEnd();
    }
  }
}

/**
 * Créer un logger avec un contexte spécifique
 * @param {string} context - Le nom du contexte (ex: 'API', 'Dashboard', 'Auth')
 * @returns {Logger}
 */
export function createLogger(context) {
  return new Logger(context);
}

// Logger par défaut
export default new Logger('App');
