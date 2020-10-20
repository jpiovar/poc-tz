import { ActionTree, ActionContext } from 'vuex';
import { RootState } from '../types';
import { UserStore, UserData } from './user.types';
import { HttpMockService, HttpService } from '../../services/http.service';

const httpMockService = new HttpMockService();

const httpService = new HttpService();

const loginUrl = process.env.VUE_APP_LOGIN_URL;

const actions: ActionTree<UserStore, RootState> = {
  loginUser({ commit }: ActionContext<UserStore, RootState>, { name, password }: { name: string, password: string }): Promise<boolean> {
    return new Promise((resolve, reject) => {
      // httpMockService.getMockAllowedCredentialsDelay({ name, password }).then((response: any) => {
      // httpService.get('authenticate', { params: { name, password } }).then((response) => {
      // httpService.post('authenticate', { credentials: { name, password } }).then((response) => {
      httpService.postDirect(loginUrl, { name, password }).then((response) => {
        // const rr: any = response;  // mock response
        // const res: any = response.data; // server response
        const res: any = response.data; // server response
        if (res && res.statusCase && res.statusCase === 'ok') {
          commit('loginUser', { id: res.id, name: res.name, email: res.email, role: res.role, accessToken: res.token });
          resolve(res);
        } else {
          resolve(false);
        }
      }, (error) => {
        // console.log('error ', error);
      });
    });
  },
  logoutUser({ commit }: ActionContext<UserStore, RootState>) {
    commit('logoutUser');
  }
};

export default actions;
