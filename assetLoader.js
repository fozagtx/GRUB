export class AssetLoader {
    static loadAllAssets(scene) {
        // Farmer sprites
        scene.load.image('farmeridle', 'https://play.rosebud.ai/assets/farmeridle.png?KyGV');
        scene.load.image('farmerleft', 'https://play.rosebud.ai/assets/farmerleft.png?TG7A');
        scene.load.image('farmerright', 'https://play.rosebud.ai/assets/farmerright.png?WF8f');
        scene.load.image('farmerboth', 'https://play.rosebud.ai/assets/farmerboth.png?pLtm');
        
        // Kale assets
        scene.load.image('kaleSingle', 'https://play.rosebud.ai/assets/kaleSingle.png?RcMg');
        scene.load.image('kaleBunch', 'https://play.rosebud.ai/assets/kaleBunch.png?rKNx');
        scene.load.image('goldenKale', 'https://play.rosebud.ai/assets/glowingGoldenKale.png?p79Z');
        scene.load.image('kalerainbow', 'https://play.rosebud.ai/assets/kalerainbow.png?77tu');
        scene.load.image('kalecrystal', 'https://play.rosebud.ai/assets/kalecrystal.png?vu7h');
        scene.load.image('kaleshake', 'https://play.rosebud.ai/assets/kaleshake3.png?0jyX');
        
        // Farm background
        scene.load.image('farmbackground', 'https://play.rosebud.ai/assets/farmbackground3.png?NxD8');
        
        // Hazard asset
        scene.load.image('cabbageworm', 'https://play.rosebud.ai/assets/cabbageworm2.png?Lr8O');
        
        // Load background music
        scene.load.audio('kalesong', 'https://play.rosebud.ai/assets/Kalesong.mp3?xFaH');
        scene.load.audio('remixsong', 'https://play.rosebud.ai/assets/GrabSomeKale.mp3?fqj9');
        this.loadTruckAssets(scene);
    }
    static loadTruckAssets(scene) {
        const truckAssetUrls = {
            "truckboy0": "https://play.rosebud.ai/assets/truckboy0.png?LtNw",
            "truckboy1": "https://play.rosebud.ai/assets/truckboy1.png?H58i",
            "truckboy2": "https://play.rosebud.ai/assets/truckboy2.png?mN6u",
            "truckboy3": "https://play.rosebud.ai/assets/truckboy3.png?fcLZ",
            "truckboy4": "https://play.rosebud.ai/assets/truckboy4.png?v83X",
            "truckboy5": "https://play.rosebud.ai/assets/truckboy5.png?OQjk",
            "truckboy6": "https://play.rosebud.ai/assets/truckboy6.png?sIwN",
            "truckboy7": "https://play.rosebud.ai/assets/truckboy7.png?2ijo",
            "truckboy8": "https://play.rosebud.ai/assets/truckboy8.png?YBl6",
            "truckboy9": "https://play.rosebud.ai/assets/truckboy9.png?6SQA",
            "truckboy10": "https://play.rosebud.ai/assets/truckboy10.png?9jMK",
            "truckboy11": "https://play.rosebud.ai/assets/truckboy11.png?3ovF",
            "truckboy12": "https://play.rosebud.ai/assets/truckboy12.png?U9mu",
            "truckboy13": "https://play.rosebud.ai/assets/truckboy13.png?xVac",
            "truckboy14": "https://play.rosebud.ai/assets/truckboy14.png?aiuX",
            "truckboy15": "https://play.rosebud.ai/assets/truckboy15.png?odYE",
            "truckboy16": "https://play.rosebud.ai/assets/truckboy16.png?Jk5Q",
            "truckboy17": "https://play.rosebud.ai/assets/truckboy17.png?yyGz",
            "truckboy18": "https://play.rosebud.ai/assets/truckboy18.png?6bSc",
            "truckboy19": "https://play.rosebud.ai/assets/truckboy19.png?MQ4m",
            "truckboy20": "https://play.rosebud.ai/assets/truckboy20.png?Xdqh",
            "truckboy21": "https://play.rosebud.ai/assets/truckboy21.png?Qkyy",
            "truckboy22": "https://play.rosebud.ai/assets/truckboy22.png?NqiT",
            "truckboy23": "https://play.rosebud.ai/assets/truckboy23.png?DRYr",
            "truckboy24": "https://play.rosebud.ai/assets/truckboy24.png?QHTw",
            "truckboy25": "https://play.rosebud.ai/assets/truckboy25.png?wOeX",
            "truckboy26": "https://play.rosebud.ai/assets/truckboy26.png?t65G",
            "truckboy27": "https://play.rosebud.ai/assets/truckboy27.png?9LXP",
            "truckboy28": "https://play.rosebud.ai/assets/truckboy28.png?yTmj",
            "truckboy29": "https://play.rosebud.ai/assets/truckboy29.png?iYzQ",
            "truckboy30": "https://play.rosebud.ai/assets/truckboy30.png?MSk6",
            "truckboy31": "https://play.rosebud.ai/assets/truckboy31.png?CURe",
            "truckboy32": "https://play.rosebud.ai/assets/truckboy32.png?ikvb",
            "truckboy33": "https://play.rosebud.ai/assets/truckboy33.png?EYdI",
            "truckboy34": "https://play.rosebud.ai/assets/truckboy34.png?jbN2",
            "truckboy35": "https://play.rosebud.ai/assets/truckboy35.png?db2p",
            "truckboy36": "https://play.rosebud.ai/assets/truckboy36.png?lbC5",
            "truckboy37": "https://play.rosebud.ai/assets/truckboy37.png?Csvv",
            "truckboy38": "https://play.rosebud.ai/assets/truckboy38.png?b4cL",
            "truckboy39": "https://play.rosebud.ai/assets/truckboy39.png?aPaK",
            "truckboy40": "https://play.rosebud.ai/assets/truckboy40.png?skwK",
            "truckboy41": "https://play.rosebud.ai/assets/truckboy41.png?dmoO",
            "truckboy42": "https://play.rosebud.ai/assets/truckboy42.png?B4lq",
            "truckboy43": "https://play.rosebud.ai/assets/truckboy43.png?TOUi",
            "truckboy44": "https://play.rosebud.ai/assets/truckboy44.png?hJh5",
            "truckboy45": "https://play.rosebud.ai/assets/truckboy45.png?KTTi",
            "truckboy46": "https://play.rosebud.ai/assets/truckboy46.png?h0dp",
            "truckboy47": "https://play.rosebud.ai/assets/truckboy47.png?S96b",
            "truckboy48": "https://play.rosebud.ai/assets/truckboy48.png?suOM",
            "truckboy49": "https://play.rosebud.ai/assets/truckboy49.png?w7DF",
            "truckboy50": "https://play.rosebud.ai/assets/truckboy50.png?f1XW",
            "truckboy51": "https://play.rosebud.ai/assets/truckboy51.png?lTNX",
            "truckboy52": "https://play.rosebud.ai/assets/truckboy52.png?A7iV",
            "truckboy53": "https://play.rosebud.ai/assets/truckboy53.png?spIh",
            "truckboy54": "https://play.rosebud.ai/assets/truckboy54.png?bOCV",
            "truckboy55": "https://play.rosebud.ai/assets/truckboy55.png?Yta1",
            "truckboy56": "https://play.rosebud.ai/assets/truckboy56.png?A41W",
            "truckboy57": "https://play.rosebud.ai/assets/truckboy57.png?qz2l",
            "truckboy58": "https://play.rosebud.ai/assets/truckboy58.png?6m69",
            "truckboy59": "https://play.rosebud.ai/assets/truckboy59.png?mRJD",
            "truckboy60": "https://play.rosebud.ai/assets/truckboy60.png?RUrq"
        };
        for (const name in truckAssetUrls) {
            if (Object.hasOwnProperty.call(truckAssetUrls, name)) {
                scene.load.image(name, truckAssetUrls[name]);
            }
        }
    }
}