<template>
<div class="container" :id="idComponent">
  <div class="row align-items-center justify-content-center">
    <div class="col-md-5">
      <LoginForm :loginRef="loginHandle" ref="loginForm"/>
    </div>
  </div>
</div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
// import axios, { AxiosResponse } from 'axios';
import {
  USER,
  PAGES,
  MODE
} from '../../../stores/constants';
import LoginForm from './components/loginForm/LoginForm.vue';
import { UserData } from '@/stores/user/user.types';
import { MODE_LOADING, REFERENCE_INITIAL, MODE_LOADED } from '@/stores/mode/constants';
import { Reference, AppMode } from '@/stores/mode/mode.types';

const UserStore = namespace(USER);
const PagesStore = namespace(PAGES);
const ModeStore = namespace(MODE);

@Component({
  components: {
    LoginForm
  },
  props: {
    msg: {
      required: false,
      type: String
    },
    author: {
      required: true,
      type: String
    }
  }
})
export default class LoginPage extends Vue {
  idComponent: string = 'loginPage';

  msg!: string;

  year: string = '2019';

  @UserStore.Action loginUser!: ({ name, password }: { name: string, password: string }) => Promise<boolean>;

  @PagesStore.Action userPagesData!: ({ role, token }: { role: string, token: string }) => void;

  @ModeStore.Action setMode!:
    ({ reference, status }: { reference: Reference, status: AppMode }) => void;

  loginHandle(userAuth: {name: string, password: string}) {
    // console.log('login clicked');
    if (userAuth && userAuth.name && userAuth.name.trim() && userAuth.password) {
      this.setMode({ reference: REFERENCE_INITIAL, status: MODE_LOADING });
      this.loginUser({ name: userAuth.name.trim(), password: userAuth.password })
        .then((response) => {
          // debugger;
          if (response) {
            const { role, token }: any = response;
            return this.userPagesData({ role, token });
          }
          (this.$refs.loginForm as HTMLFormElement).showAlertBannerAndReset();
          return false;
        }).catch((error) => {
          // console.log('loginHandle error ', error);
        }).finally(() => {
          this.setMode({ reference: REFERENCE_INITIAL, status: MODE_LOADED });
        });
    } else {
      (this.$refs.loginForm as HTMLFormElement).showAlertBannerAndReset();
    }
  }
}

</script>

<style lang="scss" scoped>
</style>
