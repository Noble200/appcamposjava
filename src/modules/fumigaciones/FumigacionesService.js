// src/modules/fumigaciones/FumigacionesService.js
import { 
    collection, 
    getDocs, 
    doc, 
    getDoc, 
    addDoc, 
    updateDoc, 
    deleteDoc,
    query,
    where,
    orderBy
  } from 'firebase/firestore';
  import { db } from '../../config/firebaseConfig';
  
  const COLLECTION_NAME = 'fumigaciones';
  
  // Obtener todas las fumigaciones
  export const getFumigaciones = async () => {
    try {
      const fumigacionesCollection = collection(db, COLLECTION_NAME);
      const q = query(fumigacionesCollection, orderBy('fecha', 'desc'));
      const fumigacionesSnapshot = await getDocs(q);
      
      return fumigacionesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        fecha: doc.data().fecha?.toDate ? doc.data().fecha.toDate() : doc.data().fecha
      }));
    } catch (error) {
      console.error('Error al obtener fumigaciones:', error);
      throw error;
    }
  };
  
  // Obtener fumigaciones por campo
  export const getFumigacionesPorCampo = async (campoId) => {
    try {
      const fumigacionesCollection = collection(db, COLLECTION_NAME);
      const q = query(
        fumigacionesCollection, 
        where('campoId', '==', campoId),
        orderBy('fecha', 'desc')
      );
      
      const fumigacionesSnapshot = await getDocs(q);
      
      return fumigacionesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        fecha: doc.data().fecha?.toDate ? doc.data().fecha.toDate() : doc.data().fecha
      }));
    } catch (error) {
      console.error('Error al obtener fumigaciones por campo:', error);
      throw error;
    }
  };
  
  // Obtener una fumigación por ID
  export const getFumigacionById = async (id) => {
    try {
      const fumigacionDoc = doc(db, COLLECTION_NAME, id);
      const fumigacionSnapshot = await getDoc(fumigacionDoc);
      
      if (fumigacionSnapshot.exists()) {
        const data = fumigacionSnapshot.data();
        return {
          id: fumigacionSnapshot.id,
          ...data,
          fecha: data.fecha?.toDate ? data.fecha.toDate() : data.fecha
        };
      } else {
        throw new Error('Fumigación no encontrada');
      }
    } catch (error) {
      console.error('Error al obtener fumigación por ID:', error);
      throw error;
    }
  };
  
  // Crear una nueva fumigación
  export const createFumigacion = async (fumigacionData) => {
    try {
      const fumigacionesCollection = collection(db, COLLECTION_NAME);
      const docRef = await addDoc(fumigacionesCollection, {
        ...fumigacionData,
        createdAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error al crear fumigación:', error);
      throw error;
    }
  };
  
  // Actualizar una fumigación existente
  export const updateFumigacion = async (id, fumigacionData) => {
    try {
      const fumigacionDoc = doc(db, COLLECTION_NAME, id);
      await updateDoc(fumigacionDoc, {
        ...fumigacionData,
        updatedAt: new Date()
      });
      return id;
    } catch (error) {
      console.error('Error al actualizar fumigación:', error);
      throw error;
    }
  };
  
  // Eliminar una fumigación
  export const deleteFumigacion = async (id) => {
    try {
      const fumigacionDoc = doc(db, COLLECTION_NAME, id);
      await deleteDoc(fumigacionDoc);
      return id;
    } catch (error) {
      console.error('Error al eliminar fumigación:', error);
      throw error;
    }
  };
  
  // Cambiar estado de fumigación
  export const cambiarEstadoFumigacion = async (id, nuevoEstado) => {
    try {
      const fumigacionDoc = doc(db, COLLECTION_NAME, id);
      await updateDoc(fumigacionDoc, {
        estado: nuevoEstado,
        updatedAt: new Date()
      });
      return id;
    } catch (error) {
      console.error('Error al cambiar estado de fumigación:', error);
      throw error;
    }
  };