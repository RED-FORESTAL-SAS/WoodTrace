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
    fenologia: object;
    fitosanitario: object;
    amenaza: object;
    distribucionGeogragica: object;
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
        suelo: ["francoarenoso"],
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
            construccion:["Columna", "Vigas"],
            carpinteria:["Mesas", "Sillas"],
            propiedadesOrganolepticas:{
                olor: "Cuando se corta huele feo",
                Color:"claro",
                veteado:"Tiene una veta en forma de llamas muy bonita",
                grano:"Recto",
                Textura:"Fina"
            },
            propiedadesFisicas:{
                densidadBasica: 30,
                descripcionDensidad: "Pesada",
                Dureza: 40,
                descripcionDureza: "Dura",
                direccionFibras:"lineal"
            },
            propiedadesMecanicas:{
                resistenciaMediaFlexión: 30,
                cizallamiento: 20,
                traccion: 30,
                resistenciaCompresionParalelaFibras: 40,
                resistenciaCompresionPerpendicularFibras: 60,
            },
            trabajabilidad:"Es una madera que se puede cortar fácil",
            precioM3: {
                colombia: {
                    santander: 900000,
                }
            }
        },
        noMaderables:{
            raiz:{
                usos:["alcohol"],
                unidadVenta:["galon"],
                precio:{
                    colombia:{
                        Caqueta: 20000,
                    }
                }
            },
            exudado:[""],
            corteza:[""],
            flor: [""],
            fruto:[""],
            hojas:[""],
        },
        medicina:["fiebre","diarrea"],
        industria:{
            cosmeticos:["rubores", "esmaltes"], 
            quimicos:["barniz", "pintura"],
            alimentos:["avena", "café"],
            textil: ["hilos"],
        },
      },
      fenologia:[
        {
            pais: "Colombia",
            mesFloracion:["enero", "febrero","julio"],
            mesFructificacion:["agosto", "septiembre","octubre"],
        },
      ],
      fitosanitario: {
        plagas:{
            nombreComun:["saltamontes", "barrenador"],
            nombreCientifico:["saltamotis usis", "cursis cursires"],
            descripcion:["se come las horas", "se comer la madera"],
            tratamiento:["a punta de pata","a punta de caricias"]
        },
        enfermedades:{
            nombreComun:["muerte descendente", "furies"],
            nombreCientifico:["baterialus milonga", "agulis fases"],
            descripcion:["pudre las ramas", "pudre el fruto"],
            tratamiento:["a punta de amor","a punta de besos"]
        },
      },
      amenaza: {
        pais:[
            {
                nombre: "Colombia",
                nacional: {
                    norma:"",
                    categoria:"",
                    descripcion:"",
                },
                regional: {
                    entidad:[ 
                        {
                        nombreEntidad: "CORTOLIMA",
                        norma:"Avuerdo 1123 de 2019",
                        categoria:"SS",
                        descripcion:"Se restringe su venta",
                        },
                    ],
                },
            },
        ],
        cites:{
            categoria:"III",
            descripcion:"No se puede vender en todo el mundo",
        },
      },
      distribucionGeogragica:{
        cordenadaX: ["4.6465034"],
        cordenadaY: ["-74.0743159"]
      },
    },
  ];
  