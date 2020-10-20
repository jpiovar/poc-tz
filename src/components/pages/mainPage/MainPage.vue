<template>
  <div class="container" :id="idComponent">
    <div class="row mb-3">
      <div class="col-md-9">
        <h2>WerkPortal</h2>
      </div>
    </div>
    <div class="row">
      <div class="col-md-9">
        <div class="row">
          <div class="col-md-12">
            <top-menu/>
          </div>
        </div>
        <div class="row">
          <div class="col-md-3">
            <left-menu/>
          </div>
          <div class="col-md-9">
            <sub-page/>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <user-info
          :logoutRef="logout"
          :userName="userProfile.name"
          :userEmail="userProfile.email"
          :userRole="userProfile.role"
        />
        <modal-dialog/>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import {
  USER, MODE, PAGES
} from '../../../stores/constants';
import { MODE_INITIAL, REFERENCE_INITIAL } from '@/stores/mode/constants';
import { UserData } from '../../../stores/user/user.types';
import UserInfo from './components/userInfo/UserInfo.vue';
import ModalDialog from '../../common/modalDialog/ModalDialog.vue';
import SubPage from './components/subPage/SubPage.vue';
import TopMenu from './components/topMenu/TopMenu.vue';
import LeftMenu from './components/leftMenu/LeftMenu.vue';
import { AppMode, Reference } from '@/stores/mode/mode.types';
import { GeneralHelper } from '@/helpers/general.helper';

const UserStore = namespace(USER);
const ModeStore = namespace(MODE);
const PagesStore = namespace(PAGES);

const generalHelper = new GeneralHelper();

@Component({
  components: {
    UserInfo,
    ModalDialog,
    SubPage,
    LeftMenu,
    TopMenu
  },
  props: {}
})
export default class MainPage extends Vue {
  idComponent: string = 'mainPage';

  @UserStore.Action logoutUser!: () => void;

  @UserStore.Getter userData!: UserData;

  @PagesStore.Action destroyUserPagesData!: () => void;

  @ModeStore.Action setMode!:
    ({ reference, status }: { reference: Reference, status: AppMode }) => void;

  logout() {
    // console.log('logout clicked');
    this.logoutUser();
    const status = MODE_INITIAL;
    const reference = REFERENCE_INITIAL;
    this.setMode({ reference, status });
    // this.destroyQuoraData();
    this.destroyUserPagesData();
  }

  get userProfile() {
    // console.log('ok userProfile o');
    const { name, email, role } = this.userData;
    return { name, email, role };
  }
}
</script>

<style lang="scss" scoped>
.container {
  max-width: 1400px;
}
.btn-item {
  float: right;
  i {
      font-size: 18px;
  }
}
textarea:focus {
  border-color: none;
  box-shadow: none;
  -webkit-box-shadow: none;
  outline: -webkit-focus-ring-color auto 5px;
}
</style>
