import { AbstractExtractor } from './abstract-extractor';
import { ItemData } from '../../../../model/garland-tools/item-data';
import { DataType } from '../data-type';
import { Vendor } from '../../model/vendor';
import { Item } from '../../../../model/garland-tools/item';
import * as npcs from '../../../../core/data/sources/npcs.json';

export class VendorsExtractor extends AbstractExtractor<Vendor[]> {

  constructor() {
    super();
  }

  public isAsync(): boolean {
    return false;
  }

  public getDataType(): DataType {
    return DataType.VENDORS;
  }

  protected canExtract(item: Item): boolean {
    return item.vendors !== undefined;
  }

  protected doExtract(item: Item, itemData: ItemData): Vendor[] {
    const vendors: Vendor[] = [];
    for (const vendorId of item.vendors) {
      const npcPartial = itemData.getPartial(vendorId.toString(), 'npc').obj;
      let itemPartial = itemData.getPartial(item.id.toString(), 'item');
      // If we didn't find the item in partials, get it from ingredients
      if (itemPartial === undefined) {
        if (itemData.ingredients === undefined) {
          // if this has no partial nor ingredients, we can go to the next one.
          break;
        }
        itemPartial = itemData.getIngredient(item.id);
      } else {
        // Else, simply bind the obj property to the effective partial
        itemPartial = itemPartial.obj;
      }
      if (itemPartial !== undefined) {
        // If we have an undefined price, this is not what we want
        if (itemPartial.p === undefined) {
          continue;
        }
        const vendor: Vendor = {
          npcId: vendorId,
          price: itemPartial.p
        };
        const npcEntry = npcs[vendorId];
        if (npcEntry.position !== null) {
          vendor.coords = npcEntry.position;
          vendor.zoneId = npcEntry.zoneId;
        }
        vendors.push(vendor);
      }
    }
    return vendors;
  }

}
