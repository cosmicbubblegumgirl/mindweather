const DATABASE_NAME = "mindweather-notebook";
const STORE_NAME = "files";
const DATABASE_VERSION = 1;

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) database.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("The notebook file store could not be opened."));
  });
}

async function runTransaction<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, mode);
    const request = action(transaction.objectStore(STORE_NAME));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("The notebook file action could not be completed."));
    transaction.oncomplete = () => database.close();
    transaction.onerror = () => {
      database.close();
      reject(transaction.error ?? new Error("The notebook file action could not be completed."));
    };
  });
}

export const notebookFileService = {
  put(id: string, file: File) {
    return runTransaction("readwrite", (store) => store.put(file, id));
  },

  get(id: string) {
    return runTransaction<File | undefined>("readonly", (store) => store.get(id));
  },

  remove(id: string) {
    return runTransaction("readwrite", (store) => store.delete(id));
  },

  clear() {
    if (typeof window === "undefined" || !window.indexedDB) return Promise.resolve();
    return runTransaction("readwrite", (store) => store.clear()).then(() => undefined);
  },
};
