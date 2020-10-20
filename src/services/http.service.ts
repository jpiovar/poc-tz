import { Vue } from 'vue-property-decorator';

export class HttpMockService {
  getMockDataAllowedCredentials() {
    return require('../mockData/allowedCredentials.json');
  }

  getMockDataInitialPages() {
    return require('../mockData/initialPages.json');
  }

  getMockDataJournal() {
    return require('../mockData/journalMock.json');
  }

  getMockDataMaterialMvm1() {
    return require('../mockData/materialMvm1Mock.json');
  }

  getMockDataAllowedRoles() {
    return require('../mockData/allowedRoles.json');
  }

  getMockDataAllowedRolesArray() {
    return require('../mockData/allowedRolesArray.json');
  }

  getMockDataMaterialTransfer() {
    return require('../mockData/materialTransferMock.json');
  }

  getMockDataAllowedCredentialsDelay = () => {
    const mockData = this.getMockDataAllowedCredentials();
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockData);
      }, 2000);
    });
  }

  // after transfer node server data to ui
  getMockAllowedCredentials(credentials: { name: string, password: string }) {
    let res = {};
    const { name, password } = credentials;
    const users = this.getMockDataAllowedCredentials();
    const up = users.filter((item: any) => item.name === name && item.password === password);
    if (up && up.length > 0) {
      res = {
        status: 202,
        statusCase: 'ok',
        msg: 'authentication done',
        id: up[0].id,
        name: up[0].name,
        email: up[0].email,
        role: up[0].role
      };
    } else if (up && up.length === 0) {
      res = {
        status: 202,
        statusCase: 'failed',
        msg: 'authentication failed, wrong credentials'
      };
    }
    return res;
  }

  getMockAllowedCredentialsDelay(credentials: any) {
    const mockDataResponse = this.getMockAllowedCredentials(credentials);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockDataResponse);
      }, 500);
    });
  }

  getMockDataInitialPagesDelay = () => {
    const mockData = this.getMockDataInitialPages();
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockData);
      }, 500);
    });
  }

  getMockJournalDelay = () => {
    const mockData = this.getMockDataJournal();
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockData);
      }, 500);
    });
  }

  getMockDataMaterialMvm1Delay = () => {
    const mockData = this.getMockDataMaterialMvm1();
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockData);
      }, 2000);
    });
  }

  getMockDataAllowedRolesDelay = () => {
    const mockData = this.getMockDataAllowedRoles();
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockData);
      }, 2000);
    });
  }

  getMockDataAllowedRolesArrayDelay = () => {
    const mockData = this.getMockDataAllowedRolesArray();
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockData);
      }, 2000);
    });
  }

  getMockDataTransferDelay = () => {
    const mockData = this.getMockDataMaterialTransfer();
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockData);
      }, 500);
    });
  }
}
export class HttpService {
  //   serverURL = 'https://domain.com/api/orders';
  protocol = 'http';

  // hostname = 'localhost';
  // hostname = window.location.hostname.replace('vuejs-', 'vuejsback-');
  hostname = window.location.hostname;

  port = '3030';

  formedURL = `${this.protocol}://${this.hostname}:${this.port}/api/`;

  /** GET request
   * @param endpoint :string, endpoint name
   * @returns Promise<any>
  */
  public get(endpoint: string, params : object): Promise<any> {
    /* eslint-disable */
    // console.log('protocol ',this.protocol, ' hostname ', this.hostname, ' formedURL ', this.formedURL);
    return Vue.axios.get(`${this.formedURL}${endpoint}`, { params });
  }

  /** POST request
   * @param url :string, endpoint name
   * @param body : post body content
   * @returns Promise<any>
  */
  public post(endpoint: string, body: any): Promise<any> {
    // console.log('protocol ',this.protocol, ' hostname ', this.hostname, ' formedURL ', this.formedURL);
    return Vue.axios.post(`${this.formedURL}${endpoint}`, body);
  }

  public getDirect(url: string, headers: any = {}): Promise<any> {
    // debugger;
    return Vue.axios.get(url, headers);
  }

  public putDirect(url: string, data: any, headers: any = {}): Promise<any> {
    return Vue.axios.put(url, data, headers);
  }

  public postDirect(url: string, data: any, headers: any = {}): Promise<any> {
    return Vue.axios.post(url, data, headers);
  }
}
