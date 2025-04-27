// src/modules/campos/CamposService.js
import { 
    collection, 
    getDocs, 
    doc, 
    getDoc, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    query, 
    where 
  } from 'firebase/firestore';
  import { db } from '../../config/firebaseConfig';
  
  const COLLECTION_NAME = 'campos';
  
  // Obtener todos los campos
  export const getCampos = async () => {
    try {
      const camposCollection = collection(db, COLLECTION_NAME);
      const camposSnapshot = await getDocs(camposCollection);
      return camposSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error al obtener campos:', error);
      throw error;
    }
  };
  
  // Obtener un campo por ID
  export const getCampoById = async (id) => {
    try {
      const campoDoc = doc(db, COLLECTION_NAME, id);
      const campoSnapshot = await getDoc(campoDoc);
      
      if (campoSnapshot.exists()) {
        return {
          id: campoSnapshot.id,
          ...campoSnapshot.data()
        };
      } else {
        throw new Error('Campo no encontrado');
      }
    } catch (error) {
      console.error('Error al obtener campo por ID:', error);
      throw error;
    }
  };
  
  // Crear un nuevo campo
  export const createCampo = async (campoData) => {
    try {
      const camposCollection = collection(db, COLLECTION_NAME);
      const docRef = await addDoc(camposCollection, {
        ...campoData,
        createdAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error al crear campo:', error);
      throw error;
    }
  };
  
  // Actualizar un campo existente
  export const updateCampo = async (id, campoData) => {
    try {
      const campoDoc = doc(db, COLLECTION_NAME, id);
      await updateDoc(campoDoc, {
        ...campoData,
        updatedAt: new Date()
      });
      return id;
    } catch (error) {
      console.error('Error al actualizar campo:', error);
      throw error;
    }
  };
  
  // Eliminar un campo
  export const deleteCampo = async (id) => {
    try {
      const campoDoc = doc(db, COLLECTION_NAME, id);
      await deleteDoc(campoDoc);
      return id;
    } catch (error) {
      console.error('Error al eliminar campo:', error);
      throw error;
    }
  };