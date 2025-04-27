// src/utils/initializeDatabase.js
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, where } from 'firebase/firestore';

// Reemplaza con tu configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyD41U09nX92noX5eIySXd6wbvXbYGkS13Q",
    authDomain: "projecttest-c14e2.firebaseapp.com",
    projectId: "projecttest-c14e2",
    storageBucket: "projecttest-c14e2.firebasestorage.app",
    messagingSenderId: "331612783725",
    appId: "1:331612783725:web:516985c2da5b02fb936b64",
    measurementId: "G-B0JFMZ7KR0"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const initializeDatabase = async () => {
  console.log("Iniciando la configuración de la base de datos...");
  
  try {
    // Verificar si ya existe un usuario administrador
    const usuariosRef = collection(db, 'usuarios');
    const adminQuery = query(usuariosRef, where('tipo', '==', 'administrador'));
    const adminSnapshot = await getDocs(adminQuery);
    
    if (adminSnapshot.empty) {
      // Crear usuario administrador
      const adminData = {
        nombre: "Administrador Principal",
        username: "admin",
        password: "admin123", // Cambiar por una contraseña segura en producción
        tipo: "administrador",
        permisos: ["todos"],
        createdAt: new Date()
      };
      
      const adminRef = await addDoc(usuariosRef, adminData);
      console.log("Usuario administrador creado con ID:", adminRef.id);
    } else {
      console.log("Ya existe un usuario administrador");
    }
    
    // Crear algunos campos de ejemplo
    const camposRef = collection(db, 'campos');
    const camposData = [
      {
        nombre: "Campo Norte",
        ubicacion: "Km 20 Ruta 16",
        superficie: 150,
        tipoCultivo: "Maíz",
        tipoSuelo: "Arcilloso",
        fechaSiembra: "2025-03-15",
        fechaCosecha: "2025-08-20",
        densidadSiembra: "80000 plantas/ha",
        fertilizantesAplicados: "Nitrógeno (100 kg/ha), Fósforo (50 kg/ha)",
        controlPlagas: "Insecticida X (2 L/ha, 2025-04-10)",
        listaEmpleados: "Juan Pérez, Roberto Gómez",
        almacenesDepositos: "Almacén Principal",
        silosRodados: "Silo 1, Silo 2",
        energia: "Red eléctrica, Generador diesel",
        observaciones: "Buen rendimiento en años anteriores",
        createdAt: new Date()
      },
      {
        nombre: "Campo Sur",
        ubicacion: "Km 45 Ruta 22",
        superficie: 200,
        tipoCultivo: "Soja",
        tipoSuelo: "Franco",
        fechaSiembra: "2025-02-10",
        fechaCosecha: "2025-06-15",
        densidadSiembra: "350000 plantas/ha",
        fertilizantesAplicados: "Complejo NPK (150 kg/ha)",
        controlPlagas: "Fungicida Y (1.5 L/ha, 2025-03-20)",
        listaEmpleados: "Carlos López, María Rodríguez",
        almacenesDepositos: "Depósito Sur",
        silosRodados: "Silo 3",
        energia: "Paneles solares",
        observaciones: "Rotación con trigo en invierno",
        createdAt: new Date()
      }
    ];
    
    for (const campo of camposData) {
      const campoRef = await addDoc(camposRef, campo);
      console.log("Campo creado con ID:", campoRef.id);
    }
    
    // Crear algunos almacenes de ejemplo
    const almacenesRef = collection(db, 'almacenes');
    const almacenesData = [
      {
        nombre: "Almacén Principal",
        ubicacion: "Sector Norte del Campo Norte",
        campoId: "particular",
        responsable: "José Martínez",
        tipo: "Galpón",
        capacidad: "500 m²",
        condicionesAlmacenamiento: "Seco, ventilado",
        createdAt: new Date()
      },
      {
        nombre: "Depósito Sur",
        ubicacion: "Entrada Campo Sur",
        campoId: "particular",
        responsable: "Ana Fernández",
        tipo: "Depósito",
        capacidad: "300 m²",
        condicionesAlmacenamiento: "Temperatura controlada",
        createdAt: new Date()
      }
    ];
    
    const almacenesCreados = [];
    for (const almacen of almacenesData) {
      const almacenRef = await addDoc(almacenesRef, almacen);
      almacenesCreados.push({ id: almacenRef.id, ...almacen });
      console.log("Almacén creado con ID:", almacenRef.id);
    }
    
    // Crear algunos productos de ejemplo
    const productosRef = collection(db, 'productos');
    const productosData = [
      {
        nombre: "Fertilizante NPK",
        categoria: "Fertilizante",
        cantidad: 1500,
        unidadMedida: "kg",
        almacenId: almacenesCreados[0].id,
        stockMinimo: 200,
        fechaVencimiento: "2026-12-31",
        lote: "F12345",
        createdAt: new Date()
      },
      {
        nombre: "Insecticida Clorpirifos",
        categoria: "Insecticida",
        cantidad: 100,
        unidadMedida: "L",
        almacenId: almacenesCreados[0].id,
        stockMinimo: 20,
        fechaVencimiento: "2026-06-30",
        lote: "I78901",
        createdAt: new Date()
      },
      {
        nombre: "Semilla Maíz Híbrido",
        categoria: "Semilla",
        cantidad: 500,
        unidadMedida: "kg",
        almacenId: almacenesCreados[1].id,
        stockMinimo: 100,
        fechaVencimiento: "2025-09-30",
        lote: "S34567",
        createdAt: new Date()
      }
    ];
    
    for (const producto of productosData) {
      const productoRef = await addDoc(productosRef, producto);
      console.log("Producto creado con ID:", productoRef.id);
    }
    
    // Crear algunas fumigaciones de ejemplo
    const fumigacionesRef = collection(db, 'fumigaciones');
    const fumigacionesData = [
      {
        campoId: "CAMPO_ID_1", // Reemplazar con ID real después de crear campos
        fumigador: "Juan Pérez",
        fecha: new Date("2025-04-15"),
        producto: "Insecticida Clorpirifos",
        cantidad: 5,
        unidad: "L",
        hectareas: 50,
        estado: "Completada",
        observaciones: "Aplicación para control de plagas en sector norte",
        createdAt: new Date()
      },
      {
        campoId: "CAMPO_ID_2", // Reemplazar con ID real después de crear campos
        fumigador: "Roberto Gómez",
        fecha: new Date("2025-05-10"),
        producto: "Fungicida Mancozeb",
        cantidad: 3,
        unidad: "L",
        hectareas: 30,
        estado: "Pendiente",
        observaciones: "Programada para control preventivo",
        createdAt: new Date()
      }
    ];
    
    for (const fumigacion of fumigacionesData) {
      const fumigacionRef = await addDoc(fumigacionesRef, fumigacion);
      console.log("Fumigación creada con ID:", fumigacionRef.id);
    }
    
    // Crear algunas compras de ejemplo
    const comprasRef = collection(db, 'compras');
    const comprasData = [
      {
        codigo: "OC-001",
        proveedor: "AgroInsumos S.A.",
        contactoProveedor: "Luis González - 555-1234",
        fechaEmision: new Date("2025-03-01"),
        fechaRecepcion: new Date("2025-03-10"),
        condicionesPago: "30 días",
        almacenDestino: almacenesCreados[0].id,
        estado: "Completado",
        productosComprados: [
          {
            id: "prod1",
            nombre: "Fertilizante NPK",
            categoria: "Fertilizante",
            cantidad: 500,
            unidadMedida: "kg",
            precioUnitario: 2.5,
            subtotal: 1250
          },
          {
            id: "prod2",
            nombre: "Insecticida Clorpirifos",
            categoria: "Insecticida",
            cantidad: 20,
            unidadMedida: "L",
            precioUnitario: 15,
            subtotal: 300
          }
        ],
        total: 1550,
        observaciones: "Entrega en buenas condiciones",
        createdAt: new Date()
      },
      {
        codigo: "OC-002",
        proveedor: "Semillas Express",
        contactoProveedor: "María López - 555-5678",
        fechaEmision: new Date("2025-04-05"),
        fechaRecepcion: null,
        condicionesPago: "Contado",
        almacenDestino: almacenesCreados[1].id,
        estado: "Pendiente",
        productosComprados: [
          {
            id: "prod3",
            nombre: "Semilla Maíz Híbrido",
            categoria: "Semilla",
            cantidad: 200,
            unidadMedida: "kg",
            precioUnitario: 8,
            subtotal: 1600
          }
        ],
        total: 1600,
        observaciones: "Entregar en horario de mañana",
        createdAt: new Date()
      }
    ];
    
    for (const compra of comprasData) {
      const compraRef = await addDoc(comprasRef, compra);
      console.log("Compra creada con ID:", compraRef.id);
    }
    
    console.log("Base de datos inicializada correctamente");
  } catch (error) {
    console.error("Error al inicializar la base de datos:", error);
  }
};

export default initializeDatabase;