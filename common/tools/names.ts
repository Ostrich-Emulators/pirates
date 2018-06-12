export class Names {
    private static shipidx = 0;
    private static captainMidx = 0;
    private static captainFidx = 0;

    static SHIPS: string[] = [
        'Pigeon', 
        'Squeaker',
        'Augusta Belle',
        'The Renegade',
        'The Avenger',
        'Kincardine',
        'The Sacrett',
        'Cambridge',
        'Manica',
        'Matabele',
        'Maryborough',
        'Orange Tree',
        'Tristram',
        'Hyderabad',
        'Vascama',
        'Chicoutimi',
        'Dartmoor',
        'The Vincejo',
        'Aylmer',
        'Nettle',
        'Usurper',
        'Camellia',
        'The Norseman',
        'Tabard',
        'Spindrift',
        'The Carrick',
        'The Adamant',
        'Spartan',
        'Beaver Prize',
        'Fermoy',
        'Indomitable',
        'Assault',
        'The Angelica',
        'Clorinde',
        'Angelica',
        'Surly',
        'Kellington',
        'The Grove',
        'Adventure',
        'Trumpeteer',
        'Rugby',
        'Eleanor',
        'Phaeton',
        'The Myosotis',
        'The Eruption',
        'The Dilston',
        'Gallion',
        'The Jennet',
        'Redbreast',
        'Hubberston',
        'The Curieux',
        'Somali',
        'Bermuda',
        'Africa',
        'The Fundy',
        'Ellinor',
        'The Content',
        'Cambridgeshire',
        'Portland',
        'Diadem',
        'Onslow',
        'Orcadia',
        'The Sterlet',
        'Pirie',
        'Gainsborough'
    ]

    static CAPTAINS_M: string[] = [
        'Cannonball Jack',
        "Braxton 'Plankton' Parrish",
        "Kent 'Gray Beard' Zeus",
        "Hallam 'Smiling' Emsworth",
        "Quinton 'Relentless' Vile",
        "Hampden 'Nightmare' Swale",
        "Harden 'Butcher' Penney",
        "Montgomery 'The Confident' Rassler",
        "Elford 'Deserter' Springfield",
        "Mitford 'Mad' Upir",
        "Dover 'Grim Reaper' Barlow",
        "Willard 'The Honest' Shurman",
        "Newman 'No Smile' Hornsby",
        "Edison 'Cranky' Sutherland",
        "Mabry 'Pirate' Atterton",
        "Averill 'Jolly' Acton",
        "Blakely 'Scurvy' Nutlee",
        "Garland 'Iron Chest' Nunnally",
        "Hawes 'Dawg' Fark",
        "Barrett 'Crippled' Sweete",
        "Fenton 'The Rat' Chrom",
        "Gladstone 'Riot' Drachen",
        "Huntington 'Ruthless' Pickering",
        "Stancliff 'Lionheart' Stansfield",
        "Reading 'Squealer' Nutlea",
        "Huxford 'The Fox' Clayden",
        "Fridolf 'Crew Member' Edge",
        "Tupper 'Fraud' Stone",
        "Earlham 'Foul' Smyth",
        "Tedmund 'Swindler' Digby",
        "Dale 'Trickster' Zeus",
        "Winfield 'The Wall' Ogden",
        "Linton 'Relentless' Haley",
        "Atworth 'Scurvy' Langley",
        "Yule 'Shady' Nunnally",
        "Halley 'Crow's Nest' Breeden",
        "Free 'The Legend' Charles",
        "York 'Marooner' Clark",
        "Auberon 'Marooner' Browning",
        "Minster 'The Journey' Obsidian",
        "Johnson 'Bribing' Swale",
        "Chetwin 'The Confident' Chandler",
        "Clay 'Whitemane' Tempest",
        "Edbert 'Calmness' Hitch",
        "Barker 'Haunted' Nightshade",
        "Edgardo 'Shark Bait' Hayward",
        "Kedrick 'No Smile' Savant",
        "Mersey 'Traitor' Hayhurst",
        "Ned 'Vicious' Merton",
        "Osier 'Defiant' Vaughn",
        "Renfred 'Raider' Tydes"
    ];

    static CAPTAINS_F: string[] = [
        "Zenobia 'Shadow' Netley",
        "Madelyn 'Trickster' Mace",
        "Palma 'Haunted' Payne",
        "Jennie 'Confidence' Lynk",
        "Averil 'Butcher' Joshua",
        "Albina 'One Eye' Lucius",
        "Mittie 'Timbers' Whatley",
        "Johnnie 'Brown Tooth' Hale",
        "Winona 'Smiling' Garside",
        "Myrtis 'Flamboyant' Tack",
        "Florine 'Shadow' Bush",
        "Shandy 'Slick' Hamlet",
        "Golda 'The Rat' Addington",
        "Norma 'The Stubborn' Livingstone",
        "Libbie 'Merciless' Hamlet",
        "Ray 'Hex' Clive",
        "Rosemary 'Snitch' Talon",
        "Jewel 'The Hero' Lore",
        "Erwina 'Grommet' Godfrey",
        "Sallie 'Harpy' Oxworth",
        "Delphine 'Fishwife' Tyndall",
        "Lonie 'Crippled' Incubus",
        "Ada 'Bribing' Stryker",
        "Eulalie 'Tormenting' Holt",
        "Ethelyn 'First Mate' Torp",
        "Claribel 'Whale-Eye' Thackeray",
        "Verna 'Silver-Eye' Quye",
        "Kathrine 'Renegade' Bunce",
        "Erma 'Relentless' Hogan",
        "Rhea 'Insanity' Vail",
        "Storm 'Pieces of Eight' Myerscough",
        "Adelia 'Hooked' Torp",
        "Iva 'Four-Teeth' Nayte",
        "Sherry 'The Fox' Zell",
        "Bertrade 'The Journey' Zelgius",
        "Alda 'Mumbling' Notleigh",
        "Bridget 'Cross' Rowley",
        "Mertie 'Weird'o' Smit",
        "Luetta 'Immortal' Wright",
        "Ludie 'Swashbuckler' Zayne",
        "Una 'Deceiver' Copeland",
        "Lorena 'The Hawk' Xander",
        "Alene 'First Mate' Knotley",
        "Verla 'Grim Reaper' Carlton",
        "Beula 'Slick' Hammett",
        "Ruby 'Shark Bait' Romulus",
        "Parker 'Pirate' Redcap",
        "Vena 'Fearless' Antone",
        "Adelia 'The Witch' Ark",
        "Pauline 'Defiance' Currington"
    ];

    static ship(): string {
        var name = this.SHIPS[this.shipidx];
        this.shipidx += 1;
        if (this.shipidx > this.SHIPS.length) {
            this.shipidx = 0;
        }

        // just pick a random name for now
        name = this.SHIPS[Math.floor(Math.random() * this.SHIPS.length)];
        return name;
    }

    static captain(female: boolean = false): string {
        // just pick a random name for now
        if (female) {
            var name = this.CAPTAINS_F[Math.floor(Math.random() * this.CAPTAINS_F.length)];
            return name;
        }
        else {
            var name:string = this.CAPTAINS_M[Math.floor(Math.random() * this.CAPTAINS_M.length)];
            return name;
        }
    }
};
