import { ActionTree, ActionContext } from 'vuex';
import { RootState } from '../types';
import { PagesStore, Page } from './pages.types';
import { HttpMockService, HttpService } from '../../services/http.service';
import { GeneralHelper } from '../../helpers/general.helper';

const httpService = new HttpService();
const httpMockService = new HttpMockService();
const generalHelper = new GeneralHelper();
const DEFAULT_CURRENTPAGE_INDEX = 0;
const DEFAULT_CURRENTSUBPAGE_INDEX = 0;
const cocoUrl = process.env.VUE_APP_COCO_URL;

const actions: ActionTree<PagesStore, RootState> = {
  storePagesData({ commit }: ActionContext<PagesStore, RootState>) {
    return new Promise((resolve, reject) => {
      // httpService.get('initialPages', { params: {} }).then((response) => {
      httpMockService.getMockDataInitialPagesDelay().then((response) => {
        // const pagesBe: any = response.data; // server response
        const pagesBe: any = response; // mock server response
        commit('storePagesData', { allPages: pagesBe, undefined });
        resolve(true);
      }, (error) => {
        // console.log('error ', error);
      });
    });
  },
  userPagesData({ commit, state }: ActionContext<PagesStore, RootState>, { role, token }: { role: string[], token: string }) {
    return new Promise((resolve, reject) => {
      // httpMockService.getMockDataAllowedRolesDelay().then((response: any) => {
      // httpMockService.getMockDataAllowedRolesArrayDelay().then((response: any) => { // this worked fakeBE ok
      // let response = httpMockService.getMockDataAllowedRoles();
      // const params = { roles: ['admin'] };
      const rolesArrStr = role.join(',');
      const queryString = `roles=${rolesArrStr}`;
      // debugger;
      const headers = { 'Content-Type': 'text/plain;charset=UTF-8', 'ibm-sec-token': token };
      httpService.getDirect(`${cocoUrl}?${queryString}`, { headers }).then((response: any) => {
        // debugger;
        // const res: any = response.allowed_content; // server response
        // const res: any = response; // server response
        const res: any = response.data; // COCO server response
        const { allPages }: Page[]|any = state;
        const userPages: any[] = [];
        let currentPage: any = {};
        for (let i = 0; i < allPages.length; i++) {
          // const current: any = generalHelper.processAllowedContent(allPages[i], res);
          const current: any = generalHelper.processAllowedCOC(allPages[i], res);
          if (current) {
            userPages.push(current);
          }
        }
        if (userPages && userPages.length > 0) {
        // userPages.sort((a, b) => (a.id < b.id ? -1 : 1));
          currentPage = userPages[DEFAULT_CURRENTPAGE_INDEX];
          if (currentPage && currentPage.subpages && currentPage.subpages.length > 0) {
            currentPage.currentSubpage = currentPage.subpages[DEFAULT_CURRENTSUBPAGE_INDEX];
          }
        }
        commit('storePagesData', { allPages, userPages, currentPage });
        resolve(res);
      }, (error: any) => {
        // console.log('error ', error);
        reject(error);
      });
    });
  },
  destroyUserPagesData({ commit }: ActionContext<PagesStore, RootState>) {
    const data: Page[] = [];
    commit('destroyUserPagesData', data);
  },
  setCurrentPage({ commit, state }: ActionContext<PagesStore, RootState>, id: string) {
    const { allPages, userPages }: PagesStore = state;
    let { currentPage }: PagesStore = state;
    currentPage = generalHelper.getCurrentPageBasedId(userPages, id);
    currentPage.currentSubpage = currentPage.subpages[DEFAULT_CURRENTSUBPAGE_INDEX];
    commit('storePagesData', { allPages, userPages, currentPage });
  },
  setCurrentPageSubpage({ commit, state }: ActionContext<PagesStore, RootState>, id: string) {
    const { allPages, userPages, currentPage }: PagesStore = state;
    currentPage.currentSubpage = generalHelper.getCurrentSubpageBasedId(currentPage.subpages, id);
    commit('storePagesData', { allPages, userPages, currentPage });
  }
};

export default actions;
