import {
  type FirestoreDataConverter,
  type WithFieldValue,
  type DocumentData,
  type QueryDocumentSnapshot,
  collection,
  doc,
} from 'firebase/firestore';

import { db } from './firebase';
import type { Item } from '../models/item';
import type { Reparation } from '../models/reparation';
import type { User } from '../models/user';

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
  users: typedCollection<User>('users'),
  user: (userId?: string) => typedDocument<User>('users', userId),
  items: typedCollection<Item>('items'),
  item: (itemId?: string) => typedDocument<Item>('items', itemId),
  reparations: typedCollection<Reparation>('reparations'),
  reparation: (reparationId?: string) =>
    typedDocument<Reparation>('reparations', reparationId),
};

export { typedDb };
