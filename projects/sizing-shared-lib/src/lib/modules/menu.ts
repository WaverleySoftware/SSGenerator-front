/**
 * Defines the sizing module routes based on the specified type.
 * @param type The route type.
 */
function sizingModuleRoutes(type: string) {

  if (!type) {
    return [];
  }

  let routePrefix = "";

  if (type === "sizingModule") {
    routePrefix = "/sizingModules/";
  }
  else if (type === "modulePreference") {
    routePrefix = "/admin/modulePreferences/";
  }
  else if (type === "moduleAccess") {
    routePrefix = "/admin/moduleAccess/";
  }

  const routes = [
    {
      text: "SAFETY_VALVES",
      link: `${routePrefix}safetyValves`,
      icon: "ssv2-safety-valve-white",
      isHeaderItem: false
    },
    {
      text: "CONTROL_VALVE",
      link: `${routePrefix}controlValve`,
      icon: "ssv2-control-valve-white",
      isHeaderItem: false
    },
    {
      text: "EASIHEAT",
      link: `${routePrefix}easiHeat`,
      icon: "ssv2-easiHeat-white",
      isHeaderItem: false,
      displayOperatingCompany: false
    },
    {
      text: "FLOWMETER",
      link: `${routePrefix}flowmeter`,
      icon: "ssv2-flowmetering-white",
      isHeaderItem: false
    },
    {
      text: "PRESSURE_REDUCING_VALVE",
      link: `${routePrefix}pressureReducingValve`,
      icon: "ssv2-pressure-reducing-valve-white",
      isHeaderItem: false
    },
    {
      text: "SHELL_AND_TUBE",
      link: `${routePrefix}ShellAndTube`,
      icon: "ssv2-shell-tube-white",
      isHeaderItem: false
    },
    {
      text: "STEAM_GENERATION_ASSESSMENT",
      link: `${routePrefix}steamGenerationAssessment`,
      icon: "ssv2-steam-generation-efficiency-whiter",
      isHeaderItem: false
    },
    {
      text: "CLEAN_STEAM_GENERATOR",
      link: `${routePrefix}cleanSteamGenerator`,
      icon: "ssv2-csg-healthcare-white",
      isHeaderItem: false,
      displayOperatingCompany: false
    },
    {
      text: "CLEAN_STEAM_GENERATOR_FB",
      link: `${routePrefix}cleanSteamGeneratorFB`,
      icon: "ssv2-csg-fb-white",
      isHeaderItem: false,
      displayOperatingCompany: false
    }
  ];

  // Apply the appropriate flag on each property so that the menu system is rendered correctly.
  if (type === "sizingModule") {
    routes.forEach(r => {
      r["isSizingModule"] = true;
      r["isSidebarNav"] = true; // These routes appear on the side bar as well.
    });
  }
  if (type === "modulePreference") {
    routes.forEach(r => {
      r["isModulePreference"] = true;
      r["displayOperatingCompany"] = true;
      r["subText"] = "MODULE_PREFERENCES";
    });
  }
  else if (type === "moduleAccess") {
    routes.forEach(r => {
      r["isModuleAccess"] = true;
      r["displayOperatingCompany"] = true;
      r["subText"] = "MODULE_ACCESS";
    });
  }

  return routes;
}

// Main Navigation Heading
const headingMain = {
  text: 'MAIN_NAVIGATION',
  heading: true,
  isSidebarNav: true,
  isHeaderItem: false
};

// The Home page
const home = {
  text: 'HOME',
  link: '/home',
  icon: 'ssv2-home-white',
  isSidebarNav: true,
  isHeaderItem: false
};

// The heading for sizing modules
const sizingModuleHeaders = {
  text: 'SIZING_MODULES',
  heading: true,
  isSidebarNav: true,
  isHeaderItem: false
}

// The items for the administration section. These are not visible in the side-bar menu or the top header-bar.
const administrationItems = [
  {
    text: 'SYNC_CLIENT',
    link: '/syncClient',
    icon: 'fa fa-exchange',
    isSidebarNav: false,
    isHeaderItem: true
  },
  {
    text: 'ADMINISTRATION_TASKS',
    link: '/admin',
    icon: 'fa fa-wrench',
    isSidebarNav: false,
    isHeaderItem: true,
    displayOperatingCompany: true
  },
  {
    text: 'PROJECTS_AND_JOBS',
    link: '/projectsJobs',
    icon: 'fa fa-file',
    isSidebarNav: false,
    isHeaderItem: true
  },
  {
    text: 'MY_PROFILE',
    link: '/profile',
    icon: 'fa fa-user',
    isSidebarNav: false,
    isHeaderItem: true
  },
  {
    text: 'MY_PREFERENCES',
    link: '/admin/preferences',
    icon: 'fa fa-cog',
    isSidebarNav: false,
    isHeaderItem: true
  },
  {
    text: "CURRENCY_INFORMATION",
    link: "/admin/currency"
  },
  {
    text: "OPERATING_COMPANY_PREFERENCES",
    subText: "HERE_YOU_CAN_SELECT_THE_DEFAULT_UNITS_OF_MEASURE_FOR_YOUR_OPERATING_COMPANY_USERS_MESSAGE",
    link: "/admin/operatingCompanyPreferences",
    displayOperatingCompany: true
  },
  {
    text: "MODULE_ACCESS",
    link: "/admin/moduleAccess",
    displayOperatingCompany: true
  },
  {
    text: "MODULE_PREFERENCES",
    link: "/admin/modulePreferences",
    displayOperatingCompany: true
  },
  {
    text: "PRODUCT_SELECTION",
    link: "/admin/productSelection",
    displayOperatingCompany: true
  }];

export let menu: (
// The items defined in parenthesis defines what the anonymous object's structure looks like
  { text: string, link: string, icon: string, isSidebarNav: boolean, isHeaderItem: boolean } |
  { text: string, heading: boolean, isSidebarNav: boolean, isHeaderItem: boolean } |
  { text: string, link: string, isSidebarNav: boolean, isHeaderItem: boolean } |
  { text: string, subText: string, link: string } |
  { text: string, link: string })[] = [ // And here the value of the array is assigned.
  headingMain, // Main navigation
  home, // Home page
  sizingModuleHeaders
];

// Concatenate any items that are arrays into the menu.
menu = menu.concat(
  administrationItems,
  sizingModuleRoutes("sizingModule"), // Sizing modules
  sizingModuleRoutes("modulePreference"), // Module Preferences
  sizingModuleRoutes("moduleAccess") // Module Access
);
