const products = [
        {
            id: 1,
            name: "SUMO Tablet",
            rate: "₹132.35",
            MRP : "₹179" ,
            pack : "1 X 15" , 
            image: "image.png"
        },

        {
            id: 2,
            name: "FLEXON MR Tablet",
            rate: "₹25.98",
            MRP : "₹31.40" ,
            pack : "1 X 10" , 
            image: "image copy.png"
        },

        {
            id : 3 ,
            name: "KETROL-DT Tablet",
            rate: "₹136.00",
            MRP : "₹177.25" ,
            pack : "1 X 15" , 
            image: "image copy 2.png"
        } , 

        {
            id : 4 ,
            name: "WYSOLONE 10mg Tablet",
            rate: "₹16.12",
            MRP : "₹20.29" ,
            pack : "1 X 15" , 
            image: "image copy 3.png"
        } , 

        {
    id: 5,
    name: "WYSOLONE 5mg Tablet",
            rate: "₹9.37",
            MRP : "₹11.54" ,
            pack : "1 X 15" , 
            image: "image copy 4.png"
},

{
    id: 6,
    name: "BETONOVATEN N Ointment",
            rate: "₹49.97",
            MRP : "₹66.85" ,
            pack : "25g Tube" , 
            image: "image copy 5.png"
},

{
    id: 7,
    name: "DYNAPAR Injection",
            rate: "₹27.78",
            MRP : "₹43.83" ,
            pack : "1ml Glass Ampoule" , 
            image: "image copy 6.png"
},

{
    id: 8,
    name: "FOLVITE Tablet",
            rate: "₹64.00",
            MRP : "₹77.42" ,
            pack : "1 X 45" , 
            image: "image copy 7.png"
},

{
    id: 9,
    name: "MEFTAL SPAS Tablet",
            rate: "₹38.59",
            MRP : "₹55.00" ,
            pack : "1 X 10" , 
            image: "image copy 8.png"
},

{
    id: 10,
    name: "MEFTAL FORTE Tablet",
            rate: "₹31.00",
            MRP : "₹46.00" ,
            pack : "1 X 10" , 
            image: "image copy 9.png"
},

{
    id: 11,
    name: "ZANOCIN OZ Tablet",
            rate: "₹128.00",
            MRP : "₹185.00" ,
            pack : "1 X 10" , 
            image: "image copy 10.png"
},

{
    id: 12,
    name: "OXALGIN DP Tablet",
            rate: "₹103.25",
            MRP : "₹148.10" ,
            pack : "1 X 15" , 
            image: "image copy 11.png"
},

{
    id: 13,
    name: "CIPLOX 500 Tablet",
            rate: "₹35.98",
            MRP : "₹48.38" ,
            pack : "1 X 10" , 
            image: "image copy 12.png"
},

{
    id: 14,
    name: "CIPLOX TZ Tablet",
            rate: "₹134.00",
            MRP : "₹207.57" ,
            pack : "1 X 10" , 
            image: "image copy 13.png"
},

{
    id: 15,
    name: "CIPLACTIN Tablet",
            rate: "₹43.50",
            MRP : "₹65.25" ,
            pack : "1 X 15" , 
            image: "image copy 14.png"
},

{
    id: 16,
    name: "GELUSIN MPS SYRUP",
            rate: "₹117.50",
            MRP : "₹185.09" ,
            pack : "200 ml Bottle" , 
            image: "image copy 15.png"
},

{
    id: 17,
    name: "EVION 400 Capsule",
            rate: "₹69.95",
            MRP : "₹95.55" ,
            pack : "1 X 20" , 
            image: "image copy 16.png"
},

{
    id: 18,
    name: "QUADRIDERM RF 5gm",
            rate: "₹56.00",
            MRP : "₹89.58" ,
            pack : "5gm Tube" , 
            image: "image copy 17.png"
},

{
    id: 19,
    name: "ZERODOL SPAS Tablet",
            rate: "₹143.00",
            MRP : "₹174.95" ,
            pack : "1 X 10" , 
            image: "image copy 18.png"
},

{
    id: 20,
    name: "ZERODOL-P Tablet",
            rate: "₹59.50",
            MRP : "₹77.00" ,
            pack : "1 X 10" , 
            image: "image copy 19.png"
},

{
    id: 21,
    name: "MONOCEF 1GM Dry Vial",
            rate: "₹29.00",
            MRP : "₹71.08" ,
            pack : "10ML" , 
            image: "image copy 20.png"
},

{
    id: 22,
    name: "MONOCEF 500mg Dry Vial",
            rate: "₹34.00",
            MRP : "₹57.29" ,
            pack : "10ML" , 
            image: "image copy 21.png"
},

{
    id: 23,
    name: "NEUROBION FORTE Tablet",
            rate: "₹38.75",
            MRP : "₹46.10" ,
            pack : "1 X 30" , 
            image: "image copy 22.png"
},

{
    id: 24,
    name: "PANTOP IV",
            rate: "₹21.85",
            MRP : "₹57.48" ,
            pack : "10ML" , 
            image: "image copy 23.png"
},

{
    id: 25,
    name: "DEXORANGE PLUS SYRUP",
            rate: "₹139.95",
            MRP : "₹211.00" ,
            pack : "200ML Glass Bottle " , 
            image: "image copy 24.png"
},

{
    id: 26,
    name: "LIV 52 Tablet",
            rate: "₹181.25",
            MRP : "₹220.00" ,
            pack : "100 Tablets per Bottle" , 
            image: "image copy 25.png"
},

{
    id: 27,
    name: "LIV 52 DS Tablet",
            rate: "₹239.45",
            MRP : "₹300.00" ,
            pack : "60 Tablets per Bottle" , 
            image: "image copy 26.png"
},

{
    id: 28,
    name: "LIV 52 SYRUP",
            rate: "₹197.98",
            MRP : "₹250.00" ,
            pack : "200 ml Bottle" , 
            image: "image copy 29.png"
},

{
    id: 29,
    name: "LIV 52 SYRUP",
            rate: "₹109.25",
            MRP : "₹140.00" ,
            pack : "100 ml Bottle" , 
            image: "image copy 28.png"
},

{
    id: 30,
    name: "LIV 52 DS SYRUP",
            rate: "₹165.25",
            MRP : "₹220.00" ,
            pack : "100 ml Bottle" , 
            image: "image copy 30.png"
},

{
    id: 31,
    name: "LIV 52 DS SYRUP",
            rate: "₹283.58",
            MRP : "₹375.00" ,
            pack : "200 ml Bottle" , 
            image: "image copy 27.png"
},

{
    id: 32,
    name: "PANTOP 40MG Tablet",
            rate: "₹122.25",
            MRP : "₹170.00" ,
            pack : "1 X 15" , 
            image: "image copy 31.png"
},

{
    id: 33,
    name: "ZIFI 200MG Tablet",
            rate: "₹78.59",
            MRP : "₹111.43" ,
            pack : "1 X 10" , 
            image: "image copy 32.png"
},

{
    id: 34,
    name: "MOXIKIND CV 375 Tablet",
            rate: "₹134.98",
            MRP : "₹178.52" ,
            pack : "1 X 10" , 
            image: "image copy 33.png"
},

{
    id: 35,
    name: "MOXIKIND CV 625 Tablet",
            rate: "₹138.78",
            MRP : "₹195.16" ,
            pack : "1 X 10" , 
            image: "image copy 34.png"
},

{
    id: 36,
    name: "AMLOKIND-AT Tablet",
            rate: "₹45.98",
            MRP : "₹59.34" ,
            pack : "1 X 15" , 
            image: "image copy 35.png"
},

{
    id: 37,
    name: "TELMIKIND-40 Tablet",
            rate: "₹33.25",
            MRP : "₹44.01" ,
            pack : "1 X 10" , 
            image: "image copy 36.png"
},

{
    id: 38,
    name: "MOX 250 Capsule",
            rate: "₹33.45",
            MRP : "₹41.66" ,
            pack : "1 X 15" , 
            image: "image copy 37.png"
},

{
    id: 39,
    name: "MOX 500 Capsule",
            rate: "₹92.61",
            MRP : "₹125.62" ,
            pack : "1 X 15" , 
            image: "image copy 38.png"
},

{
    id: 40,
    name: "BECOSULES Capsule",
            rate: "₹52.00",
            MRP : "₹62.37" ,
            pack : "1 X 20" , 
            image: "image copy 39.png"
},

{
    id: 41,
    name: "ZIFI-O Tablet",
            rate: "₹161.65",
            MRP : "₹222.20" ,
            pack : "1 X 10" , 
            image: "image copy 40.png"
},

{
    id: 42,
    name: "MEFTAL-P Tablet",
            rate: "₹27.64",
            MRP : "₹38.00" ,
            pack : "1 X 10" , 
            image: "image copy 41.png"
},

{
    id: 43,
    name: "OMNACORTIL-10 Tablet",
            rate: "₹10.45",
            MRP : "₹13.43" ,
            pack : "1 X 10" , 
            image: "image copy 42.png"
},

{
    id: 44,
    name: "OMNACORTIL-5 Tablet",
            rate: "₹6.35",
            MRP : "₹7.23" ,
            pack : "1 X 10" , 
            image: "image copy 43.png"
},

{
    id: 45,
    name: "PANTOP-DSR Capsule",
            rate: "₹175.65",
            MRP : "₹226.40" ,
            pack : "1 X 15" , 
            image: "image copy 44.png"
},

{
    id: 46,
    name: "DYTOR-10 Tablet",
            rate: "₹73.38",
            MRP : "₹102.72" ,
            pack : "1 X 15" , 
            image: "image copy 45.png"
},

{
    id: 47,
    name: "ZERODOL-SP Tablet",
            rate: "₹114.85",
            MRP : "₹139.69" ,
            pack : "1 X 10" , 
            image: "image copy 46.png"
},

{
    id: 48,
    name: "UNIENZYME Tablet",
            rate: "₹69.64",
            MRP : "₹93.75" ,
            pack : "1 X 15" , 
            image: "image copy 47.png"
},

{
    id: 49,
    name: "COMBIFLAM Tablet",
            rate: "₹44.98",
            MRP : "₹57.45" ,
            pack : "1 X 20" , 
            image: "image copy 48.png"
},

{
    id: 50,
    name: "IBUGESIC PLUS SUSPENSION",
            rate: "₹42.65",
            MRP : "₹56.61" ,
            pack : "60ML Bottle" , 
            image: "image copy 49.png"
},

{
    id: 51,
    name: "DIGENE ORANGE Tablet",
            rate: "₹22.58",
            MRP : "₹29.20" ,
            pack : "1 X 15" , 
            image: "image copy 50.png"
},

{
    id: 52,
    name: "DIGENE ORANGE SYRUP",
            rate: "₹142.25",
            MRP : "₹180.74" ,
            pack : "200ML BOTTLE" , 
            image: "image copy 51.png"
},

{
    id: 53,
    name: "ACILOC 150 Tablet",
            rate: "₹39.98",
            MRP : "₹50.44" ,
            pack : "1 X 30" , 
            image: "image copy 52.png"
},

{
    id: 54,
    name: "ACILOC 300 Tablet",
            rate: "₹47.85",
            MRP : "₹61.60" ,
            pack : "1 X 30" , 
            image: "image copy 53.png"
} , 

{
    id: 55,
    name: "COMBIFLAM SUSPENSION",
            rate: "₹39.85",
            MRP : "₹46.08" ,
            pack : "60ML BOTTLE" , 
            image: "image copy 54.png"
} , 

{
    id: 56,
    name: "AMLOPRES-AT Tablet",
            rate: "₹148.95",
            MRP : "₹185.30" ,
            pack : "1 X 15" , 
            image: "image copy 56.png"
} , 

{
    id: 57,
    name: "DOLO 650 Tablet",
            rate: "₹27.50",
            MRP : "₹32.12" ,
            pack : "1 X 15" , 
            image: "image copy 55.png"
} , 

{
    id: 58,
    name: "BETNESOL 0.5MG Tablet",
            rate: "₹12.80",
            MRP : "₹17.00" ,
            pack : "1 X 20" , 
            image: "image copy 57.png"
} , 

{
    id: 59,
    name: "GASOFAST AYURVEDA",
            rate: "₹755.00",
            MRP : "₹1200.00" ,
            pack : "120 X 5gm SACHE" , 
            image: "image copy 58.png"
} , 

{
    id: 60,
    name: "CHESTON COLD Tablet",
            rate: "₹23.50",
            MRP : "₹70.18" ,
            pack : "1 X 10" , 
            image: "image copy 59.png"
} , 

{
    id: 61,
    name: "INTAGESIC MR Tablet",
            rate: "₹21.50",
            MRP : "₹124.00" ,
            pack : "1 X 10" , 
            image: "image copy 60.png"
} , 

{
    id: 62,
    name: "AMOXUNF-CV LB 625",
        rate: "₹46.00",
        MRP: "₹152.00",
        pack: "1 X 6",
        image: ""
},

{
    id: 63,
    name: "PanUNF-DSR",
        rate: "₹15.50",
        MRP: "₹120.00",
        pack: "1 X 10",
        image: ""
},

{
    id: 64,
    name: "ALEWFIX 200 DT",
        rate: "₹39.80",
        MRP: "₹104.40",
        pack: "1 X 10",
        image: ""
},

{
    id: 65,
    name: "KUFRIS-AM SYRUP",
        rate: "₹34.00",
        MRP: "₹100.00",
        pack: "100ml Bottle",
        image: ""
},

{
    id: 66,
    name: "AceUNF-SP",
        rate: "₹15.50",
        MRP: "₹110.00",
        pack: "1 X 10",
        image: ""
},

{
    id: 67,
    name: "AceUNF-P",
        rate: "₹10.00",
        MRP: "₹62.00",
        pack: "1 X 10",
        image: ""
},

{
    id: 68,
    name: "LEVO-UNF M",
        rate: "₹17.00",
        MRP: "₹115.00",
        pack: "1 X 10",
        image: ""
},

{
    id: 69,
    name: "NIMESUL-UNF P",
        rate: "₹10.00",
        MRP: "₹57.00",
        pack: "1 X 10",
        image: ""
},

{
    id: 70,
    name: "OFLOX-UNF 200",
        rate: "₹15.50",
        MRP: "₹92.00",
        pack: "1 X 10",
        image: ""
},

{
    id: 71,
    name: "KUFRIS-DX SYRUP",
        rate: "₹34.00",
        MRP: "₹88.00",
        pack: "100ml Bottle",
        image: ""
},

{
    id: 72,
    name:"KUFZEX-LS SYRUP",
        rate: "₹36.00",
        MRP: "₹130.00",
        pack: "100ml Bottle",
        image: ""
},

{
    id: 73,
    name: "DALNEX-P TABLET",
        rate: "₹7.75",
        MRP: "₹45.00",
        pack: "1 X 10",
        image: ""
},

{
    id: 74,
    name: "ParaSmith-MR",
        rate: "₹17.00",
        MRP: "₹122.40",
        pack: "1 X 10",
        image: ""
},

{
    id: 75,
    name: "Parazent-650 Tablet",
        rate: "₹18.00",
        MRP: "₹44.80",
        pack: "1 X 20",
        image: ""
},

{
    id: 76,
    name: "Azrist-500 Tablet",
        rate: "₹32.50",
        MRP: "₹78.00",
        pack: "1 X 3",
        image: ""
},

{
    id: 77,
    name: "All Night 100",
        rate: "₹9.25",
        MRP: "₹100.00",
        pack: "1 Tablet",
        image: ""
},

{
    id: 78,
    name: "VOMZEX-MD Tablet",
        rate: "₹17.00",
        MRP: "₹68.00",
        pack: "1 X 15",
        image: ""
},

{
    id: 79,
    name: "MOXLAIR-500 Capsule",
        rate: "₹30.00",
        MRP: "₹72.00",
        pack: "1 X 10",
        image: ""
},

{
    id: 80,
    name: "ENERBEST INSTANT ENERGY ORANGE",
    rate: "₹25.00",
    MRP: "₹70.00",
    pack: "105gm Pack",
    image: ""
},

{
    id: 81,
    name: "RABORISE-DSR Capsules",
    rate: "₹15.00",
    MRP: "₹100.00",
    pack: "1 X 10",
    image: ""
},

{
    id: 82,
    name: "RABORISE 20 Tablet",
    rate: "₹13.00",
    MRP: "₹60.00",
    pack: "1 X 10",
    image: ""
},

{
    id: 83,
    name:"MEGNEX-MPS Suspension",
    rate: "₹31.00",
    MRP: "₹92.00",
    pack: "170ml Bottle",
    image: ""
},

{
    id: 84,
    name: "APZEX Syrup",
    rate: "₹35.00",
    MRP: "₹140.00",
    pack: "200ml Bottle",
    image: ""
},

{
    id: 85,
    name: "LIVZEX-DS Syrup",
    rate: "₹32.00",
    MRP: "₹130.00",
    pack: "200ml Bottle",
    image: ""
},

{
    id: 86,
    name: "LIVZEX-4G Syrup",
    rate: "₹34.00",
    MRP: "₹185.00",
    pack: "225ml Bottle",
    image: ""
},

{
    id: 87,
    name: "ENERBEST INSTANT ENERGY LEMON",
    rate: "₹25.00",
    MRP: "₹70.00",
    pack: "105gm Pack",
    image: ""
},

{
    id: 88,
    name: "MEFRIS-PLUS Suspension",
    rate: "₹23.00",
    MRP: "₹68.00",
    pack: "60ml Bottle",
    image: ""
},

{
    id: 89,
    name: "ALCIT-M KID Syrup",
    rate: "₹25.00",
    MRP: "₹68.00",
    pack: "60ml Bottle",
    image: ""
},

{
    id: 90,
    name: "COLRIX SUSP. KID",
    rate: "₹21.00",
    MRP: "₹56.00",
    pack: "60ml Bottle",
    image: ""
},

{
    id: 91,
    name: "ARLOVIT-G SG Capsule",
    rate: "₹15.50",
    MRP: "₹120.00",
    pack: "1 X 10",
    image: ""
},

{
    id: 92,
    name: "ARLOVIT-L SG Capsule",
    rate: "₹13.50",
    MRP: "₹98.00",
    pack: "1 X 10",
    image: ""
},

{
    id: 93,
    name: "OMIRUS-20 Capsules",
    rate: "₹9.50",
    MRP: "₹32.00",
    pack: "1 X 10",
    image: ""
},

{
    id: 94,
    name: "ALDORT-MR TABLET",
    rate: "₹16.50",
    MRP: "₹66.00",
    pack: "1 X 10",
    image: ""
},

{
    id: 95,
    name: "ALEWFIX-O TABLET",
    rate: "₹59.50",
    MRP: "₹164.00",
    pack: "1 X 10",
    image: ""
},

{
    id: 96,
    name: "ALVIT-CEE TABLET",
    rate: "₹17.50",
    MRP: "₹115.00",
    pack: "1 X 10",
    image: ""
},

{
    id: 97,
    name: "KETORIN DT TABLET",
    rate: "₹13.50",
    MRP: "₹52.00",
    pack: "1 X 10",
    image: ""
},

{
    id: 98,
    name: "OFRIS-OZ TABLET",
    rate: "₹31.50",
    MRP: "₹118.00",
    pack: "1 X 10",
    image: ""
},

{
    id: 99,
    name: "PALRIS-40 TABLET",
    rate: "₹11.50",
    MRP: "₹100.00",
    pack: "1 X 10",
    image: ""
}
    ];