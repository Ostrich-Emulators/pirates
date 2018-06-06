export class Names {
    private static shipidx = 0;
    private static captainidx = 0;

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

    static CAPTAINS = [
        'Cannonball Jack',
        "Elsdon 'The Honest' Thor",
        "Derek 'Disfigured' Prescott",
        "Butcher 'Softy' Camus",
        "Renwick 'Crafty' Brent",
        "Barnes 'Brown Tooth' Clayton",
        "Delbert 'Brass' Preston",
        "Farnell 'Con Artist' Crowley",
        "Garyson 'Insanity' Aries",
        "Hobbes 'Four Fingers' Bryce",
        "Bishop 'Reaper' Noire",
        "Corin 'Mumbling' Colton",
        "Grace 'Quartermaster' Crowder",
        "Jossie 'Scar Face' Atherton",
        "Louisa 'Confidence' Salvotor",
        "Aida 'The Brave' Butler",
        "Buena 'Tricky' Peregrine",
        "Ophelia 'Bird Eye' Leighton",
        "Delilah 'Calmness' Rakshasas",
        "Winifred 'Weird'o' Darth",
        "Gael 'Treasure' Ashton",
        "Madaline 'Yellow Teeth' Ramsey",
        "Elvera 'Tormenting' Maxim",
        "Justine 'Dazzling' Rutland",
        "Queen 'Defiant' Kellam",
        "Myrna 'Foxy' Kimberley",
        "Cydney 'Brown Tooth' Gloom",
        "Berry 'Mutiny' Nottley",
        "Corin 'Rigger' Whatley",
        "Patsy 'Slick 'n Sly' Ark",
        "Mavis 'Keen' Darkwalker",
        "Lindell 'Hooked' Sagar",
        "Wolcott 'Twisting' Holmes",
        "Dixon 'Shadow' Gnash",
        "Knoll 'Cabin Boy' Hayward",
        "Hardwick 'White Hair' Quway",
        "Hadley 'Barbarian' Auron",
        "Merton 'The Marked' Storm",
        "Duane 'The Cold' Rudges",
        "Burton 'Smiling' Black",
        "Everest 'No-Tongue' Oakley",
        "Coster 'Fraud' Camden",
        "Ronald 'Sly' Ethel",
        "Hall 'One Eye' Omen",
        "Hancock 'The Stubborn' Snowdon",
        "Bellamy 'Mad' Murray",
        "Ravinger 'Crazy Eyes' Garthside",
        "Elmore 'Mad Eye' Lincoln",
        "Elwood 'Deceiver' Chaos",
        "Fulton 'Roaring' Tyndall",
        "Roark 'Ugly Mug' Mitchell",
        "Ethelred 'Wrathful' Atherton",
        "Avery 'Double-Crossed' Sherlock",
        "Swaine 'Grim' Uberto",
        "Hampden 'Naive' Lynk",
        "Frick 'Soft Heart' Reeve",
        "Hutton 'Gnarling' Birkenhead",
        "Farr 'Tormented' Reed",
        "Sedgley 'Golden Hair' Karn",
        "Seabrook 'Grisly' Paddley",
        "Huntley 'Devious' Stevens",
        "Bulah 'The Rat' Johnson",
        "Darlene 'Marooner' Tristan",
        "Arlie 'Crippled' Graeme",
        "Fern 'The Boar' Torp",
        "Liddie 'The Wild' Petrik",
        "Eleanora 'Cranky' Breeden",
        "Sybil 'Merciless' Belzebob",
        "Louella 'Cruelty' Mabbott",
        "Aline 'The Lion' Webb",
        "Winnie 'Tormented' Braxton",
    ]

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

    static captain(): string {
        var name = this.CAPTAINS[this.captainidx];
        this.captainidx += 1;
        if (this.captainidx > this.CAPTAINS.length) {
            this.captainidx = 0;
        }

        // just pick a random name for now
        name = this.CAPTAINS[Math.floor(Math.random() * this.CAPTAINS.length)];
        return name;
    }
};
