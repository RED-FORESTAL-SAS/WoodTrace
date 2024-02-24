export interface Especie {
    /** Código que devuelve la IA al hacer el análisis. */
    codigo: number;
    familia: string;
    genero: string[];
    especie: string[];
    nombreComun: string[];
    edafoclimatico: object;
    hojas: object;
    usos: object;
    amenaza: object;
  }
  
  export const ESPECIES: Especie[] = [
    {
      codigo: 1,
      familia: "Fabaceae",
      genero: ["Samanea", "Albizia"],
      especie: ["saman", "saman"],
      nombreComun: ["Samán", "Campano"],
      hojas: {
        nervadura:"Paralelinervia",
        disposicionTallo:"alterna",
        forma:"Ovalada",
        borde: "Dentado",
        duracion: "perennes"
      },
      edafoclimatico: {
        suelo: "francoarenoso",
        temperatura: {
            minima: 15,
            maxima: 30, 
        },
        altura: {
            minima: 500,
            maxima: 1500, 
        },
      },
      usos: {
        madera: {
            construccion:["columna", "vigas"], 
            carpinteria:["mesas", "sillas"],
            propiedadesFisicas:{
                densidadBasica: 30,
                descripcionDensidad: "Pesada",
                Dureza: 40,
                descripcionDureza: "Dura",
            },
            propiedadesMecanicas:{
                resistenciaMediaFlexión: 30,
                cizallamiento: 20,
                resistenciaCompresionParalelaFibras: 40,
                resistenciaCompresionPerpendicularFibras: 60,
            },
        },
        medicina:["fiebre","diarrea"],
        industria:{
            cosmeticos:["rubores", "esmaltes"], 
            quimicos:["barniz", "pintura"],
            alimentos:["avena", "café"],
            textil: ["hilos"],
        },
      },
      amenaza: {
        pais:[
            {
                colombia:{
                    nacional: {
                        norma:"",
                        categoria:"",
                        descripcion:"",
                    },
                    regional: {
                        entidad:[ 
                            {
                            entidad: "CORTOLIMA",
                            norma:"resolución 1025 de 2024",
                            categoria:"",
                            descripcion:"",
                            },
                        ],
                    }
                }
            },
        ],
        cites:{
            categoria:"III",
            descripcion:"",
        },
      },
    },
  ];
  