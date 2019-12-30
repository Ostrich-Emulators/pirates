export interface Purchase {
    cityname: string,
    item: string, /** one of MELEE, SAILING, HULL, SAIL, AMMO, CANNON */
    extra_n?: number
    extra_s?: string
}