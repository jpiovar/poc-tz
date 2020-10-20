import _ from 'lodash';
import { Page, Subpage } from '@/stores/pages/pages.types';
import { PAGE_INITIAL } from '@/stores/pages/constants';

export class GeneralHelper {
  /** transform allowed
   * @param role: String
   * @param pageOriginal: Object
   *  {
        "id": "pwhjj",
        "name": "Prohlizeni WHJ Journalu",
        "allowed": {
            "read": ["manager", "worker", "coworker"],
            "write": ["manager"]
        }
      }
    * @return Object
        {
            "id": "pwhjj",
            "name": "Prohlizeni WHJ Journalu",
            "allowed": {
                "read": true,
                "write": true
            }
        }
    */
  processRole(role: String, pageOriginal: any): Object {
    const res = {
      id: pageOriginal.id,
      name: pageOriginal.name,
      allowed: {
        read: false,
        write: false
      },
      subpages: pageOriginal.subpages,
      currentSubpage: pageOriginal.currentSubpage
    };
    if (pageOriginal && pageOriginal.allowed && pageOriginal.allowed.read) {
      if (pageOriginal.allowed.read.indexOf(role) > -1) {
        res.allowed.read = true;
      }
    }
    if (pageOriginal && pageOriginal.allowed && pageOriginal.allowed.write) {
      if (pageOriginal.allowed.write.indexOf(role) > -1) {
        res.allowed.write = true;
      }
    }
    return res;
  }

  processAllowedContent(pageOriginal: any, allowedItems: any): Object|undefined {
    let res;
    if (pageOriginal && pageOriginal.id && allowedItems[pageOriginal.id]) {
      res = {
        id: pageOriginal.id,
        name: pageOriginal.name,
        // allowed: {
        //   read: this.pickDeep(allowedItems[pageOriginal.id], ['read'], false),
        //   write: this.pickDeep(allowedItems[pageOriginal.id], ['write'], false)
        // },
        subpages: this.getPermissions(pageOriginal.subpages, allowedItems),
        currentSubpage: pageOriginal.currentSubpage
      };
    } else {
      res = undefined;
    }
    return res;
  }

  getPermissions(currentPageSubpages: any, allowedItems: any): Object {
    currentPageSubpages.forEach((item: any) => {
      if (item && item.id && allowedItems[item.id]) {
        item.allowed = {
          read: this.pickDeep(allowedItems[item.id], ['read'], false),
          write: this.pickDeep(allowedItems[item.id], ['write'], false)
        };
      } else {
        _.remove(currentPageSubpages, {
          id: item.id
        });
      }
    });
    return currentPageSubpages;
  }

  // small idea refactor COC

  processAllowedCOC(pageOriginal: any, allowedItems: any): Object|undefined {
    // debugger;
    let res;
    if (pageOriginal && pageOriginal.id && this.isContentIdContained(pageOriginal.id, allowedItems).allowed) {
      res = {
        id: pageOriginal.id,
        name: pageOriginal.name,
        subpages: this.getPermissionsCOC(pageOriginal.subpages, allowedItems),
        currentSubpage: pageOriginal.currentSubpage
      };
    } else {
      res = undefined;
    }
    return res;
  }

  getPermissionsCOC(currentPageSubpages: any, allowedItems: any): Object {
    // debugger;
    currentPageSubpages.forEach((item: any) => {
      const isContained = this.isContentIdContained(item.id, allowedItems);
      if (item && item.id && isContained.allowed) {
        item.allowed = {
          read: this.pickDeep(allowedItems[isContained.index], ['read'], false),
          write: this.pickDeep(allowedItems[isContained.index], ['write'], false)
        };
      } else {
        _.remove(currentPageSubpages, {
          id: item.id
        });
      }
    });
    return currentPageSubpages;
  }

  isContentIdContained(id: any, allowedItemsArr: any[]): { allowed: boolean, index: number } {
    for (let i = 0; i < allowedItemsArr.length; i++) {
      if (allowedItemsArr[i].content_id === id) {
        return { allowed: true, index: i };
      }
    }
    return { allowed: false, index: 0 };
  }

  /**
  * It returns deep object look ups
  * @param {object} obj to start with
  * @param {string[]} fieldList containing the list of the look ups
  * @param {any=} otherwise default value to return
  * @return {any} returns the desired object/value
  */
  pickDeep(obj: object, fieldList: string[], otherwise: any): any {
    return fieldList.reduce((res: any, field) => res && res[field], obj) || otherwise;
  }

  getCurrentPageBasedId(userPages: Page[], id: string): Page {
    let res = PAGE_INITIAL;
    for (let i = 0; i < userPages.length; i++) {
      if (userPages[i] && userPages[i].id && userPages[i].id === id) {
        res = userPages[i];
      }
    }
    return res;
  }

  getCurrentSubpageBasedId(currentPageSubpages: Subpage[], id: string): Page {
    let res: any = {
      id: '',
      name: '',
      content: {}
    };
    for (let i = 0; i < currentPageSubpages.length; i++) {
      if (currentPageSubpages[i] && currentPageSubpages[i].id && currentPageSubpages[i].id === id) {
        res = currentPageSubpages[i];
      }
    }
    return res;
  }

  getItemsObjBasedArrayIds(arrIds: any, arrItemsObj: any[]): any[] {
    let res: any = [];
    for (let i = 0; i < arrIds.length; i++) {
      const ar = arrItemsObj.filter((item: any) => item._id === arrIds[i]);
      res = [...res, ...ar];
    }
    return res;
  }

  getTypes(itemObj: any): any {
    Object.keys(itemObj).forEach((key, index) => {
      itemObj[key] = typeof itemObj[key];
    });
    return itemObj;
  }

  renderedOriginal(items: any[]) {
    const res: any = [];
    items.forEach((item) => {
      res.push({
        rendered: this.trimString(_.clone(item)),
        original: this.trimString(_.clone(item)),
        type: this.getTypes(item)
      });
    });
    return res;
  }

  trimString(itemObj: any): any {
    Object.keys(itemObj).forEach((key, index) => {
      itemObj[key] = String(itemObj[key]).trim();
    });
    return itemObj;
  }

  renderedToOriginalDiffOut(items: any[]) {
    items.forEach((item) => {
      item.original = _.clone(item.rendered);
      delete item.diff;
    });
  }

  typeReset(itemObjR: any, itemObjT: any): any {
    Object.keys(itemObjT).forEach((key, index) => {
      if (itemObjT[key] === 'string') {
        itemObjR[key] = String(itemObjR[key]);
      } else if (itemObjT[key] === 'number') {
        itemObjR[key] = Number(itemObjR[key]);
      } else if (itemObjT[key] === 'boolean') {
        itemObjR[key] = Boolean(itemObjR[key]);
      }
    });
    return itemObjR;
  }
}
