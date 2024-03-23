import {
  type FirestoreDataConverter,
  type WithFieldValue,
  type DocumentData,
  type QueryDocumentSnapshot,
  collection,
  doc,
} from 'firebase/firestore';

import { db } from './firebase';
import type { CombinedReparation } from './models';

const converter = <T>(): FirestoreDataConverter<T> => ({
  toFirestore: (data: WithFieldValue<T>): DocumentData => data as DocumentData,
  fromFirestore: (snap: QueryDocumentSnapshot) => snap.data() as T,
});

const typedCollection = <T>(collectionPath: string) =>
  collection(db, collectionPath).withConverter(converter<T>());

const typedDocument = <T>(collectionPath: string, documentId?: string) => {
  if (!documentId) {
    return doc(collection(db, collectionPath)).withConverter(converter<T>());
  }
  return doc(db, collectionPath, documentId).withConverter(converter<T>());
};

const typedDb = {
  combinedReparations: typedCollection<CombinedReparation>('reparations'),
  combinedReparation: (combinedReparationId?: string) =>
    typedDocument<CombinedReparation>('reparations', combinedReparationId),
};

export { typedDb };
