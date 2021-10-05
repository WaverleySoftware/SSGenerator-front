export class User {

  constructor() {
    this.userId = 0;
    this.username = "";
    this.password = "";
    this.confirmPassword = "";
    this.firstname = "";
    this.lastname = "";
    this.email = "";
    this.memorableWord = "";
    this.company = "";
    this.address = "";
    this.telephone = "";
    this.companyPosition = "";
    this.industryEnum = "";
    this.tradeEnum = "";
    this.hasAgreedDpa = false;
    this.languageId = 0;
    this.languageIsoName = "";
    this.roleId = 0;
    this.operatingCompanyId = 0;
    this.operatingCompanyName = "";
    this.countryId = 0;
    this.countryCode = "";
    this.isDeleted = false;
  }

  userId: number;
  username: string;
  password: string;
  confirmPassword: string;
  firstname: string;
  lastname: string;
  email: string;
  memorableWord: string;
  company: string;
  address: string;
  telephone: string;
  companyPosition: string;
  industryEnum: string;
  tradeEnum: string;
  isAccountLocked: number;
  hasAgreedDpa: boolean;
  languageId: number;
  languageIsoName: string;
  roleId: number;
  operatingCompanyId: number;
  operatingCompanyName: string;
  countryId: number;
  countryCode: string;
  isDeleted: boolean;
}
