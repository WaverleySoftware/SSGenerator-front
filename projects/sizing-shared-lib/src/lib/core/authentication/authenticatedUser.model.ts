export class AuthenticatedUser {
  name: string;

  impersonator: string;

  expiryMilliseconds: number;

  isLoggedIn: boolean;

  isImpersonating: boolean;

  picture: string;

  permissions: any = {
    "canAccessSizingSuite": false,
    "canManageModuleAccess": false,
    "canManageModulePreferences": false,
    "canManageOpCoPreferences": false,
    "canManageProductSelection": false,
    "canViewAdminTasks": false,
    "canViewCurrencyInfo": false,
    "canViewMyProfile": false,
    "canViewNotifications": false,
    "canViewProjects&Jobs":false,
    "canViewUserPreferences": false,          
    "canManageEasiheatBillOfMaterials": false,
    "canDownloadOfflineClient": false,
    "canExportExcelDocuments": false,
    "canExportToCRM": false
  };

  clientMode: boolean;

  newClientUser: boolean; 

  syncAccess: boolean;
}
