// src/modules/usuarios/UsuariosService.js
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
  
  const COLLECTION_NAME = 'usuarios';
  
  // Obtener todos los usuarios
  export const getUsuarios = async () => {
    try {
      const usuariosCollection = collection(db, COLLECTION_NAME);
      const usuariosSnapshot = await getDocs(usuariosCollection);
      
      return usuariosSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      throw error;
    }
  };
  
  // Obtener un usuario por ID
  export const getUsuarioById = async (id) => {
    try {
      const usuarioDoc = doc(db, COLLECTION_NAME, id);
      const usuarioSnapshot = await getDoc(usuarioDoc);
      
      if (usuarioSnapshot.exists()) {
        return {
          id: usuarioSnapshot.id,
          ...usuarioSnapshot.data()
        };
      } else {
        throw new Error('Usuario no encontrado');
      }
    } catch (error) {
      console.error('Error al obtener usuario por ID:', error);
      throw error;
    }
  };
  
  // Crear un nuevo usuario
  export const createUsuario = async (usuarioData) => {
    try {
      // Verificar si el nombre de usuario ya existe
      const usuariosCollection = collection(db, COLLECTION_NAME);
      const q = query(usuariosCollection, where('username', '==', usuarioData.username));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        throw new Error('El nombre de usuario ya está en uso');
      }
      
      const docRef = await addDoc(usuariosCollection, {
        ...usuarioData,
        createdAt: new Date()
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Error al crear usuario:', error);
      throw error;
    }
  };
  
  // Actualizar un usuario existente
  export const updateUsuario = async (id, usuarioData) => {
    try {
      // Si se está actualizando el nombre de usuario, verificar que no exista
      if (usuarioData.username) {
        const usuariosCollection = collection(db, COLLECTION_NAME);
        const q = query(
          usuariosCollection, 
          where('username', '==', usuarioData.username),
          where('__name__', '!=', id)
        );
        
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          throw new Error('El nombre de usuario ya está en uso');
        }
      }
      
      const usuarioDoc = doc(db, COLLECTION_NAME, id);
      await updateDoc(usuarioDoc, {
        ...usuarioData,
        updatedAt: new Date()
      });
      
      return id;
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      throw error;
    }
  };
  
  // Eliminar un usuario
  export const deleteUsuario = async (id) => {
    try {
      const usuarioDoc = doc(db, COLLECTION_NAME, id);
      await deleteDoc(usuarioDoc);
      return id;
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      throw error;
    }
  };
  
  // Verificar credenciales de usuario (login)
  export const verificarCredenciales = async (username, password) => {
    try {
      const usuariosCollection = collection(db, COLLECTION_NAME);
      const q = query(
        usuariosCollection,
        where('username', '==', username),
        where('password', '==', password)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        return {
          id: querySnapshot.docs[0].id,
          ...userData
        };
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error al verificar credenciales:', error);
      throw error;
    }
  };