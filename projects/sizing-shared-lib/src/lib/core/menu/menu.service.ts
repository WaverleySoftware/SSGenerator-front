import { Injectable } from '@angular/core';

@Injectable()
export class MenuService {

    menuItems: Array<any>;

    constructor() {
        this.menuItems = [];
    }

    addMenu(items: Array<{
        text: string,
        heading?: boolean,
        link?: string,     // internal route links
        elink?: string,    // used only for external links
        target?: string,   // anchor target="_blank|_self|_parent|_top|framename"
        icon?: string,
        alert?: string,
        displayOperatingCompany?: string,
        submenu?: Array<any>
    }>) {
        items.forEach((item) => {
            this.menuItems.push(item);
        });
    }

    getMenu() {
        return this.menuItems;
    }

    getMenuObjByUrl(url: string): any {
        // Normalise the url if it is the root.
        url = url === "/" ? "/home" : url;

        var menuItem = this.menuItems.find(mu => mu.link === url) as any;

        if (!menuItem) {
            
            // No top-level menu item found. Search all nodes that contain sub-menus.
            for (const item in this.menuItems) {
                if (this.menuItems.hasOwnProperty(item)) {
                    const currentItem = this.menuItems[item];
                    
                    // Search through sub-menu items to find a link there.
                    if (!!currentItem.submenu) {
                        menuItem = currentItem.submenu.find(su => su.link === url);
                        break;
                    }
                }
            }
        }

      return !!menuItem ? menuItem : null;
    }

}
